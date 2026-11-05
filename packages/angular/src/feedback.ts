import {Component,ElementRef,Input,Renderer2,inject,type OnChanges} from '@angular/core';
import type {FeedbackState} from '@vypdev/ha-ui/feedback-contracts';
import type {HaFeedback} from '@vypdev/ha-ui/feedback';
@Component({selector:'vyp-ha-feedback',standalone:true,template:'<ng-content />'})
export class Feedback implements OnChanges {
 @Input({required:true}) state!:FeedbackState;
 readonly #host=inject<ElementRef<HaFeedback>>(ElementRef).nativeElement;
 readonly #renderer=inject(Renderer2);
 ngOnChanges():void{this.#renderer.setProperty(this.#host,'state',this.state);}
}
