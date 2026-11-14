// Edition vocabulary — the content filter's one dimension. The ordered list
// is the source of truth for the generated src/data/editions.ts and for the
// fact-base parser's vocabulary check. An entity's Edition cell in
// docs/research/game-mechanics.md names one of these; an absent cell means
// base-game (the pre-expansion roster).
export const EDITIONS = ['base-game', 'dlc-risen-ballbylon'] as const;
export type Edition = (typeof EDITIONS)[number];
