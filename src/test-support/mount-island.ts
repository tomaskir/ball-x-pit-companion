// Test support: the one island harness. It owns everything a jsdom test needs
// to exercise the real page end to end — the shell mount (index.astro's own
// markup, so a missing container or clear-exemption marker fails here), the
// renderer instance (created once and built once; reset() repaints it, never
// rebuilds — the invariant the renderer's never-recreate rule depends on), the
// per-test state reset, and the dispatch → paint drive loop the island runs.
//
// Tests cross this interface instead of hand-rolling containers or creating a
// renderer per test: mountIsland() once per file, then reset() in beforeEach
// and drive()/q()/emit in the test, with destroy() in afterAll. The island's
// own tests (companion.test.ts) use mountShell() + stubPorts() — startIsland()
// owns its renderer instance, so the harness must not build a second one.
import { vi, type Mock } from 'vitest';
import { createRenderer, type Renderer } from '../renderer';
import { createViewState, type Action, type ToggleAction, type ViewModel } from '../view-state';
import { PLAN_KEY } from '../plan-session';
import type { IslandPorts } from '../companion';
import type { SharedSnapshot } from '../plan-codec';
import { shellDoc } from './styles';

/** The real page shell: index.astro's body markup, parsed by the shared
 *  styles test-support. Replaces the body so every mount starts clean. */
export function mountShell(): void {
  document.body.innerHTML = shellDoc().body.innerHTML;
}

/** The harness a jsdom test drives. `view` and `emit` are live getters: reset()
 *  replaces both, and the renderer's captured emit callback always reaches the
 *  current emit. */
export interface IslandHarness {
  /** The current view state (replaced by reset()). */
  readonly view: ReturnType<typeof createViewState>;
  /** The renderer instance's paint, for the few tests that paint a derived
   *  model directly instead of going through drive(). */
  readonly paint: Renderer['paint'];
  /** Dispatch each action and paint the result — the island's update() path.
   *  Returns the last view model. */
  drive(...steps: Action[]): ViewModel;
  /** Query one element, failing loudly when it is missing. `root` scopes the
   *  query (e.g. a screen's panel); it defaults to the document. */
  q<T extends Element = HTMLElement>(selector: string, root?: ParentNode): T;
  /** The renderer's emit callback: a fresh spy per test. Tests that pin the
   *  island path install a dispatch+paint implementation. */
  readonly emit: Mock<(action: ToggleAction) => void>;
  /** Per-test reset: new view state, fresh emit spy, initial paint. The DOM
   *  built by build() is reused — never rebuilt. */
  reset(): void;
  /** Tear the renderer instance down (removes the toast's document listener
   *  and makes its built-once handlers inert). Idempotent. */
  destroy(): void;
}

/** The live harness, so a later mountIsland() (regression.test.ts mounts one
 *  per jsdom test) tears the previous renderer down instead of leaking its
 *  document listeners. */
let active: IslandHarness | null = null;

/** Mount the real shell, create and build the renderer once, and return the
 *  harness. Call once per test file (beforeAll); call reset() in beforeEach
 *  and destroy() in afterAll. */
export function mountIsland(): IslandHarness {
  active?.destroy();
  mountShell();

  let view = createViewState();
  let emit = vi.fn<(action: ToggleAction) => void>();

  // The renderer captures this closure, not the spy itself, so reset() can
  // swap the spy without rebuilding the instance.
  const renderer = createRenderer({ emit: (action) => emit(action) });
  renderer.build();

  const harness: IslandHarness = {
    get view() { return view; },
    get emit() { return emit; },
    paint: renderer.paint,
    drive(...steps: Action[]): ViewModel {
      let vm: ViewModel | null = null;
      for (const action of steps) {
        vm = view.dispatch(action);
        renderer.paint(vm);
      }
      if (!vm) throw new Error('mount-island: drive() requires at least one action');
      return vm;
    },
    q<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
      const el = root.querySelector<T>(selector);
      if (!el) throw new Error(`mount-island: no element matches ${selector}`);
      return el;
    },
    reset() {
      // Dismiss any toast the previous test left open. The renderer instance
      // is built once, so its toast adapter is not recreated per test and the
      // outside-tap dismissal is the only cleanup path.
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      view = createViewState();
      emit = vi.fn<(action: ToggleAction) => void>();
      renderer.paint(view.derive());
    },
    destroy() {
      renderer.destroy();
      if (active === harness) active = null;
    },
  };

  harness.reset(); // initial paint: the built DOM starts in the empty state
  active = harness;
  return harness;
}

/** Stub ports over an in-memory store + fake URL, for startIsland() tests.
 *  `replaceState` is a mock so tests can pin the one-shot strip; `setHash`
 *  updates the fake hash the way `location.hash = …` would (the hashchange
 *  event itself is fired by tests); `planWrites` counts plan-key writes so
 *  tests can pin plan-session's skip-unchanged save. */
export function stubPorts(init: {
  stored?: Record<string, string>;
  hash?: string;
  copy?: IslandPorts['copy'];
} = {}) {
  const store = new Map(Object.entries(init.stored ?? {}));
  let hash = init.hash ?? '';
  const replaceState = vi.fn();
  const setHash = vi.fn((h: string) => { hash = h; });
  const setItem = vi.fn((k: string, v: string) => { store.set(k, String(v)); });
  const promptCopy = vi.fn();
  const ports: IslandPorts = {
    storage: {
      getItem: (k) => store.get(k) ?? null,
      setItem,
    },
    location: {
      hash: () => hash,
      origin: () => 'https://example.com',
      pathname: () => '/ball-x-pit-companion/',
      setHash,
      replaceState,
    },
    copy: init.copy ?? (() => undefined),
    promptCopy,
    prefersLight: () => false,
  };
  return {
    ports,
    store,
    replaceState,
    setHash,
    setItem,
    promptCopy,
    setHashValue: (h: string) => { hash = h; },
    savedPlan: (): SharedSnapshot | null => {
      const raw = store.get(PLAN_KEY);
      return raw ? (JSON.parse(raw) as SharedSnapshot) : null;
    },
    /** How many times the plan key was written — the skip-unchanged pin. */
    planWrites: () => setItem.mock.calls.filter(([key]) => key === PLAN_KEY).length,
  };
}
