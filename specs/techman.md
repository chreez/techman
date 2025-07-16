---
id: specman-workflow
version: 0.2.0
title: Specman Agentic Workflow
description: Lightweight shell-based agent that generates and validates structured specs using existing Techman tools with auto-fix iteration
entry_points:
  - "bin/specman [semantic_input]"
  - "bin/specman [spec_file.md]"
status: active
---

## 🧠 Goal

Create a lightweight shell-based agent that generates and validates structured specs using existing Techman tools, with a single auto-fix iteration for quality improvement.

## ⚙️ Functionality

- Accepts one of:
  - Semantic input (e.g., "Create a spec about login throttling")
  - An existing `.md` spec file (partial or complete)
- Uses `bin/spec-editor` with AI assistance to generate or update the spec
- Runs validation (`bin/spec-validator --json`) and captures structured feedback
- If `FAIL` or `WARN`:
  - Updates spec with changelog entry documenting the issues
  - Manually fixes known issues (e.g., empty entry_points)
  - Increments the patch version
  - Commits changes to git
- Stops after one fix iteration
- Redirects all status output to stderr to keep stdout clean for scripting

## ✅ Success Criteria

- Produces a syntactically valid spec with required frontmatter:
  - `id`, `version`, `title`, `status`, `description`, `entry_points`
- Completes validation with no `FAIL` status after fix pass
- Version is incremented if a fix is applied
- File is committed both before and after auto-fix
- Uses AI assistance only for initial creation (not for fixes due to current limitations)
- Workflow runs with a single command from CLI
- Generates meaningful spec IDs from semantic input (kebab-case, max 50 chars)

## 🛠️ Implementation Notes

### Key Design Decisions
- Uses `jq` for reliable JSON parsing of validation results
- Redirects spec-editor output to stderr to prevent pollution of captured file paths
- Implements manual fixes for common issues (e.g., empty entry_points) since AI-assisted updates are limited
- Uses sed for in-place file modifications when fixing known issues
- Validates existence of either ANTHROPIC_API_KEY or OPENAI_API_KEY at startup

### Known Limitations
- Auto-fix capability is limited by spec-editor's lack of AI support for update commands
- Currently only fixes empty entry_points warning; other issues require manual intervention
- Fix iteration is limited to updating changelog and basic field corrections

## 🔁 Changelog

### 0.2.0 - 2025-07-16
- Updated functionality to reflect actual implementation using spec-editor
- Changed status from draft to active
- Corrected success criteria section header
- Added implementation notes documenting design decisions and limitations
- Updated to accurately describe the auto-fix process without AI assistance

### 0.1.1 - 2025-07-16
- Added missing frontmatter fields (description, entry_points)
- Added changelog section
- Initial draft specification
