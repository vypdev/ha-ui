# Source and asset provenance

The repository and core package carry the MIT notice, copyright 2026 vypdev. The notice is retained
from [Gateway at e47dde303e475a6d03e1d6697ec87a934e93263b](https://github.com/vypdev/homeassistant-gateway/blob/e47dde303e475a6d03e1d6697ec87a934e93263b/LICENSE).
The first contract increment extracted no visual components or assets. The upper navigation increment
adapts the reviewed dashboard geometry from
[ui-catalog.css lines 105–121 at that revision](https://github.com/vypdev/homeassistant-gateway/blob/e47dde303e475a6d03e1d6697ec87a934e93263b/frontend/src/ui/ui-catalog.css#L105-L121):
56px bar, 16px horizontal padding, 2px current indicator, horizontal overflow and inset visible focus.
The standalone DOM semantics, validation, events and controller are authored in ha-ui. No private HA
component, font, icon or external asset is imported. The MIT notices are retained. Other families
need their own reviewed source/asset inventory before extraction and publication.

The coverage policy and its negative unit fixtures are adapted from the same organization's MIT
[Domus coverage policy](https://github.com/vypdev/domus/blob/8c0a36c0b9804bdaf33a301a4dc85ae3dc12ee21/tooling/frontend-coverage.mjs)
and [policy tests](https://github.com/vypdev/domus/blob/8c0a36c0b9804bdaf33a301a4dc85ae3dc12ee21/tests/node/frontend-coverage.test.mjs).
The adaptation accepts multiple source directories so every package and authored tool is inventoried
independently of test imports. It is project-owned validation code, not a copied UI implementation.

Catalog validation reads the unchanged original three-file Copilot SDK at revision
3e7ceea08e6131360e026937d1c0cc1b120472e0. CI checks out only those original files into an ignored
validation directory and calls the public main function with this repository's explicit root.
It does not change Copilot source or installed resources. Source hashes and the local procedure are
in the [component guide](component-library.md#catalog-validation). Catalog consistency, implemented
coverage, actual framework execution, publication rights and application adoption are separate facts.

The four navigation adapters are authored in this repository and carry the same MIT notice.
They add framework lifecycle/property/event/content bindings; none contains visual styles or a
second navigation controller. Angular packaging retains its authored source and uses standard FESM,
partial declarations and an exact tslib dependency. React/Vue include their source/declaration maps;
Svelte includes source, preprocessed components and generated declarations. Third-party compilers,
frameworks and helpers retain their own package licenses; no third-party runtime source is copied here.
