import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname,resolve,sep} from 'node:path';
import test from 'node:test';
import {chromium,firefox,webkit,type Page} from 'playwright';
import {exerciseInstalledCard} from '../consumers/cards.ts';
import {exerciseInstalledCheckbox} from '../consumers/checkboxes.ts';
import {exerciseInstalledDialog} from '../consumers/dialogs.ts';
import {exerciseInstalledFeedback} from '../consumers/feedback.ts';
import {exerciseInstalledImplicitSubmit} from '../consumers/implicit-submit.ts';
import {exerciseInstalledLayout} from '../consumers/layouts.ts';
import {exerciseInstalledNavigationOverflow} from '../consumers/navigation-overflow.ts';
import {exerciseInstalledSelect} from '../consumers/selects.ts';
import {exerciseCatalogForms} from './form-lifecycle.ts';
import {waitForCatalogStory} from './lifecycle.ts';

async function visit(page:Page,origin:string,story:string,globals=''){
 await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story'+globals);
 await waitForCatalogStory(page,story);
}

async function localizedPanels(page:Page,origin:string){
 const story='tabs-local-panels--default';
 await visit(page,origin,story,'&globals=locale:es;theme:dark;width:narrow;motion:reduced');
 const frame=page.locator('main.catalog-frame');
 assert.equal(await frame.getAttribute('lang'),'es');
 assert.equal(await frame.getAttribute('data-theme'),'dark');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const overview=page.getByRole('tab',{name:'Resumen',exact:true});
 await page.getByRole('tab',{name:'Tareas',exact:true}).focus();await page.keyboard.press('Home');
 assert.equal(await overview.getAttribute('aria-selected'),'false');
 await page.keyboard.press('Enter');await page.getByRole('tabpanel',{name:'Resumen',exact:true}).waitFor();
 return{spanish:true,dark:true,narrow:true,reducedMotion:true,keyboardAndPanel:true};
}

const subpath='/ha-ui/';
const mime:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
 '.woff2':'font/woff2','.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png'};
async function serveStatic(build:string){
 const server=createServer(async(request,response)=>{
  const path=new URL(request.url??'/','http://127.0.0.1').pathname;
  if(!path.startsWith(subpath)){response.writeHead(404).end();return;}
  const file=resolve(build,path.slice(subpath.length));
  if(!file.startsWith(build+sep)){response.writeHead(404).end();return;}
  try{
   const bytes=await readFile(file);
   response.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream'}).end(bytes);
  }catch{response.writeHead(404).end();}
 });
 await new Promise<void>((done,reject)=>server.once('error',reject).listen(0,'127.0.0.1',done));
 return server;
}

test('the compiled component families retain behavior in Chromium, Firefox and WebKit',{timeout:240_000},async t=>{
 const build=resolve(process.env.STORYBOOK_OUTPUT_DIR??'build/storybook');
 const server=await serveStatic(build);
 try{
  const address=server.address();assert.ok(address&&typeof address==='object');
  const origin='http://127.0.0.1:'+address.port;
  const evidence:({engine:string;version:string}&Record<string,unknown>)[]=[];
  for(const [engine,launcher] of Object.entries({chromium,firefox,webkit}))await t.test(engine,{timeout:90_000},async()=>{
   const browser=await launcher.launch();
   try{
    const page=await browser.newPage({viewport:{width:360,height:760},reducedMotion:'reduce'});
    const errors:string[]=[],external:string[]=[],badAssets:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)badAssets.push(new URL(response.url()).pathname);});
    await page.route('**/*',async route=>{
     const url=new URL(route.request().url());
     if(url.origin===origin)await route.continue();
     else{external.push(url.origin);await route.abort();}
    });
    const panels=await localizedPanels(page,origin);
    const overflow=await exerciseInstalledNavigationOverflow(page);
    const forms=await exerciseCatalogForms(page,origin);
    const implicitSubmit=await exerciseInstalledImplicitSubmit(page);
    const checkbox=await exerciseInstalledCheckbox(page);
    const select=await exerciseInstalledSelect(page);
    await visit(page,origin,'overlays-dialog--default');
    const dialog=await exerciseInstalledDialog(page);
    await visit(page,origin,'surfaces-card--default');
    const card=await exerciseInstalledCard(page);
    await visit(page,origin,'layout-grid--default');
    const layout=await exerciseInstalledLayout(page);
    await visit(page,origin,'feedback-status--default');
    const feedback=await exerciseInstalledFeedback(page);
    assert.deepEqual({errors,external,badAssets},{errors:[],external:[],badAssets:[]});
    evidence.push({engine,version:browser.version(),panels,overflow,forms,implicitSubmit,checkbox,select,dialog,card,layout,feedback,errors,external,badAssets});
   }finally{await browser.close();}
  });
  assert.equal(evidence.length,3,'Every supported browser family must pass');
  const output=resolve(process.env.STORYBOOK_ENGINE_OUTPUT??'test-results');
  await mkdir(output,{recursive:true});
  await writeFile(resolve(output,'browser-matrix.json'),JSON.stringify({platform:process.platform,architecture:process.arch,evidence},null,2)+'\n');
 }finally{await new Promise<void>((done,reject)=>server.close(error=>error?reject(error):done()));}
});
