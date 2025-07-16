# Techman

Cozy, emoji-driven toolkit for creating, validating, and evolving structured specifications using AI.

## Overview

This repository provides a complete workflow for specification management:

- **bin/techman** – 🚀 Main CLI that orchestrates spec creation, editing, and validation with AI assistance
- **bin/spec-validator** – ✅ Validates specs against core spec-validator logic using LLMs
- **bin/spec-editor** – ✏️ Creates and updates specs with AI-powered content generation
- **specs/** – 📄 Reference specifications defining validator behavior and tool specs
- **scripts/** – 🛠️ Supporting scripts including prompt templates

## Quick Start

### Prerequisites

Set one of these environment variables:
```bash
export ANTHROPIC_API_KEY="your-key-here"
# OR
export OPENAI_API_KEY="your-key-here"
```

### Techman Usage

The main workflow tool for specification management:

```bash
# Create a new spec from natural language
./bin/techman "Spec for user authentication system"

# Edit an existing spec with AI assistance
./bin/techman specs/my-spec.md --prompt "add support for OAuth2"

# Interactive editing session
./bin/techman specs/my-spec.md
```

Features:
- ✨ Creates specs from semantic descriptions
- 🧠 AI-powered field generation and content enhancement
- 🔁 Automatic validation and fix loop
- 📦 Git integration with atomic commits
- 🎯 Smart version bumping based on change type

## Spec Editor Usage

Direct access to spec creation and editing:

```bash
# Create a new spec interactively
./bin/spec-editor create my-feature.md

# Create with AI assistance
./bin/spec-editor create my-feature.md --ai-assist --title="Payment Gateway"

# Update with AI-powered changes
./bin/spec-editor update specs/my-spec.md --minor --ai-prompt="add webhook support"

# Fork an existing spec
./bin/spec-editor fork base-spec.md new-variant.md --id=new-feature
```

## Spec Validator Usage

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

## Workflow Examples

### Complete Spec Lifecycle

```bash
# 1. Create a new spec from an idea
./bin/techman "API rate limiting with Redis backend"
# Output: specs/api-rate-limiting-with-redis-backend.md

# 2. Add a feature
./bin/techman specs/api-rate-limiting-with-redis-backend.md \
  --prompt "add support for distributed rate limiting"

# 3. Validate the spec
./bin/spec-validator specs/api-rate-limiting-with-redis-backend.md

# 4. View the Git history
git log --oneline specs/api-rate-limiting-with-redis-backend.md
```

### Batch Operations

```bash
# Update multiple specs with consistent changes
for spec in specs/*.md; do
  ./bin/spec-editor update "$spec" --patch \
    --changelog="Updated security considerations" \
    --ai-prompt="add OWASP top 10 considerations"
done

# Validate all specs
for spec in specs/*.md; do
  echo "Validating $spec..."
  ./bin/spec-validator "$spec"
done
```

## Dotfiles Integration

For system-wide access, wrapper tools are available via the dotfiles system:

```bash
# Works from any directory
~/.dotfiles/bin/techman "Spec for user authentication"
~/.dotfiles/bin/spec_validator specs/my-spec.md
~/.dotfiles/bin/spec_editor create auth-spec.md --ai-assist
```

The wrapper tools automatically:
- Detect techman installation in common workspace locations
- Convert relative paths to absolute paths
- Work from any directory in the system
- Maintain full compatibility with all original features

## Environment Variables

- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` - Required for AI features
- `TECHMAN_NO_COMMIT=1` - Skip Git commits in techman
- `DEBUG=1` - Enable debug output for troubleshooting

## Model Preferences

Tools use the following model preference order:
1. `claude-3-5-sonnet-20241022` (Anthropic)
2. `gpt-4o-2024-08-06` (OpenAI)
3. `gpt-4-turbo-2024-04-09` (OpenAI)

The first available model based on your API key will be used.

## Contributing

1. Create specs using techman
2. Ensure all specs pass validation
3. Follow the atomic commit philosophy
4. Update relevant documentation

## License

See LICENSE file for details.