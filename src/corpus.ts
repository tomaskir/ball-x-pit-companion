// Corpus module: the one seam onto the fusion-observation corpus
// (docs/research/fusion-observations/). Two layers live there:
//
//   - the curated layer, `fusion-pairs.json`: one entry per pair, with the
//     current best reading of its claims and a `superseded` audit array;
//   - the raw layer, top-level `<source>.jsonl` wave files: append-only
//     observations, one JSON object per line, governed by `schema.json`.
//     `pending/` is the DLC staging area and stays outside the gate.
//
// Callers cross this module instead of re-encoding the corpus shape:
// `loadCorpus(root)` gives the curated pairs plus the derived wire/no-wire/
// disputed partition; `loadRawObservations(root)` gives the parsed raw rows;
// `validateCorpus(root)` runs both layers' schema checks and returns findings
// (the CLI prints them, the vitest gate asserts none).
//
// Enforcement rules:
//   - enums, required-field sets, patterns, item counts and
//     `additionalProperties` come from schema.json, so editing the schema
//     changes the gate;
//   - ball ids come from src/catalog.ts (the namespace authority), never by
//     scraping the generated data file's formatting;
//   - node built-ins only, so the harvest CLI can load this module directly.
//
// The editorial pair lists (IMPLEMENTED / BEYOND_MODEL / NULL_RESOLVED) are
// the composer's boundary spec and stay in src/corpus.test.ts — they are not
// corpus shape.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ballMap } from './catalog.ts';

/** A schema or shape violation. Warnings do not fail the gate. */
export interface Finding {
  file: string;
  line?: number;
  message: string;
  /** Warnings do not fail the validation (see the rule-derived note below). */
  warning?: boolean;
}

export interface CorpusClaim {
  type: string;
  detail: string;
  sources?: string[];
  confidence?: string;
}

export interface SupersededClaim {
  claim: string;
  source: string;
  superseded_by: string;
}

/** One curated pair entry. Only the fields this site consumes are typed;
 *  the curated layer may carry additional research fields. */
export interface CorpusPair {
  components: [string, string];
  status: string;
  claims: CorpusClaim[];
  superseded: SupersededClaim[];
  names_seen?: string[];
  effect_texts?: unknown[];
  order?: Record<string, unknown>;
  obs_count?: number;
  source_types?: string[];
  rules?: unknown;
}

/** The polarity partition derived from curated claims: a pair with both
 *  polarities is disputed; otherwise its single polarity decides. Pairs with
 *  neither claim type appear in no list. */
export interface WirePartition {
  wire: string[];
  noWire: string[];
  disputed: string[];
}

export interface Corpus {
  root: string;
  generated: string;
  /** The declared `pair_count` (kept as a pin even if it disagrees with the
   *  actual entry count; `findings` reports the disagreement). */
  pairCount: number;
  pairs: Record<string, CorpusPair>;
  pair(key: string): CorpusPair | undefined;
  wirePairs(): WirePartition;
  /** Curated-layer shape findings. The raw layer is validated separately by
   *  `validateCorpus`/`loadRawObservations`. */
  findings: Finding[];
}

/** One parsed raw observation row, with its provenance. Semantically invalid
 *  rows are still returned; `findings` says what is wrong with them. */
export interface RawObservation {
  file: string;
  line: number;
  data: Record<string, any>;
}

export interface RawLayer {
  observations: RawObservation[];
  findings: Finding[];
}

const CORPUS_DIR = 'docs/research/fusion-observations';
const PAIRS_FILE = 'fusion-pairs.json';
const SCHEMA_FILE = 'schema.json';
const ALIASES_FILE = 'aliases.json';

/** Repo root by default: this module lives at <root>/src/corpus.ts. */
const defaultRoot = (): string => fileURLToPath(new URL('..', import.meta.url));

/** The parts of schema.json the gate enforces. Derived at read time so the
 *  schema file is the source of truth, not a decorative document. */
