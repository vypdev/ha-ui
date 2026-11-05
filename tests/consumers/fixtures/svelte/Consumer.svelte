<script lang="ts">
  import {Tabs,TextField,Button,Select,Checkbox,Dialog,Card} from '@vypdev/ha-ui-svelte';
  import type {NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
  import type {FieldValueEvent} from '@vypdev/ha-ui/field';
  import type {ButtonPressEvent} from '@vypdev/ha-ui/button';
  import type {CheckboxChangeEvent} from '@vypdev/ha-ui/checkbox';
  import type {SelectValueEvent} from '@vypdev/ha-ui/select';
  import type {SelectMode,SelectSelection} from '@vypdev/ha-ui/select-contracts';
  import {model,fieldModel,actionModel,resetModel,categoryModel,categoryAction,checkModel,checkAction} from './model.js';
  let viewState=$state.raw(model()),spanish=$state(false),dark=$state(false),disabled=$state(false),visible=$state(true),count=$state(0);
  import type {DialogRequestEvent} from '@vypdev/ha-ui/dialog';
  import {dialogState,type DialogRequestDetail} from '@vypdev/ha-ui/dialog-contracts';
  import {cardState} from '@vypdev/ha-ui/card-contracts';
  let cardReviewed=$state(false),cardVisible=$state(true);
  const taskCard=$derived(cardState({title:cardReviewed?'Reviewed tasks':'Household tasks',headingLevel:cardReviewed?3:2,raised:cardReviewed}));
  const taskDialog=dialogState({title:'Review household task',description:'Review the task before making changes.',confirmLabel:'Confirm task'});
  let dialogOpen=$state(false),dialogMounted=$state(true),dialogReject=$state(false),dialogAction=$state(''),dialogRequests=$state(0);
  function showDialog(){dialogMounted=true;dialogAction='';dialogOpen=true;}
  function requestDialog(event:DialogRequestEvent){dialogRequests++;if(dialogReject&&event.detail.action==='confirm')event.preventDefault();}
  function acceptDialog({action}:DialogRequestDetail){dialogAction=action;dialogOpen=false;}
  let value=$state('Kitchen'),fieldDisabled=$state(false),fieldVisible=$state(true),reject=$state(false),fieldEvents=$state(0),saved=$state('');
  let busy=$state(false),buttonDisabled=$state(false),buttonVisible=$state(true),cancelPress=$state(false),icons=$state(true),presses=$state(0),accepted=$state(0),submits=$state(0),metadata=$state(false);
  function press(event:ButtonPressEvent){presses++;if(cancelPress)event.preventDefault();}
  let category=$state.raw<SelectSelection>(1),categoryMultiple=$state(false),categoryPresentation=$state<SelectMode>('auto'),categoryDisabled=$state(false),categoryVisible=$state(true),categoryReject=$state(false),categoryAvailable=$state(true),categoryEvents=$state(0),categorySaved=$state(''),categorySubmits=$state(0);
  let checked=$state(false),mixed=$state(true),checkDisabled=$state(false),checkVisible=$state(true),checkReject=$state(false),checkPayload=$state(false),checkEvents=$state(0),checkSaved=$state(''),checkSubmits=$state(0);
  function checkRequest(event:CheckboxChangeEvent){checkEvents++;if(checkReject)event.preventDefault();}
  function checkAccept(next:boolean){checked=next;mixed=false;}
  function checkSave(event:SubmitEvent){event.preventDefault();checkSaved=JSON.stringify([...new FormData(event.currentTarget as HTMLFormElement)]);checkSubmits++;}
  function categoryRequest(event:SelectValueEvent){categoryEvents++;if(categoryReject)event.preventDefault();}
  function categorySave(event:SubmitEvent){event.preventDefault();categorySaved=JSON.stringify([...new FormData(event.currentTarget as HTMLFormElement)]);categorySubmits++;}
  function observe(event:FieldValueEvent){fieldEvents++;if(reject)event.preventDefault();}
  function save(event:SubmitEvent){event.preventDefault();const form=event.currentTarget as HTMLFormElement;if(form.reportValidity()){saved=JSON.stringify([...new FormData(form,event.submitter)]);submits++;metadata=event.submitter===form.querySelector('vyp-ha-button')!.submitter;}}
  function select(event:NavigationSelectionEvent){event.preventDefault();viewState=model(spanish,event.detail.id,disabled);count++;}
  function language(){spanish=!spanish;viewState=model(spanish,viewState.selected!,disabled);}
  function toggleDisabled(){disabled=!disabled;viewState=model(spanish,'overview',disabled);}
</script>
{#snippet leading()}<span>+</span>{/snippet}
{#snippet tasks()}<button>Add task</button>{/snippet}
<section style:--error-color={dark?'#f28b82':'#b3261e'} style:background-color={dark?'rgb(20,20,20)':'rgb(255,255,255)'} style:--divider-color={dark?'rgb(66,66,66)':'rgb(224,224,224)'} style:--primary-text-color={dark?'rgb(235,235,235)':'rgb(28,28,28)'} style:--secondary-text-color={dark?'rgb(189,189,189)':'rgb(89,89,89)'} style:--card-background-color={dark?'rgb(20,20,20)':'rgb(255,255,255)'}>
  <button onclick={language}>Switch language</button><button onclick={()=>dark=!dark}>Toggle theme</button>
  <button onclick={toggleDisabled}>Toggle disabled</button><button onclick={()=>visible=!visible}>Toggle component</button>
  <output aria-label="Selection events">{count}</output>
  {#if visible}<Tabs state={viewState} onSelectionRequest={select} panels={{tasks}} />{/if}
  <button onclick={()=>value='Programmatic'}>Set field value</button><button onclick={()=>reject=!reject}>Reject field changes</button>
  <button onclick={()=>fieldDisabled=!fieldDisabled}>Toggle field disabled</button><button onclick={()=>fieldVisible=!fieldVisible}>Toggle field</button>
  <output aria-label="Field model">{value}</output><output aria-label="Field events">{fieldEvents}</output><output aria-label="Saved task">{saved}</output>
  <button onclick={()=>busy=!busy}>Toggle button busy</button><button onclick={()=>buttonDisabled=!buttonDisabled}>Toggle button disabled</button><button onclick={()=>cancelPress=!cancelPress}>Cancel button request</button><button onclick={()=>icons=!icons}>Toggle button icons</button><button onclick={()=>buttonVisible=!buttonVisible}>Toggle action button</button>
  <output aria-label="Press events">{presses}</output><output aria-label="Accepted presses">{accepted}</output><output aria-label="Submit events">{submits}</output><output aria-label="Button metadata">{String(metadata)}</output>
  <form aria-label="Task form" onsubmit={save}>
    {#if fieldVisible}<TextField state={fieldModel(spanish)} {value} name="task" defaultValue="Kitchen" disabled={fieldDisabled} onValueRequest={observe} onValueChange={(next)=>value=next} />{/if}
    {#if buttonVisible}<Button id="bound-submit" state={actionModel(spanish,busy)} type="submit" name="action" value="save" disabled={buttonDisabled} onPressRequest={press} onPress={()=>accepted++} leading={icons?leading:undefined} />{/if}<Button state={resetModel()} type="reset" />
  </form>
  <button onclick={()=>cardVisible=!cardVisible}>Toggle task card</button>
  {#snippet reviewCard()}{#if !cardReviewed}<button onclick={()=>cardReviewed=true}>Review card task</button>{/if}{/snippet}
  {#if cardVisible}<Card id="bound-card" state={taskCard} actions={reviewCard}><p>Check the shared shopping list.</p></Card>{/if}
  <button onclick={showDialog}>Open task dialog</button><button onclick={()=>dialogReject=!dialogReject}>Toggle confirmation rejection</button>
  <output aria-label="Dialog action">{dialogAction}</output><output aria-label="Dialog requests">{dialogRequests}</output>
  {#if dialogMounted}<Dialog id="bound-dialog" state={taskDialog} open={dialogOpen} onRequest={requestDialog} onAction={acceptDialog}>
    <p>Task details</p><button onclick={()=>{dialogOpen=false;dialogMounted=false;}}>Remove task dialog</button>
  </Dialog>{/if}
  <button onclick={()=>{categoryMultiple=!categoryMultiple;category=categoryMultiple?[1,false]:1;}}>Toggle category mode</button><button onclick={()=>category=categoryMultiple?['1',false]:false}>Set category value</button><button onclick={()=>category=categoryMultiple?[]:null}>Clear category</button><button onclick={()=>categoryReject=!categoryReject}>Reject category changes</button><button onclick={()=>categoryDisabled=!categoryDisabled}>Toggle category disabled</button><button onclick={()=>categoryAvailable=!categoryAvailable}>Toggle category options</button><button onclick={()=>categoryVisible=!categoryVisible}>Toggle category</button><button onclick={()=>categoryPresentation='dropdown'}>Use category dropdown</button><button onclick={()=>categoryPresentation='list'}>Use category list</button>
  <output aria-label="Category model">{JSON.stringify(category)}</output><output aria-label="Category events">{categoryEvents}</output><output aria-label="Saved categories">{categorySaved}</output><output aria-label="Category submits">{categorySubmits}</output>
  <form aria-label="Category form" onsubmit={categorySave}>
   {#if categoryVisible}<Select id="bound-category" state={categoryModel(spanish,categoryMultiple,categoryAvailable,categoryPresentation)} value={category} defaultValue={categoryMultiple?[1,false]:1} name="category" disabled={categoryDisabled} onValueRequest={categoryRequest} onValueChange={(next)=>category=next} />{/if}
   <Button state={categoryAction(spanish)} type="submit" /><Button state={categoryAction(spanish,true)} type="reset" />
  </form>
  <button onclick={()=>checked=true}>Set checked</button><button onclick={()=>mixed=!mixed}>Toggle partial</button><button onclick={()=>checkReject=!checkReject}>Reject check changes</button><button onclick={()=>checkDisabled=!checkDisabled}>Toggle check disabled</button><button onclick={()=>checkPayload=!checkPayload}>Toggle check payload</button><button onclick={()=>checkVisible=!checkVisible}>Toggle checkbox</button>
  <output aria-label="Checkbox model">{String(checked)}</output><output aria-label="Checkbox events">{checkEvents}</output><output aria-label="Saved checkbox">{checkSaved}</output><output aria-label="Checkbox submits">{checkSubmits}</output>
  <form aria-label="Checkbox form" onsubmit={checkSave}>
    {#if checkVisible}<Checkbox id="bound-checkbox" state={checkModel(spanish,mixed)} {checked} name="notify" value={checkPayload?'confirmed':'on'} disabled={checkDisabled} onCheckedRequest={checkRequest} onCheckedChange={checkAccept} />{/if}
    <Button state={checkAction(spanish)} type="submit" /><Button state={checkAction(spanish,true)} type="reset" />
  </form>
</section>
