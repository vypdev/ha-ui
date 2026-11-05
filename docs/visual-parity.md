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
| 4 | Text fields and single/multiple selects | Filled fields, the single picker and multiple dropdown chips/search have original HA reference gates below; explicit list modes remain required |
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

Native overflow gesture checks include releasing a drag outside the bar, then starting a fresh
pointer activation and keyboard activation. The existing mousedown handler retires the prior
gesture and clears suppression before that new click. Link/panel modes and LTR/RTL pass this
actual installed-core sequence in measured Chromium, Firefox and WebKit; it does not establish
the full browser matrix. Review counterexamples and native reassessment are recorded separately
from production fixes.

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

## Filled single select and menu

The [select reference](evidence/ha-select-reference.json) retains 38 original states for each of
macOS ARM64, Linux ARM64 and Linux x64: empty/placeholder/filled, hover and keyboard focus, disabled, required, helper/error,
narrow and long labels, RTL, optional clear and open menus with pointer or keyboard interaction.
Two independent original campaigns agree for all 114 unmodified PNGs. Public HA module functions,
recorded tokens and exact Roboto bytes run in fresh documents without application startup, HA API
access or credentials. The reviewed source revision and installed public bundle identities remain
distinct. Multiple/chips/search references have their own gate below.

The filled surface is at least 56px, with 4px top corners, a 1px underline, 12px/18.4px floating
caption and 14px/22.4px value. Empty captions use 14px. Wrapping captions can grow the field. The
menu has an 8px radius and 40px option rows. Original arrow and clear SVG geometry is retained,
with a 44px native clear target. The authored combobox/listbox semantics preserve typed controlled
requests, cancelability, reset, validation and successful native form entries across all four bindings.
Keyboard preview, typeahead, commit/cancel, disabled choices and popup lifetime are tested separately
from paint. Ordinary hover motion is 15ms; OS reduced motion caps it at 1ms and preserves explicit zero.

The first hosted selector campaign exposed an architecture mismatch. Linux x64 CI was compared
with the Linux ARM64 originals: translucent dark shadows differed by one RGB level over roughly
10% of the image, while computed styles matched. Independent original x64 captures with the exact
CI Chromium 156.0.8078.4 agree; the same 38 original x64 images also match the pinned image's
156.0.8078.80 output. The immutable failed CI artifact passes against these x64 originals under
the existing bounds. The gate selects both platform and local Node/browser host architecture,
requires all 38 states, and records the actual browser version. Previous 76 reference images
remain unchanged. No renderer workaround or larger tolerance is used.

Popup positioning listens in capture at each shadow root in the anchor's composed ancestry,
including assigned slots, because native element scroll events do not cross a shadow boundary.
Real settled pointer-away scroll regressions distinguish ordinary ancestors from enclosing shadow
roots; a hover render must not mask the latter failure. All listeners share the popup's abortable
lifetime. Source cases and actual compiled-core journeys verify this behavior independently.

The selector gate requires geometry within 0.1 CSS pixel and exact measured typography, colors,
borders, radii and shadows. Whole original and candidate PNGs are decoded for read-only RGBA comparison.
For this family, the owner's nearly-identical acceptance permits a maximum channel difference of
6/255, a mean RGB channel difference of 0.01/255 and at most 1% changed pixels. All three bounds must
pass, alpha must match exactly, and dimensions must agree. Images are never masked, blurred,
resized or recomposited for acceptance. Unit counterexamples reject independent violations of every
bound. Existing button, field and navigation exact raster gates retain their existing requirements.
The retained images and per-state counters distinguish exact from nearly-identical results.

Each open state records its actual opener. Pointer-open menus keep the pointer on the trigger;
keyboard-open states use Shift+Tab and Enter before option hover or arrow navigation. An earlier
Linux original experiment retained an MD ripple hover layer after pointer departure despite the
native hover state clearing. Its event log recorded no pointerleave delivery. That observation is
retained in the reference descriptor; the product uses normal primary-pointer enter/leave and no
platform-specific hover workaround. Both accepted campaigns use the same explicit interaction protocol.

Original HA tokens are measured separately from the accessible catalog palette. Eight additional
default-rule axe scans cover light/dark open pointer, keyboard, error and empty menus in the actual
catalog component. The catalog declares its accessible select token overrides. No accessibility
rule is disabled. Single-picker calibration does not accept native multiple/list presentation,
custom font/theme breadth, the full browser/framework matrix, installed applications or human UX.

## Multiple dropdown chips and search

