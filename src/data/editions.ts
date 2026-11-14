// Edition vocabulary — the content filter's dimension. Ordered: the
// filter's checkbox order. An entity's Edition cell in the fact bases names
// one of these; an absent cell means base-game. Generated — do not edit by
// hand.
export const EDITIONS = ["base-game","dlc-risen-ballbylon"] as const;
export type Edition = (typeof EDITIONS)[number];

