# Product capability specification catalog

> Generated from [`catalog.json`](./catalog.json). Do not edit this table by hand.
> Run `pnpm run generate:specifications` after changing catalog metadata.

This catalog answers which product contract owns a capability and where its
implementation, verification, workflow, and user-documentation evidence lives.
An **As-built baseline** records verified current behavior; it does not hide known
debt or convert unknown historic intent into a design decision.

| Capability ID | Status | Scope | Primary SDD | Evidence |
|---|---|---|---|---|
| `shared-ui-foundation` | Proposed | One DOM component implementation with React, Vue, Angular and Svelte adapters, direct Lit/DOM use, shared Storybook and verified Gateway/Domus adoption. Partial source; no complete capability or release accepted. | [Shared Home Assistant presentation components and framework adapters](./shared-ui-foundation.md) + 1 companion | 19 paths · 2026-11-04 |

## Evidence map

### `shared-ui-foundation` — Shared Home Assistant presentation components and framework adapters

- Owner: vypdev maintainers; Efrain Espada (accountable product/publication owner)
- Last verified: 2026-11-04
- Specifications: [`specs/shared-ui-foundation.md`](./shared-ui-foundation.md) · [`specs/shared-ui-framework-delivery.md`](./shared-ui-framework-delivery.md)
- Workflows: [`.github/workflows/copilot_issue.yml`](../.github/workflows/copilot_issue.yml) · [`.github/workflows/ci_check.yml`](../.github/workflows/ci_check.yml)
- Entrypoints: [`packages/core/src/index.ts`](../packages/core/src/index.ts) · [`packages/core/src/components/tabs.ts`](../packages/core/src/components/tabs.ts)
- Core code: [`packages/core/src/contracts.ts`](../packages/core/src/contracts.ts) · [`tooling/coverage.mjs`](../tooling/coverage.mjs) · [`packages/core/src/components/tabs.ts`](../packages/core/src/components/tabs.ts)
- Tests: [`tests/contracts/core.test.ts`](../tests/contracts/core.test.ts) · [`tests/coverage.test.mjs`](../tests/coverage.test.mjs) · [`tests/architecture.test.mjs`](../tests/architecture.test.mjs) · [`tests/coverage-evidence.test.mjs`](../tests/coverage-evidence.test.mjs) · [`tests/consumers/packed.test.ts`](../tests/consumers/packed.test.ts) · [`tests/contracts/registration.test.ts`](../tests/contracts/registration.test.ts) · [`tests/browser/tabs.test.ts`](../tests/browser/tabs.test.ts)
- User documentation: [`README.md`](../README.md) · [`docs/component-library.md`](../docs/component-library.md) · [`docs/compatibility.md`](../docs/compatibility.md) · [`docs/provenance.md`](../docs/provenance.md) · [`docs/evidence/shared-ui-foundation.json`](../docs/evidence/shared-ui-foundation.json)

## Maintenance contract

1. Read the relevant SDD before changing a catalogued capability.
2. Change the SDD, catalog evidence, tests, and user documentation together when
   behavior or an architecture boundary changes.
3. Use repository-relative paths in `catalog.json`; each path is validated and every
   top-level product SDD must have exactly one capability owner.
4. Run `pnpm run validate:specifications` in local and CI validation.
