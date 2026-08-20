# 2. Complete Technology Stack & Tooling Guidelines

## 1. Mobile App (Citizen Interface)
* **Framework:** **React Native (with Expo)**. It enables rapid cross-platform development (iOS/Android) and unifies the frontend team's TypeScript ecosystem.
* **State Management:** **Zustand** or **Redux Toolkit** (lighter is better for mobile).
* **Offline-First DB:** **WatermelonDB**. Excellent for caching queued reports when the citizen is out of network coverage and auto-syncing upon reconnection.
* **Camera & Media:** `expo-camera` with built-in frame validation heuristics (e.g., detecting blur before snapping). Capture-only mode — no gallery picks to prevent fraud.
* **Geolocation:** `expo-location` for high-precision GPS extraction and compass heading.

## 2. Web Dashboard (Authority Command Center)
* **Framework:** **Next.js (React)**. Optimal for SSR if needed, and extremely robust for building a large-scale operational portal.
* **UI Component Library:** **shadcn/ui** with **Tailwind CSS**. Provides a premium, highly-customizable aesthetic without the bloat of traditional component libraries.
* **GIS Mapping Library:** **React Map GL** wrapping **MapLibre GL JS**. Essential for rendering thousands of color-coded heatmaps and cluster pins smoothly using WebGL.
* **State Management:** **Zustand** (for map state) and **React Query / TanStack Query** (for API polling/caching).

## 3. Backend & Real-time Layer
* **Main Server Runtime:** **Node.js (NestJS)**. Enterprise architecture with built-in WebSocket support, dependency injection, and modular structure.
* **ORM:** **Prisma**. Type-safe database access via standard `DATABASE_URL` connection string. Keeps the database layer swappable — works identically with Supabase, AWS RDS, Neon, or self-hosted PostgreSQL.
* **Real-Time Implementation:** **Socket.IO**. Pushes live triage updates, crew locations, and dedup review alerts to the municipal dashboard.
* **Task Queue / Broker:** **Upstash Redis** (cloud-hosted, free tier).
  * On the Node.js side: **BullMQ** to push AI processing jobs to the queue.
  * On the Python side: **Celery** to consume and process jobs.

## 4. Database & Storage Layer (Cloud-Hosted, No Docker)
* **Database:** **Supabase** (hosted PostgreSQL v15+). Connected via standard PostgreSQL connection string through Prisma — NOT via the Supabase JS client, to keep the database fully swappable.
* **Spatial Extension:** **PostGIS** (enabled on Supabase via `CREATE EXTENSION postgis`). Handles 50m radius queries, ward boundaries, and geographic routing.
* **Vector Extension:** **pgvector** (enabled on Supabase via `CREATE EXTENSION vector`). Stores and queries 768-dimensional image embeddings for visual deduplication using cosine similarity.
* **Photo Storage:** **Supabase Storage** (1 GB free tier), abstracted behind a `StorageService` interface so it can be swapped to S3/Cloudinary later.
* **Cache / Queue:** **Upstash Redis** (10,000 commands/day free tier). Standard Redis protocol, swappable to any Redis provider.

## 5. AI / CV Frameworks (Python Microservice)
* **Microservice Framework:** **FastAPI (Python)**. Ideal for ML workloads due to asynchronous support and high performance.
* **DB Access (Python side):** **SQLAlchemy** with the same `DATABASE_URL`. Both Node.js (Prisma) and Python (SQLAlchemy) connect to the same Supabase PostgreSQL instance via standard connection strings.
* **Instance Segmentation:** **YOLOv8-seg** or **YOLO11-seg** (Ultralytics). Extremely fast, permissible open-source licenses, great at multi-class object boundaries.
* **Monocular Depth Estimation (V2 only):** **Depth Anything V2**. State-of-the-art zero-shot metric depth estimation. Not used in MVP.
* **Visual Embeddings:** **DINOv2** (Meta) or **OpenAI CLIP (ViT-B/32)**. Best for extracting semantic image embeddings for deduplication and stock photo detection.
