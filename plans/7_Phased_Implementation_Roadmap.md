# 7. Phased Implementation Roadmap

This roadmap breaks execution into **8 sprints** (2 weeks each). The key change from the original plan: **ML-hard problems (volume calibration, EWM-TOPSIS) are deferred to post-field-data sprints**, not crammed into a single integration sprint. The MVP ships with classification + rule-based severity — already valuable to dispatchers.

## Sprint 1: Infrastructure, Architecture & DB
* Setup monorepo/polyrepo structure with shared TypeScript types.
* Initialize Docker Compose with PostgreSQL (PostGIS + pgvector) and Redis.
* Write full schema definitions (including `severity_weight_versions`, `citizen_activity_log`) and run initial migrations.
* Scaffold all services: NestJS API, FastAPI AI service, Next.js Web Dashboard, Expo React Native app.
* Insert initial `severity_weight_versions` row with expert-tuned fixed weights.

## Sprint 2: Core API & Citizen Mobile App Base
* **Backend:** Implement Auth (JWT + RBAC), basic CRUD endpoints for Complaints, and rate-limiting middleware.
* **Mobile App:** Build login/registration screens, camera capture UI (`expo-camera` in capture-only mode — no gallery picks), and GPS extraction (`expo-location`).
* **Anti-Fraud:** Implement EXIF timestamp validation, GPS consistency check, and per-user rate limits (max 10/day, 5-min cooldown).
* **Integration:** Connect mobile app to Node API to successfully submit a payload (Image + GPS) to the database. Verify the `citizen_activity_log` is populated.

## Sprint 3a: AI Pipeline — Segmentation Only (No Volume, No Depth)
* **Python Service:** Implement YOLO11-seg instance segmentation. Fine-tune on TACO + custom data.
* **Task Queue:** Connect Node.js BullMQ to Python Celery via Redis. Verify end-to-end job processing.
* **Rule-Based Tiering:** Assign logistics tiers via bounding-box area ratio + citizen size-picker selection. Store as `volume_method: 'CITIZEN_PICK'`, `volume_confidence: 'LOW'`.
* **Integration:** Upon photo upload → queue job → YOLO classifies waste type → tier assigned → complaint updated to `AI_TRIAGED` → webhook to Node API.
* **Validation Gate:** YOLO mAP@50 > 0.65 on held-out test set before proceeding.

## Sprint 3b: Dedup Embeddings & Simple Severity Scoring
* **Python Service:** Implement DINOv2/CLIP embedding extraction. Store 768-D vectors in `pgvector`.
* **Three-Band Dedup:** Implement spatial pre-filter (50m, 48h) + cosine similarity with three bands (<0.70 = separate, 0.70–0.90 = flag for review, >0.90 = auto-merge with notification).
* **Citizen Dispute Flow:** Implement "This is a different pile" button that un-merges and flags for officer review.
* **Simple Severity Scoring:** Implement fixed-weight severity formula using expert-tuned weights from `severity_weight_versions`. Implement "Explain Score" API.
* **Validation Gate:** Test dedup on 100+ manually labeled image pairs. Verify false-merge rate.

## Sprint 4: Web Dashboard & GIS Real-time Mapping
* **Web App:** Integrate Mapbox GL into Next.js. Render color-coded cluster pins by severity score (Red = Critical >0.75, Orange = High 0.5–0.75, Yellow = Medium 0.25–0.5, Green = Resolved).
* **Backend:** Setup Socket.IO for real-time pushing of new AI-triaged complaints.
* **Dashboard Features:** Triage list, dispatch UI, side-by-side dedup review panel (for the 0.70–0.90 band), and "Explain Score" modal.
* **Layer Toggles:** Ward boundaries, historical hotspot heatmap, live complaint clusters.

## Sprint 5: Mobile Polish & Gamification (With Anti-Abuse)
* **Mobile App:** Implement offline-first caching (WatermelonDB), push notifications, ticket lifecycle tracking UI (`LOGGED → AI_TRIAGED → ASSIGNED → DISPATCHED → RESOLVED`).
* **Gamification:** Implement "Clean City Credits" ledger with anti-abuse rules:
  * 0 credits on submission; credits awarded only after AI confirms real waste.
  * Verification credits require a *different* citizen (not the reporter).
  * Embedding-based self-dedup: reject if >0.95 similarity to user's own prior submissions.
* **Before vs. After:** Side-by-side verification interface for citizens to confirm and rate cleanup quality.

## Sprint 6: Field Verification, Testing & Initial Deployment
* **Mobile App (Crew Role):** Build field crew "After" photo capture flow with PPE checklist acknowledgment.
* **DevOps:** Containerize all services via Dockerfiles. Write CI/CD pipeline.
* **Deployment:** Deploy DB/API to Render/AWS, Web App to Vercel, AI Service to GPU instance (RunPod/EC2 T4) with CPU fallback profile.
* **QA:** End-to-end field testing with partner municipality. Capture real waste photos and verify the entire loop: Citizen → AI → Dashboard → Crew → Citizen.
* **Data Collection:** Begin collecting hardware-depth ground truth on supported devices (ARCore/ARKit).

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
