import {Component,ElementRef,EventEmitter,Input,Output,Renderer2,inject,type OnChanges,type OnDestroy} from '@angular/core';
import type {NavigationState} from '@vypdev/ha-ui/contracts';
import type {HaTabs,NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';

/** Angular owns the light DOM; the registered core host alone owns its visual Shadow DOM. */
@Component({selector:'vyp-ha-tabs',standalone:true,template:'<ng-content />'})
export class Tabs implements OnChanges,OnDestroy {
  @Input({required:true}) state!:NavigationState;
  @Output() readonly selectionRequest=new EventEmitter<NavigationSelectionEvent>(false);
  readonly #host=inject<ElementRef<HaTabs>>(ElementRef).nativeElement;
  readonly #renderer=inject(Renderer2);
  readonly #stop=this.#renderer.listen(this.#host,'ha-selection-request',(event:NavigationSelectionEvent)=>{if(event.composedPath()[0]===this.#host)this.selectionRequest.emit(event);});
  ngOnChanges():void {this.#renderer.setProperty(this.#host,'state',this.state);}
  ngOnDestroy():void {this.#stop();}
}
export {TextField} from './text-field.js';
export {Button} from './button.js';
export {Select} from './select.js';
export {Checkbox} from './checkbox.js';
export {Dialog} from './dialog.js';
export {Card} from './card.js';
export {Grid,Row} from './layout.js';
export {Feedback} from './feedback.js';
