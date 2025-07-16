#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--json] [--diff <file|->] SPEC_FILE
Validate a specification using the Spec Validator reference spec.
USAGE
  exit 1
}

json=0
diff_input=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json)
      json=1
      shift
      ;;
    --diff)
      [[ $# -gt 1 ]] || usage
      diff_input="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage
      ;;
    *)
      break
      ;;
  esac
done

[[ $# -eq 1 ]] || usage
spec_file="$1"

if [[ ! -f "$spec_file" ]]; then
  echo "Spec file not found: $spec_file" >&2
  exit 1
fi

case "$spec_file" in
  *.md|*.markdown|*.yaml|*.yml) ;;
  *)
    echo "Spec file must be .md or .yaml" >&2
    exit 1
    ;;
esac

if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  provider="openai"
  api_key="$OPENAI_API_KEY"
elif [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  provider="anthropic"
  api_key="$ANTHROPIC_API_KEY"
else
  echo "OPENAI_API_KEY or ANTHROPIC_API_KEY required" >&2
  exit 1
fi

spec_content="$(cat "$spec_file")"
reference_spec="$(cat "$(dirname "$0")/../specs/spec-validator.md")"

if [[ -n "$diff_input" ]]; then
  if [[ "$diff_input" == "-" ]]; then
    diff_content="$(cat)"
  else
    diff_content="$(cat "$diff_input")"
  fi
  diff_content=$(echo "$diff_content" | awk -v file="$spec_file" '
    /^diff --git/ {
      path=$0;
      sub(/^diff --git a\//, "", path);
      sub(/ b\/.*/, "", path);
      keep=(path==file);
      next
    }
    keep
  ')
else
  diff_content=""
fi

system_prompt="$(bash "$(dirname "$0")/../promptTemplate-GPT.sh")"

user_message="REFERENCE SPEC:\n${reference_spec}\n\nSPEC FILE (${spec_file}):\n${spec_content}"
if [[ -n "$diff_content" ]]; then
  user_message+="\n\nGIT DIFF:\n${diff_content}"
fi

call_openai() {
  local payload response
  payload=$(jq -n --arg sys "$system_prompt" --arg msg "$user_message" '{model:"gpt-4-turbo",messages:[{"role":"system","content":$sys},{"role":"user","content":$msg}],temperature:0}')
  response=$(curl -sS https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer $api_key" \
    -H "Content-Type: application/json" \
    -d "$payload")
  echo "$response" | jq -r '.choices[0].message.content // empty'
}

call_anthropic() {
  local payload response
  payload=$(jq -n --arg sys "$system_prompt" --arg msg "$user_message" '{model:"claude-3-opus-20240229",system:$sys,messages:[{"role":"user","content":$msg}],max_tokens:1024,temperature:0}')
  response=$(curl -sS https://api.anthropic.com/v1/messages \
    -H "x-api-key: $api_key" \
    -H "anthropic-version: 2023-06-01" \
    -H "Content-Type: application/json" \
    -d "$payload")
  echo "$response" | jq -r '.content[0].text // empty'
}

result=""
if [[ "$provider" == "openai" ]]; then
  result=$(call_openai)
else
  result=$(call_anthropic)
fi

if [[ -z "$result" ]]; then
  echo "Model API error" >&2
  exit 1
fi

if [[ "$json" -eq 1 ]]; then
  echo "$result"
  exit
fi

echo "[VALIDATION] $spec_file"
if echo "$result" | jq . >/dev/null 2>&1; then
  status=$(echo "$result" | jq -r '.status')
  echo "Status: $status"
  failures=$(echo "$result" | jq -r '.failures[]? | "- Line \(.line): \(.message)"')
  warnings=$(echo "$result" | jq -r '.warnings[]? | "- Line \(.line): \(.message)"')
  suggestions=$(echo "$result" | jq -r '.suggestions[]? | "- [\(.level)] \(.text)"')
  if [[ -n "$failures" ]]; then
    echo
    echo "Failures (requires human review):"
    echo "$failures"
  fi
  if [[ -n "$warnings" ]]; then
    echo
    echo "Warnings (agent-fixable):"
    echo "$warnings"
  fi
  if [[ -n "$suggestions" ]]; then
    echo
    echo "Suggestions:"
    echo "$suggestions"
  fi
  summary=$(echo "$result" | jq -r '.summary | "PASS: \(.pass) | WARN: \(.warn) | FAIL: \(.fail)"')
  echo
  echo "Summary:"
  echo "$summary"
else
  echo "$result"
fi

