# 6. Local Development Setup & Prerequisites

This stack requires a robust machine. An NVIDIA GPU with CUDA support is recommended for the AI microservice but is **not required** — a CPU fallback profile is provided for local development.

## 1. Prerequisites & Global Tooling
* **OS:** MacOS (M-series fine), Windows (WSL2 recommended), or Ubuntu 22.04+.
* **Node.js:** v20+ LTS (`node --version`)
* **Python:** v3.10+ (`python3 --version`)
* **Docker Desktop:** Required for DB, Redis, and AI service orchestration.
* **Mobile Dev:** Xcode (Mac only, for iOS builds) and Android Studio (Command Line Tools for Android builds).
* **Package Managers:** `npm` or `yarn` (JS), `pip` + `venv` (Python).
* **Optional (GPU):** NVIDIA GPU with CUDA 12.x + cuDNN. Required only for fast AI inference; CPU works for development.

## 2. Infrastructure Setup (Docker Compose)
Create a `docker-compose.yml` in the project root:
```yaml
version: '3.8'
services:
  db:
    image: ankane/pgvector:v0.5.1  # PostgreSQL with pgvector pre-installed
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ellipse
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

**PostGIS must be enabled manually after first run:**
```bash
docker-compose up -d
docker exec -it <db_container> psql -U admin -d ellipse -c "CREATE EXTENSION IF NOT EXISTS postgis;"
docker exec -it <db_container> psql -U admin -d ellipse -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

## 3. Main API Setup (Node.js / NestJS)
```bash
cd backend-api
npm install
cp .env.example .env  # Set DATABASE_URL, REDIS_URL, JWT_SECRET
npx prisma migrate dev  # Run schema migrations
npm run start:dev        # Runs on localhost:3000
```

**Required `.env` variables:**
```env
DATABASE_URL=postgresql://admin:password@localhost:5432/ellipse
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
AI_SERVICE_SECRET=shared-internal-key
```

## 4. AI Microservice Setup (Python / FastAPI)

### GPU Profile (NVIDIA CUDA available)
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate          # Mac/Linux
# venv\Scripts\activate           # Windows
pip install -r requirements.txt   # includes torch (CUDA), fastapi, ultralytics, celery, transformers
```

### CPU Fallback Profile (No GPU)
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-cpu.txt  # includes torch (CPU-only), onnxruntime
```

### Download Model Weights
```bash
mkdir -p weights/
# YOLO11-seg (Ultralytics)
python -c "from ultralytics import YOLO; YOLO('yolo11n-seg.pt')"

# DINOv2 (auto-downloads on first run via transformers)
python -c "from transformers import AutoModel; AutoModel.from_pretrained('facebook/dinov2-base')"

# Depth Anything V2 (V2 only — not needed for MVP)
# python -c "from transformers import AutoModelForDepthEstimation; AutoModelForDepthEstimation.from_pretrained('depth-anything/Depth-Anything-V2-Small-hf')"
```

### Start Services
```bash
# Terminal 1: Celery worker (processes AI jobs from Redis queue)
celery -A tasks worker --loglevel=info --concurrency=1

# Terminal 2: FastAPI server (internal webhook receiver)
uvicorn main:app --reload --port 8000
```

## 5. Web Dashboard Setup (Next.js)
```bash
cd web-dashboard
npm install
cp .env.example .env  # Set NEXT_PUBLIC_API_URL, NEXT_PUBLIC_MAPBOX_TOKEN
npm run dev            # Runs on localhost:3001
```

**Required `.env` variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-access-token
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

**Get a Mapbox token:** Sign up at [mapbox.com](https://www.mapbox.com/) (free tier: 50k map loads/month).

## 6. Mobile App Setup (Expo / React Native)
```bash
cd mobile-app
npx expo install
cp .env.example .env  # Set API_URL
npx expo start         # Scan QR via Expo Go app on physical device
```

> **Note:** Camera and GPS features require a **physical device** — they do not work in simulators. Use Expo Go to test on your phone.

## 7. Running the Full Stack Locally (Summary)

| Service | Port | Command |
|---|---|---|
| PostgreSQL (Docker) | 5432 | `docker-compose up -d` |
| Redis (Docker) | 6379 | (started by docker-compose) |
| Node.js API | 3000 | `cd backend-api && npm run start:dev` |
| Celery Worker | — | `cd ai-service && celery -A tasks worker` |
| FastAPI (AI) | 8000 | `cd ai-service && uvicorn main:app --reload --port 8000` |
| Next.js Dashboard | 3001 | `cd web-dashboard && npm run dev` |
| Mobile App | 8081 | `cd mobile-app && npx expo start` |

**Total terminals needed:** 5 (Docker runs in background). Consider using a process manager like `tmux`, `Overmind`, or VS Code's multi-terminal feature.
