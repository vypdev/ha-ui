# Add an accessible form-associated multiline text area

- Status: Implementation under review; cohort publication and Domus adoption pending
- Catalog capability: shared-ui-foundation

## 1. Executive summary

Add a separate, accessible `vyp-ha-textarea` control to the shared UI library and its React, Vue, Angular, and Svelte adapters. It accepts literal multiline Unicode text, including supplementary characters, while preserving the existing single-line field contract. The recommended default is three rows; values and configured lengths are bounded at 16,384 Unicode codepoints. Form behavior follows the native textarea interaction: Enter inserts a newline, and labels, help, validation, focus, reset, and restoration remain usable to people and applications.

```text
Choose an accessible note field -> enter and validate multiline text -> retain it through controlled updates and form recovery -> consume it through a supported adapter
```

The text stays inert and literal in every state. The shared library owns presentation and accessibility; applications own domain rules, permissions, and recovery policy.

Implementation checkpoint (2026-11-21): the separate core control, four adapters, catalog examples and executable consumers now exist. Their API and observed qualification are recorded in `docs/textarea-contract.md` and `docs/evidence/multiline-textarea.json`. Selected-source statements below describe the earlier native admission baseline; they do not describe the current implementation inventory. Component review, reviewed cohort publication and installed Domus adoption remain separate gates.

## 2. Problem, current behavior, and evidence

### 2.1 Problem

Domus #157 needs a shared note control for a protected shopping-request form that preserves multiline text and correctly accepts 1,000 Unicode codepoints, including supplementary characters. Reusing the existing single-line field would either reject newlines or weaken its established contract. A separate textarea lets applications use native multiline editing without changing existing field behavior. See [issue #42](https://github.com/vypdev/ha-ui/issues/42) and [Domus issue #157](https://github.com/vypdev/domus/issues/157).

### 2.2 Current behavior

1. The selected source contains an implemented text-field value validator. `packages/core/src/field-contracts.ts`, function `textFieldValue`, rejects non-string values, values over its bound, and values containing CR or LF; it returns accepted text unchanged.
2. The existing React, Vue, Angular, and Svelte field bindings use the single-line field contract. The retained `specs/numeric-text-field.md` describes additions to that field while preserving its exact-string, single-line behavior.
3. The selected tree's catalog registers the shared foundation and its existing specifications. It records the foundation as proposed and explicitly describes the capability as partial; this draft does not treat that registration or existing field implementation as evidence that a textarea exists or has passed acceptance.

### 2.3 Evidence

- Selected-source contract: `packages/core/src/field-contracts.ts`, function `textFieldValue`.
- Existing field ownership and shared API: `specs/shared-ui-foundation.md`, sections 1–4 and 6.
- Existing single-line field increment: `specs/numeric-text-field.md`, sections 1–4 and 6.
- Framework delivery boundaries and retained ownership: `specs/shared-ui-framework-delivery.md`, sections 1–4.
- Catalog status and registered owner: `specs/catalog.json`, capability `shared-ui-foundation`.
- Concrete motivating journey: issue #42 and Domus issue #157.
- Admission evidence limitation: the selected baseline did not establish a textarea. Current implementation paths and local qualification are registered separately in the catalog and focused acceptance record; publication and installed Domus adoption remain pending.

## 3. Actors, surfaces, and terminology

| Actor | Goal | Entry point | Visible surfaces |
|---|---|---|---|
| Household member | Enter and correct an accessible multiline note | Domus or another consuming application | Application form with label, help, validation, and recovery feedback |
| Application developer | Keep controlled multiline values and form behavior consistent | Direct DOM/Lit use or a supported framework adapter | Typed imports, events, forms, examples, and documentation |
| Component maintainer | Deliver one shared implementation and verify its consumers | Shared library source and review | Contracts, browser behavior, adapters, packed consumers, and catalog |
| Publication and adoption owners | Review a cohort and qualify the motivating application journey | Reviewed publication flow, then Domus #157 | Publication evidence and a separate application acceptance result |

**Textarea** means the new multiline control and its independent public contract. **Single-line field** means the existing `textFieldValue` contract and its adapters; this companion preserves that contract. **Controlled value** means the application supplies the accepted value and handles typed user requests. **Codepoint limit** counts Unicode codepoints, not UTF-16 code units. **Published cohort** means the reviewed compatible package set; publication does not establish Domus adoption. The shared component owns visual behavior and accessibility; consuming applications own their data, authorization, domain validation, and operation recovery.

## 4. Goals, non-goals, and fixed invariants

### 4.1 Goals

