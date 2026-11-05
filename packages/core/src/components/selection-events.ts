/** Native scroll is not composed; observe every root reached by the rendered anchor ancestry. */
export function selectionScrollRoots(anchor:HTMLElement):ReadonlySet<Window|ShadowRoot>{
 const roots=new Set<Window|ShadowRoot>([window]);
 for(let node:Node|null=anchor;node;node=node instanceof Element&&node.assignedSlot?node.assignedSlot:node.parentNode??(node instanceof ShadowRoot?node.host:null)){
  if(node instanceof ShadowRoot)roots.add(node);
 }
 return roots;
}
