import {readFileSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {beforeEach,expect,test,vi} from 'vitest';
import {parse} from 'yaml';
import {inspectToolchain} from '../tooling/compatibility.mjs';
import {captureCandidate,verifyCandidate,assertShippedManifest,resumePublication,packageCoordinates,sha256,canonicalPackageArchive} from '../tooling/packaging.mjs';

test('the gzip OS marker cannot change a candidate’s bytes across pack hosts',()=>{
 const payload=Buffer.from('same deterministic tar payload'),mac=gzipSync(payload),linux=Buffer.from(mac);
 mac[9]=19;linux[9]=3;
 const canonical=canonicalPackageArchive(mac);
 expect(canonical).toEqual(canonicalPackageArchive(linux));
 expect(canonical[9]).toBe(255);
 expect(canonical.subarray(10)).toEqual(mac.subarray(10));
 expect(gunzipSync(canonical)).toEqual(payload);
 expect(canonicalPackageArchive(canonical)).toEqual(canonical);
 expect([mac[9],linux[9]]).toEqual([19,3]);
});
test('fails closed for truncated, stamped or decorated package headers',()=>{
 const bytes=gzipSync('package payload');
 expect(()=>canonicalPackageArchive(bytes.subarray(0,10))).toThrow('invalid_package_gzip_header');
 for(const [offset,value] of [[0,0],[1,0],[2,7],[3,2],[4,1],[7,1]]){
  const modified=Buffer.from(bytes);modified[offset]=value;
  expect(()=>canonicalPackageArchive(modified)).toThrow('invalid_package_gzip_header');
 }
});

const rootLock=readFileSync('pnpm-lock.yaml');
const sourceRevision='a'.repeat(40),lockSha256=sha256(rootLock);
const pins={node:'24.20.0',pnpm:'10.34.0',typescript:'6.0.3',angularCompiler:'22.2.4'};
function toolchain(){
 return{node:pins.node,pnpm:pins.pnpm,manifest:JSON.parse(readFileSync('package.json','utf8')),lock:parse(rootLock.toString())};
}

test('accepts the real reviewed compatible toolchain and every locked transitive reference',()=>{
 expect(inspectToolchain(toolchain())).toEqual(pins);
});
test('UIFD-C01 rejects TypeScript 7 before package acceptance without changing the reviewed lock',()=>{
 const input=toolchain(),frozen=structuredClone(input.lock);
 input.manifest.devDependencies.typescript='7.0.2';
 expect(()=>inspectToolchain(input)).toThrow('incompatible_typescript');
 expect(input.lock).toEqual(frozen);
 expect(readFileSync('pnpm-lock.yaml')).toEqual(rootLock);
});
test.each([
 ['node','unsupported_node',x=>{x.node='26.0.0';}],
 ['pnpm','unsupported_pnpm',x=>{x.pnpm='11.0.0';}],
 ['package manager','unsupported_pnpm',x=>{x.manifest.packageManager='pnpm@11.0.0';}],
 ['Angular compiler','incompatible_angular_compiler',x=>{x.manifest.devDependencies['@angular/compiler-cli']='23.0.0';}],
 ['missing lock','invalid_lock',x=>{x.lock=null;}],
 ['unknown format','invalid_lock',x=>{x.lock.lockfileVersion='8.0';}],
 ['missing package table','invalid_lock',x=>{delete x.lock.packages;}],
 ['missing snapshots','invalid_lock',x=>{delete x.lock.snapshots;}],
 ['missing root','invalid_lock',x=>{delete x.lock.importers['.'];}],
 ['peer policy mismatch','incompatible_angular_compiler',x=>{x.lock.packages['@angular/compiler-cli@22.2.4'].peerDependencies.typescript='^7.0.0';}],
 ['missing direct dependency','inconsistent_lock',x=>{delete x.lock.importers['.'].devDependencies.typescript;}],
 ['changed exact pin','inconsistent_lock',x=>{x.lock.importers['.'].devDependencies.typescript.specifier='^6.0.0';}],
 ['broken direct reference','inconsistent_lock',x=>{x.lock.importers['.'].devDependencies.typescript.version='6.0.4';}],
 ['unlocked workspace archive','inconsistent_lock',x=>{x.lock.importers['.'].devDependencies['@vypdev/ha-ui'].version='file:/private/candidate';}],
 ['unreviewed direct addition','inconsistent_lock',x=>{x.lock.importers['.'].devDependencies.unreviewed={specifier:'1.0.0',version:'1.0.0'};}],
 ['missing resolution','inconsistent_lock',x=>{delete x.lock.packages['lit@3.3.3'].resolution;}],
 ['missing integrity','inconsistent_lock',x=>{delete x.lock.packages['lit@3.3.3'].resolution.integrity;}],
 ['missing transitive package','inconsistent_lock',x=>{delete x.lock.packages['lit-html@3.3.3'];}],
 ['missing transitive snapshot','inconsistent_lock',x=>{delete x.lock.snapshots['lit-html@3.3.3'];}],
 ['invalid transitive target','inconsistent_lock',x=>{x.lock.snapshots['lit@3.3.3'].dependencies['lit-html']='3.3.4';}],
 ['invalid optional target','inconsistent_lock',x=>{x.lock.snapshots['lit@3.3.3'].optionalDependencies={unlocked:'1.0.0'};}],
])('UIFD-C02 rejects %s instead of resolving an implicit version',(_label,reason,change)=>{
 const input=toolchain();change(input);
 expect(()=>inspectToolchain(input)).toThrow(reason);
});

const version='0.1.0-next.1';
let archives,record,registry,ports;
beforeEach(()=>{
 archives=new Map(packageCoordinates.map(name=>[name,Buffer.from(name+' reviewed archive')]));
 record=captureCandidate({sourceRevision,lockSha256,artifacts:packageCoordinates.map(coordinate=>({coordinate,version,bytes:archives.get(coordinate)}))});
 registry=new Map();
 ports={
  readArchive:vi.fn(coordinate=>archives.get(coordinate)),
  authorize:vi.fn(async()=>true),
  observe:vi.fn(async coordinate=>registry.get(coordinate)??null),
  publish:vi.fn(async({coordinate,version},bytes)=>{registry.set(coordinate,{version,sha256:sha256(bytes)});}),
  append:vi.fn(async()=>{}),
 };
});
const review=()=>({sourceRevision,lockSha256,gateway:record.id,domus:record.id});
test('capture freezes a complete ordered cohort, including revision, lock and package identity',()=>{
 expect(Object.isFrozen(record.artifacts)).toBe(true);expect(Object.isFrozen(record.artifacts[0])).toBe(true);
 expect(record.artifacts.map(entry=>entry.coordinate)).toEqual(packageCoordinates);
 expect(record.sourceRevision).toBe(sourceRevision);expect(record.lockSha256).toBe(lockSha256);
 expect(verifyCandidate(record,review(),ports.readArchive)).toEqual(archives);
});
test.each([
 ['source','invalid_candidate',x=>{x.sourceRevision='wrong';}],
 ['lock','invalid_candidate',x=>{x.lockSha256='wrong';}],
 ['missing member','invalid_candidate',x=>{x.artifacts.pop();}],
 ['duplicate member','invalid_candidate',x=>{x.artifacts[1]={...x.artifacts[0]};}],
 ['invalid version','invalid_candidate',x=>{x.artifacts[0].version='latest';}],
 ['conflicting version','invalid_candidate',x=>{x.artifacts[4].version='0.2.0';}],
 ['invalid bytes','invalid_candidate',x=>{x.artifacts[0].bytes='not archive bytes';}],
])('rejects %s when capturing a candidate',(_label,reason,change)=>{
 const input={sourceRevision,lockSha256,artifacts:record.artifacts.map(entry=>({...entry,bytes:archives.get(entry.coordinate)}))};
 change(input);expect(()=>captureCandidate(input)).toThrow(reason);
});
test('UIFD-C03 rejects modified bytes and mismatched source, lock or record before promotion',()=>{
 archives.set(packageCoordinates[0],Buffer.from('different'));
 expect(()=>verifyCandidate(record,review(),ports.readArchive)).toThrow('candidate_bytes_changed');
 expect(record.artifacts[0].sha256).toBe(sha256(Buffer.from(packageCoordinates[0]+' reviewed archive')));
 archives.set(packageCoordinates[0],Buffer.alloc(record.artifacts[0].size));
 expect(()=>verifyCandidate(record,review(),ports.readArchive)).toThrow('candidate_bytes_changed');
 expect(()=>verifyCandidate(record,{...review(),sourceRevision:'b'.repeat(40)},ports.readArchive)).toThrow('candidate_identity_changed');
 expect(()=>verifyCandidate(record,{...review(),lockSha256:'c'.repeat(64)},ports.readArchive)).toThrow('candidate_identity_changed');
 expect(()=>verifyCandidate({...record,id:'d'.repeat(64)},review(),ports.readArchive)).toThrow('invalid_candidate');
 expect(()=>verifyCandidate({...record,artifacts:record.artifacts.slice(0,4)},review(),ports.readArchive)).toThrow('invalid_candidate');
 expect(()=>verifyCandidate({...record,artifacts:[{...record.artifacts[0],sha256:'no'},...record.artifacts.slice(1)]},review(),ports.readArchive)).toThrow('invalid_candidate');
 expect(()=>verifyCandidate(record,review(),()=>null)).toThrow('candidate_bytes_changed');
});
test('UIFD-C04 ships exact versions, rejecting local candidate paths in any dependency or override',()=>{
 expect(assertShippedManifest({dependencies:{[packageCoordinates[0]]:version},devDependencies:{other:'workspace:*'},pnpm:{}},record)).toBe(true);
 for(const field of ['dependencies','devDependencies','optionalDependencies','peerDependencies','overrides','resolutions'])
  expect(()=>assertShippedManifest({[field]:{[packageCoordinates[0]]:'file:/private/candidate.tgz'}},record)).toThrow('unshippable_manifest');
 expect(()=>assertShippedManifest({pnpm:{overrides:{['parent@1>'+packageCoordinates[0]]:'link:../private'}}},record)).toThrow('unshippable_manifest');
 expect(()=>assertShippedManifest({overrides:{parent:{[packageCoordinates[1]]:'workspace:*'}}},record)).toThrow('unshippable_manifest');
 expect(()=>assertShippedManifest({dependencies:{[packageCoordinates[0]]:'^0.1.0-next.1'}},record)).toThrow('unshippable_manifest');
 expect(()=>assertShippedManifest({dependencies:{}},record)).toThrow('unshippable_manifest');
 expect(()=>assertShippedManifest({dependencies:null},record)).toThrow('unshippable_manifest');
 expect(()=>assertShippedManifest(null,record)).toThrow('unshippable_manifest');
});
test('release retains verified archives when either application has not accepted them or rights are absent',async()=>{
 await expect(resumePublication(record,{...review(),gateway:null},ports)).resolves.toMatchObject({state:'blocked',reason:'consumer_evidence_missing',published:[]});
 await expect(resumePublication(record,{...review(),domus:null},ports)).resolves.toMatchObject({state:'blocked',reason:'consumer_evidence_missing'});
 expect(ports.authorize).not.toHaveBeenCalled();
 ports.authorize.mockResolvedValue(false);
 await expect(resumePublication(record,review(),ports)).resolves.toMatchObject({state:'blocked',reason:'publisher_rights_unverified'});
 ports.authorize.mockRejectedValueOnce(Error('publisher rights unavailable'));
 await expect(resumePublication(record,review(),ports)).resolves.toMatchObject({state:'blocked',reason:'publisher_rights_unverified'});
 expect(ports.publish).not.toHaveBeenCalled();
});
test('UIFD-C05 observes and persists partial exact outcomes, then resumes missing members only',async()=>{
 ports.publish.mockRejectedValueOnce(new Error('temporary error'));
 const first=await resumePublication(record,review(),ports);
 expect(first).toMatchObject({state:'partial',reason:'publish_unconfirmed',published:[]});
 ports.publish.mockImplementation(async({coordinate,version},bytes)=>{
  if(coordinate===packageCoordinates[2])throw Error('temporary error');
  registry.set(coordinate,{version,sha256:sha256(bytes)});
 });
 const second=await resumePublication(record,review(),ports);
 expect(second).toMatchObject({state:'partial',reason:'publish_unconfirmed',published:record.artifacts.slice(0,2)});
 expect(ports.append.mock.calls.map(([entry])=>entry)).toEqual(record.artifacts.slice(0,2));
 const published=ports.publish.mock.calls.length;
 ports.publish.mockImplementation(async({coordinate,version},bytes)=>{registry.set(coordinate,{version,sha256:sha256(bytes)});});
 const complete=await resumePublication(record,review(),ports);
 expect(complete).toMatchObject({state:'published',published:record.artifacts});
 expect(ports.publish.mock.calls.slice(published).map(([entry])=>entry.coordinate)).toEqual(packageCoordinates.slice(2));
});
test('UIFD-C06 conflicting registry digest or version blocks without an overwrite',async()=>{
 registry.set(packageCoordinates[0],{version,sha256:'0'.repeat(64)});
 await expect(resumePublication(record,review(),ports)).resolves.toMatchObject({state:'blocked',reason:'registry_identity_conflict',published:[]});
 registry.set(packageCoordinates[0],{version:'0.2.0',sha256:record.artifacts[0].sha256});
 await expect(resumePublication(record,review(),ports)).resolves.toMatchObject({state:'blocked',reason:'registry_identity_conflict'});
 expect(ports.publish).not.toHaveBeenCalled();expect(ports.append).not.toHaveBeenCalled();
});
test('uncertain publish is inspected before retry; registry and journal failures preserve earlier observations',async()=>{
 ports.observe.mockRejectedValueOnce(Error('private details'));
 await expect(resumePublication(record,review(),ports)).resolves.toMatchObject({state:'blocked',reason:'registry_unavailable'});
 ports.publish.mockResolvedValueOnce(undefined);
 await expect(resumePublication(record,review(),ports)).resolves.toMatchObject({state:'partial',reason:'publish_unconfirmed'});
 ports.append.mockRejectedValueOnce(Error('private details'));
 await expect(resumePublication(record,review(),ports)).resolves.toMatchObject({state:'partial',reason:'observation_not_recorded',published:[]});
 expect(registry.size).toBe(1);
 const published=ports.publish.mock.calls.length;
 await expect(resumePublication(record,review(),ports)).resolves.toMatchObject({state:'published',published:record.artifacts});
 expect(ports.publish.mock.calls.slice(published).map(([entry])=>entry.coordinate)).toEqual(packageCoordinates.slice(1));
});
test('an unavailable read after a publish cannot cause an overwrite on the next attempt',async()=>{
 ports.observe.mockResolvedValueOnce(null).mockRejectedValueOnce(Error('registry response lost'));
 await expect(resumePublication(record,review(),ports)).resolves.toMatchObject({state:'partial',reason:'publish_unconfirmed',published:[]});
 expect(registry.get(packageCoordinates[0])).toEqual({version,sha256:record.artifacts[0].sha256});
 const published=ports.publish.mock.calls.length;
 await expect(resumePublication(record,review(),ports)).resolves.toMatchObject({state:'published',published:record.artifacts});
 expect(ports.publish.mock.calls.slice(published).map(([entry])=>entry.coordinate)).toEqual(packageCoordinates.slice(1));
});
