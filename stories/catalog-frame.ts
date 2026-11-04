import regularFont from 'roboto-fontface/fonts/roboto/Roboto-Regular.woff2?url';
import mediumFont from 'roboto-fontface/fonts/roboto/Roboto-Medium.woff2?url';
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
    .catalog-frame {box-sizing:border-box;width:100%;margin:0 auto;padding:16px;min-height:160px;font:400 14px/1.4 Roboto,Noto,sans-serif;-webkit-font-smoothing:var(--ha-font-smoothing,antialiased);-moz-osx-font-smoothing:grayscale;color:var(--primary-text-color);background:var(--card-background-color);}
    .catalog-frame[data-motion=reduced] {--vyp-ha-motion-duration:0ms;}
    @media(prefers-reduced-motion:reduce){.catalog-frame {--vyp-ha-motion-duration:0ms;}}
    .example-content {padding:16px 0;} .example-content h2 {font-size:20px;margin:0 0 8px;} .example-content p {margin:0;}
    .example-form {display:grid;gap:16px;} .example-actions {display:flex;flex-wrap:wrap;gap:8px;}
    .example-actions > button {min-height:44px;padding:8px 16px;font:inherit;}
  </style><main class="catalog-frame" lang=${settings.locale} data-theme=${settings.theme} data-motion=${settings.motion}
    style=${styleMap({...catalogPalettes[settings.theme],maxWidth:settings.width+'px'})}>${Story()}</main>`;
};
