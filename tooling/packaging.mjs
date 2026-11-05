import {createHash} from 'node:crypto';

/** @typedef {{coordinate:string,version:string,sha256:string,size:number}} CandidateArtifact */
/** @typedef {{coordinate:string,version:string,bytes:Uint8Array}} ArchiveInput */
/** @typedef {{sourceRevision:string,lockSha256:string}} SourceIdentity */
/** @typedef {SourceIdentity & {artifacts:readonly CandidateArtifact[]}} CandidateData */
/** @typedef {CandidateData & {id:string}} CandidateRecord */
/** @typedef {SourceIdentity & {gateway:string|null,domus:string|null}} ReleaseReview */
/** @typedef {(coordinate:string)=>Uint8Array|undefined} ReadArchive */
/** @typedef {{version:string,sha256:string}} RegistryArtifact */
/** @typedef {{readArchive:ReadArchive,authorize:(id:string)=>Promise<boolean>,observe:(coordinate:string,version:string)=>Promise<RegistryArtifact|null>,publish:(entry:CandidateArtifact,bytes:Uint8Array)=>Promise<void>,append:(entry:CandidateArtifact,id:string)=>Promise<void>}} ReleasePorts */

export const packageCoordinates=Object.freeze(['@vypdev/ha-ui','@vypdev/ha-ui-angular','@vypdev/ha-ui-react','@vypdev/ha-ui-svelte','@vypdev/ha-ui-vue']);
const revision=/^[0-9a-f]{40}$/u,digest=/^[0-9a-f]{64}$/u;
const versionPattern=/^\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/u;
const dependencyTables=['dependencies','devDependencies','optionalDependencies','peerDependencies','overrides','resolutions'];
/** @param {Uint8Array|string} bytes */
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
/** @param {unknown} value @returns {value is Record<string,unknown>} */
const isRecord=value=>Boolean(value && typeof value==='object' && !Array.isArray(value));
/** @param {unknown} condition @param {string} reason @returns {asserts condition} */
function invariant(condition,reason){if(!condition)throw new Error(reason);}

/** @param {string} sourceRevision @param {string} lockSha256 @param {readonly CandidateArtifact[]} artifacts */
function candidateData(sourceRevision,lockSha256,artifacts){
 invariant(revision.test(sourceRevision) && digest.test(lockSha256),'invalid_candidate');
 invariant(Array.isArray(artifacts) && artifacts.length===packageCoordinates.length,'invalid_candidate');
 const version=artifacts[0].version;
 invariant(versionPattern.test(version),'invalid_candidate');
 const members=packageCoordinates.map(coordinate=>{
  const matching=artifacts.filter(entry=>entry.coordinate===coordinate);
  invariant(matching.length===1,'invalid_candidate');
  const [entry]=matching;
  invariant(entry.version===version && digest.test(entry.sha256) && Number.isSafeInteger(entry.size) && entry.size>0,'invalid_candidate');
  return Object.freeze({coordinate,version,sha256:entry.sha256,size:entry.size});
 });
 return Object.freeze({sourceRevision,lockSha256,artifacts:Object.freeze(members)});
}

/** @param {CandidateData} data */
const identity=data=>sha256(JSON.stringify(data));

/**
 * Candidate identity includes the locked toolchain and actual bytes, in coordinate order.
 * @param {SourceIdentity & {artifacts:readonly ArchiveInput[]}} input
 */
export function captureCandidate({sourceRevision,lockSha256,artifacts}){
 const data=candidateData(sourceRevision,lockSha256,artifacts.map(({coordinate,version,bytes})=>{
  invariant(bytes instanceof Uint8Array,'invalid_candidate');
  return{coordinate,version,sha256:sha256(bytes),size:bytes.byteLength};
 }));
 return Object.freeze({id:identity(data),...data});
}

/**
 * Check every archive before a caller uses one of them. No version fallback or re-packing.
 * @param {CandidateRecord} record @param {SourceIdentity} source @param {ReadArchive} readArchive
 */
