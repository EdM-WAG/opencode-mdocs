---
id: "prepare-v1-3-0-release"
title: "Prepare v1.3.0 Release: Validate, Verify, and Ship the PR #3 + Wiki INDEX Fix"
status: "active"
created: "2026-06-03"
updated: "2026-06-03"
owner: "bbaaxx"
tags: ["release", "v1.3.0", "validation", "handoff"]
related_wiki: ["release/v1-2-0-readiness", "testing/new-features-playbook", "architecture/plugin-design-spec"]
priority: "high"
phase: "verify"
next_action: "Agent picking this up: run the handoff prompt below end-to-end. Do not skip the validation gates."
---

## Objective

Validate and verify the changes that have accumulated on `main` since the `v1.2.0` tag, then cut and publish the `v1.3.0` release. The two contributing changes are:

1. **PR #3 from `EdM-WAG`** (community contribution, merged at `91fadb6`):
   - Adds `WikiManagerOptions.standaloneCategories` and `MdocsPluginOptions.standaloneCategories` for project-specific "global" wiki categories (replaces the rejected hard-coded list).
   - Adds `lifecycle: stable` as an opt-out for the orphan-wiki warning.
   - Adds `sources` as a wiki-provenance alias for `source_initiatives`.
   - Removes a latent bug where a wiki entry's own `related_initiatives` self-claim would silence the orphan warning even when no initiative's `related_wiki` pointed back.
   - Public API: `createPlugin(baseDir, options?)` and `new WikiManager(baseDir, options?)` are now options-aware; types `MdocsPluginOptions` and `WikiManagerOptions` are re-exported from `src/index.ts`.

2. **Wiki INDEX linked format + consistency check fix** (commit `5aaab77`):
   - `updateIndices()` now writes per-category entries as `- [Title](id.md)` (matches root wiki INDEX style) instead of plain `- Title`.
   - `checkConsistency()` now extracts the link target as the canonical id and matches each on-disk file against its `{filename, frontmatter id, normalized frontmatter title}` alias set. Legacy plain `- Title` entries are still accepted as a fallback.
   - Resolves 12 false-positive `missing`/`orphan` pairs that were previously reported for this repo.

Schema documentation is updated in `mdocs/wiki/architecture/plugin-design-spec.md` (Wiki Entry Format section + new Orphan Detection subsection); README was tightened to make the `sources` alias and the two opt-out mechanisms explicit.

**Acceptance for the release**: all validation gates pass, `v1.3.0` is tagged and published to npm, a GitHub release is created, and the active initiative is marked done.

---

## Handoff prompt for the next agent

> You are picking up initiative `prepare-v1-3-0-release` in `/Users/bbaaxx/AgentsPlayground/opencode-mdocs`. Your job is to **validate, verify, and ship v1.3.0**. Do not skip any gate. If a gate fails, stop, fix, and re-run from that gate.
>
> The two contributing changes are summarized in the Objective above. Reference the prior release as your pattern: `mdocs/initiatives/prepare-v1-2-0-release--2026-06-01.md` and `mdocs/wiki/release/v1-2-0-readiness.md`.

### Step 1 — Environment sanity

```sh
git status                       # must be clean
git log --oneline v1.2.0..main   # expect ~7 commits, head = 9afe87f
node -v && npm -v                # note versions
gh --version                     # confirm gh is authenticated
npm whoami                       # confirm npm auth (will be needed for publish)
```

If `git status` is not clean, stop and ask the user before continuing.

### Step 2 — Static validation gates

```sh
npm install                      # only if node_modules missing
npm test                         # expect 11/11 suites, 177/177 tests
npm run build                    # expect clean (rm -rf dist && tsc)
```

Both must exit 0. If `npm test` reports fewer than 177 tests or any failure, stop. If `npm run build` is dirty, stop.

### Step 3 — mdocs validation gates

The custom mdocs tools (`mdocs`, `mdocs_validate`, `mdocs_index_check`, `mdocs_status`) are loaded once per opencode session. If you are running in a fresh opencode session, they will use the freshly built `dist/`. Verify the in-memory `dist/` matches `src/` after build:

```sh
grep -c "linkedCategory\|standaloneCategories" dist/wiki.js   # expect >= 1
grep -c "linkedCategory\|standaloneCategories" dist/plugin.ts # expect >= 1 (or built into dist/wiki.js)
```

Then run:

```sh
# Via the mdocs_status / mdocs_validate / mdocs_index_check tools:
#   mdocs_status          -> confirm active initiative and validation summary
#   mdocs_validate        -> expect {valid: true, errors: [], warnings: []} on all three sections
#   mdocs_index_check     -> expect wiki.consistent: true, 0 missing, 0 orphans, 0 stale
#                           (initiatives section should be consistent too)
```

