# Status, errors, empty states and loading

Use `feedbackState` from the DOM-free `@vypdev/ha-ui/feedback-contracts` entrypoint.
Register the shared browser renderer with `registerFeedback` from `@vypdev/ha-ui/feedback`.

- `kind: 'notice'` renders the Home Assistant notice surface. Its tone is `info` (default),
  `success`, `warning` or `error`. The message is required and the title is optional.
  `narrow: true` stacks the projected action beneath the text.
- `kind: 'empty'` centers an optional decorative icon, a required native heading, an optional
  explanation and an optional action.
- `kind: 'loading'` pairs the required progress message with the Home Assistant spinner.
  Reduced motion holds the indicator in a visible static state.

Titles and messages are inert, bounded display strings (256 and 512 Unicode points). Pass
localized strings from the application. The renderer gives errors an assertive alert and
other updates a polite status. Set `icon: false` to omit the notice or empty icon. The optional `icon` slot is decorative; the `action` slot
is ordinary app-owned content outside the live announcement. A projected native button or
link retains its form, focus and keyboard behavior. Feedback does not manage persistence,
timers, data fetching or any application operation.

The `surface`, `message`, `icon` and `action` parts use HA theme tokens for paint and spacing.
Application focus and accessibility remain native; the feedback itself is not a focus stop.