1. Provide a separate `vyp-ha-textarea` contract, registration exports, and typed React, Vue, Angular, and Svelte adapters, using the shared library's DOM properties, attributes, typed events, applicable slots, and theme tokens.
2. Accept well-formed Unicode multiline values, including tab, LF, and CR; reject other C0 controls and DEL. Keep text literal and inert. Preserve programmatic content and document native textarea line-ending behavior for user edits. Enforce the 16,384-codepoint value and length bound, with defaults of zero minimum and the declared maximum; reject invalid limits and ensure UTF-16 `maxlength` does not block valid supplementary characters.
3. Provide a three-row default and reviewed integer row values from 2 through 20, plus usable narrow layouts. Support accessible labels and help, placeholder, required/readOnly/disabled states, localized validation messages, focus and blur, accurate validity reporting, form association, fieldset disablement, reset, and state restoration. Enter inserts a newline. Controlled updates remain intact, and malformed event payloads are rejected before framework callbacks.
4. Verify the control through direct DOM/Lit use and real packed-package consumers for all four adapters. Cover multiline events, invalid values, forms, reset and restore, disabled/readOnly behavior, lifecycle/remount, framework compatibility, and Next.js, Nuxt, and SvelteKit server-import/client/hydration boundaries. Framework interoperability alone does not demonstrate SSR support.
5. Add catalog examples for normal, multiline/Unicode, validation, disabled, and read-only states with localized labels and both themes. Retain complete supported global and per-file coverage for core, contracts, adapters, and integration code, plus the repository's full browser and consumer checks.
6. After component and review acceptance, use the documented reviewed version-cohort flow; separately validate Domus #157 against that exact published cohort, including multiline/Unicode entry and recovery.

### 4.2 Non-goals

1. Change the existing single-line `textFieldValue` contract or its adapter APIs.
2. Put application models, permissions, domain validation, or Lit-only callback types in the shared library contract.
3. Interpret entered text as HTML, Markdown, a link, or a command, or add application-specific shopping-request policy to the shared component.
4. Treat a successful component or package check as proof of publication, Domus adoption, or deployment.

### 4.3 Fixed product/safety invariants

1. `specs/shared-ui-foundation.md` remains authoritative for the existing shared contract, UIF-01 through UIF-08, its 64 baseline cases, adapters, aliases, reverse mappings, and application-adoption gates. Retain and reference those cases; this companion adds its own scoped cases without renaming, replacing, or recounting owner cases. `specs/shared-ui-framework-delivery.md` continues to own delivery controls.
2. One common implementation owns textarea visuals and accessibility; adapters bind framework lifecycle and form behavior without creating separate visual implementations. The established single-line validator remains single-line.
3. Invalid or prohibited text is rejected without interpreting it or leaking its contents in diagnostics. Programmatic values are not silently normalized; native user-edit line-ending behavior is explicit.
4. Do not claim support, acceptance, publication, or adoption without corresponding evidence. Keep publication and Domus adoption as separate gates, and preserve the specified coverage and browser/consumer checks.
5. Specification publication must make three outcomes observable: the specification satisfies the required format; internal and cross-document consistency is checked; and reciprocal catalog ownership, paths, and evidence agree with the generated view.

| Requirement | Behavior |
| --- | --- |
| SDD-I42-U1-R1 | Provide a separate `vyp-ha-textarea` element, public contract and registration exports, and typed React, Vue, Angular, and Svelte adapters. Keep the common API on DOM properties, attributes, typed events, applicable slots, and shared theme tokens; keep application models, permissions, domain validation, and Lit-only callback types outside the library contract. Preserve the existing single-line `textFieldValue` contract and adapter APIs. |
| SDD-I42-U1-R2 | Accept well-formed Unicode multiline values, including tab, LF, and CR; reject other C0 controls and DEL. Keep text literal and inert, without interpreting it as HTML, Markdown, a link, or a command. Preserve programmatic value content; user input follows native textarea line-ending behavior. Bound values and configured lengths at 16,384 Unicode codepoints, count codepoints, ensure native UTF-16 maxlength does not block valid supplementary-character values, default minimum length to zero and maximum to the declared bound, and reject invalid limits. |
| SDD-I42-U1-R3 | Default to three rows; support reviewed integer row values from 2 through 20 and usable layout at narrow widths. Support clear labels, description/help, placeholder, required, readOnly and disabled states, custom/localized validation messages, focus/blur, accurate checkValidity/reportValidity, form association, fieldset disablement, reset, and state restoration. Enter inserts a newline. Value-request events and framework model bridges accept the multiline contract without widening the existing single-line validator; preserve controlled updates and reject malformed event payloads before callbacks. |
| SDD-I42-U1-R4 | Render inert literal text in every state with visible focus, adequate touch targets, readable light/dark tokens, and no horizontal overflow at 390 px. Deliver direct DOM/Lit consumption and real packed-package React, Vue, Angular, and Svelte consumers. Exercise controlled values, multiline events, invalid values, forms, reset/restore, disabled/readOnly behavior, and lifecycle/remount. Maintain the documented framework matrix and real Next.js, Nuxt, and SvelteKit server-import/client/hydration boundaries; framework interoperability alone is not SSR evidence. |
| SDD-I42-U1-R5 | Add catalog normal, multiline/Unicode, validation, disabled, and read-only examples with localized labels and both themes. Maintain complete supported global and per-file coverage for core, contracts, adapters, and integration code, plus the repository's full browser and consumer checks. |
| SDD-I42-U1-R6 | Publish through the documented reviewed version-cohort flow when the component and review pass; validate Domus #157 against that exact published cohort and its motivating multiline/Unicode/recovery journey as a separate adoption gate. Preserve the existing owning contract and cases, aliases, and reverse mappings. Retain section 19 observable publication outcomes: the specification satisfies the required format; internal and cross-document consistency is checked; reciprocal catalog ownership, paths, and evidence agree with the generated view. |