export function verifyCandidate(record,source,readArchive){
 const data=candidateData(record.sourceRevision,record.lockSha256,record.artifacts);
 invariant(record.id===identity(data),'invalid_candidate');
 invariant(data.sourceRevision===source.sourceRevision && data.lockSha256===source.lockSha256,'candidate_identity_changed');
 return new Map(data.artifacts.map(entry=>{
  const bytes=readArchive(entry.coordinate);
  invariant(bytes instanceof Uint8Array && bytes.byteLength===entry.size && sha256(bytes)===entry.sha256,'candidate_bytes_changed');
  return [entry.coordinate,bytes];
 }));
}

/**
 * Temporary paths and version ranges stay in isolated fixtures. Shipped pins are exact.
 * @param {unknown} manifest @param {CandidateRecord} record
 */
export function assertShippedManifest(manifest,record){
 invariant(isRecord(manifest),'unshippable_manifest');
 const versions=new Map(record.artifacts.map(entry=>[entry.coordinate,entry.version]));
 let count=0;
 /** @param {unknown} table */
 function inspect(table){
  invariant(isRecord(table),'unshippable_manifest');
  for(const [key,value] of Object.entries(table)){
   const parts=key.split('>'),name=parts[parts.length-1];
   const coordinate=packageCoordinates.find(item=>name===item||name.startsWith(item+'@'));
   if(coordinate){
    invariant(value===versions.get(coordinate),'unshippable_manifest');count++;
   }else if(isRecord(value))inspect(value);
  }
 }
 for(const field of dependencyTables)if(Object.hasOwn(manifest,field))inspect(manifest[field]);
 if(isRecord(manifest.pnpm) && Object.hasOwn(manifest.pnpm,'overrides'))inspect(manifest.pnpm.overrides);
 invariant(count>0,'unshippable_manifest');
 return true;
}

/** @param {'blocked'|'partial'|'published'} state @param {string|null} reason @param {CandidateArtifact[]} published */
function outcome(state,reason,published){
 return Object.freeze({state,reason,published:Object.freeze([...published])});
}

/**
 * Execute inside the operator's serialized release context. Ports verify rights, observe the
 * exact coordinate/version, and durably append observations idempotently by candidate/member.
 * An uncertain publication is inspected once; retry starts from the registry, never from a
 * cached assumption that a package is absent.
 * @param {CandidateRecord} record @param {ReleaseReview} review @param {ReleasePorts} ports
 */
export async function resumePublication(record,review,ports){
 const bytes=verifyCandidate(record,review,ports.readArchive);
 /** @type {CandidateArtifact[]} */
 const published=[];
 if(review.gateway!==record.id || review.domus!==record.id)return outcome('blocked','consumer_evidence_missing',published);
 let authorized;
 try{authorized=await ports.authorize(record.id);}
 catch{return outcome('blocked','publisher_rights_unverified',published);}
 if(authorized!==true)return outcome('blocked','publisher_rights_unverified',published);
 for(const entry of record.artifacts){
  const {coordinate,version}=entry;
  const observe=()=>ports.observe(coordinate,version);
  let current;
  try{current=await observe();}
  catch{return outcome('blocked','registry_unavailable',published);}
  if(current===null){
   const archive=bytes.get(coordinate);invariant(archive!==undefined,'candidate_bytes_changed');
   try{await ports.publish(entry,archive);}
   catch{/* The server may have accepted the bytes before the connection failed. */}
   try{current=await observe();}
   catch{return outcome('partial','publish_unconfirmed',published);}
   if(current===null)return outcome('partial','publish_unconfirmed',published);
  }
  if(current?.version!==version || current?.sha256!==entry.sha256)return outcome('blocked','registry_identity_conflict',published);
  try{await ports.append(entry,record.id);}
  catch{return outcome('partial','observation_not_recorded',published);}
  published.push(entry);
 }
 return outcome('published',null,published);
}
