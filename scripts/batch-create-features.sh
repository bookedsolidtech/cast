#!/bin/bash
# Batch create features from a JSON file
# Usage: ./scripts/batch-create-features.sh /path/to/repo features.json

set -e

PROJECT_PATH="$1"
FEATURES_FILE="$2"
API_URL="${AUTOMAKER_API_URL:-http://localhost:3008}"
API_KEY="${AUTOMAKER_API_KEY:-}"

if [ -z "$PROJECT_PATH" ] || [ -z "$FEATURES_FILE" ]; then
  echo "Usage: $0 <project-path> <features.json>"
  echo ""
  echo "features.json format:"
  echo '[
  {"title": "Feature 1", "description": "Description 1", "status": "backlog"},
  {"title": "Feature 2", "description": "Description 2", "status": "backlog"}
]'
  exit 1
fi

if [ -z "$API_KEY" ]; then
  echo "Warning: AUTOMAKER_API_KEY not set. Set it or authentication may fail."
fi

echo "Creating features in: $PROJECT_PATH"
echo "Reading from: $FEATURES_FILE"
echo ""

# Read and iterate over features
jq -c '.[]' "$FEATURES_FILE" | while read -r feature; do
  title=$(echo "$feature" | jq -r '.title')
  echo "Creating: $title"

  response=$(curl -s -X POST "$API_URL/api/features/create" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d "{
      \"projectPath\": \"$PROJECT_PATH\",
      \"feature\": $feature
    }")

  success=$(echo "$response" | jq -r '.success // false')
  if [ "$success" = "true" ]; then
    id=$(echo "$response" | jq -r '.feature.id')
    echo "  ✓ Created: $id"
  else
    error=$(echo "$response" | jq -r '.error // "Unknown error"')
    echo "  ✗ Failed: $error"
  fi
done

echo ""
echo "Done!"
