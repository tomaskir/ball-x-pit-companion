// Interactive island: event listening, theme, and hash routing only. All
// DOM painting lives in src/renderer.ts behind one buildAll() + paint(vm)
// interface; all state and derivations live in src/view-state.ts behind one
// dispatch(action) → ViewModel interface. See CONTEXT.md for the domain
// glossary these contracts use.
import { createViewState, type Section } from './view-state';
import { buildAll, paint } from './renderer';

const view = createViewState();

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
    const hash = location.hash.replace(/^#\/?/, '') || 'balls';
    if (['balls', 'passives', 'characters', 'fusions'].includes(hash)) showSection(hash as Section, false);
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

  // Each screen has its own search box; its input dispatches a section-scoped
  // search action. Switching sections repaints from the view state, so each
  // box's saved query re-applies on return (queries survive tab switches).
  for (const input of document.querySelectorAll<HTMLInputElement>('.screen-search')) {
    const section = input.id.replace(/^search-/, '') as Section;
    input.addEventListener('input', () => paint(view.dispatch({ type: 'search', section, query: input.value })));
  }

  document.addEventListener('keydown', (e) => {
    // Esc clears the active section's selection (chars/fusions included);
    // switching sections keeps every screen's selection (cross-screen
    // remembering)
    if (e.key === 'Escape') paint(view.dispatch({ type: 'clear', section }));
  });
  document.addEventListener('click', (e) => {
    // empty space clears the active section's selection, same as Esc.
    // Header controls are not empty space — a tab click must not clear the
    // destination screen's remembered selection (cross-screen remembering).
    const target = e.target as HTMLElement;
    if (target.closest('.tile, .char-card, .chip, .toast, .fusion-row, .fusion-panel, header')) return;
    paint(view.dispatch({ type: 'clear', section }));
  });

  // grid/card/row clicks come back through the build seam's emit callback —
  // the renderer stays paint-only, the island owns dispatching to view state
  initRouting();
  buildAll({
    getVerdict: (item) => view.verdictFor(item),
    emit: (action) => paint(view.dispatch(action)),
  });
  // initial paint: derive the view model once everything is built
  paint(view.derive());
}

init();
