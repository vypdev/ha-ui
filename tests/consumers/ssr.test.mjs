import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFile,spawn} from 'node:child_process';
import {once} from 'node:events';
import {cp,mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {createServer} from 'node:net';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import test from 'node:test';
import {setTimeout as delay} from 'node:timers/promises';
import {promisify} from 'node:util';
import {chromium} from 'playwright';
import {parse,stringify} from 'yaml';
import {exerciseSsrBoundary} from './ssr/journey.mjs';

const execute=promisify(execFile);
const digest=(bytes,algorithm='sha256',encoding='hex')=>createHash(algorithm).update(bytes).digest(encoding);
const fixtures=[
 {name:'next',label:'Next.js',adapter:'react',versionKey:'next',server:'node_modules/next/dist/bin/next'},
 {name:'nuxt',label:'Nuxt',adapter:'vue',versionKey:'nuxt',server:'.output/server/index.mjs'},
 {name:'sveltekit',label:'SvelteKit',adapter:'svelte',versionKey:'@sveltejs/kit',server:'build/index.js'},
];

async function freeLocalPort(){
 const probe=createServer();
 const ready=once(probe,'listening');
 probe.listen(0,'127.0.0.1');
 await ready;
 const port=probe.address().port;
 const closed=once(probe,'close');probe.close();await closed;
 return port;
}

async function installFixture(root,scratch,fixture,cohort,env){
 const directory=join(scratch,fixture.name);
 await cp(join(root,'tests/consumers/ssr/fixtures',fixture.name),directory,{recursive:true});
 const metadata=JSON.parse(await readFile(join(directory,'package.json'),'utf8'));
 const locked=await readFile(join(directory,'pnpm-lock.yaml'),'utf8'),lock=parse(locked);
 const coordinates=['@vypdev/ha-ui','@vypdev/ha-ui-'+fixture.adapter];
 const identities=new Map();
 for(const coordinate of coordinates){
  const matches=cohort.filter(candidate=>candidate.coordinate===coordinate);
  assert.equal(matches.length,1,'One packed candidate is required: '+coordinate);
  const [candidate]=matches;
  assert.match(candidate.version,/^\d+\.\d+\.\d+(?:-[\w.]+)?$/u);
  const basename=coordinate.replace('@','').replace('/','-')+'-'+candidate.version+'.tgz';
  const archive='file:../pack-1/'+basename;
  assert.equal(metadata.dependencies[coordinate],archive);
  const bytes=await readFile(join(root,'test-results/packages',basename));
  assert.equal(bytes.length,candidate.bytes);
  assert.equal(digest(bytes),candidate.sha256,'SSR must use the same bytes as the packed consumer check');
  const destination=join(scratch,'pack-1',basename);
  await writeFile(destination,bytes);
  identities.set(archive,{coordinate,integrity:'sha512-'+digest(bytes,'sha512','base64')});
 }
 const seen=new Set();
 for(const [key,pkg] of Object.entries(lock.packages)){
  const file=pkg.resolution.tarball;
  if(!file)continue;
  const identity=identities.get(file);
  assert.ok(identity,'Only exact reviewed local candidate archives are allowed');
  assert.equal(key,identity.coordinate+'@'+file);
  assert.equal(seen.has(file),false);seen.add(file);
  pkg.resolution.integrity=identity.integrity;
 }
 assert.equal(seen.size,coordinates.length);
 const frozen=stringify(lock);await writeFile(join(directory,'pnpm-lock.yaml'),frozen);
 await execute('pnpm',['install','--frozen-lockfile','--prefer-offline','--ignore-scripts','--registry','https://registry.npmjs.org'],{cwd:directory,env,timeout:120_000});
 assert.equal(await readFile(join(directory,'pnpm-lock.yaml'),'utf8'),frozen);
 const pin=metadata.dependencies[fixture.versionKey];
 const installed=JSON.parse(await readFile(join(directory,'node_modules',fixture.versionKey,'package.json'),'utf8'));
 assert.equal(installed.version,pin);
 await execute('pnpm',['build'],{cwd:directory,env,timeout:120_000});
 return{directory,pin,referenceLockSha256:digest(locked),testedLockSha256:digest(frozen)};
}

async function checkServer(browser,directory,fixture,env){
 const port=await freeLocalPort(),origin='http://127.0.0.1:'+port;
 const args=fixture.name==='next'?[fixture.server,'start','--hostname','127.0.0.1','--port',String(port)]:[fixture.server];
 const server=spawn(process.execPath,args,{cwd:directory,env:{...env,HOST:'127.0.0.1',HOSTNAME:'127.0.0.1',PORT:String(port)},stdio:['ignore','ignore','pipe']});
 const stopped=once(server,'close');let stderr='';
 server.stderr.on('data',bytes=>{stderr=(stderr+String(bytes)).slice(-4000);});
 try{
  const deadline=Date.now()+15_000;
  for(;;){
   try{
    const response=await fetch(origin,{signal:AbortSignal.timeout(2000)});await response.body?.cancel();break;
   }catch(error){
    if(server.exitCode!==null||Date.now()>=deadline)throw Error(fixture.label+' failed to start: '+stderr,{cause:error});
    await delay(100);
   }
  }
  return await exerciseSsrBoundary(browser,origin,fixture.label);
 }finally{
  if(server.exitCode===null)server.kill();
  await stopped;
 }
}

test('actual Next.js, Nuxt and SvelteKit production shells mount one installed client adapter',{timeout:360_000},async t=>{
 const root=process.cwd(),scratch=await mkdtemp(join(tmpdir(),'ha-ui-packed-ssr-'));
 const {cohort,reproducible}=JSON.parse(await readFile(resolve('test-results/packed-cohort.json'),'utf8'));
 assert.equal(reproducible,true);assert.equal(cohort.length,5);
 const env={PATH:process.env.PATH,HOME:process.env.HOME,CI:'true',npm_config_userconfig:'/dev/null',
  NEXT_TELEMETRY_DISABLED:'1',NUXT_TELEMETRY_DISABLED:'1',DO_NOT_TRACK:'1'};
 let browser,passed=false;
 try{
  await mkdir(join(scratch,'pack-1'));
  browser=await chromium.launch();
  const evidence=[];
  for(const fixture of fixtures)await t.test(fixture.label,{timeout:300_000},async()=>{
   const {directory,pin,...locks}=await installFixture(root,scratch,fixture,cohort,env);
   const behavior=await checkServer(browser,directory,fixture,env);
   evidence.push({framework:fixture.label,pin,browser:browser.version(),...locks,...behavior});
  });
  assert.equal(evidence.length,fixtures.length,'All three SSR boundaries must pass');
  await writeFile(resolve('test-results/packed-ssr.json'),JSON.stringify({cohort,evidence},null,2)+'\n');
  passed=true;
 }finally{
  await browser?.close();
  if(passed)await rm(scratch,{recursive:true});
  else console.error('Failed SSR fixture retained at '+scratch);
 }
});
