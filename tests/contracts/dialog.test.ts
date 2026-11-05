import {expect,test} from 'vitest';
import {DialogInputError,dialogOpen,dialogRequestDetail,dialogState} from '../../packages/core/src/dialog-contracts.js';

test('dialog defaults and explicit display state are immutable and preserve inert text',()=>{
 const defaults=dialogState({title:'Delete task?'});
 expect(defaults).toEqual({title:'Delete task?',subtitle:'',description:'',kind:'standard',width:'medium',closeLabel:'Close',cancelLabel:'Cancel',confirmLabel:'',confirmTone:'primary',confirmDisabled:false,pending:false,pendingLabel:'Working…',guardDismiss:false});
 const raw={...defaults,title:'<img src=x onerror=alert(1)>',subtitle:'Household settings',description:'Kitchen supplies',kind:'alert',width:'small',closeLabel:'Cerrar',cancelLabel:'',confirmLabel:'Eliminar',confirmTone:'danger',confirmDisabled:true,pending:true,pendingLabel:'Guardando…',guardDismiss:true};
 const accepted=dialogState(raw);expect(accepted).toEqual(raw);expect(Object.isFrozen(accepted)).toBe(true);raw.title='Changed';expect(accepted.title).toContain('<img');
 for(const width of ['small','medium','large','full'])expect(dialogState({title:'Task',width}).width).toBe(width);
});

test.each([null,[],42,{},Object.create({title:'Inherited'}),{title:'Task',unexpected:true},{title:'Task',[Symbol('unexpected')]:true},{title:''},{title:' '},{title:'a\n'},{title:'😀'.repeat(257)},{title:'Task',subtitle:null},{title:'Task',description:'x'.repeat(1025)},{title:'Task',kind:'confirmation'},{title:'Task',width:false},{title:'Task',width:'compact'},{title:'Task',closeLabel:''},{title:'Task',confirmTone:'warning'},{title:'Task',confirmDisabled:1},{title:'Task',pending:'true'},{title:'Task',guardDismiss:null}])('rejects an invalid dialog state: %j',raw=>{
 expect(()=>dialogState(raw)).toThrow(DialogInputError);
});

test('dialog requests are closed typed values and open accepts only booleans',()=>{
 for(const action of ['confirm','cancel','close','escape','scrim','native']){
  const detail=dialogRequestDetail({action});expect(detail).toEqual({action});expect(Object.isFrozen(detail)).toBe(true);
 }
 for(const raw of [null,[],1,{},Object.create({action:'cancel'}),{action:'submit'},{action:'cancel',extra:true},{action:'cancel',[Symbol('extra')]:true}])expect(()=>dialogRequestDetail(raw)).toThrow(DialogInputError);
 expect(dialogOpen(true)).toBe(true);expect(dialogOpen(false)).toBe(false);expect(()=>dialogOpen('true')).toThrow(DialogInputError);
});
