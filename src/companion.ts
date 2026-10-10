// Interactive island: event listening, theme, hash routing, and plan
// persistence only — the decisions behind those are pure functions in
// src/companion-core.ts (routing, clear policy, theme resolution) and
// src/share.ts (the share-link lifecycle); this module is the transport
// that reads real events/storage and applies their results to the DOM. All
// DOM painting lives in src/renderer.ts behind one buildAll() + paint(vm)
// interface; all state and derivations live in src/view-state.ts behind one
// dispatch(action) → ViewModel interface. See CONTEXT.md for the domain
// glossary these contracts use.
//
// The startup sequence is callable: startIsland(ports) composes those pure
// decisions with injected ports for every environment touchpoint — storage,
// location/history, clipboard, and the OS color-scheme query (matchMedia is
// absent in jsdom, which is exactly why it is a port). The module top level
// keeps only a guard that calls startIsland with the real ports when the
// mount point exists: the browser path is unchanged, and jsdom can import
// the module and drive the island through startIsland with stub ports (see
// src/companion.test.ts).
import { createViewState, type Action, type PlanSnapshot, type Section } from './view-state';
import { buildAll, paint } from './renderer';
import { parsePlanSnapshot, planLink, takeShareParam } from './share';
import {
  CLEAR_EXEMPT_SELECTOR,
  ESC_EXEMPT_SELECTOR,
  sectionFromHash,
  shouldClear,
  themeFromStorage,
} from './companion-core';

/** The localStorage key the plan persists under — exported so tests pin the
 *  key name behaviorally instead of hard-coding it. */
export const PLAN_KEY = 'ball-x-pit-plan';

/** The environment touchpoints the island needs, injected so the startup
 *  sequence is callable outside a browser. The real implementations live in
 *  realPorts() below; tests stub them (src/companion.test.ts). */
export interface IslandPorts {
  /** Persisted-plan and theme storage (localStorage in the browser). Reads
   *  may return garbage — corrupt storage must never break startup. */
  storage: Pick<Storage, 'getItem' | 'setItem'>;
  /** location + history transport. */
  location: {
    /** The current hash, leading `#` included (e.g. `#/plan?p=<code>`). */
    hash(): string;
    origin(): string;
    pathname(): string;
    /** Tab-switch navigation (`location.hash = …` in the browser). */
    setHash(hash: string): void;
    /** `history.replaceState(null, '', url)` — the one-shot share strip. */
    replaceState(url: string): void;
  };
  /** `navigator.clipboard?.writeText` — returns undefined when the API is
   *  absent (non-secure contexts); the fallback chain must cover that. */
  copy(text: string): Promise<void> | undefined;
  /** The clipboard fallback (`window.prompt` in the browser). */
  promptCopy(text: string): void;
  /** `matchMedia('(prefers-color-scheme: light)').matches`. */
  prefersLight(): boolean;
}

