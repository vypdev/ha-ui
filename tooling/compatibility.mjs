/** @typedef {{specifier:string,version:string}} DirectEntry */
/** @typedef {{resolution?:{integrity?:string},peerDependencies?:Record<string,string>}} LockedPackage */
/** @typedef {{dependencies?:Record<string,string>,optionalDependencies?:Record<string,string>}} LockedSnapshot */
/** @typedef {{lockfileVersion:string,packages:Record<string,LockedPackage>,snapshots:Record<string,LockedSnapshot>,importers:Record<string,{devDependencies:Record<string,DirectEntry>}>}} FrozenLock */
/** @typedef {{packageManager:string,devDependencies:Record<string,string>}} WorkspaceManifest */

const reviewed=Object.freeze({node:'24.20.0',pnpm:'10.34.0',typescript:'6.0.3',angularCompiler:'22.2.4'});
const angular='@angular/compiler-cli';
const rootCore='@vypdev/ha-ui';

/** @param {unknown} condition @param {string} code @returns {asserts condition} */
function requireEvidence(condition,code){
 if(!condition)throw new Error(code);
}
/** @param {unknown} value */
function object(value){return Boolean(value && typeof value==='object' && !Array.isArray(value));}

/**
 * The checked-in toolchain is a reviewed exact pin, not a range or an implicit latest.
 * @param {{node:string,pnpm:string,manifest:WorkspaceManifest,lock:FrozenLock|null}} input
 */
export function inspectToolchain({node,pnpm,manifest,lock}){
 requireEvidence(node===reviewed.node,'unsupported_node');
 requireEvidence(pnpm===reviewed.pnpm && manifest.packageManager==='pnpm@'+reviewed.pnpm,'unsupported_pnpm');
 const direct=manifest.devDependencies;
 requireEvidence(direct.typescript===reviewed.typescript,'incompatible_typescript');
 requireEvidence(direct[angular]===reviewed.angularCompiler,'incompatible_angular_compiler');
 requireEvidence(lock?.lockfileVersion==='9.0' && object(lock.packages) && object(lock.snapshots) && object(lock.importers?.['.']?.devDependencies),'invalid_lock');
 const locked=lock.importers['.'].devDependencies;
 requireEvidence(lock.packages[angular+'@'+reviewed.angularCompiler]?.peerDependencies?.typescript==='>=6.0 <6.1','incompatible_angular_compiler');
 requireEvidence(Object.keys(locked).length===Object.keys(direct).length,'inconsistent_lock');
 for(const [name,specifier] of Object.entries(direct)){
  const entry=locked[name];
  requireEvidence(entry?.specifier===specifier,'inconsistent_lock');
  const reference=entry.version;
  requireEvidence(name===rootCore?reference==='link:packages/core':Object.hasOwn(lock.snapshots,name+'@'+reference),'inconsistent_lock');
 }
 for(const entry of Object.values(lock.packages))
  requireEvidence(/^sha512-[A-Za-z0-9+/]{86}==$/u.test(entry.resolution?.integrity??''),'inconsistent_lock');
 for(const [snapshot,data] of Object.entries(lock.snapshots)){
  requireEvidence(Object.hasOwn(lock.packages,snapshot.split('(',1)[0]),'inconsistent_lock');
  for(const references of [data.dependencies,data.optionalDependencies])
   for(const [name,reference] of Object.entries(references??{}))
    requireEvidence(Object.hasOwn(lock.snapshots,name+'@'+reference),'inconsistent_lock');
 }
 return reviewed;
}
