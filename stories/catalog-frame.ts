import regularFont from 'roboto-fontface/fonts/roboto/Roboto-Regular.woff2?url';
import mediumFont from 'roboto-fontface/fonts/roboto/Roboto-Medium.woff2?url';
import arabicFont from './assets/NotoSansArabic-Regular.ttf?url';
import {html} from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import type {Decorator} from '@storybook/web-components-vite';
import {catalogSettings,catalogPalettes} from './catalog-state.js';
/** App-like composition only; the production elements own all control markup and styling. */
export const catalogFrame:Decorator=(Story,context)=>{
  const settings=catalogSettings(context.globals);
  return html`<style>
    @font-face {font-family:Roboto;font-style:normal;font-weight:400;font-display:block;src:url(${regularFont}) format("woff2");}
    @font-face {font-family:Roboto;font-style:normal;font-weight:500;font-display:block;src:url(${mediumFont}) format("woff2");}
    @font-face {font-family:Noto;font-style:normal;font-weight:400;font-display:block;src:url(${arabicFont}) format("truetype");unicode-range:U+0600-06FF,U+0750-077F,U+0870-089F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF;}
    .catalog-frame {box-sizing:border-box;width:100%;margin:0 auto;padding:16px;min-height:160px;font:400 14px/1.4 Roboto,Noto,sans-serif;-webkit-font-smoothing:var(--ha-font-smoothing,antialiased);-moz-osx-font-smoothing:grayscale;color:var(--primary-text-color);background:var(--card-background-color);}
    .catalog-frame[data-motion=reduced] {--vyp-ha-motion-duration:0ms;}
    @media(prefers-reduced-motion:reduce){.catalog-frame {--vyp-ha-motion-duration:0ms;}}
    /* Explicit accessible demo accents; original HA palettes are measured independently. */
    .catalog-frame vyp-ha-button {--vyp-ha-primary:var(--primary-color);--vyp-ha-on-accent:var(--text-primary-color);--vyp-ha-danger:var(--error-color);--vyp-ha-success:var(--success-color);--vyp-ha-warning:var(--warning-color,#ffcc80);--vyp-ha-on-warning:#241b0c;}
    .catalog-frame[data-theme=light] vyp-ha-button {--vyp-ha-primary:#006fae;}
    .catalog-frame vyp-ha-field {--vyp-ha-primary:var(--primary-color);--vyp-ha-danger:var(--error-color);--vyp-ha-placeholder:var(--secondary-text-color);}
    .catalog-frame[data-theme=light] vyp-ha-field {--vyp-ha-primary:#00639c;--ha-color-form-background:#f3f3f3;--ha-color-form-background-disabled:#ccc;}
    .catalog-frame[data-theme=dark] vyp-ha-field {--vyp-ha-primary:#90caf9;--vyp-ha-danger:#ffb4ab;--ha-color-form-background:#363636;--ha-color-form-background-disabled:#363636;}
    .catalog-frame vyp-ha-select {--vyp-ha-primary:#00639c;--vyp-ha-text-secondary:var(--secondary-text-color);--vyp-ha-search-placeholder:var(--secondary-text-color);--ha-color-form-background:#f3f3f3;--ha-color-form-background-disabled:#ccc;}
    .catalog-frame[data-theme=dark] vyp-ha-select {--vyp-ha-primary:#90caf9;--vyp-ha-danger:#ffb4ab;--ha-color-form-background:#363636;--ha-color-form-background-disabled:#363636;--ha-color-fill-primary-normal-resting:#002e3e;--ha-color-fill-primary-normal-hover:#004156;--ha-color-fill-primary-normal-active:#002e3e;--ha-color-fill-primary-quiet-resting:#001721;--ha-color-fill-primary-quiet-hover:#002f44;--ha-color-fill-neutral-normal-resting:#303030;--wa-color-surface-border:#5e5e5e;}
    .example-content {padding:16px 0;} .example-content h2 {font-size:20px;margin:0 0 8px;} .example-content p {margin:0;}
    .example-form {display:grid;gap:16px;} .example-actions {display:flex;flex-wrap:wrap;gap:8px;}
    .example-actions > button {min-height:44px;padding:8px 16px;font:inherit;}
  </style><main class="catalog-frame" lang=${settings.locale} data-theme=${settings.theme} data-motion=${settings.motion}
    style=${styleMap({...catalogPalettes[settings.theme],maxWidth:settings.width+'px'})}>${Story()}</main>`;
};
