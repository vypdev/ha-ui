import {Component,signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {Tabs} from '@vypdev/ha-ui-angular';
import {registerTabs,type NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {model} from './model.js';
registerTabs();
@Component({selector:'fixture-app',standalone:true,imports:[Tabs],template:`
  <section [style.--primary-text-color]="dark()?'rgb(235,235,235)':'rgb(28,28,28)'" [style.--secondary-text-color]="dark()?'rgb(189,189,189)':'rgb(89,89,89)'" [style.--card-background-color]="dark()?'rgb(20,20,20)':'rgb(255,255,255)'">
    <button (click)="language()">Switch language</button><button (click)="dark.set(!dark())">Toggle theme</button>
    <button (click)="toggleDisabled()">Toggle disabled</button><button (click)="visible.set(!visible())">Toggle component</button>
    <output aria-label="Selection events">{{count()}}</output>
    @if(visible()){<vyp-ha-tabs [state]="state()" (selectionRequest)="select($event)"><button slot="tasks">Add task</button></vyp-ha-tabs>}
  </section>`})
class Consumer {
  state=signal(model());spanish=signal(false);dark=signal(false);disabled=signal(false);visible=signal(true);count=signal(0);
  select(event:NavigationSelectionEvent){event.preventDefault();this.state.set(model(this.spanish(),event.detail.id,this.disabled()));this.count.update(value=>value+1);}
  language(){this.spanish.set(!this.spanish());this.state.set(model(this.spanish(),this.state().selected!,this.disabled()));}
  toggleDisabled(){this.disabled.set(!this.disabled());this.state.set(model(this.spanish(),'overview',this.disabled()));}
}
void bootstrapApplication(Consumer);
