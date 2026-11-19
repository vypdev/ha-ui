# Numeric keyboard hints for the controlled text field

- Status: Draft
- Owners: vypdev maintainers and shared UI consumers
- Scope: The optional numeric hint in the shared text-field state
- Open decisions blocking readiness: none

## 1. Executive summary

An application opts into a numeric keyboard hint for an integer identifier.
The existing shared text input retains exact controlled strings. All framework
adapters consume the same validated state and renderer.

## 2. Problem, current behavior, and evidence

The current public field state admits the optional decimal hint. Its contract
validator and tests reject numeric. Domus #91 enters GTIN strings with leading
zeroes and needs the numeric hint through the released component API.

## 3. Actors, surfaces, and terminology

An application supplies field state and accepts controlled value requests.
The member edits the rendered text field with keyboard or touch. Numeric and
decimal are native input-mode hints. Application code owns domain parsing,
normalization and validation.

## 4. Goals, non-goals, and fixed invariants

| Requirement | Behavior |
|---|---|
| numeric-field-R01 | Accept optional inputMode numeric through the validated public field state, alongside decimal and omission. Reject other unsupported values through the existing field error contract. |
| numeric-field-R02 | Apply the chosen native hint to the text input and preserve exact strings, leading zeroes, controlled requests, form values, focus, selection, reset and existing validation and disabled/readonly semantics. |
| numeric-field-R03 | Verify the shared behavior through direct and framework consumers, packed packages and SSR, and document it with an accessible catalog example for the Domus integer-identifier use case. |

The renderer uses the existing native text-input type. Applications select the
mode and supply their own label, help and validation. The new hint adds one
admitted state value to the established contract.

## 5. Current versus proposed product journey

The application creates field state with the numeric mode and an accessible
barcode-number label. The member enters a string such as 00036000291452.
The application receives that exact string and applies its barcode rules.
Switching the hint preserves the field's current controlled value and focus.

## 6. Functional behavior and state model

Extend the optional typed inputMode union to decimal and numeric. The shared
validator accepts those values and omits an absent hint. The renderer reflects
the selected value on its native text input. Controlled value and validity
ownership follow the existing field contract.

## 7. User-facing configuration

Applications select the hint through TextFieldState. Existing labels, help,
validation messages, name, defaultValue, readOnly and disabled configuration
continue through their established entry points.

## 8. Clean Architecture design

The framework-neutral core contract validates field state. One DOM component
renders it. React, Vue, Angular and Svelte adapters forward state and controlled
value requests. Domain-specific GTIN parsing belongs to Domus.

## 9. Data, persistence, and wire contracts

The public state type admits the numeric literal. The input remains text.
Controlled request payloads and form entries use exact strings. The shared
component keeps its existing form ownership, reset and restoration contracts.

## 10. Errors, retries, and partial failure

Unsupported state values raise the established FieldInputError. Invalid state
assignment preserves the prior accepted configuration atomically. Existing
canceled edits and deferred acknowledgments retain their controlled behavior.

## 11. Security and privacy

Labels and help remain inert bounded presentation text. Values use the existing
single-line value validator. The public input-mode hint retains the field's
existing validation and form-association boundaries.

## 12. Observability and operational UX

The catalog exposes a labeled numeric-identifier example and its exact string
value. Required/help/error associations and keyboard focus use the existing
component behavior. Verify English and Spanish narrow interaction.

## 13. Compatibility, migration, rollout, and rollback

The additive state value keeps decimal and omitted-mode consumers usable.
Verify all five package coordinates as one compatible prerelease cohort through
the documented publication flow. Qualify the published component in Domus #91.

## 14. Testing strategy and numeric budget

Minimum five distinct cases.

| Area | Minimum distinct cases | Behaviors/risks covered |
|---|---:|---|
| Typed contract | 1 | Observable scenarios in the case inventory. |
| Browser form behavior | 1 | Observable scenarios in the case inventory. |
| Framework behavior | 1 | Observable scenarios in the case inventory. |
| Packed and server consumers | 1 | Observable scenarios in the case inventory. |
| Catalog and accessibility | 1 | Observable scenarios in the case inventory. |
| Total | 5 | Distinct inventory cases; repeated executions do not add cases. |

