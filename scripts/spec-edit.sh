#!/usr/bin/env bash

# Convenience wrapper for spec-editor
# This script is referenced in the spec-editor-cli-bash.md specification

SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
SPEC_EDITOR="$SCRIPT_DIR/../bin/spec-editor"

# Forward all arguments to the main spec-editor binary
exec "$SPEC_EDITOR" "$@"