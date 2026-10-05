// Vitest config: the only override is excluding .worktrees/ — concurrent
// agent sessions keep their git worktrees under .worktrees/, and vitest's
// default scan picks up their test copies (inflated counts, cross-tree
// reads). See AGENTS.md's concurrent-sessions note.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '.worktrees/**'],
  },
});
