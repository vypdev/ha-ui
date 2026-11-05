import {Component,ElementRef,Input,Renderer2,inject,type OnChanges} from '@angular/core';
import type {CardState} from '@vypdev/ha-ui/card-contracts';
import type {HaCard} from '@vypdev/ha-ui/card';
@Component({selector:'vyp-ha-card',standalone:true,template:'<ng-content />'})
export class Card implements OnChanges{
 @Input({required:true}) state!:CardState;
 readonly #host=inject<ElementRef<HaCard>>(ElementRef).nativeElement;
 readonly #renderer=inject(Renderer2);
 ngOnChanges():void{this.#renderer.setProperty(this.#host,'state',this.state);}
}
