import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,readdir,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'vitest';
import {originalRasterReader,packRasterSet} from '../../tooling/raster-archive.mjs';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB94AAAAASUVORK5CYII=','base64');
const logical=(name,sha256=digest(png))=>({path:'tests/storybook/reference/ha-proof/'+name,sha256});

async function temporarySet(run){
 const root=await mkdtemp(join(tmpdir(),'ha-ui-raster-test-')),family=join(root,'ha-proof');
 try{
  await mkdir(family);
  const {archive,index}=packRasterSet({'light/sample.png':png,'dark/sample.png':png});
  await writeFile(join(family,'originals.tar'),archive);
  await writeFile(join(family,'index.json'),JSON.stringify(index));
  await run({root,family,archive,index});
 }finally{await rm(root,{recursive:true,force:true});}
}

test('packs original PNG bytes deterministically into standard ustar entries',()=>{
 const first=packRasterSet({'light/sample.png':png,'dark/sample.png':png});
 const second=packRasterSet({'dark/sample.png':png,'light/sample.png':png});
 assert.deepEqual(first,second);
 assert.equal(first.archive.toString('ascii',257,263),'ustar\0');
 assert.equal(first.archive.toString('ascii',0,15),'dark/sample.png');
 assert.equal(first.index.sha256,digest(first.archive));
 assert.deepEqual(first.index.entries['dark/sample.png'],[512,png.length]);
 assert.deepEqual(first.index.entries['light/sample.png'],[1536,png.length]);
 assert.deepEqual(first.archive.subarray(512,512+png.length),png);
 assert.deepEqual(first.archive.subarray(-1024),Buffer.alloc(1024));
});

test('rejects unsafe entry paths, impossible tar names and non-PNG inputs',()=>{
 for(const [name,bytes] of [['../sample.png',png],['a'.repeat(101)+'.png',png],['sample.png','data'],['sample.png',Buffer.from('other')]]){
  assert.throws(()=>packRasterSet({[name]:bytes}),/Invalid reference PNG/u);
 }
});

test('a caller receives a defensive copy from a cached verified archive',()=>temporarySet(async({root,family})=>{
 const read=originalRasterReader(root),sample=logical('light/sample.png'),first=await read(sample);
 first.fill(0);
 await rm(join(family,'originals.tar'));
 assert.deepEqual(await read(sample),png);
 assert.deepEqual(await read(logical('dark/sample.png')),png);
}));

test('rejects an unsafe logical name, a missing entry or a mismatch with the original receipt',()=>temporarySet(async({root})=>{
 const read=originalRasterReader(root);
 await assert.rejects(read({...logical('dark/sample.png'),path:'/tmp/sample.png'}),/Invalid original raster path/u);
 await assert.rejects(read(logical('../sample.png')),/Invalid original raster path/u);
 await assert.rejects(read(logical('dark/missing.png')),/Missing original raster/u);
 await assert.rejects(read(logical('dark/sample.png','0'.repeat(64))),/Original raster digest changed/u);
}));

test('rejects an archive with changed bytes or an unsupported archive format',()=>temporarySet(async({root,family,archive,index})=>{
 await writeFile(join(family,'originals.tar'),Buffer.concat([archive,Buffer.from('changed')]));
 await assert.rejects(originalRasterReader(root)(logical('light/sample.png')),/Invalid original raster archive/u);
 await writeFile(join(family,'originals.tar'),archive);
 await writeFile(join(family,'index.json'),JSON.stringify({...index,format:'other'}));
 await assert.rejects(originalRasterReader(root)(logical('light/sample.png')),/Invalid original raster archive/u);
}));

test('every recorded original remains reachable, byte-identical and covered by the source inventory',async()=>{
 const root='tests/storybook/reference',read=originalRasterReader(root);
 const paths=new Map();
 function collect(value){
  if(Array.isArray(value)){value.forEach(collect);return;}
  if(value===null||typeof value!=='object')return;
  if(typeof value.path==='string'&&value.path.startsWith(root+'/')){
   assert.match(value.sha256,/^[a-f0-9]{64}$/u);
   if(paths.has(value.path))assert.equal(paths.get(value.path),value.sha256);
   paths.set(value.path,value.sha256);
  }
  Object.values(value).forEach(collect);
 }
 for(const name of (await readdir('docs/evidence')).filter(name=>name.endsWith('.json'))){
  collect(JSON.parse(await readFile(join('docs/evidence',name),'utf8')));
 }
 const indexed=[];
 for(const family of await readdir(root,{withFileTypes:true})){
  if(!family.isDirectory())continue;
  const dir=join(root,family.name);
  assert.deepEqual((await readdir(dir)).sort(),['index.json','originals.tar']);
  const index=JSON.parse(await readFile(join(dir,'index.json'),'utf8'));
  indexed.push(...Object.keys(index.entries).map(name=>root+'/'+family.name+'/'+name));
 }
 assert.ok(paths.size>0);
 assert.deepEqual(indexed.sort(),[...paths.keys()].sort());
 await Promise.all([...paths].map(async([path,sha256])=>{
  const bytes=await read({path,sha256});
  assert.equal(bytes.toString('ascii',12,16),'IHDR');
 }));
});
