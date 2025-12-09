#!/bin/bash
# Stop both backend and frontend development servers

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🛑 Stopping development servers..."

# Stop backend (SAM local)
pkill -f "sam local start-api" && echo "✅ Backend stopped" || echo "⚠️  Backend not running"

# Stop frontend (Next.js)
pkill -f "next dev" && echo "✅ Frontend stopped" || echo "⚠️  Frontend not running"

echo ""
echo "✅ All development servers stopped"
echo ""
echo "To restart: $SCRIPT_DIR/start-dev.sh"

