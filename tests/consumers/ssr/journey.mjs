import assert from 'node:assert/strict';

export async function exerciseSsrBoundary(browser,origin,framework){
 const response=await fetch(origin);
 assert.equal(response.status,200);
 const markup=await response.text();
 assert.match(markup,new RegExp('<h1>'+framework.replace('.','\\.')+' server shell</h1>','u'));
 assert.match(markup,/<p data-client-fallback(?:="[^"]*")?>Loading household controls…<\/p>/u);
 assert.doesNotMatch(markup,/<vyp-ha-tabs(?:\s|>)/u,'The server shell must not render the browser control');
 const page=await browser.newPage({viewport:{width:360,height:640}});
 const errors=[],warnings=[],external=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());else if(message.type()==='warning')warnings.push(message.text());});
 await page.route('**/*',async route=>{
  if(new URL(route.request().url()).origin===origin)await route.continue();
  else{external.push(new URL(route.request().url()).origin);await route.abort();}
 });
 try{
  await page.goto(origin);
  const root=page.locator('vyp-ha-tabs'),count=page.getByLabel('Selection requests');
  const overview=page.getByRole('tab',{name:'Overview',exact:true}),tasks=page.getByRole('tab',{name:'Tasks',exact:true});
  await overview.waitFor();
  await page.getByRole('tabpanel',{name:'Overview'}).waitFor();
  assert.equal(await root.locator('[slot=overview]').innerText(),'Household overview');
  assert.equal(await count.textContent(),'0');
  assert.equal(await page.locator('[data-client-fallback]').count(),0);
  assert.equal(await root.evaluate(node=>Boolean(customElements.get(node.localName) && node.shadowRoot)),true);
  await overview.focus();await page.keyboard.press('End');
  assert.equal(await tasks.getAttribute('aria-selected'),'false');
  await page.keyboard.press('Enter');
  await page.getByRole('tabpanel',{name:'Tasks'}).waitFor();
  assert.equal(await root.locator('[slot=tasks]').innerText(),'Household tasks');
  assert.equal(await count.textContent(),'1');
  await overview.click();
  await page.getByRole('tabpanel',{name:'Overview'}).waitFor();
  assert.equal(await count.textContent(),'2');
  const retained=await root.elementHandle();
  assert.ok(retained);
  const toggle=page.getByRole('button',{name:'Toggle controls'});
  await toggle.click();await root.waitFor({state:'detached'});
  await retained.evaluate(node=>node.shadowRoot.querySelector('#tab-tasks').click());
  assert.equal(await count.textContent(),'2');
  await toggle.click();await tasks.click();
  await page.getByRole('tabpanel',{name:'Tasks'}).waitFor();
  assert.equal(await count.textContent(),'3');
  assert.deepEqual({errors,warnings,external},{errors:[],warnings:[],external:[]});
  return {serverShell:true,serverFallback:true,browserOnlyRegistration:true,keyboard:true,projectedPanels:true,uniqueRequests:true,unmountAndRemount:true,errors,warnings,external};
 }finally{await page.close();}
}
