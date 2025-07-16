```markdown
---
id: techman-workflow
version: 0.8.0
title: Techman Agentic Workflow
description: Cozy, emoji-driven shell agent that creates, validates, and evolves structured specs using AI, Git, and natural prompts
entry_points:
  - "bin/techman [semantic_input]"
  - "bin/techman [spec_file.md]"
  - "bin/techman spec.md --prompt [freeform prompt]"
status: active
---

## 🧠 Goal

Create a cozy, deterministic CLI agent that collaborates with you to generate, validate, and evolve structured specs using Techman tooling, natural prompts, and version-aware Git tracking.

## ⚙️ Functionality

* Accepts one of:

  * Semantic input (e.g., "Spec for login throttling")
  * An existing `.md` spec file (partial or complete)
  * Prompt input via `--prompt "describe your change"`

* Modes of operation:

  * **Semantic input** → Generates new spec from description
  * **Spec file + prompt** → Injects edit via AI
  * **Spec file without prompt** → Launches interactive session

* Features:

  * Uses `bin/spec-editor` with `--ai-assist` for all creation and updates
  * Validates using `bin/spec-validator --json`
  * Auto-fixes on `FAIL` or `WARN` via AI
  * Generates changelog entries
  * Tracks all changes in Git unless `TECHMAN_NO_COMMIT=1`
  * Version bumps:

    * Patch = AI fix
    * Minor = AI edit via prompt
    * Major = Interactive session
  * CLI output is split:

    * `stdout` → spec path or session ID
    * `stderr` → emoji-driven logs and status

## ✨ Terminal Look & Feel

Techman speaks in cozy emoji:

| Emoji | Meaning                       |
| ----- | ----------------------------- |
| ✨     | Starting something new        |
| 📄    | Reading or writing a file     |
| 🧠    | AI-assisted thinking          |
| ✅     | Validation passed             |
| ⚠️    | Validation warning            |
| 🐛    | Fixing something              |
| 🔁    | Auto-fix in progress          |
| 📦    | Committed to Git              |
| 🚫    | Skipped (e.g. no Git)         |
| 💡    | Prompt/interactive suggestion |

No generic \[OK] or \[ERROR] messages — just friendly, expressive logs that reduce friction.

## ✅ Success Criteria

### Core Workflow Functionality
* Spec includes: `id`, `version`, `title`, `status`, `description`, `entry_points`
* Ends with `PASS` after fix loop
* Version bumped based on intent
* All changes committed unless `TECHMAN_NO_COMMIT=1`
* Spec file is traceable via Git history
* Compatible with scripting (clean stdout)
* Interactive sessions tracked under `.techman/session.json`

### Path Resolution and Directory Independence
* Works from any directory when called via wrapper tools
* Handles both absolute and relative paths for spec files
* Creates and edits specs in correct directories regardless of current working directory
* Maintains proper file references in commit messages and logs
* Functions properly when installed in dotfiles system

### AI Integration and Content Quality
* Semantic input produces well-structured, complete specs
* AI-generated content passes validation on first attempt
* Prompt-based edits are contextually appropriate and preserve existing content
* AI fixes address actual validation issues effectively
* Generated changelog entries are meaningful and descriptive

### Version Control and Commit Management
* Commit messages follow specified format: "Spec Update: {filename} - {change description}"
* Commit bodies include brief summary of changes
* Uses appropriate tagline: "🐛 Generated with Techman"
* Atomic commits for each meaningful change
* Git history is clean and traceable

### User Experience and Interface
* Emoji-driven output is consistent and informative
* Interactive mode provides clear guidance and options
* Error messages are helpful and actionable
* Output separation: spec path to stdout, logs to stderr
* Handles edge cases gracefully without crashes

### Integration with Tool Ecosystem
* Seamlessly integrates with spec-validator for validation
* Uses spec-editor for all creation and update operations
* Validation feedback loop works reliably
* Auto-fix attempts are intelligent and effective
* Works within both direct and wrapper tool contexts

## 🛠️ Implementation Notes

### Atomic Workflow Commit Policy

* Every meaningful change is committed (initial + follow-up)
* Commit messages:

  * `Initial spec: foo.md`
  * `Auto-fix validation issues for foo.md`
  * `AI edit: added feature xyz`
  * `Interactive session update`
  * Title format `Spec Update: {filename} - {change description}`
  * Include a brief summary of changes in the body
  * Use tagline `🐛 Generated with Techman` instead of `🤖 Generated with [Claude Code]`

### Input Types and Behavior

* `--prompt` enables quick edit mode with descriptive instructions
* Interactive mode prompts user through changes step-by-step
* AI updates include changelog entries and trigger validation + commit

### Versioning Logic

* Git diff + frontmatter are analyzed to determine bump
* Stored metadata includes current version and edit type

## 🚫 Deprecated / Removed

* Manual patching logic
* Static fix iteration limit
* Non-AI-based fallback validation logic

## 🔁 Changelog

- **0.8.0** — 2025-07-16 — AI edit: Add commit message format requirements in Implementation Notes section: Title format 'Spec Update: {filename} - {change description}', include brief summary of changes in body, and use tagline '🐛 Generated with Techman' instead of '🤖 Generated with [Claude Code]'

- **0.7.1** — 2025-07-16 — Add commit message format requirements to Implementation Notes

- **0.7.0** — 2025-07-16 — AI edit: Fix entry_points formatting to be a proper YAML list
- **0.6.2** — 2025-07-16 — Corrected entry_points format to a proper YAML list
- **0.6.1** — 2025-07-16 — Test backup functionality
* **0.6.0** — 2025-07-16 — Fixed spec-editor integration: AI now properly generates all required fields in non-interactive mode
* **0.5.0** — 2025-07-16 — Introduced `--prompt`, emoji-rich logs, interactive mode, and smart version bumping based on Git + intent
* **0.3.2** — 2025-07-16 — Auto-fix validation issues: Fixed failures.
* **0.3.0** — 2025-07-16 — Enabled full AI-assisted fixing, enforced atomic Git commits
```
