# 3. Unified Database Schema (SQL/DDL)

```sql
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- Custom Enums
CREATE TYPE user_role AS ENUM ('CITIZEN', 'OFFICER', 'DISPATCHER', 'ADMIN', 'FIELD_CREW');
CREATE TYPE complaint_status AS ENUM ('LOGGED', 'AI_TRIAGED', 'ASSIGNED', 'DISPATCHED', 'RESOLVED', 'DUPLICATE', 'REJECTED');
CREATE TYPE vehicle_class AS ENUM ('MANUAL_SWEEP', 'HANDCART', 'MINI_TRUCK', 'COMPACTOR');
CREATE TYPE volume_confidence_level AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE volume_estimation_method AS ENUM ('CITIZEN_PICK', 'ARCORE_LIDAR', 'MONOCULAR_CALIBRATED');

-- 1. Users Table (RBAC: Citizens, Officers, Admins, Field Crew)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'CITIZEN',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    clean_city_credits INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Complaints Table (Master Lifecycle)
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES users(id) ON DELETE SET NULL,
    raw_image_url TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    compass_heading DECIMAL(5, 2),           -- Compass bearing at capture time
    status complaint_status DEFAULT 'LOGGED',
    parent_complaint_id UUID REFERENCES complaints(id), -- Nullable, set if flagged as duplicate
    dedup_similarity DECIMAL(4, 3),          -- Cosine similarity score against parent (if duplicate)
    dedup_reviewed_by UUID REFERENCES users(id), -- NULL if auto-merged, officer UUID if manually reviewed
    dedup_disputed BOOLEAN DEFAULT FALSE,    -- Citizen disputed the auto-merge
    upvote_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Severity Weight Versions (for auditable, frozen EWM-TOPSIS scoring)
CREATE TABLE severity_weight_versions (
    id SERIAL PRIMARY KEY,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    weights JSONB NOT NULL,                  -- e.g., {"volume": 0.35, "hazard": 0.30, "proximity": 0.20, "age": 0.15}
    method VARCHAR(30) NOT NULL DEFAULT 'FIXED_EXPERT',  -- 'FIXED_EXPERT' for MVP, 'EWM_TOPSIS' for V2
    complaint_count INT,                     -- Number of complaints used to derive these weights
    active_until TIMESTAMP WITH TIME ZONE    -- NULL means currently active
);

-- 4. AI Analysis Table
CREATE TABLE ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    waste_classes JSONB NOT NULL,             -- e.g., ["Plastic", "Organic", "C&D"]
    volume_m3 DECIMAL(6, 2),                 -- Honest precision: 2 decimal places, not 4
    volume_confidence volume_confidence_level DEFAULT 'LOW',
    volume_method volume_estimation_method,   -- How the volume was estimated
    severity_score DECIMAL(5, 4),            -- Range 0.0000 to 1.0000
    severity_weight_version_id INT REFERENCES severity_weight_versions(id),
    hazard_flags JSONB,                      -- e.g., ["Bio-Hazard", "E-Waste"]
    logistics_tier INT CHECK (logistics_tier BETWEEN 1 AND 4),
    image_embedding vector(768),             -- For DINOv2 / CLIP vectors
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Dispatch Orders Table
CREATE TABLE dispatch_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    crew_id UUID REFERENCES users(id) ON DELETE SET NULL,
    vehicle vehicle_class NOT NULL,
    ppe_required JSONB,                      -- List of required PPE strings
    before_photo_url TEXT,
    after_photo_url TEXT,
    citizen_rating INT CHECK (citizen_rating BETWEEN 1 AND 5),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Citizen Activity Log (Anti-Fraud & Rate Limiting)
CREATE TABLE citizen_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,             -- 'SUBMIT', 'UPVOTE', 'VERIFY', 'DISPUTE_DEDUP'
    complaint_id UUID REFERENCES complaints(id),
    ip_address INET,
    device_fingerprint VARCHAR(255),
    flagged BOOLEAN DEFAULT FALSE,           -- True if rate-limit or fraud signal triggered
    flag_reason VARCHAR(255),                -- e.g., 'RATE_LIMIT', 'SELF_DEDUP', 'GPS_MISMATCH', 'STALE_EXIF'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for highly performant queries
CREATE INDEX idx_complaints_location ON complaints USING GIST (location);
CREATE INDEX idx_complaints_status ON complaints (status);
CREATE INDEX idx_complaints_citizen ON complaints (citizen_id);
CREATE INDEX idx_ai_analysis_embedding ON ai_analysis USING hnsw (image_embedding vector_cosine_ops);
CREATE INDEX idx_ai_analysis_severity ON ai_analysis (severity_score DESC);
CREATE INDEX idx_activity_citizen_time ON citizen_activity_log (citizen_id, created_at);
```
