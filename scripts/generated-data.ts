// The generated-data contract: one place that turns parsed fact bases into
// the in-memory data, renders the five generated files, and validates the
// result. emit-data.ts is a thin CLI over this module, and src/data.test.ts
// runs the same validateGenerated list against the checked-in data — the
// invariants are written once, not copied.
import { slug } from './slug.ts';
import { WILDCARD, validateEditorial } from './editorial.ts';
import type { ParsedFactBases } from './fact-bases.ts';
import type { EditorialMaps, VerdictRule } from './editorial.ts';

export interface GeneratedBall {
  id: string;
  name: string;
  depth: 0 | 1 | 2;
  effects: string;
  recipes: string[][];
  onHit: string;
  icon: string;
  tags: string[];
}

export interface GeneratedPassive {
  id: string;
  name: string;
  depth: 0 | 1 | 2;
  effects: string;
  recipes: string[][];
  icon: string;
  tags: string[];
}

export interface GeneratedCharacter {
  id: string;
  name: string;
  baseBallId: string | null;
  quirk: string;
  icon: string;
  sprite: string;
  verdicts: VerdictRule[];
  /** Matchmaker-forbidden partner ids (symmetric relation). */
  cannotPair: string[];
}

export interface GeneratedData {
  tags: Record<string, string>;
  balls: GeneratedBall[];
  passives: GeneratedPassive[];
  characters: GeneratedCharacter[];
  level3: Record<string, string>;
}

/** Pure mapping: parsed fact bases + editorial maps → the generated data. */
export function emitData(parsed: ParsedFactBases, editorial: EditorialMaps): GeneratedData {
  return {
    tags: { ...editorial.TAGS },
    balls: parsed.balls.map((b) => ({
      id: slug(b.name),
      name: b.name,
      depth: b.depth,
      effects: b.effect,
      recipes: b.recipes,
      onHit: b.onhit,
      icon: `icons/balls/${slug(b.name)}.png`, // prefix with import.meta.env.BASE_URL at runtime
      tags: [...(editorial.BALL_TAGS[slug(b.name)] ?? [])],
    })),
    passives: parsed.passives.map((p) => ({
      id: slug(p.name),
      name: p.name,
      depth: p.depth,
      effects: p.effect,
      recipes: p.recipes,
      icon: `icons/passives/${slug(p.name)}.png`, // prefix with import.meta.env.BASE_URL at runtime
      tags: [...(editorial.PASSIVE_TAGS[slug(p.name)] ?? [])],
    })),
    characters: parsed.characters.map((c) => ({
      id: slug(c.name),
      name: c.name,
      baseBallId: c.baseBall === null ? null : slug(c.baseBall),
      quirk: c.quirk,
      icon: `icons/character-portraits/${slug(c.name)}.png`, // prefix with import.meta.env.BASE_URL at runtime
      sprite: `icons/character-sprites/${slug(c.name)}.png`,
      verdicts: [...(editorial.CHAR_VERDICTS[slug(c.name)] ?? [])],
      cannotPair: (c.cannotPair ?? []).map(slug).sort(),
    })),
    level3: { ...parsed.level3 },
  };
}

/** Render the generated data as the five src/data/*.ts files, in write order. */
export function renderGenerated(data: GeneratedData): { name: string; content: string }[] {
  const ts = (body: string): string => body + '\n';

  const tagsTs = ts(`// Synergy tag vocabulary — the site's own editorial model (see
// docs/research/game-mechanics.md §4). Characters carry verdict rules over
// these tags; indicators render from tag overlap.
export const TAGS: Record<string, string> = ${JSON.stringify(data.tags, null, 2)};
`);

  const ballsTs = ts(`// Ball data from ballxpit.wiki.gg (2026-09-13, game v1.301) — effect text
// verbatim. recipes: OR-of-ANDs of component ids. depth: 0 = basic,
// 1 = evolved (level-2), 2 = tier-3. Tags are the site's editorial synergy
// model, not game data.
export interface Ball {
  id: string;
  name: string;
  depth: 0 | 1 | 2;
  effects: string;
  recipes: string[][];
  onHit: string;
  icon: string;
  tags: string[];
}

export const BALLS: Ball[] = ${JSON.stringify(data.balls, null, 2)};
`);

  const passivesTs = ts(`// Passive data from ballxpit.wiki.gg (2026-09-13) — effect text verbatim.
// Same shape as Ball; own id namespace. Ball and passive graphs never
// cross-reference.
export interface Passive {
  id: string;
  name: string;
  depth: 0 | 1 | 2;
  effects: string;
  recipes: string[][];
  icon: string;
  tags: string[];
}

export const PASSIVES: Passive[] = ${JSON.stringify(data.passives, null, 2)};
`);

  const charactersTs = ts(`// Character data from ballxpit.wiki.gg (2026-09-13). Verdict rules are the
// site's editorial synergy model derived from quirk text — not playtested
// (flagged in docs/research/game-mechanics.md). Unlisted tags are neutral.
// The wildcard tag "*passives" matches every passive (The Ballbearer).
// cannotPair is game data: the Matchmaker's forbidden two-character pairs
// (docs/research/character-pairings.md) — symmetric; the False Messiah
// cannot pair with anyone.
export interface VerdictRule {
  tag: string;
  verdict: 'red' | 'green';
  note?: string;
}

export interface Character {
  id: string;
  name: string;
  baseBallId: string | null;
  quirk: string;
  icon: string;
  sprite: string;
  verdicts: VerdictRule[];
  /** Matchmaker-forbidden partner ids (symmetric relation). */
  cannotPair: string[];
}

export const CHARACTERS: Character[] = ${JSON.stringify(data.characters, null, 2)};
`);

  const level3Ts = ts(`// Level-3 effect text from docs/research/level-3-effects.md (wiki per-level
// tables, v1.301 pre-DLC). The catalog keeps level-1 text for the browser;
// the fusion composer uses this overlay (decision #12). Generated — do not
// edit by hand.
export const LEVEL_3_EFFECTS: Record<string, string> = ${JSON.stringify(data.level3, null, 2)};
`);

  return [
    { name: 'tags.ts', content: tagsTs },
    { name: 'balls.ts', content: ballsTs },
    { name: 'passives.ts', content: passivesTs },
    { name: 'characters.ts', content: charactersTs },
    { name: 'level-3.ts', content: level3Ts },
  ];
}

