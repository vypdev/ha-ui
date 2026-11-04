# Home Assistant UI

Shared presentation components for Home Assistant applications, including Gateway and Domus.

The first source increment implements the DOM-independent navigation data contract and a pinned,
tested build/coverage foundation. Rendered components, the React/Vue/Angular/Svelte adapters,
compiled framework consumers, Storybook and publication remain required and unimplemented.
No package is published or ready for application adoption.

Use Node 24.20.0 and the package manager pinned in package.json:

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm check
pnpm test
pnpm build
pnpm test:package
```

The contract validates controlled navigation or panel inputs without reading browser globals,
choosing application routes or accepting rendering callbacks. See the
[component guide](docs/component-library.md), [compatibility status](docs/compatibility.md),
[source provenance](docs/provenance.md), [foundation](specs/shared-ui-foundation.md),
[delivery companion](specs/shared-ui-framework-delivery.md) and [capability catalog](specs/CATALOG.md).
[Issue #7](https://github.com/vypdev/ha-ui/issues/7) retains all 64 baseline cases and six delivery
refinements. Clean checks on this increment do not complete that scope.
