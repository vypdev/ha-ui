# Adopt the shared Home Assistant components

Start in the application's owning workstream. Replace a presentation family at a time and
preserve the application's routes, operation callbacks, validation, identity and storage.

1. Record the existing narrow layout, keyboard behavior, light/dark paint and the failure
   or recovery state for the journey being changed. Keep a reviewed application artifact
   and its dependency lock available for rollback.
2. Build and test one five-package preview cohort. Use the [actual consumers](../examples/consumers/README.md)
   and compare the source revision, lock and archive digests before running application checks.
   Install local archives only in an isolated preview; keep private paths out of shipped manifests.
3. Use the appropriate [framework binding](framework-adapters.md) and register the core renderer
   at the browser boundary. Pass translated labels and reviewed theme tokens from the app.
   Handle typed intent in the application and pass the next validated state back. Keep
   projected links, form controls and commands native.
4. Check the same journey with pointer and keyboard input on a narrow viewport. Compare the
   painted surface with the [Home Assistant reference](visual-parity.md). Verify the
   relevant authentication and recovery behavior in the owning application.
5. When a complete cohort is published and verified, replace the preview dependency with the
   exact published version. Reinstall from the app's frozen lock and repeat acceptance against
   the installed/deployed build. Retain the prior accepted pin and application artifact.

Gateway keeps its MCP behavior and its existing narrow keyboard paths. Domus separately
verifies Ingress and standalone behavior, Spanish and English, private drafts, and recovery
of the original operation. Roll back through the application's deployment workflow. Restoring
a prior UI artifact and lock does not require deleting household data or retained requests.

See [compatibility](compatibility.md), [integrity and recovery](provenance.md#candidate-integrity-and-recovery)
and the [Domus adoption issue](https://github.com/vypdev/domus/issues/30).
