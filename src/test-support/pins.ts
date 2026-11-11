// Test support: named pins that more than one test file asserts. The module
// test owns each contract and regression.test.ts aliases it — both call the
// same named assertion here, so one behaviour change updates one pin, not two
// assertion copies. Each assertion keeps the bug's name in its failure
// messages.
import { expect } from 'vitest';
import { globalCss, rulesFor } from './styles';
import { ballMap } from '../catalog';
import { fuse } from '../fusion';
import { createViewState } from '../view-state';

const ball = (id: string) => ballMap.get(id)!;

/** The global `[hidden] { display: none !important }` base rule — author
 *  display rules (e.g. .fusion-head's flex) must never beat the hidden
 *  attribute (was torn panel state: hint + stale head after deselect). */
export function expectHiddenBeatsAuthorDisplay(): void {
  const rules = rulesFor(globalCss(), '[hidden]');
  expect(rules, 'a base [hidden] rule exists').not.toHaveLength(0);
  expect(rules.map((r) => r.decls.get('display')), '[hidden] forces display:none !important')
    .toContain('none !important');
}

/** The fusion pick list's scrollbar is permanent (overflow-y: scroll) and
 *  fixed-size (scrollbar-width: thin — Firefox's thin scrollbar never
 *  expands on hover), separated from the rows by a reserved gutter, and the
 *  list never pushes the page past the viewport (max-height budgets the
 *  chrome + per-screen search box). */
export function expectFusionListScrollbarPermanentAndSeparated(): void {
  const css = globalCss();
  const base = rulesFor(css, '.fusion-list');
  expect(base, 'a top-level .fusion-list rule exists').not.toHaveLength(0);
  const block = base[0].decls;
  expect(block.get('overflow-y')).toBe('scroll');
  expect(block.get('scrollbar-width')).toBe('thin');
  expect(block.get('padding-right')).toBe('12px');
  // 100vh minus header/footer/search chrome (~232px) — was 100vh-140px, a
  // whole-page scroll
  expect(block.get('max-height')).toBe('calc(100vh - 232px)');
  // rows keep clearance from the scrollbar gutter (Firefox hover-expansion)
  const row = rulesFor(css, '.fusion-list > .fusion-row');
  expect(row.map((r) => r.decls.get('margin-right')), '.fusion-row clears the gutter')
    .toContain('6px');
}

/** Both picked fusion slots share ONE highlight rule (slot-2 was visually
 *  subtle: dim border, no glow — read as "not highlighted"). */
export function expectSlotHighlightsIdentical(): void {
  const shared = rulesFor(globalCss(), '.fusion-row.slot-1').filter((r) =>
    r.selectors.includes('.fusion-row.slot-2'));
  expect(shared, 'slot-1 and slot-2 share one highlight rule').toHaveLength(1);
  expect(shared[0].decls.get('border-color')).toBe('var(--gold)');
  expect(shared[0].decls.get('box-shadow')).toBe('0 0 6px var(--glow)');
}

// ---------- fusion composer pins ----------

/** VES's two-hop spawn chain drops the inherited property at hop 2 —
 *  Hemorrhage × VES and Nuclear Bomb × VES do not cross-wire. */
export function expectVesTwoHopSpawnChainDropsProperty(): void {
  expect(fuse(ball('hemorrhage'), ball('voluptuous-egg-sac'))!.crossWire).toBeNull();
  expect(fuse(ball('nuclear-bomb'), ball('voluptuous-egg-sac'))!.crossWire).toBeNull();
}

/** Freeze Ray × Sun: Sun's field aura cannot apply the beam's on-hit freeze;
 *  the beam carries Sun's burn instead. */
