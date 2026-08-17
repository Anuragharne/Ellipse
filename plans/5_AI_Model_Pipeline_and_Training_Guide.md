# 5. AI Model Pipeline, Training & Integration Guide

## 1. Dataset Sourcing & Preprocessing
* **TACO Dataset:** Download the Trash Annotations in Context (TACO) dataset (~1,500 images, 60 categories).
* **Custom Civic Data:** Augment with municipal-specific waste images (Indian/Urban context). Target: 500+ manually photographed and labeled scenes from partner municipalities.
* **Preprocessing:** Convert instance masks to YOLO polygon format. Apply heavy augmentations (lighting variations, partial occlusions, motion blur, rain/water reflections) to mimic low-quality mobile phone captures in real field conditions.
* **Labeling Protocol:** Use CVAT or Label Studio. Minimum 2 annotators per image with inter-annotator agreement > 0.8 IoU before inclusion.

## 2. Segmentation Model (YOLO11-seg)
* **Fine-Tuning:** Train the YOLO model on the augmented dataset using a PyTorch environment (e.g., A100 GPU instance).
* **Target Classes:** Overflowing Bins, Plastic/Dry Waste, Organic/Wet Waste, Construction & Demolition (C&D) Debris, E-Waste, Blocked Drains, Bio-Hazardous Waste.
* **Quantization:** Export the trained `.pt` weights to **TensorRT (FP16)** or **ONNX INT8** for fast inference inside the FastAPI microservice.
* **Performance Target:** mAP@50 > 0.65 on a held-out test set of 200+ images. This target must be validated before production deployment.

## 3. Volume Estimation — Three-Layer De-Risked Approach

> **Critical Design Decision:** Monocular depth estimation on irregular, occluded, wet/reflective garbage piles is an unsolved problem with no published error bounds for this scene type. The plan explicitly acknowledges this and stages volume estimation across three maturity levels.

### Layer 1: MVP — Rule-Based Size Classification (No ML Volume)
Ship first. No depth model required.
1. Use the YOLO segmentation bounding-box area relative to total image dimensions as a rough size proxy.
2. Present the citizen with a **visual size picker** during submission: "Fits in a bucket / Fills a handcart / Needs a truck / Needs heavy equipment."
3. Map the combination of bounding-box-area ratio + citizen selection directly to Tiers 1–4.
4. Store as `volume_method: 'CITIZEN_PICK'`, `volume_confidence: 'LOW'`.
5. **This is honest, shippable, and costs zero GPU time on depth inference.**

### Layer 2: V1.1 — Hardware Depth (ARCore/ARKit) as Ground Truth
When available on supported devices (iPhone 12+ LiDAR, Android flagships with ARCore DepthAPI):
1. Capture the hardware depth point cloud alongside the RGB image via `expo-camera` depth data or native ARCore/ARKit modules.
2. Use the YOLO segmentation mask to isolate waste pixels in the hardware depth map.
3. Integrate the masked 3D point cloud to calculate metric volume ($m^3$).
4. Store as `volume_method: 'ARCORE_LIDAR'`, `volume_confidence: 'HIGH'`.
5. **These reports become ground-truth training data for Layer 3.**

### Layer 3: V2 — Calibrated Monocular Depth (Only After Validation)
Only after collecting 200+ reports with hardware-depth ground truth:
1. Pass the RGB image through **Depth Anything V2** to extract a dense relative depth map.
2. Overlay the YOLO segmentation mask to isolate waste pixels.
3. Train a **regression calibration layer** that maps Depth Anything V2's relative output to metric depth *for the specific scene type* (outdoor, ground-level, garbage), using the Layer 2 hardware-depth data as ground truth.
4. Publish the **Mean Absolute Error (MAE)**. Only deploy if MAE < 30% against ground truth.
5. Store as `volume_method: 'MONOCULAR_CALIBRATED'`, `volume_confidence: 'MEDIUM'`.

### Validation Protocol (Required Before Layer 3 Deployment)
1. **Ground-truth collection:** Manually measure 50+ real waste piles with tape measures. Photograph each pile with a phone that has hardware depth AND a phone without.
2. **Benchmark:** Compare hardware-depth volume, monocular-depth volume, and manual measurement.
3. **Publish error range:** Report MAE, RMSE, and 90th-percentile error.
4. **Decision gate:** If monocular MAE > 30%, do NOT deploy Layer 3. Continue using Layers 1+2 only.

### Tier Assignment (All Layers)
* Tier 1 (Small / <0.5 $m^3$): Manual street sweeping crew.
* Tier 2 (Medium / 0.5–2.0 $m^3$): Handcart & sanitation crew.
* Tier 3 (Large / 2.0–5.0 $m^3$): Mini-truck / pickup crew.
* Tier 4 (Massive / >5.0 $m^3$): Heavy mechanical loader & compactor truck.

## 4. Visual Deduplication Pipeline — Three-Band System

