import {afterEach,expect,test,vi} from 'vitest';
import {page} from 'vitest/browser';
import {cardState,type CardState} from '../../packages/core/src/card-contracts.js';
import {registerCard,type HaCard} from '../../packages/core/src/components/card.js';
export interface CardOptions{state:CardState;actions:boolean;supplyActions:boolean;onReview:()=>void;}
type Mounted={host:HaCard;update(patch:Partial<CardOptions>):Promise<void>;unmount():Promise<void>;};
export function cardAdapterCases(render:(target:HTMLElement,options:CardOptions)=>Promise<Mounted>):void{
 afterEach(()=>document.body.replaceChildren());
 test('projects application content and actions through one shared card while updating typed state',async()=>{
  registerCard();const target=document.createElement('main'),onReview=vi.fn();target.dataset.testid='card-consumer';document.body.append(target);
  const item=await render(target,{state:cardState({title:'Household tasks'}),actions:false,supplyActions:true,onReview});
  try{
   const card=page.getByTestId('card-consumer');await expect.element(card.getByRole('heading',{name:'Household tasks',level:2})).toBeVisible();
   await expect.element(card.getByText('Review household supplies.',{exact:true})).toBeVisible();expect(item.host.hasAttribute('state')).toBe(false);
   const review=card.getByRole('button',{name:'Review task',exact:true});await expect.element(review).not.toBeInTheDocument();
   const footer=item.host.shadowRoot!.querySelector<HTMLElement>('[part=actions]')!;await expect.poll(()=>footer.hidden).toBe(true);
   await item.update({actions:true,state:cardState({title:'Today',headingLevel:3,raised:true})});
   await expect.element(card.getByRole('heading',{name:'Today',level:3})).toBeVisible();await review.click();expect(onReview).toHaveBeenCalledTimes(1);
   expect(item.host.shadowRoot!.querySelector('article')!.hasAttribute('data-raised')).toBe(true);
   await item.update({actions:false});await expect.element(review).not.toBeInTheDocument();await expect.poll(()=>footer.hidden).toBe(true);
   await item.update({supplyActions:false});await expect.poll(()=>item.host.querySelector('[slot=actions]')).toBeNull();expect(footer.hidden).toBe(true);
  }finally{await item.unmount();}
  expect(target.querySelector('vyp-ha-card')).toBeNull();
 });
}