export function startIsland(ports: IslandPorts): () => void {
  const view = createViewState();
  const { storage, location: loc } = ports;

  // ---------- plan persistence ----------

  // The plan (characters, balls, passives, upgrade toggle) survives reloads
  // via localStorage — same treatment as the theme. The view state stays
  // environment-free: the island reads storage at startup and dispatches a
  // hydrate action, and saves the view state's planSnapshot after every
  // dispatch. Fusion picks and search queries are transient and not persisted.
  function loadPlan(): PlanSnapshot | null {
    try {
      const raw = storage.getItem(PLAN_KEY);
      if (!raw) return null;
      // field validation lives in share.ts's parsePlanSnapshot — the same
      // normalizer the share-link decoder uses
      return parsePlanSnapshot(JSON.parse(raw));
    } catch {
      return null; // corrupt storage must never break startup
    }
  }

  function savePlan() {
    try {
      storage.setItem(PLAN_KEY, JSON.stringify(view.planSnapshot()));
    } catch {
      // storage full/unavailable — the plan still works, it just won't persist
    }
  }

  // ---------- theming ----------

  const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;

  function applyTheme(t: 'dark' | 'light') {
    document.documentElement.dataset.theme = t;
    themeToggle.textContent = t === 'dark' ? '☀️' : '🌙';
  }

  applyTheme(themeFromStorage(storage.getItem('theme'), ports.prefersLight()));
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    storage.setItem('theme', next);
    applyTheme(next);
  });

  // ---------- routing ----------

  // `section` is pure UI routing (hash sync) — mirrored into view state only
  // so Esc/empty-space can clear the active section's selection.

  let section: Section = 'balls';

  function showSection(s: Section, updateHash = true) {
    section = s;
    if (updateHash) loc.setHash(`#/${s}`);
    for (const el of document.querySelectorAll<HTMLElement>('.section-view')) el.hidden = el.dataset.section !== s;
    for (const btn of document.querySelectorAll<HTMLElement>('.tab-btn')) btn.classList.toggle('active', btn.dataset.section === s);
    // cross-screen remembering: nothing in view state is cleared on a switch,
    // so every screen's selection survives switching away and back
  }

  function applyHash() {
    // sectionFromHash absorbs the whitelist, the share-parameter split, and
    // the empty-hash default; null (unknown hash) means "don't switch"
    const s = sectionFromHash(loc.hash());
    if (s) showSection(s, false);
  }

  // ---------- dispatch pipeline ----------

  // Every dispatch goes through update(): dispatch + persist + paint — the
  // plan is saved on every state change, wherever it comes from.
  const update = (action: Action) => {
    const vm = view.dispatch(action);
    savePlan();
    paint(vm);
  };

  // ---------- shell wiring ----------

  for (const btn of document.querySelectorAll<HTMLElement>('.tab-btn'))
    btn.addEventListener('click', () => showSection(btn.dataset.section as Section));

  // Each screen has its own search box; its input dispatches a section-scoped
  // search action. Switching sections repaints from the view state, so each
  // box's saved query re-applies on return (queries survive tab switches).
  // The section comes from a data-section attribute — the same pattern as the
  // tab buttons — not from munging the id string.
  for (const input of document.querySelectorAll<HTMLInputElement>('.screen-search[data-section]')) {
    const inputSection = input.dataset.section as Section;
    input.addEventListener('input', () => update({ type: 'search', section: inputSection, query: input.value }));
  }

  // The plan toolbar's Clear button: resets the plan (selections + the
  // upgrade toggle) — the shell owns this one, like the tab buttons.
  document.getElementById('planClear')!.addEventListener('click', () => update({ type: 'clearPlan' }));

  // The plan toolbar's End game upgrades toggle: static shell markup like
  // Clear and Share — its change event dispatches toggleUpgrades through the
  // same update() path (the renderer only paints the checked state).
  document.getElementById('planUpgrades')!.addEventListener('change', () => update({ type: 'toggleUpgrades' }));

  // The plan toolbar's Share button: encodes the current plan into a link
  // (share.ts's planLink) and copies it. Opening the link hydrates the plan
  // (and replaces the opener's stored plan on the recipient's machine — the
  // link IS the plan).
  const shareBtn = document.getElementById('planShare')!;
  shareBtn.addEventListener('click', () => {
    const url = planLink(loc.origin(), loc.pathname(), view.planSnapshot());
    const idleLabel = shareBtn.textContent;
    const flash = () => {
      shareBtn.textContent = 'Copied!';
      setTimeout(() => { shareBtn.textContent = idleLabel; }, 1500);
    };
    // optional chaining would skip the whole chain when the API is absent
    // (non-secure contexts) — the fallback must cover that case too
    const copied = ports.copy(url);
    if (copied) copied.then(flash).catch(() => ports.promptCopy(url));
    else ports.promptCopy(url);
  });

  const onKeyDown = (e: KeyboardEvent) => {
    // Esc clears the active section's selection (chars/fusions included);
    // switching sections keeps every screen's selection (cross-screen
    // remembering). The plan screen is exempt — its selection is deliberate
    // work, only the Clear button wipes it. In a search input Esc clears the
    // query instead — the browser's native type=search behavior — and must
    // not also wipe the screen's selection.
    if (e.key === 'Escape' && shouldClear(section, !!(e.target as HTMLElement).closest(ESC_EXEMPT_SELECTOR))) {
      update({ type: 'clear', section });
    }
  };
  const onEmptySpaceClick = (e: MouseEvent) => {
    // empty space clears the active section's selection, same as Esc — the
    // policy and its exempt regions live in companion-core (shouldClear +
    // CLEAR_EXEMPT_SELECTOR; its doc carries the cross-screen-remembering
    // rationale, incl. why header controls are exempt)
    if (!shouldClear(section, !!(e.target as HTMLElement).closest(CLEAR_EXEMPT_SELECTOR))) return;
    update({ type: 'clear', section });
  };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', onEmptySpaceClick);

  // grid/card/row clicks come back through the build seam's emit callback —
  // the renderer stays paint-only, the island owns dispatching to view state
  addEventListener('hashchange', applyHash);
  applyHash();
  buildAll({
    getVerdict: (item) => view.verdictFor(item),
    emit: (action) => update(action),
  });
  // restore the plan before the initial paint: a share link's ?p= parameter
  // wins over the stored plan (the link IS the plan — opening it replicates
  // the sender's build and replaces what was stored here). The parameter is
  // then stripped from the URL: the link is one-shot, so a recipient who
  // Clear-plans and reloads is not handed the sender's build back. The strip
  // happens only when the parameter actually decoded (share.ts's one-shot
  // rule) — the island supplies the transport.
  const share = takeShareParam(loc.hash());
  if (share?.snapshot) {
    loc.replaceState(`${loc.pathname()}${share.strippedHash}`);
  }
  const sharePlan = share?.snapshot ?? null;
  const stored = sharePlan ? null : loadPlan();
  const restored = sharePlan ?? stored;
  if (restored) update({ type: 'hydrate', plan: restored });
  // initial paint: derive the view model once everything is built
  paint(view.derive());

  // Disposal for callers that start and stop islands on one document (the
  // jsdom tests): removes the island's document/window listeners. Element
  // listeners die with the shell markup; the view state is closure-private.
  return () => {
    removeEventListener('hashchange', applyHash);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('click', onEmptySpaceClick);
  };
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
