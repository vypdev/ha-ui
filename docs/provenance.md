# Source and asset provenance

The repository and core package carry the MIT notice, copyright 2026 vypdev. The notice is retained
from [Gateway at e47dde303e475a6d03e1d6697ec87a934e93263b](https://github.com/vypdev/homeassistant-gateway/blob/e47dde303e475a6d03e1d6697ec87a934e93263b/LICENSE).
No Gateway visual component, font, icon or other asset is extracted in the first contract increment.
A reviewed per-family/source/asset inventory remains required before extraction and publication.

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
