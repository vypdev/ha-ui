'use client';
import {registerTextArea} from '@vypdev/ha-ui/textarea';
import {textAreaState} from '@vypdev/ha-ui/textarea-contracts';
import {useState} from 'react';
import {Tabs,TextField,TextArea} from '@vypdev/ha-ui-react';
import {registerTabs} from '@vypdev/ha-ui/tabs';
import {registerField} from '@vypdev/ha-ui/field';
import {textFieldState} from '@vypdev/ha-ui/field-contracts';
registerTabs();registerField();registerTextArea();
const noteState=textAreaState({label:'Notes',required:true,maxLength:1000});
const barcodeState=textFieldState({label:'Barcode number',inputMode:'numeric'});

export default function ClientTabs({initial}) {
  const [state,setState]=useState(initial),[count,setCount]=useState(0),[mounted,setMounted]=useState(true);
  const [barcode,setBarcode]=useState('00012345'),[note,setNote]=useState('Initial\n😀'),[noteEvents,setNoteEvents]=useState(0);
  function select(event) {
    setCount(value=>value+1);
    setState(value=>({...value,selected:event.detail.id}));
  }
  return <>
    <form aria-label="Barcode form">
      <TextField state={barcodeState} value={barcode} name="barcode" onValueChange={setBarcode} />
    </form>
    <output aria-label="Multiline requests">{noteEvents}</output>
    {mounted&&<form aria-label="Multiline form"><TextArea state={noteState} value={note} name="note" defaultValue={'Initial\n😀'} onValueChange={setNote} onValueRequest={()=>setNoteEvents(count=>count+1)} /><button type="reset">Reset multiline note</button></form>}
    <button type="button" onClick={()=>setMounted(value=>!value)}>Toggle controls</button>
    <output aria-label="Selection requests">{count}</output>
    {mounted&&<Tabs state={state} onSelectionRequest={select}>
      <span slot="overview">Household overview</span><span slot="tasks">Household tasks</span>
    </Tabs>}
  </>;
}
