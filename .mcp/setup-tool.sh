#!/bin/bash

# Context7 Setup Script - Install AI tool adapter

set -e

TOOL=$1
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MCP_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔧 MCP (Model Context Protocol) Setup"
echo "===================="
echo ""

# Check if tool specified
if [ -z "$TOOL" ]; then
    echo -e "${RED}Error: No tool specified${NC}"
    echo ""
    echo "Usage: ./setup-tool.sh <tool>"
    echo ""
    echo "Available tools:"
    ls -1 "$MCP_DIR/adapters/" | sed 's/^/  - /'
    echo ""
    echo "Example: ./setup-tool.sh cursor"
    exit 1
fi

# Check if adapter exists
ADAPTER_DIR="$MCP_DIR/adapters/$TOOL"
if [ ! -d "$ADAPTER_DIR" ]; then
    echo -e "${RED}Error: No adapter found for '$TOOL'${NC}"
    echo ""
    echo "Available tools:"
    ls -1 "$MCP_DIR/adapters/" | sed 's/^/  - /'
    exit 1
fi

echo -e "${GREEN}Setting up $TOOL adapter...${NC}"
echo ""

# Install adapter based on tool
case $TOOL in
    cursor)
        echo "📝 Installing Cursor adapter..."
        
        # Backend
        cp "$ADAPTER_DIR/.cursorrules" "$PROJECT_ROOT/inventory-management-backend/.cursorrules"
        echo "   ✅ Backend: .cursorrules installed"
        
        # Frontend
        cp "$ADAPTER_DIR/.cursorrules" "$PROJECT_ROOT/inventory-management-frontend/.cursorrules"
        echo "   ✅ Frontend: .cursorrules installed"
        
        echo ""
        echo "✅ Cursor configured successfully!"
        echo ""
        echo "Configuration files:"
        echo "   inventory-management-backend/.cursorrules"
        echo "   inventory-management-frontend/.cursorrules"
        ;;
        
    copilot)
        echo "📝 Installing GitHub Copilot adapter..."
        
        # Backend
        mkdir -p "$PROJECT_ROOT/inventory-management-backend/.github"
        cp "$ADAPTER_DIR/instructions.md" "$PROJECT_ROOT/inventory-management-backend/.github/copilot-instructions.md"
        echo "   ✅ Backend: copilot-instructions.md installed"
        
        # Frontend
        mkdir -p "$PROJECT_ROOT/inventory-management-frontend/.github"
        cp "$ADAPTER_DIR/instructions.md" "$PROJECT_ROOT/inventory-management-frontend/.github/copilot-instructions.md"
        echo "   ✅ Frontend: copilot-instructions.md installed"
        
        echo ""
        echo "✅ GitHub Copilot configured successfully!"
        echo ""
        echo "Configuration files:"
        echo "   inventory-management-backend/.github/copilot-instructions.md"
        echo "   inventory-management-frontend/.github/copilot-instructions.md"
        ;;
        
    claude)
        echo "📝 Installing Claude adapter..."
        
        # Create Claude config directory if needed
        mkdir -p ~/.config/claude/projects
        
        # Install config
        cp "$ADAPTER_DIR/context.json" ~/.config/claude/projects/atl-inventory.json
        echo "   ✅ Claude config installed"
        
        echo ""
        echo "✅ Claude configured successfully!"
        echo ""
        echo "Configuration file:"
        echo "   ~/.config/claude/projects/atl-inventory.json"
        ;;
        
    codeium)
        echo "📝 Installing Codeium adapter..."
        
        # Backend
        mkdir -p "$PROJECT_ROOT/inventory-management-backend/.codeium"
        cp "$ADAPTER_DIR/config.json" "$PROJECT_ROOT/inventory-management-backend/.codeium/config.json"
        echo "   ✅ Backend: config.json installed"
        
        # Frontend
        mkdir -p "$PROJECT_ROOT/inventory-management-frontend/.codeium"
        cp "$ADAPTER_DIR/config.json" "$PROJECT_ROOT/inventory-management-frontend/.codeium/config.json"
        echo "   ✅ Frontend: config.json installed"
        
        echo ""
        echo "✅ Codeium configured successfully!"
        echo ""
        echo "Configuration files:"
        echo "   inventory-management-backend/.codeium/config.json"
        echo "   inventory-management-frontend/.codeium/config.json"
        ;;
        
    *)
        echo -e "${YELLOW}Warning: Unknown tool '$TOOL'${NC}"
        echo "You'll need to manually configure this tool."
        echo "See adapter files in: $ADAPTER_DIR"
        exit 1
        ;;
esac

echo ""
echo "📚 Context Sources (shared by all tools):"
echo "   1. Constitution: inventory-management-context/prompts/constitution.md"
echo "   2. Agent Guidance: inventory-management-context/AGENTS.md"
echo "   3. Onboarding: inventory-management-context/ONBOARDING.md"
echo "   4. Data Model: inventory-management-backend/src/types/entities.ts"
echo "   5. API Patterns: inventory-management-backend/src/lib/response.ts"
echo "   6. Logging: inventory-management-backend/src/lib/logger.ts"
echo ""
echo "🎯 Your $TOOL adapter references these canonical sources."
echo "   Update the source once → all tools get the update"
echo ""
echo "📖 For more information: inventory-management-context/.mcp/README.md"
echo ""

