import {Component,signal,computed} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {Tabs,TextField,Button,Select,Checkbox} from '@vypdev/ha-ui-angular';
import {registerTabs,type NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {FormControl,FormGroup,ReactiveFormsModule} from '@angular/forms';
import {registerField,type FieldValueEvent} from '@vypdev/ha-ui/field';
import {registerButton,type ButtonPressEvent} from '@vypdev/ha-ui/button';
import {registerCheckbox,type CheckboxChangeEvent} from '@vypdev/ha-ui/checkbox';
import {registerSelect,type SelectValueEvent} from '@vypdev/ha-ui/select';
import type {SelectSelection} from '@vypdev/ha-ui/select-contracts';
import {model,fieldModel,actionModel,resetModel,categoryModel,categoryAction,checkModel,checkAction} from './model.js';
registerTabs();registerField();registerButton();registerSelect();registerCheckbox();
@Component({selector:'fixture-app',standalone:true,imports:[Tabs,TextField,Button,Select,Checkbox,ReactiveFormsModule],template:`
  <section [style.--error-color]="dark()?'#f28b82':'#b3261e'" [style.background-color]="dark()?'rgb(20,20,20)':'rgb(255,255,255)'" [style.--divider-color]="dark()?'rgb(66,66,66)':'rgb(224,224,224)'" [style.--primary-text-color]="dark()?'rgb(235,235,235)':'rgb(28,28,28)'" [style.--secondary-text-color]="dark()?'rgb(189,189,189)':'rgb(89,89,89)'" [style.--card-background-color]="dark()?'rgb(20,20,20)':'rgb(255,255,255)'">
    <button (click)="language()">Switch language</button><button (click)="dark.set(!dark())">Toggle theme</button>
    <button (click)="toggleDisabled()">Toggle disabled</button><button (click)="visible.set(!visible())">Toggle component</button>
    <output aria-label="Selection events">{{count()}}</output>
    @if(visible()){<vyp-ha-tabs [state]="state()" (selectionRequest)="select($event)"><button slot="tasks">Add task</button></vyp-ha-tabs>}
    <button (click)="group.controls.task.setValue('Programmatic')">Set field value</button><button (click)="reject.set(!reject())">Reject field changes</button>
    <button (click)="toggleFieldDisabled()">Toggle field disabled</button><button (click)="fieldVisible.set(!fieldVisible())">Toggle field</button>
    <output aria-label="Field model">{{group.controls.task.value}}</output><output aria-label="Field events">{{fieldEvents()}}</output><output aria-label="Saved task">{{saved()}}</output>
    <button (click)="busy.set(!busy())">Toggle button busy</button><button (click)="buttonDisabled.set(!buttonDisabled())">Toggle button disabled</button><button (click)="cancelPress.set(!cancelPress())">Cancel button request</button><button (click)="icons.set(!icons())">Toggle button icons</button><button (click)="buttonVisible.set(!buttonVisible())">Toggle action button</button>
    <output aria-label="Press events">{{presses()}}</output><output aria-label="Accepted presses">{{accepted()}}</output><output aria-label="Submit events">{{submits()}}</output><output aria-label="Button metadata">{{metadata()}}</output>
    <form [formGroup]="group" aria-label="Task form" (ngSubmit)="save($event)">
      @if(fieldVisible()){<vyp-ha-field [state]="fieldState()" name="task" defaultValue="Native baseline" formControlName="task" (valueRequest)="observe($event)" />}
      @if(buttonVisible()){<vyp-ha-button id="bound-submit" [state]="actionState()" type="submit" name="action" value="save" [disabled]="buttonDisabled()" (pressRequest)="press($event)" (press)="accepted.set(accepted()+1)">@if(icons()){<span slot="leading">+</span>}</vyp-ha-button>}<vyp-ha-button [state]="resetState" type="reset" />
    </form>
    <button (click)="categoryMode()">Toggle category mode</button><button (click)="categoryGroup().controls.category.setValue(categoryMultiple()?['1',false]:false)">Set category value</button><button (click)="categoryGroup().controls.category.setValue(categoryMultiple()?[]:null)">Clear category</button><button (click)="categoryReject.set(!categoryReject())">Reject category changes</button><button (click)="categoryDisabledToggle()">Toggle category disabled</button><button (click)="categoryAvailable.set(!categoryAvailable())">Toggle category options</button><button (click)="categoryVisible.set(!categoryVisible())">Toggle category</button><button (click)="categoryDropdown.set(true)">Use category dropdown</button>
    <output aria-label="Category model">{{categoryJson()}}</output><output aria-label="Category events">{{categoryEvents()}}</output><output aria-label="Saved categories">{{categorySaved()}}</output><output aria-label="Category submits">{{categorySubmits()}}</output>
    <form ngNativeValidate [formGroup]="categoryGroup()" aria-label="Category form" (ngSubmit)="categorySave($event)">
     @if(categoryVisible()){<vyp-ha-select id="bound-category" [state]="categoryState()" name="category" [defaultValue]="categoryMultiple()?[1,false]:1" formControlName="category" (valueRequest)="categoryRequest($event)" />}
     <vyp-ha-button [state]="categorySaveState()" type="submit" /><vyp-ha-button [state]="categoryResetState()" type="reset" />
    </form>
    <button (click)="checkGroup.controls.notify.setValue(true);mixed.set(false)">Set checked</button><button (click)="mixed.set(!mixed())">Toggle partial</button><button (click)="checkReject.set(!checkReject())">Reject check changes</button><button (click)="checkDisabledToggle()">Toggle check disabled</button><button (click)="checkPayload.set(!checkPayload())">Toggle check payload</button><button (click)="checkVisible.set(!checkVisible())">Toggle checkbox</button>
    <output aria-label="Checkbox model">{{checkGroup.controls.notify.value}}</output><output aria-label="Checkbox events">{{checkEvents()}}</output><output aria-label="Saved checkbox">{{checkSaved()}}</output><output aria-label="Checkbox submits">{{checkSubmits()}}</output>
    <form ngNativeValidate [formGroup]="checkGroup" aria-label="Checkbox form" (ngSubmit)="checkSave($event)">
      @if(checkVisible()){<vyp-ha-checkbox id="bound-checkbox" [state]="checkState()" name="notify" [value]="checkPayload()?'confirmed':'on'" formControlName="notify" (checkedRequest)="checkRequest($event)" />}
      <vyp-ha-button [state]="checkSaveState()" type="submit" /><vyp-ha-button [state]="checkResetState()" type="reset" />
    </form>
  </section>`})
class Consumer {
  state=signal(model());spanish=signal(false);dark=signal(false);disabled=signal(false);visible=signal(true);count=signal(0);
  group=new FormGroup({task:new FormControl('Kitchen',{nonNullable:true})});fieldVisible=signal(true);reject=signal(false);fieldEvents=signal(0);saved=signal('');fieldState=computed(()=>fieldModel(this.spanish()));
  busy=signal(false);buttonDisabled=signal(false);buttonVisible=signal(true);cancelPress=signal(false);icons=signal(true);presses=signal(0);accepted=signal(0);submits=signal(0);metadata=signal(false);actionState=computed(()=>actionModel(this.spanish(),this.busy()));resetState=resetModel();
  press(event:ButtonPressEvent){this.presses.update(count=>count+1);if(this.cancelPress())event.preventDefault();}
  categoryGroup=signal(new FormGroup({category:new FormControl<SelectSelection>(1,{nonNullable:true})}));categoryMultiple=signal(false);categoryDropdown=signal(false);categoryDisabled=signal(false);categoryVisible=signal(true);categoryReject=signal(false);categoryAvailable=signal(true);categoryEvents=signal(0);categorySaved=signal('');categorySubmits=signal(0);categoryJson=()=>JSON.stringify(this.categoryGroup().controls.category.value);categoryState=computed(()=>categoryModel(this.spanish(),this.categoryMultiple(),this.categoryAvailable(),this.categoryDropdown()));categorySaveState=computed(()=>categoryAction(this.spanish()));categoryResetState=computed(()=>categoryAction(this.spanish(),true));
  checkGroup=new FormGroup({notify:new FormControl(false,{nonNullable:true})});mixed=signal(true);checkDisabled=signal(false);checkVisible=signal(true);checkReject=signal(false);checkPayload=signal(false);checkEvents=signal(0);checkSaved=signal('');checkSubmits=signal(0);checkState=computed(()=>checkModel(this.spanish(),this.mixed()));checkSaveState=computed(()=>checkAction(this.spanish()));checkResetState=computed(()=>checkAction(this.spanish(),true));
  checkDisabledToggle(){this.checkDisabled.set(!this.checkDisabled());const control=this.checkGroup.controls.notify;if(this.checkDisabled())control.disable();else control.enable();}
  checkRequest(event:CheckboxChangeEvent){if(event.detail.reason==='reset'){const host=event.currentTarget as HTMLElement;host.dataset.angularResetModels=JSON.stringify([...JSON.parse(host.dataset.angularResetModels??'[]'),this.checkGroup.controls.notify.value]);}this.checkEvents.update(count=>count+1);if(this.checkReject())event.preventDefault();else this.mixed.set(false);}
  checkSave(event:Event){event.preventDefault();this.checkSaved.set(JSON.stringify([...new FormData(event.currentTarget as HTMLFormElement)]));this.checkSubmits.update(count=>count+1);}
  categoryMode(){this.categoryMultiple.set(!this.categoryMultiple());this.categoryGroup.set(new FormGroup({category:new FormControl<SelectSelection>(this.categoryMultiple()?[1,false]:1,{nonNullable:true})}));this.categoryDisabled.set(false);}
  categoryDisabledToggle(){this.categoryDisabled.set(!this.categoryDisabled());const control=this.categoryGroup().controls.category;if(this.categoryDisabled())control.disable();else control.enable();}
  categoryRequest(event:SelectValueEvent){this.categoryEvents.update(count=>count+1);if(this.categoryReject())event.preventDefault();}
  categorySave(event:Event){event.preventDefault();this.categorySaved.set(JSON.stringify([...new FormData(event.currentTarget as HTMLFormElement)]));this.categorySubmits.update(count=>count+1);}
  observe(event:FieldValueEvent){this.fieldEvents.update(count=>count+1);if(this.reject())event.preventDefault();}
  toggleFieldDisabled(){const control=this.group.controls.task;if(control.disabled)control.enable();else control.disable();}
  save(event:Event){event.preventDefault();const form=event.currentTarget as HTMLFormElement;if(form.reportValidity()){this.saved.set(JSON.stringify([...new FormData(form,(event as SubmitEvent).submitter)]));this.submits.update(count=>count+1);this.metadata.set((event as SubmitEvent).submitter===form.querySelector('vyp-ha-button')!.submitter);}}
  select(event:NavigationSelectionEvent){event.preventDefault();this.state.set(model(this.spanish(),event.detail.id,this.disabled()));this.count.update(value=>value+1);}
  language(){this.spanish.set(!this.spanish());this.state.set(model(this.spanish(),this.state().selected!,this.disabled()));}
  toggleDisabled(){this.disabled.set(!this.disabled());this.state.set(model(this.spanish(),'overview',this.disabled()));}
}
void bootstrapApplication(Consumer);
