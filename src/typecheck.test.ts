// Typecheck gate: run tsc as part of the vitest suite so `npm test` fails on
// type errors. (Astro's build doesn't typecheck; vitest doesn't either.)
//
// The gate must fail loudly: a missing compiler is a red test, not an empty
// string that compares equal to a clean run. The binary is resolved from the
// declared `typescript` devDependency, so the gate never reaches for npx or
// the network, and it is spawned exactly once.
import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const tscBin = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));

describe('typecheck', () => {
  // tsc under a loaded 34-worker suite can exceed the 5s default; the
  // assertion is unchanged, only the time it is given. The spawn timeout
  // bounds the child too, which the vitest timeout cannot preempt.
  it('tsc --noEmit exits clean', () => {
    // Run the script through node: the bin has no extension and its exec bit
    // is not guaranteed, so spawning it directly is not portable.
    const result = spawnSync(process.execPath, [tscBin, '--noEmit'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000,
    });
    // A missing compiler, a timeout, and any non-zero exit (type errors) are
    // failures; only a clean exit 0 passes.
    expect(result.error, `tsc failed to run: ${result.error}`).toBeUndefined();
    expect(result.status, `${result.stdout ?? ''}${result.stderr ?? ''}` || 'tsc failed with no output').toBe(0);
  }, 45000);

  it('strictNullChecks is enabled, so the gate checks null contracts', () => {
    // The gate is only as strong as the config it runs under: pin the
    // resolved option (extends chain included) so a later tsconfig edit
    // cannot silently drop it. Parsing in-process keeps tsc to one spawn.
    const configPath = path.join(repoRoot, 'tsconfig.json');
    const read = ts.readConfigFile(configPath, ts.sys.readFile);
    if (read.error) throw new Error(ts.flattenDiagnosticMessageText(read.error.messageText, '\n'));
    const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, repoRoot);
    expect(parsed.errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n'))).toEqual([]);
    // `strict: true` implies strictNullChecks; accept either spelling.
    expect(parsed.options.strictNullChecks ?? parsed.options.strict ?? false).toBe(true);
  });
});
