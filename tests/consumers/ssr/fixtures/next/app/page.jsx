import {navigationState} from '@vypdev/ha-ui/contracts';
import {connection} from 'next/server';
import Boundary from './boundary.jsx';

export default async function Page() {
  await connection();
  const state=navigationState({kind:'panels',label:'Household sections',selected:'overview',
    items:[{id:'overview',label:'Overview'},{id:'tasks',label:'Tasks'}]});
  return <main><h1>Next.js server shell</h1><Boundary initial={state} /></main>;
}
