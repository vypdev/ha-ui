# Framework navigation bindings

This unpublished preview has one visual implementation and four real navigation adapters. It is
not the completed component library: fields, buttons, dialogs, form bridges, framework SSR/client
fixtures, broader browser support, Storybook, publication and app adoption remain required.

## Client registration and ownership

Call `registerTabs` from `@vypdev/ha-ui/tabs` at the application client boundary before mounting the
chosen framework. Importing a binding does not register tags or load the core DOM renderer. The
framework adapters use type-only core imports; their runtime imports are their own framework only.
All use the same `vyp-ha-tabs` element, validated `NavigationState`, CSS tokens and typed native
`ha-selection-request` event. No routing, household state or authorization belongs in a binding.

The app accepts selection by supplying a new state object. A native event callback may call
`preventDefault()` synchronously; the original event object and its cancellation are preserved.
Programmatic state updates emit no selection request. Node-safe contract imports are supported;
framework server rendering, hydration and raw component-module imports are separate, unaccepted gates.

| Binding | Validated preview | State/event/content API |
|---|---|---|
| Direct Lit/DOM | Lit 3.3.3 | `state` property; `ha-selection-request`; native named slots |
| React | 19.3.1; types 19.3.0 | `Tabs`, `state`, `onSelectionRequest`; React children with native slot attributes |
| Vue | 3.5.44 | `Tabs`, `state`, typed `selectionRequest` emit; default slot containing native named content |
| Angular | 22.2.4 | Standalone `Tabs` component on the core tag; `[state]`, `(selectionRequest)`, projected content |
| Svelte | 5.57.3 | `Tabs`, `state`, `onSelectionRequest`, `panels` map of Svelte snippets keyed by core item ID |

Peer versions are exact tested candidates, not inferred broader ranges. Every app installs core
plus its own binding and framework. None of these bindings installs another framework.

## Projection and lifecycle

React uses layout effects to apply complex properties and attach/remove a native event subscription.
Strict Mode, rerenders, callback replacement/removal and a retained former host are tested. Supported
host attributes are id, className, style, dir and lang; raw HTML strings are not a binding API.

Vue uses mounted/unmount hooks, a shallow host ref and a post-render state watch. Its typed emit
preserves the native event. It forwards id, class, style, dir and lang without accepting arbitrary
DOM content setters. Both supplied and absent content/callbacks, prop replacement and teardown pass.

Angular uses its standard Package Format with partial compilation, published FESM and declarations,
and retained authored source. It is a component on `vyp-ha-tabs` itself, with a projection-only Angular
template. Renderer2 applies properties and owns the native listener cleanup. There is no nested visual
wrapper or second tab renderer. The real consumer compiles its app with ngc and links every partial
Angular dependency using the official linker; it does not enable JIT as an acceptance fallback.
The source dependency on core is an exact cohort version so the standalone APF manifest is publishable;
pnpm links that version to the local workspace during development.

Svelte uses runes, onMount cleanup and explicit snippet-to-slot projection. For example:

```svelte
{#snippet tasks()}<button>Add task</button>{/snippet}
<Tabs state={viewState} onSelectionRequest={handleSelection} panels={{tasks}} />
```

Svelte's legacy `slot` syntax on a child of a Svelte component is not this API. The snippet map
provides native named slots without letting the compiler silently treat them as legacy slots.
Absent panels and callbacks, prop replacement, snippet removal, unmount and remount all pass.
The published Svelte component is preprocessed and carries generated component declarations.

## Verification boundaries

`pnpm check` strictly checks source, Node consumer tooling, the Svelte package and Svelte test fixtures.
The consumer tooling uses bundler module resolution for the Angular linker's published declaration
contract; production TypeScript package declarations retain their own resolution settings. No library
declaration checks are skipped. `pnpm test` executes real Chromium bindings and enforces all four
coverage metrics per authored module, including Svelte source and zero-executable type/barrel files.

`pnpm test:package` independently builds and packs all five coordinates twice and compares bytes.
Each actual package installs in a clean, frozen offline fixture with an isolated metadata cache.
Fixture lock registry records must equal the reviewed source lock; only the new unpublished candidate's
local archive integrity is bound for that test campaign. Fixture-only overrides point core dependencies
to the same candidate bytes. They are not publication metadata or installed application dependencies.

Every framework consumer compiles against installed declarations and runs real props, single native
events, content projection, disabled booleans, English/Spanish, live theme, keyboard, removal and remount
journeys. Installed authored source must match the repository. Published manifests contain neither
workspace nor file references. The resulting artifacts include the exact cohort digests and original
browser screenshots. These checks cover navigation only and do not complete the retained 70-case
capability acceptance inventory or prove a real npm publication.

The complete source/type/browser check sequence also passes with all five dist trees absent.
Svelte source validation uses `tsconfig.svelte-source.json`; Svelte package emission keeps its own
compiler project and follows the core build in pnpm's dependency graph. This prevents a local
declaration cache from hiding a fresh-checkout CI failure.
