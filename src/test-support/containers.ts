// Test support: the jsdom container set the renderer's buildAll() needs —
// the island's index.astro mount points plus the static plan toolbar. Shared
// by renderer.test.ts and the jsdom regression tests so the list lives in
// one place.
export const CONTAINERS = [
  'ballsGrid', 'passivesGrid', 'charactersGrid', 'charChips', 'slotHint',
  'fusionList', 'fusionPanel', 'planView', 'selection-balls', 'selection-passives',
] as const;

/** Create any missing containers and the plan toolbar (shell markup —
 *  Clear/Share live in index.astro; the tests only need the End game
 *  upgrades toggle the renderer paints state onto). Idempotent. */
export function mountShell(): void {
  for (const id of CONTAINERS) {
    if (!document.getElementById(id)) {
      const el = document.createElement('div');
      el.id = id;
      document.body.appendChild(el);
    }
  }
  if (!document.getElementById('planUpgrades')) {
    const toolbar = document.createElement('div');
    toolbar.className = 'plan-toolbar';
    toolbar.innerHTML = '<label class="plan-upgrades"><input type="checkbox" id="planUpgrades"><span>End game upgrades</span></label>';
    document.body.appendChild(toolbar);
  }
}
