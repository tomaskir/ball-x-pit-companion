// Tests for the fusion-panel module through its one interface:
// deriveFusionPanel(picks, plan) → { panel, hint }. The panel's 3-state
// machine (empty / pending / composed), its order presentation, and its hint
// text are asserted here directly — no whole view state in the way.
import { describe, it, expect } from 'vitest';
import { deriveFusionPanel, type FusionPanelPlan } from './fusion-panel';
import { ballMap } from './catalog';
import { EMPTY_FUSION_PANEL_PLAN } from './test-support/pins';

/** A plan stub: nothing planned, no ball slots used (shared with the pins). */
const plan = (over: Partial<FusionPanelPlan> = {}): FusionPanelPlan => ({
  ...EMPTY_FUSION_PANEL_PLAN,
  ...over,
});

const composed = (picks: readonly string[], p: FusionPanelPlan = plan()) => {
  const { panel } = deriveFusionPanel(picks, p);
  expect(panel.state).toBe('composed');
  return panel as Extract<typeof panel, { state: 'composed' }>;
};

describe('fusion panel: the 3-state machine', () => {
  it('no picks → empty', () => {
    const { panel } = deriveFusionPanel([], plan());
    expect(panel).toEqual({ state: 'empty' });
  });

  it('one pick → pending with the resolved first ball', () => {
    const { panel } = deriveFusionPanel(['flash'], plan());
    expect(panel).toEqual({ state: 'pending', first: ballMap.get('flash')! });
  });

  it('two picks → composed with both resolved balls and the fused result', () => {
    const fp = composed(['flash', 'glacier']);
    expect(fp.a).toBe(ballMap.get('flash')!);
    expect(fp.b).toBe(ballMap.get('glacier')!);
    expect(fp.fusion.name).toBe('Flash × Glacier');
  });

  it('an unknown pick id leaves the panel empty (the hint still follows the pick count)', () => {
    const { panel, hint } = deriveFusionPanel(['not-a-ball'], plan());
    expect(panel).toEqual({ state: 'empty' });
    expect(hint).toBe('…pick a second ball.');
  });
});

describe('fusion panel: hint text', () => {
  it('walks empty → second-pick → full', () => {
    expect(deriveFusionPanel([], plan()).hint).toBe('Pick two balls to see their fusion.');
    expect(deriveFusionPanel(['flash'], plan()).hint).toBe('…pick a second ball.');
    expect(deriveFusionPanel(['flash', 'glacier'], plan()).hint).toBe('selection full — deselect one first');
  });
});

describe('fusion panel: order presentation', () => {
  it('a shared-property collision is order-sensitive and names the property', () => {
    const fp = composed(['egg-sac', 'timestop']);
    expect(fp.fusion.resolved.collisions.length).toBeGreaterThan(0);
    expect(fp.orderSensitive).toBe(true);
    expect(fp.orderNotice).toContain('Order matters');
    expect(fp.orderNotice).toContain('Cooldown');
  });

  it('a pair with no shared properties is not order-sensitive and carries no notice', () => {
    const fp = composed(['flash', 'glacier']);
    expect(fp.fusion.resolved.collisions).toHaveLength(0);
    expect(fp.orderSensitive).toBe(false);
    expect(fp.orderNotice).toBe('');
  });

  it('an order-dependent reported exception is order-sensitive', () => {
    const fp = composed(['nuclear-bomb', 'wraith']);
    expect(fp.fusion.resolved.collisions).toHaveLength(0);
    expect(fp.orderSensitive).toBe(true);
    expect(fp.orderNotice).toMatch(/exception/i);
  });

  it('a reported exception that is not order-dependent leaves the pair non-order-sensitive', () => {
    const fp = composed(['banshee', 'flash']);
    expect(fp.orderSensitive).toBe(false);
    expect(fp.orderNotice).toBe('');
  });

  it('reversing the picks reverses the composed name and recomputes the presentation', () => {
    const forward = composed(['egg-sac', 'timestop']);
    const reversed = composed(['timestop', 'egg-sac']);
    expect(forward.fusion.name).toBe('Egg Sac × Timestop');
    expect(reversed.fusion.name).toBe('Timestop × Egg Sac');
    expect(reversed.orderSensitive).toBe(true);
    expect(reversed.orderNotice).toContain('Cooldown');
  });

  it('an evolve-instead pair is never order-sensitive', () => {
    const fp = composed(['bleed', 'poison']);
    expect(fp.fusion.evolvesInstead!.name).toBe('Virus');
    expect(fp.orderSensitive).toBe(false);
    expect(fp.orderNotice).toBe('');
  });
});

