# Ellipse — Phase-by-Phase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Ellipse — an AI-powered waste response system with a Citizen Mobile App, Authority Web Dashboard, AI Microservice, and shared NestJS backend, connected to Supabase (PostgreSQL) and Upstash (Redis).

**Architecture:** Polyglot Microservices. Node.js/NestJS (main API + Prisma ORM) + Python/FastAPI (AI worker + Celery). Supabase for database + photo storage. Upstash Redis for async job queue. Socket.IO for real-time dashboard updates.

**Tech Stack:** React Native (Expo Router) · Next.js (App Router + shadcn/ui + Tailwind) · NestJS (Prisma) · FastAPI (SQLAlchemy + Celery) · Supabase · Upstash Redis · YOLO11-seg · DINOv2 · Mapbox GL

**Spec:** References the following specification documents:
- [1_Recommended_System_Architecture.md](file:///C:/Users/aarya/Desktop/Ellipse/plans/1_Recommended_System_Architecture.md)
- [2_Complete_Tech_Stack_and_Tooling.md](file:///C:/Users/aarya/Desktop/Ellipse/plans/2_Complete_Tech_Stack_and_Tooling.md)
- [3_Unified_Database_Schema.md](file:///C:/Users/aarya/Desktop/Ellipse/plans/3_Unified_Database_Schema.md)
- [4_API_Endpoints_Specifications.md](file:///C:/Users/aarya/Desktop/Ellipse/plans/4_API_Endpoints_Specifications.md)
- [5_AI_Model_Pipeline_and_Training_Guide.md](file:///C:/Users/aarya/Desktop/Ellipse/plans/5_AI_Model_Pipeline_and_Training_Guide.md)
- [6_Local_Development_Setup_and_Prerequisites.md](file:///C:/Users/aarya/Desktop/Ellipse/plans/6_Local_Development_Setup_and_Prerequisites.md)
- [7_Phased_Implementation_Roadmap.md](file:///C:/Users/aarya/Desktop/Ellipse/plans/7_Phased_Implementation_Roadmap.md)
- [1_App_Flow.md](file:///C:/Users/aarya/Desktop/Ellipse/app-plans/1_App_Flow.md)
- [2_Design_Guidelines.md](file:///C:/Users/aarya/Desktop/Ellipse/app-plans/2_Design_Guidelines.md)
- [3_Frontend_Guidelines.md](file:///C:/Users/aarya/Desktop/Ellipse/app-plans/3_Frontend_Guidelines.md)

## Global Constraints

- **Node.js:** v20+ LTS
- **Python:** v3.10+
- **TypeScript:** Strict mode (`strict: true`, `noImplicitAny: true`)
- **Database:** Supabase (PostgreSQL v15, PostGIS, pgvector). Connect ONLY via `DATABASE_URL` through Prisma/SQLAlchemy. Never use `@supabase/supabase-js` for DB queries.
- **Redis:** Upstash (connect via `REDIS_URL`). Standard Redis protocol.
- **ORM:** Prisma (Node.js side), SQLAlchemy (Python side).
- **Font:** Philosopher (primary, headings + body), Inter (secondary, captions/badges < 13px), JetBrains Mono (monospace/data).
- **Colors:** Gradient 3 dark theme — Lime `#E3EF26`, Teal `#076653`, Forest `#0C342C`, Midnight `#061F1A`.
- **Named exports only** in all frontend code.
- **No magic numbers** — all colors, spacing, and sizes from theme tokens.
- **Commit convention:** `feat:`, `fix:`, `refactor:`, `style:`, `chore:`, `docs:` prefixes.

---

## Phase 1: Infrastructure, Schema & Project Scaffolding
*Sprint 1 — 2 weeks. Goal: All 4 services running locally, connected to Supabase, schema migrated.*

---

### Task 1.1: Initialize Monorepo & Git

**Files:**
- Create: `Ellipse/.gitignore`
- Create: `Ellipse/README.md`
- Create: `Ellipse/.env.example`

- [ ] **Step 1: Initialize Git repository**
```bash
cd C:\Users\aarya\Desktop\Ellipse
git init
git checkout -b main
```

- [ ] **Step 2: Create `.gitignore`**
```gitignore
# Dependencies
node_modules/
__pycache__/
*.pyc
venv/

# Build outputs
.next/
dist/
build/

# Environment secrets
.env
.env.local

# AI model weights (10-100MB each)
ai-service/weights/*.pt
ai-service/weights/*.onnx
ai-service/weights/*.engine

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Expo
.expo/
```

- [ ] **Step 3: Create `.env.example`**
```env
# Supabase PostgreSQL (from Project Settings → Database)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Upstash Redis
REDIS_URL=rediss://default:[password]@[endpoint].upstash.io:6379

# Auth
JWT_SECRET=change-me-to-a-random-64-char-string

# Internal AI <-> API communication
AI_SERVICE_SECRET=change-me-to-a-shared-secret

# Supabase Storage (for photo uploads)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Mapbox (for GIS maps)
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

- [ ] **Step 4: Create `README.md` with project overview**

- [ ] **Step 5: Initial commit**
```bash
git add .
git commit -m "chore: initialize Ellipse monorepo"
git checkout -b dev
```

---

### Task 1.2: Supabase & Upstash Cloud Setup

This task is done manually in the browser (not code).

- [ ] **Step 1: Create Supabase project**
  - Go to [supabase.com](https://supabase.com/) → New Project.
  - Name: `ellipse`. Region: **South Asia (Mumbai)**.
  - Note the project password.

- [ ] **Step 2: Enable PostGIS and pgvector extensions**
  - Go to SQL Editor in Supabase dashboard.
  - Run:
  ```sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

- [ ] **Step 3: Create Storage bucket for photos**
  - Go to Storage → New Bucket.
  - Name: `complaint-photos`. Access: Private (signed URLs).

- [ ] **Step 4: Copy connection string**
  - Go to Project Settings → Database → Connection string (URI).
  - Copy to `.env` as `DATABASE_URL`.

- [ ] **Step 5: Create Upstash Redis database**
  - Go to [upstash.com](https://upstash.com/) → Create Database.
  - Region: nearest to Mumbai.
  - Copy the `redis://` connection string to `.env` as `REDIS_URL`.

- [ ] **Step 6: Verify `.env` is populated and `.env` is in `.gitignore`**

---

### Task 1.3: Scaffold NestJS Backend API

**Files:**
- Create: `backend-api/` (entire NestJS project)
- Create: `backend-api/prisma/schema.prisma`
- Create: `backend-api/.env.example`

**Produces:** A running NestJS server on `localhost:3000` with Prisma connected to Supabase.

- [ ] **Step 1: Scaffold NestJS project**
```bash
cd C:\Users\aarya\Desktop\Ellipse
npx -y @nestjs/cli@latest new backend-api --skip-git --package-manager npm --strict
```

- [ ] **Step 2: Install dependencies**
```bash
cd backend-api
npm install prisma @prisma/client @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs class-validator class-transformer socket.io @nestjs/platform-socket.io @nestjs/websockets bullmq ioredis @supabase/supabase-js
npm install -D @types/passport-jwt @types/bcryptjs
```

- [ ] **Step 3: Initialize Prisma**
```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 4: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis, vector]
}

enum UserRole {
  CITIZEN
  OFFICER
  DISPATCHER
  ADMIN
  FIELD_CREW
}

enum ComplaintStatus {
  LOGGED
  AI_TRIAGED
  ASSIGNED
  DISPATCHED
  RESOLVED
  DUPLICATE
  REJECTED
}

enum VehicleClass {
  MANUAL_SWEEP
  HANDCART
  MINI_TRUCK
  COMPACTOR
}

enum VolumeConfidence {
  HIGH
  MEDIUM
  LOW
}

enum VolumeMethod {
  CITIZEN_PICK
  ARCORE_LIDAR
  MONOCULAR_CALIBRATED
}

model User {
  id              String            @id @default(uuid())
  role            UserRole          @default(CITIZEN)
  fullName        String            @map("full_name")
  email           String?           @unique
  phone           String?           @unique
  cleanCityCredits Int              @default(0) @map("clean_city_credits")
  createdAt       DateTime          @default(now()) @map("created_at")
  complaints      Complaint[]       @relation("CitizenComplaints")
  dispatchOrders  DispatchOrder[]   @relation("CrewDispatches")
  dedupReviews    Complaint[]       @relation("DedupReviewer")
  activityLogs    CitizenActivityLog[]

  @@map("users")
}

model Complaint {
  id                  String          @id @default(uuid())
  citizenId           String?         @map("citizen_id")
  citizen             User?           @relation("CitizenComplaints", fields: [citizenId], references: [id], onDelete: SetNull)
  rawImageUrl         String          @map("raw_image_url")
  latitude            Float
  longitude           Float
  compassHeading      Float?          @map("compass_heading")
  status              ComplaintStatus  @default(LOGGED)
  parentComplaintId   String?         @map("parent_complaint_id")
  parentComplaint     Complaint?      @relation("DedupParent", fields: [parentComplaintId], references: [id])
  childComplaints     Complaint[]     @relation("DedupParent")
  dedupSimilarity     Float?          @map("dedup_similarity")
  dedupReviewedById   String?         @map("dedup_reviewed_by")
  dedupReviewedBy     User?           @relation("DedupReviewer", fields: [dedupReviewedById], references: [id])
  dedupDisputed       Boolean         @default(false) @map("dedup_disputed")
  upvoteCount         Int             @default(0) @map("upvote_count")
  createdAt           DateTime        @default(now()) @map("created_at")
  updatedAt           DateTime        @updatedAt @map("updated_at")
  aiAnalysis          AiAnalysis?
  dispatchOrder       DispatchOrder?
  activityLogs        CitizenActivityLog[]

  @@map("complaints")
}

model SeverityWeightVersion {
  id              Int         @id @default(autoincrement())
  computedAt      DateTime    @default(now()) @map("computed_at")
  weights         Json        // e.g., {"volume": 0.35, "hazard": 0.30, "proximity": 0.20, "age": 0.15}
  method          String      @default("FIXED_EXPERT")
  complaintCount  Int?        @map("complaint_count")
  activeUntil     DateTime?   @map("active_until")
  aiAnalyses      AiAnalysis[]

  @@map("severity_weight_versions")
}

model AiAnalysis {
  id                      String                @id @default(uuid())
  complaintId             String                @unique @map("complaint_id")
  complaint               Complaint             @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  wasteClasses            Json                  @map("waste_classes") // ["Plastic", "Organic"]
  volumeM3                Float?                @map("volume_m3")
  volumeConfidence        VolumeConfidence?     @default(LOW) @map("volume_confidence")
  volumeMethod            VolumeMethod?         @map("volume_method")
  severityScore           Float?                @map("severity_score")
  severityWeightVersionId Int?                  @map("severity_weight_version_id")
  severityWeightVersion   SeverityWeightVersion? @relation(fields: [severityWeightVersionId], references: [id])
  hazardFlags             Json?                 @map("hazard_flags")
  logisticsTier           Int?                  @map("logistics_tier")
  // image_embedding stored via raw SQL (Prisma doesn't natively support vector type)
  analyzedAt              DateTime              @default(now()) @map("analyzed_at")

  @@map("ai_analysis")
}

model DispatchOrder {
  id              String        @id @default(uuid())
  complaintId     String        @unique @map("complaint_id")
  complaint       Complaint     @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  crewId          String?       @map("crew_id")
  crew            User?         @relation("CrewDispatches", fields: [crewId], references: [id], onDelete: SetNull)
  vehicle         VehicleClass
  ppeRequired     Json?         @map("ppe_required")
  beforePhotoUrl  String?       @map("before_photo_url")
  afterPhotoUrl   String?       @map("after_photo_url")
  citizenRating   Int?          @map("citizen_rating")
  resolvedAt      DateTime?     @map("resolved_at")
  createdAt       DateTime      @default(now()) @map("created_at")

  @@map("dispatch_orders")
}

model CitizenActivityLog {
  id               String     @id @default(uuid())
  citizenId        String     @map("citizen_id")
  citizen          User       @relation(fields: [citizenId], references: [id], onDelete: Cascade)
  action           String     // 'SUBMIT', 'UPVOTE', 'VERIFY', 'DISPUTE_DEDUP'
  complaintId      String?    @map("complaint_id")
  complaint        Complaint? @relation(fields: [complaintId], references: [id])
  ipAddress        String?    @map("ip_address")
  deviceFingerprint String?   @map("device_fingerprint")
  flagged          Boolean    @default(false)
  flagReason       String?    @map("flag_reason")
  createdAt        DateTime   @default(now()) @map("created_at")

  @@map("citizen_activity_log")
}
```

- [ ] **Step 5: Run migration**
```bash
cp ../.env .env
npx prisma migrate dev --name init
```
Expected: Tables created in Supabase. Check the Supabase dashboard Table Editor.

- [ ] **Step 6: Add PostGIS column + pgvector column + indexes via raw SQL migration**

Prisma doesn't support the `geography` type or `vector(768)` natively. Create a manual SQL migration:

```bash
npx prisma migrate dev --name add_geo_vector --create-only
```

Then edit the generated migration file to add:
```sql
-- Convert lat/lng to PostGIS geography column
ALTER TABLE complaints ADD COLUMN location GEOGRAPHY(Point, 4326);

-- Add vector column for image embeddings
ALTER TABLE ai_analysis ADD COLUMN image_embedding vector(768);

-- Add spatial index
CREATE INDEX idx_complaints_location ON complaints USING GIST (location);

-- Add HNSW vector index
CREATE INDEX idx_ai_analysis_embedding ON ai_analysis USING hnsw (image_embedding vector_cosine_ops);

-- Add performance indexes
CREATE INDEX idx_complaints_status ON complaints (status);
CREATE INDEX idx_complaints_citizen ON complaints (citizen_id);
CREATE INDEX idx_ai_analysis_severity ON ai_analysis (severity_score DESC);
CREATE INDEX idx_activity_citizen_time ON citizen_activity_log (citizen_id, created_at);
```

Then apply:
```bash
npx prisma migrate dev
```

- [ ] **Step 7: Seed initial data**
Create `backend-api/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed initial severity weight version (expert-tuned fixed weights)
  await prisma.severityWeightVersion.create({
    data: {
      weights: { volume: 0.35, hazard: 0.30, proximity: 0.20, age: 0.15 },
      method: 'FIXED_EXPERT',
      complaintCount: 0,
    },
  });

  console.log('Seeded severity_weight_versions with FIXED_EXPERT weights.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
"prisma": { "seed": "ts-node prisma/seed.ts" }
```

Run:
```bash
npm install -D ts-node
npx prisma db seed
```

- [ ] **Step 8: Verify NestJS starts**
```bash
npm run start:dev
```
Expected: Server running on `http://localhost:3000`. Visit the URL and see a response.

- [ ] **Step 9: Commit**
```bash
git add backend-api/
git commit -m "feat: scaffold NestJS API with Prisma schema and Supabase connection"
```

---

### Task 1.4: Scaffold Python AI Microservice

**Files:**
- Create: `ai-service/main.py`
- Create: `ai-service/tasks.py`
- Create: `ai-service/requirements.txt`
- Create: `ai-service/requirements-cpu.txt`
- Create: `ai-service/.env.example`

**Produces:** A running FastAPI server on `localhost:8000` with a health endpoint.

- [ ] **Step 1: Create directory structure**
```bash
mkdir ai-service
mkdir ai-service/weights
```

- [ ] **Step 2: Create `ai-service/requirements.txt` (GPU)**
```txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
celery[redis]==5.4.0
redis==5.0.0
sqlalchemy==2.0.30
psycopg2-binary==2.9.9
pgvector==0.3.0
python-dotenv==1.0.1
httpx==0.27.0
ultralytics==8.2.0
torch==2.3.0
torchvision==0.18.0
transformers==4.42.0
Pillow==10.3.0
numpy==1.26.4
```

- [ ] **Step 3: Create `ai-service/requirements-cpu.txt`**
Same as above but replace `torch` and `torchvision` with CPU-only versions:
```txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
celery[redis]==5.4.0
redis==5.0.0
sqlalchemy==2.0.30
psycopg2-binary==2.9.9
pgvector==0.3.0
python-dotenv==1.0.1
httpx==0.27.0
ultralytics==8.2.0
torch==2.3.0+cpu
torchvision==0.18.0+cpu
transformers==4.42.0
Pillow==10.3.0
numpy==1.26.4
onnxruntime==1.18.0
```

- [ ] **Step 4: Create `ai-service/main.py`**
```python
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Ellipse AI Service", version="0.1.0")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-service"}
```

- [ ] **Step 5: Create `ai-service/tasks.py`** (Celery stub)
```python
import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

celery_app = Celery(
    "ellipse_ai",
    broker=os.getenv("REDIS_URL"),
    backend=os.getenv("REDIS_URL"),
)

@celery_app.task(name="process_waste_image")
def process_waste_image(complaint_id: str, image_url: str):
    """Stub task — will be implemented in Phase 3."""
    print(f"Processing complaint {complaint_id} from {image_url}")
    return {"status": "processed", "complaint_id": complaint_id}
```

- [ ] **Step 6: Create Python virtual environment and install**
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements-cpu.txt
```

- [ ] **Step 7: Verify FastAPI starts**
```bash
uvicorn main:app --reload --port 8000
```
Expected: `http://localhost:8000/health` returns `{"status": "ok"}`.

- [ ] **Step 8: Commit**
```bash
git add ai-service/
git commit -m "feat: scaffold FastAPI AI microservice with Celery stub"
```

---

### Task 1.5: Scaffold Next.js Web Dashboard

**Files:**
- Create: `web-dashboard/` (entire Next.js project)

**Produces:** A running Next.js app on `localhost:3001`.

- [ ] **Step 1: Scaffold Next.js project**
```bash
cd C:\Users\aarya\Desktop\Ellipse
npx -y create-next-app@latest web-dashboard --typescript --tailwind --eslint --app --src-dir --no-import-alias --skip-git
```

- [ ] **Step 2: Install dependencies**
```bash
cd web-dashboard
npm install @tanstack/react-query zustand axios socket.io-client react-map-gl mapbox-gl lucide-react
npm install -D tailwindcss-animate @types/mapbox-gl
```

- [ ] **Step 3: Install shadcn/ui**
```bash
npx -y shadcn@latest init
```
Select: dark theme, neutral base color, CSS variables = yes.

- [ ] **Step 4: Update `tailwind.config.ts` with Ellipse tokens**
Add the Ellipse color tokens (lime, teal, forest, severity) and font families (Philosopher serif, Inter sans, JetBrains Mono) as defined in [2_Design_Guidelines.md](file:///C:/Users/aarya/Desktop/Ellipse/app-plans/2_Design_Guidelines.md) Section 2 and [3_Frontend_Guidelines.md](file:///C:/Users/aarya/Desktop/Ellipse/app-plans/3_Frontend_Guidelines.md) Part B Section 2.

- [ ] **Step 5: Create `.env.example`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

- [ ] **Step 6: Verify it starts on port 3001**
```bash
npm run dev -- -p 3001
```

- [ ] **Step 7: Commit**
```bash
git add web-dashboard/
git commit -m "feat: scaffold Next.js dashboard with Tailwind and Ellipse theme"
```

---

### Task 1.6: Scaffold Expo Mobile App

**Files:**
- Create: `mobile-app/` (entire Expo project)

**Produces:** A running Expo app launchable via QR code.

- [ ] **Step 1: Scaffold Expo project**
```bash
cd C:\Users\aarya\Desktop\Ellipse
npx -y create-expo-app@latest mobile-app --template tabs
```

- [ ] **Step 2: Install dependencies**
```bash
cd mobile-app
npx expo install expo-camera expo-location expo-font expo-secure-store expo-image-picker
npm install zustand axios react-native-maps @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler lucide-react-native
```

- [ ] **Step 3: Create theme files**
Create `src/theme/colors.ts`, `src/theme/typography.ts`, `src/theme/spacing.ts` with values from [2_Design_Guidelines.md](file:///C:/Users/aarya/Desktop/Ellipse/app-plans/2_Design_Guidelines.md).

Example `colors.ts`:
```typescript
export const colors = {
  lime: '#E3EF26',
  limeMuted: '#B8C41E',
  teal: '#076653',
  tealLight: '#0A8A72',
  forest: '#0C342C',
  midnight: '#061F1A',
  surface: '#0F3D33',
  surfaceElevated: '#134A3E',
  white: '#FFFFFF',
  gray100: '#F0F0F0',
  gray200: '#B0B0B0',
  gray800: '#1A1A1A',
  severityCritical: '#FF4D4D',
  severityModerate: '#FF9F43',
  severityLow: '#FECA57',
  resolved: '#2ED573',
  info: '#54A0FF',
} as const;
```

- [ ] **Step 4: Load Philosopher font**
Download Philosopher from Google Fonts, place in `assets/fonts/`, then load in `app/_layout.tsx`:
```typescript
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'Philosopher-Regular': require('../assets/fonts/Philosopher-Regular.ttf'),
  'Philosopher-Bold': require('../assets/fonts/Philosopher-Bold.ttf'),
  'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
  'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
});
```

- [ ] **Step 5: Create `.env.example`**
```env
API_URL=http://localhost:3000/api/v1
```

- [ ] **Step 6: Verify it starts**
```bash
npx expo start
```
Scan QR code with Expo Go on your phone.

- [ ] **Step 7: Commit**
```bash
git add mobile-app/
git commit -m "feat: scaffold Expo mobile app with Ellipse theme and fonts"
```

---

### Task 1.7: Verify Full Stack Connectivity

- [ ] **Step 1: Start all services**
  - Terminal 1: `cd backend-api && npm run start:dev` (port 3000)
  - Terminal 2: `cd ai-service && uvicorn main:app --reload --port 8000` (port 8000)
  - Terminal 3: `cd web-dashboard && npm run dev -- -p 3001` (port 3001)
  - Terminal 4: `cd mobile-app && npx expo start` (port 8081)

- [ ] **Step 2: Verify API → Supabase connection**
Create a quick test endpoint in NestJS that reads from the database:
```typescript
@Get('health/db')
async healthDb() {
  const count = await this.prisma.user.count();
  return { db: 'connected', userCount: count };
}
```
Visit `http://localhost:3000/health/db` — should return `{"db":"connected","userCount":0}`.

- [ ] **Step 3: Verify API → Upstash Redis connection**
Test BullMQ connection by creating and checking a simple queue ping.

- [ ] **Step 4: Commit final verification**
```bash
git add .
git commit -m "feat: verify full-stack connectivity (API ↔ Supabase ↔ Redis)"
```

---

## Phase 2: Core API & Citizen Mobile App Base
*Sprint 2 — 2 weeks. Goal: Citizens can sign up, log in, capture a photo, and submit a complaint to the API.*

---

### Task 2.1: Auth Module (JWT + RBAC)

**Files:**
- Create: `backend-api/src/auth/auth.module.ts`
- Create: `backend-api/src/auth/auth.service.ts`
- Create: `backend-api/src/auth/auth.controller.ts`
- Create: `backend-api/src/auth/jwt.strategy.ts`
- Create: `backend-api/src/auth/roles.guard.ts`
- Create: `backend-api/src/auth/roles.decorator.ts`

**Produces:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/send-otp`, `POST /api/v1/auth/verify-otp` endpoints. JWT issued on login, RBAC guard that checks user role.

- [ ] **Step 1: Create `PrismaModule` and `PrismaService` for DI**
- [ ] **Step 2: Create `AuthService` with OTP generation (6-digit random, stored in Redis with 2-min TTL)**
- [ ] **Step 3: Create `JwtStrategy` (passport-jwt) that extracts user from JWT payload**
- [ ] **Step 4: Create `RolesGuard` and `@Roles()` decorator for RBAC**
- [ ] **Step 5: Create `AuthController` with register/login/send-otp/verify-otp endpoints**
- [ ] **Step 6: Test — register a user, get JWT, access a protected endpoint**
- [ ] **Step 7: Commit**
```bash
git commit -m "feat: implement JWT auth with OTP and RBAC guard"
```

---

### Task 2.2: Complaint CRUD & Photo Upload

**Files:**
- Create: `backend-api/src/complaints/complaints.module.ts`
- Create: `backend-api/src/complaints/complaints.service.ts`
- Create: `backend-api/src/complaints/complaints.controller.ts`
- Create: `backend-api/src/storage/storage.service.ts`

**Produces:** `POST /api/v1/citizen/complaints` (multipart upload), `GET /api/v1/citizen/complaints` (user history). Photo stored in Supabase Storage. `StorageService` abstracted behind an interface.

- [ ] **Step 1: Create `StorageService` interface**
```typescript
export interface IStorageService {
  uploadPhoto(file: Buffer, filename: string): Promise<string>; // Returns public URL
  getSignedUrl(path: string): Promise<string>;
}
```
- [ ] **Step 2: Implement `SupabaseStorageService` using `@supabase/supabase-js` (ONLY for Storage, not DB)**
- [ ] **Step 3: Create `ComplaintsService` with `submit()` and `findByUser()` methods**
- [ ] **Step 4: Create `ComplaintsController` with multipart upload handling**
- [ ] **Step 5: Wire up BullMQ to enqueue `process_waste_image` job after complaint creation**
- [ ] **Step 6: Test — submit a complaint via Postman/curl, verify photo in Supabase Storage and record in DB**
- [ ] **Step 7: Commit**
```bash
git commit -m "feat: complaint submission with photo upload and BullMQ queue"
```

---

### Task 2.3: Rate Limiting & Anti-Fraud Middleware

**Files:**
- Create: `backend-api/src/common/guards/rate-limit.guard.ts`
- Create: `backend-api/src/common/guards/anti-fraud.guard.ts`

**Produces:** Middleware that enforces: max 10 submissions/day, 5-min cooldown, GPS consistency check, EXIF timestamp validation. All violations logged to `citizen_activity_log`.

- [ ] **Step 1: Implement rate-limit guard using Redis counters (per user per day)**
- [ ] **Step 2: Implement cooldown check (5 minutes between submissions)**
- [ ] **Step 3: Implement GPS consistency check (phone GPS vs payload GPS < 500m)**
- [ ] **Step 4: Implement EXIF timestamp validation (must be < 30 minutes old)**
- [ ] **Step 5: Log violations to `citizen_activity_log` table**
- [ ] **Step 6: Test — trigger each violation and verify 429/422 responses + DB logs**
- [ ] **Step 7: Commit**
```bash
git commit -m "feat: rate limiting and anti-fraud middleware with activity logging"
```

---

### Task 2.4: Mobile App — Auth Screens

**Files:**
- Create: `mobile-app/app/(auth)/login.tsx`
- Create: `mobile-app/app/(auth)/otp.tsx`
- Create: `mobile-app/app/onboarding.tsx`
- Create: `mobile-app/src/stores/auth.store.ts`
- Create: `mobile-app/src/services/api.ts`
- Create: `mobile-app/src/services/auth.service.ts`

**Produces:** Splash → Onboarding (first launch) → Login → OTP → Home. JWT stored in `expo-secure-store`.

- [ ] **Step 1: Build Splash screen with Gradient 3 logo animation**
- [ ] **Step 2: Build 3-slide Onboarding with "Skip" and "Get Started" buttons**
- [ ] **Step 3: Build Login screen (phone number input, "Send OTP" button)**
- [ ] **Step 4: Build OTP screen (6-digit input, auto-submit, "Resend" after 2 min)**
- [ ] **Step 5: Create `auth.store.ts` (Zustand) with login/logout/token state**
- [ ] **Step 6: Create `api.ts` (Axios instance with JWT interceptor)**
- [ ] **Step 7: Create `auth.service.ts` wrapping the auth API endpoints**
- [ ] **Step 8: Test on phone — full login flow from splash to home**
- [ ] **Step 9: Commit**
```bash
git commit -m "feat: mobile auth screens (splash, onboarding, login, OTP)"
```

---

### Task 2.5: Mobile App — Camera & Submission Flow

**Files:**
- Create: `mobile-app/app/camera.tsx`
- Create: `mobile-app/app/review.tsx`
- Create: `mobile-app/src/components/complaint/SizeEstimatePicker.tsx`
- Create: `mobile-app/src/services/complaint.service.ts`
- Create: `mobile-app/src/hooks/useCamera.ts`
- Create: `mobile-app/src/hooks/useLocation.ts`

**Produces:** Camera capture (no gallery) → Review screen with GPS pin + size picker → Submit → Success. Entire citizen submission loop working end-to-end.

- [ ] **Step 1: Create `useCamera` hook (permission request, capture-only mode)**
- [ ] **Step 2: Create `useLocation` hook (GPS lock indicator, compass heading)**
- [ ] **Step 3: Build Camera screen with blur detection warning and GPS lock indicator**
- [ ] **Step 4: Build `SizeEstimatePicker` component (4 illustrated options)**
- [ ] **Step 5: Build Review screen (photo preview, mini-map, size picker, submit button)**
- [ ] **Step 6: Create `complaint.service.ts` (submit, fetch history, upvote)**
- [ ] **Step 7: Handle API responses: 201 → Success, 409 → Dedup, 429 → Rate limit modal**
- [ ] **Step 8: Build Success screen with animated checkmark**
- [ ] **Step 9: Test on phone — full flow: Camera → Review → Submit → Success → verify in Supabase**
- [ ] **Step 10: Commit**
```bash
git commit -m "feat: mobile camera capture and complaint submission flow"
```

---

## Phase 3a: AI Pipeline — Segmentation
*Sprint 3a — 2 weeks. Goal: YOLO classifies waste, assigns tier, updates complaint to AI_TRIAGED.*

---

### Task 3a.1: YOLO Training Script (Run on College 4090)

**Files:**
- Create: `ai-service/training/train_yolo.py`
- Create: `ai-service/training/data.yaml`

**Produces:** Trained `best.pt` weights file ready for inference.

- [ ] **Step 1: Download and prepare TACO dataset**
- [ ] **Step 2: Convert annotations to YOLO polygon format**
- [ ] **Step 3: Create `data.yaml` with class mapping**
- [ ] **Step 4: Write `train_yolo.py` training script**
```python
from ultralytics import YOLO

model = YOLO('yolo11m-seg.pt')
results = model.train(
    data='data.yaml',
    epochs=100,
    imgsz=640,
    batch=64,    # RTX 4090 can handle this
    device=0,
    project='runs/segment',
    name='ellipse-waste',
)
```
- [ ] **Step 5: Run on college PC, validate mAP@50 > 0.65**
- [ ] **Step 6: Copy `best.pt` to `ai-service/weights/`**
- [ ] **Step 7: Commit** (weights are gitignored, only the training script is committed)
```bash
git commit -m "feat: YOLO11-seg training script and dataset config"
```

---

### Task 3a.2: AI Worker — Segmentation + Rule-Based Tiering

**Files:**
- Modify: `ai-service/tasks.py`
- Create: `ai-service/inference/segmentation.py`
- Create: `ai-service/inference/tiering.py`

**Produces:** Celery task that loads YOLO, classifies waste, assigns tier, writes results to DB, sends webhook to Node API.

- [ ] **Step 1: Implement `segmentation.py` — load YOLO model, run inference, return class labels + bounding box area ratio**
- [ ] **Step 2: Implement `tiering.py` — map (bbox_area_ratio, citizen_size_pick) to logistics tier 1–4**
- [ ] **Step 3: Update `tasks.py` to call segmentation + tiering, write results to `ai_analysis` table via SQLAlchemy**
- [ ] **Step 4: Send webhook to Node API: `PATCH /internal/complaints/{id}/ai-results`**
- [ ] **Step 5: Test end-to-end — submit complaint → Redis → Celery → YOLO → DB update → webhook**
- [ ] **Step 6: Commit**
```bash
git commit -m "feat: YOLO segmentation worker with rule-based tiering"
```

---

### Task 3a.3: Internal Webhook Endpoint (Node API)

**Files:**
- Create: `backend-api/src/internal/internal.module.ts`
- Create: `backend-api/src/internal/internal.controller.ts`

**Produces:** `PATCH /api/v1/internal/complaints/{id}/ai-results` that updates complaint status to `AI_TRIAGED` and broadcasts via Socket.IO.

- [ ] **Step 1: Create `InternalController` guarded by `AI_SERVICE_SECRET` header check**
- [ ] **Step 2: Update complaint status to `AI_TRIAGED` and insert `ai_analysis` record**
- [ ] **Step 3: Broadcast `complaint_triaged` event via Socket.IO**
- [ ] **Step 4: Test — call webhook manually, verify DB update and WebSocket event**
- [ ] **Step 5: Commit**
```bash
git commit -m "feat: internal webhook for AI results with WebSocket broadcast"
```

---

## Phase 3b: Dedup & Severity Scoring
*Sprint 3b — 2 weeks. Goal: Image dedup with three-band system. Fixed-weight severity scoring.*

---

### Task 3b.1: DINOv2 Embedding Extraction

**Files:**
- Create: `ai-service/inference/embeddings.py`
- Modify: `ai-service/tasks.py`

**Produces:** 768-D vector extracted from each complaint image and stored in pgvector.

- [ ] **Step 1: Implement `embeddings.py` — load DINOv2, extract 768-D vector, normalize**
- [ ] **Step 2: Update Celery task to call embeddings after segmentation**
- [ ] **Step 3: Store embedding in `ai_analysis.image_embedding` via raw SQL (pgvector)**
- [ ] **Step 4: Test — verify vector stored correctly and queryable**
- [ ] **Step 5: Commit**
```bash
git commit -m "feat: DINOv2 embedding extraction and pgvector storage"
```

---

### Task 3b.2: Three-Band Deduplication

**Files:**
- Create: `ai-service/inference/dedup.py`
- Modify: `ai-service/tasks.py`

**Produces:** Spatial + visual dedup. Auto-merge > 0.90, flag 0.70–0.90, separate < 0.70.

- [ ] **Step 1: Implement spatial pre-filter (PostGIS: 50m radius, 48h window)**
- [ ] **Step 2: Implement cosine similarity query against pgvector**
- [ ] **Step 3: Implement three-band logic with DB updates (parent_complaint_id, dedup_similarity, status = DUPLICATE)**
- [ ] **Step 4: Push `dedup_review_needed` event for 0.70–0.90 band**
- [ ] **Step 5: Test with known duplicate images and known different images**
- [ ] **Step 6: Commit**
```bash
git commit -m "feat: three-band deduplication (auto-merge, review, separate)"
```

---

### Task 3b.3: Simple Severity Scoring

**Files:**
- Create: `ai-service/inference/severity.py`
- Modify: `ai-service/tasks.py`
- Create: `backend-api/src/complaints/severity-explain.controller.ts`

**Produces:** Fixed-weight severity score (0.0–1.0) stored with weight version ID. Explain endpoint.

- [ ] **Step 1: Implement `severity.py` — fetch active weights from `severity_weight_versions`, compute weighted sum**
- [ ] **Step 2: Normalize inputs (volume tier → 0–1, hazard count, proximity, age)**
- [ ] **Step 3: Store score + weight_version_id in `ai_analysis`**
- [ ] **Step 4: Create `GET /api/v1/authority/complaints/{id}/severity-explain` endpoint**
- [ ] **Step 5: Test — verify score is reproducible given same inputs and weight version**
- [ ] **Step 6: Commit**
```bash
git commit -m "feat: fixed-weight severity scoring with explain endpoint"
```

---

## Phase 4: Web Dashboard & GIS
*Sprint 4 — 2 weeks. Goal: Authority dashboard with live map, triage list, dispatch, dedup review.*

---

### Task 4.1: Dashboard Layout & Sidebar

**Files:**
- Create: `web-dashboard/src/components/layout/Sidebar.tsx`
- Create: `web-dashboard/src/components/layout/TopBar.tsx`
- Modify: `web-dashboard/src/app/layout.tsx`
- Create: `web-dashboard/src/app/login/page.tsx`

**Produces:** Dark-themed dashboard shell with sidebar navigation, login page.

- [ ] **Step 1: Create login page with Ellipse branding**
- [ ] **Step 2: Create Sidebar with nav items (Dashboard, Triage, Dedup Review, Crews, Analytics)**
- [ ] **Step 3: Create TopBar with user info and logout**
- [ ] **Step 4: Apply Gradient 3 dark theme to root layout**
- [ ] **Step 5: Commit**

---

### Task 4.2: GIS Map with Live Complaints

**Files:**
- Create: `web-dashboard/src/components/map/DashboardMap.tsx`
- Create: `web-dashboard/src/components/map/ComplaintCluster.tsx`
- Create: `web-dashboard/src/hooks/useSocket.ts`
- Modify: `web-dashboard/src/app/page.tsx`

**Produces:** Full-screen Mapbox GL map with color-coded complaint pins, live WebSocket updates.

- [ ] **Step 1: Integrate React Map GL with custom dark Mapbox style**
- [ ] **Step 2: Fetch complaints as GeoJSON from `GET /authority/complaints/heatmap`**
- [ ] **Step 3: Render color-coded pins (Red/Orange/Yellow/Green by severity)**
- [ ] **Step 4: Implement Socket.IO client to receive `complaint_triaged` events**
- [ ] **Step 5: Auto-add new pins to map when WebSocket event fires**
- [ ] **Step 6: Commit**

---

### Task 4.3: Triage List & Dispatch UI

**Files:**
- Create: `web-dashboard/src/app/triage/page.tsx`
- Create: `web-dashboard/src/components/dispatch/DispatchModal.tsx`
- Create: `web-dashboard/src/components/complaint/SeverityExplainer.tsx`

**Produces:** Sortable triage table, dispatch modal, severity explanation.

- [ ] **Step 1: Build triage table with TanStack Query (sortable by severity, filterable by ward)**
- [ ] **Step 2: Build complaint detail slide-over panel (photo, AI analysis, timeline)**
- [ ] **Step 3: Build `DispatchModal` (crew selector, vehicle type, PPE checklist)**
- [ ] **Step 4: Build `SeverityExplainer` modal showing weight breakdown**
- [ ] **Step 5: Commit**

---

### Task 4.4: Dedup Review Panel

**Files:**
- Create: `web-dashboard/src/app/dedup-review/page.tsx`
- Create: `web-dashboard/src/components/complaint/DedupCompare.tsx`

**Produces:** Side-by-side image comparison with Merge/Separate buttons.

- [ ] **Step 1: Fetch dedup review queue from `GET /authority/dedup-reviews`**
- [ ] **Step 2: Build side-by-side comparison view (images, similarity badge, map with both pins)**
- [ ] **Step 3: Wire up Merge/Separate decision to `POST /authority/dedup-reviews/{id}/decide`**
- [ ] **Step 4: Commit**

---

## Phase 5: Mobile Polish & Gamification
*Sprint 5 — 2 weeks. Goal: Offline support, push notifications, credits, leaderboard.*

---

### Task 5.1: Mobile — Home Screen (Map View)

**Produces:** Full-screen map with nearby complaint pins, bottom sheet with complaint list, FAB for camera.

- [ ] **Step 1: Integrate `react-native-maps` with dark Mapbox style**
- [ ] **Step 2: Fetch nearby complaints and render color-coded pins**
- [ ] **Step 3: Build bottom sheet with complaint list (thumbnail, status, distance)**
- [ ] **Step 4: Add FAB button (lime, camera icon) → Camera screen**
- [ ] **Step 5: Commit**

---

### Task 5.2: Mobile — Complaint Detail & Status Timeline

**Produces:** Complaint detail screen with status timeline, AI analysis card, verify/dispute actions.

- [ ] **Step 1: Build `StatusTimeline` component (vertical timeline with checkmarks)**
- [ ] **Step 2: Build `AIAnalysisCard` (waste types, tier, severity with "Why?" link)**
- [ ] **Step 3: Conditionally show "Verify & Rate" (if RESOLVED) or "Dispute" (if DUPLICATE)**
- [ ] **Step 4: Build Verify Resolution screen (before/after comparison, star rating)**
- [ ] **Step 5: Build Dispute Merge screen (side-by-side, reason field)**
- [ ] **Step 6: Commit**

---

### Task 5.3: Mobile — Profile, Credits & Leaderboard

**Produces:** Profile screen with My Reports tab, Credits tab (with breakdown), Leaderboard tab.

- [ ] **Step 1: Build profile header card (name, ward, member since)**
- [ ] **Step 2: Build My Reports tab (complaint list with status badges)**
- [ ] **Step 3: Build Credits tab (total, breakdown by type)**
- [ ] **Step 4: Build Leaderboard tab (top 10 citizens by credits in user's ward)**
- [ ] **Step 5: Implement anti-abuse credit rules (0 on submit, credits only after AI confirms real waste)**
- [ ] **Step 6: Commit**

---

### Task 5.4: Mobile — Push Notifications & Offline Caching

**Produces:** Push notifications for status changes. Offline-first with WatermelonDB.

- [ ] **Step 1: Integrate Expo push notifications (register token, store on backend)**
- [ ] **Step 2: Send notifications on status changes (DISPATCHED, RESOLVED)**
- [ ] **Step 3: Set up WatermelonDB for complaint caching**
- [ ] **Step 4: Implement offline submission queue (cache locally, sync when online)**
- [ ] **Step 5: Commit**

---

## Phase 6: Field Testing & Deployment
*Sprint 6 — 2 weeks. Goal: Deploy all services. End-to-end field test.*

---

### Task 6.1: Field Crew Resolution Flow

**Produces:** Field crew "After" photo capture with PPE checklist on mobile. `POST /authority/complaints/{id}/resolve` endpoint.

- [ ] **Step 1: Build crew role detection (based on JWT role)**
- [ ] **Step 2: Build after-photo capture screen with PPE checklist acknowledgment**
- [ ] **Step 3: Create resolve endpoint on backend**
- [ ] **Step 4: Trigger push notification to original citizen: "Your report has been resolved!"**
- [ ] **Step 5: Commit**

---

### Task 6.2: Deployment

- [ ] **Step 1: Deploy NestJS API to Render or Railway (free tier)**
- [ ] **Step 2: Deploy Next.js dashboard to Vercel (free tier)**
- [ ] **Step 3: Deploy AI service to RunPod or similar GPU provider (or CPU fallback on Railway)**
- [ ] **Step 4: Update all `.env` files with production URLs**
- [ ] **Step 5: Build Expo APK/AAB using EAS Build (cloud, no local Android Studio needed)**
```bash
cd mobile-app
npx eas build --platform android --profile preview
```
- [ ] **Step 6: End-to-end field test — Citizen submits → AI processes → Dashboard sees → Crew dispatched → Citizen verifies**
- [ ] **Step 7: Commit and tag release**
```bash
git tag v1.0.0-beta
git push origin main --tags
```

---

## Phase 7 & 8: Post-MVP (After Field Data)
*Sprints 7–8. Only after 200+ field reports with ground truth data.*

### Task 7.1: Volume Calibration (Sprint 7)
- [ ] ARCore/ARKit hardware depth integration
- [ ] Ground-truth collection (50+ tape-measured piles)
- [ ] Monocular depth calibration layer training
- [ ] Go/No-Go gate: MAE < 30% → deploy, else stay on Layers 1+2

### Task 8.1: EWM-TOPSIS Advanced Scoring (Sprint 8)
- [ ] EWM weight computation batch job
- [ ] A/B test vs fixed weights
- [ ] Ward analytics dashboards
- [ ] Go/No-Go gate: only adopt if dispatch outcomes measurably improve
