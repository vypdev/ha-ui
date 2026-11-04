# Shared component catalog

The current catalog displays the implemented upper navigation, local panels and single-line text
field, button, boolean checkbox and typed single/multiple select using the real package entrypoints. Fifty CSF stories have automatic documentation,
controls, interaction tests and accessibility checks. This is an incremental preview; other
families, the full framework/SSR/browser matrix and application adoption are still required.

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm exec playwright install --with-deps chromium --only-shell
pnpm storybook:build
pnpm test:storybook
pnpm storybook:preview
```

The last command serves the complete static catalog at `http://localhost:6006/ha-ui/`.
`pnpm storybook` runs the editable development catalog. Neither mode connects to Home Assistant,
uses household records or requires a token. All household content is fictional. Fonts and assets
are local to the static build; the browser gate rejects external requests and failed asset loads.

## What to inspect

| Catalog section | Production API | Significant states |
|---|---|---|
| Navigation / Household sections | `@vypdev/ha-ui/tabs`, `kind: navigation` | Current link, disabled, empty, long labels, narrow overflow |
| Tabs / Local panels | The same renderer, `kind: panels` | Named slots, manual keyboard activation, disabled and unselected |
| Buttons / Actions | `@vypdev/ha-ui/button` | Eight variants, native submit/reset, busy, pressed, icon-only, disabled and canceled |
| Forms / Text field | `@vypdev/ha-ui/field` | Controlled draft, native submit/reset, required, readonly, disabled and error |
| Forms / Checkbox | `@vypdev/ha-ui/checkbox` | Boolean checked, independent mixed state, required, disabled/error, cancellation, custom payload, long labels and reset |
| Forms / Select | `@vypdev/ha-ui/select` | Typed single/multiple values, required, disabled/error, unavailable/disabled options, empty, cancellation and reset |

The toolbar chooses English/Spanish, light/dark, narrow/wide and reduced/system motion. Unsupported
locale values fall back to English. System reduced-motion preferences are always respected. The
controls table supplies example inputs; each example owns its temporary application state and
acknowledges typed component intent. Controls and toolbar updates recreate the example with the
chosen inputs. No preference, form value or selected route is persisted.

`ha-selection-request` is cancelable and carries immutable `{kind, id}` detail. The example
intercepts section links and supplies the next validated state. Local panels project real named
slots matching item IDs. `ha-value-request` carries immutable `{value, reason}` detail; the field
example validates it, updates its own draft and submits actual `FormData`. The form's
submit/reset actions now use the actual shared button and its exposed native submitter.

The public state properties, validation rules, events, slots and theme tokens are described in the
[component API](component-library.md#first-component-contract-controlled-upper-navigation).
[Framework usage](framework-adapters.md) covers React, Vue, Angular Forms and Svelte. Those bindings
use these same renderers; the catalog does not duplicate their markup or claim SSR support.

## Verification and coverage

`pnpm test` executes every CSF story in Chromium through the official Vitest addon. Accessibility
violations fail the test. Runtime example composition, locale policy, palettes, decorator and
preview setup join all package/tool source in the independent inventory and require 100% of all
four supported coverage metrics per file and globally. CSF files are test definitions, like browser
test files: Vitest excludes collected test modules from coverage. Their render functions are
imported from independently measured `*.example.ts` modules; architecture checks prohibit inline
renderers or duplicate control markup in those test definitions. No runtime example is excluded.

The static gate builds the manager, autodocs and previews, then serves only the repository base
`/ha-ui/`. It checks 64 locale/theme/width combinations with axe, real focus/overflow and manual
panel activation, native form editing/validation/submit/reset, controls-driven value changes and
all four manager toolbar settings. It records original screenshots and `test-results/storybook/evidence.json`.
The contrast and partial-focus regressions fail against the earlier renderer and pass after the
shared fixes. No additional browser engine, owner HA installation or human acceptance is inferred.

## Delivery

Every PR update runs `CI Check`, including strict types, full coverage, compiled package consumers,
static catalog build and the static browser gate. Its retained artifact includes `build/storybook/`,
coverage and browser evidence. This makes a candidate reviewable before merge. The separate Pages
workflow builds and rechecks trusted `master` before upload; only its deployment job receives Pages
write and OIDC permission. It never executes PR code with deployment permissions.

The intended public destination is the repository Pages subpath `/ha-ui/`. Public hosting is pending
until the complete feature can merge and Pages is enabled for Actions. The existence of a workflow
or a passing local build does not establish a deployed site. Do not merge an incomplete feature to
publish a preview, and do not treat Storybook delivery as package publication or app adoption.

## Pinned declaration compatibility patch

Storybook 10.6.5 is exact in the frozen lock. Its Web Components declaration has an inconsistent
inherited generic constraint and an unused inline `@ts-expect-error`, which fail TypeScript 6 strict
checking. The one-line pnpm patch intersects the inherited meta input with the base constraint and
removes that unused directive. It changes only `dist/index.d.ts`: all original JavaScript files stay
byte-identical. Library checking and strictness remain enabled; positive and negative CSF type
fixtures compile. No Copilot resource is modified. Review and remove the patch when a future pinned
Storybook release passes those same checks without it. See [provenance](provenance.md).

## HA visual reference

The [visual-equivalence gate](visual-parity.md) compares actual HA states against the built shared
component. The catalog now bundles the same Roboto Regular/Medium font bytes as the measured HA
frontend, with local license notices. The static browser gate explicitly waits for both font
faces to load, exercises 80 locale/theme/width combinations and compares fourteen recorded
checkbox visual states. Other families still need the same HA comparison and any corrections;
a passing functional or accessibility test alone does not establish visual equivalence.

The independent static accessibility scan waits for Storybook's public STORY_FINISHED event and
requires its real automatic a11y reports to pass first. It then resets axe to default rules and
scans the component surface independently. Neither scan is disabled; this prevents concurrent
axe instances from racing. The completion witness retains status metadata only and cleans up
its event listener. Browser test projects prebundle the event protocol before collecting tests.

The offline navigation visual gate also checks the built core element in both link and local-panel
modes against eight original HA text-tab captures. It verifies fonts, label geometry, selected and
disabled opacity, and actual keyboard focus; candidate images and structured results are retained
under `test-results/storybook`. Icons, overflow affordances and installed-app/human review remain
required. Reference collection uses no household credentials or API; see [visual parity](visual-parity.md).

The text-tab reference is platform-specific: eight original captures each for macOS and Linux.
The source and static gates choose an explicitly measured browser platform and keep the same
style/state and geometry bounds. Independent offline Linux replay compares the unchanged
original HA modules and the compiled candidate; it does not widen the SDK's Node support range.
