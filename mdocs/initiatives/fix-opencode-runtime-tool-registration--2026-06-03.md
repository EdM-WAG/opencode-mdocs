---
id: "fix-opencode-runtime-tool-registration"
title: "Fix opencode Runtime Custom Tool Registration"
status: "done"
created: "2026-06-03"
updated: "2026-06-03"
owner: "bbaaxx"
tags: ["bug","opencode","plugin","custom-tools","runtime"]
related_wiki: ["developer/opencode-custom-tool-result-contract","architecture/plugin-design-spec"]
priority: "medium"
phase: "done"
next_action: "No follow-up required; live session exposes mdocs custom tools after restart."
---

## Objective
Fix local and package opencode plugin entrypoints so custom mdocs tools register reliably in opencode runtime.

## Plan
- [x] Reproduce plugin load failure with opencode debug
- [x] Identify why custom tools are not registered
- [x] Add a runtime-only plugin entrypoint and configure local dogfooding to use it
- [x] Document consumer configuration for the runtime entrypoint
- [x] Verify opencode debug registers mdocs tools before asking for restart
- [x] Restart opencode and verify the live session exposes mdocs custom tools

## Progress Log
- [2026-06-03T19:14:41.005Z] Created initiative via mdocs command
- [2026-06-03T19:15:36.578Z] Reproduced root cause: opencode debug config failed loading ./dist/index.js with Cannot call a class constructor WikiManager without |new|, so custom tools never registered. Implemented dedicated runtime entrypoint src/opencode.ts, switched local opencode.json to ./dist/opencode.js, documented npm consumer config as opencode-mdocs/plugin, added package exports and regression test. Verification: focused plugin tests pass, build passes, opencode debug agent registers mdocs, mdocs_status, mdocs_dispatch, mdocs_validate, and mdocs_index_check.
- [2026-06-03T19:18:00Z] User restarted opencode. Live verification succeeded: mdocs_status and mdocs_dispatch are available and executed successfully in this session; mdocs_validate is valid with only unrelated v1.3.0 backlink warnings; mdocs_index_check detected stale initiative index and repair succeeded.
- [2026-06-03T19:17:57.114Z] Marked done via mdocs command

## Artifacts
- `src/opencode.ts` — runtime-only plugin entrypoint for opencode.
- `opencode.json` — local dogfooding config now loads `./dist/opencode.js`.
- `package.json` — exports `./plugin` subpath for consumer opencode config.
- `README.md` — documents `./dist/opencode.js` locally and `opencode-mdocs/plugin` for consumers.
- `src/__tests__/plugin.test.ts` — regression coverage for the runtime entrypoint and wrapped tool results.