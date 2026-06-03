---
id: "evaluate-pr-3-wiki-orphan-fix"
title: "Evaluate and Merge PR #3: Wiki Orphan Warning Fix"
status: "active"
created: "2026-06-03"
updated: "2026-06-03"
owner: "bbaaxx"
tags: []
related_wiki: []
priority: "medium"
---

## Objective
Evaluate community PR #3 (https://github.com/bbaaxx/opencode-mdocs/pull/3) from contributor EdM-WAG and decide whether to merge it. The PR makes three changes: (1) accepts `sources` as wiki provenance alongside `source_initiatives`, (2) treats six wiki categories as global (repo, system, overview, index, log, glossary) so they don't require initiative backlinks, and (3) keeps orphan warnings for non-global entries that lack provenance or initiative references. Acceptance: code review passes, tests pass locally, `mdocs_validate` reports no new warnings from real content, and the PR is either merged or closed with rationale.

## Plan


## Progress Log
- [2026-06-03T17:51:08.475Z] Created initiative via mdocs command
- ## Evaluation findings (2026-06-03)
- **Tests**: 11/11 suites pass, **170/170 tests pass** on the PR branch (was 167 before; the 3 new tests all pass)
- **Build**: `npm run build` succeeds cleanly
- **`mdocs_validate` on main baseline**: 0 errors, 0 warnings — repo is already clean
- `sources` field fallback: minor, backward-compat improvement. Useful if a future agent writes `sources` instead of `source_initiatives`, but `source_initiatives` already works correctly.
- "Global categories" exemption: targets a wiki taxonomy that doesn't exist in this repo. Looks like the contributor assumed a different category scheme (likely from a generic wiki template).
- ### Action taken (2026-06-03)
Posted a formal `CHANGES_REQUESTED` review on PR #3 (https://github.com/bbaaxx/opencode-mdocs/pull/3) with the drafted comment. Review body explains the category-list mismatch (zero overlap with this repo's actual wiki subdirectories), notes that `mdocs_validate` on main is already clean, and suggests a redesign that reuses the existing `lifecycle: stable` field as the opt-out mechanism (consistent with how the linter already treats stable entries in `src/linter.ts:127-134`). A code sketch is included, plus a note about documenting `sources` in the schema wiki entry (`mdocs/wiki/architecture/mdocs-tool-gates`) instead of README-only.

### Status
Waiting for the contributor to respond with either (a) a redesigned PR, (b) a concrete `mdocs_validate` warning from this repo that the original code would silence, or (c) a request to close the PR. Initiative stays `active` until one of those lands.

## Artifacts