The [multiple-select reference](evidence/ha-select-multiple-reference.json) retains 30 original
states for each of macOS ARM64, Linux ARM64 and Linux x64. These cover empty/required/filled chips,
remove hover/focus, disabled, narrow, RTL, helper text and open search with filtering, no matches
and keyboard preview. All 90 raw PNGs agree with independent original repeats. The Linux x64
campaign uses the exact CI Chromium 156.0.8078.4 in an offline official AMD64 image. The existing
60 ARM64 images and their inputs remain unchanged. The gate selects platform and architecture
and checks every original hash before comparison. All 90 candidate states pass: 59 exact images
and 31 within the unchanged selector bounds. The maximum channel difference is 2/255.

Chips and the filled add action paint at 32px. Selected chip labels are 14px/20px; the action uses
14px/14px medium text and the original 24px playlist-plus SVG. The dialog body has an 8px radius,
the recorded HA shadow, a 40px search field and 48px choice rows. Query clearing retains its
original close glyph, and a no-match status retains the original search glyph and text layout.
The body reserves its initial results height during filtering and follows the whole field anchor
in both writing directions. Original painted geometry and whole RGBA images use the existing
selector bounds above; the comparison performs no masking or image transformation.

The original search icon path and its screen transform matched before the raster gate passed.
The light glyph still differed by 7 RGB levels at three edge pixels, and the Linux dark dialog
had smaller differences across its shadow. An isolated counterexample changed only whether the
open paint surface requests its own compositor layer. The same geometry and SVG then pass in
all three reference environments with no platform-specific offset or new tolerance.

The authored native modal and named search combobox preserve focus, typed controlled requests,
cancellation, reset, restoration and disabled-fieldset behavior independently from paint. Chip
removal and add buttons use minimum-44px native targets around the original painted surfaces.
The host explicitly reserves 12px after its painted field. This accessibility layout exception
is asserted separately; the host's outer height is not claimed to match the original 32px action
layout. Search clearing also has a 44px native target around the original 24px icon slot.

Original wrapper quirks are explicit fixture mappings: its disabled input is forwarded through
the nested chip's public disabled property, and multiple-option fixtures are all enabled because
the observed wrapper drops each option's disabled flag. The authored policy continues to reject
disabled choices; original quirks do not authorize a product regression. The catalog declares
accessible search-placeholder and dark action colors separately from original-token fixtures.
Eight independent default-rule axe scans cover light/dark open choices, filtering, no matches
and empty dialogs. Source tests and actual installed consumers remain separate acceptance gates.
Custom font/theme breadth, complete browser/framework coverage, deployed applications and human
UX remain outside this increment's acceptance.

## Visible radio and checkbox lists

The [list reference](evidence/ha-select-list-reference.json) records the actual Home Assistant
`ha-selector-select` in explicit list mode. On each of macOS ARM64, Linux ARM64 and Linux x64,
it contains 40 states: single and multiple, light and dark, with empty, filled, hover, keyboard
focus, disabled, required, helper, narrow, right-to-left and no-option variants. Every original PNG
agrees byte for byte with a separate capture. All 120 compiled candidate PNGs match exactly,
including alpha. The comparison also checks measured geometry, glyph positions and paint styles.
It uses the same selector bounds, fonts and original asset provenance as the dropdown tests.

The radio rows match HA's label spacing and 20px mark, including its physical margins in RTL.
Checklist rows match the 20px checkbox and wrap long copy. The checkbox reuses the attributed
Font Awesome check path with Web Awesome's inline translation. A counterexample without that
translation reproduced the remaining edge-pixel difference with otherwise matching geometry.
Helper text keeps HA's horizontal inset and follows the list without a top margin.

The candidate uses a native radio or checkbox over each full row. The test checks that adjacent
targets do not overlap and that rows are at least 44px tall for radios and 40px for checkboxes.
Required guidance and empty-list status remain accessible; the application keeps control of the
typed model. The compiled catalog exercises both stories across EN/ES, light/dark and wide/narrow
layouts with default axe rules. Installed consumers exercise cancellation, keyboard selection,
disabled choices, fieldsets, reset and repeated form entries in the four framework bindings.
Original screenshots use fictional category names and recorded public modules; the suite makes
no Home Assistant API requests.

## Native modal dialog

The [dialog reference](evidence/ha-dialog-reference.json) measures the actual Home Assistant
dialog, header, footer and buttons. Each of macOS ARM64, Linux ARM64 and Linux x64 contributes
32 independently repeated originals: both themes; all width presets; standard and alert at
small widths; short viewports; RTL and subtitle; hover and focus; pending and disabled
confirmation; optional footer; and long content at the top, middle and bottom. The Linux x64
capture uses the exact CI Chromium. The original public component modules are unchanged.

