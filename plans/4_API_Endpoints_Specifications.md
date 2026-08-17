# 4. API Endpoints Specifications

All endpoints are prefixed with `/api/v1`. Authentication is handled via Bearer JWT.

---

## Rate Limiting & Anti-Fraud (Applied Globally to Citizen Endpoints)

| Rule | Limit | Action on Violation |
|---|---|---|
| Submissions per user per day | Max 10 | HTTP 429, logged to `citizen_activity_log` |
| Submissions from same GPS (20m) per user per 24h | Max 3 | HTTP 429, flag `RATE_LIMIT` |
| Cooldown between submissions | 5 minutes | HTTP 429 |
| EXIF timestamp age | Must be < 30 minutes old | HTTP 422, flag `STALE_EXIF` |
| GPS consistency | Phone GPS vs photo EXIF GPS must be < 500m | HTTP 422, flag `GPS_MISMATCH` |
| Self-dedup | Embedding similarity > 0.95 vs user's own prior submissions | HTTP 409, flag `SELF_DEDUP` |

All violations are logged to `citizen_activity_log` with `flagged: true` and the corresponding `flag_reason`.

---

## Citizen Endpoints (Mobile App)

### 1. Submit Complaint
* **Endpoint:** `POST /citizen/complaints`
* **Auth:** Required (Citizen JWT)
* **Rate Limited:** Yes (see table above)
* **Payload (Multipart Form):**
  * `image`: File (JPEG/PNG, capture-only — no gallery uploads)
  * `latitude`: Float
  * `longitude`: Float
  * `heading`: Float
  * `size_estimate`: String (Optional: `BUCKET`, `HANDCART`, `TRUCK`, `HEAVY_EQUIPMENT`)
* **Response (201 Created):**
  ```json
  {
    "complaint_id": "uuid",
    "status": "LOGGED",
    "message": "Complaint queued for AI analysis.",
    "nearby_active": 2
  }
  ```
* **Response (409 Conflict — Nearby Duplicate Detected):**
  ```json
  {
    "message": "A similar report exists within 50m.",
    "existing_complaint_id": "uuid",
    "similarity": 0.87,
    "action": "Would you like to upvote the existing report instead?"
  }
  ```

### 2. Upvote Nearby Complaint
* **Endpoint:** `POST /citizen/complaints/{id}/upvote`
* **Auth:** Required
* **Payload:** None
* **Response (200 OK):** `{"message": "Priority increased", "credits_earned": 5}`

### 3. Verify Resolution
* **Endpoint:** `POST /citizen/complaints/{id}/verify`
* **Auth:** Required (must NOT be the original reporter)
* **Payload (JSON):**
  * `rating`: Integer (1–5)
  * `comments`: String (Optional)
* **Response (200 OK):** `{"message": "Verification submitted", "credits_earned": 10}`

### 4. Fetch User History
* **Endpoint:** `GET /citizen/complaints`
* **Auth:** Required
* **Query Params:** `?limit=10&page=1`
* **Response (200 OK):** Array of past complaints with status, AI analysis summary, and credits earned.

### 5. Dispute Dedup Merge
* **Endpoint:** `POST /citizen/complaints/{id}/dispute-merge`
* **Auth:** Required (must be the citizen whose complaint was merged)
* **Payload (JSON):**
  * `reason`: String (Optional, e.g., "This is a different location")
* **Response (200 OK):**
  ```json
  {
    "message": "Dispute submitted. An officer will review.",
    "status": "LOGGED"
  }
  ```
* **Effect:** Sets `dedup_disputed: true`, reverts complaint status from `DUPLICATE` to `LOGGED`, and pushes a review task to the authority dashboard.

---

## Authority Web Endpoints (Dashboard)

