import {html,nothing} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {feedbackState,type FeedbackKind,type FeedbackTone} from '@vypdev/ha-ui/feedback-contracts';
import {catalogExample} from './catalog-example.js';
import {catalogSettings} from './catalog-state.js';

export interface FeedbackArgs{kind:FeedbackKind;tone:FeedbackTone;titled:boolean;icon:boolean;action:boolean;narrow:boolean;rtl:boolean;reviewed:boolean;}
const copy={
 en:{info:['Household status','The shopping list is up to date.'],success:['Task saved','The household can now see the task.'],
  warning:['Review the reminder','One household reminder needs attention.'],error:['Unable to save the task','Try saving again.'],
  empty:['No household tasks','Add a task to share it with your household.'],loading:'Loading household tasks…',retry:'Retry',add:'Add task',done:'Request received.',result:'Example action'},
 es:{info:['Estado del hogar','La lista de la compra está al día.'],success:['Tarea guardada','El hogar ya puede ver la tarea.'],
  warning:['Revisa el recordatorio','Un recordatorio del hogar necesita atención.'],error:['No se pudo guardar la tarea','Intenta guardarla de nuevo.'],
  empty:['No hay tareas del hogar','Añade una tarea para compartirla con tu hogar.'],loading:'Cargando las tareas del hogar…',retry:'Reintentar',add:'Añadir tarea',done:'Solicitud recibida.',result:'Acción de ejemplo'},
 ar:{info:['حالة المنزل','قائمة التسوق محدثة.'],success:['تم حفظ المهمة','يمكن لأفراد المنزل رؤية المهمة.'],
  warning:['راجع التذكير','أحد تذكيرات المنزل يحتاج إلى مراجعة.'],error:['تعذر حفظ المهمة','حاول الحفظ مرة أخرى.'],
  empty:['لا توجد مهام منزلية','أضف مهمة لمشاركتها مع أسرتك.'],loading:'جارٍ تحميل مهام المنزل…',retry:'حاول مجددا',add:'أضف مهمة',done:'تم استلام الطلب.',result:'إجراء تجريبي'},
};
export const renderExample:NonNullable<Meta<FeedbackArgs>['render']>=(controls,context)=>catalogExample(controls,(args,setArgs)=>{
 const locale=args.rtl?'ar':catalogSettings(context.globals).locale;
 const text=copy[locale];
 const [title,message]=text[args.kind==='empty'?'empty':args.tone];
 const state=feedbackState(args.kind==='loading'?{kind:'loading',message:text.loading}:
  args.kind==='empty'?{kind:'empty',title,message:args.titled?message:'',icon:args.icon}:
  {kind:'notice',tone:args.tone,title:args.titled?title:'',message,icon:args.icon,narrow:args.narrow});
 return html`<vyp-ha-feedback .state=${state} dir=${args.rtl?'rtl':'ltr'} lang=${locale} style=${args.kind==='empty'?'max-width:480px;height:280px':'max-width:480px'}>
  ${args.action?html`<vyp-ha-button slot="action" id="feedback-command" .state=${buttonState({label:args.kind==='empty'?text.add:text.retry,variant:'plain'})}
   @ha-press-request=${()=>setArgs({...args,reviewed:true})}></vyp-ha-button>`:nothing}
 </vyp-ha-feedback><output aria-label=${text.result} id="feedback-action-result" lang=${locale} dir=${args.rtl?'rtl':'ltr'}>${args.reviewed?text.done:''}</output>`;
});
