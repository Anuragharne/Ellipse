# 1. Recommended System Architecture

## Architectural Pattern: Polyglot Microservices

For the **Ellipse** AI-powered waste response decision support system, the recommended architectural pattern is a **Polyglot Microservices Architecture**. This approach isolates the high-throughput, low-latency CRUD operations and WebSocket connections from the highly intensive, synchronous (or queued) Machine Learning inference tasks.

### Core Components
1. **Mobile App (Citizen Edge):** A React Native (Expo) app functioning as an offline-first distributed sensor.
2. **Web Dashboard (Authority Edge):** A Next.js-based GIS operational command center for municipal dispatchers.
3. **Main API (Node.js/Express or NestJS):** Centralized data hub acting as the primary backend. It manages all DB reads/writes, authentication (JWT/RBAC), and real-time WebSocket events.
4. **AI Microservice (Python/FastAPI):** A decoupled worker service specifically optimized for loading PyTorch/ONNX models into GPU memory, performing instance segmentation, depth estimation, and vector generation.
5. **Shared Database Layer:** Both the Node.js API and Python Microservice securely access a unified PostgreSQL instance enriched with PostGIS (for spatial tracking) and pgvector (for visual deduplication).

---

## Data Flow Diagram (End-to-End Lifecycle)

```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant MobileApp as Citizen App (React Native)
    participant NodeAPI as Main Node.js API
    participant DB as PostgreSQL (PostGIS/pgvector)
    participant Redis as Redis Queue (BullMQ/Celery)
    participant AIWorker as Python AI Microservice
    participant AuthWeb as Authority Web (Next.js)

    Citizen->>MobileApp: Take Photo & Confirm Location
    MobileApp->>NodeAPI: POST /api/complaints (Multipart: Image, GPS, Heading)
    NodeAPI->>DB: Insert new complaint (Status: LOGGED)
    NodeAPI->>Redis: Enqueue 'process_waste_image' Job (image_url, complaint_id)
    Redis-->>AIWorker: Dequeue Job
    
    activate AIWorker
    AIWorker->>AIWorker: YOLO Segmentation
    AIWorker->>AIWorker: Monocular Depth Estimation -> Volume (m³)
    AIWorker->>AIWorker: Extract Image Embeddings (DINOv2/CLIP)
    AIWorker->>AIWorker: EWM-TOPSIS Severity Scoring
    AIWorker->>DB: Query for spatial/vector deduplication
    AIWorker->>DB: Update Complaint & Insert AI Analysis
    deactivate AIWorker

    AIWorker->>NodeAPI: Webhook: AI processing complete for complaint_id
    NodeAPI->>AuthWeb: WebSocket Event: New AI-Triaged Complaint Cluster
    
    activate AuthWeb
    AuthWeb->>AuthWeb: Map updates in real-time (Red/Orange/Yellow pin)
    AuthWeb->>NodeAPI: POST /api/dispatch (Assign Crew & Vehicle)
    NodeAPI->>DB: Update Status to DISPATCHED
    NodeAPI-->>MobileApp: Push Notification: "Crew Dispatched"
    deactivate AuthWeb

    actor Crew as Field Crew
    Crew->>NodeAPI: Submit Resolution "After" Photo
    NodeAPI->>DB: Update Status to RESOLVED
    NodeAPI-->>MobileApp: Prompt Citizen to Verify & Rate
```
