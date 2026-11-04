# Compatibility and validation status

Only the DOM-independent navigation input contract and its build/coverage foundation are implemented.
No rendered component, framework adapter or framework SSR support is currently accepted.

| Tool | Exact pin | Current use |
|---|---|---|
| Node | 24.20.0 | Local validation and CI |
| pnpm | 10.34.0 | Frozen workspace install |
| TypeScript | 6.0.3 | Strict contract/type declarations; compatible candidate for Angular compiler-cli 22.2.4 |
| Vite | 8.3.5 | Test transform toolchain |
| Vitest and V8 coverage | 5.1.0 | All four metrics globally and per authored runtime file |

The core preview coordinate/version is package: @vypdev/ha-ui at 0.1.0-next.1. It is unpublished;
its source currently contains presentation data contracts only. It is not a supported component release.
React 19.3.1, Vue 3.5.44, Angular 22.2.4 and Svelte 5.57.3 remain candidate pins until actual packed,
compiled/browser fixtures pass. Next.js, Nuxt and SvelteKit client/SSR boundaries remain unverified.
Do not infer support from custom-element interoperability or compiler metadata alone.

The controlled navigation model requires kind, label, selected and items. Kind is navigation or panels;
selected is an existing enabled item ID or null. IDs use 1..128 ASCII letters, digits, underscore or
hyphen; accessible labels contain 1..256 Unicode code points without C0, DEL, C1 or unpaired surrogate values.
At most 64 items are accepted, without truncation. Navigation items require an explicit HTTP(S) or
relative application link; panel items omit links and use item IDs for future named panel slots.
Disabled defaults to false. Labels and links retain their original values; snapshots are deeply frozen.
Invalid/extra fields, conflicting selection and unsafe or credential-bearing links raise the bounded
NavigationInputError with code invalid_navigation. This validates data, not authorization or rendering.

CI Check runs for each PR head with no path filter. Current gates are strict types, all implemented
tests, independent source-inventory coverage, architecture/CI contracts, compiled declarations, actual reproducible packed-contract consumption without DOM types,
and the original pinned Copilot catalog validator. Browser, packed framework fixtures, Storybook, publication
and actual application acceptance must be added with their implementations before release readiness.
