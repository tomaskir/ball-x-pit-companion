// The edition filter's UI chrome: the per-screen checkbox groups (static
// shell markup, wired by src/shell.ts) and the header loss notice. Paint-only:
// every group mirrors the view model's enabledEditions, and the notice shows
// the dispatch's dropped-entry count for ~4 seconds or until the next action
// (the view model resets the count on every dispatch). Internal to the
// renderer facade; the notice's timer belongs to the renderer instance, so
// destroy() cannot leave it running.
import { isEdition } from '../edition-gate';
import type { ViewModel } from '../view-state';

/** One renderer instance's edition-filter chrome. */
export interface EditionFilter {
  /** Mirror the enabled editions onto every checkbox group and repaint the
   *  loss notice from the view model's dropped-entry count. */
  paint(vm: ViewModel): void;
  /** Clear the notice timer and hide the notice (destroy()). */
  destroy(): void;
}

/** How long the loss notice stays up when no further action arrives. */
const LOSS_NOTICE_MS = 4000;

const lossText = (count: number): string =>
  `${count} ${count === 1 ? 'entry' : 'entries'} removed by edition filter`;

export function createEditionFilter(): EditionFilter {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return {
    paint(vm) {
      for (const input of document.querySelectorAll<HTMLInputElement>('.edition-toggle[data-edition]')) {
        const edition = input.dataset.edition;
        input.checked = isEdition(edition) && vm.enabledEditions.includes(edition);
      }

      const notice = document.getElementById('editionLoss');
      if (!notice) return;
      if (vm.editionDroppedCount > 0) {
        notice.textContent = lossText(vm.editionDroppedCount);
        notice.hidden = false;
        // a second loss inside the window restarts the countdown
        clearTimer();
        timer = setTimeout(() => {
          notice.hidden = true;
          timer = null;
        }, LOSS_NOTICE_MS);
      } else {
        clearTimer();
        notice.hidden = true;
      }
    },
    destroy() {
      clearTimer();
      const notice = document.getElementById('editionLoss');
      if (notice) notice.hidden = true;
    },
  };
}
