# Shared component library

The current source implements the DOM-independent navigation contract, one controlled upper
navigation/panel renderer and the tested quality/build foundation. The renderer passes direct
Chromium and clean actual-package browser consumers. Four navigation adapters now also pass real compiled package consumers. Other component families,
form bridges, framework SSR, Storybook, publication and consumer migrations remain required. The [primary Draft](../specs/shared-ui-foundation.md),
[capability catalog](../specs/CATALOG.md) and [feature issue #7](https://github.com/vypdev/ha-ui/issues/7)
hold the proposed contract and pending acceptance gates.

## Intended use

One Lit implementation exposes DOM components. Apps choose direct Lit/HTML use or a real React,
Vue, Angular or Svelte adapter. Proposed package names are @vypdev/ha-ui and the corresponding
-react, -vue, -angular and -svelte packages. Navigation exports and exact preview evidence are in
the [framework guide](framework-adapters.md); registry publication rights remain unverified.
A consumer installs only its own framework binding. Framework-native forms, events, complex values,
content projection and teardown require compiled tests, not just custom-element declarations.

```text
One core -> selected framework binding -> app-owned pages and workflows
         -> shared production-backed Storybook
```

Text equivalent: One core supplies the same visual behavior to a chosen framework and the catalog.
Gateway and Domus retain separate page composition, domain rules, data, permissions and routes.
Their shared navigation pattern is the upper HA-style dashboard bar. Domus still chooses household
sections such as Overview, Tasks, Calendar, Shopping, Inventory, Family and Settings as they become real.

## Components and catalog

The proposed families are tokens, typography, spacing, upper navigation, buttons, fields, selects,
checkboxes, cards, rows/grids, dialogs and feedback states. The one Storybook will use production
components with EN/ES, light/dark, narrow/wide, keyboard and reduced-motion examples. It will provide
reviewable PR artifacts and its own static GitHub Pages site; no site URL is claimed before delivery.
No private HA bundles, parent-frame DOM, storage, credentials or API access belong in this package.

## Compatibility and adoption

Exact supported versions, peer ranges, signatures and export paths are pending engineering verification.
Next.js, Nuxt and SvelteKit need explicit tested client/import boundaries; a generic Web Component
claim does not prove SSR or hydration support. The initial goal is a server shell with client-mounted
components, not universal server rendering of Shadow DOM.

The first navigation preview exercises the proposed DOM contract and reviewed Gateway dashboard
geometry. It does not establish broad extraction or a supported framework cohort. Before extending
extraction to additional families, verify the packed consumers for Lit/DOM and all four adapters,
retain the Gateway source/license baseline and MIT/asset notices, and extract behavior once. Actual Gateway and
Domus migrations happen under their own admitted repository work, using the same reviewed cohort.
Retire local duplicates only after equivalent app, recovery, locale and accessibility journeys pass.
Core/adapter publication, Storybook delivery and each app's acceptance are distinct gates.

## Quality and release

All authored behavior starts with tests and requires 100% supported statements, branches, functions
and lines globally and per module, with independent source inventory and executable architecture
constraints. The primary Draft allocates 64 distinct minimum cases. CI Check must aggregate
all required implemented checks on every PR head; the initial CI now validates all implemented source; broader browser support, adapter and adoption gates remain pending.
Record exact toolchain, source, lock, package digests and framework/browser results. Verify npm
publication rights before any publish. Preserve one tested previous app/cohort rollback and all user
data and original-operation recovery. Never overwrite an existing package version after partial delivery.

## Catalog validation

Bootstrap uses the unchanged original Copilot catalog SDK from the official source revision
`3e7ceea08e6131360e026937d1c0cc1b120472e0` used by the installed Action at preparation time.
The following three source files were byte-verified against that revision in an existing checkout:

| Original SDK file | SHA-256 |
|---|---|
| src/infrastructure/specification_catalog_validator.cjs | 7de4c036e5dee6477581502984d02037e6fd3bd3fa2f2434ef4dc862666365b1 |
| src/infrastructure/specification_catalog_publication.cjs | 92d31ff9a9ff7a9f8491dc492ccf7e1b039ba5d6ff0da43e7f252111b7e76d5b |
| src/domain/specification_catalog_path_policy.cjs | bb97e2432d97c61b5cc123adcdb43acc49f01d3bb52693d372c37829133ab139 |

These are external tool identities, not copied files or ha-ui implementation paths. No Copilot
source, generated workflow or installed resource is modified. For this bootstrap, use a reviewed
read-only Copilot checkout and an absolute target root. `COPILOT_SOURCE_ROOT` and `HA_UI_ROOT` below
are operator-selected absolute paths; the three files must match the verified source before use.
From the ha-ui repository, run with Node 24 or newer:

```bash
export HA_UI_ROOT="$PWD"
export COPILOT_SOURCE_ROOT="/absolute/path/to/reviewed/copilot"
node -e 'const path = require("node:path"); const sdk = require(path.join(process.env.COPILOT_SOURCE_ROOT, "src/infrastructure/specification_catalog_validator.cjs")); sdk.main(["--write"], process.env.HA_UI_ROOT);'
node -e 'const path = require("node:path"); const sdk = require(path.join(process.env.COPILOT_SOURCE_ROOT, "src/infrastructure/specification_catalog_validator.cjs")); sdk.main([], process.env.HA_UI_ROOT);'
```

Generation writes only the target generated index. Validation checks actual path/cardinality and
index agreement; it does not establish semantic completeness, native feature admission, implemented
behavior or release readiness. Do not run an absolute SDK CLI without the explicit target root:
its default root belongs to the external tool checkout. CI reads the same original SDK at its exact pinned revision; it validates rather than regenerates the index.
The local procedure above remains available for catalog maintenance. Do not invent or weaken a replacement
validator to turn missing evidence into acceptance.

## Next transition

Native issue #7 published the delivery companion on its exact managed branch before implementation.
Complete the component renderers, actual framework adapters/consumers, Storybook and staged delivery
acceptance on that branch, retaining all 64 baseline and six companion cases. The first source
contract and green incremental tests do not establish a complete component library or app adoption.

## First component contract: controlled upper navigation

Import `HaTabs` and `registerTabs` from `@vypdev/ha-ui/tabs`; call registration only at the
client boundary. It defines `vyp-ha-tabs` explicitly, preserves pre-upgrade property values,
allows repeated calls with the same constructor and rejects another installed constructor.
The root and contracts entrypoints stay DOM-independent. The component entrypoint is intended for clients. Lit may install its own DOM shim when imported
on a server; ha-ui does not define a tag there and rejects registration even with that shim. No server-rendered
Shadow DOM or framework hydration support is claimed.

Set the `state` property to the validated `NavigationState` contract. It is property-only;
serialized object attributes and HTML-string rendering are unsupported. Assignment validates
and snapshots before replacing the previous state. No programmatic assignment emits intent.
Each user action emits one cancelable, bubbling, composed `ha-selection-request` CustomEvent,
with frozen `{kind, id}` detail. Apps own selected state and routes. Canceling intent prevents
the original link navigation; unmodified accepted navigation retains the native anchor default.
Modified link clicks retain browser behavior and do not emit a selection request. Disabled
links have no target or tab stop. Stale DOM events during a pending state replacement are rejected.

Navigation renders a labeled `nav` with links and `aria-current=page`. Panels render a labeled
horizontal `tablist`, native button tabs and actual same-shadow-root labeled `tabpanel` sections.
Panel item IDs name light-DOM slots. Inactive panel wrappers are hidden, including slotted focus
targets. Arrow keys skip disabled tabs and wrap; Home/End move focus. RTL reverses horizontal
arrows. Activation is manual through native Enter/Space/click, while Tab follows normal focus
order. Null selection keeps a keyboard entry without silently selecting a panel.

The common 56px dashboard bar, 16px horizontal item padding, 2px current indicator and inset
focus outline adapt Gateway's MIT dashboard geometry. Domus still owns section names and layout.
Public CSS tokens are `--vyp-ha-font-family`, `--vyp-ha-border`, `--vyp-ha-surface`,
`--vyp-ha-tab-padding`, `--vyp-ha-text-secondary`, `--vyp-ha-text` and `--vyp-ha-primary`.
Defaults inherit the corresponding HA theme variables where available. Overrides update live;
no global styles, network, storage, timers or animation are introduced. Exposed shadow parts are
`bar`, `item` and `panel`. Navigation binding and packed browser evidence are in the [framework guide](framework-adapters.md);
forms, other families and the complete framework/client boundary matrix remain separate gates.

The interaction model follows [WAI-ARIA APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
and uses Lit's documented [reactive properties](https://lit.dev/docs/components/properties/)
and [events](https://lit.dev/docs/components/events/).
