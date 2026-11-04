type AssociatedControl=HTMLElement&{readonly form:HTMLFormElement|null};
/** Native default action for form-associated shadow controls, with no other renderer dependency. */
export function implicitSubmit(form:HTMLFormElement):void{
 const root=Node.prototype.getRootNode.call(form) as Document|ShadowRoot;
 const controls=[...root.querySelectorAll<HTMLInputElement|HTMLButtonElement|AssociatedControl>('input,button,vyp-ha-field')].filter(control=>control.form===form);
 const submitter=controls.find(control=>(control instanceof HTMLButtonElement||control instanceof HTMLInputElement)&&(control.type==='submit'||control.type==='image')) as HTMLButtonElement|HTMLInputElement|undefined;
 if(submitter!==undefined){if(!submitter.disabled)submitter.click();return;}
 const blockers=controls.filter(control=>control.localName==='vyp-ha-field'||(control instanceof HTMLInputElement&&['text','search','url','tel','email','password','date','month','week','time','datetime-local','number'].includes(control.type)));
 if(blockers.length<=1)HTMLFormElement.prototype.requestSubmit.call(form);
}
