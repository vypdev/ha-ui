import {presentationText} from './presentation-text.js';
/** DOM-independent presentation data. Construction grants no application authority. */
export type NavigationKind = 'navigation' | 'panels';
export interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly disabled: boolean;
  readonly href: string | null;
  /** Inert local SVG path command data in a 24-unit view box; no URL or markup. */
  readonly iconPath?: string | null;
  readonly showLabel?: boolean;
}
export interface NavigationState {
  readonly kind: NavigationKind;
  readonly label: string;
  readonly selected: string | null;
  readonly items: readonly NavigationItem[];
  readonly scrollStartLabel?: string;
  readonly scrollEndLabel?: string;
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
  if (!presentationText(value, maximum)) invalid();
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
  const source = object(raw, ['kind', 'label', 'selected', 'items', 'scrollStartLabel', 'scrollEndLabel'], ['kind', 'label', 'selected', 'items']);
  const kind = source.kind;
  if (kind !== 'navigation' && kind !== 'panels') invalid();
  const label = text(source.label, 256);
  const input=source.items;
  if (!Array.isArray(input) || input.length > 64) invalid();
  const items:NavigationItem[]=[];
  for (let index=0,length=input.length;index<length;index++){
    if (!Object.hasOwn(input,index)) invalid();
    const row = object(input[index], ['id', 'label', 'disabled', 'href', 'iconPath', 'showLabel'], ['id', 'label']);
    const id = identifier(row.id), itemLabel = text(row.label, 256);
    const disabled = row.disabled === undefined ? false : row.disabled;
    if (typeof disabled !== 'boolean') invalid();
    const href = kind === 'navigation' ? link(row.href) : row.href == null ? null : invalid();
    const iconPath = row.iconPath == null ? null : text(row.iconPath, 16_384);
    if (iconPath !== null && !/^[Mm][0-9MmLlHhVvCcSsQqTtAaZzEe.,+ -]+$/u.test(iconPath)) invalid();
    const showLabel = row.showLabel === undefined ? true : row.showLabel;
    if (typeof showLabel !== 'boolean' || (!showLabel && iconPath === null)) invalid();
    items.push(Object.freeze({id, label: itemLabel, disabled, href, iconPath, showLabel}));
  }
  if (new Set(items.map(item => item.id)).size !== items.length) invalid();
  const selected = source.selected === null ? null : identifier(source.selected);
  if (selected !== null) {
    const current = items.find(item => item.id === selected);
    if (current === undefined || current.disabled) invalid();
  }
  const scrollStartLabel=source.scrollStartLabel===undefined?'Scroll to start':text(source.scrollStartLabel,256);
  const scrollEndLabel=source.scrollEndLabel===undefined?'Scroll to end':text(source.scrollEndLabel,256);
  return Object.freeze({kind, label, selected, items: Object.freeze(items), scrollStartLabel, scrollEndLabel});
}
