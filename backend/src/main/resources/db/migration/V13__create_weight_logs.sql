CREATE TABLE weight_logs (
    id                   UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID           NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    logged_at            TIMESTAMPTZ    NOT NULL,
    weight_value         NUMERIC(6,2)   NOT NULL CHECK (weight_value > 0 AND weight_value < 1000),
    weight_unit          VARCHAR(3)     NOT NULL DEFAULT 'KG' CHECK (weight_unit IN ('KG','LBS')),
    body_fat_percentage  NUMERIC(5,2)   CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
    waist_cm             NUMERIC(6,2)   CHECK (waist_cm > 0),
    note                 TEXT,
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weight_logs_user_logged_at ON weight_logs (user_id, logged_at DESC);
