# Shared button contract

This authored contract extends the retained foundation's button family. Other families, adapters,
compiled consumers and complete capability acceptance remain required until their own evidence passes.

`buttonState(unknown)` returns a frozen closed state: required inert `label` (1..256 Unicode code
points), `variant` (primary, neutral, danger, success, warning, plain, outlined or filled; default
neutral), `size` (small, medium, large or extra-large; default medium), boolean `loading` and
`iconOnly` (false), inert `loadingLabel` (1..512 points; default Working…), and controlled `pressed`
(true, false or null; default null). C0/DEL/C1 and unpaired surrogates are rejected in presentation
text. Extra own keys, invalid enums and nonboolean flags raise `ButtonInputError`, code/message
`invalid_button`, without echoing input. Labels and state never become HTML attributes or markup.

`vyp-ha-button` is explicitly registered by `registerButton()` from the client-only `/button`
entrypoint. `/button-contracts` stays DOM-free. Its `state` property uses the frozen contract.
`type` is button (safe default), submit or reset; `name` is inert text up to 128 points, empty allowed;
`value` is a literal well-formed string up to 16384 UTF-16 units, including newlines, empty allowed.
These three properties reflect validated attributes. `disabled` and `formNoValidate` are real boolean
properties with native presence-based attributes. `form` is a readonly owner; set the `form` ID
attribute to select an external form in the same tree. Unsupported per-button action/method/encoding/
target overrides belong on the owning form. No routing, permission, network or storage is added.

The one shadow renderer contains the visible native button. Decorative `leading` and `trailing`
slots are inert and excluded from the accessible name; the inert label supplies that name, including
icon-only mode. The button delegates focus/blur/click, preserves native Enter/Space activation,
shows a public-token focus outline, provides at least44 px targets and honors reduced motion.
Loading is aria-busy and aria-disabled, retains focus, exposes the localized status and blocks
activation. Disabled/disabled fieldsets use the native disabled state, including the first-legend
exception. Controlled pressed state changes only when the application supplies another state.

One cancelable, composed, bubbling `ha-press-request` carries frozen `{type}` detail. Synchronous native click
cancellation or custom request cancellation prevents the default action. Programmatic property
changes emit no intent. Direct host `click()` delegates to the rendered visible button; callbacks
from a detached old connection cannot submit/reset after remount. Applications set busy state
from the form submit handler after browser validation, or handle a type=button request themselves.

A shadow button cannot itself be an outer-form submitter. The component therefore owns one hidden
light-DOM native button, exposed as readonly `submitter` (null before first connection). This is the
real browser submitter, not the custom host. It mirrors type/name/value/form/disabled/formnovalidate,
creates no always-successful form value and receives native implicit activation. Visible activation
requests normal browser validation/submission through that native button; reset uses the normal
cancelable form reset operation. Exactly one native click and one request accompany an activation;
`SubmitEvent.submitter` and `FormData(form, submitter)` identify the exposed native button. Native
form APIs may be called directly and do not synthesize a press request. No universal HTMLElement
submitter or additional HTMLButtonElement API is promised. Framework bindings must preserve this
same equivalence and must not add another visual/form controller.

The painted surface is calibrated against the original HA button modules: small/medium/large
are 32/40/48px, with 14/14/16px Medium Roboto and line-height 1. Extra-large uses HA's public
56px height override with large typography. The native button remains at least 44px in both
axes, centering the smaller painted surface. Its full native area activates the same single
request. `part="surface"` exposes the painted boundary; `part="button"` remains the actual
native target. Visible keyboard focus and the controlled pressed indicator follow the surface.

Leading/trailing icons are 24px, with a 4px adjacent gap and 8px padding on the icon side.
Empty slots add no spacing. Loading keeps dimensions and focus, hides the content visually
and centers a local SVG spinner; its separate localized status remains available to assistive
technology. The spinner respects reduced motion. Long labels may grow vertically to preserve
readability; they are not silently clipped to the original fixed HA height.

`--vyp-ha-button-height` overrides HA's `--ha-button-height`/`--button-height` and size defaults.
`--vyp-ha-button-radius` overrides HA's radius. Typography/spacing and semantic HA colors are
inherited through public tokens, with existing library overrides taking precedence. The neutral
variant maps to HA neutral/outlined; primary/danger/success/warning map to their accent tone,
and plain/outlined/filled map to HA brand with that appearance. No native form, validation or
request contract changes with this visual calibration. See [visual parity](visual-parity.md).

The catalog declares accessible accent overrides for its light/dark demonstration palette.
Original HA token colors are calibrated independently; exact token fidelity does not establish
contrast acceptance of arbitrary host palettes. The original reference and the demonstration
palette are recorded distinctly. No private HA or Web Awesome runtime is imported.

The four thin [framework bindings](framework-adapters.md#button-binding-contract) preserve this
contract through their own typed property, event and projection APIs. They add no visual renderer
or form controller. Source-browser and independently installed compiled consumers verify them.


Native `HTMLFormElement.requestSubmit(submitter)` and `reset()` run their standard form
algorithms without synthesizing a click on the auxiliary button. They therefore do not emit
`ha-press-request`. A trusted activation of the visible control emits one request before its
single native effect. An actual click on the auxiliary submitter, including implicit Enter,
emits its own single cancelable request; its handler must preserve that behavior. The source
regressions and separate compiled Chromium/Firefox/WebKit probe count requests, auxiliary clicks
and actual form effects independently. See the [requestSubmit method](https://html.spec.whatwg.org/multipage/forms.html#dom-form-requestsubmit)
and [form reset algorithm](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#resetting-a-form).

Icon-only hides the label without discarding projected content. Either leading or trailing
projection can supply the icon. When both slots are supplied, the painted control can widen
so both remain visible; the ordinary one-icon/no-icon target remains square. Empty or removed
projections release their spacing after updates and reconnects.

The OS reduced-motion preference bounds surface transitions to at most 1ms, following
HA's effective reduced duration; an explicit zero-duration host token remains zero.
Spinner motion stops completely. The compiled gate verifies this outside catalog styles.
