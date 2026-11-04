# Home Assistant UI

Shared presentation components for Home Assistant applications, including Gateway and Domus.

The current source implements a DOM-independent navigation data contract, one controlled HA-style
upper navigation/panel component and a pinned, tested build/coverage foundation. React, Vue, Angular
and Svelte navigation bindings now pass real compiled, packed consumers.
Other component families, form bridges, framework SSR boundaries, Storybook, publication and actual
application adoption remain required.
No package is published or ready for application adoption.

Use Node 24.20.0 and the package manager pinned in package.json:

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm check
pnpm exec playwright install --with-deps chromium --only-shell
pnpm test
pnpm build
pnpm test:package
```

The contract validates controlled navigation or panel inputs without reading browser globals,
choosing application routes or accepting rendering callbacks. See the
[component guide](docs/component-library.md), [compatibility status](docs/compatibility.md),
[framework bindings](docs/framework-adapters.md), [source provenance](docs/provenance.md), [foundation](specs/shared-ui-foundation.md),
[delivery companion](specs/shared-ui-framework-delivery.md) and [capability catalog](specs/CATALOG.md).
[Issue #7](https://github.com/vypdev/ha-ui/issues/7) retains all 64 baseline cases and six delivery
refinements. Clean checks on this increment do not complete that scope.
