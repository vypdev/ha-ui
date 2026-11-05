# Framework bindings

This unpublished preview has shared navigation with local icons/labels, one controlled text field, native-form buttons, boolean checkboxes, typed single/multiple selects, native dialogs, card surfaces, rows and grids,
with four real framework bindings and text-field form bridges. Other controls and their bridges, framework
The named Next.js, Nuxt and SvelteKit server/client fixtures pass with installed packages. Broader browser support, public Storybook hosting, publication and app adoption remain required.

## Client registration and ownership

Call `registerTabs` from `@vypdev/ha-ui/tabs` at the application client boundary before mounting the
chosen framework. Importing a binding does not register tags or load the core DOM renderer. The
framework adapters import the renderer only as types; runtime imports are their own framework
and DOM-independent core validation policies. No binding imports Lit or registers a tag.
All use the same `vyp-ha-tabs` element, validated `NavigationState`, CSS tokens and typed native
`ha-selection-request` event. No routing, household state or authorization belongs in a binding.
Optional `iconPath` and `showLabel` remain presentation data in that same state. Source and actual
compiled consumers verify decorative SVGs, icon-only accessible names and runtime Spanish updates
through each binding. Rendering, icon geometry and label visibility belong to the shared core.

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
preserves the native event. Native fallthrough attributes and listeners reach the actual custom
element, including ARIA/data attributes, title, tabindex and hidden; updates and removals follow
Vue's normal lifecycle. Controlled props and emitted requests remain explicit bindings. A shared
adapter helper excludes HTML/text content setters, including Vue's forced-property spelling, so
fallthrough cannot replace owned markup or slots. All five core hosts honor hidden while retaining
their controlled values and form data. Both supplied and absent content/callbacks, prop replacement
and teardown pass.

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
browser screenshots. These checks cover navigation, text fields, buttons, checkboxes, selects, dialogs, cards, layout and feedback. They do not complete the retained 70-case
capability acceptance inventory or prove a real npm publication.

The complete source/type/browser check sequence also passes with all five dist trees absent.
Svelte source validation uses `tsconfig.svelte-source.json`; Svelte package emission keeps its own
compiler project and follows the core build in pnpm's dependency graph. This prevents a local
declaration cache from hiding a fresh-checkout CI failure.

## Text-field binding contract

`TextField` is exported by each adapter. All use the explicitly registered
`vyp-ha-field`; applications call `registerField` at the client boundary. State, value,
name, defaultValue and disabled are passed as properties, with a separate optional external
form ID attribute. The core still owns validation, rendering, keyboard and accessibility.
Current values never become HTML attributes. The original cancelable `valueRequest` event
is validated by the pure fieldValueDetail policy before application observers or a framework model callback; a canceled request updates no model.

React accepts controlled `value` and optional `onValueChange(value)`/`onValueRequest(event)`.
Vue accepts `modelValue`, emits `update:modelValue` and `valueRequest`, and supports `v-model`.
Svelte 5 uses controlled `value` and typed `onValueChange`/`onValueRequest` callback props;
application `$state` remains the model owner. Native form reset requests the supplied
`defaultValue`; the framework model acknowledges it just like a normal edit.

Angular exposes the actual core tag through a standalone component, synchronous
`valueRequest` output and `ControlValueAccessor`. It supports reactive controls and ngModel,
including model writes, dirty/touched, disable/enable and update-on-blur/submit. The shared
pure validation policy feeds Angular validity. Reset preserves Angular's current reset value
and pristine state rather than applying a conflicting native default a second time. Without
an Angular forms directive, its value input/output remain explicitly application-controlled.
The exact pinned source and actual compiled consumers pass these text-field contracts. Other
control types and their form bridges remain unverified; no complete library acceptance is implied.


```tsx
<TextField state={fieldState} value={title} onValueChange={setTitle}
  name="task" defaultValue="Kitchen" />
```

