# Techman

Toolkit for validating and maintaining structured specifications.

## Overview

This repository contains:

- **specs/** – reference specifications defining validator behavior
- **bin/spec-validator** – Bash CLI that validates specs against core spec-validator logic using LLMs
- **scripts/** – supporting scripts including prompt templates

## Spec Validator Usage

The spec validator requires either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` environment variable to be set.

### Basic Usage (Single File)

Validate a single spec file:

```bash
./bin/spec-validator specs/example.md
```

For JSON output:

```bash
./bin/spec-validator --json specs/example.md > result.json
```

### Diff Mode Usage

The spec validator can validate changes in a git diff, useful for CI/CD pipelines or pre-commit hooks.

Validate staged changes:

```bash
git diff --cached specs/ | ./bin/spec-validator --diff -
```

Validate changes between commits:

```bash
git diff HEAD~1 HEAD -- specs/ | ./bin/spec-validator --diff -
```

Validate a diff file:

```bash
./bin/spec-validator --diff changes.diff
```

### Output Formats

#### Human-Readable (Default)

```text
[VALIDATION] specs/example.md
Status: WARN
Model Used: gpt-4o-2024-08-06

Warnings (agent-fixable):
- Line 17: Vague use of "aligned values" — refine for clarity.

Summary:
PASS: 7 | WARN: 1 | FAIL: 0
```

#### JSON Format

```json
{
  "status": "WARN",
  "model_used": "gpt-4o-2024-08-06",
  "summary": {
    "pass": 7,
    "warn": 1,
    "fail": 0
  },
  "failures": [],
  "warnings": [
    {
      "line": 17,
      "message": "Vague use of 'aligned values' — refine for clarity."
    }
  ],
  "suggestions": [],
  "clarifying_questions": []
}
```

### Exit Codes

- `0` - Validation passed (PASS or WARN status)
- `1` - Validation failed (FAIL status)
- `2` - Unknown error

### Integration Examples

Pre-commit hook:

```bash
#!/bin/bash
git diff --cached specs/ | ./bin/spec-validator --diff - || exit 1
```

CI/CD pipeline:

```bash
# Validate all specs in PR
git diff origin/main...HEAD -- specs/ | ./bin/spec-validator --diff - --json > validation.json
```

