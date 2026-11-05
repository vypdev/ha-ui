import {sha256,resumePublication} from './packaging.mjs';

const registry='https://registry.npmjs.org';

/** @typedef {import('./packaging.mjs').CandidateRecord} CandidateRecord */

/**
 * Read the immutable version and hash its downloaded tarball. A registry outage or
 * invalid response cannot be mistaken for an unpublished version.
 * @param {string} coordinate
 * @param {string} version
 * @param {typeof fetch} request
 */
export async function observeNpmVersion(coordinate,version,request=fetch){
 /** @type {RequestInit} */
 const options={redirect:'error',signal:AbortSignal.timeout(30_000)};
 const metadata=await request(`${registry}/${encodeURIComponent(coordinate)}/${version}`,options);
 if(metadata.status===404)return null;
 if(!metadata.ok)throw new Error('npm_metadata_unavailable');
 const published=await metadata.json();
 if(published.name!==coordinate||published.version!==version)throw new Error('npm_version_identity_mismatch');
 const tarball=new URL(published.dist.tarball);
 if(tarball.origin!==registry||tarball.username||tarball.password)throw new Error('npm_tarball_origin_mismatch');
 const response=await request(tarball,options);
 if(!response.ok)throw new Error('npm_tarball_unavailable');
 return {version,sha256:sha256(new Uint8Array(await response.arrayBuffer()))};
}

/**
 * The caller supplies the approved GitHub Actions context and authenticated npm command.
 * npm itself authorizes each write through the configured trusted publisher.
 * @param {{record:CandidateRecord,sourceRevision:string,lockSha256:string,tag:string,oidc:boolean,
 *  archives:Map<string,Uint8Array>,observe:import('./packaging.mjs').ReleasePorts['observe'],
 *  publish:import('./packaging.mjs').ReleasePorts['publish'],append:import('./packaging.mjs').ReleasePorts['append']}} input
 */
export async function publishNpmPrerelease({record,sourceRevision,lockSha256,tag,oidc,archives,observe,publish,append}){
 if(!/^v\d+\.\d+\.\d+-next\.\d+$/u.test(tag)||record.artifacts[0]?.version!==tag.slice(1))
  throw new Error('npm_release_tag_mismatch');
 return resumePublication(record,{sourceRevision,lockSha256,channel:'next',gateway:null,domus:null},{
  readArchive:coordinate=>archives.get(coordinate),
  authorize:async()=>oidc,
  observe,publish,append,
 });
}
