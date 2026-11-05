# Rows and grids

Use the DOM-free `@vypdev/ha-ui/layout-contracts` entrypoint for validated, immutable state.
Register the browser elements individually with `registerRow` and `registerGrid` from
`@vypdev/ha-ui/layout`. Adapters project the same content into the registered core elements.

`rowState({label, description?})` defines a passive list row. The label is required, inert,
and limited to 256 Unicode points; the optional description is limited to 512. Place rows
inside an app-owned list (for example `<div role="list">`). Rows expose the list-item
semantics and the `row`, `label` and `description` parts. The optional `leading` and
`trailing` slots are ordinary content. An app can project a native control or link with
its own accessible name; the row does not duplicate its focus or action. A missing
description uses HA's single-line row height, and longer text can wrap without clipping.

`gridState({columns?, minColumnWidth?, square?, label?})` defines a CSS layout for
projected elements. `columns` is an integer from 1 to 6 (default 3).
Omit `minColumnWidth` for a fixed column count, or set an integer from 96 to 720 CSS
pixels to reduce the column count when the available width shrinks. The grid keeps
at least one column without horizontal overflow and never exceeds the requested count.
`square` defaults to false and can give projected items square grid boxes. The optional
label (256 Unicode points) names a region; the grid does not claim interactive ARIA grid
semantics. Responsive layout preserves DOM order, native keyboard order and focus.
The default slot is app-owned and the `grid` part uses `--grid-card-gap` (HA default 8px).

Both layouts use local theme and typography tokens. They have no network behavior,
data fetching, layout persistence, application routes or framework-specific renderer.
