/** Join a base URL and a base-relative icon path with exactly one slash.
 *  `base` may carry a trailing slash (normalized away); `path` must be
 *  base-relative — a leading "/" is a contract violation and throws (it
 *  would 404 under a sub-path deploy). Pure: the base is always injected
 *  (the renderer passes the production base; tests pass any literal). */
export function iconUrl(base: string, path: string): string {
  if (path.startsWith('/')) {
    throw new Error(`iconUrl: path must be base-relative, got "${path}"`);
  }
  return base.replace(/\/$/, '') + '/' + path;
}
