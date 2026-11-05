import {NavigationOverflowController} from './navigation-overflow.js';
import {LitElement, css, html, nothing} from 'lit';
import {navigationState, type NavigationItem, type NavigationKind, type NavigationState} from '../contracts.js';

export interface NavigationSelectionDetail { readonly kind: NavigationKind; readonly id: string; }
export type NavigationSelectionEvent = CustomEvent<NavigationSelectionDetail>;

/** A controlled HA-style navigation bar or local, manually activated panel tabs. */
export class HaTabs extends LitElement {
  static properties = {state: {attribute: false, noAccessor: true}};
  // Measured HA dashboard tab and SVG styles; native semantics, local data, see NOTICE.
  static styles = css`
    :host { display:block; min-width:0; font:500 14px/1.6 var(--vyp-ha-font-family,var(--primary-font-family,Roboto,Noto,sans-serif)); }
    :host([hidden]){display:none;}
    .frame { position:relative; height:56px; min-width:0; overflow:hidden; box-sizing:border-box;
      background:var(--vyp-ha-surface,var(--app-header-background-color,var(--card-background-color,#fff)));
      border-bottom:var(--vyp-ha-tab-border,var(--app-header-border-bottom,1px solid var(--vyp-ha-border,var(--divider-color,#e0e0e0)))); }
    .items { display:flex; align-items:flex-start; flex:0 0 auto; min-width:100%; width:max-content; }
    .scroll-control { position:absolute; inset-block-start:0; height:56px; width:1.5em; z-index:1;
      display:flex; align-items:center; justify-content:center;
      color:var(--vyp-ha-text,var(--app-header-text-color,var(--primary-text-color,#141414)));
      background:linear-gradient(90deg,var(--vyp-ha-surface,var(--app-header-background-color,var(--card-background-color,#fff))),transparent); }
    .scroll-control.start { inset-inline-start:0; }
    .scroll-control.end { inset-inline-end:0; background:linear-gradient(270deg,var(--vyp-ha-surface,var(--app-header-background-color,var(--card-background-color,#fff))),transparent); }
    .scroll-button { display:flex; flex:none; align-items:center; justify-content:center; width:40px; height:40px;
      box-sizing:border-box; margin:0; padding:0 12px; border:1px solid transparent; border-radius:12px;
      background:transparent; color:inherit; font:inherit; cursor:pointer; }
    .scroll-icon { display:inline-flex; align-items:center; justify-content:center; flex:none; width:1.25em; height:1em; pointer-events:none; }
    .scroll-icon svg { display:block; width:auto; height:1em; overflow:visible; }
    .scroll-button:focus-visible { outline:var(--vyp-ha-focus-ring,var(--wa-focus-ring,solid 2px #989898)); outline-offset:var(--wa-focus-ring-offset,2px); }
    .scroll-button[aria-disabled=true] .scroll-icon { opacity:.5; }
    .bar { display:flex; align-items:flex-start; gap:0; overflow-x:auto; overflow-y:hidden; height:56px;
      scrollbar-width:none; box-sizing:border-box;
      border-bottom:var(--vyp-ha-tab-border,var(--app-header-border-bottom,1px solid var(--vyp-ha-border,var(--divider-color,#e0e0e0))));
      background:transparent; }
    .bar::-webkit-scrollbar { display:none; }
    a[part=item],button[part=item] { flex:0 0 auto; box-sizing:border-box; min-width:0; height:56px; min-height:56px; display:flex; align-items:flex-start;
      padding:0; margin:0; border:0; border-radius:0; font:inherit; white-space:nowrap;
      color:var(--vyp-ha-text-secondary,var(--app-header-text-color,var(--primary-text-color,#141414)));
      background:transparent; opacity:.8; cursor:pointer; text-decoration:none; }
    .content { display:flex; box-sizing:border-box; align-items:center; justify-content:center;
      padding:18px var(--vyp-ha-tab-padding,16px) 14px; }
    .content.has-icon { padding-block:16px 12px; }
    .icon { display:block; flex:none; width:var(--vyp-ha-tab-icon-size,var(--mdc-icon-size,24px));
      height:var(--vyp-ha-tab-icon-size,var(--mdc-icon-size,24px)); fill:var(--icon-primary-color,currentColor); pointer-events:none; }
    .icon path { opacity:var(--icon-primary-opactity,1); }
    .icon + .label:not([hidden]) { margin-inline-start:var(--vyp-ha-tab-icon-gap,var(--ha-space-2,8px)); }
    [part=item][aria-current=page],[part=item][aria-selected=true] { opacity:1;
      color:var(--vyp-ha-text,var(--app-header-text-color,var(--primary-text-color,#141414)));
      border-bottom:2px solid var(--vyp-ha-tab-indicator-color,var(--app-header-selection-bar-color,var(--ha-tab-indicator-color,currentColor))); }
    @media(hover:hover) { a[part=item]:hover:not([aria-disabled=true]),button[part=item]:hover:not(:disabled) {
      color:var(--vyp-ha-text,var(--app-header-text-color,var(--primary-text-color,#141414))); } }
    a[part=item]:focus-visible,button[part=item]:focus-visible { outline:none; }
    a[part=item]:focus-visible .content,button[part=item]:focus-visible .content {
      outline:var(--vyp-ha-focus-ring,var(--wa-focus-ring,solid 2px var(--vyp-ha-primary,#989898))); outline-offset:-5px; }
    a[aria-disabled=true],button[part=item]:disabled { cursor:not-allowed; }
    a[aria-disabled=true] .content,button[part=item]:disabled .content { opacity:.5; }
    [hidden] { display:none !important; }
  `;
  #model = navigationState({kind:'navigation',label:'Sections',selected:null,items:[]});
  #focused: string | null = null;
  readonly #overflow=new NavigationOverflowController(this);
  #scrollFocused:{side:'start'|'end';button:EventTarget|null}|null=null;
  protected updated():void {this.#overflow.update(this.state.selected);}
  disconnectedCallback():void {super.disconnectedCallback();this.#scrollFocused=null;}
  get state(): NavigationState { return this.#model; }
  set state(value: NavigationState) {
    const next = navigationState(value), previous = this.#model;
    this.#model = next; this.#focused = null; this.requestUpdate('state', previous);
  }
  #activate(event: MouseEvent, item: NavigationItem, snapshot: NavigationState): void {
    if (snapshot !== this.state || item.disabled || this.#overflow.consumeClick(event)) { event.preventDefault(); return; }
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
    const focused=this.renderRoot.querySelector<HTMLElement>('[part=item]:focus');if(focused)this.#overflow.reveal(focused);
  }
  #leave(event: FocusEvent): void {
    const bar=event.currentTarget as HTMLElement;
    if (!(event.relatedTarget instanceof Node) || !bar.contains(event.relatedTarget)) {
      this.#focused=null; this.requestUpdate();
    }
  }
  #content(item: NavigationItem) {
    return html`<span class=${item.iconPath ? 'content has-icon' : 'content'} part="content">${item.iconPath ? html`<svg class="icon" part="icon" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true"><path d=${item.iconPath}></path></svg>` : nothing}<span class="label" part="label" ?hidden=${item.showLabel === false}>${item.label}</span></span>`;
  }
  #list(snapshot:NavigationState) {
    if (snapshot.kind === 'navigation') return html`<nav class="bar" part="bar" tabindex="-1" aria-label=${snapshot.label} @focusin=${this.#reveal}>
      <div class="items">${snapshot.items.map(item => html`<a role="link" part="item" aria-label=${item.label} title=${item.showLabel === false ? item.label : nothing} href=${item.disabled ? nothing : item.href!}
        aria-current=${snapshot.selected === item.id ? 'page' : nothing} aria-disabled=${item.disabled ? 'true' : nothing}
        tabindex=${item.disabled ? '-1' : nothing} @click=${(event: MouseEvent) => this.#activate(event,item,snapshot)}>${this.#content(item)}</a>`)}</div>
    </nav>`;
    const enabled=snapshot.items.filter(item=>!item.disabled);
    const tabStop=enabled.find(item=>item.id === this.#focused)?.id ?? snapshot.selected ?? enabled[0]?.id;
    return html`<div class="bar" part="bar" tabindex="-1" role="tablist" aria-label=${snapshot.label} aria-orientation="horizontal" @focusout=${this.#leave} @focusin=${this.#reveal}>
      <div class="items">${snapshot.items.map(item => html`<button part="item" aria-label=${item.label} title=${item.showLabel === false ? item.label : nothing} id=${'tab-'+item.id} type="button" role="tab"
        aria-selected=${String(snapshot.selected === item.id)} aria-controls=${'panel-'+item.id}
        ?disabled=${item.disabled} tabindex=${item.id === tabStop ? 0 : -1}
        @click=${(event: MouseEvent) => this.#activate(event,item,snapshot)}
        @keydown=${(event: KeyboardEvent) => this.#move(event,item,snapshot)}>${this.#content(item)}</button>`)}</div>
    </div>`;
  }
  #scrollControl(side:'start'|'end',snapshot:NavigationState) {
    const geometry=this.#overflow.geometry,available=geometry[side];
    if(!available&&this.#scrollFocused?.side!==side)return nothing;
    // Font Awesome Free 7.0.0 chevrons, Copyright 2025 Fonticons, CC-BY-4.0; see NOTICE.
    const left='M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z';
    const right='M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z';
    return html`<span class=${'scroll-control '+side} part=${'scroll-control scroll-control-'+side} data-scroll=${side} data-rtl=${String(geometry.rtl)}><button class="scroll-button" part="scroll-button" type="button" aria-disabled=${available?nothing:'true'} aria-label=${side==='start'?snapshot.scrollStartLabel!:snapshot.scrollEndLabel!}
      @focus=${(event:FocusEvent)=>{if((event.currentTarget as Node).isConnected)this.#scrollFocused={side,button:event.currentTarget};}} @blur=${(event:FocusEvent)=>{if(this.#scrollFocused?.button===event.currentTarget){this.#scrollFocused=null;this.requestUpdate();}}}
      @click=${(event:MouseEvent)=>{if(!event.defaultPrevented&&(event.currentTarget as Node).isConnected&&snapshot===this.state)this.#overflow.page(side);}}><span class="scroll-icon" aria-hidden="true"><svg viewBox="0 0 320 512" focusable="false"><path fill="currentColor" d=${(side==='start')!==geometry.rtl?left:right}></path></svg></span></button></span>`;
  }
  protected render() {
    const snapshot=this.state;
    return html`<div class="frame" part="frame">${this.#scrollControl('start',snapshot)}${this.#list(snapshot)}${this.#scrollControl('end',snapshot)}</div>${snapshot.kind==='panels'?snapshot.items.map(item=>html`<section part="panel" id=${'panel-'+item.id} role="tabpanel" aria-labelledby=${'tab-'+item.id} tabindex="0" ?hidden=${snapshot.selected!==item.id}><slot name=${item.id}></slot></section>`):nothing}`;
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
