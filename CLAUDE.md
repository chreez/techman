# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Techman is a toolkit for validating and maintaining structured specifications. It consists of two main CLI tools that work together to create, edit, and validate specification documents with LLM integration.

## Core Architecture

### Primary CLI Tools

**`bin/spec-validator`** - Validates spec files against core spec-validator logic using LLMs
- Supports both single file and git diff validation modes
- Requires either `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` environment variable
- Model preference order: `claude-3-5-sonnet-20241022` → `gpt-4o-2024-08-06` → `gpt-4-turbo-2024-04-09`
- Outputs human-readable or JSON format validation results

**`bin/spec-editor`** - Creates, updates, and forks specification files
- Three main commands: `create`, `update`, `fork`
- AI integration support for content generation and enhancement
- Automatic validation using spec-validator
- Backup creation before modifications
- Semantic versioning management (patch/minor/major)

### Key Directories

- **`specs/`** - Reference specifications defining validator behavior and tool specs
- **`scripts/`** - Supporting scripts including LLM prompt templates
- **`bin/`** - Executable CLI tools

### Specification Format

All specs follow a standardized format with:
- YAML frontmatter containing: `id`, `title`, `version`, `description`, `entry_points`, `status`
- Changelog section (typically `## 🔁 Changelog` or `## Changelog`)
- Success criteria sections where applicable
- Semantic versioning (e.g., `0.4.0`)

## Common Development Commands

### Validation
```bash
# Validate a single spec file
./bin/spec-validator specs/example.md

# Validate with JSON output
./bin/spec-validator --json specs/example.md

# Validate git diff (useful for CI/CD)
git diff --cached specs/ | ./bin/spec-validator --diff -

# Test LLM integration
./bin/spec-validator --test-llm
```

### Spec Creation and Editing
```bash
# Create new spec interactively
./bin/spec-editor create

# Create spec non-interactively
./bin/spec-editor create --non-interactive --id "my-spec" --title "My Specification"

# Update existing spec with patch version bump
./bin/spec-editor update specs/my-spec.md --version patch --changelog "Fixed validation issues"

# Fork existing spec
./bin/spec-editor fork specs/existing.md --id "new-spec" --title "New Specification"
```

### API Key Configuration

The tools require one of these environment variables:
```bash
export ANTHROPIC_API_KEY="your-key-here"
# OR
export OPENAI_API_KEY="your-key-here"
```

## LLM Integration Patterns

Both tools share common LLM integration patterns:
- Auto-detect available API keys (Anthropic preferred, OpenAI fallback)
- Use model preference order with fallback chain
- Temporary directory management for LLM operations
- Consistent error handling and API response parsing
- Support for `--dry-run` and `--test-llm` debugging modes

## Exit Codes

Standard exit codes across tools:
- `0` - Success (PASS or WARN status for validator)
- `1` - Validation failed (FAIL status) or command error
- `2` - Unknown error or API issues

## Available Tools (via Bash tool)

**`./bin/spec-validator`** - Validate specification files using LLMs
- **Usage:** `./bin/spec-validator [OPTIONS] <spec_file>`
- **Common commands:**
  - `./bin/spec-validator specs/example.md` - Validate single spec
  - `./bin/spec-validator --json specs/example.md` - JSON output
  - `./bin/spec-validator --test-llm` - Test LLM integration
  - `git diff --cached specs/ | ./bin/spec-validator --diff -` - Validate git diff
- **Requirements:** `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` environment variable

**`./bin/spec-editor`** - Create, update, and fork specification files
- **Usage:** `./bin/spec-editor <command> [OPTIONS] <spec_file>`
- **Commands:**
  - `create` - Create new spec file
  - `update` - Update existing spec file  
  - `fork` - Create new spec based on existing one
- **Common options:**
  - `--ai-assist` - Use AI to enhance content
  - `--patch/--minor/--major` - Version bump type
  - `--non-interactive` - Skip interactive prompts
- **Requirements:** `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` for AI features

## Development Notes

- All bash scripts use `set -euo pipefail` for strict error handling
- Debug mode available via `DEBUG=1` environment variable
- Tools create backups before modifying files
- Validation is integrated into the editing workflow
- JSON output modes available for CI/CD integration