# Shared component library

The current source implements the DOM-independent navigation contract, one controlled upper
navigation/panel renderer, a single-line text field, a native-form button, typed single/multiple selects, boolean checkboxes and the tested quality/build foundation. The renderer passes direct
Chromium and clean actual-package browser consumers. Four navigation, text-field form, button, select and checkbox adapters now also pass real compiled package consumers. Other component families,
other form bridges, framework SSR, public Storybook hosting, publication and consumer migrations remain required. The [primary Draft](../specs/shared-ui-foundation.md),
[capability catalog](../specs/CATALOG.md) and [feature issue #7](https://github.com/vypdev/ha-ui/issues/7)
hold the proposed contract and pending acceptance gates.

## Intended use

One Lit implementation exposes DOM components. Apps choose direct Lit/HTML use or a real React,
Vue, Angular or Svelte adapter. Proposed package names are @vypdev/ha-ui and the corresponding
-react, -vue, -angular and -svelte packages. Navigation exports and exact preview evidence are in
the [framework guide](framework-adapters.md); registry publication rights remain unverified.
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
checkboxes, cards, rows/grids, dialogs and feedback states. The [shared Storybook](storybook.md) uses production
components with EN/ES, light/dark, narrow/wide, keyboard and reduced-motion examples. CI retains
reviewable PR artifacts; public GitHub Pages hosting remains pending.
No private HA bundles, parent-frame DOM, storage, credentials or API access belong in this package.

## Compatibility and adoption

Exact supported versions, peer ranges, signatures and export paths are pending engineering verification.
Next.js, Nuxt and SvelteKit need explicit tested client/import boundaries; a generic Web Component
claim does not prove SSR or hydration support. The initial goal is a server shell with client-mounted
components, not universal server rendering of Shadow DOM.

The first navigation preview exercises the proposed DOM contract and reviewed Gateway dashboard
geometry. It does not establish broad extraction or a supported framework cohort. Before extending
extraction to additional families, verify the packed consumers for Lit/DOM and all four adapters,
retain the Gateway source/license baseline and MIT/asset notices, and extract behavior once. Actual Gateway and
Domus migrations happen under their own admitted repository work, using the same reviewed cohort.
Retire local duplicates only after equivalent app, recovery, locale and accessibility journeys pass.
Core/adapter publication, Storybook delivery and each app's acceptance are distinct gates.

## Quality and release

All authored behavior starts with tests and requires 100% supported statements, branches, functions
and lines globally and per module, with independent source inventory and executable architecture
constraints. The primary Draft allocates 64 distinct minimum cases. CI Check must aggregate
all required implemented checks on every PR head; the initial CI now validates all implemented source; broader browser support, adapter and adoption gates remain pending.
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

## First component contract: controlled upper navigation

Import `HaTabs` and `registerTabs` from `@vypdev/ha-ui/tabs`; call registration only at the
client boundary. It defines `vyp-ha-tabs` explicitly, preserves pre-upgrade property values,
allows repeated calls with the same constructor and rejects another installed constructor.
The root and contracts entrypoints stay DOM-independent. The component entrypoint is intended for clients. Lit may install its own DOM shim when imported
on a server; ha-ui does not define a tag there and rejects registration even with that shim. No server-rendered
Shadow DOM or framework hydration support is claimed.

Set the `state` property to the validated `NavigationState` contract. It is property-only;
serialized object attributes and HTML-string rendering are unsupported. Assignment validates
and snapshots before replacing the previous state. No programmatic assignment emits intent.
Each user action emits one cancelable, bubbling, composed `ha-selection-request` CustomEvent,
with frozen `{kind, id}` detail. Apps own selected state and routes. Canceling intent prevents
the original link navigation; unmodified accepted navigation retains the native anchor default.
Modified link clicks retain browser behavior and do not emit a selection request. Disabled
links have no target or tab stop. Stale DOM events during a pending state replacement are rejected.

Navigation renders a labeled `nav` with links and `aria-current=page`. Panels render a labeled
horizontal `tablist`, native button tabs and actual same-shadow-root labeled `tabpanel` sections.
Panel item IDs name light-DOM slots. Inactive panel wrappers are hidden, including slotted focus
targets. Arrow keys skip disabled tabs and wrap; Home/End move focus. RTL reverses horizontal
arrows. Activation is manual through native Enter/Space/click, while Tab follows normal focus
order. Null selection keeps a keyboard entry without silently selecting a panel.

The common dashboard bar uses the measured HA text-tab geometry: 56px targets, 14px Medium
Roboto with a 1.6 line height, 16px horizontal padding and a 2px current indicator. The inner
content uses 18px top and 14px bottom padding; inactive items retain the header text color at
0.8 opacity, with another 0.5 factor for disabled content. Keyboard focus uses HA's gray 2px
ring inset by 5px. The header surface/text inherit `--app-header-background-color` and
`--app-header-text-color` before the ordinary card/text fallbacks. Domus still owns its sections
and layout. Local icon-only, icon-and-text and mixed items use the same renderer; overflow affordances and full installed-app visual acceptance remain required.
Public CSS tokens are `--vyp-ha-font-family`, `--vyp-ha-border`, `--vyp-ha-surface`,
`--vyp-ha-tab-padding`, `--vyp-ha-text-secondary`, `--vyp-ha-text`, `--vyp-ha-tab-indicator-color`,
`--vyp-ha-focus-ring`, `--vyp-ha-tab-border` and `--vyp-ha-primary`. The focus ring inherits HA's `--wa-focus-ring`; the
indicator inherits `--app-header-selection-bar-color`/`--ha-tab-indicator-color` before current text.
The bar border inherits `--app-header-border-bottom`, falling back to a 1px
`--vyp-ha-border`/`--divider-color` rule. `--vyp-ha-tab-border` overrides the full border.
Defaults inherit the corresponding HA theme variables where available. Overrides update live;
no global styles, network, storage, timers or animation are introduced. Exposed shadow parts are
`bar`, `item`, `content`, `icon`, `label` and `panel`. The `content` part owns the visible focus ring;
links/buttons retain the actual keyboard focus and semantics. Navigation binding and packed browser evidence are in the [framework guide](framework-adapters.md);
forms, other families and the complete framework/client boundary matrix remain separate gates.

The interaction model follows [WAI-ARIA APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
and uses Lit's documented [reactive properties](https://lit.dev/docs/components/properties/)
and [events](https://lit.dev/docs/components/events/).

### Local navigation icons and labels

Each item may supply `iconPath`, an inert local SVG path command string in a fixed `0 0 24 24`
view box, and `showLabel`, which defaults to true. A missing/null path retains text-only display.
A hidden visible label requires an icon; the nonempty `label` is always required and remains the
native link/tab's accessible name. Icon-only controls also expose the label as a native hover title.
The SVG is decorative, not focusable, and contains only the controlled path attribute. It adds no
independent keyboard target or event subscription. Routes, selection and cancellation stay unchanged.

The contract bounds path data to 16,384 characters, an initial M/m and local SVG command/number
characters. This is a lexical data boundary, not a general SVG geometry parser. Consumers provide
reviewed path geometry; no HTML, URLs, external images, icon-name lookup, HA registry or application
API is part of the input. The same immutable state passes through all four framework bindings.
No binding draws a second icon or installs another framework or an icon pack.

Measured HA icon tabs use 24px glyphs and a 56px target. Their content has 16px top/12px bottom
padding, with an 8px logical icon/text gap when text is shown. Text-only padding and geometry are
preserved. `--vyp-ha-tab-icon-size` and `--vyp-ha-tab-icon-gap` override the size and gap; the defaults
inherit `--mdc-icon-size` and `--ha-space-2`. Fill and path opacity inherit HA's `--icon-primary-color`
and `--icon-primary-opactity` (the upstream variable spelling), with currentColor/1 fallbacks.
Names, visibility, path data and theme overrides update on the same live control without an intent.

## Controlled text field

The second shared family is a single-line text field. `textFieldState` validates immutable presentation
configuration: label, optional description/placeholder/error, required/readOnly, UTF-16 min/max
lengths and localized required/short/long messages. `textFieldValue` accepts well-formed single-line
strings up to 16,384 UTF-16 units; it preserves literal text and does not log values. Form names are
bounded inert text. Invalid input has the bounded `invalid_field` diagnostic.

`vyp-ha-field` is a form-associated element with one native input, an actual label and
linked help/error text. Its state object and value are properties. Name, disabled and readonly have standard
host attribute semantics; the value attribute supplies defaultValue for initial/reset behavior.
Current value is never reflected into HTML. Explicit client registration and properties assigned
before upgrade follow the same cohort rules as navigation.

Values remain controlled by the application. A typed, cancelable, composed `ha-value-request`
requests input/reset/restore/autocomplete changes; assigning a value does not emit one. A controller
accepts by assigning value, or rejects by leaving it unchanged/canceling. The field retains accepted
form state and restores the caret when an asynchronously accepted request matches the proposal.
Composition must not emit partial text or overwrite a newer application value. Native form reset
and state-restoration callbacks use that same controlled protocol; framework form bridges must
acknowledge it using their own model APIs, including Angular's value accessor.

ElementInternals supplies form ownership, name/value submission, disabled fieldsets and constraint
validation. The readonly host attribute bars validation and makes the native input non-editable.
The public form/labels/validity APIs, focus, blur, custom validity, reset, reparenting and keyboard
submission are exercised in actual Chromium forms. Import `HaTextField` and `registerField` from
`@vypdev/ha-ui/field`, and call registration at the explicit client boundary. Import the pure
contracts from `@vypdev/ha-ui/field-contracts`; these require no DOM globals or DOM types. The initial field is text-only; other input types,
checkboxes and dialogs remain required separate work. React, Vue, Angular and
Svelte text-field bindings and native form-model bridges pass the pinned compiled consumers; other
control families and their bridges remain required. Browser state-restoration callbacks are exercised
explicitly; automatic history restoration, real device IME behavior and other engines remain
unverified. No complete family matrix or product acceptance is claimed.

The implementation follows the [HTML custom-element form contract](https://html.spec.whatwg.org/dev/custom-elements.html)
and [form control infrastructure](https://html.spec.whatwg.org/dev/form-control-infrastructure.html).


The standard `form` attribute supports an external form owner. `disabled` is a boolean attribute:
`disabled="false"` still disables the field. `readOnly` projects the immutable state's readOnly
flag and reflects `readonly`. Invalid name/default attributes are restored before their bounded
error is reported; current values are never included in diagnostics. Removing a text attribute
retains its absence. Programmatic values participate in required/min/max/custom validation.
Native form validation reveals linked errors as well as field-level checkValidity/reportValidity.
An application can cancel Enter in its key handler; a deferred submit checks that the owner is
unchanged and that the field is still enabled. It preserves the first native default submitter,
including its name/value and disabled state. With no submitter, multiple blocking fields prevent
implicit submission. Synthetic key events do not trigger submission.

The native input has a real associated label and delegates focus through an external label too.
The core owns all field markup, 56px minimum height, 16px padding, focus/error treatment and live
HA theme inheritance. Field tokens additionally include `--vyp-ha-field-radius` and
`--vyp-ha-danger`; shadow parts are `field`, `label`, `input`, `help` and `error`. Controlled
reset requires the application to acknowledge the request, just like a normal edit. Cancellation
does not undo a value explicitly assigned by application code. This preview stores no values,
performs no network calls and grants no application permission.

`fieldValueDetail` is available from the DOM-independent field-contracts entrypoint. It validates
exactly value and reason, accepting input/reset/restore/autocomplete only, snapshots the bounded
text value and freezes the result. Framework model bridges validate before invoking app observers
and use that snapshot after them. FieldValueReason and FieldValueDetail types are also DOM-free.

A readonly field keeps its reflected `readonly` attribute and successful form value, while the
browser excludes it from constraint validation. Stored validity flags and the ElementInternals
validation message remain inspectable; they do not imply that the control blocks submission.
Changing back to editable immediately restores normal required/length/custom validation. Five
source-browser and independently installed-core cases verify actual form submissions for required
empty, too-short, too-long, state-error and custom-error values. This follows the HTML Standard's
[readonly FACE contract](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance)
and [ElementInternals validationMessage getter](https://html.spec.whatwg.org/multipage/custom-elements.html#dom-elementinternals-validationmessage).

## Native-form button

The [button contract](button-contract.md) defines the real core API, states, decorative slots,
typed cancellation and exposed native submitter. The direct packed consumer checks native browser
submission/validation, name/value inclusion, default Enter, disabled behavior, busy focus and reset.
React/Vue/Angular/Svelte button exports and actual installed compiled consumers pass alongside
navigation and text-field bindings. The catalog uses the actual
shared button in field forms and has twelve button stories, including all eight visual variants.


## Typed single/multiple select

The [select contract](select-contract.md) defines the shared native selector and its pure policies.
It preserves string/number/boolean model values and frozen arrays, including distinct 1 and "1"
options. Null is unselected. Missing/disabled options and mode mismatches preserve the model as an
explicit invalid selection; no replacement is invented. Successful FormData entries remain strings
and follow option order. Native keyboard, labels, localized errors, focus, validation, external form
owners, disabled fieldsets, reset and explicit typed restoration are exercised.

All four [framework bindings](framework-adapters.md#select-binding-contract) delegate to that same
renderer. Angular includes its value-accessor/validator bridge and documented native-validation form
opt-in. The catalog has eleven select stories covering single/multiple, required, disabled/error,
missing/disabled options, empty lists, cancellation and Spanish dark/narrow content. Other families,
framework SSR, broader browser engines and full application adoption remain required.

## Controlled checkbox and visual acceptance

The [checkbox contract](checkbox-contract.md) defines the boolean model, independent mixed flag,
closed request snapshots, successful entries, validation and reset/restoration semantics. React,
Vue, Angular and Svelte bindings use the one core renderer, including Angular Forms integration.
The catalog adds eleven checkbox stories and the exact locally bundled HA Roboto font files.

The [HA visual-equivalence procedure](visual-parity.md) is a required review gate for every family.
A matching functional API or 100% coverage does not establish appearance. Checkbox measurements
are scoped to the actual recorded HA states. Text-only navigation controls now have their own
measured baseline; icons and overflow affordances still require review. Buttons, text fields and
selects still require direct comparison and correction before acceptance. This work precedes further
visual families and application adoption, so those apps do not adopt an uncalibrated visual layer.


### Narrow navigation and local panels

Both modes share the same 56px horizontally scrolling bar. `scrollStartLabel` and
`scrollEndLabel` accept optional nonempty localized text, with English defaults. They name
native paging buttons; paging, focus reveal and mouse panning never request a selection.
Buttons use the measured HA gradients and local Font Awesome chevrons. RTL uses logical
start/end paging and negative native scroll offsets. Resize, content/font geometry and
ancestor direction/style changes update the available edges without moving document scroll.

Programmatic selection reveals its destination without moving focus. A newer keyboard focus
wins over a deferred initial reveal and stays clear of the arrow overlays. Labels wider than
the viewport align their logical start. Paging respects system reduced motion and the public
`--vyp-ha-motion-duration:0ms` override. Pointer movement must exceed one CSS pixel before it
pans; modified input and keyboard activation retain their native behavior. Disconnect and
navigation-kind replacement retire observers, scheduled work and window gesture listeners.

A focused arrow that reaches its edge remains present with `aria-disabled="true"` until blur.
This deliberate accessibility exception preserves focus; the original HA component removes
the focused arrow. Other resting, hover and focus visuals use the original measured geometry.
