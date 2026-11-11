// Vitest config: the only override is excluding agent worktrees — concurrent
// agent sessions keep their git worktrees under .worktrees/ (concurrent-agents
// skill), and vitest's default scan picks up their test copies (inflated
// counts, cross-tree reads). .claude/worktrees/ is excluded defensively too:
// worktrees must not live there, but a stray one must not pollute the scan.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '.worktrees/**', '.claude/worktrees/**'],
  },
});
