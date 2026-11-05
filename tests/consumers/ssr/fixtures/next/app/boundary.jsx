'use client';
import dynamic from 'next/dynamic';

const ClientTabs=dynamic(()=>import('./client-tabs.jsx'),{ssr:false,
  loading:()=> <p data-client-fallback>Loading household controls…</p>});
export default function Boundary({initial}) {return <ClientTabs initial={initial} />;}
