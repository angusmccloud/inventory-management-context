#!/bin/bash

# MCP Verification Script - Check that canonical sources exist

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 MCP Context Verification"
echo "==========================="
echo ""

ERRORS=0

# Check critical context files
echo "Checking critical context sources..."
echo ""

CRITICAL_FILES=(
    "inventory-management-context/prompts/constitution.md:Constitution"
    "inventory-management-context/AGENTS.md:Agent Guidance"
    "inventory-management-context/ONBOARDING.md:Onboarding Guide"
)

for entry in "${CRITICAL_FILES[@]}"; do
    IFS=':' read -r file name <<< "$entry"
    filepath="$PROJECT_ROOT/$file"
    
    if [ -f "$filepath" ]; then
        echo -e "   ${GREEN}✅${NC} $name"
        echo "      $file"
    else
        echo -e "   ${RED}❌ MISSING:${NC} $name"
        echo "      Expected: $file"
        ERRORS=$((ERRORS + 1))
    fi
    echo ""
done

# Check feature context files
echo "Checking feature context sources..."
echo ""

FEATURE_FILES=(
    "inventory-management-backend/src/types/entities.ts:Data Model"
    "inventory-management-backend/src/lib/response.ts:API Response Patterns"
    "inventory-management-backend/src/lib/logger.ts:Logging Patterns"
    "inventory-management-backend/src/lib/dynamodb.ts:DynamoDB Client"
)

for entry in "${FEATURE_FILES[@]}"; do
    IFS=':' read -r file name <<< "$entry"
    filepath="$PROJECT_ROOT/$file"
    
    if [ -f "$filepath" ]; then
        echo -e "   ${GREEN}✅${NC} $name"
        echo "      $file"
    else
        echo -e "   ${YELLOW}⚠️  MISSING:${NC} $name"
        echo "      Expected: $file"
    fi
    echo ""
done

# Check which tools are configured
echo "Checking tool adapters..."
echo ""

if [ -f "$PROJECT_ROOT/inventory-management-backend/.cursorrules" ]; then
    echo -e "   ${GREEN}✅${NC} Cursor configured"
fi

if [ -f "$PROJECT_ROOT/inventory-management-backend/.github/copilot-instructions.md" ]; then
    echo -e "   ${GREEN}✅${NC} GitHub Copilot configured"
fi

if [ -f ~/.config/claude/projects/atl-inventory.json ]; then
    echo -e "   ${GREEN}✅${NC} Claude configured"
fi

if [ -f "$PROJECT_ROOT/inventory-management-backend/.codeium/config.json" ]; then
    echo -e "   ${GREEN}✅${NC} Codeium configured"
fi

echo ""

# Summary
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical context sources present${NC}"
    echo ""
    echo "MCP is properly configured!"
else
    echo -e "${RED}❌ $ERRORS critical context source(s) missing${NC}"
    echo ""
    echo "Please ensure all repositories are cloned and up to date:"
    echo "  cd inventory-management-context && git pull"
    echo "  cd ../inventory-management-backend && git pull"
    echo "  cd ../inventory-management-frontend && git pull"
    exit 1
fi

echo ""
echo "To install an adapter: ./setup-tool.sh <tool>"
echo "Available tools: cursor, copilot, claude, codeium"
echo ""