## 5. Current versus proposed product journey

The existing shared field is single-line: `textFieldValue` rejects CR and LF in `packages/core/src/field-contracts.ts`, and the shared foundation keeps application state in the consuming app. Preserve that contract and its adapter APIs. The proposed journey adds a separate `vyp-ha-textarea`: an app supplies its multiline value and accessible field configuration, the member enters or edits text with Enter inserting a newline, and the app receives a typed value request to accept or reject through its controlled update. The control participates in native form behavior, while application models, permissions, and domain validation remain app-owned.

For Domus #157, the protected shopping-request form can accept a note with separate lines and up to 1,000 Unicode codepoints, including supplementary characters. On invalid input, the control exposes its configured validation state and the app retains its operation and draft for correction or recovery. Publication of the reviewed package cohort and Domus adoption against that exact cohort are separate outcomes.

## 6. Functional behavior and state model

### 6.1 Happy path

1. The consuming app imports and registers the separate textarea contract and configures its label, optional description/help and placeholder, constraints, and initial controlled value.
2. The member enters literal multiline text. The control accepts well-formed Unicode, tab, LF, and CR; rejects other C0 controls and DEL; and never interprets content as HTML, Markdown, a link, or a command.
3. A user edit emits one typed value-request event with the documented reason and cancellation semantics. The app validates its own domain rules and supplies the accepted controlled value. Setting a property programmatically is not a user action and emits no change request.
4. The form can inspect validity, report invalidity, submit the named value, reset, and restore state. Focus, blur, required, read-only, disabled, and fieldset-disabled behavior remain observable through the control.

Programmatic values preserve their supplied literal content; user edits follow native textarea line-ending behavior. Do not silently normalize programmatic values. Count Unicode codepoints for value and configured-length limits, with a 16,384-codepoint ceiling. Ensure native UTF-16 `maxlength` behavior does not reject a value within that codepoint ceiling solely because it contains supplementary characters. Default minimum length is zero and maximum is 16,384; reject malformed values, invalid limits, and minimum greater than maximum. Invalid property assignment must not replace the last accepted state. Validate malformed event payloads before invoking framework callbacks, and preserve controlled updates.

### 6.2 Alternatives and failure

Empty, too-short, too-long, malformed, and custom-invalid values expose accurate validity flags and the configured localized message. Required, read-only, and disabled states retain their distinct semantics; disabled controls do not submit, while read-only controls remain available for form submission. A rejected controlled edit leaves the app's accepted value intact. Reset and restoration emit their documented reasons and do not bypass validation. Conflict or malformed registration fails with an actionable error rather than silently using an incompatible constructor.

### 6.3 Observable verification

Verify direct DOM/Lit and real packed-package React, Vue, Angular, and Svelte consumers, including controlled values, multiline events, malformed payload rejection, form behavior, reset and restore, disabled/read-only state, and lifecycle/remount. Verify actual Next.js, Nuxt, and SvelteKit server-import, client registration/mount, and hydration boundaries; framework interoperability alone does not establish SSR behavior. Confirm a three-row default, integer rows from 2 through 20, and usable layout without horizontal overflow at 390 px. The focused requirements and cases in the host inventory remain the acceptance inventory; publication and Domus adoption remain separate gates.

## 7. User-facing configuration

This control adds no application-model or domain-validation configuration. The public control inputs are the DOM properties, appropriate bounded attributes, typed events, applicable slots, and shared theme tokens established by the existing foundation. Applications own value acceptance and persistence.

Use three rows by default. Accept reviewed integer row values from 2 through 20 and reject values outside that range or non-integers. Default minimum length to zero and maximum length to the declared 16,384-codepoint bound; reject unsafe, negative, over-bound, or contradictory limits. The immutable value safety rules, inert literal rendering, and codepoint ceiling are not configurable. Required, read-only, disabled, label, description/help, placeholder, and localized validation content are explicit per-control inputs; do not add hidden library persistence or global locale state.

