import {Component,computed,signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {FormControl,FormGroup,ReactiveFormsModule} from '@angular/forms';
import {TextArea} from '@vypdev/ha-ui-angular';
import {registerTextArea,type TextAreaValueEvent} from '@vypdev/ha-ui/textarea';
import {noteState,noteTheme,initialNote} from './textarea-model.js';
registerTextArea();
@Component({selector:'main',standalone:true,imports:[TextArea,ReactiveFormsModule],template:`
  <section [style]="theme()">
    <button (click)="reject.set(!reject())">Reject note changes</button><button (click)="toggleDisabled()">Toggle note disabled</button>
    <button (click)="readOnly.set(!readOnly())">Toggle note readonly</button><button (click)="visible.set(!visible())">Toggle note</button>
    <button (click)="group.controls.note.setValue('Programmatic\\n😀')">Set note value</button><button (click)="spanish.set(!spanish())">Switch note language</button><button (click)="dark.set(!dark())">Toggle note theme</button>
    <output aria-label="Note model">{{group.controls.note.value}}</output><output aria-label="Note events">{{events()}}</output><output aria-label="Saved note">{{saved()}}</output>
    <form aria-label="Note form" [formGroup]="group" (ngSubmit)="save($event)" ngNativeValidate><fieldset>
      @if (visible()) {<vyp-ha-textarea [state]="state()" formControlName="note" name="note" [defaultValue]="initial" (valueRequest)="observe($event)" />}
    </fieldset><button type="submit">Save note</button><button type="reset">Reset note</button></form>
  </section>
`})
class Consumer {
  initial=initialNote;group=new FormGroup({note:new FormControl(initialNote,{nonNullable:true})});
  events=signal(0);saved=signal('');readOnly=signal(false);visible=signal(true);reject=signal(false);spanish=signal(false);dark=signal(false);
  state=computed(()=>noteState(this.spanish(),this.readOnly()));theme=computed(()=>noteTheme(this.dark()));
  toggleDisabled(){const control=this.group.controls.note;if(control.disabled)control.enable();else control.disable();}
  observe(event:TextAreaValueEvent){this.events.update(count=>count+1);if(this.reject())event.preventDefault();}
  save(event:Event){event.preventDefault();this.saved.set(JSON.stringify([...new FormData(event.target as HTMLFormElement)]));}
}
void bootstrapApplication(Consumer);
