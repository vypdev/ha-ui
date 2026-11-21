import {navigationState} from '@vypdev/ha-ui/contracts';
import {textAreaState} from '@vypdev/ha-ui/textarea-contracts';
import {connection} from 'next/server';
import Boundary from './boundary.jsx';

export default async function Page() {
  await connection();
  const noteState=textAreaState({label:'Notes',maxLength:1000});
  const state=navigationState({kind:'panels',label:'Household sections',selected:'overview',
    items:[{id:'overview',label:'Overview'},{id:'tasks',label:'Tasks'}]});
  return <main data-note-limit={noteState.maxLength}><h1>Next.js server shell</h1><Boundary initial={state} /></main>;
}