For a normal configuration, use three rows and the default length bounds with an app-provided label and locale-specific messages. A meaningful alternative is a reviewed row count such as five and a narrower application maximum, provided it is at least the configured minimum and within the fixed ceiling. Apps retain locale and draft persistence. The concrete public properties, precedence and recovery behavior are documented in `docs/textarea-contract.md` and exercised by the focused cases; do not infer them from the single-line `TextFieldState` in `packages/core/src/field-contracts.ts`.

## 8. Clean Architecture design

### 8.1 Responsibilities and dependency direction

The framework-neutral core contract owns multiline value validation, codepoint limits, row constraints, and typed event payload validation. The shared DOM component owns native textarea rendering, accessible associations, validity and form behavior, and visual states. React, Vue, Angular, and Svelte adapters bind their framework lifecycle and controlled-model conventions to that contract; they do not implement separate validation or visuals. Consuming applications own domain rules, permissions, models, and accepted mutations. Preserve the existing single-line field contract in `packages/core/src/field-contracts.ts` and its renderer in `packages/core/src/components/field.ts`.

Dependency direction is app composition to a selected adapter or direct DOM contract; adapters depend on the shared core contract; the shared renderer uses framework-independent policy. Core must not import framework adapters or application business rules, and adapters must not depend on one another or duplicate the shared renderer. The shared foundation specifies explicit registration, browser-safe contract imports, controlled state, and client registration boundaries; the framework delivery owner retains package, compatibility-cohort, and consumer qualification requirements.

### 8.2 Contracts and trust boundaries

Keep the multiline value and event types separate from `textFieldValue` and `fieldValueDetail`, which enforce the existing single-line API in `packages/core/src/field-contracts.ts`. Validate external property assignments and event details before state changes or callbacks; retain the prior accepted state on invalid assignment. Treat text and framework event payloads as untrusted data. Render text as inert text in every state, with no HTML parsing or executable interpretation. Framework bridges preserve controlled updates and reject malformed payloads before application callbacks.

### 8.3 Executable constraints and evidence

Enforce dependency direction, framework isolation, and contract validity through the repository's architecture and contract checks, with new cases covering the multiline boundaries. Verify the shared renderer and each real adapter through direct and packed consumers, and verify server-import/client/hydration behavior in the named framework fixtures. The case mapping in `docs/evidence/multiline-textarea.json` records observed commands and results. The original pinned SDK invocation and source hashes are documented in `docs/component-library.md#catalog-validation`. Native SDD publication verifies format, and SDK validation checks catalog paths, ownership and the generated view; neither substitutes for semantic review or executed product acceptance.

## 9. UI/UX and content contract

The multiline control follows the existing foundation’s accessible, keyboard-operable, light/dark presentation contract while providing native textarea behavior. It presents a clear label, optional description/help, placeholder, required marker, and distinct localized validation feedback. Help and error text remain separately associated with the control; the accessible name stays stable when required state is shown. Focus is visibly indicated, touch targets remain usable, and the layout has no horizontal overflow at 390 px. Text remains literal and inert in every state. Enter inserts a newline. The component supplies presentation and native form semantics; applications own domain messages, permissions, and business actions.

Default to three rows. Accept reviewed integer row settings from 2 through 20 and keep resizing usable at narrow widths. Support required, read-only, and disabled states; focus and blur; accurate `checkValidity()` and `reportValidity()`; form association, fieldset disablement, reset, and state restoration. Read-only content remains selectable and cannot be edited; disabled controls follow native unfocusable and unsuccessful-control behavior. Examples and acceptance evidence cover normal, multiline/Unicode, validation, disabled, and read-only states with localized labels in both themes. Framework consumers retain controlled updates: programmatic property updates do not become user edit requests, and malformed event payloads are rejected before adapter callbacks. The shared API uses DOM properties, attributes, typed events, applicable slots, and shared theme tokens; it does not expose application models or Lit-only callback types. Preserve the existing single-line `textFieldValue` contract and adapter APIs.

For the user-facing examples, show a short label, concise help, and a two-line note as literal text; show a required-field error beside the associated control with the corrective action plainly stated. Render errors and focus with text and shape as well as color. Verify accessible names and descriptions, keyboard operation, visible focus, touch target adequacy, readable light/dark tokens, localized labels, and narrow layout. The motivating consumer’s 1,000-codepoint Unicode note, including supplementary characters and recovery, is an adoption acceptance journey, separate from the component’s 16,384-codepoint bound.

## 10. Failure, recovery, and cleanup

Reject malformed Unicode, prohibited C0 controls, DEL, invalid length limits, and values beyond 16,384 Unicode codepoints without replacing the last accepted controlled value. Tab, LF, and CR are permitted in well-formed programmatic content; programmatic values retain their literal content. User edits follow native textarea line-ending behavior. Length checks count Unicode codepoints, including supplementary characters; native UTF-16 `maxlength` must not block otherwise valid values. Minimum length defaults to zero and maximum length defaults to the declared bound. Report the failing constraint through the control’s localized validation message and native validity APIs so the user can correct the field and retry submission.