If the `mdocs_index_check` tool is showing stale data from a previous session, run `index.sync` once and re-check.

If any tool reports warnings or errors, fix the underlying issue before continuing. Do not silence warnings as a shortcut.

### Step 4 — Behavioral spot-checks (proves the new code is wired through end-to-end)

```sh
# The PR #3 feature: configurable standalone categories at the plugin level
node -e "
const { createPlugin } = require('./dist');
const p = createPlugin('/tmp/handoff-check', { standaloneCategories: ['repo'] });
const wm = (p && p.wiki) || p;  // adapt if createPlugin returns a different shape
console.log('plugin has wikiManager:', !!wm);
"

# The wiki INDEX fix: linked format + alias-based consistency
node -e "
const { WikiManager } = require('./dist');
const fs = require('fs'), path = require('path');
const dir = '/tmp/handoff-wiki';
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir + '/wiki/architecture', { recursive: true });
fs.writeFileSync(dir + '/wiki/architecture/imp.md',
  '---\nid: implementation-plan\ntitle: Implementation Plan\ncategory: architecture\ncreated: 2026-06-03\nupdated: 2026-06-03\nrelated_initiatives: []\ntags: []\n---\n\nBody\n', 'utf8');
const wm = new WikiManager(dir);
wm.syncIndices();
const idx = fs.readFileSync(dir + '/wiki/architecture/INDEX.md', 'utf8');
console.log('INDEX uses linked format:', idx.includes('- [Implementation Plan](implementation-plan.md)'));
const c = wm.checkConsistency();
console.log('consistent:', c.consistent, '| missing:', c.missing.length, '| orphans:', c.orphans.length, '| stale:', c.stale);
"
```

Both `INDEX uses linked format` and `consistent: true` must be `true`. The `checkConsistency` is also a regression guard for the bug fixed in `5aaab77` — the file's id is `implementation-plan` but the title slug is `implementation-plan` (intentionally the same here; the real bug surface was the case where they differ, which the unit test suite already covers).

### Step 5 — Smoke tests for npm packaging

```sh
npm pack                        # produces opencode-mdocs-1.3.0.tgz (after version bump in step 6)
tar -tzf opencode-mdocs-1.3.0.tgz | head -20  # confirm dist/, skills/, agents/, templates/, CHANGELOG.md, package.json
```

Spot-check that the tarball contains exactly what `package.json#files` declares. Delete the tarball after inspection: `rm opencode-mdocs-1.3.0.tgz`.

### Step 6 — Version bump and CHANGELOG

```sh
# Bump version in package.json (and package-lock.json — they stay in sync)
# Edit package.json: "version": "1.2.0" -> "1.3.0"
# Then: npm install --package-lock-only (regenerates package-lock.json without touching node_modules)
```

