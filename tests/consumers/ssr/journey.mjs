import assert from 'node:assert/strict';

export async function exerciseSsrBoundary(browser,origin,framework){
 const response=await fetch(origin);
 assert.equal(response.status,200);
 const markup=await response.text();
 assert.match(markup,new RegExp('<h1>'+framework.replace('.','\\.')+' server shell</h1>','u'));
 assert.match(markup,/<p data-client-fallback(?:="[^"]*")?>Loading household controls…<\/p>/u);
 assert.doesNotMatch(markup,/<vyp-ha-field(?:\s|>)/u);
 assert.doesNotMatch(markup,/<vyp-ha-textarea(?:\s|>)/u);
 assert.match(markup,/data-note-limit="1000"/u,'The actual server executes the pure textarea contract');
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
  const barcode=page.getByRole('textbox',{name:'Barcode number',exact:true});
  await barcode.waitFor();
  assert.equal(await barcode.getAttribute('type'),'text');
  assert.equal(await barcode.getAttribute('inputmode'),'numeric');
  await barcode.fill('00036000291452');
  assert.equal(await barcode.inputValue(),'00036000291452');
  assert.deepEqual(await page.getByRole('form',{name:'Barcode form'}).evaluate(form=>[...new FormData(form)]),[['barcode','00036000291452']]);
  const note=page.getByRole('textbox',{name:'Notes',exact:true}),noteHost=page.locator('vyp-ha-textarea'),noteEvents=page.getByLabel('Multiline requests');
  await note.waitFor();assert.equal(await note.inputValue(),'Initial\n😀');
  await note.fill('First\n😀');await page.waitForFunction(()=>document.querySelector('vyp-ha-textarea').value==='First\n😀');
  await note.press('Enter');await page.waitForFunction(()=>document.querySelector('vyp-ha-textarea').value==='First\n😀\n');
  assert.equal(await note.inputValue(),'First\n😀\n');
  assert.deepEqual(await page.getByRole('form',{name:'Multiline form'}).evaluate(form=>[...new FormData(form)]),[['note','First\n😀\n']]);
  await note.fill('😀'.repeat(1000));assert.equal(await noteHost.evaluate(host=>host.checkValidity()),true);
  await note.fill('');await page.waitForFunction(()=>document.querySelector('vyp-ha-textarea').value==='');
  await note.pressSequentially('First');await note.press('Enter');await note.pressSequentially('Second');
  await page.waitForFunction(()=>document.querySelector('vyp-ha-textarea').value==='First\nSecond');
  await page.getByRole('button',{name:'Reset multiline note'}).click();await page.waitForFunction(()=>document.querySelector('vyp-ha-textarea').value==='Initial\n😀');
  const retainedNote=await noteHost.elementHandle();assert.ok(retainedNote);const noteCount=await noteEvents.textContent();
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
  await noteHost.waitFor({state:'detached'});
  await retainedNote.evaluate(host=>host.formStateRestoreCallback('Retired\nDraft','restore'));
  assert.equal(await noteEvents.textContent(),noteCount);
  await retained.evaluate(node=>node.shadowRoot.querySelector('#tab-tasks').click());
  assert.equal(await count.textContent(),'2');
  await toggle.click();await tasks.click();
  await page.getByRole('tabpanel',{name:'Tasks'}).waitFor();
  assert.equal(await count.textContent(),'3');
  await note.fill('Remounted\n😀');assert.equal(await noteEvents.textContent(),String(Number(noteCount)+1));
  assert.deepEqual({errors,warnings,external},{errors:[],warnings:[],external:[]});
  return {multilineField:true,pureTextareaServerImport:true,multilineNativeForm:true,unicodeCodepoints:true,multilineReset:true,multilineRemountExactlyOnce:true,numericField:true,leadingZeroFormValue:true,serverShell:true,serverFallback:true,browserOnlyRegistration:true,keyboard:true,projectedPanels:true,uniqueRequests:true,unmountAndRemount:true,errors,warnings,external};
 }finally{await page.close();}
}
