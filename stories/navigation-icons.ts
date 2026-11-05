/** Original 24-unit fixture glyphs; consumers provide their own reviewed local SVG path data. */
export const navigationIconPaths=Object.freeze({
  overview:'M3 11L12 3L21 11V21H15V14H9V21H3Z',
  tasks:'M4 3H20V21H4ZM7 6V9H10V6ZM12 6V8H17V6ZM7 12V15H10V12ZM12 12V14H17V12Z',
  family:'M8 3A3 3 0 1 1 8 9A3 3 0 1 1 8 3ZM16 5A2 2 0 1 1 16 9A2 2 0 1 1 16 5ZM3 12H13V21H3ZM15 12H21V21H15Z',
  settings:'M8 2H16L22 8V16L16 22H8L2 16V8ZM8 8V16H16V8Z',
  inventory:'M3 4H21V9H3ZM5 10H19V21H5ZM9 12V14H15V12Z',
});

export type NavigationIconPresentation='none'|'icon-only'|'icon-and-title'|'mixed';
/** Fixture composition is application-owned, independent of the renderer and framework. */
export function navigationItemIcon(presentation:NavigationIconPresentation|undefined,id:keyof typeof navigationIconPaths,index:number) {
  const mode=presentation??'none';
  const withIcon=mode!=='none'&&(mode!=='mixed'||index%3!==1);
  return {iconPath:withIcon?navigationIconPaths[id]:null,showLabel:mode!=='icon-only'&&!(mode==='mixed'&&index%3===0)};
}
