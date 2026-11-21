# Multiline text area

`vyp-ha-textarea` is a separate controlled, form-associated control. The shared core owns
its visuals and accessibility. React, Vue, Angular and Svelte bind their own models to
that same element. The existing `vyp-ha-field`, `textFieldValue` and field adapters keep
their single-line behavior.

Import `textAreaState`, `textAreaValue`, `textAreaName`, `textAreaValidity` and
`textAreaValueDetail` from `@vypdev/ha-ui/textarea-contracts`. These functions and the
root contract exports can run without DOM globals. Import `HaTextArea`,
`registerTextArea` and `TextAreaValueEvent` from `@vypdev/ha-ui/textarea` at an explicit
browser boundary. Importing the component does not register it. Registration is
idempotent for its own constructor and rejects a conflicting package cohort.

```ts
import {textAreaState} from '@vypdev/ha-ui/textarea-contracts';
import {registerTextArea} from '@vypdev/ha-ui/textarea';

registerTextArea();
const field = document.createElement('vyp-ha-textarea');
field.state = textAreaState({
  label: 'Notes', description: 'Keep useful details on separate lines.',
  maxLength: 1000, rows: 3, tooLongMessage: 'Use at most 1,000 characters.',
});
field.name = 'note';
field.value = 'First line\nDetails 😀';
field.addEventListener('ha-value-request', event => {
  // The application decides whether to accept the proposed value.
  if (!event.defaultPrevented) field.value = event.detail.value;
});
```

`TextAreaState` requires a nonempty accessible `label`. `description`, `placeholder`
and `error` default to empty strings. `required` and `readOnly` default to false.
`minLength` defaults to zero, `maxLength` to 16,384 and `rows` to three. Length limits
must be safe integers from zero to 16,384 with minimum no greater than maximum.
Rows must be an integer from two through twenty. Unknown state keys and malformed
presentation text are rejected. `requiredMessage`, `tooShortMessage` and
`tooLongMessage` accept localized nonempty presentation text; their English defaults
are “Enter a value.”, “Enter more characters.” and “Enter fewer characters.”

Lengths count Unicode codepoints. A note of 1,000 supplementary characters is 1,000
codepoints even though JavaScript's string length is 2,000. The renderer deliberately
omits native `minlength` and `maxlength`, whose UTF-16 limits would truncate valid
text. It exposes its codepoint constraints through `ElementInternals` validity flags.
A value within the global safety bound can remain an editable draft while failing a
narrower configured limit; this lets the person correct it without losing their text.

Values must be well-formed Unicode with no C0 controls except tab, LF and CR, and no
DEL. The global safety bound is 16,384 codepoints. Programmatic value assignments
preserve literal whitespace and CR/LF content. The internal native textarea displays
CR/LF using its standard LF normalization; subsequent user edits propose the native
LF value. No programmatic normalization occurs in the public value or form entry.
Text stays inert: it is never interpreted as HTML, Markdown, a link or a command.
Malformed assignments retain the accepted state and throw `TextAreaInputError` with
code/message `invalid_textarea`; diagnostics do not echo the value. Invalid native
edits outside the safety contract restore the accepted value without a model request.

The host exposes `state`, `value`, `defaultValue`, `name`, `disabled` and `readOnly`.
`state` and current `value` are properties, never serialized object/current-value
attributes. The `value` attribute reflects `defaultValue`; `name`, `disabled`,
`readonly` and native external `form` ownership follow the documented DOM semantics.
The `readOnly` property/attribute updates `state.readOnly`; a later complete state
assignment is authoritative. Invalid text attributes are restored to their last
accepted values. A pristine value follows changes to `defaultValue`; a dirty value
retains its draft until the consumer accepts a reset request.

`ha-value-request` bubbles, is composed and cancelable. Its frozen detail has only
`value` and `reason`: `input`, `reset`, `restore` or `autocomplete`. Programmatic
assignments emit no request. A consumer acknowledges a request by writing its accepted
value. An unhandled/canceled request leaves the accepted model and native display
intact. Deferred acknowledgments preserve the corresponding selection. Composition
emits one completed proposal; a newer external value wins over an older composing
draft. Adapters validate event detail before invoking application callbacks and use
that validated snapshot even if an observer mutates a foreign event object.

Native textarea Enter inserts a newline. Tab follows normal focus navigation. Labels,
help and revealed errors stay associated with the native control; an asterisk is
decorative and does not change its accessible name. Public `focus`, `blur`, `form`,
`labels`, `validity`, `validationMessage`, `willValidate`, `checkValidity`,
`reportValidity` and `setCustomValidity` expose the native form contract. The host's
own `invalid` event reveals its localized error. Disabled controls and disabled
fieldsets omit the form entry, including the native first-legend exception. Read-only
values remain successful form entries and are natively barred from validation.

Reset and browser state-restoration callbacks request a controlled update rather than
silently replacing application state. Invalid restoration payloads are rejected.
Disconnect/remount preserves the accepted value; framework teardown removes the
application subscriptions. Application permissions, validation beyond this text
contract, persistence, retries and operation recovery stay with the consumer.

| Adapter export | Controlled model | Request observation |
| --- | --- | --- |
| React `TextArea` | `value`, `onValueChange` | `onValueRequest` |
| Vue `TextArea` | `v-model` / `modelValue` | `valueRequest` |
| Angular `TextArea` (`vyp-ha-textarea`) | CVA reactive forms, `ngModel`, or standalone `value` | `valueRequest` |
| Svelte `TextArea` | `value`, `onValueChange` | `onValueRequest` |

All adapters accept `state`, `name`, `defaultValue`, `disabled` and external `form`.
React also requires the reviewed `react-dom` peer. Its native event bridge uses
[`flushSync`](https://react.dev/reference/react-dom/flushSync) to commit synchronous
consumer updates before the core restores the controlled display. This keeps rapid
keystrokes from reading a stale accepted value. The library calls it only from the
native request handler, with application callbacks present. React can also commit
other pending work through this API, so keep these callbacks small.
Applications should use property/model updates in effects rather than dispatching
synthetic user requests from a React render or lifecycle callback.
Angular delegates validation to the core policy and reports `haTextArea` flags. Its
native reset respects the Angular control's nullable/nonnullable default; its update
strategy remains `change`, `blur` or `submit`. No adapter owns another visual renderer.

The `field`, `control`, `label`, `input`, `help` and `error` parts use the established
HA/shared field color, surface, typography, border, radius and spacing tokens. Labels
flow above the native textarea so long labels can wrap without covering text. Vertical
resizing remains available, with no horizontal resizing. Forms/Text area catalog
examples cover multiline Unicode, validation, disabled/read-only states and localized
labels in light and dark themes.

The maintained package and server consumers exercise the same packed cohort. Next.js,
Nuxt and SvelteKit import the pure contract on the server and register/mount the
component at the explicit client boundary. Framework interoperability, cohort
publication and Domus #157 adoption are separate gates. Follow the
[reviewed prerelease publication flow](provenance.md#publish-a-prerelease-to-npm) and
[consumer adoption procedure](migration.md); retain the prior tested application
artifact and lock for rollback.

The [focused acceptance record](evidence/multiline-textarea.json) maps the eight native
cases to their executable checks. Local component checks, reviewed publication and
installed application adoption have separate results; no complete foundation
acceptance follows from this companion increment.
