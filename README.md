# Home Assistant UI

Shared presentation components for Home Assistant applications, including Gateway and Domus.

The current preview implements upper navigation/local panels, controlled text fields, native-form
buttons, typed single/multiple selects, boolean checkboxes, native dialogs, card surfaces, passive rows, responsive grids and feedback states. React, Vue, Angular and Svelte
bindings pass source and compiled installed-package consumers. The pinned build/coverage foundation
and production-backed [Storybook](docs/storybook.md) verify the implemented scope.

[Visual equivalence with HA](docs/visual-parity.md) is verified against recorded originals for
the implemented states. Chromium, Firefox and WebKit exercise the compiled catalog. Production
Next.js, Nuxt and SvelteKit fixtures verify the server and client boundary. Public catalog
hosting, package publication and Gateway/Domus adoption remain open.

Use Node 24.20.0 and the package manager pinned in package.json:

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm check
pnpm exec playwright install --with-deps chromium --only-shell
pnpm exec playwright install --with-deps firefox webkit
pnpm test
pnpm build
pnpm test:package
pnpm test:ssr
pnpm storybook:build
pnpm test:storybook
pnpm test:engines
```

The contract validates controlled navigation or panel inputs without reading browser globals,
choosing application routes or accepting rendering callbacks. See the
[component guide](docs/component-library.md), [compatibility status](docs/compatibility.md),
[framework bindings](docs/framework-adapters.md), [adoption guide](docs/migration.md), [source provenance](docs/provenance.md), [foundation](specs/shared-ui-foundation.md),
[delivery companion](specs/shared-ui-framework-delivery.md) and [capability catalog](specs/CATALOG.md).
[Issue #7](https://github.com/vypdev/ha-ui/issues/7) retains all 64 baseline cases and six delivery
refinements. Clean checks on this increment do not complete that scope.
