# Home Assistant UI

Shared presentation components for Home Assistant applications, including Gateway and Domus.

The current preview implements upper navigation/local panels, controlled text fields, native-form
buttons, typed single/multiple selects and boolean checkboxes. React, Vue, Angular and Svelte
bindings pass source and compiled installed-package consumers. The pinned build/coverage foundation
and production-backed [Storybook](docs/storybook.md) verify the implemented scope.

[Visual equivalence with HA](docs/visual-parity.md) is an independent required gate. Checkbox
calibration and font identity are recorded; the other families still need the same direct comparison
and any corrections. Remaining families, full framework SSR/browser coverage, public catalog hosting,
publication and actual application adoption remain required. No package is published or ready for
application adoption.

Use Node 24.20.0 and the package manager pinned in package.json:

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm check
pnpm exec playwright install --with-deps chromium --only-shell
pnpm test
pnpm build
pnpm test:package
pnpm storybook:build
pnpm test:storybook
```

The contract validates controlled navigation or panel inputs without reading browser globals,
choosing application routes or accepting rendering callbacks. See the
[component guide](docs/component-library.md), [compatibility status](docs/compatibility.md),
[framework bindings](docs/framework-adapters.md), [source provenance](docs/provenance.md), [foundation](specs/shared-ui-foundation.md),
[delivery companion](specs/shared-ui-framework-delivery.md) and [capability catalog](specs/CATALOG.md).
[Issue #7](https://github.com/vypdev/ha-ui/issues/7) retains all 64 baseline cases and six delivery
refinements. Clean checks on this increment do not complete that scope.

Appearance is an independent required gate: see [HA visual equivalence](docs/visual-parity.md). Checkbox calibration and local font identity do not accept the other families.
