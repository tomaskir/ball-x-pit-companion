// Shell-adapter module: every static-shell control the island wires lives
// here behind one createShell({ ports, dispatch, snapshot }) call — the
// theme toggle, the tab buttons, the per-screen search boxes, the plan
// toolbar (Clear, End game upgrades, Share), and the document-level Esc /
// empty-space clear handlers. All listeners and the share flash timer go
// through one registry, so destroy() is total: it removes every listener
// this shell added, clears a pending flash timer, and ignores a clipboard
// promise that settles after teardown.
//
// The decisions stay pure: routing, clear policy, and theme resolution in
// src/companion-core.ts; the share URL in src/share.ts; the clear-exemption
// predicate in src/clear-exempt.ts. The shell is transport — it reads real
// events/storage and dispatches actions through the island's update
// pipeline. createShell is callable on its own (src/shell.test.ts drives it
// with stub ports and a dispatch spy), so shell wiring is pinned without a
// full island mount.
import type { Action, Section } from './view-state';
import type { SharedSnapshot } from './plan-codec';
import { planLink } from './share';
import { isClearExempt } from './clear-exempt';
import { ESC_EXEMPT_SELECTOR, shouldClear, themeFromStorage } from './companion-core';

/** The environment touchpoints the shell needs, injected so the adapter is
 *  callable outside a browser. The island's full IslandPorts extends this
 *  with the location reads/writes routing owns (hash, replaceState). */
export interface ShellPorts {
  /** Theme storage (localStorage in the browser). Reads may return garbage —
   *  a corrupt theme must never break startup. */
  storage: Pick<Storage, 'getItem' | 'setItem'>;
  /** The location writes the shell owns: tab-switch navigation and the
   *  share link's origin/path. */
  location: {
    origin(): string;
    pathname(): string;
    /** Tab-switch navigation (`location.hash = …` in the browser). */
    setHash(hash: string): void;
  };
  /** `navigator.clipboard?.writeText` — returns undefined when the API is
   *  absent (non-secure contexts); the fallback chain must cover that. */
  copy(text: string): Promise<void> | undefined;
  /** The clipboard fallback (`window.prompt` in the browser). */
  promptCopy(text: string): void;
  /** `matchMedia('(prefers-color-scheme: light)').matches`. */
  prefersLight(): boolean;
}

/** Everything createShell needs: the environment ports, the island's
 *  dispatch pipeline (persist + paint), and the current plan + character
 *  selection the Share button encodes. */
export interface ShellOptions {
  ports: ShellPorts;
  dispatch(action: Action): void;
  snapshot(): SharedSnapshot;
}

export interface Shell {
  /** Show a section; `updateHash` mirrors the switch into the location
   *  (false for hashchange-driven routing, which already has the hash). */
  showSection(section: Section, updateHash?: boolean): void;
  /** Remove every listener this shell added and clear a pending timer.
   *  Idempotent; a clipboard promise that settles later is ignored. */
  destroy(): void;
}