Invalid row settings outside the supported integer range are rejected without silently substituting a different layout. Invalid adapter event payloads are rejected before callbacks, preserving the last controlled value. Reset restores the form’s default value, and state restoration restores the browser-provided control state without converting programmatic content into a user edit. Disconnect/remount releases owned listeners and restores one active subscription set; it must not clear application drafts. Form or validation failure retains the user’s current valid draft for correction. The component does not retry or perform application mutations; recovery actions and operation receipts remain application-owned.

## 11. Security, permissions, and privacy

Treat values, labels, help, placeholders, and event detail as untrusted text. Render them as inert text; never interpret or execute them as HTML, Markdown, links, or commands. Validate well-formed Unicode, prohibited controls, length, and event payloads at the component and adapter boundaries. Keep the existing single-line validator unchanged: multiline acceptance belongs only to the separate textarea contract and its bridges.

The shared component introduces no application permissions, storage, analytics, network access, or domain validation. Applications retain authorization and privacy decisions. Tests use fictional content and include injection-shaped text, prohibited controls, malformed values, and supplementary Unicode. Do not log or persist entered notes for diagnostics; operational evidence reports contract outcomes without exposing field contents.

## 12. Observability and operational UX

Users receive standard accessible labels, help, localized validation feedback, and native validity behavior. Consumers can inspect typed events and form state; failures identify the invalid constraint without echoing private field contents. The component has no background retry, remote telemetry, or application mutation. Framework interoperability evidence covers controlled values, multiline events, invalid values, forms, reset/restoration, disabled/read-only behavior, and lifecycle/remount.

Maintain the documented framework matrix and exercise real packed-package consumers for direct DOM/Lit and React, Vue, Angular, and Svelte. Verify Next.js, Nuxt, and SvelteKit server-import, client-registration/mount, and hydration boundaries; framework interoperability alone does not establish SSR support. Consumer evidence records the tested package cohort, framework/browser versions, and results. Catalog examples and browser/consumer checks must cover the specified states, Unicode behavior, and both themes. The focused acceptance record identifies the executed browser and consumer commands, exact local toolchain and results; final same-head CI and review remain required. A declared script alone is not evidence that it passed.

## 13. Compatibility, migration, rollout, and rollback

This is an additive, separate `vyp-ha-textarea` contract. Existing consumers retain the reviewed single-line `textFieldValue` behavior, including its rejection of CR/LF, and existing adapter APIs remain compatible. Do not widen the existing single-line validator to accommodate multiline values. Add public contract and registration exports plus typed React, Vue, Angular, and Svelte adapters through the existing reviewed component conventions. Verify direct DOM/Lit use and real packed-package consumers, including controlled updates, forms, reset/restoration, invalid values, disabled/read-only states, and lifecycle/remount. Keep server imports safe and establish client registration and hydration behavior in actual Next.js, Nuxt, and SvelteKit fixtures; do not claim universal server rendering from framework interoperability alone.

No migration of existing field values or in-flight application data is required. Applications adopt the new control through their own reviewed changes and retain their existing drafts and recovery paths. Publish only through the documented reviewed version-cohort flow after component and review acceptance. Validate Domus #157 against that exact published cohort, including its multiline/Unicode entry and recovery journey, as a separate adoption gate. Package publication does not imply consumer adoption; retain the prior tested consumer artifact/lock for rollback and do not clear application data to make adoption pass.

Publication acceptance keeps three observable outcomes: the specification satisfies the required format; internal and cross-document consistency is checked; reciprocal catalog ownership, paths, and evidence agree with the generated view. Keep these as publication constraints, separate from product behavior and the Domus adoption gate. The native admission run linked in the focused acceptance record verified this companion’s SDD publication. The original pinned catalog SDK was subsequently executed against the actual repository; its invocation and identity are documented in the component guide. Catalog consistency, semantic review and product acceptance remain distinct outcomes.

## 14. Testing strategy and numeric budget

The minimum is eight distinct cases, one for each independent behavior group in the admitted inventory. The groups cover the core DOM contract and Unicode handling; codepoint limits and narrow layout; browser form and accessibility behavior; framework adapters; packed-package and server consumers; catalog examples, coverage and consumer checks; publication and separate adoption; and specification publication consistency. These cases add focused textarea evidence and do not recount or replace the retained requirements or cases in `specs/shared-ui-foundation.md`, `specs/shared-ui-framework-delivery.md`, or `specs/numeric-text-field.md`.

The complete supported global and per-file coverage requirement for core, contracts, adapters and integration code remains in force, as do the required browser and consumer checks. Acceptance requires observed results for each applicable check and human review of visual, touch-target and narrow-width behavior. The selected project declares `pnpm@10.34.0`, Node `>=24.20.0 <25`, and package scripts for checking, testing with coverage, building, packed consumers and SSR. The focused acceptance record maps the executed checks to this companion’s cases and identifies the original SDK catalog-validation procedure. It reports local results and leaves reviewed publication and installed adoption pending. The publication consistency case records the three required observable outcomes: required format is satisfied, internal and cross-document consistency is checked, and reciprocal catalog ownership, paths and evidence agree with the generated view.

