# Shared select contract

This family retains foundation UIF-01..UIF-08 and case C10. Core, all four framework bindings,
actual installed consumers, Storybook and the broader delivery/application gates require their
own evidence; writing this contract alone does not complete them.

## Values and state

`SelectValue` is string, finite number or boolean. Strings are literal well-formed Unicode up to
1024 UTF-16 units; values are never parsed as HTML or coerced between primitive types. Thus 1,
"1", false and "false" are distinct options. Signed zero follows JavaScript SameValueZero identity.
`SelectSelection` is one value, null, or a readonly unique array of at most 256 values. Null is no
selection in either mode; arrays represent multiple selection. No object-valued option API is
promised: applications map their own records to stable primitive values.

`selectState(unknown)` produces a deeply frozen closed snapshot. Required inputs are inert label
(1..256 Unicode points) and options (0..256 closed objects with value, inert label and optional
boolean disabled=false). Duplicate values under SameValueZero are rejected. Optional inputs are
inert description/error (0..512), placeholder (0..256; default Select an option), emptyMessage
(1..512; default No options available.), booleans required/multiple=false, size (integer 1..20;
default 1 for single or 4 for multiple), requiredMessage (default Select an option.) and
unavailableMessage (default Select an available option.). Nonboolean flags, unknown own keys,
symbol keys, array holes, invalid numbers and malformed text raise SelectInputError, code/message
invalid_select, with no input echo. `selectSelection` independently validates and freezes model
values; `selectName` accepts inert text up to 128 points, empty allowed.

The single picker also accepts `clearable` (boolean, default true) and inert `clearLabel`
(1..256 points, default Clear selection). Optional selections retain an explicit keyboard/pointer
clear action; required, disabled and already empty controls omit that action. Applications localize
the clear name alongside their label, description and validation messages.

Configuration and model updates may arrive in either order. A well-typed current/default model
value missing from the current options, selecting a disabled option, or using the wrong mode is
preserved, displayed without an invented replacement and explicitly invalid. `selectValidity`
returns frozen valueMissing/customError flags and a bounded message: custom/state error first,
then unavailable selection/mode, then required. Unknown/disabled options never become successful
form entries. This permits asynchronous option updates without silently changing application state.

## DOM and native form behavior

The client-only `/select` entrypoint explicitly registers `vyp-ha-select` through registerSelect.
The DOM-independent `/select-contracts` entrypoint has no browser/framework imports. The host
owns one renderer in Shadow DOM, an associated label, optional description and localized validation
message. A single selection with `size=1` uses a native button with the combobox role and a separate
listbox in a browser popover. Multiple selection and explicit `size>1` lists retain their native
select during the next visual increment. There is no routing, HA API, application authorization or
duplicate framework renderer. The form bridge and typed request protocol are shared across modes.

Arrow keys and Home/End preview enabled options while DOM focus stays on the single combobox.
Typeahead searches labels without coercing their values. Enter, Space and Tab commit one controlled
request; Tab continues normal focus order, including the optional clear button. Escape closes the
popup with the accepted model intact. Outside pointers, blur, disabling, reset, restoration and
disconnect close it without a stray change request. Removed controls/options cannot act on a later
configuration. The popup flips/clamps to the viewport and tracks scroll/resize; every listener is
removed when it closes. Empty/all-disabled menus never turn an unavailable model into a clear request.

`state`, controlled `value` and `defaultValue` are properties, not serialized attributes. `name`
is reflected; disabled is a real boolean property/native presence attribute. `form` is a readonly
owner; the form ID attribute may select an external owner. ElementInternals owns native validation,
name/value submission, disabled fieldsets, labels and state restoration. Null/empty selections
have no entries. Successful selected options serialize String(value) in option order; multiple
selection repeats the name. `selectEntries(value,state)` is the DOM-free policy for those successful entries. Primitive API types are retained in requests/model values, while HTML
FormData remains strings. Render indexes distinguish primitive identities without becoming model
values. The custom picker has no hidden native select or duplicate successful form control.

`defaultValue` follows the initial model until the application writes value or accepts a user
request. Reset emits a controlled request for the current default; the app acknowledges it.
Restoration encodes a closed JSON selection with selectRestoreState; selectRestoreValue accepts
only a well-formed string up to 2000000 UTF-16 units and validates its parsed primitive/array value.
Malformed restore state, File and FormData are rejected with invalid_select. Signed zero is
semantically the same zero after a JSON round trip; no object identity or automatic history
restoration is claimed without browser evidence.

One cancelable composed/bubbling ha-select-request carries frozen {value, reason}; reason is change,
reset, restore or autocomplete. selectValueDetail validates the closed payload before callbacks.
Programmatic writes emit no intent. Unaccepted/canceled changes restore the accepted visual/form
model; synchronous app writes remain the app's decision. Disabled controls do not propose changes.
`focus`, `blur`, labels, validity, validationMessage, willValidate, checkValidity, reportValidity
and setCustomValidity follow the documented native equivalence. Changing options does not invent a
selection. Value/option configuration remains inert, including markup-looking strings.


## Framework bindings

All four adapters export Select and retain typed value/defaultValue, property-only state, a separate
optional form ID and synchronous cancellation. React and Svelte accept value, onValueRequest and
onValueChange. Vue accepts modelValue, emits valueRequest and update:modelValue, and supports v-model.
Angular exports a standalone component on the actual core tag, valueRequest plus valueChange for
explicit two-way value binding, and the standard ControlValueAccessor/Validator for Angular Forms.
With a forms directive, the control owns accepted values and disabled state; valueChange is for
standalone binding, avoiding a second model callback. Null and array models remain typed. Reset
preserves Angular's nullable/nonnullable model default, and updateOn blur/submit remains supported.

Angular's forms modules normally add novalidate to the form. A consumer that wants native browser
submission blocking must opt in with ngNativeValidate, or explicitly validate in its submit handler.
The actual selector consumer and source regression use `<form ngNativeValidate [formGroup]="group">`.
See the [official native-validation policy](https://angular.dev/api/forms/NgForm#native-dom-validation-ui).
The component honors the owning form's validation policy; it does not change it globally.
