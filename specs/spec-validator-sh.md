---

id: spec-validator-bash
version: 0.4.4
title: Spec Validator CLI (Bash)
status: draft
entry_points:
  • bin/spec-validator
  • scripts/spec-validate.sh
  • run via: ./bin/spec-validator path/to/spec.md

description: >
Defines a Bash-based CLI tool that validates a spec file against the core spec-validator logic. Designed for lightweight execution using Claude or OpenAI APIs and basic shell utilities.

---

## 🧠 Goal

Enable fast, local spec validation through a CLI wrapper that leverages remote LLMs and shell parsing. Supports Markdown spec files and produces structured validation output for downstream agents.

## ⚙️ Functionality
  • Accepts .md (with frontmatter) and .yaml spec files
  • Detects and uses one of:
  • OPENAI_API_KEY
  • ANTHROPIC_API_KEY
  • Sends content + spec-validator.md to LLM
  • Receives structured PASS | WARN | FAIL + recommendations (JSON)
  • Optionally saves to disk or pipes to next tool
  • Accepts git diff (via stdin or file) to focus validation scope
  • ⚠️ Only applies validation to diff content within recognized spec files
  • Uses local context:
  • The spec file itself
  • Git diff (optional)
  • promptTemplate-GPT.sh as system instruction
  • Hardcoded reference spec: ./techman/specs/spec-validator.md
  • Returns metadata including model_used in output

## ✅ Success Criteria
  • CLI runs without error given valid API key and input file
  • Returns results in JSON or human-readable format
  • Fails gracefully with error output if file is invalid or model API fails
  • Ignores non-spec diffs when parsing git diff
  • Agent can use tool by piping staged spec changes:

```bash
git diff --cached specs/ | ./bin/spec-validator --diff - > result.json
```

## 📤 Output Format

### Human-Readable Default (stdout)

```text
[VALIDATION] path/to/spec.md
Status: FAIL
Model Used: claude-4-sonnet

Failures (requires human review):
- Line 5: Missing `version` field in frontmatter — critical metadata incomplete.

Warnings (agent-fixable):
- Line 17: Vague use of "aligned values" — refine for clarity.

Suggestions:
- [FAIL] Add a version field to the frontmatter.
- [WARN] Clarify "aligned values" with an explicit definition.

Clarifying Questions:
- What does "aligned values" refer to in your domain? Provide examples.

Summary:
PASS: 7 | WARN: 1 | FAIL: 1
```

### JSON Output (--json)

```json
{
  "status": "FAIL",
  "model_used": "claude-4-sonnet",
  "summary": {
    "pass": 7,
    "warn": 1,
    "fail": 1
  },
  "failures": [
    {
      "line": 5,
      "message": "Missing `version` field in frontmatter — critical metadata incomplete."
    }
  ],
  "warnings": [
    {
      "line": 17,
      "message": "Vague use of 'aligned values' — refine for clarity."
    }
  ],
  "suggestions": [
    {
      "level": "FAIL",
      "text": "Add a version field to the frontmatter."
    },
    {
      "level": "WARN",
      "text": "Clarify 'aligned values' with an explicit definition."
    }
  ],
  "clarifying_questions": [
    "What does 'aligned values' refer to in your domain? Provide examples."
  ]
}
```

## 🔐 Security
  • Never logs API keys
  • Accepts input from safe file paths only

## 🧪 Test Strategy

Manual tests via example specs:

```bash
./bin/spec-validator specs/example.md > result.json
cat result.json | jq
```

or with diff input:

```bash
git diff HEAD^ HEAD -- specs/ | ./bin/spec-validator --diff -
```

## 🔁 Changelog
  • 0.4.4 — Added model_used metadata to outputs; defined preferred LLMs based on real-time evaluation research; standardized bin directory usage
  • 0.4.3 — Canonicalized bin/ as primary executable directory; updated usage examples
  • 0.4.2 — Introduced clarifying questions output; added error boundary classification for agentic vs human-resolvable issues
  • 0.4.1 — Clarified that diff input must only include spec file changes; stricter filtering of input scope
  • 0.4.0 — Added support for hardcoded reference context and promptTemplate; CLI acts as GPT-facing shim
  • 0.3.0 — Defined output format with error levels, clarified FAIL vs WARN intent
  • 0.2.0 — Added support for git diff input and agent usability requirement
  • 0.1.0 — Initial draft