| Area | Minimum distinct cases | Behaviors/risks covered |
|---|---:|---|
| Core contract | 1 | Observable scenarios in the case inventory. |
| Core limits and layout | 1 | Observable scenarios in the case inventory. |
| Browser form behavior | 1 | Observable scenarios in the case inventory. |
| Framework adapters | 1 | Observable scenarios in the case inventory. |
| Packed and server consumers | 1 | Observable scenarios in the case inventory. |
| Catalog, coverage, and consumer checks | 1 | Observable scenarios in the case inventory. |
| Publication and adoption | 1 | Observable scenarios in the case inventory. |
| Specification publication consistency | 1 | Observable scenarios in the case inventory. |
| Total | 8 | Distinct inventory cases; repeated executions do not add cases. |

| Case ID | Area | Requirements | Scenario |
| --- | --- | --- | --- |
| inventory1-C01 | Core contract | SDD-I42-U1-R1, SDD-I42-U1-R2 | Direct DOM/Lit consumers use the separate textarea contract and typed events. Accept well-formed multiline Unicode and supplementary characters; reject prohibited controls and malformed values. Confirm text remains literal and inert, programmatic values retain literal content, and user edits follow native line-ending behavior while the existing single-line validator still rejects CR/LF. |
| inventory1-C02 | Core limits and layout | SDD-I42-U1-R2, SDD-I42-U1-R3, SDD-I42-U1-R4 | Verify codepoint length at the 16,384 bound with supplementary characters despite native UTF-16 maxlength; reject over-bound values and invalid limits. Verify default and configured minimum/maximum lengths, three-row default, accepted integer rows 2–20, rejection outside that range, and usable 390 px layout without horizontal overflow. |
| inventory1-C03 | Browser form behavior | SDD-I42-U1-R3, SDD-I42-U1-R4 | Exercise labels, description/help, placeholder, required/readOnly/disabled states, localized validation messages, focus/blur, checkValidity/reportValidity, form association, fieldset disablement, reset, and state restoration. Confirm Enter inserts a newline, focus is visible, touch targets are adequate, and light/dark tokens remain readable. |
| inventory1-C04 | Framework adapters | SDD-I42-U1-R1, SDD-I42-U1-R3, SDD-I42-U1-R4 | Use real React, Vue, Angular, and Svelte adapters with controlled values and multiline model events. Confirm malformed event payloads are rejected before callbacks, controlled updates are preserved, and disabled/readOnly, form, and lifecycle/remount behavior works in each adapter. |
| inventory1-C05 | Packed and server consumers | SDD-I42-U1-R1, SDD-I42-U1-R4 | Install real packed-package consumers for direct DOM/Lit and React, Vue, Angular, and Svelte. Exercise multiline values, events, invalid values, forms, reset/restore, disabled/readOnly, and lifecycle/remount. Verify the maintained framework matrix and Next.js, Nuxt, and SvelteKit server-import/client/hydration boundaries. |
| inventory1-C06 | Catalog, coverage, and consumer checks | SDD-I42-U1-R4, SDD-I42-U1-R5 | Inspect catalog examples for normal, multiline/Unicode, validation, disabled, and read-only states with localized labels and both themes. Verify required global and per-file coverage for core, contracts, adapters, and integration code, along with browser and consumer checks. |
| inventory1-C07 | Publication and adoption | SDD-I42-U1-R6 | After component and review acceptance, verify the reviewed version-cohort publication evidence and validate Domus #157 against that exact published cohort, including multiline/Unicode entry and recovery. Keep publication and Domus adoption as separate outcomes. |
| inventory1-C08 | Specification publication consistency | SDD-I42-U1-R6 | Observe that the specification satisfies the required format, internal and cross-document consistency is checked, and reciprocal catalog ownership, paths, and evidence agree with the generated view. |

## 15. Documentation and discoverability

The textarea documentation must explain the separate `vyp-ha-textarea` contract, recommended defaults and bounds, accessible labeling and validation, native line-ending behavior, controlled updates, form/reset/restore behavior, framework usage, the supported framework matrix, and server-import/client/hydration boundaries. Provide catalog examples for normal, multiline/Unicode, validation, disabled and read-only states, with localized labels and both themes. Keep examples aligned with real consumer behavior. The retained component-library guidance and contract documentation in `docs/component-library.md`, `docs/field-contract.md`, and `docs/migration.md` inform existing package, field and migration conventions; they do not establish completed textarea documentation.

