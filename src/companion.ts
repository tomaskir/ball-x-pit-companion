// Interactive island: event listening, theme, hash routing, and plan
// persistence only — the decisions behind those are pure functions in
// src/companion-core.ts; this module is the transport that reads real
// events/storage and applies their results to the DOM. All DOM painting
// lives in src/renderer.ts behind one buildAll() + paint(vm) interface; all
// state and derivations live in src/view-state.ts behind one dispatch(action)
// → ViewModel interface. See CONTEXT.md for the domain glossary these
// contracts use.
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

const view = createViewState();

// ---------- plan persistence ----------

// The plan (characters, balls, passives, upgrade toggle) survives reloads
// via localStorage — same treatment as the theme. The view state stays
// environment-free: the island reads storage at startup and dispatches a
// hydrate action, and saves the view state's planSnapshot after every
// dispatch. Fusion picks and search queries are transient and not persisted.
const PLAN_KEY = 'ball-x-pit-plan';

function loadPlan(): PlanSnapshot | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
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
    localStorage.setItem(PLAN_KEY, JSON.stringify(view.planSnapshot()));
  } catch {
    // storage full/unavailable — the plan still works, it just won't persist
  }
}

// ---------- theming ----------

function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  const apply = (t: 'dark' | 'light') => {
    root.dataset.theme = t;
    (document.getElementById('themeToggle') as HTMLButtonElement).textContent = t === 'dark' ? '☀️' : '🌙';
  };
  apply(themeFromStorage(stored, matchMedia('(prefers-color-scheme: light)').matches));
  document.getElementById('themeToggle')!.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    apply(next);
  });
}

// ---------- routing ----------

// `section` is pure UI routing (hash sync) — mirrored into view state only
// so Esc/empty-space can clear the active section's selection.

let section: Section = 'balls';

function initRouting() {
  const apply = () => {
    // sectionFromHash absorbs the whitelist, the share-parameter split, and
    // the empty-hash default; null (unknown hash) means "don't switch"
    const s = sectionFromHash(location.hash);
    if (s) showSection(s, false);
  };
  addEventListener('hashchange', apply);
  apply();
}

function showSection(s: Section, updateHash = true) {
  section = s;
  if (updateHash) location.hash = `#/${s}`;
  for (const el of document.querySelectorAll<HTMLElement>('.section-view')) el.hidden = el.dataset.section !== s;
  for (const btn of document.querySelectorAll<HTMLElement>('.tab-btn')) btn.classList.toggle('active', btn.dataset.section === s);
  // cross-screen remembering: nothing in view state is cleared on a switch,
  // so every screen's selection survives switching away and back
}

// ---------- init ----------

function init() {
  initTheme();

  for (const btn of document.querySelectorAll<HTMLElement>('.tab-btn'))
    btn.addEventListener('click', () => showSection(btn.dataset.section as Section));

  // Every dispatch goes through update(): dispatch + persist + paint — the
  // plan is saved on every state change, wherever it comes from.
  const update = (action: Action) => {
    const vm = view.dispatch(action);
    savePlan();
    paint(vm);
  };

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

  // The plan toolbar's Share button: encodes the current plan into a link
  // (share.ts's planLink) and copies it. Opening the link hydrates the plan
  // (and replaces the opener's stored plan on the recipient's machine — the
  // link IS the plan).
  const shareBtn = document.getElementById('planShare')!;
  shareBtn.addEventListener('click', () => {
    const url = planLink(location.origin, location.pathname, view.planSnapshot());
    const idleLabel = shareBtn.textContent;
    const flash = () => {
      shareBtn.textContent = 'Copied!';
      setTimeout(() => { shareBtn.textContent = idleLabel; }, 1500);
    };
    // optional chaining would skip the whole chain when the API is absent
    // (non-secure contexts) — the fallback must cover that case too
    const copied = navigator.clipboard?.writeText(url);
    if (copied) copied.then(flash).catch(() => window.prompt('Copy the plan link:', url));
    else window.prompt('Copy the plan link:', url);
  });

  document.addEventListener('keydown', (e) => {
    // Esc clears the active section's selection (chars/fusions included);
    // switching sections keeps every screen's selection (cross-screen
    // remembering). The plan screen is exempt — its selection is deliberate
    // work, only the Clear button wipes it. In a search input Esc clears the
    // query instead — the browser's native type=search behavior — and must
    // not also wipe the screen's selection.
    if (e.key === 'Escape' && shouldClear(section, !!(e.target as HTMLElement).closest(ESC_EXEMPT_SELECTOR))) {
      update({ type: 'clear', section });
    }
  });
  document.addEventListener('click', (e) => {
    // empty space clears the active section's selection, same as Esc — the
    // policy and its exempt regions live in companion-core (shouldClear +
    // CLEAR_EXEMPT_SELECTOR; its doc carries the cross-screen-remembering
    // rationale, incl. why header controls are exempt)
    if (!shouldClear(section, !!(e.target as HTMLElement).closest(CLEAR_EXEMPT_SELECTOR))) return;
    update({ type: 'clear', section });
  });

  // grid/card/row clicks come back through the build seam's emit callback —
  // the renderer stays paint-only, the island owns dispatching to view state
  initRouting();
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
  const share = takeShareParam(location.hash);
  if (share?.snapshot) {
    history.replaceState(null, '', `${location.pathname}${share.strippedHash}`);
  }
  const sharePlan = share?.snapshot ?? null;
  const stored = sharePlan ? null : loadPlan();
  const restored = sharePlan ?? stored;
  if (restored) update({ type: 'hydrate', plan: restored });
  // initial paint: derive the view model once everything is built
  paint(view.derive());
}

init();
