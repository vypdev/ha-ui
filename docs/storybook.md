# Shared component catalog

The current catalog displays the implemented upper navigation, local panels and single-line text
field, button, boolean checkbox, typed single/multiple select, native dialog, card and layout using the real
package entrypoints. Eighty-three CSF stories have automatic documentation,
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
| Forms / Text field | `@vypdev/ha-ui/field` | Controlled draft, empty/focused optional, floating label, placeholder, native submit/reset, required, readonly, disabled and error |
| Forms / Checkbox | `@vypdev/ha-ui/checkbox` | Boolean checked, independent mixed state, required, disabled/error, cancellation, custom payload, long labels and reset |
| Forms / Select | `@vypdev/ha-ui/select` | Typed single/multiple dropdowns, chips/search, visible lists, disabled and unavailable options, cancellation and reset |
| Overlays / Dialog | `@vypdev/ha-ui/dialog` | Standard and alert surfaces, pending or disabled confirmation, canceled requests and scrollable content |
| Surfaces / Card | `@vypdev/ha-ui/card` | Titled/untitled, raised, heading only, long title, right-to-left and projected actions |
| Layout / Row | `@vypdev/ha-ui/layout` | Passive list item, optional description, right-to-left wrapping and projected action |
| Layout / Grid | `@vypdev/ha-ui/layout` | Fixed and responsive columns, square cells and right-to-left flow |

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

Vitest5.1.0 automatically adds project test patterns to its resolved coverage exclusions. The
configuration also names `stories/**/*.stories.ts` explicitly so the runtime inventory remains
clear independently of that default. Recursive architecture checks require every CSF file to
import its renderer from a covered runtime example. No production renderer, example, locale or
palette is excluded. The earlier contrary runner premise is tracked in
[Copilot #895](https://github.com/vypdev/copilot/issues/895).

Navigation edge tests assert the exact ARIA-disabled attribute and absence of native disabled state,
matching their retained-focus contract. The pinned Vitest Browser matcher also supports ARIA-disabled
state; its previously reported contrary premise remains documented in
[Copilot #894](https://github.com/vypdev/copilot/issues/894). Core imports are limited to local modules
and the renderer's declared Lit dependency, including CommonJS and TypeScript import-equals forms;
nonliteral loaders, bare Node builtins and undeclared server dependencies are rejected.

The static gate builds the manager, autodocs and previews, then serves only the repository base
`/ha-ui/`. It checks 192 locale/theme/width combinations with axe, real focus/overflow and manual
panel activation, native form editing/validation/submit/reset, dialog confirmation and focus, card projection, native command submission, responsive reflow with retained focus and controls-driven value changes and
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
faces to load and exercises 192 locale/theme/width combinations. Its visual phases compare
original navigation, checkbox, button, text-field, select, dialog, card and layout states. A passing functional
or accessibility test alone does not establish visual equivalence.

The independent static accessibility scan waits for Storybook's public STORY_FINISHED event and
requires its real automatic a11y reports to pass first. It then resets axe to default rules and
scans the component surface independently. Neither scan is disabled; this prevents concurrent
axe instances from racing. The completion witness clears previous results when preparation,
loading or rendering starts and records a monotonic page-local revision with bounded status
metadata. Waiters can require a revision newer than a previous run. The compiled manager gate
uses the real Reload story button twice on the same story and requires fresh automatic a11y
completion each time. Cleanup removes both channel listeners. Browser test projects prebundle
the event protocol before collecting tests.

## Native reset and live status

The four form demonstrations use a non-resettable `role="status"` region for controlled draft,
submission and request feedback. In measured Firefox 157 and WebKit 27.2, native form reset removes
Lit text markers inside an `output` element; a later update then fails. A minimal native form
reproduces this independently of shared components. The status region retains the same polite
announcement semantics and survives native reset.

The compiled form-lifecycle gate runs the real field, select, checkbox and reset-button stories,
waits for automatic interactions/accessibility completion, edits before reset and verifies a
subsequent edit/submission or repeated reset count. The scoped twelve-journey Linux campaign
passes Chromium, Firefox and WebKit. This is separate from the full retained browser/framework
matrix and does not establish universal engine support.

The offline navigation visual gate also checks the built core element in both link and local-panel
modes against eight original HA text-tab captures. It verifies fonts, label geometry, selected and
disabled opacity, and actual keyboard focus; candidate images and structured results are retained
under `test-results/storybook`. Overflow affordances and installed-app/human review remain
required. Reference collection uses no household credentials or API; see [visual parity](visual-parity.md).

The text-tab reference is platform-specific: eight original captures each for macOS and Linux.
The source and static gates choose an explicitly measured browser platform and keep the same
style/state and geometry bounds. Independent offline Linux replay compares the unchanged
original HA modules and the compiled candidate; it does not widen the SDK's Node support range.


The icon/text gate additionally compares 24 original HA states per measured platform: three
presentations, two themes and resting/hover/focus/disabled. It exercises both link and panel modes,
retaining 48 compiled-catalog comparisons per platform. Six new production-backed stories expose
icon-only, icon-and-text and mixed items in both modes. The locale/theme/width accessibility matrix
also scans mixed navigation and icon-only panels. All glyph paths in these examples are original
fixture data; public package consumers choose their own local reviewed path data.


Both navigation modes also expose a 240px `Overflow` story with eight destinations and
English/Spanish paging names. The static gate checks forty original overflow states per
platform across both modes, themes, directions and start/middle/end/hover/focus states.
Source-browser measurements and packed framework overflow journeys are separate checks.
The full library and installed-app UX remain incomplete; see [visual parity](visual-parity.md).


The button gate additionally compares 96 original HA states per measured platform against
the built core, including real pointer-active states. The painted surface follows the HA
geometry while the native hit area remains at least 44px. Packed core journeys click the
invisible native margin, and all four compiled bindings verify the same surface/target sizes.
Standalone fallback text contrast and the catalog's explicit accessible palette are tested
separately from exact original-token calibration. Both a11y scans remain enabled.
