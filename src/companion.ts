// Interactive island: the composition root for the shell adapter
// (src/shell.ts), the renderer (src/renderer.ts), and view state
// (src/view-state.ts) — plan persistence, hash routing, and the startup
// sequence only. All static-shell wiring (theme, tabs, search, plan
// toolbar, share, Esc/empty-space) lives in createShell; the decisions
// behind it are pure functions in src/companion-core.ts (routing, clear
// policy, theme resolution), src/share.ts (share-link URL transport),
// src/plan-codec.ts (the persistence codec), and src/plan-session.ts (the
// save/load/share lifecycle: precedence, the one-shot strip, corrupt
// tolerance, and the skip-unchanged save); this module is the transport
// that reads real events/storage and applies their results to the DOM. All
// DOM painting lives in src/renderer.ts behind one renderer instance
// (createRenderer(...).build() + paint(vm), torn down with destroy()); all
// state and derivations live in src/view-state.ts behind one
// dispatch(action) → ViewModel interface. The domain glossary defines the
// vocabulary these contracts use.
//
// The startup sequence is callable: startIsland(ports) composes those parts
// with injected ports for every environment touchpoint — storage,
// location/history, clipboard, and the OS color-scheme query (matchMedia is
// absent in jsdom, which is exactly why it is a port). A second start on the
// same document disposes the first, so listeners never double-wire. The
// module top level keeps only a guard that calls startIsland with the real
// ports when the mount point exists: the browser path is unchanged, and
// jsdom can import the module and drive the island through startIsland with
// stub ports (see src/companion.test.ts).
import { createViewState, type Action } from './view-state';
import { createRenderer } from './renderer';
import { restore, save } from './plan-session';
import { createShell, type ShellPorts } from './shell';
import { sectionFromHash } from './companion-core';

/** The environment touchpoints the island needs, injected so the startup
 *  sequence is callable outside a browser. The real implementations live in
 *  realPorts() below; tests stub them (src/companion.test.ts). The shell's
 *  subset is ShellPorts (src/shell.ts); routing adds the hash reads and the
 *  one-shot share strip. */
export interface IslandPorts extends ShellPorts {
  location: ShellPorts['location'] & {
    /** The current hash, leading `#` included (e.g. `#/plan?p=<code>`). */
    hash(): string;
    /** `history.replaceState(null, '', url)` — the one-shot share strip. */
    replaceState(url: string): void;
  };
}

/** The running island's disposer, module-wide: a second startIsland on the
 *  same document disposes the first instead of double-wiring every control. */
let activeStop: (() => void) | null = null;

export function startIsland(ports: IslandPorts): () => void {
  // A second island on the same document replaces the first — two live
  // islands would double every listener (tabs, search, share, Esc…).
  activeStop?.();

  const view = createViewState();
  const { storage, location: loc } = ports;

  // ---------- dispatch pipeline ----------

  // Every dispatch goes through update(): dispatch + persist + paint.
  // plan-session skips the write when the plan is unchanged, so dispatches
  // that only touch transient state (search keystrokes, Esc clears) do not
  // rewrite storage. The renderer's emit callback routes built-in clicks
  // back through the same pipeline.
  const renderer = createRenderer({ emit: (action) => update(action) });
  function update(action: Action) {
    const vm = view.dispatch(action);
    save(storage, view.sharedSnapshot());
    renderer.paint(vm);
  }

  // ---------- shell ----------

  // Every static-shell control in one adapter; its destroy() is half of this
  // island's disposer (the hashchange listener below is the other half).
  const shell = createShell({ ports, dispatch: update, snapshot: () => view.sharedSnapshot() });

  // ---------- routing ----------

  // `section` is pure UI routing (hash sync) — mirrored into view state only
  // so Esc/empty-space can clear the active section's selection. The shell
  // owns the section state and the DOM switch; the island owns the hash.
  function applyHash() {
    // sectionFromHash absorbs the whitelist, the share-parameter split, and
    // the empty-hash default; null (unknown hash) means "don't switch"
    const s = sectionFromHash(loc.hash());
    if (s) shell.showSection(s, false);
  }

  // grid/card/row clicks come back through the build seam's emit callback —
  // the renderer stays paint-only, the island owns dispatching to view state
  addEventListener('hashchange', applyHash);
  applyHash();
  renderer.build();
  // Restore the plan before the initial paint. plan-session owns the policy:
  // a decodable share parameter wins over the stored plan (the link IS the
  // plan), the parameter is stripped from the URL only when it decoded (the
  // link is one-shot), and corrupt storage reads as "no stored plan". The
  // island supplies the transport: it hands in the hash and applies the
  // strip through history.replaceState.
  const { shared: restored, stripUrl } = restore({ storage, hash: loc.hash() });
  // null means "leave the URL alone"; an empty string is a real strip target
  if (stripUrl !== null) loc.replaceState(`${loc.pathname()}${stripUrl}`);
  if (restored) update({ type: 'hydrate', shared: restored });
  // initial paint: derive the view model once everything is built
  renderer.paint(view.derive());

  // Total disposal: the shell removes every listener and timer it added;
  // routing removes its hashchange listener; the renderer tears down its
  // toast adapter and registries. Idempotent, and a stop that was already
  // replaced by a later start must not clear the newer island's guard.
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    shell.destroy();
    removeEventListener('hashchange', applyHash);
    renderer.destroy();
    if (activeStop === stop) activeStop = null;
  };
  activeStop = stop;
  return stop;
}

// ---------- the real ports ----------

function realPorts(): IslandPorts {
  return {
    storage: localStorage,
    location: {
      hash: () => location.hash,
      origin: () => location.origin,
      pathname: () => location.pathname,
      setHash: (hash) => { location.hash = hash; },
      replaceState: (url) => { history.replaceState(null, '', url); },
    },
    copy: (text) => navigator.clipboard?.writeText(text),
    promptCopy: (text) => { window.prompt('Copy the plan link:', text); },
    prefersLight: () => matchMedia('(prefers-color-scheme: light)').matches,
  };
}

// The browser mount: module scripts run deferred, so the shell's mount point
// exists by the time this line runs. jsdom tests import the module before
// building a shell, so the guard skips and they drive startIsland directly
// with stub ports.
if (typeof document !== 'undefined' && document.getElementById('ballsGrid')) {
  startIsland(realPorts());
}