> **Critical Design Decision:** Auto-merging on a single hard-coded threshold is a trust-breaking failure mode. A false merge silently destroys a citizen's legitimate complaint. The system uses a three-band approach with human-in-the-loop for uncertain cases.

### Embedding Extraction
1. Run the raw image through **DINOv2** or **CLIP (ViT-B/32)** to generate a 768-dimensional normalized embedding vector.

### Spatial Pre-Filter
2. Query PostGIS to find complaints within a `50m` radius created in the last `48 hours` that are not already `RESOLVED` or `REJECTED`.

### Three-Band Similarity Decision
3. If proximity matches exist, use `pgvector` to calculate cosine similarity: `1 - (image_embedding <=> new_embedding)`.

| Cosine Similarity | Action | Rationale |
|---|---|---|
| **< 0.70** | Treat as **separate** complaint | Clearly different scenes |
| **0.70 – 0.90** | **Flag for human review** | Uncertain — officer sees side-by-side comparison on dashboard |
| **> 0.90** | **Auto-merge** with citizen notification | Very high confidence. Citizen receives: "Your report was linked to existing ticket #XYZ. Disagree? Tap to dispute." |

### Threshold Derivation (Required Before Launch)
* Collect 500+ image pairs: same pile from different angles, and different piles nearby.
* Manually label each pair as `SAME` or `DIFFERENT`.
* Plot precision/recall at different thresholds.
* Pick the threshold where false-merge rate is < 2%.
* **The 0.70 and 0.90 numbers above are starting points to be validated, not final.**

### Dispute Mechanism
* Auto-merged complaints remain in the DB with `status: DUPLICATE` and `parent_complaint_id` set.
* Citizens can dispute via a "This is a different pile" button, which un-merges and sends the pair to an officer for manual review.

## 5. Multi-Criteria Severity Scoring — Phased Approach

### MVP: Simple Weighted Sum (Expert-Tuned, Fixed Weights)
For launch, use a transparent, manually-set weighted sum:

```
severity = (w1 × normalized_volume) + (w2 × hazard_score) + (w3 × proximity_to_POI) + (w4 × complaint_age_hours)
```

Where initial weights are set by the municipal commissioner / domain expert:
* `w1 = 0.35` (Volume/Size tier)
* `w2 = 0.30` (Hazard level: Bio-Hazard=1.0, E-Waste=0.8, C&D=0.5, Organic=0.3, Plastic=0.2)
* `w3 = 0.20` (Proximity: <100m from school/hospital/waterway = 1.0, <500m = 0.5, else = 0.1)
* `w4 = 0.15` (Age: normalized 0–1 based on hours since submission, capped at 72h)

Normalize the result to 0.0–1.0. These weights are **auditable, explainable, and stable.**

### V2: EWM-TOPSIS (Only After Sufficient Data)
Once the system has 1,000+ resolved complaints with outcome data:

1. **Entropy Weight Method (EWM):** Assigns objective, data-driven weights to criteria based on variance.
   * *Criteria:* Volume, Hazard Count, Proximity to POI (Schools/Hospitals), Complaint Age.
2. **TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution):**
   * Normalizes the decision matrix of active complaints.
   * Defines the Ideal Best Case (Massive, Hazardous, Next to School) and Ideal Worst Case (Tiny, Safe, Isolated).
   * Scores from `0.0` to `1.0` based on Euclidean distance to the ideal solutions.

### Frozen Weights & Auditability (V2 Only)
* **Compute EWM weights on a weekly batch job** (Sunday midnight), not per-inference. Freeze those weights for the entire week.
* **Store the weight version** with every severity score so scores are reproducible:
  ```
  severity_weight_versions table stores: {version_id, computed_at, weights_json, complaint_count}
  ai_analysis.severity_weight_version_id references this table
  ```
* **"Explain Score" API:** Officers can see *which weights* produced *which score*, and when those weights were last recalculated.
* **A/B test** EWM-TOPSIS against the simple weighted sum before fully switching. Only adopt if dispatch outcomes measurably improve.

## 6. Non-Functional Performance Targets

> **These targets define "done" for the AI pipeline. Without them, quality is unmeasurable.**

| Metric | Target | How to Measure |
|---|---|---|
| YOLO mAP@50 | > 0.65 on waste classes | Held-out test set of 200+ images |
| End-to-end latency (submission → AI_TRIAGED) | < 60 seconds (p95) | Application Performance Monitoring |
| YOLO inference | < 200ms/image on T4 GPU | Ultralytics benchmark tool |
| Depth inference (V2 only) | < 500ms/image on T4 GPU | Depth Anything V2 benchmark |
| Total AI pipeline | < 2s/image (GPU), < 15s/image (CPU fallback) | End-to-end timing in Celery task |
| Cost per 1,000 images | < $0.50 (GPU), ~$0 (CPU self-hosted) | Cloud billing + throughput monitoring |
| Volume MAE (V2 only) | < 30% against ground truth | Validation protocol (Section 3) |
| Dedup false-merge rate | < 2% | Labeled pair dataset (Section 4) |
