---
id: "fix-wiki-index-consistency-check"
title: "Fix Wiki INDEX Consistency Check False Positives"
status: "done"
created: "2026-06-03"
updated: "2026-06-03"
owner: "bbaaxx"
tags: []
related_wiki: ["architecture/plugin-design-spec"]
priority: "medium"
---

## Objective
Resolve the false-positive drift reported by `mdocs_index_check` (and `WikiManager.checkConsistency()`) between wiki INDEX.md files and on-disk entries. The current checker extracts INDEX lines, normalizes them as title-slugs, and compares against filenames — it never reads each file's `id` or `title` frontmatter — so any entry whose title-derived slug does not equal its filename (e.g. `implementation-plan.md` whose title is "Original Implementation Plan") is wrongly reported as both missing and orphan. Acceptance: `mdocs_index_check` returns consistent=true for the current repo, the orphan-detection contract from existing tests is preserved, and `mdocs_validate` (the canonical validator) continues to be clean.

## Plan


## Progress Log
- [2026-06-03T18:47:23.143Z] Created initiative via mdocs command
- ### Outcome (2026-06-03)
- `npm test`: 11/11 suites, **177/177 tests pass** (was 173; +4 new tests covering linked format, id != filename, title-only match, and orphan regression guard).
- `npm run build`: clean.
- `node -e "...new WikiManager('./mdocs').checkConsistency()"`: **`{ consistent: true, missing: [], orphans: [], stale: false }`** on the current repo.
- `node -e "...new WikiManager('./mdocs').validate()"`: 0 warnings, 0 errors.
- [2026-06-03T19:00:20.268Z] Marked done via mdocs command

## Artifacts
