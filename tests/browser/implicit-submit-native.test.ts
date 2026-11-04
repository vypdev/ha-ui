import {afterEach,expect,test} from 'vitest';
import {userEvent} from 'vitest/browser';
import {registerField} from '../../packages/core/src/components/field.js';
afterEach(()=>document.body.replaceChildren());
const cases=[['single',1],['enabled-native',0],['enabled-shared',0],['disabled-native',0],['disabled-shared',0],['fieldset-native',0],['fieldset-shared',0],['readonly-native',0],['readonly-shared',0],['hidden-native',0],['hidden-shared',0],['hidden-type',1],['external-disabled',0]] as const;
test.each(cases)('native and shared no-button Enter preserve the HTML blocker rule: %s',async(mode,expected)=>{
 registerField();const counts=[];
 for(const shared of [false,true]){
  const form=document.createElement('form');form.id='implicit-owner';document.body.append(form);const first=document.createElement(shared?'vyp-ha-field':'input');form.append(first);if(shared)await (first as HTMLElementTagNameMap['vyp-ha-field']).updateComplete;
  let submissions=0;form.addEventListener('submit',event=>{event.preventDefault();submissions++;});
  if(mode!=='single'){
   const other=document.createElement(mode.endsWith('-shared')?'vyp-ha-field':'input');
   if(mode==='hidden-type')(other as HTMLInputElement).type='hidden';
   if(mode.startsWith('disabled')||mode==='external-disabled')(other as HTMLInputElement).disabled=true;
   if(mode.startsWith('readonly'))(other as HTMLInputElement).readOnly=true;
   if(mode.startsWith('hidden-')&&mode!=='hidden-type')other.hidden=true;
   if(mode.startsWith('fieldset')){const fieldset=document.createElement('fieldset');fieldset.disabled=true;fieldset.append(other);form.append(fieldset);}
   else if(mode==='external-disabled'){other.setAttribute('form',form.id);document.body.append(other);}
   else form.append(other);
   if(other.localName==='vyp-ha-field')await (other as HTMLElementTagNameMap['vyp-ha-field']).updateComplete;
  }
  first.focus();await userEvent.keyboard('{Enter}');await new Promise<void>(resolve=>setTimeout(resolve));counts.push(submissions);expect(submissions).toBe(expected);document.body.replaceChildren();
 }
 expect(counts[1]).toBe(counts[0]);
});
test('the native blocker stays singular and follows reconnection and external form ownership without submitting data',async()=>{
 registerField();const first=document.createElement('form'),other=document.createElement('form');other.id='other-owner';const field=document.createElement('vyp-ha-field');field.name='task';field.value='Kitchen';first.append(field);document.body.append(first,other);await field.updateComplete;
 const blocker=field.querySelector<HTMLInputElement>('input[slot=native-blocker]')!;expect(blocker).not.toBeNull();expect(blocker.disabled).toBe(true);expect(blocker.form).toBe(first);expect([...new FormData(first)]).toEqual([['task','Kitchen']]);
 field.setAttribute('form',other.id);expect(blocker.form).toBe(other);expect([...new FormData(first)]).toEqual([]);expect([...new FormData(other)]).toEqual([['task','Kitchen']]);field.removeAttribute('form');expect(blocker.form).toBe(first);
 blocker.remove();field.remove();first.append(field);await field.updateComplete;expect(field.querySelectorAll('input[slot=native-blocker]')).toHaveLength(1);expect(blocker.form).toBe(first);expect([...new FormData(first)]).toEqual([['task','Kitchen']]);
 field.remove();expect(blocker.form).toBeNull();
});
