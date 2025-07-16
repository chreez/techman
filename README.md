# Techman

Toolkit for validating and maintaining structured specifications.

## Overview

This repository contains:

- **specs/** – reference specifications defining validator behavior
- **scripts/spec-validate.sh** – Bash CLI that sends specs to an LLM for checks
- **bin/spec-validator** – convenience wrapper for the CLI

## Usage

Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` and run:

```bash
./bin/spec-validator path/to/spec.md
```

Use `--json` for JSON output or `--diff <file|->` to pass a git diff.

## Example

```bash
git diff HEAD~1 -- specs/ | ./bin/spec-validator --diff - specs/spec-validator.md
```

