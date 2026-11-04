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
| 2 | Upper dashboard navigation | Text-only controls plus three icon/text presentations calibrated against measured HA states in both semantics; overflow affordances and installed-app acceptance remain required |
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

## Dashboard text-tab baseline

The [navigation reference](evidence/ha-navigation-reference.json) records the original public
`ha-tab-group`/`ha-tab-group-tab` modules with the reviewed `hui-root` dashboard styles. The
fixture exports the installed public bundle loader instead of starting the application; the
component module functions and styles are unchanged. It uses an isolated, unauthenticated
fictional document, the actual public theme values and exact Roboto files. It reads no
household API or credentials. Its bootstrap, original public asset digests and limitations
are recorded separately from the direct Efra-profile Chrome observation of HA and Gateway.

Eight original light/dark resting, hover, focus and disabled captures are retained unchanged.
The 17 source-browser cases reproduced the earlier mismatch before correction (16 state
cases initially failed on line height), then verify both native-link and panel-tab semantics
plus live public-theme overrides. The built-catalog gate independently compares both modes
against those eight states. Native 56px targets, 14px Medium Roboto/22.4px line height, label
position, 0.8 inactive opacity, additional 0.5 disabled-content opacity and the gray inset focus
ring match the scoped measurements. Text layout rounding has a tolerance below one CSS pixel.

This baseline accepts neither icon presentation nor the overflow affordances and responsive
composition. Those remain part of the full navigation family and both application-adoption
reviews. A matching text-tab measurement or passing functional/coverage check does not complete
that family or the library. The first candidate exposed a different bottom track row and the native button label
0.796875px below the reference. Both were corrected in the shared renderer. Read-only decoding
of all16 final local samples finds zero changed pixels against their original references.
This is scoped to the pinned local Chromium/macOS captures; the hosted cross-platform gate
checks exact styles and geometry, rather than requiring platform-specific raster identity.
No full navigation or human UX acceptance is claimed.


### Measured Linux baseline

The first hosted source campaign at `c81b559` failed16 cases because Linux was compared with
macOS glyph advances. Independent replay of the original public HA modules in the official
Playwright1.64.1 Noble image reproduces91px for Overview in both HA and the candidate; macOS
measures89.484375px. The verified font bytes and14px/500 typography are identical. The Linux
capture uses no network and preserves the original public module bytes, recorded themes and
fonts. It is a component fixture, not a full Node/toolchain CI reproduction.

The reference now retains eight original states per measured platform. Source and built-catalog
checks require an explicitly measured browser platform and all four states per theme. They retain
the same style assertions, less-than-one-pixel layout tolerance and 0.1px vertical-position bound;
no broad threshold increase, ignored state or automatic baseline update is used. Unmeasured
platforms fail rather than silently choosing another platform's reference.


## Dashboard icon/text baseline

The [icon navigation reference](evidence/ha-navigation-icons-reference.json) retains 24 unedited
original captures on each of macOS and Linux. The same actual public HA component modules render
original fixture glyphs through `ha-svg-icon`, with the reviewed dashboard icon spacing applied.
The fixture replays recorded public module bytes, theme tokens and fonts without network or HA
application startup. Component module functions remain unchanged. The reviewed source revision is
not claimed to be the installed HA git revision. These are controlled component observations,
separate from actual installed-app and human UX acceptance.

Icon-only controls measure 56px by 56px, containing a 24px icon at x16/y16. Icon-and-text controls
retain that icon position and an 8px gap; the 14px/500 text uses the measured platform's glyph advance.
The visible content's top/bottom padding is 16px/12px. Selected, inactive, disabled and focused states
use the same header palette, opacity and focus rules as text tabs. Both semantic modes are tested.
Runtime labels remain required and accessible even when hidden visually; SVGs remain decorative.

The new source cases were red before the renderer supported these fields. Adding an explicit label
span also exposed a measurement problem in the older text gate: a Range over the enclosing span
included the child's line box, rather than only its text glyphs. The corrected probe selects the
label's text contents and retains the original reference images, exact style assertions and 0.1px
vertical bound. Original failure diagnostics remain evidence; no tolerance was increased.

The compiled catalog asserts exact measured state/style values and less-than-one-pixel geometry,
with a 0.1px vertical bound, against all three icon/text presentations. Original images are verified
by digest and dimensions before each comparison. Scoped raster inspection and current package
identities are recorded separately in the [implementation evidence](evidence/shared-ui-foundation.json).
Custom font/theme breadth, overflow affordances, other component families and both application
adoptions remain required under the unchanged 64 foundation and 6 delivery cases.