The table below records the companion-specification create row from native admission. Current implementation and verification files are registered separately in `specs/catalog.json`, including `packages/core/src/textarea-contracts.ts`, `packages/core/src/components/textarea.ts` and all four adapters. Their observed component qualification is recorded in `docs/evidence/multiline-textarea.json`; reviewed publication and installed Domus adoption remain pending.

| Path | Change |
| --- | --- |
| specs/multiline-textarea.md | create |

[specs/multiline-textarea.md](multiline-textarea.md)

## 16. Acceptance scenarios

1. Given a direct DOM/Lit consumer, when it registers and uses the separate textarea contract, then typed events carry well-formed multiline Unicode values including supplementary characters, prohibited controls and malformed values are rejected, literal content remains inert, and user edits follow native line-ending behavior while the existing single-line contract continues rejecting CR/LF.
2. Given values and length limits at, below and above the declared bound, when codepoint validation runs, then supplementary characters count as codepoints, valid values are not blocked by native UTF-16 `maxlength`, over-bound values and invalid limits are rejected, defaults and configured limits behave as specified, and rows accept only integers from 2 through 20 with three as the default. At 390 px, the layout remains usable without horizontal overflow.
3. Given a user completing a form, when they use labels, help, placeholder, required, read-only or disabled states, then localized validation, focus and blur, `checkValidity` and `reportValidity`, form association, fieldset disablement, reset and state restoration behave correctly; Enter inserts a newline, focus is visible, touch targets are adequate, and both themes remain readable.
4. Given controlled React, Vue, Angular and Svelte consumers, when multiline model events and updates occur, then valid updates are preserved, malformed payloads are rejected before callbacks, and forms, disabled/read-only behavior and lifecycle/remount work in each adapter.
5. Given clean consumers of packed packages, when they exercise direct DOM/Lit and each framework adapter, then multiline values and events, invalid values, forms, reset/restore, disabled/read-only behavior and lifecycle/remount work; the maintained matrix and Next.js, Nuxt and SvelteKit server-import/client/hydration boundaries are verified independently of framework interoperability.
6. Given the catalog and integration evidence, when examples and checks are reviewed, then normal, multiline/Unicode, validation, disabled and read-only examples have localized labels and both themes, and required global/per-file coverage plus browser and consumer checks are evidenced.
7. Given accepted component and review evidence, when the reviewed version-cohort flow publishes the component, then Domus #157 is validated separately against that exact cohort for multiline/Unicode entry and recovery; publication does not imply adoption acceptance.
8. Given specification publication, when its evidence is reviewed, then the specification satisfies the required format, internal and cross-document consistency is checked, and reciprocal catalog ownership, paths and evidence agree with the generated view.

## 17. Requirements traceability

The following mappings are reciprocal with the admitted case inventory; existing owner case IDs remain references, not new definitions.

- `SDD-I42-U1-R1` — `inventory1-C01`, `inventory1-C04`, `inventory1-C05`.
- `SDD-I42-U1-R2` — `inventory1-C01`, `inventory1-C02`.
- `SDD-I42-U1-R3` — `inventory1-C02`, `inventory1-C03`, `inventory1-C04`.
- `SDD-I42-U1-R4` — `inventory1-C02`, `inventory1-C03`, `inventory1-C04`, `inventory1-C05`, `inventory1-C06`.
- `SDD-I42-U1-R5` — `inventory1-C06`.
- `SDD-I42-U1-R6` — `inventory1-C07`, `inventory1-C08`.

The core value, literal-text and compatibility evidence belongs to the direct contract case; limit and row behavior belongs to the limits/layout case; form semantics and visual accessibility belong to the browser case. Adapter, packed consumer, catalog/coverage, publication/adoption and specification consistency evidence is owned by the corresponding concrete journey described in section 16. This mapping is structural traceability, not evidence that implementation or acceptance checks have run.

| Requirement | Cases |
|---|---|
| SDD-I42-U1-R1 | inventory1-C01, inventory1-C04, inventory1-C05 |
| SDD-I42-U1-R2 | inventory1-C01, inventory1-C02 |
| SDD-I42-U1-R3 | inventory1-C02, inventory1-C03, inventory1-C04 |
| SDD-I42-U1-R4 | inventory1-C02, inventory1-C03, inventory1-C04, inventory1-C05, inventory1-C06 |
| SDD-I42-U1-R5 | inventory1-C06 |
| SDD-I42-U1-R6 | inventory1-C07, inventory1-C08 |

## 18. Implementation sequence

