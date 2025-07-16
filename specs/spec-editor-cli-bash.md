---
id: spec-editor-cli-bash
version: 0.1.1
title: Spec Editor CLI (Bash)
status: active
entry_points:
  - bin/spec-editor
  - scripts/spec-edit.sh  
  - run via: ./bin/spec-editor create path/to/new-spec.md
  - run via: ./bin/spec-editor update path/to/existing-spec.md

description: >
  Defines a Bash-based CLI tool that creates and edits spec files while maintaining compliance with the spec-validator format. Leverages LLMs to assist with spec creation, updates, and format maintenance.

# deprecated_at: null  # Not deprecated
# replaced_by: null    # No replacement

---

## 🧠 Goal

Enable assisted spec creation and editing through a CLI that ensures all specs maintain proper format and structure. Helps users create new specs from templates or prompts, update existing specs while preserving structure, and automatically handle versioning and changelog entries.

## ⚙️ Functionality
  - Creates new spec files from:
    - Interactive prompts
    - Natural language descriptions
    - Templates
    - Existing specs (fork/copy)
  - Updates existing specs:
    - Automatic version bumping based on change type
    - Changelog entry generation
    - Structure preservation
    - Field validation during edits
  - Detects and uses one of:
    - OPENAI_API_KEY
    - ANTHROPIC_API_KEY
  - Uses spec-validator.md as reference for proper format
  - Maintains frontmatter integrity
  - Generates appropriate emoji headers (🧠, ✅, 🧪, etc.)
  - Suggests entry_points based on spec content
  - Auto-formats markdown sections
  - Validates edits before saving (using spec-validator internally)

## ✅ Success Criteria
  • Creates valid specs that pass spec-validator checks
  • Preserves existing content when updating specs
  • Correctly increments version numbers based on change severity
  • Generates meaningful changelog entries
  • Interactive mode guides users through required fields
  • Batch mode processes multiple files efficiently
  • Never overwrites files without confirmation or backup
  • Maintains consistent formatting across all sections
  • Agent can use tool to programmatically create/update specs:

```bash
echo "Create a spec for a user authentication module" | ./bin/spec-editor create --stdin auth-spec.md
```

## 📤 Output Format

### Interactive Mode (default)

```text
[SPEC EDITOR] Creating new spec: auth-module.md

Enter spec ID (lowercase-hyphenated): auth-module
Enter title: User Authentication Module
Enter initial version [0.1.0]: 
Enter description: Handles user login, logout, and session management

Select status:
1) draft (new/experimental)
2) active (in production)
3) deprecated (being phased out)
Choice [1]: 1

Enter entry points (comma-separated): src/auth/login.ts, src/auth/session.ts

Would you like to:
1) Add goal section
2) Add success criteria
3) Add test strategy
4) Generate from AI description
5) Save and exit
Choice: 2

Enter success criteria (empty line to finish):
- Users can authenticate with email/password
- Sessions expire after 24 hours
- Failed logins are rate-limited

Spec created successfully! Run 'spec-validator auth-module.md' to verify.
```

### Update Mode

```text
[SPEC EDITOR] Updating: user-service.md
Current version: 1.2.3

What type of change?
1) Patch (typo/clarification)
2) Minor (new feature/backwards compatible)
3) Major (breaking change)
Choice: 2

New version: 1.3.0

Describe your change for the changelog: Added webhook support for user events

Summary of changes:
- Version: 1.2.3 → 1.3.0
- Added to functionality section
- Updated success criteria
- New changelog entry

Confirm update? [y/N]: y
Backup saved to: user-service.md.bak
Updated successfully!
```

### Non-Interactive Mode

```bash
# Create from template
./bin/spec-editor create --template=service --id=payment-service --title="Payment Processing Service" payment-service.md

# Update with auto-version
./bin/spec-editor update --patch --changelog="Fixed typo in description" my-spec.md

# Fork existing spec
./bin/spec-editor fork existing-spec.md new-feature-spec.md --id=new-feature

# Generate from description
echo "A caching layer that stores frequently accessed data with TTL support" | \
  ./bin/spec-editor create --stdin --ai-assist cache-layer.md
```

