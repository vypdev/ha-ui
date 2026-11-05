import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

/** @typedef {{format:'ustar',sha256:string,entries:Record<string,[number,number]>}} RasterIndex */
/** @typedef {{path:string,sha256:string}} RasterReceipt */
const block=512;
const signature=Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
const filename=/^(?:[a-z0-9]+(?:[-_][a-z0-9]+)*\/)*[a-z0-9]+(?:[-_][a-z0-9]+)*\.png$/u;
/** @param {Buffer} bytes */
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
/** @param {number} value @param {number} width */
const octal=(value,width)=>value.toString(8).padStart(width-1,'0')+'\0';

/** @param {string} name @param {number} size */
function header(name,size){
 const bytes=Buffer.alloc(block);
 bytes.write(name,0,100,'ascii');
 bytes.write(octal(0o644,8),100,'ascii');
 bytes.write(octal(0,8),108,'ascii');bytes.write(octal(0,8),116,'ascii');
 bytes.write(octal(size,12),124,'ascii');bytes.write(octal(0,12),136,'ascii');
 bytes.fill(32,148,156);bytes.write('0',156,'ascii');
 bytes.write('ustar\0'+'00',257,'ascii');
 bytes.write(octal(bytes.reduce((sum,byte)=>sum+byte,0),7)+' ',148,'ascii');
 return bytes;
}

/** Bundle unchanged PNGs into a deterministic, ordinary ustar archive and a byte index.
 * @param {Record<string,Buffer>} images
 * @returns {{archive:Buffer,index:RasterIndex}}
 */
export function packRasterSet(images){
 /** @type {RasterIndex['entries']} */
 const entries=Object.create(null);
 /** @type {Buffer[]} */
 const parts=[];let cursor=0;
 for(const name of Object.keys(images).sort()){
  const bytes=images[name];
  if(!filename.test(name)||name.length>100||!Buffer.isBuffer(bytes)||!bytes.subarray(0,8).equals(signature))throw new TypeError('Invalid reference PNG: '+name);
  entries[name]=[cursor+block,bytes.length];
  const padding=(block-bytes.length%block)%block;
  parts.push(header(name,bytes.length),bytes,Buffer.alloc(padding));cursor+=block+bytes.length+padding;
 }
 const archive=Buffer.concat([...parts,Buffer.alloc(block*2)]);
 return {archive,index:{format:'ustar',sha256:sha256(archive),entries}};
}

/** Return the original PNG only when both the archive and the capture receipt agree.
 * @param {string} root
 * @returns {(receipt:RasterReceipt)=>Promise<Buffer>}
 */
export function originalRasterReader(root){
 /** @type {Map<string,Promise<{archive:Buffer,entries:RasterIndex['entries']}>>} */
 const bundles=new Map();
 /** @param {string} family */
 const load=async family=>{
  const dir=join(root,family);
  const [archive,json]=await Promise.all([readFile(join(dir,'originals.tar')),readFile(join(dir,'index.json'),'utf8')]);
  const index=/** @type {RasterIndex} */ (JSON.parse(json));
  if(index.format!=='ustar'||sha256(archive)!==index.sha256)throw new Error('Invalid original raster archive: '+family);
  return {archive,entries:index.entries};
 };
 return async ({path,sha256:expected})=>{
  const source=/^tests\/storybook\/reference\/(ha-[a-z]+(?:-[a-z]+)*)\/(.+)$/u.exec(path);
  if(!source||!filename.test(source[2]))throw new TypeError('Invalid original raster path: '+path);
  const [,family,name]=source;
  let bundle=bundles.get(family);
  if(!bundle){bundle=load(family);bundles.set(family,bundle);}
  const {archive,entries}=await bundle;
  if(!Object.hasOwn(entries,name))throw new Error('Missing original raster: '+path);
  const [offset,size]=entries[name],bytes=archive.subarray(offset,offset+size);
  if(sha256(bytes)!==expected)throw new Error('Original raster digest changed: '+path);
  return Buffer.from(bytes);
 };
}
