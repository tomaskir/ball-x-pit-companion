// Tests for unordered-pair identity (src/pair.ts) — the one home for the
// "reverse composition is the same pair" invariant and its key format.
import { describe, it, expect } from 'vitest';
import { pairKey, parsePair } from './pair';

describe('pairKey', () => {
  it('sorts the two ids and joins them with +', () => {
    expect(pairKey('egg-sac', 'timestop')).toBe('egg-sac+timestop');
  });

  it('is order-insensitive — the reverse composition is the same pair', () => {
    expect(pairKey('timestop', 'egg-sac')).toBe(pairKey('egg-sac', 'timestop'));
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
