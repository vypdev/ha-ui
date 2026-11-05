# Examples backed by installed packages

The repository tests are runnable examples. They install the built archives in isolated
directories, use framework compilers and exercise the resulting applications in a browser.

| Consumer | Fixture |
|---|---|
| Native DOM and DOM-free Node contract | [Packed consumer test](../../tests/consumers/packed.test.ts) |
| React | [Client](../../tests/consumers/fixtures/react/client.ts) |
| Vue | [Client](../../tests/consumers/fixtures/vue/client.ts) |
| Angular AOT and the official linker | [Client](../../tests/consumers/fixtures/angular/client.ts) |
| Svelte | [Client](../../tests/consumers/fixtures/svelte/Consumer.svelte) |
| Next.js | [Server page](../../tests/consumers/ssr/fixtures/next/app/page.jsx) and [client boundary](../../tests/consumers/ssr/fixtures/next/app/boundary.jsx) |
| Nuxt | [Server shell](../../tests/consumers/ssr/fixtures/nuxt/app/app.vue) and [client control](../../tests/consumers/ssr/fixtures/nuxt/app/components/ClientTabs.client.vue) |
| SvelteKit | [Server shell and mount](../../tests/consumers/ssr/fixtures/sveltekit/src/routes/+page.svelte) |

From the repository root with its pinned Node and pnpm, run:

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm exec playwright install --with-deps chromium --only-shell
pnpm test:package
pnpm test:ssr
```

Inspect `test-results/packed-cohort.json`, `test-results/packed-frameworks.json` and
`test-results/packed-ssr.json` for the exact versions, archive digests and exercised scope.
The paths in fixture manifests refer to the isolated pack directory; use
[the adoption guide](../../docs/migration.md) for a shipped application's dependency pins.
