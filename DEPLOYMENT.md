# Deployment Guide

## Local Development

### Quick Start Using Scripts

**macOS:**
```bash
./scripts/start-mac.sh
```

**Windows:**
```bash
scripts\start-windows.bat
```

### Manual Setup
```bash
# Terminal 1: Backend
cd src/backend && npm install
# Edit .env in project root with your credentials
npm run dev

# Terminal 2: Frontend
cd src/frontend && npm install
npm run dev
```

## Production Deployment

### Option 1: Heroku + Vercel

**Backend (Heroku)**
```bash
cd src/backend
heroku create english-coach-api
heroku config:set LLM_API_KEY=sk-your-key LLM_BASE_URL=... LLM_MODEL=gpt-4-turbo
git push heroku main
```

**Frontend (Vercel)**
```bash
cd src/frontend
npm install -g vercel
vercel --prod
# Set `VITE_API_BASE_URL` to your Heroku backend URL
```

### Option 2: Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - LLM_API_KEY=${LLM_API_KEY}
      - LLM_BASE_URL=https://api.openai.com/v1
      - LLM_MODEL=gpt-4-turbo
      - NODE_ENV=production
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

Then run: `docker-compose up --build`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LLM_API_KEY` | Your LLM provider API key | `sk-...` |
| `LLM_BASE_URL` | API endpoint base URL | `https://api.openai.com/v1` |
| `LLM_MODEL` | Model identifier | `gpt-4-turbo` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment | `production` |
