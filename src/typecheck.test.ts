// Typecheck gate: run tsc as part of the vitest suite so `npm test` fails on
// type errors. (Astro's build doesn't typecheck; vitest doesn't either.)
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';

const repoRoot = new URL('..', import.meta.url).pathname;

describe('typecheck', () => {
  // tsc under a loaded 34-worker suite can exceed the 5s default; the
  // assertion is unchanged, only the time it is given.
  it('tsc --noEmit reports no errors', () => {
    let out = '';
    try {
      out = execFileSync('npx', ['tsc', '--noEmit'], { encoding: 'utf8', cwd: repoRoot, stdio: 'pipe' });
    } catch (e: any) {
      out = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
    expect(out.trim(), out || 'tsc failed with no output').toBe('');
  }, 20000);

  it('strictNullChecks is enabled, so the gate checks null contracts', () => {
    // The gate is only as strong as the config it runs under: pin the
    // resolved option so a later tsconfig edit cannot silently drop it.
    const out = execFileSync('npx', ['tsc', '--showConfig'], {
      encoding: 'utf8',
      cwd: repoRoot,
      stdio: 'pipe',
    });
    expect(JSON.parse(out).compilerOptions.strictNullChecks).toBe(true);
  }, 20000);
});
