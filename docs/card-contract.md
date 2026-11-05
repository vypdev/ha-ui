# Card contract

The shared card presents ordinary application content in the Home Assistant card surface.
Register `vyp-ha-card` through the client-only `@vypdev/ha-ui/card` entrypoint. The
DOM-free `@vypdev/ha-ui/card-contracts` entrypoint validates an immutable display model.

`cardState` accepts an optional inert title (up to 256 Unicode points), a semantic heading
level from 1 to 6 (default 2), and a boolean raised flag (default false). An empty title
omits the heading. A titled card exposes a named article. Raised cards use the HA shadow
surface; standard cards use the HA border. The app owns content, commands and navigation.
The card itself has no focus stop, form owner or action event.

The default slot is the body; the named `actions` slot is the footer. Empty slots, including
formatting whitespace and conditional adapter content, reserve no space. The footer has the HA divider and room for the
shared button's native target. Cards accept the public HA background, border, radius, shadow,
heading and spacing tokens. The component wraps content at narrow widths and honors reduced
motion. Use `--vyp-ha-card-actions-padding-block` to adapt footer spacing for custom actions.