interface SchemaContract {
  kinds: string[];
  claimTypes: string[];
  sourceTypes: string[];
  confidences: string[];
  required: string[];
  sourceRequired: string[];
  claimRequired: string[];
  /** Kinds whose observations must carry a `pair` (the schema's allOf rule). */
  pairRequiredKinds: string[];
  datePattern: RegExp;
  accessDatePattern: RegExp;
  pairMin: number;
  pairMax: number;
  orderMin: number;
  orderMax: number;
  urlMinLength: number;
  allowedTop: Set<string>;
  allowedClaim: Set<string>;
  allowedSource: Set<string>;
  enforceTopAdditional: boolean;
  enforceClaimAdditional: boolean;
  enforceSourceAdditional: boolean;
}

function loadSchemaContract(root: string): SchemaContract {
  const schema = JSON.parse(readFileSync(join(root, CORPUS_DIR, SCHEMA_FILE), 'utf8'));
  const props = schema.properties ?? {};
  const pairRule = (schema.allOf ?? []).find(
    (clause: any) => clause?.if?.properties?.kind?.enum && clause?.then?.required?.includes('pair')
  );
  const sourceProps = props.source?.properties ?? {};
  const claimItem = props.claims?.items ?? {};
  return {
    kinds: props.kind?.enum ?? [],
    claimTypes: claimItem.properties?.type?.enum ?? [],
    sourceTypes: sourceProps.type?.enum ?? [],
    confidences: props.confidence?.enum ?? [],
    required: schema.required ?? [],
    sourceRequired: props.source?.required ?? [],
    claimRequired: claimItem.required ?? [],
    pairRequiredKinds: pairRule?.if?.properties?.kind?.enum ?? [],
    datePattern: new RegExp(sourceProps.date?.pattern ?? '^\\d{4}-\\d{2}-\\d{2}$'),
    accessDatePattern: new RegExp(sourceProps.access_date?.pattern ?? '^\\d{4}-\\d{2}-\\d{2}$'),
    pairMin: props.pair?.minItems ?? 2,
    pairMax: props.pair?.maxItems ?? 2,
    orderMin: props.order_as_named?.minItems ?? 2,
    orderMax: props.order_as_named?.maxItems ?? 2,
    urlMinLength: sourceProps.url?.minLength ?? 8,
    allowedTop: new Set(Object.keys(props)),
    allowedClaim: new Set(Object.keys(claimItem.properties ?? {})),
    allowedSource: new Set(Object.keys(sourceProps)),
    enforceTopAdditional: schema.additionalProperties === false,
    enforceClaimAdditional: claimItem.additionalProperties === false,
    enforceSourceAdditional: props.source?.additionalProperties === false,
  };
}

const hasClaim = (pair: CorpusPair, type: string): boolean =>
  Array.isArray(pair.claims) && pair.claims.some((claim) => claim && claim.type === type);

function partition(pairs: Record<string, CorpusPair>): WirePartition {
  const wire: string[] = [];
  const noWire: string[] = [];
  const disputed: string[] = [];
  for (const [key, pair] of Object.entries(pairs)) {
    const cross = hasClaim(pair, 'cross-wire');
    const noCross = hasClaim(pair, 'no-cross-wire');
    if (cross && noCross) disputed.push(key);
    else if (cross) wire.push(key);
    else if (noCross) noWire.push(key);
  }
  return { wire, noWire, disputed };
}

interface CuratedLayer {
  generated: string;
  pairCount: number;
  pairs: Record<string, CorpusPair>;
  findings: Finding[];
}

