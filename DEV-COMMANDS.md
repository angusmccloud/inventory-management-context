# Quick Development Commands

## 🚀 Start/Stop Development Servers

### Simple Scripts (Recommended)

```bash
# From project root (where workspace file is)
./inventory-management-context/.specify/scripts/bash/start-dev.sh

# Stop both backend and frontend
./inventory-management-context/.specify/scripts/bash/stop-dev.sh

# Or, if in the context repo:
cd inventory-management-context
./.specify/scripts/bash/start-dev.sh
./.specify/scripts/bash/stop-dev.sh
```

---

## 📝 One-Line Commands

### Stop Everything
```bash
pkill -f "sam local start-api" && pkill -f "next dev" && echo "✅ Servers stopped"
```

### Start Everything (from project root)
```bash
cd inventory-management-backend && export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock && npm run sam:local > /tmp/backend.log 2>&1 & cd ../inventory-management-frontend && npm run dev -- -p 3001 > /tmp/frontend.log 2>&1 & cd .. && echo "✅ Servers starting on ports 3000 and 3001"
```

---

## 🎯 Individual Services

### Backend Only

**Stop:**
```bash
pkill -f "sam local start-api"
```

**Start:**
```bash
cd inventory-management-backend
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
npm run sam:local
```

### Frontend Only

**Stop:**
```bash
pkill -f "next dev"
```

**Start:**
```bash
cd inventory-management-frontend
npm run dev -- -p 3001
```

---

## 📊 Check Status

```bash
# Check what's running on ports
lsof -i :3000 -i :3001 | grep LISTEN

# Test backend health
curl http://localhost:3000/health

# Check if frontend is responding
curl -I http://localhost:3001
```

---

## 📝 View Logs

When using the scripts, logs are written to `/tmp/`:

```bash
# Backend logs
tail -f /tmp/backend.log

# Frontend logs
tail -f /tmp/frontend.log
```

---

## 🔄 Restart After Code Changes

### Backend (requires rebuild)
```bash
./inventory-management-context/.specify/scripts/bash/stop-dev.sh
cd inventory-management-backend
npm run build && npm run sam:build
cd ..
./inventory-management-context/.specify/scripts/bash/start-dev.sh
```

### Frontend (auto-reloads, but if needed)
```bash
pkill -f "next dev"
cd inventory-management-frontend
npm run dev -- -p 3001
```

---

## ⚙️ Aliases (Optional)

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# ATL-Inventory aliases
alias dev-start='cd ~/work/ATL-Inventory && ./inventory-management-context/.specify/scripts/bash/start-dev.sh'
alias dev-stop='cd ~/work/ATL-Inventory && ./inventory-management-context/.specify/scripts/bash/stop-dev.sh'
alias dev-logs-be='tail -f /tmp/backend.log'
alias dev-logs-fe='tail -f /tmp/frontend.log'
alias dev-status='lsof -i :3000 -i :3001 | grep LISTEN'
```

Then reload: `source ~/.zshrc`

Now you can run from anywhere:
```bash
dev-start   # Start servers
dev-stop    # Stop servers
dev-status  # Check what's running
dev-logs-be # Watch backend logs
dev-logs-fe # Watch frontend logs
```

---

## 🚨 Troubleshooting

### Ports Already in Use
```bash
# Kill everything on port 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Colima Not Running
```bash
colima start
```

### Backend Won't Start
```bash
# Rebuild
cd inventory-management-backend
npm run build
npm run sam:build
cd ..
./inventory-management-context/.specify/scripts/bash/start-dev.sh
```

---

## 📍 Access Points

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