describe('fusion panel: plan marks', () => {
  it('planned reflects order-insensitive plan membership of the pair', () => {
    const seen: string[][] = [];
    const p = plan({ hasPair: (a, b) => { seen.push([a, b]); return true; } });
    expect(composed(['flash', 'glacier'], p).planned).toBe(true);
    expect(seen).toEqual([['flash', 'glacier']]);
    expect(composed(['flash', 'glacier'], plan()).planned).toBe(false);
  });

  it('planFull is true only when the ball slots are at the active limit', () => {
    expect(composed(['flash', 'glacier'], plan({ ballSlots: { used: 4, capacity: 5 } })).planFull).toBe(false);
    expect(composed(['flash', 'glacier'], plan({ ballSlots: { used: 5, capacity: 5 } })).planFull).toBe(true);
    expect(composed(['flash', 'glacier'], plan({ ballSlots: { used: 6, capacity: 5 } })).planFull).toBe(true);
  });
});

describe('fusion panel: composed presentation', () => {
  it('a collision pair carries display rows and shows the result section', () => {
    const fp = composed(['egg-sac', 'timestop']);
    expect(fp.showResult).toBe(true);
    expect(fp.resultRows).toHaveLength(1);
    expect(fp.resultRows[0]).toMatchObject({
      label: 'Cooldown',
      value: '3 second',
      winner: 'Egg Sac',
      reported: false,
    });
    expect(fp.resultRows[0].title).toContain("Egg Sac's 3 second wins over Timestop's");
  });

  it('a pair with no collisions carries no rows and hides the result section', () => {
    const fp = composed(['flash', 'glacier']);
    expect(fp.showResult).toBe(false);
    expect(fp.resultRows).toEqual([]);
  });

  it('a reported collision row is marked reported', () => {
    const fp = composed(['freeze-ray', 'blizzard']);
    expect(fp.showResult).toBe(true);
    expect(fp.resultRows[0]).toMatchObject({ label: 'Freeze duration', value: '13.0 seconds', reported: true });
  });

  it('reversing the picks changes the row content (the reconcile key follows it)', () => {
    const forward = composed(['egg-sac', 'timestop']);
    const reversed = composed(['timestop', 'egg-sac']);
    expect(forward.resultRows[0].key).not.toBe(reversed.resultRows[0].key);
    expect(reversed.resultRows[0].winner).toBe('Timestop');
  });

  it('an order-dependent exception carries display rows with source, confidence, and the order mark', () => {
    const fp = composed(['nuclear-bomb', 'wraith']);
    expect(fp.showResult).toBe(false);
    expect(fp.showExceptions).toBe(true);
    expect(fp.exceptions).toHaveLength(1);
    expect(fp.exceptions[0]).toMatchObject({
      title: 'Order-sensitive one-off',
      confidence: 'reported',
      orderDependent: true,
    });
    expect(fp.exceptions[0].source).toBeTruthy();
  });

  it('a non-order exception still shows the exceptions section but marks the row not order-dependent', () => {
    const fp = composed(['banshee', 'flash']);
    expect(fp.showExceptions).toBe(true);
    expect(fp.exceptions[0]).toMatchObject({ title: 'Whole-field curse override', orderDependent: false });
  });

  it('a pair with no exceptions hides the exceptions section', () => {
    const fp = composed(['flash', 'glacier']);
    expect(fp.showExceptions).toBe(false);
    expect(fp.exceptions).toEqual([]);
  });

  it('an evolve-instead pair carries no result or exception rows', () => {
    const fp = composed(['bleed', 'poison']);
    expect(fp.showResult).toBe(false);
    expect(fp.showExceptions).toBe(false);
    expect(fp.resultRows).toEqual([]);
    expect(fp.exceptions).toEqual([]);
  });
});
