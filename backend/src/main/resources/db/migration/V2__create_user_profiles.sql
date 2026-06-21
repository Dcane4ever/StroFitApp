CREATE TABLE user_profiles (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    display_name     VARCHAR(100) NOT NULL,
    sex              VARCHAR(10),
    birth_date       DATE,
    height_cm        NUMERIC(5, 2),
    current_weight_kg NUMERIC(5, 2),
    target_weight_kg NUMERIC(5, 2),
    activity_level   VARCHAR(20),
    unit_preference  VARCHAR(10)  NOT NULL DEFAULT 'METRIC',
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_profile_sex            CHECK (sex IN ('MALE', 'FEMALE', 'OTHER')),
    CONSTRAINT chk_profile_activity       CHECK (activity_level IN ('SEDENTARY', 'LIGHT', 'MODERATE', 'VERY_ACTIVE', 'EXTRA_ACTIVE')),
    CONSTRAINT chk_profile_unit_pref      CHECK (unit_preference IN ('METRIC', 'IMPERIAL')),
    CONSTRAINT chk_profile_height         CHECK (height_cm IS NULL OR height_cm > 0),
    CONSTRAINT chk_profile_weight         CHECK (current_weight_kg IS NULL OR current_weight_kg > 0),
    CONSTRAINT chk_profile_target_weight  CHECK (target_weight_kg IS NULL OR target_weight_kg > 0)
);
