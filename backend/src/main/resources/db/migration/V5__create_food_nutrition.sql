-- All macro values are stored per 100g — the universal canonical unit.
-- per_quantity + per_unit_label record what the source reported (e.g. "per 1 serving, 30g")
-- so we can show accurate label values alongside computed per-100g values.
CREATE TABLE food_nutrition (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    food_item_id        UUID         NOT NULL UNIQUE REFERENCES food_items (id) ON DELETE CASCADE,

    -- Core macros per 100g (calories required; macros nullable if unknown)
    calories_per_100g   NUMERIC(7, 2) NOT NULL,
    protein_per_100g    NUMERIC(6, 2),
    carbs_per_100g      NUMERIC(6, 2),
    fat_per_100g        NUMERIC(6, 2),
    fiber_per_100g      NUMERIC(6, 2),

    -- Optional micros (nullable; stored now, surfaced in UI later)
    sugar_per_100g      NUMERIC(6, 2),
    sodium_per_100mg    NUMERIC(7, 2),

    -- Source serving reference (what the label or source used as a serving)
    per_quantity        NUMERIC(7, 2),            -- e.g. 30 (meaning "per 30g")
    per_unit_label      VARCHAR(30),              -- e.g. "g", "serving", "piece"

    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_nutrition_calories_positive CHECK (calories_per_100g >= 0),
    CONSTRAINT chk_nutrition_protein_positive  CHECK (protein_per_100g IS NULL OR protein_per_100g >= 0),
    CONSTRAINT chk_nutrition_carbs_positive    CHECK (carbs_per_100g IS NULL OR carbs_per_100g >= 0),
    CONSTRAINT chk_nutrition_fat_positive      CHECK (fat_per_100g IS NULL OR fat_per_100g >= 0),
    CONSTRAINT chk_nutrition_fiber_positive    CHECK (fiber_per_100g IS NULL OR fiber_per_100g >= 0)
);