function readCurated(root: string, contract: SchemaContract): CuratedLayer {
  const raw = JSON.parse(readFileSync(join(root, CORPUS_DIR, PAIRS_FILE), 'utf8'));
  const findings: Finding[] = [];
  const err = (message: string) => findings.push({ file: PAIRS_FILE, message });
  const ballIds = ballMap;
  const rawPairs: Record<string, any> =
    raw?.pairs && typeof raw.pairs === 'object' && !Array.isArray(raw.pairs) ? raw.pairs : {};
  const pairs: Record<string, CorpusPair> = {};

  const count = Object.keys(rawPairs).length;
  if (typeof raw?.pair_count !== 'number') err('pair_count must be a number');
  else if (raw.pair_count !== count) err(`pair_count ${raw.pair_count} does not match ${count} pairs`);
  if (raw?.generated !== undefined && (typeof raw.generated !== 'string' || !contract.datePattern.test(raw.generated))) {
    err('generated must be YYYY-MM-DD');
  }

  for (const [key, pair] of Object.entries(rawPairs)) {
    pairs[key] = pair as CorpusPair;
    if (!pair || typeof pair !== 'object') {
      err(`pair "${key}" must be an object`);
      continue;
    }
    const components = pair.components;
    if (
      !Array.isArray(components) ||
      components.length !== 2 ||
      !components.every((id: unknown) => typeof id === 'string')
    ) {
      err(`pair "${key}" components must be exactly 2 ids`);
    } else {
      const sorted = [...components].sort();
      if (key !== sorted.join('+')) err(`pair key "${key}" is not its sorted components "${sorted.join('+')}"`);
      for (const id of components) {
        if (!ballIds.has(id)) err(`pair "${key}" component "${id}" not in catalog`);
      }
    }

    if (!Array.isArray(pair.claims)) {
      err(`pair "${key}" claims must be an array`);
    } else {
      for (const claim of pair.claims) {
        if (!claim || typeof claim !== 'object') {
          err(`pair "${key}" claim must be an object`);
          continue;
        }
        if (typeof claim.type !== 'string' || !contract.claimTypes.includes(claim.type)) {
          err(`pair "${key}" bad claim.type: ${claim.type}`);
        }
        if (typeof claim.detail !== 'string' || !claim.detail.length) {
          err(`pair "${key}" claim.detail must be non-empty`);
        }
        if (
          claim.confidence !== undefined &&
          (typeof claim.confidence !== 'string' || !contract.confidences.includes(claim.confidence))
        ) {
          err(`pair "${key}" bad claim.confidence: ${claim.confidence}`);
        }
      }
    }

    if (!Array.isArray(pair.superseded)) {
      err(`pair "${key}" superseded must be an array`);
    } else {
      for (const superseded of pair.superseded) {
        if (!superseded || typeof superseded !== 'object') {
          err(`pair "${key}" superseded entry must be an object`);
          continue;
        }
        if (typeof superseded.claim !== 'string') err(`pair "${key}" superseded.claim must be a string`);
        if (typeof superseded.source !== 'string') err(`pair "${key}" superseded.source must be a string`);
        if (
          typeof superseded.superseded_by !== 'string' ||
          !contract.datePattern.test(superseded.superseded_by)
        ) {
          err(`pair "${key}" superseded.superseded_by must be YYYY-MM-DD`);
        }
      }
    }

    if (pair.status !== undefined && typeof pair.status !== 'string') err(`pair "${key}" status must be a string`);
  }

  return {
    generated: typeof raw?.generated === 'string' ? raw.generated : '',
    pairCount: typeof raw?.pair_count === 'number' ? raw.pair_count : count,
    pairs,
    findings,
  };
}

/** Read and validate the curated layer. Throws only if the file is missing or
 *  not JSON; shape problems come back as findings. */
export function loadCorpus(root: string = defaultRoot()): Corpus {
  const contract = loadSchemaContract(root);
  const curated = readCurated(root, contract);
  return {
    root,
    generated: curated.generated,
    pairCount: curated.pairCount,
    pairs: curated.pairs,
    pair: (key) => curated.pairs[key],
    wirePairs: () => partition(curated.pairs),
    findings: curated.findings,
  };
}

type Err = (file: string, line: number | undefined, message: string, warning?: boolean) => void;