The shared surface follows the 580px medium width, 24px radius, backdrop and scroll edges.
At narrow or short viewports, the standard dialog occupies the available screen while the alert
retains a centered panel. The close button uses the original 10% current-color hover overlay
and inset focus ring. Footer commands keep their 40px paint; the separate native controls use
44px targets, which are measured independently. Scrolling displays the original top divider
and edge fades while leaving commands visible.

All 96 candidate images satisfy the same whole-image bounds used for near selector parity:
no dimension or alpha difference, peak RGB channel difference at most 6/255, mean difference
at most 0.01/255 and at most 1% changed pixels. 83 images are exact; the other 13 differ by
at most 1/255 in a channel. No mask, resampling or new tolerance was used. The comparison
also checks geometry, text placement, colors, shadows, focus paint and scroll position.

Chrome separately confirms the matching desktop surface and tests dismissal, confirmation and
return to the opener. The product adds a reliable accessible modal name and honors projected
autofocus across Chromium, Firefox and WebKit. This lifecycle and default axe coverage are
separate from the raster comparison.

## Card surface and projected actions

The [original HA card record](evidence/ha-card-reference.json) uses public installed module
95788 in `47578.fba66e0739297711.js` and fictional content. Two independent runs on each of
macOS ARM64, Linux ARM64 and Linux x64 reproduce 16 images per platform. The eight states
in both themes include body only, titled, raised, projected action, 180px wrapped title,
Arabic right-to-left, overridden surface tokens and heading only. Identical original PNG
bytes share a reference path; the manifest still records each platform measurement separately.

All 48 candidate images match the original raster exactly on the three measured platforms.
The static gate checks surface and part geometry, title/body text geometry, typography, border,
radius, shadow, action divider and the full raster. It measures the projected command's original
40px paint separately from the shared 44px native target. The named native article and heading
level, ordinary keyboard order, slotted form submitter and collapsed optional parts are exercised
separately in the actual installed core and the real framework fixtures.

## Inspecting original captures

Each reference family stores a standard `originals.tar` and its `index.json` under
`tests/storybook/reference/<family>/`. Capture manifests keep their original logical
path and SHA-256. The path after the family name is the archive member. For example:

```bash
tar -xOf tests/storybook/reference/ha-card/originals.tar macos-arm64/light-header.png > original-card.png
```

The archives preserve the captured PNG bytes. The index identifies the archive digest and
each member's byte range; the gate validates both the archive and the individual capture
against their recorded SHA-256 before comparison. The independent reference inventory
requires every recorded image to be present and every indexed member to have a receipt.
`packRasterSet` in `tooling/raster-archive.mjs` produces deterministic ustar bytes from
a map of relative PNG names to original buffers. Archived images remain independent of the
compiled renderer and are never included in the shared runtime packages.

## Rows and grids

The [original layout record](evidence/ha-layout-reference.json) covers single and double line
rows, projected leading content and actions, narrow wrapping and right-to-left text. It also
covers the original Lovelace three-column grid, a one-column narrow result, square cells and
two columns with right-to-left flow and a custom gap. The candidate reaches the narrow
result using its own container width. The gate compares native row text and action geometry,
grid tracks, nested card geometry and the full raster. The decorative row icon is a 16px SVG in both fixtures, so
its geometry is independent of the operating system font set. All 48 layout captures match the original raster
exactly on macOS ARM64, Linux ARM64 and Linux x64.

Card and layout reference captures load the same local Arabic fallback in the actual HA
module and the compiled candidate. The exact [font identity and license](provenance.md#measured-ha-row-and-grid-layout)
are recorded independently of the renderer. This keeps RTL assertions reproducible even
when a host or CI runner supplies a different fallback font.

## Notices, empty states and loading

The [feedback reference](evidence/ha-feedback-reference.json) compares 22 states per platform,
including all four notice tones, a narrow action, Arabic direction, reduced-motion loading,
and three empty-state configurations in light and dark. All 66 Chromium captures are
pixel exact across macOS ARM64, Linux ARM64 and Linux x64. Notice and spinner references
come from the installed Home Assistant frontend; empty-state references come from the
separately identified official frontend 20261028.4 release.

The error action retains the original 40px visible button and at least a 44px native target.
The static catalog and the installed core exercise the error-to-empty transition, native form
submission and retained keyboard focus. The same journey passes Chromium 156.0.8078.80,
Firefox 157 and WebKit 27.2. The independent accessibility matrix exercises the error,
empty and loading stories in both languages, themes and viewport sizes.
