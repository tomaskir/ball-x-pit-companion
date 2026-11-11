// The plan screen's three sections (characters/balls/passives). The skeleton
// is built once; entries rebuild only when their section's reconcile content
// key changes (reconcile's diff — the one accepted exception to
// never-recreate, since entry sets are dynamic). Badges and over-limit marks
// repaint in place every paint, found by each entry's stamped identity, so a
// character toggle (which changes verdicts but not the entry set) never
// rebuilds. A fused pair's identity is unordered (src/pair.ts); its reconcile
// content key also carries the displayed compose order, so a swap rebuilds
// the grid to repaint the name/icon order while the entry stamp stays the
// same pair — the accepted cost of a name built once. Internal to the
// renderer facade; the element registry belongs to the renderer instance
// (createPlan). The build graphs below the sections are their own module
// (./build-graphs.ts).
import { ballMap, type Item } from '../catalog';
import { composeKey, pairKeyOf } from '../pair';
import type { Emit } from './seam';
import type { Reconcile } from './reconcile';
import { icon, verdictBadge } from './dom';
import type { Verdict } from '../synergy';
import type { PlanBallEntry } from '../plan-state';
import type { ViewModel } from '../view-state';

interface PlanSectionEls {
  count: HTMLElement;
  empty: HTMLElement;
  grid: HTMLElement;
}

interface PlanEls {
  hint: HTMLElement;
  sections: { characters: PlanSectionEls; balls: PlanSectionEls; passives: PlanSectionEls };
}

/** One renderer instance's plan-screen painters. */
export interface PlanScreen {
  /** Build the plan skeleton once (safe to call again: the registry resets). */
  build(): void;
  /** Repaint entries, counts, badges, and over-limit marks. */
  paint(vm: ViewModel): void;
  /** Drop the element registry (destroy()). */
  destroy(): void;
}

const PLAN_EMPTY_HINTS = {
  characters: 'Pick characters on the Characters screen — they appear here.',
  balls: 'Balls you pick on the Balls screen will appear here.',
  passives: 'Passives you pick on the Passives screen will appear here.',
} as const;

function planEntry(inner: string, onRemove: () => void): HTMLElement {
  const entry = document.createElement('div');
  entry.className = 'plan-entry';
  entry.innerHTML = `${inner}<button class="plan-x" aria-label="Remove">×</button>`;
  entry.querySelector('.plan-x')!.addEventListener('click', () => onRemove());
  return entry;
}

/** A plan entry's identity — typed, serialized once for both the reconcile
 *  content key and the data-entry stamp the badge repaint looks entries up
 *  by. It is never parsed back into an action: entry click handlers close
 *  over the typed action they emit. */
type EntryIdentity =
  | { kind: 'char' | 'ball' | 'passive'; id: string }
  | { kind: 'fused'; pair: string };

const entryKey = (identity: EntryIdentity): string =>
  identity.kind === 'fused' ? `fused:${identity.pair}` : `${identity.kind}:${identity.id}`;

/** A merged ball-grid entry's unordered identity — the entry stamp and the
 *  badge lookup use it, so the reverse composition is the same pair. */
const ballEntryIdentity = (e: PlanBallEntry): EntryIdentity =>
  e.kind === 'single'
    ? { kind: 'ball', id: e.item.id }
    : { kind: 'fused', pair: pairKeyOf([e.a.id, e.b.id]) };

/** The reconcile content key: the unordered identity plus the displayed
 *  compose order (pair.ts's compose key). The name and icon order are built
 *  once, so a swap must repaint them; identity stays order-insensitive. */
const ballEntryContentKey = (e: PlanBallEntry): string =>
  e.kind === 'single'
    ? entryKey(ballEntryIdentity(e))
    : `${entryKey(ballEntryIdentity(e))}:${composeKey(e.a.id, e.b.id)}`;

/** One single-ball/passive entry, stamped with its identity (derived from the
 *  item, so the two cannot disagree). */