1. Register this companion under the retained shared UI foundation owner, preserving its requirements, cases, aliases, and reverse mappings. Keep the existing single-line `textFieldValue` contract unchanged. The textarea’s separate public contract, registration exports, and typed framework adapters must keep application models, permissions, domain validation, and Lit-only callback types outside the library API.
2. Define and verify the multiline value and limits: accept well-formed Unicode with tab, LF, and CR; reject other C0 controls, DEL, and malformed values; preserve programmatic content literally and follow native textarea line-ending behavior for user edits. Count Unicode codepoints through the 16,384 bound, including supplementary characters, and ensure native UTF-16 `maxlength` does not block valid values. Validate configured limits and rows, with minimum length zero, the declared maximum, three default rows, and supported integer rows from 2 through 20.
3. Implement the accessible native form behavior and verify labels, help, placeholder, required, read-only and disabled states, localized validation messages, focus/blur, validity reporting, form association, fieldset disablement, reset, state restoration, newline entry, visible focus, touch targets, readable themes, and usable layout without horizontal overflow at 390 px.
4. Deliver direct DOM/Lit use and React, Vue, Angular, and Svelte adapters. Verify controlled updates, typed multiline events, rejection of malformed event payloads before callbacks, forms, invalid values, disabled/read-only behavior, and lifecycle/remount. Then install packed artifacts in real consumers and verify the maintained framework matrix and Next.js, Nuxt, and SvelteKit server-import, client, and hydration boundaries. Framework interoperability by itself does not establish SSR support.
5. Add catalog examples for normal, multiline/Unicode, validation, disabled, and read-only states, with localized labels and both themes. Verify complete supported global and per-file coverage for core, contracts, adapters, and integration code, plus the repository’s browser and consumer checks. Keep examples and evidence aligned with the implemented behavior.
6. After component and review acceptance, follow the documented reviewed version-cohort publication flow. Separately validate Domus #157 against that exact published cohort, including multiline/Unicode entry and recovery. Publication evidence and consumer adoption are distinct outcomes.
7. Before specification publication, check format and internal and cross-document consistency, and verify that reciprocal catalog ownership, paths, and evidence agree with the generated view. Preserve the explicit observable outcomes in section 19; structural counts and traceability do not establish semantic completeness or executed acceptance. The original SDK invocation, source identity and observed result are recorded in the component guide and focused acceptance record; semantic review remains a separate gate.

## 19. Definition of Done

- [ ] Each of the six declared requirements is exercised by at least one concrete case, and each case maps only to requirements it exercises. Verify the core contract and literal Unicode behavior in inventory1-C01; bounds, codepoint counting, rows, and narrow layout in inventory1-C02; form and accessible states in inventory1-C03; adapter behavior in inventory1-C04; packed consumers and SSR boundaries in inventory1-C05; catalog examples, coverage, browser, and consumer checks in inventory1-C06; reviewed cohort publication and separate Domus adoption in inventory1-C07; and specification publication consistency in inventory1-C08.
- [ ] The separate `vyp-ha-textarea` contract, registration, and typed adapters satisfy the requested behavior while preserving the existing single-line contract and keeping application-specific policy outside the library API.
- [ ] Unicode acceptance and rejection, literal inert rendering, programmatic-value preservation, native user-edit line endings, codepoint limits, supplementary-character behavior, invalid limits, row bounds, and 390 px layout meet their observable criteria.
- [ ] Accessible form behavior, validation, focus, reset and restoration, fieldset behavior, newline entry, theme readability, and responsive/touch criteria pass in direct use and every supported adapter.
- [ ] Packed-package consumers and the maintained framework matrix pass; Next.js, Nuxt, and SvelteKit server-import/client/hydration boundaries have direct evidence.
- [ ] Catalog examples and required global and per-file coverage, browser, and consumer checks pass. Concrete invocations, toolchain prerequisites and observed results are recorded in the focused acceptance record.
- [ ] The reviewed version cohort is published only after component and review acceptance, and Domus #157 is separately validated against that exact cohort with its multiline/Unicode and recovery journey.
- [ ] The specification satisfies the required format.
- [ ] Internal and cross-document consistency is checked.
- [ ] Reciprocal catalog ownership, paths, and evidence agree with the generated view.
- [ ] The concrete invocation or prerequisite for each publication-consistency check is recorded only when verified; a declaration or structural mapping is not evidence that a check ran or passed.

## 20. References and decisions

- Issue #42: https://github.com/vypdev/ha-ui/issues/42 — request for a separate accessible form-associated multiline control.
- Retained owner: `specs/shared-ui-foundation.md`; framework delivery contract: `specs/shared-ui-framework-delivery.md`; existing single-line field contract: `specs/numeric-text-field.md`. This companion adds the bounded textarea delta and does not rewrite those owners.
- Domus adoption target: https://github.com/vypdev/domus/issues/157. Validate adoption only against the exact reviewed published cohort; it remains separate from publication acceptance.
- Decision: use a distinct textarea API with native multiline semantics and typed adapters. Preserve existing single-line validation and adapter APIs. Keep application models, permissions, and domain validation with consuming applications; keep text inert and literal.
- Current implementation evidence: `docs/textarea-contract.md` defines the public API; `docs/evidence/multiline-textarea.json` maps observed source, packed, SSR, coverage, browser and catalog checks to the eight native cases. The reviewed version-cohort publication and exact published Domus adoption remain outstanding.
