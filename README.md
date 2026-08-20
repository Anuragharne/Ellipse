# Ellipse - AI Waste Response System

A unified monorepo containing:
1. `backend-api/`: NestJS + Prisma central backend API.
2. `web-dashboard/`: Next.js dispatch command center.
3. `mobile-app/`: Expo (React Native) citizen application.
4. `ai-service/`: Python (FastAPI) worker for YOLO11 and DINOv2 inference.

## Architecture
- **Database:** Supabase (PostgreSQL + pgvector + PostGIS).
- **Task Queue:** Upstash Redis + BullMQ.
- **Realtime:** Socket.IO.

## Getting Started
See the `plans/` directory for full system architecture, database schemas, and implementation guides.
