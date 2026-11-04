export interface CatalogSettings {readonly locale:'en'|'es';readonly theme:'light'|'dark';readonly width:360|960;readonly motion:'system'|'reduced';}
/** Storybook owns these temporary display settings; no component or application storage is used. */
export function catalogSettings(raw:unknown):CatalogSettings {
  const source=typeof raw==='object'&&raw!==null&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
  return Object.freeze({locale:typeof source.locale==='string'&&/^es(?:-|$)/iu.test(source.locale)?'es':'en',theme:source.theme==='dark'?'dark':'light',width:source.width==='narrow'?360:960,motion:source.motion==='reduced'?'reduced':'system'});
}
export const catalogCopy=Object.freeze({
  en:Object.freeze({household:'Household',overview:'Overview',tasks:'Tasks',inventory:'Inventory',family:'Family',settings:'Settings',sections:'Household sections',panels:'Task views',navigationHelp:'Choose a household section.',disabled:'These example sections are unavailable.',empty:'No sections are available.',panelOverview:'Review household activity.',panelTasks:'Plan the next household task.',fieldLabel:'Task name',description:'Choose a short name for this household task.',placeholder:'Clean the kitchen',required:'Enter a task name.',error:'Review the task name before continuing.',submit:'Submit example',reset:'Reset draft',draft:'Your draft stays in this example.',submitted:'Example submitted',long:'household section'}),
  es:Object.freeze({household:'Hogar',overview:'Resumen',tasks:'Tareas',inventory:'Inventario',family:'Familia',settings:'Ajustes',sections:'Secciones del hogar',panels:'Vistas de tareas',navigationHelp:'Elige una sección del hogar.',disabled:'Estas secciones del ejemplo no están disponibles.',empty:'No hay secciones disponibles.',panelOverview:'Revisa la actividad del hogar.',panelTasks:'Planifica la siguiente tarea del hogar.',fieldLabel:'Nombre de la tarea',description:'Elige un nombre breve para esta tarea del hogar.',placeholder:'Limpiar la cocina',required:'Introduce un nombre para la tarea.',error:'Revisa el nombre de la tarea antes de continuar.',submit:'Enviar ejemplo',reset:'Restablecer borrador',draft:'Tu borrador permanece en este ejemplo.',submitted:'Ejemplo enviado',long:'sección del hogar'}),
});
// HA-compatible fixture palettes; all component colors are still inherited through public tokens.
export const catalogPalettes=Object.freeze({
  light:Object.freeze({'--primary-text-color':'#1c1c1c','--secondary-text-color':'#595959','--card-background-color':'#ffffff','--divider-color':'#e0e0e0','--primary-color':'#0075b5','--error-color':'#b3261e'}),
  dark:Object.freeze({'--primary-text-color':'#ebebeb','--secondary-text-color':'#bdbdbd','--card-background-color':'#141414','--divider-color':'#424242','--primary-color':'#03a9f4','--error-color':'#f28b82'}),
});
