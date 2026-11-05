import {Component,ElementRef,Input,Renderer2,inject,type OnChanges} from '@angular/core';
import type {GridState,RowState} from '@vypdev/ha-ui/layout-contracts';
import type {HaGrid,HaRow} from '@vypdev/ha-ui/layout';
@Component({selector:'vyp-ha-row',standalone:true,template:'<ng-content />'})
export class Row implements OnChanges {
 @Input({required:true}) state!:RowState;
 readonly #host=inject<ElementRef<HaRow>>(ElementRef).nativeElement;
 readonly #renderer=inject(Renderer2);
 ngOnChanges():void{this.#renderer.setProperty(this.#host,'state',this.state);}
}
@Component({selector:'vyp-ha-grid',standalone:true,template:'<ng-content />'})
export class Grid implements OnChanges {
 @Input({required:true}) state!:GridState;
 readonly #host=inject<ElementRef<HaGrid>>(ElementRef).nativeElement;
 readonly #renderer=inject(Renderer2);
 ngOnChanges():void{this.#renderer.setProperty(this.#host,'state',this.state);}
}
