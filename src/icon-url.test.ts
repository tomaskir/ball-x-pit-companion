// Behaviour tests for the icon-URL join rule. These replace the old
// source-regex test that read renderer.ts as text — the contract is now
// exercised through iconUrl's interface (the renderer supplies the
// production base; tests supply any literal base).
import { describe, it, expect } from 'vitest';
import { iconUrl } from './icon-url';

describe('iconUrl: the base-relative icon join (sub-path deploy)', () => {
  // Bug history is narrated in regression.test.ts (icon-path describe block).
  it('joins base and path with exactly one slash', () => {
    expect(iconUrl('/ball-x-pit-companion', 'icons/balls/x.png')).toBe(
      '/ball-x-pit-companion/icons/balls/x.png',
    );
  });

  it('normalizes a trailing slash on the base', () => {
    expect(iconUrl('/ball-x-pit-companion/', 'icons/balls/x.png')).toBe(
      '/ball-x-pit-companion/icons/balls/x.png',
    );
  });

  it('empty base means root deploy — the explicit slash still applies', () => {
    expect(iconUrl('', 'icons/balls/x.png')).toBe('/icons/balls/x.png');
  });

  it('throws on a root-absolute path (would 404 under a sub-path deploy)', () => {
    expect(() => iconUrl('/base', '/icons/balls/x.png')).toThrow();
  });
});
