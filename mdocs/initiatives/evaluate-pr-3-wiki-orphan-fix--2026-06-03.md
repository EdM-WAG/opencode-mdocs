---
id: "evaluate-pr-3-wiki-orphan-fix"
title: "Evaluate and Merge PR #3: Wiki Orphan Warning Fix"
status: "done"
created: "2026-06-03"
updated: "2026-06-03"
owner: "bbaaxx"
tags: []
related_wiki: ["architecture/plugin-design-spec"]
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
- [2026-06-03T18:43:46.770Z] Marked done via mdocs command

## Artifacts
