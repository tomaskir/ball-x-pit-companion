// The balls/passives screens' selection box: one box per item screen, built
// once into its index.astro container; paint() toggles hidden, the label,
// and the button labels/disabled states from vm.selectionBoxes. Buttons emit
// through the seam like every other built-in click handler. Internal to the
// renderer facade.
import { emitAction } from './seam';
import { bindAction, type ActionSlot } from './action-slot';
import { PLAN_LIMIT_TITLE, PLAN_TOGGLE_LABELS } from './labels';
import type { SelectionBoxState, ViewModel } from '../view-state';

interface SelectionBoxEls {
  root: HTMLElement;
  name: HTMLElement;
  planBtn: HTMLButtonElement;
  fusionBtn: HTMLButtonElement | null;
  // The buttons are built once; the selection changes under them, so each
  // button's typed action rides its own action slot, refreshed every paint.
  planAction: ActionSlot;
  fusionAction: ActionSlot | null;
}
const selectionBoxes: Record<'balls' | 'passives', SelectionBoxEls | null> = { balls: null, passives: null };

const PLAN_BTN_LABELS: Record<SelectionBoxState['plan'], string> = {
  add: PLAN_TOGGLE_LABELS.add,
  remove: PLAN_TOGGLE_LABELS.remove,
  disabled: PLAN_TOGGLE_LABELS.add,
};
const FUSION_BTN_LABELS: Record<Exclude<SelectionBoxState['fusion'], null>, string> = {
  add: 'Add to fusion',
  remove: 'Remove from fusion',
  disabled: 'Add to fusion',
  unfusable: 'Add to fusion',
};
const FUSION_BTN_TITLES: Record<Exclude<SelectionBoxState['fusion'], null>, string> = {
  add: '',
  remove: '',
  disabled: 'selection full — deselect one first',
  unfusable: 'Baby Ball cannot be fused',
};

function buildSelectionBox(screen: 'balls' | 'passives') {
  const root = document.getElementById(`selection-${screen}`)!;
  const withFusion = screen === 'balls';
  root.innerHTML = `
    <span class="selection-label">Selection: <b class="selection-name"></b></span>
    <button class="selection-btn" data-kind="plan"></button>
    ${withFusion ? '<button class="selection-btn" data-kind="fusion"></button>' : ''}`;
  const planBtn = root.querySelector<HTMLButtonElement>('.selection-btn[data-kind="plan"]')!;
  const fusionBtn = root.querySelector<HTMLButtonElement>('.selection-btn[data-kind="fusion"]');
  selectionBoxes[screen] = {
    root,
    name: root.querySelector('.selection-name') as HTMLElement,
    planBtn,
    fusionBtn,
    planAction: bindAction(planBtn, emitAction),
    fusionAction: fusionBtn ? bindAction(fusionBtn, emitAction) : null,
  };
}

/** Build both selection boxes once. */
export function buildSelectionBoxes(): void {
  buildSelectionBox('balls');
  buildSelectionBox('passives');
}

export function paintSelectionBoxes(vm: ViewModel) {
  for (const screen of ['balls', 'passives'] as const) {
    const els = selectionBoxes[screen];
    if (!els) continue;
    const state = vm.selectionBoxes[screen];
    els.root.hidden = !state;
    // the action slots carry the item the once-built buttons act on; a null
    // state clears them so no stale id survives the hidden box
    if (state) {
      els.planAction.set({ type: 'togglePlanItem', id: state.item.id });
      els.fusionAction?.set({ type: 'toggleFusion', id: state.item.id });
    } else {
      els.planAction.clear();
      els.fusionAction?.clear();
    }
    if (!state) continue;
    els.name.textContent = state.item.name;
    els.planBtn.textContent = PLAN_BTN_LABELS[state.plan];
    els.planBtn.disabled = state.plan === 'disabled';
    if (els.fusionBtn && state.fusion) {
      els.fusionBtn.textContent = FUSION_BTN_LABELS[state.fusion];
      els.fusionBtn.disabled = state.fusion === 'disabled' || state.fusion === 'unfusable';
    }
    // disabled buttons suppress mouse events, so the tooltips ride the box
    const boxTitles = [
      state.plan === 'disabled' ? PLAN_LIMIT_TITLE : '',
      els.fusionBtn && state.fusion ? FUSION_BTN_TITLES[state.fusion] : '',
    ].filter(Boolean);
    els.root.title = boxTitles.join(' · ');
  }
}