const itemEntry = (item: Item, kind: 'ball' | 'passive', onRemove: () => void): HTMLElement => {
  const entry = planEntry(
    `<img src="${icon(item.icon)}" alt="${item.name}" width="48" height="48" loading="lazy"><span class="plan-name">${item.name}</span>`,
    onRemove,
  );
  entry.dataset.entry = entryKey({ kind, id: item.id });
  return entry;
};

export function createPlan({ emitAction, reconcile }: { emitAction: Emit; reconcile: Reconcile }): PlanScreen {
  let planEls: PlanEls | null = null;

  function build() {
    const root = document.getElementById('planView')!;
    root.innerHTML = `
      <p class="plan-hint" hidden></p>
      ${(['characters', 'balls', 'passives'] as const).map((key) => `
        <section class="plan-section" data-plan="${key}">
          <h2 class="plan-heading"><span class="plan-title">${key[0].toUpperCase() + key.slice(1)}</span> <span class="plan-count"></span></h2>
          <p class="plan-empty">${PLAN_EMPTY_HINTS[key]}</p>
          <div class="plan-grid"></div>
        </section>`).join('')}`;
    const q = (s: string) => root.querySelector(s)!;
    const section = (key: string) => {
      const el = q(`.plan-section[data-plan="${key}"]`);
      return {
        count: el.querySelector('.plan-count') as HTMLElement,
        empty: el.querySelector('.plan-empty') as HTMLElement,
        grid: el.querySelector('.plan-grid') as HTMLElement,
      };
    };
    planEls = {
      hint: q('.plan-hint') as HTMLElement,
      sections: { characters: section('characters'), balls: section('balls'), passives: section('passives') },
    };
  }

  function paint(vm: ViewModel) {
    if (!planEls) return;
    const plan = vm.plan;
    const { sections } = planEls;
    // the End game upgrades toggle is static shell markup (index.astro, next
    // to Clear and Share) — the renderer only reflects the state on it; its
    // change event is wired by the island, like the other toolbar buttons
    const upgrades = document.getElementById('planUpgrades') as HTMLInputElement | null;
    if (upgrades) upgrades.checked = plan.upgradesOn;
    planEls.hint.textContent = plan.hint;
    planEls.hint.hidden = !plan.hint;

    // each section's entries rebuild only when that section's entry set
    // changed — reconcile diffs the entry identities. Every built entry is
    // stamped with its identity (data-entry) so the badge repaint below finds
    // entries by key, never by grid position.
    reconcile(sections.characters.grid, plan.characters.map((e) => entryKey({ kind: 'char', id: e.character.id })).join(','), () => {
      sections.characters.grid.replaceChildren(...plan.characters.map(({ character: ch }) => {
        const base = ch.baseBallId ? ballMap.get(ch.baseBallId) : null;
        // the body is a column: name over base chip — the sprite and X stay
        // put while the name wraps at word boundaries
        const entry = planEntry(
          `<img src="${icon(ch.sprite)}" alt="${ch.name}" width="48" height="48" loading="lazy">` +
          `<span class="plan-body"><span class="plan-name">${ch.name}</span>` +
          (base ? `<span class="plan-base" title="Base ball"><img src="${icon(base.icon)}" alt="${base.name}" width="20" height="20">${base.name}</span>` : '') +
          `</span>`,
          () => emitAction({ type: 'toggleChar', id: ch.id }),
        );
        entry.dataset.entry = entryKey({ kind: 'char', id: ch.id });
        return entry;
      }));
    });
    reconcile(
      sections.balls.grid,
      // the merged ball grid is already in paint order (plan-state derived it:
      // complexity, most complex left) — the keys just follow it
      plan.balls.map(ballEntryContentKey).join(','),
      () => {
        sections.balls.grid.replaceChildren(
          ...plan.balls.map((e) => {
            if (e.kind === 'single') {
              return itemEntry(e.item, 'ball', () => emitAction({ type: 'togglePlanItem', id: e.item.id }));
            }
            // fused pairs: both icons side by side (compact, so the composed name
            // fits beside them — same shape as the single-ball entries), name right,
            // one X for the pair — a pair is ONE entry (one ball slot). The name
            // carries the "×" between the components. Each icon sits in a wrapper
            // so the per-component verdict badge can ride it.
            const entry = planEntry(
              `<span class="plan-icons">` +
              `<span class="plan-icon"><img src="${icon(e.a.icon)}" alt="${e.a.name}" width="36" height="36" loading="lazy"></span>` +
              `<span class="plan-icon"><img src="${icon(e.b.icon)}" alt="${e.b.name}" width="36" height="36" loading="lazy"></span>` +
              `</span>` +
              `<span class="plan-name">${e.name}</span>`,
              () => emitAction({ type: 'togglePlanFusion', a: e.a.id, b: e.b.id }),
            );
            entry.dataset.entry = entryKey(ballEntryIdentity(e));
            return entry;
          }),
        );
      },
    );
    reconcile(sections.passives.grid, plan.passives.map((e) => entryKey({ kind: 'passive', id: e.item.id })).join(','), () => {
      sections.passives.grid.replaceChildren(...plan.passives.map((e) => itemEntry(e.item, 'passive', () => emitAction({ type: 'togglePlanItem', id: e.item.id }))));
    });

    // counts and empty hints
    for (const [count, limit, els] of [
      [plan.counts.chars, plan.limits.chars, sections.characters],
      [plan.counts.balls, plan.limits.balls, sections.balls],
      [plan.counts.passives, plan.limits.passives, sections.passives],
    ] as const) {
      els.count.textContent = `${count} / ${limit}`;
      els.empty.hidden = count > 0;
    }

    // over-limit marks and verdict badges — repaint in place, found by each
    // entry's stamped identity (never grid position, so fused pairs stay put
    // however the grid orders them). Characters and fused pairs carry no
    // entry-level verdict — the null verdict paints no badge; fused pairs get
    // their per-component badges below.
    const entryIndex = (grid: HTMLElement) =>
      new Map([...grid.querySelectorAll<HTMLElement>('.plan-entry')].map((el) => [el.dataset.entry ?? '', el]));
    const repaintEntry = (entry: HTMLElement | undefined, e: { overLimit: boolean; pairInvalid?: boolean; verdict?: Verdict | null }) => {
      if (!entry) return;
      entry.classList.toggle('over-limit', e.overLimit);
      // a hydrated Matchmaker-forbidden pair: kept, marked red — same
      // never-trim philosophy as over-limit
      entry.classList.toggle('invalid-pair', !!e.pairInvalid);
      entry.title = e.pairInvalid ? "these two can't team up in a run" : '';
      entry.querySelectorAll('.ind').forEach((b) => b.remove());
      if (e.verdict) entry.appendChild(verdictBadge(e.verdict));
    };
    const charEntries = entryIndex(sections.characters.grid);
    plan.characters.forEach((e) => repaintEntry(charEntries.get(entryKey({ kind: 'char', id: e.character.id })), e));
    const ballEntries = entryIndex(sections.balls.grid);
    // the merged ball grid: singles take an entry-level verdict badge, fused
    // pairs one verdict badge per component icon
    plan.balls.forEach((e) => {
      if (e.kind === 'single') {
        repaintEntry(ballEntries.get(entryKey(ballEntryIdentity(e))), e);
        return;
      }
      const entry = ballEntries.get(entryKey(ballEntryIdentity(e)));
      if (!entry) return;
      repaintEntry(entry, e);
      e.verdicts.forEach((v, j) => {
        if (!v) return;
        const wrap = entry.querySelectorAll<HTMLElement>('.plan-icon')[j];
        if (!wrap) return;
        wrap.appendChild(verdictBadge(v));
      });
    });
    const passiveEntries = entryIndex(sections.passives.grid);
    plan.passives.forEach((e) => repaintEntry(passiveEntries.get(entryKey({ kind: 'passive', id: e.item.id })), e));
  }

  return {
    build,
    paint,
    destroy() {
      planEls = null;
    },
  };
}
