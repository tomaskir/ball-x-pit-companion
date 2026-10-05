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
  // switching sections wipes every selection — the screen starts fresh
  paint(view.dispatch({ type: 'clearAll' }));
}

// ---------- init ----------

function init() {
  initTheme();

  for (const btn of document.querySelectorAll<HTMLElement>('.tab-btn'))
    btn.addEventListener('click', () => showSection(btn.dataset.section as Section));

  const search = document.getElementById('search') as HTMLInputElement;
  search.addEventListener('input', () => paint(view.dispatch({ type: 'search', query: search.value })));

  document.addEventListener('keydown', (e) => {
    // Esc clears the active section's selection (chars/fusions included);
    // switching sections clears everything (clearAll)
    if (e.key === 'Escape') paint(view.dispatch({ type: 'clear', section }));
  });
  document.addEventListener('click', (e) => {
    // empty space clears the active section's selection, same as Esc
    if (!(e.target as HTMLElement).closest('.tile, .char-card, .chip, .toast, .fusion-row, .fusion-panel')) paint(view.dispatch({ type: 'clear', section }));
  });

  // grid/card clicks come up as custom events so the renderer stays paint-only
  document.addEventListener('tile-select', (e) => paint(view.dispatch({ type: 'toggleItem', id: (e as CustomEvent<string>).detail })));
  document.addEventListener('char-select', (e) => paint(view.dispatch({ type: 'toggleChar', id: (e as CustomEvent<string>).detail })));
  document.addEventListener('fusion-select', (e) => paint(view.dispatch({ type: 'toggleFusion', id: (e as CustomEvent<string>).detail })));

  initRouting();
  buildAll((item) => view.verdictFor(item));
  // initial paint: derive the view model once everything is built
  paint(view.derive());
}

init();
