# Domain Docs

How the engineering skills consume this repo's domain documentation. This file is a pointer, not a primary source.

## Read these first

- **`GLOSSARY.md`** — the domain vocabulary: game vs site terminology, each term with its owning module and interface, and data provenance. This is the glossary the skills look for.
- **`AGENTS.md`** — the operating manual: exhaustive repo map, commands, data flow (hand-edited vs generated), architectural invariants, testing and workflow conventions, content caveats.
- **`README.md`** — the public overview: what the site does, feature set, development quickstart, credits.

Read `GLOSSARY.md` before naming a domain concept; read `AGENTS.md` before changing one.

Research fact bases and the fusion evidence corpus live under `docs/research/`; `AGENTS.md`'s repo map says which are canonical fact bases and which are dated snapshots.

There are no ADRs. Decisions live in `GLOSSARY.md` and module headers.
