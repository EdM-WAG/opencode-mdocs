---
id: "fix-v1-3-0-agent-discovery-regression"
title: "Fix v1.3.0 Agent Discovery Regression"
status: "active"
created: "2026-06-03"
updated: "2026-06-03"
owner: "bbaaxx"
tags: ["bug","release-regression","v1.3.0","opencode","agent","packaging"]
related_wiki: ["developer/opencode-custom-tool-result-contract","architecture/plugin-design-spec","release/v1-3-0-readiness"]
priority: "medium"
phase: "implementation"
next_action: "Prepare v1.3.1 patch release metadata and run full verification."
---

## Objective
Reproduce and fix the v1.3.0 upgrade regression where the Mdocs-Orchestrator agent is not listed/enabled in opencode, while reverting to v1.2.0 restores the agent. Ship a patch-ready fix with regression coverage.

## Plan
- [x] Reproduce agent visibility behavior with opencode-mdocs@1.3.0 in a clean consumer fixture
- [x] Confirm opencode-mdocs@1.2.0 lists Mdocs-Orchestrator in the same fixture/config pattern
- [x] Inspect package exports, plugin entrypoints, config hook, and opencode resolution behavior to identify root cause
- [x] Implement the smallest compatible fix while preserving public API imports and runtime custom tools
- [x] Add regression tests for package consumer config and agent registration
- [x] Verify npm-style package install, opencode debug agent listing, tests, build, pack, and mdocs validation
- [ ] Document findings and prepare patch release recommendation

## Progress Log
- [2026-06-03T19:41:14.083Z] Created initiative via mdocs command
- [2026-06-03T19:45:00Z] Reproduced regression: clean fixture with opencode-mdocs@1.3.0 and existing config plugin:["opencode-mdocs"] fails plugin load with `Cannot call a class constructor WikiManager without |new|`, so `mdocs-orchestrator` is not found. Clean fixture with v1.2.0 under current opencode showed the same root export-loader failure, suggesting the user's successful revert likely involved a different config/path or cached local agent; nevertheless the v1.3.0 regression is real for existing root config. Verified `opencode-mdocs/plugin` is not accepted by opencode's npm plugin installer. Implemented fix: package root now exposes only default plugin; public API moved to `opencode-mdocs/api`; README restored consumer config to `plugin:["opencode-mdocs"]`; regression tests added. Packed local build and verified patched `dist/index.js` lists `mdocs-orchestrator` and registers mdocs tools.

## Artifacts
