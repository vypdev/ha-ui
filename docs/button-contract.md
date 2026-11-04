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

Visual geometry comes from Gateway's MIT ui-catalog.css at e47dde303e475a6d03e1d6697ec87a934e93263b:
pill shape, 8 px gap, 8/16 px padding and 14/16 px text. Compact/default targets are raised to44 px;
large is 48 px and extra-large 56 px. Public semantic colors need a corresponding on-accent text color;
the catalog supplies tested light/dark pairs. No Gateway or private HA runtime is imported.

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
