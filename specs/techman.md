---
id: specman-workflow
version: 0.1.1
title: Specman Agentic Workflow
description: Lightweight shell-based agent that generates and validates structured specs using existing Techman tools with auto-fix iteration
entry_points:
  - "specman [semantic_input]"
  - "specman [spec_file.md]"
status: draft
---

## 🧠 Goal

Create a lightweight shell-based agent that generates and validates structured specs using existing Techman tools, with a single auto-fix iteration for quality improvement.

## ⚙️ Functionality

- Accepts one of:
  - Semantic input (e.g., "Create a spec about login throttling")
  - A partial or blank `.md` spec file
- Uses Claude (via `create-spec.sh`) to generate the initial spec
- Runs validation (`bin/spec-validator`) and captures structured feedback
- If `FAIL` or `WARN`:
  - Auto-calls Claude with feedback to improve the spec
  - Increments the patch version
  - Commits changes to git
- Stops after one fix iteration

## ✍️ Success Criteria

- Produces a syntactically valid spec with required frontmatter:
  - `id`, `version`, `title`, `status`
- Completes validation with no `FAIL` status after fix pass
- Version is incremented if a fix is applied
- File is committed both before and after auto-fix
- Prompts Claude only once per phase (create + fix)
- Workflow runs with a single command from CLI

## 🔁 Changelog

### 0.1.1 - 2025-07-16
- Added missing frontmatter fields (description, entry_points)
- Added changelog section
- Initial draft specification
