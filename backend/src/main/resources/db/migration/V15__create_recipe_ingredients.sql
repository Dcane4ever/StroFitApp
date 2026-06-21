CREATE TABLE recipe_ingredients (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id            UUID          NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
    food_item_id         UUID          NOT NULL REFERENCES food_items (id),
    branded_product_id   UUID          REFERENCES branded_products (id),
    quantity             NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
    serving_unit_id      UUID          NOT NULL REFERENCES food_serving_units (id),
    ingredient_order     INTEGER,
    ingredient_note      VARCHAR(500),

    -- Snapshots so ingredient names survive food edits/deletes
    food_name_snapshot   VARCHAR(255)  NOT NULL,
    brand_name_snapshot  VARCHAR(255),

    created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients (recipe_id, ingredient_order NULLS LAST);