/**
 * The one invariant list for generated data. Returns human-readable findings;
 * an empty array means the data is valid. Runs before any file is written.
 */
export function validateGenerated(data: GeneratedData, editorial: EditorialMaps): string[] {
  const findings: string[] = [];
  const ballIds = new Set(data.balls.map((b) => b.id));
  const passiveIds = new Set(data.passives.map((p) => p.id));
  const charIds = new Set(data.characters.map((c) => c.id));
  const vocab = new Set(Object.keys(data.tags));

  // recipes resolve within their own namespace (the graphs never cross)
  for (const b of data.balls)
    for (const r of b.recipes)
      for (const c of r)
        if (!ballIds.has(c)) findings.push(`ball ${b.name}: unresolved component ${c}`);
  for (const p of data.passives)
    for (const r of p.recipes)
      for (const c of r)
        if (!passiveIds.has(c)) findings.push(`passive ${p.name}: unresolved component ${c}`);

  // tags and verdicts use the vocabulary
  for (const b of data.balls)
    for (const t of b.tags) if (!vocab.has(t)) findings.push(`ball ${b.id}: unknown tag ${t}`);
  for (const p of data.passives)
    for (const t of p.tags) if (!vocab.has(t)) findings.push(`passive ${p.id}: unknown tag ${t}`);
  for (const ch of data.characters)
    for (const r of ch.verdicts) {
      if (!vocab.has(r.tag) && r.tag !== WILDCARD) findings.push(`character ${ch.id}: unknown tag ${r.tag}`);
      if (r.verdict !== 'red' && r.verdict !== 'green') findings.push(`character ${ch.id}: invalid verdict ${r.verdict}`);
    }

  // every character has a base ball that resolves
  for (const ch of data.characters) {
    if (ch.baseBallId !== null && !ballIds.has(ch.baseBallId)) {
      findings.push(`character ${ch.id}: unresolved base ball ${ch.baseBallId}`);
    }
  }

  // pairing restrictions: every partner resolves, the relation is symmetric,
  // and the False Messiah (the *all* row) is excluded from every other list's
  // complement — nobody may pair with them
  const pairs = new Map(data.characters.map((c) => [c.id, new Set(c.cannotPair)]));
  for (const [id, partners] of pairs)
    for (const p of partners) {
      if (!charIds.has(p)) {
        findings.push(`character ${id}: unresolved cannotPair partner ${p}`);
        continue;
      }
      if (p === id) findings.push(`character ${id}: cannotPair contains itself`);
      else if (!pairs.get(p)!.has(id)) findings.push(`pairing not symmetric: ${id} -> ${p}`);
    }
  const messiah = 'the-false-messiah';
  const messiahPartners = pairs.get(messiah);
  if (!messiahPartners || messiahPartners.size !== charIds.size - 1) {
    findings.push('the-false-messiah: the *all* row must exclude nobody — they can never be a second character');
  }

  // the editorial maps' own invariants: bidirectional entity coverage, tag
  // vocabulary, verdict-rule sanity, and wildcard uniqueness
  findings.push(...validateEditorial(editorial, { balls: ballIds, passives: passiveIds, characters: charIds }));

  // level-3 overlay: every key resolves to a ball, every fusable ball has text,
  // and Baby Ball (not fusable) is absent
  for (const id of Object.keys(data.level3)) {
    if (!ballIds.has(id)) findings.push(`level-3 text for unknown ball: ${id}`);
  }
  if ('baby-ball' in data.level3) findings.push('level-3 text must not include baby-ball (not fusable)');
  const fusableCount = data.balls.filter((b) => b.id !== 'baby-ball').length;
  if (Object.keys(data.level3).length !== fusableCount) {
    findings.push(`level-3 texts: ${Object.keys(data.level3).length}, expected ${fusableCount}`);
  }

  // the data-side checks and validateEditorial overlap on vocabulary; report
  // each finding once
  return [...new Set(findings)];
}

/**
 * CLI orchestration: emit → validate → write. Validation runs before any
 * write, so a failing invariant leaves the generated files untouched. The
 * writer is injected so the contract is testable without touching disk.
 */
export function runEmitData(
  parsed: ParsedFactBases,
  editorial: EditorialMaps,
  write: (name: string, content: string) => void,
  log: (message: string) => void = console.log,
  error: (message: string) => void = console.error,
): number {
  const data = emitData(parsed, editorial);
  const findings = validateGenerated(data, editorial);
  if (findings.length) {
    for (const finding of findings) error(finding);
    error(`${findings.length} error(s)`);
    return 1;
  }
  for (const { name, content } of renderGenerated(data)) write(name, content);
  log('emitted tags.ts, balls.ts, passives.ts, characters.ts, level-3.ts — all checks pass');
  return 0;
}