function validateObservation(
  obs: Record<string, any>,
  file: string,
  lineNo: number,
  contract: SchemaContract,
  err: Err
): void {
  // Required fields are checked with field-specific messages below; this
  // catches any future schema addition the code does not know about yet.
  const specificallyChecked = new Set(['kind', 'text', 'source', 'confidence']);
  for (const field of contract.required) {
    if (!specificallyChecked.has(field) && !(field in obs)) err(file, lineNo, `missing required field: ${field}`);
  }
  if (contract.enforceTopAdditional) {
    for (const field of Object.keys(obs)) {
      if (!contract.allowedTop.has(field)) err(file, lineNo, `unknown field: ${field}`);
    }
  }

  const pair = obs.pair;
  const kind = obs.kind;
  if (pair === undefined) {
    if (typeof kind === 'string' && contract.pairRequiredKinds.includes(kind)) {
      err(file, lineNo, 'pair must be exactly 2 ids');
    }
  } else if (
    !Array.isArray(pair) ||
    pair.length < contract.pairMin ||
    pair.length > contract.pairMax
  ) {
    err(file, lineNo, 'pair must be exactly 2 ids');
  } else {
    for (const id of pair) {
      if (typeof id !== 'string' || !ballMap.has(id)) err(file, lineNo, `pair id "${id}" not in catalog`);
    }
    if (pair.every((id: unknown): id is string => typeof id === 'string')) {
      const sorted = [...pair].sort();
      if (pair[0] !== sorted[0] || pair[1] !== sorted[1]) {
        err(file, lineNo, `pair not sorted alphabetically: ${pair.join(', ')}`);
      }
      if (pair[0] === pair[1]) err(file, lineNo, 'pair cannot fuse a ball with itself');
    }
  }

  if (typeof kind !== 'string' || !contract.kinds.includes(kind)) err(file, lineNo, `bad kind: ${kind}`);
  if (typeof obs.text !== 'string' || !obs.text.length) err(file, lineNo, 'text must be a non-empty string');
  if (typeof obs.confidence !== 'string' || !contract.confidences.includes(obs.confidence)) {
    err(file, lineNo, `bad confidence: ${obs.confidence}`);
  }
  if (obs.confidence === 'rule-derived') {
    err(file, lineNo, `warn — confidence "rule-derived" is for Phase 2, rare in harvest files`, true);
  }

  const src = obs.source;
  if (!src || typeof src !== 'object' || Array.isArray(src)) {
    err(file, lineNo, 'source missing');
  } else {
    const specificallyCheckedSource = new Set(['type', 'url', 'date']);
    for (const field of contract.sourceRequired) {
      if (!specificallyCheckedSource.has(field) && !(field in src)) {
        err(file, lineNo, `source.${field} missing`);
      }
    }
    if (contract.enforceSourceAdditional) {
      for (const field of Object.keys(src)) {
        if (!contract.allowedSource.has(field)) err(file, lineNo, `unknown source field: ${field}`);
      }
    }
    if (typeof src.type !== 'string' || !contract.sourceTypes.includes(src.type)) {
      err(file, lineNo, `bad source.type: ${src.type}`);
    }
    if (typeof src.url !== 'string' || src.url.length < contract.urlMinLength) {
      err(file, lineNo, 'source.url missing/short');
    }
    if (typeof src.date !== 'string' || !contract.datePattern.test(src.date)) {
      err(file, lineNo, 'source.date must be YYYY-MM-DD');
    }
    if (
      src.access_date !== undefined &&
      (typeof src.access_date !== 'string' || !contract.accessDatePattern.test(src.access_date))
    ) {
      err(file, lineNo, 'source.access_date must be YYYY-MM-DD');
    }
  }

  if (kind === 'behavior-claim') {
    const claims = obs.claims;
    if (!Array.isArray(claims) || !claims.length) {
      err(file, lineNo, 'behavior-claim must carry at least one claim');
    } else {
      for (const claim of claims) {
        if (!claim || typeof claim !== 'object') {
          err(file, lineNo, 'claim must be an object');
          continue;
        }
        const specificallyCheckedClaim = new Set(['type', 'detail']);
        for (const field of contract.claimRequired) {
          if (!specificallyCheckedClaim.has(field) && !(field in claim)) {
            err(file, lineNo, `claim.${field} missing`);
          }
        }
        if (contract.enforceClaimAdditional) {
          for (const field of Object.keys(claim)) {
            if (!contract.allowedClaim.has(field)) err(file, lineNo, `unknown claim field: ${field}`);
          }
        }
        if (typeof claim.type !== 'string' || !contract.claimTypes.includes(claim.type)) {
          err(file, lineNo, `bad claim.type: ${claim.type}`);
        }
        if (typeof claim.detail !== 'string' || !claim.detail.length) {
          err(file, lineNo, 'claim.detail must be non-empty');
        }
      }
    }
  }

  if (obs.order_as_named !== undefined) {
    const order = obs.order_as_named;
    if (
      !Array.isArray(order) ||
      order.length < contract.orderMin ||
      order.length > contract.orderMax ||
      !order.every((name: unknown) => typeof name === 'string')
    ) {
      err(file, lineNo, 'order_as_named must be 2 names');
    }
  }
  if (obs.game_version !== undefined && typeof obs.game_version !== 'string') {
    err(file, lineNo, 'game_version must be a string');
  }
  if (obs.in_game_name !== undefined && typeof obs.in_game_name !== 'string') {
    err(file, lineNo, 'in_game_name must be a string');
  }
}

