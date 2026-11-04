import {Component,signal,computed} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {Tabs,TextField} from '@vypdev/ha-ui-angular';
import {registerTabs,type NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {FormControl,FormGroup,ReactiveFormsModule} from '@angular/forms';
import {registerField,type FieldValueEvent} from '@vypdev/ha-ui/field';
import {model,fieldModel} from './model.js';
registerTabs();registerField();
@Component({selector:'fixture-app',standalone:true,imports:[Tabs,TextField,ReactiveFormsModule],template:`
  <section [style.--error-color]="dark()?'#f28b82':'#b3261e'" [style.background-color]="dark()?'rgb(20,20,20)':'rgb(255,255,255)'" [style.--divider-color]="dark()?'rgb(66,66,66)':'rgb(224,224,224)'" [style.--primary-text-color]="dark()?'rgb(235,235,235)':'rgb(28,28,28)'" [style.--secondary-text-color]="dark()?'rgb(189,189,189)':'rgb(89,89,89)'" [style.--card-background-color]="dark()?'rgb(20,20,20)':'rgb(255,255,255)'">
    <button (click)="language()">Switch language</button><button (click)="dark.set(!dark())">Toggle theme</button>
    <button (click)="toggleDisabled()">Toggle disabled</button><button (click)="visible.set(!visible())">Toggle component</button>
    <output aria-label="Selection events">{{count()}}</output>
    @if(visible()){<vyp-ha-tabs [state]="state()" (selectionRequest)="select($event)"><button slot="tasks">Add task</button></vyp-ha-tabs>}
    <button (click)="group.controls.task.setValue('Programmatic')">Set field value</button><button (click)="reject.set(!reject())">Reject field changes</button>
    <button (click)="toggleFieldDisabled()">Toggle field disabled</button><button (click)="fieldVisible.set(!fieldVisible())">Toggle field</button>
    <output aria-label="Field model">{{group.controls.task.value}}</output><output aria-label="Field events">{{fieldEvents()}}</output><output aria-label="Saved task">{{saved()}}</output>
    <form [formGroup]="group" aria-label="Task form" (ngSubmit)="save($event)">
      @if(fieldVisible()){<vyp-ha-field [state]="fieldState()" name="task" defaultValue="Native baseline" formControlName="task" (valueRequest)="observe($event)" />}
      <button type="submit" name="action" value="save">Save task</button><button type="reset">Reset task</button>
    </form>
  </section>`})
class Consumer {
  state=signal(model());spanish=signal(false);dark=signal(false);disabled=signal(false);visible=signal(true);count=signal(0);
  group=new FormGroup({task:new FormControl('Kitchen',{nonNullable:true})});fieldVisible=signal(true);reject=signal(false);fieldEvents=signal(0);saved=signal('');fieldState=computed(()=>fieldModel(this.spanish()));
  observe(event:FieldValueEvent){this.fieldEvents.update(count=>count+1);if(this.reject())event.preventDefault();}
  toggleFieldDisabled(){const control=this.group.controls.task;if(control.disabled)control.enable();else control.disable();}
  save(event:Event){event.preventDefault();const form=event.currentTarget as HTMLFormElement;if(form.reportValidity())this.saved.set(JSON.stringify([...new FormData(form,(event as SubmitEvent).submitter)]));}
  select(event:NavigationSelectionEvent){event.preventDefault();this.state.set(model(this.spanish(),event.detail.id,this.disabled()));this.count.update(value=>value+1);}
  language(){this.spanish.set(!this.spanish());this.state.set(model(this.spanish(),this.state().selected!,this.disabled()));}
  toggleDisabled(){this.disabled.set(!this.disabled());this.state.set(model(this.spanish(),'overview',this.disabled()));}
}
void bootstrapApplication(Consumer);
