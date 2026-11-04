/** DOM-independent presentation data. Construction grants no application authority. */
export type NavigationKind = 'navigation' | 'panels';
export interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly disabled: boolean;
  readonly href: string | null;
}
export interface NavigationState {
  readonly kind: NavigationKind;
  readonly label: string;
  readonly selected: string | null;
  readonly items: readonly NavigationItem[];
}
export class NavigationInputError extends Error {
  readonly code = 'invalid_navigation';
  constructor() { super('invalid_navigation'); this.name = 'NavigationInputError'; }
}
function invalid(): never { throw new NavigationInputError(); }
function object(value: unknown, allowed: readonly string[], required: readonly string[]): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) invalid();
  if (Object.keys(value).some(key => !allowed.includes(key)) || required.some(key => !Object.hasOwn(value, key))) invalid();
  return value as Record<string, unknown>;
}
function text(value: unknown, maximum: number): string {
  if (typeof value !== 'string' || !value.trim() || Array.from(value).length > maximum) invalid();
  for (const character of value) {
    const point = character.codePointAt(0)!;
    if (point < 32 || point === 127 || point >= 0xd800 && point <= 0xdfff) invalid();
  }
  return value;
}
function identifier(value: unknown): string {
  const id = text(value, 128);
  if (!/^[A-Za-z0-9_-]+$/u.test(id)) invalid();
  return id;
}
function link(value: unknown): string {
  const href = text(value, 2048);
  if (href.trim() !== href || href.startsWith('//') || href.includes('\\')) invalid();
  let parsed: URL;
  try { parsed = new URL(href, 'https://ha-ui.invalid/'); } catch { return invalid(); }
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) invalid();
  return href;
}
/** Validate a whole controlled state; never choose a route or invoke a renderer callback. */
export function navigationState(raw: unknown): NavigationState {
  const source = object(raw, ['kind', 'label', 'selected', 'items'], ['kind', 'label', 'selected', 'items']);
  const kind = source.kind;
  if (kind !== 'navigation' && kind !== 'panels') invalid();
  const label = text(source.label, 256);
  if (!Array.isArray(source.items) || source.items.length > 64) invalid();
  const items = source.items.map((value: unknown): NavigationItem => {
    const row = object(value, ['id', 'label', 'disabled', 'href'], ['id', 'label']);
    const id = identifier(row.id), itemLabel = text(row.label, 256);
    const disabled = row.disabled === undefined ? false : row.disabled;
    if (typeof disabled !== 'boolean') invalid();
    const href = kind === 'navigation' ? link(row.href) : row.href == null ? null : invalid();
    return Object.freeze({id, label: itemLabel, disabled, href});
  });
  if (new Set(items.map(item => item.id)).size !== items.length) invalid();
  const selected = source.selected === null ? null : identifier(source.selected);
  if (selected !== null) {
    const current = items.find(item => item.id === selected);
    if (current === undefined || current.disabled) invalid();
  }
  return Object.freeze({kind, label, selected, items: Object.freeze(items)});
}
