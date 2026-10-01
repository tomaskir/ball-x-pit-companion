// Catalog tests: namespace resolution (ball vs passive) has one home.
// Ticket 03: the graphs are strictly separate, but ids never collide — so an
// id alone decides its namespace, and the catalog is where that is decided.
import { describe, it, expect } from 'vitest';
import { graphFor, isPassive, itemFor } from './catalog';
import { childrenOf } from './graph';

describe('catalog: namespace resolution lives in one module', () => {
  it('graphFor returns the ball graph for a ball id (ball children reachable)', () => {
    expect(childrenOf('inferno', graphFor('inferno')).map((c) => c.id)).toContain('armageddon');
  });

  it('graphFor returns the passive graph for a passive id (passive children reachable)', () => {
    expect(childrenOf('wagon-wheel', graphFor('wagon-wheel')).map((c) => c.id)).toContain('ardent-tire');
  });

  it('graphs stay separate: a ball id is not in the passive graph and vice versa', () => {
    expect(graphFor('inferno').has('wagon-wheel')).toBe(false);
    expect(graphFor('wagon-wheel').has('inferno')).toBe(false);
  });

  it('isPassive splits the namespaces', () => {
    expect(isPassive('wagon-wheel')).toBe(true);
    expect(isPassive('inferno')).toBe(false);
  });

  it('itemFor resolves both namespaces; unknown ids come back undefined', () => {
    expect(itemFor('inferno')?.name).toBe('Inferno');
    expect(itemFor('wagon-wheel')?.name).toBe('Wagon Wheel');
    expect(itemFor('no-such-item')).toBeUndefined();
  });
});
