// Interactive island: event listening, theme, hash routing, and plan
// persistence only. All DOM painting lives in src/renderer.ts behind one
// buildAll() + paint(vm) interface; all state and derivations live in
// src/view-state.ts behind one dispatch(action) → ViewModel interface. See
// CONTEXT.md for the domain glossary these contracts use.
import { createViewState, type Action, type PlanFused, type PlanSnapshot, type Section } from './view-state';
import { buildAll, paint } from './renderer';
import { decodePlan, encodePlan } from './share';

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
    const p = JSON.parse(raw) as Partial<PlanSnapshot>;
    if (typeof p !== 'object' || p === null) return null;
    const ids = (x: unknown): string[] => (Array.isArray(x) ? x.filter((id): id is string => typeof id === 'string') : []);
    const fusedPairs = (x: unknown): PlanFused[] =>
      (Array.isArray(x) ? x : []).filter((q): q is PlanFused =>
        typeof q === 'object' && q !== null && typeof (q as PlanFused).a === 'string' && typeof (q as PlanFused).b === 'string');
    return {
      upgradesOn: typeof p.upgradesOn === 'boolean' ? p.upgradesOn : true,
      chars: ids(p.chars),
      balls: ids(p.balls),
      passives: ids(p.passives),
      fused: fusedPairs(p.fused),
    };
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
  apply(stored === 'light' || stored === 'dark' ? stored : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
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
    // the hash may carry a share parameter (#/plan?p=<code>) — routing reads
    // the section only; the parameter is handled once at startup
    const hash = (location.hash.replace(/^#\/?/, '').split('?')[0]) || 'balls';
    if (['balls', 'passives', 'characters', 'fusions', 'plan'].includes(hash)) showSection(hash as Section, false);
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
  // and copies it. Opening the link hydrates the plan (and replaces the
  // opener's stored plan on the recipient's machine — the link IS the plan).
  const shareBtn = document.getElementById('planShare')!;
  shareBtn.addEventListener('click', () => {
    const url = `${location.origin}${location.pathname}#/plan?p=${encodePlan(view.planSnapshot())}`;
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
    if (e.key === 'Escape' && section !== 'plan' && !(e.target as HTMLElement).closest('input')) {
      update({ type: 'clear', section });
    }
  });
  document.addEventListener('click', (e) => {
    // empty space clears the active section's selection, same as Esc (the
    // plan screen is exempt, same reason). Header controls are not empty
    // space — a tab click must not clear the destination screen's remembered
    // selection (cross-screen remembering). Search boxes are not empty space
    // either — clicking one to type must not wipe the screen's selection.
    if (section === 'plan') return;
    const target = e.target as HTMLElement;
    if (target.closest('.tile, .char-card, .chip, .toast, .fusion-row, .fusion-panel, header, .screen-search')) return;
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
  // Clear-plans and reloads is not handed the sender's build back.
  const shareParam = new URLSearchParams(location.hash.split('?')[1] ?? '').get('p');
  const sharePlan = shareParam ? decodePlan(shareParam) : null;
  if (sharePlan) {
    history.replaceState(null, '', `${location.pathname}#${location.hash.split('?')[0]}`);
  }
  const stored = sharePlan ? null : loadPlan();
  const restored = sharePlan ?? stored;
  if (restored) update({ type: 'hydrate', plan: restored });
  // initial paint: derive the view model once everything is built
  paint(view.derive());
}

init();
