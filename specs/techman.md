---
id: techman-workflow
version: 0.3.2
title: Techman Agentic Workflow
description: Shell-based agent that creates, validates, and auto-fixes structured specs using Techman tools with atomic Git commits
entry_points:
  - "bin/techman [semantic_input]"
  - "bin/techman [spec_file.md]"
status: active
---

## 🧠 Goal

Create a deterministic CLI agent that generates and validates structured specs using Techman tooling, auto-fixes issues using AI, and commits each atomic edit to Git by default.

## ⚙️ Functionality

- Accepts one of:
  - Semantic input (e.g., "Spec for login throttling")
  - An existing `.md` spec file (partial or complete)
- Uses `bin/spec-editor` with `--ai-assist` for both creation and update
- Runs validation using `bin/spec-validator --json`
- If validation returns `FAIL` or `WARN`:
  - Fixes are applied using `--ai-assist`
  - Changelog entry is appended for traceability
  - Patch version is incremented automatically
  - **All changes are committed to Git** before and after fix (if inside a repo)
- CLI output is split:
  - `stdout`: returns spec file path for scripting
  - `stderr`: status, logs, and AI feedback
- Disabling commits is possible via env flag `TECHMAN_NO_COMMIT=1` for dry-run or testing

## ✅ Success Criteria

- Spec must contain complete frontmatter:
  - `id`, `version`, `title`, `status`, `description`, `entry_points`
- Ends in `PASS` status after a single fix loop
- Version is patched only if AI-assisted update occurs
- Commits exist for:
  - Initial creation/update
  - Post-fix result (if applicable)
- Semantic input generates kebab-case spec IDs (≤ 50 chars)
- Spec output is deterministic and traceable via Git

## 🛠️ Implementation Notes

### Atomic Workflow Commit Policy
- All `techman` changes are atomic by design
- Git is required for mutation workflows unless `TECHMAN_NO_COMMIT=1` is explicitly set
- Commit messages follow a predictable pattern:
  - `Initial spec: foo.md`
  - `Auto-fix validation issues for foo.md`

### Technical Choices
- Relies on `jq` for safe parsing of validator JSON
- Uses stderr for all human-readable messaging
- AI fixes use `spec-editor update --ai-assist` exclusively
- Manual fix logic (e.g. `sed` patching) is deprecated as of 0.3.0

## 🚫 Deprecated / Removed
- Manual fixes for known fields like `entry_points`
- Non-AI fallback logic for validation warnings
- Fix iteration limit: now allows full AI-assisted fix pass with one loop

## 🔁 Changelog

- **0.3.2** — 2025-07-16 — Auto-fix validation issues: Fixed failures. 

- **0.3.1** — 2025-07-16 — 

### 0.3.0 - 2025-07-16
- Enabled full AI-assisted fixing via `spec-editor update --ai-assist`
- All changes now default to Git commit for atomicity
- Added `TECHMAN_NO_COMMIT=1` to support test environments
- Removed manual patching logic
- Updated spec description, goal, and implementation notes