export function createShell({ ports, dispatch, snapshot }: ShellOptions): Shell {
  // One registry: every listener added below registers its removal here, so
  // destroy() cannot miss one. (The pre-extraction island removed only its
  // document listeners and leaked every element listener.)
  const cleanups: (() => void)[] = [];
  function listen(target: EventTarget, type: string, handler: (e: Event) => void): void {
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  }

  let destroyed = false;

  // ---------- theming ----------

  const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;

  function applyTheme(t: 'dark' | 'light') {
    document.documentElement.dataset.theme = t;
    themeToggle.textContent = t === 'dark' ? '☀️' : '🌙';
  }

  applyTheme(themeFromStorage(ports.storage.getItem('theme'), ports.prefersLight()));
  listen(themeToggle, 'click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    ports.storage.setItem('theme', next);
    applyTheme(next);
  });

  // ---------- routing (the island owns hashchange; the shell owns the DOM) ----------

  let section: Section = 'balls';

  function showSection(s: Section, updateHash = true): void {
    section = s;
    if (updateHash) ports.location.setHash(`#/${s}`);
    for (const el of document.querySelectorAll<HTMLElement>('.section-view')) el.hidden = el.dataset.section !== s;
    for (const btn of document.querySelectorAll<HTMLElement>('.tab-btn')) btn.classList.toggle('active', btn.dataset.section === s);
    // cross-screen remembering: nothing in view state is cleared on a switch,
    // so every screen's selection survives switching away and back
  }

  // ---------- tabs ----------

  for (const btn of document.querySelectorAll<HTMLElement>('.tab-btn'))
    listen(btn, 'click', () => showSection(btn.dataset.section as Section));

  // ---------- per-screen search ----------

  // Each screen has its own search box; its input dispatches a section-scoped
  // search action. Switching sections repaints from the view state, so each
  // box's saved query re-applies on return (queries survive tab switches).
  // The section comes from a data-section attribute — the same pattern as the
  // tab buttons — not from munging the id string.
  for (const input of document.querySelectorAll<HTMLInputElement>('.screen-search[data-section]')) {
    const inputSection = input.dataset.section as Section;
    listen(input, 'input', () => dispatch({ type: 'search', section: inputSection, query: input.value }));
  }

  // ---------- plan toolbar ----------

  // Clear resets the plan (selections + the upgrade toggle) — the shell owns
  // this one, like the tab buttons.
  listen(document.getElementById('planClear')!, 'click', () => dispatch({ type: 'clearPlan' }));

  // The End game upgrades toggle: static shell markup like Clear and Share —
  // its change event dispatches toggleUpgrades through the same update()
  // path (the renderer only paints the checked state).
  listen(document.getElementById('planUpgrades')!, 'change', () => dispatch({ type: 'toggleUpgrades' }));

  // Share encodes the current plan into a link (share.ts's planLink) and
  // copies it. Opening the link hydrates the plan (and replaces the opener's
  // stored plan on the recipient's machine — the link IS the plan). The
  // "Copied!" flash timer is tracked so destroy() can clear it.
  const shareBtn = document.getElementById('planShare')!;
  const idleShareLabel = shareBtn.textContent;
  let flashTimer: ReturnType<typeof setTimeout> | null = null;

  listen(shareBtn, 'click', () => {
    const url = planLink(ports.location.origin(), ports.location.pathname(), snapshot());
    const flash = () => {
      if (destroyed) return; // a clipboard promise that settles after teardown
      shareBtn.textContent = 'Copied!';
      if (flashTimer !== null) clearTimeout(flashTimer);
      flashTimer = setTimeout(() => {
        shareBtn.textContent = idleShareLabel;
        flashTimer = null;
      }, 1500);
    };
    // optional chaining would skip the whole chain when the API is absent
    // (non-secure contexts) — the fallback must cover that case too
    const copied = ports.copy(url);
    if (copied) copied.then(flash).catch(() => { if (!destroyed) ports.promptCopy(url); });
    else ports.promptCopy(url);
  });

  // ---------- clear policy (document-level) ----------

  listen(document, 'keydown', (e) => {
    const key = e as KeyboardEvent;
    // Esc clears the active section's selection (chars/fusions included);
    // switching sections keeps every screen's selection (cross-screen
    // remembering). The plan screen is exempt — its selection is deliberate
    // work, only the Clear button wipes it. In a search input Esc clears the
    // query instead — the browser's native type=search behavior — and must
    // not also wipe the screen's selection.
    if (key.key === 'Escape' && shouldClear(section, !!(key.target as HTMLElement).closest(ESC_EXEMPT_SELECTOR))) {
      dispatch({ type: 'clear', section });
    }
  });
  listen(document, 'click', (e) => {
    // empty space clears the active section's selection, same as Esc. The
    // section rule is companion-core's shouldClear; the region question is
    // clear-exempt's isClearExempt — the marker rides the markup that creates
    // each interactive region (painters at build time, index.astro's static
    // header/search inputs), so the shell keeps no region list.
    if (!shouldClear(section, isClearExempt(e.target))) return;
    dispatch({ type: 'clear', section });
  });

  return {
    showSection,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const cleanup of cleanups.splice(0)) cleanup();
      if (flashTimer !== null) {
        clearTimeout(flashTimer);
        flashTimer = null;
        shareBtn.textContent = idleShareLabel;
      }
    },
  };
}
