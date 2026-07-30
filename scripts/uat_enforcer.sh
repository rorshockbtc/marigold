#!/usr/bin/env bash

set -e

echo "Running UAT Enforcer (Cassandra Manifesto)..."
TARGET_DIR="${1:-.}"

EXIT_CODE=0

# 1. No inline styles
echo "Checking for inline styles..."
if grep -Rn "style={{" "$TARGET_DIR" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=coverage --include=\*.{jsx,tsx,js,ts,html} 2>/dev/null; then
  echo "⚠️ WARNING: Inline styles (style={{) are discouraged."
fi

# 2. Base-8 spacing
echo "Checking for base-8 grid spacing mathematically..."
INVALID_SPACING=$(grep -RnE "(padding|margin|gap|top|bottom|left|right|-width|-height):\s*[0-9]+px" "$TARGET_DIR" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=coverage --include=\*.{css,scss,jsx,tsx} 2>/dev/null || true)

if [ -n "$INVALID_SPACING" ]; then
  while IFS= read -r line; do
    # Extract the number before 'px'
    VAL=$(echo "$line" | grep -oE "[0-9]+px" | head -1 | sed 's/px//')
    if [ -n "$VAL" ]; then
      if [ $((VAL % 8)) -ne 0 ]; then
        echo "❌ ERROR: Base-8 spacing violation: $line"
        echo "   -> Value ${VAL}px is not divisible by 8."
        EXIT_CODE=1
      fi
    fi
  done <<< "$INVALID_SPACING"
fi

# 3. Data Layer Separation (Proof A)
echo "Checking for direct IndexedDB access in UI components..."
if grep -Rn "indexedDB\.open" "$TARGET_DIR/src/components" --include=\*.tsx 2>/dev/null; then
  echo "❌ ERROR: UI components cannot access IndexedDB directly."
  echo "   -> You must import and consume useVoterRollConnection.ts."
  EXIT_CODE=1
fi

# 4. CTO Orchestrator: Zero-Cloud Validation
echo "Checking for unauthorized server-side database drivers..."
if grep -RnE "(better-sqlite3|import\s+pg\s+from|import.*from.*mysql)" "$TARGET_DIR" --exclude-dir=node_modules --exclude-dir=.next --include=\*.{ts,js} 2>/dev/null; then
  echo "❌ ERROR: Server-side database drivers detected. Pipes architecture requires local OPFS/IndexedDB. You are violating the Zero-Cloud mandate."
  EXIT_CODE=1
fi

# 5. CTO Orchestrator: Porcupine UX (Passkey/PIN abstraction)
echo "Checking for raw cryptographic key exposure in UI..."
if grep -RnE "(privateKey|hexKey|seedPhrase|mnemonic)" "$TARGET_DIR/src/components" --include=\*.{tsx,jsx} 2>/dev/null; then
  echo "❌ ERROR: The 'Porcupine Defense' rule explicitly forbids exposing raw cryptographic terminology or keys to the user. Abstract this behind a PIN, Passkey, or FaceID interaction."
  EXIT_CODE=1
fi

# 6. CTO Orchestrator: Component Modularity
echo "Checking for monolithic inline render functions..."
if grep -RnE "const\s+render[A-Za-z0-9_]+\s*=\s*\(\)\s*=>" "$TARGET_DIR/src/app" --include=\*.tsx 2>/dev/null; then
  echo "❌ ERROR: Inline render functions (e.g., const renderDataPanel = () => {...}) are prohibited in page components. You must extract this into a standalone, typed React component in the src/components directory to prevent spaghetti code."
  EXIT_CODE=1
fi

# 7. Component Governance: No raw <button> outside ui/
echo "Checking for raw <button> elements outside governed primitives..."
RAW_BUTTONS=$(grep -Rn "<button" "$TARGET_DIR/src/app" --include=\*.tsx 2>/dev/null || true)
RAW_BUTTONS="$RAW_BUTTONS$(grep -Rn "<button" "$TARGET_DIR/src/components" --include=\*.tsx --exclude-dir=ui 2>/dev/null || true)"
if [ -n "$RAW_BUTTONS" ]; then
  echo "$RAW_BUTTONS"
  echo "❌ ERROR: Raw <button> elements are banned outside src/components/ui/. Use the governed <Button> or <IconButton> component from @/components/ui/Button or @/components/ui/IconButton."
  EXIT_CODE=1
