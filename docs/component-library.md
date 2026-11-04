# Shared component library

The first source increment implements the DOM-independent navigation data contract and its
tested quality/build foundation. Rendered components, adapters, Storybook and consumer migrations
are not implemented or published yet. The [primary Draft](../specs/shared-ui-foundation.md),
[capability catalog](../specs/CATALOG.md) and [feature issue #7](https://github.com/vypdev/ha-ui/issues/7)
hold the proposed contract and pending acceptance gates.

## Intended use

One Lit implementation exposes DOM components. Apps choose direct Lit/HTML use or a real React,
Vue, Angular or Svelte adapter. Proposed package names are @vypdev/ha-ui and the corresponding
-react, -vue, -angular and -svelte packages; registry rights and actual exports remain unverified.
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

Before extraction, verify packed consumers for Lit/DOM and all four adapters. Then pin the Gateway
source/license baseline, retain MIT and asset notices, and extract behavior once. Actual Gateway and
Domus migrations happen under their own admitted repository work, using the same reviewed cohort.
Retire local duplicates only after equivalent app, recovery, locale and accessibility journeys pass.
Core/adapter publication, Storybook delivery and each app's acceptance are distinct gates.

## Quality and release

All authored behavior starts with tests and requires 100% supported statements, branches, functions
and lines globally and per module, with independent source inventory and executable architecture
constraints. The primary Draft allocates 64 distinct minimum cases. CI Check must aggregate
all required implemented checks on every PR head; the initial CI now validates all implemented source; unimplemented browser/adapter/adoption gates remain pending.
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
