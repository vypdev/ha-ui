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
ui-catalog.css lines143–146. Automatic multiple and larger single sizes retain that geometry.
Explicit dropdowns and lists use separately measured Home Assistant surfaces. Their typed
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

The chip/search and visible-list references record their own module and asset identities in
[multiple dropdown evidence](evidence/ha-select-multiple-reference.json) and
[visible-list evidence](evidence/ha-select-list-reference.json). The explicit radio and checkbox
lists reuse the attributed checkbox mark and public helper/text geometry, with one shared
native-form bridge. The exact source paths and license notices are in `packages/core/NOTICE`.

The native dialog adapts HA's dialog, header, footer, scroll fades and close action. The
[original dialog evidence](evidence/ha-dialog-reference.json) records the public app digest,
module entries, fonts and every loaded asset. The reviewed Apache 2.0 source and the MDI
close glyph are listed in the core notice. The authored renderer names the native modal,
keeps dialog commands controlled and delegates to the existing shared button.

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
identities are recorded with the reference. Vite bundles these two Roboto files locally.
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

## Measured HA card

The card adapts the Apache 2.0 [Home Assistant card styles](https://github.com/home-assistant/frontend/blob/027d9578ec9663b8aa22f50c24274a7cd9d001c1/src/components/ha-card.ts)
for its surface, title, content and optional footer. The [reference record](evidence/ha-card-reference.json)
identifies the separately captured public app, component module, themes and original images.
The shared renderer adds a native article and configurable native heading, slot lifecycle and
a footer that accommodates the shared button's native hit target. It does not import the
Home Assistant runtime. The core NOTICE records the upstream attribution and modifications.

## Measured HA row and grid layout

The passive row follows the [HA Material list-item wrapper](https://github.com/home-assistant/frontend/blob/99d2742f4abab0d1e74c2f68393c9768bf0a8dfd/src/components/ha-md-list-item.ts).
Grid tracks and gaps follow the [HA Lovelace grid](https://github.com/home-assistant/frontend/blob/027d9578ec9663b8aa22f50c24274a7cd9d001c1/src/panels/lovelace/cards/hui-grid-card.ts).
The [layout reference](evidence/ha-layout-reference.json) fingerprints the actual installed
public modules independently of those source links. Shared projection, semantics, and
container-based track reduction are authored here. No HA or Material Web runtime is copied.

For Arabic glyphs, the catalog ships the unmodified hinted Regular TTF from
[Noto Sans Arabic 2.013](https://github.com/notofonts/arabic/releases/tag/NotoSansArabic-v2.013),
commit `1b2b7e5c6ce3ab4d50681c854892325530084c35`. The file SHA-256 is
`bdff3e5659d67e67def05b33f749683b9376ae819d65d3dd62ac4640b3aaef48`.
The [original SIL Open Font License 1.1](../LICENSES/Noto-Sans-Arabic-OFL-1.1.txt)
is shipped with the catalog. The reference harness maps these bytes to the existing Noto
fallback for Arabic code points in both original and candidate captures. This holds browser
font input constant across runners. The SDK packages do not ship or fetch this font.

## Measured HA feedback

The notice and spinner comparisons use the actual installed public `ha-alert` and
`ha-spinner` modules. Empty-state comparisons use the compiled `ha-empty-state`
from the [official Home Assistant frontend 20261028.4 wheel](https://pypi.org/project/home-assistant-frontend/20261028.4/).
The [reference manifest](evidence/ha-feedback-reference.json) records the two independent
sources, asset digests, engines, themes, geometry and original screenshots. All captures use
fictional content. The harness uses the public module loader and makes no application API calls.
The spinner capture freezes animation to compare its visible resting state. For Arabic notice
headings, the fixture applies the same right-to-left alignment token as the original app.
The core NOTICE records the Apache 2.0, MIT and Material Design Icons attributions.

## Candidate integrity and recovery

The packing gate checks the exact running Node and pnpm versions, the supported Angular
compiler and TypeScript pair, and the frozen dependency snapshot before creating archives.
Before testing or hashing, the packer sets the operating-system byte in the unstamped
gzip header to the [RFC 1952 default](https://www.rfc-editor.org/rfc/rfc1952.html#section-2.3.1).
This makes the same tar and compressed payload produce the same package bytes on macOS
and Linux. Accepted archives are verified and promoted byte for byte.
The `captureCandidate` policy binds the five archive digests and sizes to the reviewed
source revision and lock. `verifyCandidate` fails before use if any bytes, revision or
lock change. `assertShippedManifest` requires exact version pins for the shared cohort
and rejects local fixture references in shared dependencies and overrides.

Stable publication requires separate Gateway and Domus evidence for the same candidate.
The npm prerelease publishes reviewed packed artifacts so that those applications can
complete installed acceptance. Both channels require an authorized publisher. Registry observations are stored for the exact
coordinate, version and digest. Recovery reads before attempting a missing publication
and checks the observed digest before recording it. A conflict remains blocked; a partial
publication leaves consumer pins unadvanced. An uncertain attempt is inspected once, and
a later run rechecks the registry before publishing. The delivery tests exercise this
policy with a deterministic provider; no registry publication or publisher rights are
claimed by those tests.

### Publish a prerelease to npm

The core and the four adapters share one exact version. Prepare the package manifests
and packed consumer pins in a reviewed version change, including the Angular core
dependency and the fixture lockfiles. Merge it to the production
branch and wait for its `CI Check` to succeed. Create a version tag such as
`v0.1.0-next.1` at that production commit. [The npm workflow](../.github/workflows/npm_release.yml)
starts automatically and uses the five tarballs retained by CI for that SHA.

Configure an npm Trusted Publisher for each coordinate in the table below. Use
organization `vypdev`, repository `ha-ui`, workflow `npm_release.yml`, and environment
`npm`. Enable direct publishing for that workflow. npm authorizes each write and
generates provenance from the GitHub runner.

| Package | Intended installation |
| --- | --- |
| `@vypdev/ha-ui` | Lit or browser custom elements |
| `@vypdev/ha-ui-react` | React |
| `@vypdev/ha-ui-vue` | Vue |
| `@vypdev/ha-ui-angular` | Angular |
| `@vypdev/ha-ui-svelte` | Svelte |

The workflow publishes the core first and sets the npm `next` tag. It downloads the
exact version of each package and checks its SHA-256 against the CI artifact before
reporting success. If a run stops after publishing some packages, rerun the same
workflow. Existing versions are verified by hash and reused. An unexpected hash
requires a new reviewed package version. Keep consumer pins on the previous cohort
until the workflow confirms all five archives.

See [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) for configuring
the publisher and [consumer adoption](migration.md) for testing the installed version.
