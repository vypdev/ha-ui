# Controlled single-line text field

`@vypdev/ha-ui/field` owns the shared browser renderer. React, Vue, Angular and Svelte
bindings assign its properties and acknowledge its typed requests; they add no visual renderer.
The [component API](component-library.md#controlled-text-field)
describes value, validation, reset and composition behavior.

The filled control has a 56px painted and native input height, 16px horizontal padding, a
14px resting label and a 10px floating label. Focus, a nonempty value or a placeholder raises
the label. The underline grows from 1px to 2px on focus. Required fields show one marker while
keeping the accessible name stable. The 20px hint row is reserved for required fields, help or
errors; simultaneous help and error remain separate, associated text. The default outer bottom
padding is 8px. A `hidden` host has no painted box and retains its controlled form value.

Public HA typography, form surface, border, error and spacing variables are inherited. Local
overrides include `--vyp-ha-field-radius`, `--vyp-ha-surface`, `--vyp-ha-surface-hover`,
`--vyp-ha-surface-disabled`, `--vyp-ha-primary`, `--vyp-ha-danger`, `--vyp-ha-placeholder`,
`--vyp-ha-text`, `--vyp-ha-text-secondary` and `--vyp-ha-motion-duration`. Parts are `field`,
`control`, `label`, `input`, `help` and `error`. OS reduced motion limits transitions to 1ms;
an explicit zero remains zero. Clicking painted padding focuses an enabled or readonly input
without producing an edit request. Disabled fields remain unfocusable.

The default input begins 16px after the painted control's left edge. A real click at (4,4)
therefore tests the padding itself. The Chromium source test asserts that measured boundary
before checking the exact control target. Scoped installed-core checks retain the native
Firefox disabled-click retargeting difference while verifying focus and absence of edit intent.

## Native form interoperability

The shadow input provides editing and accessible semantics; ElementInternals owns successful
form data. A disabled, hidden, unnamed light-DOM text input supplies the browser's implicit
submission blocker for the custom element. It is implementation bookkeeping, has no form data
or validation contribution, and never receives current values. It follows external form
ownership and moves with the host. Reconnection retains exactly one proxy.

The [HTML implicit-submission algorithm](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission)
counts blocking inputs by type and form owner. Disabled, readonly and visually hidden text
inputs still count; `type="hidden"` does not. When no submit button exists, multiple blockers
prevent Enter submission. The shared deferred action counts the custom owner once and skips
its tracked native proxy. This preserves the same result whether Enter starts on a native
input or the shared field. Default submitters, cancelable key handlers, disabled fieldsets,
external owners and controlled reset retain their existing contracts.

## Original reference and accessible palettes

The [original reference](evidence/ha-field-reference.json) records 44 states per measured
platform, including two themes, empty/filled values, hover, keyboard focus, disabled, readonly,
required, help/error, placeholder and wrapped narrow labels. Each state uses a fresh fictional,
unauthenticated document. Two independent original campaigns agree byte for byte. The reference
configures public `--wa-form-control-required-content:none` to keep the HA wrapper's single
marker, matching direct observation of the live application. Component functions and images
remain unchanged. This explicit fixture configuration is not an application-revision claim.

Exact original-token pixel checks are separate from the catalog's accessible palette. The
catalog overrides focus and placeholder colors and supplies suitable light/dark error colors;
standalone fallbacks are tested too. Small labels, values, placeholders and errors require a
contrast ratio of at least 4.5 in resting, hover, focus and combined focus/hover states. Arbitrary
host themes are not automatically accessible. Matching these scoped fields does not complete
other input types, the full library, SSR, publication or application adoption.
