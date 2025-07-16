---
id: spec-validator
title: Spec Validator Specification
version: 0.4.0
status: active
entry_points:
  - bin/spec-validator
  - Used as reference by spec validation tools
  - Imported by CLI and API validation endpoints
description: >
  Defines the core behavior and expectations for a Spec Validator Agent. The validator operates generically, with no assumptions about specific repositories or directory structures. It inspects individual specification documents and determines whether they conform to the expected standards for structured, executable intent.

# deprecated_at: null
# replaced_by: null

---

# Spec Validator Specification

This document defines the core behavior and expectations for a **Spec Validator Agent**. The validator operates generically, with no assumptions about specific repositories or directory structures. It inspects individual specification documents and determines whether they conform to the expected standards for structured, executable intent.

---

## ✅ Core Validation Criteria

### 1. **Schema Compliance**

Each specification document must:

- Be valid UTF-8 text (YAML or Markdown with frontmatter allowed).
- Contain the following top-level fields:
  - `id`: unique identifier (slug-like, lowercase-hyphenated)
  - `title`: human-readable title
  - `version`: semantic version string (e.g. `1.2.3`)
  - `description`: short summary
  - `entry_points`: list of use cases or component triggers
  - `status`: one of `draft`, `active`, `deprecated`, `archived`

Validator MUST reject:

- Missing required fields
- Duplicate or malformed `id`
- Incorrect version formatting

---

### 2. **Versioning Rules**

- Follow Semantic Versioning: `MAJOR.MINOR.PATCH`
- Changes must increment version accordingly:
  - **Patch**: typo or clarification
  - **Minor**: added behavior, backwards-compatible
  - **Major**: breaking structure or logic changes

Validator MUST detect:

- No version bump after significant change
- Version reversal or reuse

---

### 3. **Deletion & Deprecation Handling**

Specs cannot be hard-deleted without lifecycle marking:

- `status` must first change to `deprecated`
- Optional: add `deprecated_at` and `replaced_by`
- Full removal must be documented with a `changelog` entry

Validator MUST enforce:

- No deleted specs without deprecation
- Archived specs must preserve final version

---

### 4. **Changelog Requirement**

Each spec must include a `changelog` section:

- Each entry includes `version`, `date`, `author`, and `summary`
- Entries must be chronological

Validator MUST verify:

- Changelog entries align with version history
- No undocumented changes between versions

---

### 5. **Testability & Intent Coverage**

Optional but strongly recommended:

- Include a `success_criteria` section defining input/output behaviors
- Include `example_prompts`, if used with AI systems
- Include `risk_notes` for ambiguous or unstable clauses
- Include a `test_strategy` section for ensuring testability and coverage

Validator SHOULD warn:

- If no success criteria are defined
- If intent is vague, circular, or undefined
- If examples contradict success criteria
- If no test strategy is outlined

Validator SHOULD emit **structured feedback**:

- Warnings as machine-readable `recommendations`
- Recommendations include target line, reason, and suggested fix

This allows downstream agents (human or LLM) to receive suggestions inline — similar to a linter.

---

## 🔁 Validator Lifecycle

- May be implemented as a CLI tool or background agent
- Accepts one or more spec files as input
- Outputs `PASS`, `WARN`, or `FAIL` status
- Reports issues with line numbers and reason codes
- Returns recommendations for ambiguous or incomplete intent

---

## ✨ Design Philosophy

- Specifications are **communication-first** artifacts
- Validation protects intent from drift, loss, or erosion
- Each spec should be independently understandable, testable, and evolvable
- Validation output should improve agent behavior without overwhelming context

---

## 🧱 Recommended Spec Format

Use **Markdown with frontmatter** as the preferred format for specs.

### Example Format:

```md
---
id: input-handler-spec
title: Input Handler Behavior Spec
version: 1.0.0
status: active
entry_points: [src/input/handler.ts]
description: >
  Defines expected behavior of the core input handler module.
---

## 🧠 Goal
Capture, debounce, and route input events across all modules.

## ✅ Success Criteria
- Input events are throttled to 60fps.
- Routed callbacks are executed in under 10ms.
- Unhandled inputs generate telemetry logs.

## 🧪 Test Strategy
Unit tests for debounce logic and e2e Playwright interaction flows.

## 🔁 Changelog
- 1.0.0 — Initial spec
```

This format strikes a balance between human readability and machine verifiability.

---

## ✅ Success Criteria

- Validator correctly identifies all required fields in spec documents
- Validator produces structured output suitable for both human and machine consumption
- Validation rules are consistently applied across all spec types
- False positives are minimized through contextual understanding
- Validator can process both individual files and batches efficiently

---

## 🧪 Test Strategy

### Unit Tests
- Schema validation for all required fields
- Version format checking
- Changelog parsing and validation
- Status lifecycle enforcement

### Integration Tests
- End-to-end validation of sample specs
- Error message formatting and clarity
- Batch processing performance
- Output format consistency

### Test Coverage Targets
- 100% coverage of validation rules
- Edge cases for malformed inputs
- Performance benchmarks for large spec collections

---

## 🔁 Changelog

- **0.4.0** — 2025-01-15 — Clarified validator role as spec linter for agents; added changelog section explicitly
- **0.3.0** — 2025-01-10 — Introduced structured feedback and intent ambiguity warnings
- **0.2.0** — 2025-01-05 — Added recommended spec format
- **0.1.0** — 2024-12-20 — Initial spec draft

> This meta-spec is itself versioned and must conform to the rules above.