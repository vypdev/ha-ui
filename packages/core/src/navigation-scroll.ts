/** DOM-free logical scroll geometry; one CSS pixel matches the measured HA edge tolerance. */
export interface NavigationScrollGeometry {readonly maximum:number;readonly position:number;readonly viewport:number;readonly rtl:boolean;readonly start:boolean;readonly end:boolean;}
export function navigationScrollGeometry(width:number,viewport:number,offset:number,rtl:boolean):NavigationScrollGeometry {
  if(![width,viewport,offset].every(Number.isFinite)||width<0||viewport<0)throw new RangeError('invalid_scroll_geometry');
  const maximum=Math.max(0,width-viewport),position=Math.max(0,Math.min(maximum,rtl?-offset:offset));
  return Object.freeze({maximum,position,viewport,rtl,start:maximum>1&&position>1,end:maximum>1&&position<maximum-1});
}
export function navigationPageScroll(geometry:NavigationScrollGeometry,side:'start'|'end'):number {
  const position=Math.max(0,Math.min(geometry.maximum,geometry.position+(side==='start'?-geometry.viewport:geometry.viewport)));
  return position===0?0:geometry.rtl?-position:position;
}
