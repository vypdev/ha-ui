'use client';
import {useState} from 'react';
import {Tabs} from '@vypdev/ha-ui-react';
import {registerTabs} from '@vypdev/ha-ui/tabs';
registerTabs();

export default function ClientTabs({initial}) {
  const [state,setState]=useState(initial),[count,setCount]=useState(0),[mounted,setMounted]=useState(true);
  function select(event) {
    setCount(value=>value+1);
    setState(value=>({...value,selected:event.detail.id}));
  }
  return <>
    <button type="button" onClick={()=>setMounted(value=>!value)}>Toggle controls</button>
    <output aria-label="Selection requests">{count}</output>
    {mounted&&<Tabs state={state} onSelectionRequest={select}>
      <span slot="overview">Household overview</span><span slot="tasks">Household tasks</span>
    </Tabs>}
  </>;
}
