# 7. Phased Implementation Roadmap

This roadmap breaks execution into **8 sprints** (2 weeks each). No Docker required — infrastructure runs on Supabase (database + storage) and Upstash (Redis queue). ML-hard problems (volume calibration, EWM-TOPSIS) are deferred to post-field-data sprints. The MVP ships with classification + rule-based severity — already valuable to dispatchers.

## Sprint 1: Infrastructure, Schema & Project Scaffolding
* **Supabase Setup:** Create project (Mumbai region), enable PostGIS + pgvector extensions, create `complaint-photos` storage bucket.
* **Upstash Setup:** Create Redis database, note connection string.
* **Schema:** Write Prisma schema file matching the DDL in Plan 3. Run `npx prisma migrate dev` to create all tables in Supabase.
* **Insert initial data:** Seed `severity_weight_versions` with expert-tuned fixed weights.
* **Scaffold all services:** NestJS API (with Prisma), FastAPI AI service (with SQLAlchemy), Next.js Web Dashboard, Expo React Native app.
* **Verify:** All 4 services start locally and the API can read/write to Supabase.

## Sprint 2: Core API & Citizen Mobile App Base
* **Backend:** Implement Auth (JWT + RBAC), basic CRUD endpoints for Complaints, and rate-limiting middleware (max 10/day, 5-min cooldown, GPS consistency check).
* **Photo Upload:** Implement `StorageService` interface with Supabase Storage backend. Abstract so it's swappable to S3 later.
* **Mobile App:** Build login/registration screens, camera capture UI (`expo-camera` in capture-only mode — no gallery picks), GPS extraction (`expo-location`), and size picker (Bucket / Handcart / Truck / Heavy Equipment).
* **Anti-Fraud:** Implement EXIF timestamp validation, GPS consistency check, and per-user rate limits. Log violations to `citizen_activity_log`.
* **Integration:** Citizen app successfully submits a complaint (photo + GPS + size estimate) to the API, photo stored in Supabase Storage, record in database.

## Sprint 3a: AI Pipeline — Segmentation Only (No Volume, No Depth)
* **Python Service:** Implement YOLO11-seg instance segmentation. Fine-tune on TACO + custom data.
* **Task Queue:** Connect Node.js BullMQ to Python Celery via Upstash Redis. Verify end-to-end job processing.
* **Rule-Based Tiering:** Assign logistics tiers via bounding-box area ratio + citizen size-picker selection. Store as `volume_method: 'CITIZEN_PICK'`, `volume_confidence: 'LOW'`.
* **Integration:** Photo upload → Redis queue → Celery worker → YOLO classifies waste → tier assigned → complaint updated to `AI_TRIAGED` → webhook to Node API.
* **Validation Gate:** YOLO mAP@50 > 0.65 on held-out test set before proceeding.

## Sprint 3b: Dedup Embeddings & Simple Severity Scoring
* **Python Service:** Implement DINOv2/CLIP embedding extraction. Store 768-D vectors in pgvector.
* **Three-Band Dedup:** Spatial pre-filter (PostGIS: 50m, 48h) + cosine similarity with three bands (<0.70 = separate, 0.70–0.90 = flag for review, >0.90 = auto-merge with citizen notification).
* **Citizen Dispute Flow:** "This is a different pile" button that un-merges and flags for officer review.
* **Simple Severity Scoring:** Fixed-weight formula using expert-tuned weights from `severity_weight_versions`. Implement "Explain Score" API endpoint.
* **Validation Gate:** Test dedup on 100+ manually labeled image pairs. Verify false-merge rate < 2%.

## Sprint 4: Web Dashboard & GIS Real-time Mapping
* **Web App:** Integrate MapLibre GL into Next.js. Render color-coded cluster pins by severity (Red > 0.75, Orange 0.5–0.75, Yellow 0.25–0.5, Green = Resolved).
* **Backend:** Setup Socket.IO for real-time pushing of new AI-triaged complaints.
* **Dashboard Features:** Triage list, dispatch UI, side-by-side dedup review panel (for the 0.70–0.90 band), and "Explain Score" modal.
* **Layer Toggles:** Ward boundaries, historical hotspot heatmap, live complaint clusters.

## Sprint 5: Mobile Polish & Gamification (With Anti-Abuse)
* **Mobile App:** Implement offline-first caching (WatermelonDB), push notifications, ticket lifecycle tracking UI (`LOGGED → AI_TRIAGED → ASSIGNED → DISPATCHED → RESOLVED`).
* **Gamification:** "Clean City Credits" with anti-abuse rules:
  * 0 credits on submission; credits awarded only after AI confirms real waste.
  * Verification credits require a *different* citizen (not the original reporter).
  * Embedding-based self-dedup: reject if > 0.95 similarity to user's own prior submissions.
* **Before vs. After:** Side-by-side verification interface for citizens to confirm and rate cleanup quality.

## Sprint 6: Field Verification, Testing & Initial Deployment
* **Mobile App (Crew Role):** Build field crew "After" photo capture flow with PPE checklist acknowledgment.
* **Deployment:** Deploy Node.js API to Render/Railway, Next.js to Vercel, AI Service to GPU instance (RunPod/EC2 T4) with CPU fallback. Database stays on Supabase.
* **QA:** End-to-end field testing with partner municipality. Verify the entire loop: Citizen → AI → Dashboard → Crew → Citizen.
* **Data Collection:** Begin collecting hardware-depth ground truth on supported devices (ARCore/ARKit).
* **Budget Decision:** Evaluate if Supabase free tier is sufficient or upgrade to Pro ($25/month) based on photo volume.

---

> **Post-MVP Sprints — Only after collecting field data from Sprint 6**

## Sprint 7: Volume Calibration Research Sprint
* **Ground-Truth Collection:** Manually measure 50+ real waste piles with tape measures. Compare against hardware-depth volume and monocular-depth volume.
* **ARCore/ARKit Integration:** Implement hardware depth capture on supported devices. Store as `volume_method: 'ARCORE_LIDAR'`, `volume_confidence: 'HIGH'`.
* **Monocular Calibration:** Train regression calibration layer mapping Depth Anything V2 relative depth to metric depth using hardware-depth ground truth.
* **Publish Error Range:** Report MAE, RMSE, 90th-percentile error.
* **Go/No-Go Gate:** If monocular MAE < 30% → deploy as `MONOCULAR_CALIBRATED` with `volume_confidence: 'MEDIUM'`. If MAE > 30% → keep using Layers 1+2 only.

## Sprint 8: EWM-TOPSIS & Advanced Scoring
* **Prerequisite:** System has 1,000+ resolved complaints with outcome data.
* **EWM Weight Computation:** Implement weekly batch job computing entropy-derived weights. Store in `severity_weight_versions`.
* **A/B Test:** Compare EWM-TOPSIS scores against fixed-weight scores. Measure dispatch outcome quality (resolution time, citizen satisfaction).
* **Go/No-Go Gate:** Only switch to EWM-TOPSIS if it measurably outperforms fixed weights in the A/B test.
* **Ward Analytics:** Implement SLA compliance dashboards, average resolution time tracking, and recurring dump hotspot prediction.
