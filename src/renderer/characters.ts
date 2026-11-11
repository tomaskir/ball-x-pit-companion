// The character cards: built once; selection repaints classes in place.
// Internal to the renderer facade; the card registry belongs to the renderer
// instance (createCharacters).
import { CHARACTERS, type Character } from '../data/characters';
import { ballMap } from '../catalog';
import type { PainterSeam } from './seam';
import { markClearExempt } from '../clear-exempt';
import { icon } from './dom';
import type { ViewModel } from '../view-state';

/** One renderer instance's character-card painters. */
export interface Characters {
  /** Build the cards once (safe to call again: the registry resets). */
  build(): void;
  /** Repaint selection/filter/blocked state in place. */
  paint(vm: ViewModel): void;
  /** Drop the card registry (destroy()). */
  destroy(): void;
}

export function createCharacters({ emitAction, attachToast }: PainterSeam): Characters {
  let charCards: { ch: Character; card: HTMLElement }[] = [];

  function build() {
    const wrap = document.getElementById('charactersGrid')!;
    wrap.innerHTML = '';
    charCards = [];
    for (const ch of CHARACTERS) {
      const card = document.createElement('div');
      card.className = 'char-card';
      markClearExempt(card);
      const base = ch.baseBallId ? ballMap.get(ch.baseBallId) : null;
      card.innerHTML = `
        <img src="${icon(ch.icon)}" alt="${ch.name}" width="96" height="96" loading="lazy">
        <div class="char-name">${ch.name}</div>
        <div class="char-quirk">${ch.quirk}</div>
        ${base
          ? `<div class="char-base" title="Base ball"><img src="${icon(base.icon)}" alt="${base.name}" width="24" height="24"><span>${base.name}</span></div>`
          : '<div class="char-base none">no base ball</div>'}`;
      card.addEventListener('click', () => {
        emitAction({ type: 'toggleChar', id: ch.id });
      });
      // hovering the base-ball chip shows that ball's toast
      const baseChip = card.querySelector('.char-base');
      if (baseChip) {
        baseChip.addEventListener('mouseenter', (e) => e.stopPropagation());
        baseChip.addEventListener('mouseleave', (e) => e.stopPropagation());
        attachToast(baseChip as HTMLElement, () => (base ? base : null));
      }
      charCards.push({ ch, card });
      wrap.appendChild(card);
    }
  }

  function paint(vm: ViewModel) {
    for (const { ch, card } of charCards) {
      const c = vm.charCards.get(ch.id);
      if (!c) continue;
      card.classList.toggle('selected', c.selected);
      card.classList.toggle('filtered', c.filtered);
      // Matchmaker pairing restriction: dimmed, not-allowed cursor, and a
      // tooltip naming the held character. The card stays clickable (the
      // dispatch is a no-op) so the native tooltip keeps working — disabled
      // elements suppress mouse events.
      card.classList.toggle('blocked', c.blocked);
      card.title = c.blockedBy ? `can't pair with ${c.blockedBy}` : '';
    }
  }

  return {
    build,
    paint,
    destroy() {
      charCards = [];
    },
  };
}
