import {afterEach,expect,test,vi} from 'vitest';
import {page} from 'vitest/browser';
import {gridState,rowState,type GridState,type RowState} from '../../packages/core/src/layout-contracts.js';
import {registerGrid,registerRow} from '../../packages/core/src/components/layout.js';

export interface LayoutOptions{grid:GridState;row:RowState;project:boolean;onReview:()=>void;}
type Mount={update(patch:Partial<LayoutOptions>):Promise<void>;unmount():Promise<void>;};

export function layoutAdapterCases(mount:(target:HTMLElement,initial:LayoutOptions)=>Promise<Mount>):void{
 afterEach(()=>document.body.replaceChildren());
 test('projects native row controls into a responsive grid and updates typed state without remounting',async()=>{
  registerGrid();registerRow();const target=document.createElement('main'),onReview=vi.fn();target.dataset.testid='layout-app';document.body.append(target);
  const app=await mount(target,{grid:gridState({label:'Tasks'}),row:rowState({label:'Household supplies'}),project:false,onReview});
  try{
   const scope=page.getByTestId('layout-app');await expect.element(scope.getByRole('region',{name:'Tasks'})).toBeVisible();
   await expect.element(scope.getByRole('listitem').getByText('Household supplies')).toBeVisible();
   const grid=target.querySelector('vyp-ha-grid')!,row=target.querySelector('vyp-ha-row')!;
   expect(grid.hasAttribute('state')||row.hasAttribute('state')).toBe(false);
   await app.update({grid:gridState({label:'Today',columns:2,minColumnWidth:150}),row:rowState({label:'Kitchen',description:'Review the list.'}),project:true});
   await expect.element(scope.getByRole('region',{name:'Today'})).toBeVisible();await expect.element(scope.getByText('Review the list.')).toBeVisible();
   await expect.element(scope.getByText('Prep')).toBeVisible();const action=scope.getByRole('button',{name:'Review row'});await action.click();expect(onReview).toHaveBeenCalledTimes(1);
   expect(target.querySelector('vyp-ha-grid')).toBe(grid);expect(target.querySelector('vyp-ha-row')).toBe(row);
   await app.update({project:false});await expect.element(action).not.toBeInTheDocument();
  }finally{await app.unmount();}
  expect(target.querySelector('vyp-ha-grid')).toBeNull();
 });
}
