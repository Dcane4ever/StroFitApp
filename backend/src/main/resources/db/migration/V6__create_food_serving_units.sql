-- Per-food unit definitions. grams_per_unit is the single conversion value
-- needed to compute macros: serving_macros = (quantity * grams_per_unit / 100) * per_100g_value
CREATE TABLE food_serving_units (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    food_item_id    UUID         NOT NULL REFERENCES food_items (id) ON DELETE CASCADE,

    -- unit_type is the canonical enum; unit_label is the display string shown to users
    unit_type       VARCHAR(20)  NOT NULL,
    unit_label      VARCHAR(50)  NOT NULL,    -- e.g. "tasa", "cup", "1 sachet (25g)"

    grams_per_unit  NUMERIC(8, 3) NOT NULL,  -- how many grams this 1 unit equals for this food
    is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order      INTEGER      NOT NULL DEFAULT 0,

    CONSTRAINT chk_unit_type CHECK (
        unit_type IN ('GRAM', 'ML', 'PIECE', 'CUP', 'TBSP', 'TSP', 'SCOOP', 'SERVING', 'CUSTOM')
    ),
    CONSTRAINT chk_grams_per_unit_positive CHECK (grams_per_unit > 0)
);

CREATE INDEX idx_serving_units_food_item ON food_serving_units (food_item_id);

-- One default unit per food item
CREATE UNIQUE INDEX idx_serving_units_default
    ON food_serving_units (food_item_id)
    WHERE is_default = TRUE;

-- Now that food_serving_units exists, wire the FK on food_items
ALTER TABLE food_items
    ADD CONSTRAINT fk_food_items_default_serving_unit
        FOREIGN KEY (default_serving_unit_id)
        REFERENCES food_serving_units (id)
        ON DELETE SET NULL
        DEFERRABLE INITIALLY DEFERRED;