### 6. Fetch Heatmap Complaints
* **Endpoint:** `GET /authority/complaints/heatmap`
* **Auth:** Required (Officer/Dispatcher JWT)
* **Query Params:** `?status=AI_TRIAGED&severity_min=0.5&ward_id=...`
* **Response (200 OK):**
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { "type": "Point", "coordinates": [lng, lat] },
        "properties": {
          "complaint_id": "uuid",
          "severity": 0.89,
          "logistics_tier": 3,
          "volume_confidence": "LOW",
          "hazard_flags": ["Bio-Hazard"]
        }
      }
    ]
  }
  ```

### 7. Approve & Dispatch Crew
* **Endpoint:** `POST /authority/dispatch`
* **Auth:** Required (Dispatcher/Admin JWT)
* **Payload (JSON):**
  * `complaint_id`: String (UUID)
  * `crew_id`: String (UUID)
  * `vehicle`: String (Enum: `MANUAL_SWEEP | HANDCART | MINI_TRUCK | COMPACTOR`)
  * `ppe_override`: Array of Strings (Optional, e.g., `["Gloves", "Mask", "Boots"]`)
* **Response (200 OK):** `{"dispatch_id": "uuid", "status": "DISPATCHED"}`

### 8. Review Dedup Flag (Human-in-the-Loop)
* **Endpoint:** `GET /authority/dedup-reviews`
* **Auth:** Required (Officer JWT)
* **Response (200 OK):** Array of complaint pairs in the 0.70–0.90 similarity band, with side-by-side image URLs and similarity scores.

* **Endpoint:** `POST /authority/dedup-reviews/{id}/decide`
* **Auth:** Required (Officer JWT)
* **Payload (JSON):**
  * `decision`: String (`MERGE` or `SEPARATE`)
* **Response (200 OK):** `{"message": "Decision applied."}`

### 9. Explain Severity Score
* **Endpoint:** `GET /authority/complaints/{id}/severity-explain`
* **Auth:** Required (Officer JWT)
* **Response (200 OK):**
  ```json
  {
    "severity_score": 0.72,
    "method": "FIXED_EXPERT",
    "weight_version_id": 1,
    "weights": {"volume": 0.35, "hazard": 0.30, "proximity": 0.20, "age": 0.15},
    "inputs": {"volume_normalized": 0.6, "hazard_score": 0.8, "proximity_score": 0.5, "age_normalized": 0.3},
    "computed_at": "2026-08-10T00:00:00Z"
  }
  ```

### 10. Submit Resolution (Field Crew)
* **Endpoint:** `POST /authority/complaints/{id}/resolve`
* **Auth:** Required (Field Crew JWT)
* **Payload (Multipart Form):**
  * `after_photo`: File (JPEG/PNG)
  * `ppe_checklist_acknowledged`: Boolean
* **Response (200 OK):** `{"message": "Resolution submitted. Citizen notified for verification."}`

### 11. Live GIS Stream (WebSocket)
* **Endpoint:** `WS /socket/authority`
* **Auth:** JWT in connection handshake
* **Events:**
  * `complaint_triaged`: Pushed when the AI worker finishes processing.
  * `crew_location_update`: Pushed periodically by active field crew apps.
  * `dedup_review_needed`: Pushed when a complaint falls in the 0.70–0.90 similarity band.
  * `dispute_filed`: Pushed when a citizen disputes a dedup merge.

---

## AI Service Internal Endpoints

### 12. Post AI Analysis Results (Internal Webhook)
* **Endpoint:** `PATCH /internal/complaints/{id}/ai-results`
* **Auth:** Internal Microservice Secret (shared key, not JWT)
* **Payload (JSON):**
  ```json
  {
    "waste_classes": ["Organic", "Plastic"],
    "volume_m3": 1.25,
    "volume_confidence": "LOW",
    "volume_method": "CITIZEN_PICK",
    "severity_score": 0.72,
    "severity_weight_version_id": 1,
    "hazard_flags": [],
    "logistics_tier": 2,
    "image_embedding": [0.12, 0.44, "... 768 floats ..."]
  }
  ```
* **Response (200 OK):** `{"message": "Complaint updated and WebSocket broadcasted."}`