| Case ID | Area | Requirements | Scenario |
|---|---|---|---|
| numeric-field-C01 | Typed contract | numeric-field-R01 | Accept numeric, decimal and omitted modes. Reject unsupported literals and malformed values with the existing error. Verify the public type through normal consumers. |
| numeric-field-C02 | Browser form behavior | numeric-field-R01, numeric-field-R02 | Edit an exact leading-zero identifier, verify the native numeric hint and text type, and change hints while preserving controlled value, selection, focus and successful form data. Exercise reset and existing validation/disabled/readonly behavior. |
| numeric-field-C03 | Framework behavior | numeric-field-R02, numeric-field-R03 | Use the shared numeric state in direct DOM/Lit, React, Vue, Angular and Svelte entry points. Accept controlled requests and preserve the exact leading-zero string and form entry. |
| numeric-field-C04 | Packed and server consumers | numeric-field-R01, numeric-field-R02, numeric-field-R03 | Install the verified packed cohort and compile/render the normal consumers with numeric state. Verify exact strings and server imports through the established package and SSR harnesses. |
| numeric-field-C05 | Catalog and accessibility | numeric-field-R02, numeric-field-R03 | Exercise the labeled numeric example with English keyboard and narrow Spanish touch. Verify help, focus, exact entered text and the reflected hint in the rebuilt catalog. |

## 15. Documentation and discoverability

[specs/numeric-text-field.md](numeric-text-field.md) · [packages/core/src/field-contracts.ts](../packages/core/src/field-contracts.ts) · [tests/contracts/field.test.ts](../tests/contracts/field.test.ts) · [tests/browser/field.test.ts](../tests/browser/field.test.ts) · [tests/consumers/fields.ts](../tests/consumers/fields.ts) · [tests/consumers/packed.test.ts](../tests/consumers/packed.test.ts) · [stories/field.example.ts](../stories/field.example.ts) · [stories/field.stories.ts](../stories/field.stories.ts) · [docs/field-contract.md](../docs/field-contract.md)

| Path | Change |
|---|---|
| specs/numeric-text-field.md | create |
| packages/core/src/field-contracts.ts | update |
| tests/contracts/field.test.ts | update |
| tests/browser/field.test.ts | update |
| tests/consumers/fields.ts | update |
| tests/consumers/packed.test.ts | update |
| stories/field.example.ts | update |
| stories/field.stories.ts | update |
| docs/field-contract.md | update |

## 16. Acceptance scenarios

Exercise the five case definitions through their normal entry points. Enter a
leading-zero identifier and observe its exact controlled value and form data.
Use the packaged component with the same state through each supported adapter.

## 17. Requirements traceability

| Requirement | Cases |
|---|---|
| numeric-field-R01 | numeric-field-C01, numeric-field-C02, numeric-field-C04 |
| numeric-field-R02 | numeric-field-C02, numeric-field-C03, numeric-field-C04, numeric-field-C05 |
| numeric-field-R03 | numeric-field-C03, numeric-field-C04, numeric-field-C05 |

## 18. Implementation sequence

Extend the public core union and validation. Add the focused contract and browser
regressions, verify normal and packed framework consumers, then update the
catalog and documentation. Follow the documented prerelease flow for adoption.

## 19. Definition of Done

Verify all five cases and the repository's required coverage, typing, browser,
package, SSR and catalog gates. Merge the reviewed head through the normal path
and verify destination CI and Branch Sync. Follow publication and Domus adoption
under the authorized cross-repository workflow.

## 20. References and decisions

The shared UI foundation and framework-delivery specifications retain their
owning definitions. The decimal field increment establishes controlled values
and the optional native hint. Domus #91 motivates the numeric addition.
