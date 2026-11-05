# Source and asset provenance

The repository and core package carry the MIT notice, copyright 2026 vypdev. The notice is retained
from [Gateway at e47dde303e475a6d03e1d6697ec87a934e93263b](https://github.com/vypdev/homeassistant-gateway/blob/e47dde303e475a6d03e1d6697ec87a934e93263b/LICENSE).
The first contract increment extracted no visual components or assets. The upper navigation increment
adapts the reviewed dashboard geometry from
[ui-catalog.css lines 105–121 at that revision](https://github.com/vypdev/homeassistant-gateway/blob/e47dde303e475a6d03e1d6697ec87a934e93263b/frontend/src/ui/ui-catalog.css#L105-L121):
56px bar, 16px horizontal padding, 2px current indicator, horizontal overflow and inset visible focus.
The standalone DOM semantics, validation, events and controller are authored in ha-ui. No private HA
component, font, icon or external asset is imported. The MIT notices are retained. Other families
need their own reviewed source/asset inventory before extraction and publication.

The coverage policy and its negative unit fixtures are adapted from the same organization's MIT
[Domus coverage policy](https://github.com/vypdev/domus/blob/8c0a36c0b9804bdaf33a301a4dc85ae3dc12ee21/tooling/frontend-coverage.mjs)
and [policy tests](https://github.com/vypdev/domus/blob/8c0a36c0b9804bdaf33a301a4dc85ae3dc12ee21/tests/node/frontend-coverage.test.mjs).
The adaptation accepts multiple source directories so every package and authored tool is inventoried
independently of test imports. It is project-owned validation code, not a copied UI implementation.

Catalog validation reads the unchanged original three-file Copilot SDK at revision
3e7ceea08e6131360e026937d1c0cc1b120472e0. CI checks out only those original files into an ignored
validation directory and calls the public main function with this repository's explicit root.
It does not change Copilot source or installed resources. Source hashes and the local procedure are
in the [component guide](component-library.md#catalog-validation). Catalog consistency, implemented
coverage, actual framework execution, publication rights and application adoption are separate facts.

The four navigation adapters are authored in this repository and carry the same MIT notice.
They add framework lifecycle/property/event/content bindings; none contains visual styles or a
second navigation controller. Angular packaging retains its authored source and uses standard FESM,
partial declarations and an exact tslib dependency. React/Vue include their source/declaration maps;
Svelte includes source, preprocessed components and generated declarations. Third-party compilers,
frameworks and helpers retain their own package licenses; no third-party runtime source is copied here.

The first text-field increment adapted the 56px field minimum height, 16px padding, 6px label/help gaps
and 14px/12px text geometry from
[Gateway ui-catalog.css lines 143–150 at the same revision](https://github.com/vypdev/homeassistant-gateway/blob/e47dde303e475a6d03e1d6697ec87a934e93263b/frontend/src/ui/ui-catalog.css#L143-L150).
Form ownership, controlled requests, validation, composition handling and accessible native input
semantics are authored here. The later filled-field calibration below replaces this initial geometry.

The four text-field bindings and Angular value-accessor/validator bridge are authored here. They
reuse the pure core event/value/validation policies and the existing core renderer, adding no CSS
or alternative controller. Angular Forms 22.2.4 is an exact framework peer; its runtime source is
not copied. Source-browser policy aliases are test-only; actual frozen package consumers resolve
installed exports and verify authored source bytes against the repository.

The filled-field calibration adapts public HA `src/components/input/ha-input.ts` and
`wa-input-mixin.ts` at reviewed revision `027d9578ec9663b8aa22f50c24274a7cd9d001c1`, plus
input/form-control styles in the same reviewed `@home-assistant/webawesome` 3.14.0-ha.2
artifact used for buttons and overflow. The HA Apache 2.0 and Web Awesome MIT texts and
modifications are retained in `packages/core/NOTICE` and `packages/core/LICENSES`. No upstream
runtime is imported into the product. The [field reference](evidence/ha-field-reference.json)
records original public assets, fonts, themes and the explicit single-required-marker fixture
configuration matching live HA observation. Original captures and measurements remain independent
of the authored renderer. Native form bookkeeping, controlled state, combined help/error
association, accessible fallback colors and OS motion handling are authored in ha-ui.

The Storybook catalog and fixtures are authored here and import production package entrypoints.
Storybook 10.6.5 and its official addons declare MIT licenses; their distributed manager assets
remain dependency assets rather than copied package code. The pinned pnpm patch changes only one
line of `@storybook/web-components/dist/index.d.ts` to repair its inherited constraint. The upstream
package is [Storybook Web Components 10.6.5](https://www.npmjs.com/package/@storybook/web-components/v/10.6.5).
The original tarball and all regular members were compared with the installed package: 36 files,
including every JavaScript file, stayed byte-identical. Strict positive/negative declaration tests
remain enabled. See the [catalog guide](storybook.md#pinned-declaration-compatibility-patch).

The catalog contrast check found the prior light error fallback below AA for 12px text. The authored
renderer and fictional palette now use `#b3261e`; public HA/custom theme overrides still apply.
The authored focus handler fully reveals a partially visible focused navigation/tab destination
with nearest, instant scrolling. Both changes are tested once in the common implementation.

The button's pill geometry, gap, padding, typography, visual variants and spinner are adapted from
[Gateway ui-catalog.css lines 123–142 at the reviewed MIT revision](https://github.com/vypdev/homeassistant-gateway/blob/e47dde303e475a6d03e1d6697ec87a934e93263b/frontend/src/ui/ui-catalog.css#L123-L142).
Compact/default targets are raised to 44 px; large and extra-large remain 48/56 px. Accessible
controlled state, reduced motion, inert icon projection, typed requests and the exposed native
submitter bridge are authored here. The fixture icon is a text glyph, with no imported asset.
The source/license notice remains unchanged. The catalog supplies tested accent/on-accent theme
pairs, instead of assuming every host-supplied pair meets contrast.

The four button bindings are authored here. They use the DOM-independent request validator and
the one registered core renderer. Their framework lifecycle and decorative projection glue adds
no copied third-party component, CSS or second native-form controller.


The initial native selector adapts the same reviewed Gateway MIT field/select geometry at
ui-catalog.css lines143–146. Native multiple/explicit list modes retain that initial geometry while
the filled single picker is calibrated separately against recorded public HA modules. Its typed
primitive policies, successful repeated entries, controlled requests/reset, restoration and four
framework bindings are authored here.

The single filled picker adapts HA `ha-select`, `ha-picker-field`, `ha-combo-box-item`, `ha-dropdown`
and `ha-dropdown-item` at the reviewed HA source revision above (Apache2.0), plus the reviewed Web
Awesome dropdown styles (MIT). Original lazy selector entry6132 and every loaded public asset are
fingerprinted in the [select reference](evidence/ha-select-reference.json). Each state uses a fresh
document and unchanged original component functions. The source revision is not represented as the
installed revision. Placeholder/error inputs use the documented public nested picker properties;
the original wrapper does not forward them. Native combobox/listbox semantics, data-only keyboard
preview, controlled form behavior and popup lifetime/positioning are authored here.

The decorative menu-down and close paths are unmodified Material Design Icons7.4.47. Their
[versioned upstream license](https://github.com/Templarian/MaterialDesign-JS/blob/v7.4.47/LICENSE)
assigns Apache2.0 to icons; the original Pictogrammers license and existing full Apache text are
retained in the core package. Both paths were compared with the versioned `mdi.js` source. No icon
pack, upstream component runtime, HA API, remote font loader or private application state is imported.

## Measured HA checkbox and catalog fonts

The checkbox's earlier browser-native preview was replaced with the visible geometry and states
observed in the actual HA public ha-checkbox component. The reviewed upstream reference is
[ha-checkbox at 027d9578](https://github.com/home-assistant/frontend/blob/027d9578ec9663b8aa22f50c24274a7cd9d001c1/src/components/ha-checkbox.ts),
under Apache 2.0. The [measurement record](evidence/ha-checkbox-reference.json) fingerprints the
installed public bundles separately; it does not equate that upstream commit with the installed
revision. The core package retains NOTICE and LICENSES/Home-Assistant-Apache-2.0.txt. Adaptations
keep one controlled native input/ElementInternals model, a 44px invisible target and authored
validation/request handling; no HA or Web Awesome runtime is copied or imported.

The embedded unmodified check path is Font Awesome Free 7.0.0, Copyright 2025 Fonticons, Inc.,
[check.svg](https://github.com/FortAwesome/Font-Awesome/blob/7.0.0/svgs/solid/check.svg). Its icon
license is CC BY 4.0. Attribution remains in source and the shipped NOTICE, with the original
Font Awesome license in LICENSES/Font-Awesome-Free-7.0.0.txt. The simple mixed-state line is
authored here. Other authored component/controller code remains under the repository MIT notice.

Catalog font assets come from roboto-fontface 0.10.0, the exact package declared by the reviewed
HA frontend. Regular and Medium WOFF2 files were byte-compared with the actual HA responses; their
identities are recorded with the reference. Vite bundles only the two referenced files locally.
LICENSES/Roboto-Apache-2.0.txt preserves the package's Apache 2.0 license in the static catalog.
These are catalog/app font assets; the shared renderer makes no remote request.

The core package SPDX expression is `(MIT AND Apache-2.0 AND CC-BY-4.0)` to represent its
authored code and bundled attributed visual material. Adapter packages retain their own MIT
license and depend on that core; they include no alternative copy of these visual assets.

## Measured HA dashboard text tabs

The dashboard text-tab revision adapts Apache 2.0 HA `ha-tab-group`, `ha-tab-group-tab` and
`hui-root` styles at reviewed source `027d9578ec9663b8aa22f50c24274a7cd9d001c1`. Their source
links and modifications are retained in the core package NOTICE. The [reference record](evidence/ha-navigation-reference.json)
fingerprints the actual installed public assets independently; the upstream commit is not
represented as the installed revision. Native anchors/buttons, controlled intent, real panel
relationships, lifecycle and instant focus scrolling remain authored here. The published library
imports no HA, Web Awesome or Sortable runtime. The reference fixture exposes the public module
loader instead of running the app entrypoint; it does not alter the referenced component modules.
Its original unedited images are test evidence, not SDK runtime assets.


Overflow styling additionally adapts the published `@home-assistant/webawesome@3.14.0-ha.2`
MIT artifact (gitHead `8d81b1edf416b889fbbeaf9093c77300f30a68c2`). The original full notice is
shipped as `LICENSES/Web-Awesome-3.14.0-ha.2-MIT.txt` and checked in the actual core archive.
The two unmodified Font Awesome Free 7.0.0 chevron paths retain their CC BY 4.0 attribution
and license. The package NOTICE names both official SVG sources and all modifications.
This is style adaptation with authored geometry/gesture policy; no new runtime dependency
or external icon/font loader is introduced.

Button/spinner visual calibration uses the unchanged public HA button component and the same
published Web Awesome artifact as navigation. Source links, copyright headers, public icon-only
composition and modifications are retained in the core NOTICE. The native 44px target and its
separate painted surface, controlled form behavior and local projection are authored here.
No additional runtime package, external icon loader or font request is introduced.
