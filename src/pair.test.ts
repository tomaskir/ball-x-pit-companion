// Tests for unordered-pair identity (src/pair.ts) — the one home for the
// "reverse composition is the same pair" invariant and its key format.
import { describe, it, expect } from 'vitest';
import { composeKey, pairKey, pairKeyOf, parseComposeKey, parsePair } from './pair';

describe('pairKey', () => {
  it('sorts the two ids and joins them with +', () => {
    expect(pairKey('egg-sac', 'timestop')).toBe('egg-sac+timestop');
  });

  it('is order-insensitive — the reverse composition is the same pair', () => {
    expect(pairKey('timestop', 'egg-sac')).toBe(pairKey('egg-sac', 'timestop'));
  });
});

describe('pairKeyOf', () => {
  it('builds the same key from the two ids in either order', () => {
    expect(pairKeyOf(['egg-sac', 'timestop'])).toBe('egg-sac+timestop');
    expect(pairKeyOf(['timestop', 'egg-sac'])).toBe('egg-sac+timestop');
  });

  it('agrees with pairKey and round-trips through parsePair', () => {
    expect(pairKeyOf(['timestop', 'egg-sac'])).toBe(pairKey('timestop', 'egg-sac'));
    expect(parsePair(pairKeyOf(['timestop', 'egg-sac']))).toEqual(['egg-sac', 'timestop']);
  });
});

describe('parsePair', () => {
  it('returns the two ids of a pair key', () => {
    expect(parsePair('egg-sac+timestop')).toEqual(['egg-sac', 'timestop']);
  });

  it('round-trips pairKey regardless of input order', () => {
    expect(parsePair(pairKey('timestop', 'egg-sac'))).toEqual(['egg-sac', 'timestop']);
    expect(parsePair(pairKey('egg-sac', 'timestop'))).toEqual(['egg-sac', 'timestop']);
  });

  it('returns null for keys that are not pairs', () => {
    expect(parsePair('egg-sac')).toBeNull();
    expect(parsePair('a+b+c')).toBeNull();
    expect(parsePair('+timestop')).toBeNull();
    expect(parsePair('egg-sac+')).toBeNull();
    expect(parsePair('')).toBeNull();
  });
});

describe('composeKey', () => {
  it('keeps the compose order — the first pick stays first', () => {
    expect(composeKey('flash', 'glacier')).toBe('flash>glacier');
    expect(composeKey('glacier', 'flash')).toBe('glacier>flash');
  });

  it('round-trips through parseComposeKey in composition order', () => {
    expect(parseComposeKey(composeKey('glacier', 'flash'))).toEqual(['glacier', 'flash']);
  });
});

describe('parseComposeKey', () => {
  it('returns null for keys that are not compose keys', () => {
    expect(parseComposeKey('flash')).toBeNull();
    expect(parseComposeKey('a>b>c')).toBeNull();
    expect(parseComposeKey('>glacier')).toBeNull();
    expect(parseComposeKey('flash>')).toBeNull();
    expect(parseComposeKey('')).toBeNull();
  });
});
