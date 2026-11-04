# Shared checkbox contract

This family retains the foundation's checkbox case C11 and all UIF-01..UIF-08, adapter, delivery
and application requirements. Source, compiled consumption and visual evidence are separate gates.

## Closed inputs and model

`checkboxState(unknown)` returns frozen label (required, inert 1..256 Unicode points), description
and error (inert 0..512), booleans required/indeterminate (false) and requiredMessage (inert 1..512,
default Select this option.). Unknown own keys, symbols, invalid text and nonboolean flags raise
CheckboxInputError, code/message invalid_checkbox, without echoing input. checkboxChecked accepts
only a real boolean. checkboxName accepts inert text up to128 points, empty allowed. checkboxValue
accepts literal well-formed text up to16384 UTF-16 units, including newlines, without HTML parsing.

The checked boolean is the controlled model. Indeterminate is an independent controlled visual
flag, not a third model value and not a permission/selection policy. It affects neither successful
form entries nor required validation. A consumer derives it from child state and can clear it when
accepting an action; the core never silently changes the supplied configuration. The native input
exposes mixed semantics while that flag remains true.

## DOM and form equivalence

Explicit client registration uses registerCheckbox from `/checkbox`; `/checkbox-contracts` stays
DOM-free. `vyp-ha-checkbox` owns one native checkbox in Shadow DOM and its label. The visual control follows
the measured HA 20px square, 2px border, 4px radius, 8px label gap and 14px Roboto typography.
An invisible44px native input target preserves touch access without enlarging the visible square. Public
HA-compatible color/font/focus tokens, descriptions and localized errors remain shared.

`state` and current `checked` are property-only. `defaultChecked` is a strict boolean and reflects
the native presence-based checked attribute; it follows initial state until a checked write or
activation makes it dirty. A reset requests the current default, and acknowledgement restores the
pristine default relationship. Name/value are reflected strings, with value default on. Disabled is
a real boolean presence attribute. An external form ID attribute selects the readonly form owner.
The indeterminate convenience property reads/writes that state flag and has no string attribute API.

ElementInternals supplies labels, native form value/validation, disabled fieldsets, reset and explicit
state restoration. Enabled checked controls contribute name/value once; unchecked or disabled
controls contribute nothing. Required means checked=true, independently of indeterminate. Custom
and state errors precede the required message. A native form may choose novalidate; Angular forms
must use ngNativeValidate or explicit submit validation when browser blocking is desired.

A cancelable composed/bubbling ha-check-request carries frozen {checked, reason}; reason is change,
reset, restore or autocomplete. checkboxChangeDetail validates the closed snapshot before any app
callback. Programmatic writes emit no intent. Mouse/label/Space use the native input. Native click
cancellation prevents the change request; canceled/unhandled requests restore the accepted model.
After the browser's canceled-click rollback, the component reconciles its latest accepted state,
including an independent application write made during the click. This reconciliation emits no intent.

Trusted Enter follows the outer form's normal default-submitter path, preserving native application
click cancellation. With no submitter, the ordinary text-field blocker rule applies. Deferred keys
check cancellation, disabled state and the same owner before submitting. The shared DOM helper
serves both text fields and checkboxes without importing another component renderer.

`focus`, `blur`, `click`, labels, validity, validationMessage, willValidate, checkValidity,
reportValidity and setCustomValidity expose the documented native equivalence. Reset does not clear
indeterminate: it stays application-controlled. checkboxRestoreState returns true/false text;
checkboxRestoreValue accepts exactly those strings. Malformed strings, File/FormData and unsupported
restore modes fail with invalid_checkbox; automatic history restoration remains a separate gate.

## Framework binding API

All four adapters export Checkbox and reuse the same core. React/Svelte accept checked and
onCheckedRequest/onCheckedChange. Vue uses boolean modelValue, checkedRequest and update:modelValue.
Angular supports a standalone checked/checkedChange binding plus ControlValueAccessor/Validator.
An Angular control owns checked and disabled when present; nullable null resets render unchecked
without changing the nullable model. Framework directives retain reset/default and updateOn policies.
The application owns indeterminate through state in every binding and recomputes it when accepting
child changes. No binding adds rendering, household behavior, I/O or another native form controller.

Visual equivalence uses the [measured HA protocol](visual-parity.md). Source/license notices ship
with the core package; no private HA bundle or third-party runtime is imported by the renderer.

Deferred Enter is also tied to the original connection. Disconnecting and reattaching the same
control to the same form cancels that older action; a new key action uses the new connection.