```vue
<TextField v-model="title" :state="fieldState" name="task" default-value="Kitchen" />
```

```svelte
<script lang="ts">
  import {TextField} from '@vypdev/ha-ui-svelte';
  import {textFieldState} from '@vypdev/ha-ui/field-contracts';
  const fieldState=textFieldState({label:'Task name',required:true});
  let title=$state('Kitchen');
</script>
<TextField state={fieldState} value={title} onValueChange={(next)=>title=next}
  name="task" defaultValue="Kitchen" />
```

```html
<form [formGroup]="group">
  <vyp-ha-field [state]="fieldState" formControlName="task" name="task" />
</form>
```

For Angular, import the standalone `TextField` and the applicable forms module. A forms directive
owns value and disabled state through its control; value/disabled inputs apply to standalone
output-driven use. `haField` validation errors contain shared presentation flags only. App-specific
validators and the mapping of their messages to state.error remain application responsibilities.
Angular Forms 22.2.4 and its usual Common/Core/Platform Browser/RxJS peers are required, as exercised
by the frozen fixture. Reactive controls preserve updateOn change/blur/submit, dirty/touched and
nullable/nonnullable resets. ngModel and explicit application-controlled use are also tested.

Malformed event detail is rejected with invalid_field before observers or model callbacks. The
validated value snapshot is used after the observer, preventing payload mutation from changing a
model callback's input. Request cancellation does not undo an independent model assignment already
made by application code. No adapter performs a household operation, network request or storage write.

