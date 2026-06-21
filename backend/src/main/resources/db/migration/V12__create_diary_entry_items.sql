CREATE TABLE diary_entry_items (
    id                      UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    diary_entry_id          UUID           NOT NULL REFERENCES diary_entries (id) ON DELETE CASCADE,
    food_item_id            UUID           NOT NULL REFERENCES food_items (id),
    branded_product_id      UUID           REFERENCES branded_products (id),

    meal_type               VARCHAR(20)    NOT NULL CHECK (meal_type IN ('BREAKFAST','LUNCH','DINNER','SNACK')),

    -- Quantity the user logged
    quantity                NUMERIC(10,3)  NOT NULL CHECK (quantity > 0),

    -- Serving unit snapshot — label is permanent record, unit_id is convenience reference
    serving_unit_id         UUID           REFERENCES food_serving_units (id) ON DELETE SET NULL,
    serving_unit_label      VARCHAR(50)    NOT NULL,
    grams_per_unit          NUMERIC(10,4)  NOT NULL,

    -- Computed: quantity * grams_per_unit = total_grams logged
    total_grams             NUMERIC(10,3)  NOT NULL,

    -- Nutrition snapshot (computed at log time, immutable after write)
    calories                NUMERIC(10,2)  NOT NULL,
    protein_g               NUMERIC(10,2),
    carbs_g                 NUMERIC(10,2),
    fat_g                   NUMERIC(10,2),
    fiber_g                 NUMERIC(10,2),

    -- Name snapshots so logs remain readable even if food is deleted/renamed
    food_name_snapshot      VARCHAR(255)   NOT NULL,
    brand_name_snapshot     VARCHAR(255),

    -- Price snapshot (cheapest active price at log time, nullable)
    price_amount            NUMERIC(10,2),
    price_currency          VARCHAR(3)     DEFAULT 'PHP',
    price_source_note       VARCHAR(255),

    notes                   TEXT,
    logged_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_diary_entry_items_entry  ON diary_entry_items (diary_entry_id, meal_type);
CREATE INDEX idx_diary_entry_items_food   ON diary_entry_items (food_item_id);
