import {afterEach,expect,test} from 'vitest';
import {page,userEvent} from 'vitest/browser';
import {CardInputError,cardState} from '../../packages/core/src/card-contracts.js';
import {registerCard} from '../../packages/core/src/components/card.js';
import {registerButton} from '../../packages/core/src/components/button.js';
import {buttonState} from '../../packages/core/src/button-contracts.js';

async function mount(input:Record<string,unknown>={}){
 registerCard();const card=document.createElement('vyp-ha-card');card.state=cardState(input);document.body.append(card);await card.updateComplete;return card;
}
afterEach(()=>document.body.replaceChildren());

test('the card is named by an inert native heading and accepts a new heading level',async()=>{
 const card=await mount({title:'<b>Household tasks</b>',headingLevel:3}),scope=page.elementLocator(card);
 await expect.element(scope.getByRole('article',{name:'<b>Household tasks</b>',exact:true})).toBeVisible();
 await expect.element(scope.getByRole('heading',{name:'<b>Household tasks</b>',level:3})).toBeVisible();expect(card.shadowRoot!.querySelector('b')).toBeNull();expect(card.tabIndex).toBe(-1);
 expect(()=>{card.state={...card.state,headingLevel:9} as unknown as typeof card.state;}).toThrow(CardInputError);
 card.state=cardState({...card.state,title:'Household tasks',headingLevel:4});await card.updateComplete;
 await expect.element(scope.getByRole('heading',{name:'Household tasks',level:4})).toBeVisible();expect(card.hasAttribute('state')).toBe(false);
});

test('body and actions react to projected content, ignoring formatting whitespace',async()=>{
 const card=await mount(),root=card.shadowRoot!,body=root.querySelector<HTMLElement>('[part=body]')!,footer=root.querySelector<HTMLElement>('[part=actions]')!;
 expect(body.hidden&&footer.hidden).toBe(true);expect(root.querySelector('article')!.getAttribute('aria-labelledby')).toBeNull();
 card.append(document.createTextNode('   '));await card.updateComplete;expect(body.hidden).toBe(true);
 const text=document.createTextNode('Check kitchen supplies.');card.append(text);await expect.poll(()=>body.hidden).toBe(false);
 text.data='   ';await expect.poll(()=>body.hidden).toBe(true);text.data='Check kitchen supplies.';await expect.poll(()=>body.hidden).toBe(false);
 const button=document.createElement('button');button.textContent='Review task';button.slot='actions';card.append(button);
 await expect.element(page.elementLocator(card).getByRole('button',{name:'Review task'})).toBeVisible();expect(footer.hidden).toBe(false);
 text.remove();button.remove();await expect.poll(()=>body.hidden&&footer.hidden).toBe(true);
});

test('projected controls keep native focus order and form ownership',async()=>{
 registerButton();const card=await mount({title:'Edit task'}),form=document.createElement('form'),before=document.createElement('button'),field=document.createElement('input'),save=document.createElement('vyp-ha-button');
 before.type='button';before.textContent='Before card';field.name='task';field.value='Kitchen';field.setAttribute('aria-label','Task');
 save.state=buttonState({label:'Save task'});save.type='submit';save.name='action';save.value='save';save.slot='actions';
 form.append(before,card);document.body.append(form);card.append(field,save);await Promise.all([card.updateComplete,save.updateComplete]);
 const entries:unknown[]=[];form.addEventListener('submit',event=>{event.preventDefault();entries.push([...new FormData(form,(event as SubmitEvent).submitter)]);});
 before.focus();await userEvent.keyboard('{Tab}');expect(document.activeElement).toBe(field);await userEvent.keyboard('{Tab}');expect(document.activeElement).toBe(save);
 await userEvent.keyboard('{Enter}');await expect.poll(()=>entries).toEqual([[['task','Kitchen'],['action','save']]]);
});

test('reconnect reads projected text changed while detached and resumes observation',async()=>{
 const card=await mount(),body=card.shadowRoot!.querySelector<HTMLElement>('[part=body]')!,text=document.createTextNode('Tasks');
 card.append(text);await expect.poll(()=>body.hidden).toBe(false);
 card.remove();text.data=' ';document.body.append(card);await card.updateComplete;expect(body.hidden).toBe(true);
 const content=document.createElement('p'),child=document.createTextNode('Nested copy');content.append(child);card.append(content);
 await expect.poll(()=>body.hidden).toBe(false);child.data='New copy';await card.updateComplete;expect(body.hidden).toBe(false);
 card.hidden=true;expect(getComputedStyle(card).display).toBe('none');
});

test('uses local theme tokens, raised paint and narrow wrapping without adding horizontal overflow',async()=>{
 const card=await mount({title:'Maintenance and shared household supplies',raised:true});card.style.width='180px';card.style.setProperty('--ha-card-border-radius','4px');card.style.setProperty('--ha-card-background','rgb(240, 245, 250)');card.style.setProperty('--vyp-ha-motion-duration','0ms');
 const surface=card.shadowRoot!.querySelector<HTMLElement>('[part=card]')!,heading=card.shadowRoot!.querySelector<HTMLElement>('[part=heading]')!;
 await expect.poll(()=>getComputedStyle(surface).borderTopWidth).toBe('0px');expect(getComputedStyle(surface).boxShadow).not.toBe('none');expect(getComputedStyle(surface).borderRadius).toBe('4px');expect(getComputedStyle(surface).backgroundColor).toBe('rgb(240, 245, 250)');
 expect(surface.scrollWidth).toBeLessThanOrEqual(180);expect(heading.getBoundingClientRect().height).toBeGreaterThan(72);
 card.state=cardState({title:'Task'});await card.updateComplete;expect(getComputedStyle(surface).borderTopWidth).toBe('1px');
});

test('reuses its browser registration and rejects an incompatible constructor',()=>{
 registerCard();registerCard(customElements);class ForeignCard extends HTMLElement{}
 expect(()=>registerCard({get:()=>ForeignCard} as unknown as CustomElementRegistry)).toThrow(/registration conflict/u);
});
