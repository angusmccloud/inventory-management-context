#!/bin/bash
# Start both backend and frontend development servers

echo "🚀 Starting development servers..."
echo ""

# Navigate to project root (3 levels up from .specify/scripts/bash/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Check if Colima is running
if ! colima status > /dev/null 2>&1; then
    echo "⚠️  Colima not running. Starting Colima..."
    colima start
    sleep 2
fi

# Start backend in background
echo "Starting backend on port 3000..."
cd "$PROJECT_ROOT/inventory-management-backend"
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
npm run sam:local > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment
sleep 2

# Start frontend in background
echo "Starting frontend on port 3001..."
cd "$PROJECT_ROOT/inventory-management-frontend"
npm run dev -- -p 3001 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers starting..."
echo ""
echo "📊 Services:"
echo "   Backend:  http://localhost:3000  (PID: $BACKEND_PID)"
echo "   Frontend: http://localhost:3001  (PID: $FRONTEND_PID)"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 To stop: $SCRIPT_DIR/stop-dev.sh"
echo ""

# Wait a bit and test health
sleep 5
echo "🔍 Testing backend health..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend may still be starting... check logs: tail -f /tmp/backend.log"
fi