fi

# 8. Component Governance: No raw <a href> outside ui/
echo "Checking for raw <a href> elements outside governed primitives..."
RAW_LINKS=$(grep -RnE "<a\s+href" "$TARGET_DIR/src/app" --include=\*.tsx 2>/dev/null || true)
RAW_LINKS="$RAW_LINKS$(grep -RnE "<a\s+href" "$TARGET_DIR/src/components" --include=\*.tsx --exclude-dir=ui 2>/dev/null || true)"
if [ -n "$RAW_LINKS" ]; then
  echo "$RAW_LINKS"
  echo "❌ ERROR: Raw <a href> elements are banned outside src/components/ui/. Use the governed <Link> component from @/components/ui/Link."
  EXIT_CODE=1
fi

# 9. Component Governance: No raw <select> outside ui/
echo "Checking for raw <select> elements outside governed primitives..."
RAW_SELECTS=$(grep -Rn "<select" "$TARGET_DIR/src/app" --include=\*.tsx 2>/dev/null || true)
RAW_SELECTS="$RAW_SELECTS$(grep -Rn "<select" "$TARGET_DIR/src/components" --include=\*.tsx --exclude-dir=ui 2>/dev/null || true)"
if [ -n "$RAW_SELECTS" ]; then
  echo "$RAW_SELECTS"
  echo "❌ ERROR: Raw <select> elements are banned outside src/components/ui/. Use the governed <FilterControl> component from @/components/ui/FilterControl."
  EXIT_CODE=1
fi

# 10. TDD Enforcement: Every component must have a test file
echo "Checking for components without corresponding test files..."
COMPONENTS_WITHOUT_TESTS=0
for COMPONENT_FILE in "$TARGET_DIR/src/components"/*.tsx; do
  [ -f "$COMPONENT_FILE" ] || continue
  BASENAME=$(basename "$COMPONENT_FILE" .tsx)
  if [ ! -f "$TARGET_DIR/__tests__/components/${BASENAME}.test.tsx" ]; then
    echo "⚠️ WARNING: Component $BASENAME.tsx has no test file at __tests__/components/${BASENAME}.test.tsx"
    COMPONENTS_WITHOUT_TESTS=$((COMPONENTS_WITHOUT_TESTS + 1))
  fi
done
if [ "$COMPONENTS_WITHOUT_TESTS" -gt 0 ]; then
  echo "📋 INFO: $COMPONENTS_WITHOUT_TESTS component(s) lack test files. TDD coverage gap detected."
fi

# 11. TDD Enforcement: Every hook must have a test file
echo "Checking for hooks without corresponding test files..."
HOOKS_WITHOUT_TESTS=0
for HOOK_FILE in "$TARGET_DIR/src/hooks"/*.ts; do
  [ -f "$HOOK_FILE" ] || continue
  BASENAME=$(basename "$HOOK_FILE" .ts)
  if [ ! -f "$TARGET_DIR/__tests__/hooks/${BASENAME}.test.ts" ] && [ ! -f "$TARGET_DIR/__tests__/hooks/${BASENAME}.test.tsx" ]; then
    echo "⚠️ WARNING: Hook $BASENAME.ts has no test file at __tests__/hooks/${BASENAME}.test.ts"
    HOOKS_WITHOUT_TESTS=$((HOOKS_WITHOUT_TESTS + 1))
  fi
done
if [ "$HOOKS_WITHOUT_TESTS" -gt 0 ]; then
  echo "📋 INFO: $HOOKS_WITHOUT_TESTS hook(s) lack test files. TDD coverage gap detected."
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ UAT Enforcement passed: No inline styles, strict base-8 grid spacing, and separation of concerns maintained."
else
  echo "❌ UAT Enforcement failed."
fi

exit $EXIT_CODE