function readRaw(root: string, contract: SchemaContract): RawLayer {
  const obsDir = join(root, CORPUS_DIR);
  const findings: Finding[] = [];
  const err: Err = (file, line, message, warning = false) => findings.push({ file, line, message, warning });

  const aliases = JSON.parse(readFileSync(join(obsDir, ALIASES_FILE), 'utf8')) as {
    aliases: Record<string, string>;
    canonical: Record<string, string>;
  };
  for (const [alias, id] of Object.entries(aliases.aliases ?? {})) {
    if (!ballMap.has(id)) err(ALIASES_FILE, undefined, `alias "${alias}" → unknown ball id "${id}"`);
  }
  for (const id of Object.keys(aliases.canonical ?? {})) {
    if (!ballMap.has(id)) err(ALIASES_FILE, undefined, `canonical key "${id}" is not a ball id`);
  }

  // Top-level dated wave files only. `pending/` is the DLC staging area:
  // rows there may name balls the catalog does not have yet, so they stay
  // outside the gate until promotion moves them into a dated wave file.
  const files = readdirSync(obsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.jsonl'))
    .map((entry) => entry.name);
  const observations: RawObservation[] = [];

  for (const file of files) {
    const lines = readFileSync(join(obsDir, file), 'utf8').split('\n');
    lines.forEach((line, i) => {
      const lineNo = i + 1;
      if (!line.trim()) return;
      let data: Record<string, any>;
      try {
        data = JSON.parse(line);
      } catch {
        err(file, lineNo, 'not valid JSON');
        return;
      }
      observations.push({ file, line: lineNo, data });
      validateObservation(data, file, lineNo, contract, err);
    });
  }

  return { observations, findings };
}

/** Read and validate the raw `.jsonl` layer (top-level waves only). Throws if
 *  schema.json or aliases.json is missing/not JSON. */
export function loadRawObservations(root: string = defaultRoot()): RawLayer {
  return readRaw(root, loadSchemaContract(root));
}

/** Run every corpus check: curated shape plus raw schema. An empty list
 *  (ignoring warnings) means the corpus conforms. */
export function validateCorpus(root: string = defaultRoot()): Finding[] {
  let contract: SchemaContract;
  try {
    contract = loadSchemaContract(root);
  } catch (e) {
    return [{ file: SCHEMA_FILE, message: `unreadable: ${(e as Error).message}` }];
  }

  const findings: Finding[] = [];
  try {
    findings.push(...readCurated(root, contract).findings);
  } catch (e) {
    findings.push({ file: PAIRS_FILE, message: `unreadable: ${(e as Error).message}` });
  }
  try {
    findings.push(...readRaw(root, contract).findings);
  } catch (e) {
    findings.push({ file: CORPUS_DIR, message: `unreadable: ${(e as Error).message}` });
  }
  return findings;
}
