import {render,type TemplateResult} from 'lit';
/** Local example state belongs to the fixture, outside the production component. */
export function catalogExample<Model>(initial:Model,view:(model:Model,update:(next:Model)=>void)=>TemplateResult):HTMLElement {
  const container=document.createElement('div');
  const update=(model:Model):void=>{render(view(model,update),container);};
  update(initial);
  return container;
}
