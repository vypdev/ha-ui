# Compatibility and validation status

The DOM-independent navigation contract, controlled upper navigation/panel component and their
build/coverage foundation are implemented and tested in Chromium. Navigation, text-field form adapters, native-form buttons typed selects and boolean checkboxes for four frameworks pass real compiled package consumers. Other component
families and their form bridges, browser support breadth and framework SSR integration remain unaccepted.

| Tool | Exact pin | Current use |
|---|---|---|
| Node | 24.20.0 | Local validation and CI |
| pnpm | 10.34.0 | Frozen workspace install |
| TypeScript | 6.0.3 | Strict contract/type declarations; compatible candidate for Angular compiler-cli 22.2.4 |
| Vite | 8.3.5 | Test transform toolchain |
| Lit | 3.3.3 | Internal shared navigation, text-field, button, select and checkbox renderers |
| Vitest, browser provider and V8 coverage | 5.1.0 | Node and real Chromium; all four metrics globally and per authored runtime file |
| Storybook / Web Components / docs / a11y / Vitest addon | 10.6.5 | Real catalog with strict declaration-only compatibility patch |
| axe-core | 4.14.0 | All static locale/theme/width combinations |
| Playwright | 1.64.1 | Chromium 156.0.8078.4 component and clean packed-consumer tests |

The core preview coordinate/version is package: @vypdev/ha-ui at 0.1.0-next.1. It is unpublished;
its source currently contains presentation contracts, one preview navigation/panel component and
one controlled text field, a native-form button, typed single/multiple selects and a controlled checkbox. It is not a supported component release.
React 19.3.1, Vue 3.5.44, Angular 22.2.4 and Svelte 5.57.3 pass navigation, single-line text-field, button, select and checkbox compiled/browser
fixtures using actual packages. They remain preview pins until the complete component and delivery gates pass. Next.js, Nuxt and SvelteKit client/SSR boundaries remain unverified.
Do not infer support from custom-element interoperability or compiler metadata alone.

The controlled navigation model requires kind, label, selected and items. Kind is navigation or panels;
selected is an existing enabled item ID or null. IDs use 1..128 ASCII letters, digits, underscore or
hyphen; accessible labels contain 1..256 Unicode code points without C0, DEL, C1 or unpaired surrogate values.
At most 64 items are accepted, without truncation. Navigation items require an explicit HTTP(S) or
relative application link; panel items omit links and use item IDs for named panel slots.
Disabled defaults to false. Labels and links retain their original values; snapshots are deeply frozen.
Invalid/extra fields, conflicting selection and unsafe or credential-bearing links raise the bounded
NavigationInputError with code invalid_navigation. This validates data, not authorization or rendering.

CI Check runs for each PR head with no path filter. Current gates are strict types, all implemented
tests, independent source-inventory coverage, architecture/CI contracts, compiled declarations, real Chromium component behavior, actual reproducible packed consumption with
a DOM-free contract and a compiled browser client, and the original pinned Copilot catalog validator.
The packed browser fixture exercises real links, panel slots, keyboard, live Spanish labels/theme,
and reduced motion. The additional four framework fixtures establish navigation, text-field model/submission/validation/disabled/reset/lifecycle native button, boolean checkbox and typed single/multiple select behavior;
other control types, browser engines and framework SSR remain unverified.
Complete component-family/framework fixtures, public Storybook hosting, publication and actual app adoption remain required.
The [implemented catalog and static browser gates](storybook.md) cover only the current families.

The clean package fixture derives its runtime-only graph and integrity records from the reviewed
workspace lock, binds the actual tarball's integrity, and installs offline with a frozen lock. A fresh
metadata cache is selected and verified; the lock must remain byte-identical. A separate unlocked
negative fixture must reproduce the missing-metadata failure. This prevents developer cache contents
from making package acceptance pass when a fresh hosted runner cannot resolve the same dependency.

See [framework bindings](framework-adapters.md) for the exact preview API, compilation and teardown evidence.

The core text field uses native ElementInternals in Chromium. Native form submission,
required/length/custom validation, disabled fieldsets, readonly, reset and controlled edits are
covered. Four field framework bridges pass; other controls, other engines and the full library
acceptance remain unverified. Angular Forms is pinned to 22.2.4 alongside Angular Core.

The core button's scoped acceptance uses a real hidden native submitter with the one visible shadow
renderer. Native DOM and installed-package tests cover actual FormData/validation/default Enter,
cancellation, fieldset/legend rules, busy focus, reset and stale connection/owner prevention. This
is the documented [button equivalence](button-contract.md), not universal HTMLElement submitter
support. Four button framework bindings pass actual compiled consumers; other engines remain pending. The field's Enter path now
clicks the actual default submitter, preserving native application cancellation.


The selector has a DOM-free closed value/options/validation policy and one form-associated shared
renderer. The single size=1 picker now uses a native combobox button and separate popover listbox;
multiple/explicit list modes retain their native select pending the next visual increment. Typed
values, string FormData, controlled reset, validation, disabled owners and teardown retain the same
public policy across all four bindings. Current source/browser tests cover picker preview/commit,
clear, empty/unavailable selections and popup lifetime. The current reproducible five-package
cohort, four compiled framework consumers, 114 original HA visual comparisons and twelve catalog
form journeys across Chromium, Firefox and WebKit pass. Nine compiled scroll cases additionally
cover ordinary ancestors, enclosing shadow roots and slots in those engines. The selector's small raster differences
and remaining family/browser scope are explicit in [visual acceptance](visual-parity.md).
Details are in the [select contract](select-contract.md).

Appearance is an independent required gate: see [HA visual equivalence](visual-parity.md). Checkbox calibration and local font identity do not accept the other families.
