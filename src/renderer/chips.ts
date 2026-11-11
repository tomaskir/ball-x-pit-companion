// The header character chips: rebuild only when the character selection
// changes — reconcile diffs the painted id set on the chip strip, so
// search/selection repaints skip the rebuild. Internal to the renderer
// facade.
import { emitAction } from './seam';
import { reconcile } from './reconcile';
import { icon } from './shared';
import type { ViewModel } from '../view-state';

export function paintCharChips(vm: ViewModel) {
  document.getElementById('slotHint')!.textContent = vm.slotHint;
  const wrap = document.getElementById('charChips')!;
  reconcile(wrap, vm.selectedChars.map((c) => c.id).join(','), () => {
    wrap.innerHTML = '';
    for (const ch of vm.selectedChars) {
      // the chip body is inert — removal is the X button's job only
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `<img src="${icon(ch.sprite)}" alt="" width="22" height="22"><span>${ch.name}</span><button class="chip-x" aria-label="Remove ${ch.name}" title="Click × to remove">×</button>`;
      chip.querySelector('.chip-x')!.addEventListener('click', () => {
        emitAction({ type: 'toggleChar', id: ch.id });
      });
      wrap.appendChild(chip);
    }
  });
}
