#!/usr/bin/env bash

# spec-validate.sh - Wrapper script for the spec-validator CLI
# This provides an alternative entry point as specified in the spec

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(dirname "$0")"

# Find the bin/spec-validator relative to the script location
SPEC_VALIDATOR="$SCRIPT_DIR/../bin/spec-validator"

# Check if the spec-validator exists
if [[ ! -f "$SPEC_VALIDATOR" ]]; then
    echo "Error: spec-validator not found at $SPEC_VALIDATOR" >&2
    exit 1
fi

# Make sure it's executable
if [[ ! -x "$SPEC_VALIDATOR" ]]; then
    echo "Error: spec-validator is not executable at $SPEC_VALIDATOR" >&2
    exit 1
fi

# Pass all arguments directly to the spec-validator
exec "$SPEC_VALIDATOR" "$@"