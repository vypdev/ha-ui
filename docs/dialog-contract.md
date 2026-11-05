# Dialog contract

Register the client-only `vyp-ha-dialog` through the `@vypdev/ha-ui/dialog` entrypoint.
The DOM-free `@vypdev/ha-ui/dialog-contracts` entrypoint validates inert display state and
typed requests. The dialog contains a native modal, a titled header, scrollable body, and
optional footer actions. It uses the shared button renderer for its own controls.

The application owns the boolean `open` property. An acknowledged request closes the dialog
when the consumer sets `open` to false. A programmatic update is silent. The native modal
keeps background content inert while open. On close or disconnect, it restores the previously
focused control if it is still connected. The default slot accepts ordinary application
content, including a visible enabled control marked `autofocus`. The footer slot replaces the
default Cancel and Confirm actions.

`dialogState` requires a title (1–256 Unicode points). Optional subtitle and description
allow up to 256 and 1,024 points. The title names the native modal; the description is
visible and associated with the modal. Text renders as inert content. Width presets are
small, medium, large and full. A standard dialog uses the HA full-screen presentation on
a narrow or short viewport; an alert retains a centered surface. Alert uses the
`alertdialog` role and is intended for an interruption that requires a response.

Close, Cancel and Confirm use localized labels. Close and Cancel have English defaults;
an empty Cancel or Confirm label hides that action. Confirm supports primary and danger
tones. `pending` displays an announced busy state and blocks confirmation; a disabled
confirmation is also unavailable. `guardDismiss` blocks Escape, backdrop and native
dismissal, while leaving explicit actions available to the consumer.

The cancelable, composed and bubbling `ha-dialog-request` carries a frozen
`{action}` for `confirm`, `cancel`, `close`, `escape`, `scrim`, or `native`.
A pointer must start and finish on the backdrop to request scrim dismissal.
Canceled or unacknowledged requests retain the open model. A slotted form that closes
the native dialog requests `native`; the renderer reconciles the native state with the
still-current controlled value. The renderer performs no application command and makes
no decision about whether a confirmation succeeded.

Long content scrolls within the body. The header and footer stay visible; the edges show
when more content is available. Those cues honor reduced motion.

All four framework packages export `Dialog`. Register the shared element at the client
boundary before mounting. React and Svelte use `onRequest` and `onAction`; Vue emits
`request` and `action`; Angular exposes `dialogRequest` and `dialogAction`. The first
callback receives the cancelable native event. The second receives the validated action only
if the request was accepted by that callback. The app then updates `open`. React and
Svelte accept children and a footer prop, Vue uses its default and footer slots, and
Angular projects content with an optional native `slot="footer"` attribute.