export function expectFreezeRaySunFieldAuraDoesNotWire(): void {
  const r = fuse(ball('freeze-ray'), ball('sun'))!;
  expect(r.crossWire).toBeNull();
  expect(r.notes.join(' ')).toMatch(/beam applies Sun's burn/i);
}

/** Satan's field judgment is debuff-only — it cannot carry on-hit statuses. */
export function expectSatanDebuffOnlyCannotCarryOnHitStatuses(): void {
  expect(fuse(ball('hemorrhage'), ball('satan'))!.crossWire).toBeNull();
}

/** Issue #20: status-only spawn carriers wire on-hit statuses. */
export function expectStatusOnlyCarriersWireOnHitStatuses(): void {
  expect(fuse(ball('brood-mother'), ball('flash'))!.crossWire).not.toBeNull();
  expect(fuse(ball('mosquito-king'), ball('virus'))!.crossWire).not.toBeNull();
}

/** The status-only carriers attach their reported degradation/trigger
 *  caveats. */
export function expectStatusOnlyCarrierCaveats(): void {
  const notes = fuse(ball('brood-mother'), ball('flash'))!.notes.join(' ');
  expect(notes).toMatch(/Brood Mother's babies inherit the partner's properties, but the inherited effect is weaker/);
  expect(notes).toMatch(/spawn fires on hit, so a screen-wide\/AOE partner produces fewer babies/);
}

/** Spawn-bound traits stay unwired for the status-only carriers. */
export function expectSpawnBoundTraitsStayUnwired(): void {
  expect(fuse(ball('brood-mother'), ball('glacier'))!.crossWire).toBeNull();
  expect(fuse(ball('mosquito-king'), ball('glacier'))!.crossWire).toBeNull();
}

/** The level-3 overlay replaces the level-1 catalog: Overgrowth's threshold
 *  is 2, not 3. */
export function expectLevel3OvergrowthThresholdApplies(): void {
  expect(fuse(ball('overgrowth'), ball('flash'))!.paragraphs[0])
    .toContain('Upon reaching 2, consume all stacks');
}

/** Freeze Ray was not spawn-bound: Flash's on-hit AOE spreads the freeze
 *  (Nov 2026 community test). */
export function expectFreezeRayFlashWires(): void {
  const r = fuse(ball('flash'), ball('freeze-ray'))!;
  expect(r.crossWire).not.toBeNull();
  expect(r.crossWire).toContain('Freeze Ray');
}

/** Sandstorm is in the fact base's pass-through set. */
export function expectSandstormIsPassThrough(): void {
  expect(fuse(ball('black-hole'), ball('sandstorm'))!.notes.join(' ')).toMatch(/pass-through/i);
}

/** Berserk's "every second" text describes its debuff tick; the ball applies
 *  it on hit, so an AOE carrier spreads it. */
export function expectBerserkIsOnHitStatus(): void {
  expect(fuse(ball('flash'), ball('berserk'))!.crossWire).not.toBeNull();
}

/** Order is property-set union with first-pick precedence: Banished Flame ×
 *  Sun collides on three burn keys, Erosion × Stone resolves bonus damage to
 *  the first pick, and equal cooldowns do not collide. */
export function expectOrderResolutionPropertyUnion(): void {
  expect(fuse(ball('banished-flame'), ball('sun'))!.collisions.map((c) => c.key).sort())
    .toEqual(['burn-duration', 'burn-max-stacks', 'burn-per-stack-damage']);
  expect(fuse(ball('erosion'), ball('stone'))!.collisions[0]).toMatchObject({
    key: 'bonus-damage', winner: 'erosion', value: '5%', loserValue: '400%',
  });
  expect(fuse(ball('bomb'), ball('dark'))!.collisions).toEqual([]);
}

/** Kill-on-hit effects ride damage-dealing AOE carriers (Black Hole × Sun —
 *  the corpus meta pair). */
export function expectKillEffectsRideAoeCarriers(): void {
  expect(fuse(ball('black-hole'), ball('sun'))!.crossWire).toContain('Black Hole');
}

/** Spawn carriers carry spawn-bound statuses (Glacier × Maggot). */
export function expectSpawnCarriersCarrySpawnBoundStatuses(): void {
  expect(fuse(ball('glacier'), ball('maggot'))!.crossWire).toContain('Glacier');
}

/** Both-cooldown pairs resolve to the first pick's value (namu rule). */
export function expectFirstPickCooldownWins(): void {
  expect(fuse(ball('black-hole'), ball('timestop'))!.collisions[0]).toMatchObject({
    key: 'cooldown', winner: 'black-hole', value: '5 second', loser: 'timestop', loserValue: '20 second',
  });
}

/** #21 resolved Black Hole × Sun to order-independent: no reported
 *  exception. */
export function expectBlackHoleSunOrderIndependent(): void {
  expect(fuse(ball('black-hole'), ball('sun'))!.exceptions).toEqual([]);
}

/** resultEmptyText must be blank when the pair has collision rows — the
 *  empty copy is only for pairs with no shared properties. */
export function expectResultEmptyTextBlankForCollisionPair(): void {
  const view = createViewState();
  view.dispatch({ type: 'toggleFusion', id: 'egg-sac' });
  const vm = view.dispatch({ type: 'toggleFusion', id: 'timestop' });
  const fp = vm.fusionPanel as Extract<typeof vm.fusionPanel, { state: 'composed' }>;
  expect(fp.collisions.length).toBeGreaterThan(0);
  expect(fp.resultEmptyText).toBe('');
}