## 🔐 Security
  • Never logs API keys
  • Creates backups before modifying existing files
  • Validates file paths to prevent directory traversal
  • Sanitizes LLM-generated content for safe markdown

## 🧪 Test Strategy

### Manual Tests

```bash
# Test spec creation
./bin/spec-editor create test-specs/new-feature.md

# Test spec update with version bump
./bin/spec-editor update --minor existing-spec.md

# Test AI-assisted creation
echo "Create a spec for real-time notifications" | ./bin/spec-editor create --stdin --ai-assist

# Test validation integration
./bin/spec-editor create invalid-spec.md --validate
```

### Test Coverage
- Interactive spec creation flow
- Non-interactive template usage
- Version bumping logic (patch/minor/major)
- Changelog generation
- Backup creation
- AI-assisted content generation
- Validation before save
- Error handling for malformed specs
- Template system

### LLM Integration Testing

```bash
# Test AI-assisted spec generation
OPENAI_API_KEY=your-key ./bin/spec-editor create --ai-prompt="logging system with rotation" log-spec.md

# Test changelog generation
ANTHROPIC_API_KEY=your-key ./bin/spec-editor update --ai-changelog my-spec.md

# Verify AI content parsing
./bin/spec-editor --test-ai "email service with templates"
```

## 🛠️ Implementation Notes

### Known Limitations (v0.1.1)
- The `update` command does not currently support `--ai-prompt` option for AI-assisted content updates
- AI assistance for updates is limited to `--ai-changelog` for generating changelog entries
- Workaround: Use `--ai-assist` flag without specific prompt for general AI enhancement during updates

## 🔁 Changelog

### 0.1.1 - 2025-07-16
- Documented known limitation: AI assistance for update command is limited
- Clarified that --ai-prompt is only supported for create command
- Added workaround notes for AI-assisted updates

### 0.1.0 - Initial Version
- Initial specification for spec-editor CLI tool

### Spec Creation Flow
1. Gather required fields (interactive or flags)
2. Generate appropriate structure based on spec-validator.md
3. Use templates for common patterns
4. If AI-assist enabled, enhance content with LLM
5. Validate using spec-validator before saving
6. Create file with proper permissions

### Version Management
- Parse existing version using semver regex
- Determine bump type:
  - Patch: content clarifications, typos
  - Minor: new sections, additional criteria
  - Major: structural changes, field modifications
- Update version in frontmatter
- Generate changelog entry with timestamp

### Template System
```bash
# Templates stored in templates/ directory
templates/
  service.md.tmpl
  library.md.tmpl
  cli-tool.md.tmpl
  api-endpoint.md.tmpl
```

### AI Integration
- Use LLM to:
  - Generate descriptions from titles
  - Suggest entry_points
  - Create success criteria
  - Write test strategies
  - Generate changelog summaries
- Always validate AI output before including

### Backup Strategy
- Before any update: `cp spec.md spec.md.bak`
- Maintain last 3 backups with timestamps
- Option to disable with `--no-backup`

## 📝 Example Prompts

### Creating New Specs
```bash
# Interactive creation
./bin/spec-editor create

# From description with AI
./bin/spec-editor create --ai-prompt="API rate limiter with Redis backend" rate-limiter.md

# From template
./bin/spec-editor create --template=service user-service.md

# Batch creation from CSV
./bin/spec-editor create-batch specs.csv --output-dir=specs/
```

### Updating Specs
```bash
# Interactive update
./bin/spec-editor update my-spec.md

# Quick patch
./bin/spec-editor update --patch --changelog="Fixed grammar" my-spec.md

# Minor update with AI changelog
./bin/spec-editor update --minor --ai-changelog my-spec.md

# Major version with breaking changes
./bin/spec-editor update --major --interactive my-spec.md
```

### Advanced Usage
```bash
# Fork and modify
./bin/spec-editor fork base-spec.md variant-spec.md --modify

# Bulk updates
find specs/ -name "*.md" | xargs -I {} ./bin/spec-editor update --patch {} --changelog="Updated format"

# Generate from code
./bin/spec-editor analyze src/feature.ts --output=feature-spec.md
```

## 🔁 Changelog

- **0.1.0** — 2025-07-16 — Claude — Initial spec for spec-editor tool based on spec-validator patterns