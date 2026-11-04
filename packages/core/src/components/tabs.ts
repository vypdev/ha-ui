import {LitElement, css, html, nothing} from 'lit';
import {navigationState, type NavigationItem, type NavigationKind, type NavigationState} from '../contracts.js';

export interface NavigationSelectionDetail { readonly kind: NavigationKind; readonly id: string; }
export type NavigationSelectionEvent = CustomEvent<NavigationSelectionDetail>;

/** A controlled HA-style navigation bar or local, manually activated panel tabs. */
export class HaTabs extends LitElement {
  static properties = {state: {attribute: false, noAccessor: true}};
  // Gateway dashboard geometry and measured HA ha-tab-group-tab/hui-root styles; see NOTICE.
  static styles = css`
    :host { display:block; min-width:0; font:500 14px/1.6 var(--vyp-ha-font-family,var(--primary-font-family,Roboto,Noto,sans-serif)); }
    .bar { display:flex; align-items:flex-start; gap:0; overflow-x:auto; overflow-y:hidden; height:56px;
      scrollbar-width:none; box-sizing:border-box;
      border-bottom:var(--vyp-ha-tab-border,var(--app-header-border-bottom,1px solid var(--vyp-ha-border,var(--divider-color,#e0e0e0))));
      background:var(--vyp-ha-surface,var(--app-header-background-color,var(--card-background-color,#fff))); }
    .bar::-webkit-scrollbar { display:none; }
    a,button { flex:0 0 auto; box-sizing:border-box; min-width:0; height:56px; min-height:56px; display:flex; align-items:flex-start;
      padding:0; margin:0; border:0; border-radius:0; font:inherit; white-space:nowrap;
      color:var(--vyp-ha-text-secondary,var(--app-header-text-color,var(--primary-text-color,#141414)));
      background:transparent; opacity:.8; cursor:pointer; text-decoration:none; }
    .content { display:flex; box-sizing:border-box; align-items:center; justify-content:center;
      padding:18px var(--vyp-ha-tab-padding,16px) 14px; }
    [aria-current=page],[aria-selected=true] { opacity:1;
      color:var(--vyp-ha-text,var(--app-header-text-color,var(--primary-text-color,#141414)));
      border-bottom:2px solid var(--vyp-ha-tab-indicator-color,var(--app-header-selection-bar-color,var(--ha-tab-indicator-color,currentColor))); }
    @media(hover:hover) { a:hover:not([aria-disabled=true]),button:hover:not(:disabled) {
      color:var(--vyp-ha-text,var(--app-header-text-color,var(--primary-text-color,#141414))); } }
    a:focus-visible,button:focus-visible { outline:none; }
    a:focus-visible .content,button:focus-visible .content {
      outline:var(--vyp-ha-focus-ring,var(--wa-focus-ring,solid 2px var(--vyp-ha-primary,#989898))); outline-offset:-5px; }
    [aria-disabled=true],button:disabled { cursor:not-allowed; }
    [aria-disabled=true] .content,button:disabled .content { opacity:.5; }
    [hidden] { display:none !important; }
  `;
  #model = navigationState({kind:'navigation',label:'Sections',selected:null,items:[]});
  #focused: string | null = null;
  get state(): NavigationState { return this.#model; }
  set state(value: NavigationState) {
    const next = navigationState(value), previous = this.#model;
    this.#model = next; this.#focused = null; this.requestUpdate('state', previous);
  }
  #activate(event: MouseEvent, item: NavigationItem, snapshot: NavigationState): void {
    if (snapshot !== this.state || item.disabled) { event.preventDefault(); return; }
    if (event.defaultPrevented) return;
    if (snapshot.kind === 'navigation' && (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return;
    const intent: NavigationSelectionEvent = new CustomEvent('ha-selection-request', {
      detail: Object.freeze({kind:snapshot.kind,id:item.id}), bubbles:true, composed:true, cancelable:true,
    });
    if (!this.dispatchEvent(intent)) event.preventDefault();
  }
  #move(event: KeyboardEvent, item: NavigationItem, snapshot: NavigationState): void {
    if (snapshot !== this.state || item.disabled || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const enabled = snapshot.items.filter(row => !row.disabled);
    const index = enabled.findIndex(row => row.id === item.id);
    const direction = getComputedStyle(this).direction === 'rtl' ? -1 : 1;
    let destination: number;
    switch (event.key) {
      case 'Home': destination=0; break;
      case 'End': destination=enabled.length-1; break;
      case 'ArrowRight': destination=(index+direction+enabled.length)%enabled.length; break;
      case 'ArrowLeft': destination=(index-direction+enabled.length)%enabled.length; break;
      default: return;
    }
    event.preventDefault(); this.#focused=enabled[destination].id; this.requestUpdate();
    this.renderRoot.querySelector<HTMLButtonElement>('#tab-'+this.#focused)!.focus();
  }
  #reveal(): void {
    this.renderRoot.querySelector(':focus')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  }
  #leave(event: FocusEvent): void {
    const bar=event.currentTarget as HTMLElement;
    if (!(event.relatedTarget instanceof Node) || !bar.contains(event.relatedTarget)) {
      this.#focused=null; this.requestUpdate();
    }
  }
  protected render() {
    const snapshot=this.state;
    if (snapshot.kind === 'navigation') return html`<nav class="bar" part="bar" aria-label=${snapshot.label} @focusin=${this.#reveal}>
      ${snapshot.items.map(item => html`<a part="item" href=${item.disabled ? nothing : item.href!}
        aria-current=${snapshot.selected === item.id ? 'page' : nothing} aria-disabled=${item.disabled ? 'true' : nothing}
        tabindex=${item.disabled ? '-1' : nothing} @click=${(event: MouseEvent) => this.#activate(event,item,snapshot)}><span class="content" part="content">${item.label}</span></a>`)}
    </nav>`;
    const enabled=snapshot.items.filter(item=>!item.disabled);
    const tabStop=enabled.find(item=>item.id === this.#focused)?.id ?? snapshot.selected ?? enabled[0]?.id;
    return html`<div class="bar" part="bar" role="tablist" aria-label=${snapshot.label} aria-orientation="horizontal" @focusout=${this.#leave} @focusin=${this.#reveal}>
      ${snapshot.items.map(item => html`<button part="item" id=${'tab-'+item.id} type="button" role="tab"
        aria-selected=${String(snapshot.selected === item.id)} aria-controls=${'panel-'+item.id}
        ?disabled=${item.disabled} tabindex=${item.id === tabStop ? 0 : -1}
        @click=${(event: MouseEvent) => this.#activate(event,item,snapshot)}
        @keydown=${(event: KeyboardEvent) => this.#move(event,item,snapshot)}><span class="content" part="content">${item.label}</span></button>`)}
    </div>${snapshot.items.map(item => html`<section part="panel" id=${'panel-'+item.id} role="tabpanel"
      aria-labelledby=${'tab-'+item.id} tabindex="0" ?hidden=${snapshot.selected !== item.id}><slot name=${item.id}></slot></section>`)}`;
  }
}

/** Call at the explicit client boundary. Imports never define tags; component rendering and registration require a live browser. */
export function registerTabs(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (registry === undefined || typeof document === 'undefined') throw new Error('registerTabs requires a browser CustomElementRegistry');
  const current=registry.get('vyp-ha-tabs');
  if (current !== undefined && current !== HaTabs) throw new Error('vyp-ha-tabs registration conflict; use one reviewed package cohort');
  if (current === undefined) registry.define('vyp-ha-tabs',HaTabs);
}

declare global {
  interface HTMLElementTagNameMap { 'vyp-ha-tabs': HaTabs; }
  interface HTMLElementEventMap { 'ha-selection-request': NavigationSelectionEvent; }
}
