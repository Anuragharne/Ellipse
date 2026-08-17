# 2. Complete Technology Stack & Tooling Guidelines

## 1. Mobile App (Citizen Interface)
* **Framework:** **React Native (with Expo)**. It enables rapid cross-platform development (iOS/Android) and unifies the frontend team's TypeScript ecosystem.
* **State Management:** **Zustand** or **Redux Toolkit** (lighter is better for mobile).
* **Offline-First DB:** **WatermelonDB**. Excellent for caching queued reports when the citizen is out of network coverage and auto-syncing upon reconnection.
* **Camera & Media:** `expo-camera` with built-in frame validation heuristics (e.g., detecting blur before snapping).
* **Geolocation:** `expo-location` for high-precision GPS extraction and compass heading.

## 2. Web Dashboard (Authority Command Center)
* **Framework:** **Next.js (React)**. Optimal for SSR if needed, and extremely robust for building a large-scale operational portal.
* **UI Component Library:** **shadcn/ui** with **Tailwind CSS**. Provides a premium, highly-customizable aesthetic without the bloat of traditional component libraries.
* **GIS Mapping Library:** **React Map GL** wrapping **Mapbox GL JS**. Essential for rendering thousands of color-coded heatmaps and cluster pins smoothly using WebGL.
* **State Management:** **Zustand** (for map state) and **React Query** (for API polling/caching).

## 3. Backend & Real-time Layer
* **Main Server Runtime:** **Node.js (Express or NestJS)**. Recommended: NestJS for its strict enterprise architecture and built-in WebSocket support.
* **Real-Time Implementation:** **Socket.IO** or native **ws**. Used to push live triage updates and crew locations to the municipal dashboard.
* **Task Queue / Broker:** **Redis**.
  * On the Node.js side: **BullMQ** to push jobs.
  * On the Python side: **Celery** to consume jobs, or a lightweight Redis worker polling the queue.

## 4. Shared Database Layer
* **Core DB:** **PostgreSQL (v15+)**.
* **Spatial Extension:** **PostGIS**. Handles the `50m radius` queries, ward boundaries, and geographic routing.
* **Vector Extension:** **pgvector**. Stores and queries high-dimensional visual embeddings (e.g., 768-D vectors) to deduplicate images using cosine similarity.
* **ORM:** **Prisma** (Node.js) and **SQLAlchemy** (Python).

## 5. AI / CV Frameworks (Microservice)
* **Microservice Framework:** **FastAPI (Python)**. Ideal for ML workloads due to asynchronous support and high performance.
* **Instance Segmentation:** **YOLOv8-seg** or **YOLO11-seg** (Ultralytics). Extremely fast, permissible open-source licenses, great at multi-class object boundaries.
* **Monocular Depth Estimation:** **Depth Anything V2**. State-of-the-art zero-shot metric depth estimation.
* **Visual Embeddings:** **DINOv2** (Meta) or **OpenAI CLIP (ViT-B/32)**. Best for extracting semantic image embeddings to block stock photos and find identical duplicate garbage piles.