Prepend a `## [1.3.0] - YYYY-MM-DD` section to `CHANGELOG.md` modeled on the existing entries. Required content (use today's date):

```markdown
## [1.3.0] - <today>

### Added

- **Configurable standalone wiki categories** — `WikiManager` and `createPlugin` now accept a `standaloneCategories` option (e.g. `createPlugin(baseDir, { standaloneCategories: ['repo', 'system'] })`) to mark categories as project-wide and exempt them from the orphan-wiki warning without code changes. Replaces the rejected hard-coded category list from the original PR draft.
- **`lifecycle: stable` opt-out for orphan warnings** — wiki entries with `lifecycle: stable` are treated as settled knowledge that stands on its own and are not flagged as orphans.
- **`sources` provenance alias** — wiki entries can use `sources: [initiative-id]` interchangeably with `source_initiatives: [initiative-id]`.
- **Public type exports** — `MdocsPluginOptions` and `WikiManagerOptions` are re-exported from the package entry point for downstream consumers.
- **Linked wiki INDEX format** — per-category `INDEX.md` entries now render as `- [Title](id.md)`, matching the root wiki INDEX style and making the index clickable / unambiguous.

### Changed

- **Orphan-detection rule** — the consistency checker now matches INDEX entries to on-disk files by `{filename, frontmatter id, normalized frontmatter title}` instead of comparing title-slugs to filenames. Eliminates false-positive missing/orphan reports for entries whose title-derived slug differs from the filename (e.g. `id=implementation-plan` with `title=Original Implementation Plan`).
- **Orphan-detection rule, secondary** — a wiki entry's self-claimed `related_initiatives` no longer silences the orphan warning unless some initiative's `related_wiki` actually points back. The PR #3 contribution also fixed this latent inconsistency.
- **Schema docs** — `mdocs/wiki/architecture/plugin-design-spec.md` now has a complete Wiki Entry Format reference table and an Orphan Detection subsection documenting all four reference conditions.

### Fixed

- `WikiManager.checkConsistency()` no longer reports 12 false-positive `missing`/`orphan` pairs for this repo's wiki entries.

### Tests

- 4 new tests in `src/__tests__/wiki.test.ts` cover the linked INDEX format, id-≠-filename, title-only matches, and orphan regression. 11/11 suites, 177/177 tests pass.
```

After the edit:

```sh
git diff package.json package-lock.json CHANGELOG.md
```

Review the diff carefully. The CHANGELOG must include both PR #3's features and the INDEX fix; the version must be `1.3.0` in both `package.json` and `package-lock.json`.

### Step 7 — Commit, tag, push

```sh
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): prepare v1.3.0"
git log --oneline -1   # confirm commit
git push origin main
git tag v1.3.0
git push origin v1.3.0
```

If the tag push is rejected (e.g. tag already exists from a prior run), investigate before force-pushing.

### Step 8 — Publish to npm

The previous release initiative (`prepare-v1-2-0-release`) noted that the user provided a one-time-password (OTP) for `npm publish`. Ask the user for a fresh OTP for v1.3.0 if you don't already have one. Then:

```sh
npm publish --otp=<OTP>
```

Watch for the output line `+ opencode-mdocs@1.3.0`. After publish:

```sh
npm view opencode-mdocs version   # expect 1.3.0
```

### Step 9 — GitHub release

Use `gh release create` (not the API directly — `gh` handles asset upload and the release body well):

```sh
gh release create v1.3.0 \
  --title "v1.3.0" \
  --notes-file <(sed -n '/^## \[1.3.0\]/,/^## \[/p' CHANGELOG.md | sed '$d')
```

(If the `<(...)` process substitution doesn't work in your shell, write the notes to a temp file first.) The release notes should be the `## [1.3.0]` block from the CHANGELOG, ending before the next version header.

After the release is created, visit the URL `gh release view v1.3.0 --json url -q .url` to confirm it exists, and spot-check that the notes render correctly.

### Step 10 — Cleanup and closure

1. Update the previous `prepare-v1-2-0-readiness.md` wiki entry to mark it historical (or leave it as-is — it's stable and references v1.2.0, which is now the prior release).
2. Create or update `mdocs/wiki/release/v1-3-0-readiness.md` with a brief readiness note (can be 1-2 paragraphs summarizing what shipped; the CHANGELOG is the source of truth, so don't duplicate it).
3. Run `index.sync` (via the mdocs tool) to add the new release-readiness wiki entry to `mdocs/wiki/release/INDEX.md`.
4. Add a progress log entry to **this** initiative: timestamp, action taken, links to the tag / GitHub release / npm version.
5. Mark this initiative `done` via the mdocs `initiative.done` command.
6. Run `mdocs_validate` one final time to confirm the closure didn't introduce any new warnings.
7. Push the final commits and re-confirm clean working tree.

### Failure handling

- **Tests fail**: investigate, fix the regression, re-run from Step 2.
- **`mdocs_index_check` shows drift**: run `index.sync` once, re-check. If drift persists, the new code wasn't built into `dist/` — re-run `npm run build` and retry.
- **npm publish fails (403 / OTP)**: ask the user for a fresh OTP, do not bypass.
- **Tag push rejected**: investigate the existing tag; do not `--force` without user confirmation.
- **Anything else unexpected**: stop, summarize what passed and what didn't, ask the user.

### Reference: prior release pattern

- Initiative: `mdocs/initiatives/prepare-v1-2-0-release--2026-06-01.md`
- Wiki entry: `mdocs/wiki/release/v1-2-0-readiness.md`
- GitHub release: https://github.com/bbaaxx/opencode-mdocs/releases/tag/v1.2.0
- npm: `opencode-mdocs@1.2.0`

---

## Progress Log

- [2026-06-03T19:08:00Z] Created this initiative to hand off validation, verification, and v1.3.0 release. References the PR #3 work (merged at 91fadb6) and the wiki INDEX consistency fix (committed at 5aaab77).
- [2026-06-03T19:24:00Z] Runtime custom tool registration fix was committed separately as `7e32d33` and is included in the v1.3.0 release scope. Root cause: opencode loaded `dist/index.js` and treated public API exports as plugin candidates; fix adds `dist/opencode.js` runtime entrypoint and package export `opencode-mdocs/plugin`.
