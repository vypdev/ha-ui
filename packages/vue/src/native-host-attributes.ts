const contentSetters=new Set(['innerhtml','outerhtml','textcontent','innertext']);
/** Preserve Vue fallthrough attributes without exposing setters that replace owned content. */
export function nativeHostAttributes(attrs:Record<string,unknown>):Record<string,unknown>{
  return Object.fromEntries(Object.entries(attrs).filter(([name])=>!contentSetters.has(name.replace(/^[.^]/u,'').toLowerCase())));
}
