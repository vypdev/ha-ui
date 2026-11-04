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
| 2 | Upper dashboard navigation | Text-only controls plus three icon/text presentations calibrated against measured HA states in both semantics; overflow calibrated separately below; custom theme/font breadth and installed-app acceptance remain required |
| 3 | Buttons | Original HA variants/states, native target and four bindings are calibrated below; accessible application accent overrides remain an explicit palette difference |
| 4 | Text fields and single/multiple selects | Filled text fields are being calibrated against original HA references below; native select presentation still requires calibration |
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


## Dashboard overflow baseline

The [overflow reference](evidence/ha-navigation-overflow-reference.json) retains twenty
independent original HA captures per measured platform: 240px, eight labels, light/dark,
LTR/RTL, logical start/middle/end and end-arrow hover/real keyboard focus. Original public
component modules, exact Roboto and recorded theme tokens are replayed without network
or application startup. Linux uses the pinned read-only Playwright image; its diagnostic
Node runtime does not expand the library support matrix.

The source gate checks both semantics against the measured scroll geometry, item/arrow
boxes, gradients, radii and focus state. The compiled catalog repeats those measurements
and preserves settled candidate frames independently of the source run. Reference images
remain unchanged and are verified by digest/dimensions. The arrow overlay measures 21px
at 14px font size; its native button is 40px with 12px radius and an 8.75px by 14px glyph.
Paging uses the viewport width with the measured one-pixel edge tolerance. The focused
edge-retention accessibility exception is documented in the component API and tested
separately from the matching visual states. Custom font/theme breadth, complete browser
support and Gateway/Domus adoption remain open.

## Button surfaces and native targets

The [button reference](evidence/ha-button-reference.json) records 96 original states per
measured platform: eight mapped variants in resting/hover/focus/disabled/active states,
light/dark, sizes, decorative leading/trailing/both/icon-only content and loading. Original
public HA functions remain unchanged. The fixture uses the public height override for
extra-large and the published HA icon-button part layout for icon-only composition.
Original images, fonts and theme values are independent of the candidate.

The native target remains at least 44px. A separately painted surface matches HA's 32/40/48px
small/medium/large controls; extra-large is 56px with HA large typography. The source gate
checks eighty settled geometry/color cases; the compiled gate additionally uses real pointer
presses and requires every measured original PNG to match byte for byte. Original color
transitions and label overflow clipping matter to raster equality. Focus and the controlled
pressed indicator follow the visible surface; loading keeps dimensions and centers a local
spinner. OS reduced motion bounds the surface transition to HA's imperceptible 1ms
maximum (an explicit host zero remains zero) and disables spinner motion. Long labels can grow instead of becoming unreadable in a fixed-height control.

The original HA light palette has measured text-contrast conflicts at 14px: brand accent
is 3.26:1, brand filled is 2.85:1 and warning accent is 2.21:1. Exact reference-token equality
and accessible application palettes are separate evidence. The standalone library fallbacks
are tested without a host theme. The catalog declares explicit accessible accent overrides,
including light brand #006fae, while retaining both automatic and independent axe scans.
This documented palette difference is not represented as exact original-palette acceptance.
Host applications own their final token pairs and their corresponding visual/accessibility
review. Other families, browser breadth and actual application acceptance remain required.

Each original and candidate state starts in a fresh browser document. A diagnostic original-HA
replay proved that reusing a document after earlier states can retain different Linux focus-ring
compositing, even after consecutive frames agree. Fresh original campaigns must agree independently;
no production paint workaround, edited image or raster threshold increase is used. All previously
accepted navigation references remain unchanged.


## Filled single-line text fields

The [field reference](evidence/ha-field-reference.json) retains 44 original states per platform
on macOS and Linux. Two independent original campaigns agree for all 88 images. Each state
starts in a fresh document, waits for the original lazy input registration, uses recorded HA
public theme tokens and exact Roboto bytes, and settles computed styles and consecutive images.
Public `--wa-form-control-required-content:none` suppresses a second Web Awesome marker while
retaining the HA wrapper marker and native required constraint. Direct Chrome observation of
live HA confirms one marker; that application uses its public label slot. The fixture's mapping
is explicit and does not modify component functions or original images.

Source comparisons cover the filled surface, native input, floating/resting label, underline,
hint, required/error/readonly/disabled states, placeholder and narrow wrapping. The compiled
catalog gate requires exact platform-specific image digests as well as styles and geometry;
reference images are never generated from ha-ui. Real painted-padding clicks, hidden-host
semantics, native/shared Enter interoperability and ordinary/OS-reduced/explicit-zero motion
are tested separately. Current acceptance receipts belong to the candidate that produced them;
a passing published button cohort does not validate uncommitted field work.

Original HA colors are calibration inputs, not a contrast guarantee. Standalone fallback and
catalog field colors are checked independently with actual focused/hovered backgrounds and
placeholder colors. Catalog overrides remain scoped to its field demonstrations and do not
change original-token proof fixtures. See the [field contract](field-contract.md) for the
controlled API, native blocker bookkeeping and the remaining input/application scope.