The native Angular form directive owns its reset event; without one, a standalone reactive control
retains its model until the app resets the control. The core native reset request remains controlled.
Source tests use the current pure contract source. Packed fixtures use installed exports with no
source alias; both paths are required. The implementation follows Angular's
[ControlValueAccessor](https://angular.dev/api/forms/ControlValueAccessor) and
[Validator](https://angular.dev/api/forms/Validator) contracts; Svelte uses typed callback props and
application-owned rune state.


## Button binding contract

Each adapter exports `Button` and uses the explicitly client-registered `vyp-ha-button`. Import
`registerButton` from `@vypdev/ha-ui/button` at the application client boundary. The adapter writes
`state`, `type`, `name`, `value`, `disabled` and `formNoValidate` as properties; optional `form`
selects an external owner by ID attribute. Its safe default type is `button`. Pressed and busy state
remain controlled by the application. The core owns visuals, keyboard, native validation, reset and
the exposed real native `submitter`; bindings never create another button/form controller.

React and Svelte accept `onPressRequest(originalEvent)` and optional `onPress(validatedDetail)`.
Vue emits `pressRequest` and `press`; Angular exposes synchronous outputs of those names on its
standalone `vyp-ha-button` component. The observer runs before the accepted callback and can call
`preventDefault()` synchronously to prevent both acceptance and the native default. The pure
`buttonPressDetail` policy rejects malformed requests before either callback and freezes a snapshot
before an observer can mutate a foreign payload. An accepted request is an intent, not proof that
browser validation passed or that an application operation succeeded. Handle actual submission on
the owning form and set loading from there. No framework callback should manually submit again.

React accepts `leading`/`trailing` React nodes; Vue exposes named slots with those names; Svelte
accepts typed snippets. Angular projects native `slot="leading"`/`slot="trailing"` content. All
remain decorative/inert in the shared renderer, whose state label supplies the accessible name.
Changing projected content preserves the core-owned auxiliary native submitter. Host attributes
follow each adapter's existing id/class/style/dir/lang convention. A command button has no Angular
value accessor; Angular's form submit/reset directives still receive the native form event.

```tsx
<Button state={saveState} type="submit" name="action" value="save"
  onPressRequest={event => { if (cancelSave) event.preventDefault(); }} />
```

```vue
<Button :state="saveState" type="submit" name="action" value="save"
  @press-request="observePress"><template #leading><span>+</span></template></Button>
```

```svelte
{#snippet leading()}<span>+</span>{/snippet}
<Button state={saveState} type="submit" name="action" value="save" {leading}
  onPressRequest={observePress} />
```

```html
<vyp-ha-button [state]="saveState" type="submit" name="action" value="save"
  (pressRequest)="observePress($event)"><span slot="leading">+</span></vyp-ha-button>
```

Source-browser cases cover pre-upgrade/default props, callback replacement/removal, invalid/foreign
payloads, native validation and no-validate submission, reset, external owners, controlled pressed/
busy state, icon replacement and retained-host teardown/remount. Actual frozen, independently
installed React/Vue/Angular/Svelte consumers compile the published declarations and exercise default
Enter, Space activation, cancellation, submitter/FormData, required validation, model reset, busy/
disabled state, projection changes and remount, plus English/Spanish and theme updates. These are
preview checks for the recorded pins, not SSR, other-engine or complete component-family acceptance.


## Select binding contract

`Select` is exported by every adapter; register `vyp-ha-select` with `registerSelect` from the
client-only `/select` entrypoint. The [select contract](select-contract.md) defines its closed
state, primitive/array types, unsuccessful unavailable values, native form entries and restoration.
The core owns the shared renderer and native form bridge, including labels and disabled-option
behavior. The [select contract](select-contract.md) defines each mode's keyboard and accessibility semantics.

React accepts controlled value and onValueRequest/onValueChange. Vue's modelValue and
update:modelValue preserve number/string/boolean distinctions and readonly arrays through v-model.
Svelte uses controlled value, typed callbacks and application rune state. Angular supports
ControlValueAccessor/Validator, reactive forms and ngModel, nullable/nonnullable resets, dirty/touched,
disable/enable and updateOn blur/submit. Without a forms directive, its value/valueChange inputs and
output support explicit two-way value binding. The forms directive owns the model when present.
All bindings validate a foreign request before observers and use its frozen snapshot afterward.

```tsx
<Select state={categoryState} value={category} onValueChange={setCategory}
  name="category" defaultValue={1} />
```

```vue
<Select v-model="category" :state="categoryState" name="category" :default-value="1" />
```

```svelte
<Select state={categoryState} value={category} onValueChange={(next)=>category=next}
  name="category" defaultValue={1} />
```

```html
<form ngNativeValidate [formGroup]="group">
  <vyp-ha-select [state]="categoryState" formControlName="category" name="category" />
</form>
```

Angular normally adds novalidate when a forms module is imported. The sample opts into native
browser blocking with ngNativeValidate; an application can instead validate explicitly in its own
submit handler. The component honors that form policy. See [Angular's native-validation notes](https://angular.dev/api/forms/NgForm#native-dom-validation-ui).
Typed model values and events remain distinct; standard HTML FormData serializes primitives as
strings. Applications that require wire-level type preservation should submit their typed model as
JSON or map records to distinct string IDs rather than infer a primitive type from FormData text.

The source and actual compiled consumers exercise single/multiple selection, original request
cancellation, programmatic writes, missing option updates, native entries/required validation,
framework reset, disabled submission, EN/ES/themes and teardown/remount. The shared single picker
now previews enabled options with arrows/Home/End and typeahead, then commits on Enter/Space/Tab;
Escape preserves the model. Automatic mode retains its size-based projection. Explicit multiple
dropdowns use searchable chips, and explicit lists use native radio or checkbox rows.
Actual compiled React, Vue, Angular AOT with the official linker, and Svelte consumers exercise
all these modes with the same typed and cancelable form contract.

## Checkbox binding contract

All four packages export Checkbox. React and Svelte bind checked with onCheckedRequest and
onCheckedChange; Vue uses boolean modelValue, checkedRequest and update:modelValue. Angular
supports checked/checkedChange or its actual ControlValueAccessor/Validator. The original
ha-check-request is validated and passed to observers before an accepted boolean reaches the
framework model; cancellation suppresses that model change. Framework defaults/reset and
updateOn behavior remain owned by their native form APIs. Nullable Angular resets retain null
in the control while showing unchecked. Indeterminate is a state flag derived by the app, not
a third model value. All bindings share the [same renderer and forms contract](checkbox-contract.md).

Compiled installed consumers exercise label/Space and Enter, required native validation,
boolean models, default/custom payloads, disabled omission, cancellation, programmatic writes,
reset and teardown/remount. Their local fonts use the same licensed bytes as HA; component
code never fetches fonts. SSR and wider browser/application acceptance remain separate gates.

## Dialog binding contract

All four adapters export `Dialog` and project application content into the registered native
modal. A synchronous request observer may cancel the validated action before the acceptance
callback runs. The application controls `open`; the binding never dismisses a modal on its
own. The [dialog contract](dialog-contract.md) gives the exact prop, event and slot names.
Installed consumers check projected content, canceled confirmation, Escape and focus return,
accepted confirmation and cancellation, and teardown/remount.

## Card binding contract

All four adapters export `Card`. Register the core client renderer with `registerCard`.
Supply `cardState({ title, headingLevel, raised })` as the typed `state` prop/input.
Pass the body as children (React/Svelte), the default slot (Vue) or projected children (Angular).
Use the `actions` React prop, Vue slot or Svelte snippet; in Angular project an element with
`slot="actions"`. These are application-owned commands with normal native semantics. The
[card contract](card-contract.md) defines the parts, theme tokens and empty-slot behavior.

## Layout bindings

All four adapters export `Row` and `Grid`. Register `registerRow` and `registerGrid` on
the client. Give `Row` a `rowState` model and project optional leading and trailing
content with React props, Vue slots or Svelte snippets. Angular projects native elements
with `slot="leading"` or `slot="trailing"`. Give `Grid` a `gridState` model and pass
ordinary children (React/Svelte), default slot (Vue) or projected children (Angular).
Resize changes the grid tracks without changing the order or ownership of those children.
See the [layout contract](layout-contract.md) for the native semantics and layout tokens.

## Feedback bindings

All four adapters export `Feedback` and accept the same `FeedbackState` property. The
React and Vue bindings accept named `action` and `icon` content through their framework's
props and slots, respectively. Angular projects elements with `slot="action"` or
`slot="icon"`, and Svelte accepts `action` and `icon` snippets. The optional icon is
decorative. Use a real button or link for the action. Its event belongs to the application.
The [feedback contract](feedback-contract.md) describes the shared roles and state transitions.

## Server and client boundaries

Run `pnpm test:package` followed by `pnpm test:ssr`. Each fixture installs the exact two
core and framework archives identified by the packed cohort and checks their SHA-256
before installation. The test binds the archives to the fixture lock, then uses a frozen
install. It runs a production build and exercises the deployed shell on a local HTTP
server with no external browser requests. Inspect `test-results/packed-ssr.json` for versions,
lock identities and the results.

| Fixture | Verified boundary |
|---|---|
| Next.js 16.4.5 | App Router imports the pure state contract on the server. The React client boundary calls [`next/dynamic`](https://nextjs.org/docs/app/guides/lazy-loading#skipping-ssr) with `ssr: false` before registration. |
| Nuxt 4.6.4 | The page imports the pure contract and renders the fallback with [`ClientOnly`](https://nuxt.com/docs/4.x/api/components/client-only). The Vue client component registers and mounts the control. |
| SvelteKit 3.1.1 | The server page renders the shell and fallback. [`onMount`](https://svelte.dev/docs/svelte/lifecycle-hooks#onMount) imports the Svelte component and registers the control in the browser. |

The browser exercises projected panels, controlled keyboard selection, rerender, unmount,
and remount. A detached adapter cannot call the application, and one interaction emits one
selection request. Browser errors, warnings and unexpected requests fail each fixture.
The core DOM renderer still requires a browser; do not render it directly on the server.
