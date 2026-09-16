// Shared name→id slugification for the data pipeline (parse-wiki.ts,
// emit-data.ts). Single source of truth for the apostrophe rule, the
// abbreviation table, and kebab normalization — the two scripts once
// carried divergent copies (Archer's Effigy, Laser H/V regressions).
const ABBREV = {
  'laser-h': 'laser-horizontal', 'laser-v': 'laser-vertical',
  'diamond': 'diamond-hilted-dagger', 'sapphire': 'sapphire-hilted-dagger',
  'ruby': 'ruby-hilted-dagger', 'emerald': 'emerald-hilted-dagger',
};

export const slug = (name) => {
  const s = name.toLowerCase()
    .replace(/'/g, '') // "Archer's Effigy" → archers-effigy (matches icon filenames)
    .replace(/\(horizontal\)/, 'horizontal').replace(/\(vertical\)/, 'vertical')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return ABBREV[s] ?? s;
};
