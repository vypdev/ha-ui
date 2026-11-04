# Home Assistant visual equivalence

The owner requires Storybook controls to look identical or nearly identical to the actual Home
Assistant controls. A generally similar appearance is insufficient. Gateway remains a reuse and
provenance reference; the running HA frontend is the visual reference when those references differ.
Gateway and Domus keep their own page composition and workflows. Their shared upper dashboard bar
and component implementation remain required by the retained foundation specification.

## Acceptance procedure

1. Observe HA and the production-backed catalog at the same font, language, theme, zoom, viewport
   and settled interaction state. Use a dedicated Chrome tab group when browser control is available;
   independent test-browser tabs can collect reproducible component measurements without interrupting
   the owner's browser or accessing household records.
2. Record the observed component, date, public bundle identities, font identities and source/license
   references. A current upstream git revision is not evidence of the installed HA git revision.
3. Compare typography, visible geometry, spacing, colors, borders, radii, icons, focus, hover, disabled,
   validation, checked/mixed and narrow/wrapped states. A matching component name or passing functional
   test is insufficient. Keep the native semantics and documented form model while correcting visuals.
4. Inspect the original reference and candidate images. Computed styles are asserted exactly where
   measured, with less than one CSS pixel allowed for text layout rounding. Screenshots supplement
   semantic and accessibility tests; a global screenshot score cannot establish UX acceptance.
5. Record remaining differences explicitly. Accessibility conflicts with a reference color or target
   remain review items; neither a silent palette substitution nor a disabled accessibility check
   establishes visual equivalence. Keep the capability incomplete until all required reviews pass.

## Current calibrated reference

The [checkbox reference](evidence/ha-checkbox-reference.json) comes from the real public HA component
loaded by the owner's local frontend in an isolated browser context. Only a fictional checkbox was
added to that browser document. No account, household record or service was changed. The reference
contains fourteen settled light/dark state measurements; animations were disabled for measurement.
The corresponding catalog gate runs offline against the built production component at `/ha-ui/`.
It retains original candidate images and compares the recorded geometry, typography and theme states.

The visible control is 20px, with a 2px border, 4px radius, 8px label gap and 14px Roboto text. A44px
invisible native input target preserves touch access without increasing the visible square or row.
The mixed flag stays independent of the boolean form model. The check icon, source notices and HA
style adaptation have [explicit licenses and provenance](provenance.md).

Roboto Regular and Medium in the catalog are the exact `roboto-fontface@0.10.0` WOFF2 bytes served
by the measured HA instance. They are bundled locally, with the Apache 2.0 license in the static build.
The catalog itself uses Roboto; Storybook's own manager chrome may retain its product typography.
Consuming apps supply their fonts as HA does; the shared component performs no font/network request.

## Review order and remaining work

| Order | Surface | Current status |
|---|---|---|
| 1 | Checkbox and catalog font baseline | Candidate calibrated against measured HA states; source, packed and static gates are recorded separately |
| 2 | Upper dashboard navigation | Recompare actual HA bar, indicators, spacing, focus and overflow before accepting adoption |
| 3 | Buttons | Recompare actual HA geometry, variants, colors, focus, hover and disabled states; current accessible fixture accent is not an assertion of HA palette equality |
| 4 | Text fields and single/multiple selects | Current border/native-control presentation differs from the HA reference; revise before visual acceptance |
| 5 | Remaining families | Capture the current HA counterpart and establish the same reference before implementing their visual layer |
| 6 | Gateway and Domus | Compare their real installed flows using the same accepted component cohort; app UX and human acceptance remain separate |

All 64 retained foundation cases and six delivery refinements remain required. This procedure refines
how their existing visual/accessibility review is evidenced; it neither replaces the owning SDD nor
claims that code coverage, checkbox calibration or a successful catalog build completes the library.

Reference images are retained under tests/storybook/reference/ha-checkbox with recorded SHA-256
identities. Reference and candidate captures require at least three original raster captures and
two consecutive identical frames, with a six-capture limit. This addresses observed compositor
lag; it does not change an image or relax the style comparison. Earlier contradictory frames
remain diagnostic evidence. Direct Chrome observation also covered marked and mixed entity-table
controls in the dedicated Efra-profile window, then restored selection mode without entity changes.

The catalog also inherits the measured HA antialiased font smoothing. Matching the WOFF2 file
and CSS font weight alone did not make its text raster match HA. The comparison asserts the
effective smoothing as well; small icon subpixel differences are not called pixel identity.
