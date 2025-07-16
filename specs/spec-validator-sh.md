---
id: spec-validator-cli-bash
version: 0.5.1
title: Spec Validator CLI (Bash)
status: active
entry_points:
  - bin/spec-validator
  - scripts/spec-validate.sh  
  - run via: ./bin/spec-validator path/to/spec.md

description: >
  Defines a Bash-based CLI tool that validates a spec file against the core spec-validator logic. Designed for lightweight execution using Claude or OpenAI APIs and basic shell utilities.

# deprecated_at: null  # Not deprecated
# replaced_by: null    # No replacement

---

## 🧠 Goal

Enable fast, local spec validation through a CLI wrapper that leverages remote LLMs and shell parsing. Supports Markdown spec files and produces structured validation output for downstream agents.

## ⚙️ Functionality
  - Accepts .md (with frontmatter) and .yaml spec files
  - Detects and uses one of:
    - OPENAI_API_KEY
    - ANTHROPIC_API_KEY
  - Sends content + spec-validator.md to LLM
  - Receives structured PASS | WARN | FAIL + recommendations (JSON)
  - Handles LLM responses that may include markdown code blocks
  - Optionally saves to disk or pipes to next tool
  - Accepts git diff (via stdin or file) to focus validation scope
  - ⚠️ Only applies validation to diff content within recognized spec files
  - 🔗 When using diff mode, requires the original root spec file to be provided for context
  - Uses local context:
    - The spec file itself
    - Git diff (optional)
    - promptTemplate-GPT.sh as system instruction
    - Hardcoded reference spec: ../specs/spec-validator.md (relative to script location)
  - Returns metadata including model_used in output
  - Gracefully handles API-model mismatches (e.g., Claude models with OpenAI API)

## ✅ Success Criteria
  • CLI runs without error given valid API key and input file
  • Returns results in JSON or human-readable format
  • Fails gracefully with error output if file is invalid or model API fails
  • Ignores non-spec diffs when parsing git diff
  • When using diff mode with a root file, validates changes in context of the full spec
  • Agent can use tool by piping staged spec changes:

```bash
git diff --cached specs/ | ./bin/spec-validator --diff - specs/target-spec.md > result.json
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

### Test Coverage
- Valid spec file validation
- Invalid spec file detection
- API key authentication
- JSON output format
- Human-readable output format
- Diff mode validation
- Error handling for missing files
- Model fallback behavior

## 🛠️ Implementation Notes

### JSON Escaping in Shell
- Use temporary files with heredocs for complex JSON payloads
- Escape prompt content using `jq -Rs .` to handle newlines and special characters
- Avoid inline JSON strings with shell variable interpolation

### API Response Handling  
- Strip markdown code blocks (```json) from LLM responses before parsing
- Use sed or similar to clean: `sed -e 's/^```json//' -e 's/^```//' -e 's/```$//'`
- Provide fallback JSON structure for parse failures

### Model Selection
- Check API type before attempting model calls
- Skip Claude models when using OpenAI API key and vice versa
- Continue to next model in preference list on failure

### Path Resolution
- Use `$(dirname "$0")/../specs/` for relative path resolution
- Ensures spec validator finds reference files regardless of working directory

### Diff Mode with Root File
- When `--diff` is used with a root spec file, combine diff content with original file for complete context
- This enables validation of changes against the full specification structure
- Root file provides necessary context for understanding the scope and impact of changes

## 📝 Example Prompts

### Basic Validation
```bash
# Validate a single spec file
./bin/spec-validator specs/my-feature.md

# Get JSON output for automation
./bin/spec-validator --json specs/my-feature.md > validation-results.json
```

### Diff-Based Validation
```bash
# Validate changes in current git diff
git diff | ./bin/spec-validator --diff - specs/my-feature.md

# Validate staged changes
git diff --cached | ./bin/spec-validator --diff - specs/my-feature.md
```

### Pipeline Integration
```bash
# Use in CI/CD pipeline
if ./bin/spec-validator --json specs/*.md | jq -e '.status == "PASS"'; then
  echo "All specs valid"
else
  echo "Spec validation failed"
  exit 1
fi
```

## 🔁 Changelog
  - 0.5.1 — Added requirement for root file when using diff mode to provide complete validation context
  - 0.5.0 — Added implementation guidance for JSON escaping, markdown stripping, API-model compatibility, and relative path resolution
  - 0.4.4 — Added model_used metadata to outputs; defined preferred LLMs based on real-time evaluation research; standardized bin directory usage
  - 0.4.3 — Canonicalized bin/ as primary executable directory; updated usage examples
  - 0.4.2 — Introduced clarifying questions output; added error boundary classification for agentic vs human-resolvable issues
  - 0.4.1 — Clarified that diff input must only include spec file changes; stricter filtering of input scope
  - 0.4.0 — Added support for hardcoded reference context and promptTemplate; CLI acts as GPT-facing shim
  - 0.3.0 — Defined output format with error levels, clarified FAIL vs WARN intent
  - 0.2.0 — Added support for git diff input and agent usability requirement
  - 0.1.0 — Initial draft