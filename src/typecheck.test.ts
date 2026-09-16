// Typecheck gate: run tsc as part of the vitest suite so `npm test` fails on
// type errors. (Astro's build doesn't typecheck; vitest doesn't either.)
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';

describe('typecheck', () => {
  it('tsc --noEmit reports no errors', () => {
    let out = '';
    try {
      out = execFileSync('npx', ['tsc', '--noEmit'], { encoding: 'utf8', cwd: new URL('..', import.meta.url).pathname, stdio: 'pipe' });
    } catch (e: any) {
      out = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
    expect(out.trim(), out || 'tsc failed with no output').toBe('');
  });
});
