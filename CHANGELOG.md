# Changelog

## 1.1.0 (2026-10-05)

36 commits since 1.0.0. The headline is the **Fusions screen** maturing from a
first pass into a corpus-validated composer, plus a round of UX and
architecture polish.

### Added

- **Fusions screen** — composed fused-ball display with tier grouping, boxed
  rows, an always-on scrollbar, and slot-2 highlight.
- **Fusion cross-wires + order side-effects**, derived from full corpus
  validation; `crossWire` returns `{ line, disputed }`.
- **Fused-stat overrides** (`FUSED_STATS`) sourced from the research corpus,
  with hard-coded damage values removed in favor of catalog effect text.
- **Fusion-observation corpus** (`docs/research/fusion-observations/`) and
  distilled fusion mechanics doc — the corpus is now an executable spec:
  corpus conformance + `FUSED_STATS` substring tests pin the composer to the
  evidence.
- **Per-screen search boxes** — one per section, replacing the global header
  search; Esc in a search input clears the query only.
- **Cross-screen remembering** — switching tabs no longer clears selections.
- **Max-2 sticky selection** unified across Characters and Fusions.
- **GitHub repo button** in the header, right of the theme toggle.

### Fixed

- Fusion panel never painted — `nth-of-type` selectors matched nothing.
- `hidden` attribute lost to author display rules; scrollbar separation.
- Firefox scrollbar hover-expansion overlapped row borders.
- Fusions screen fits the viewport without whole-page scroll; scrollbar
  clearance, notes, and slot-2 highlight follow-ups.
- Search boxes are no longer empty clickable space; header clicks are not
  empty space; top menu order and title alignment.
- Theme toggle and GitHub buttons unified to the same 26×26 box, no hover
  mismatch; GitHub logo matches the toggle size; fusion search aligns with
  ball rows.

### Changed (internal)

- Retired the document `CustomEvent` bus — `buildAll` takes an options seam
  (`emit` callback); the renderer stays paint-only.
- ViewModel carries resolved balls instead of ids; the renderer no longer
  re-derives from its row map.
- Named the fusion panel state machine — view-state owns it, renderer paints
  per state.
- Fusion-screen session bugs pinned in the regression index.

### Docs

- `AGENTS.md` / `README.md` catch up to the fusion screen and build seam.
- Fusion research consolidated into a single `fusion-mechanics.md`.
- `CONTEXT.md` + module headers describe the named fusion panel state.

## 1.0.0

Initial release: evolution-recipes browser, character-synergy checker,
character-quirk reference, and fusion composer. Static Astro 5 site deployed
to GitHub Pages.
