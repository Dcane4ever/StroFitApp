-- Recipe-specific serving expressions.
-- Each row lets the recipe be expressed in a named portion size.
-- grams_equivalent: if set, enables cross-serving nutrition math by anchoring to recipe total grams.
-- fraction_of_recipe: direct fraction shortcut (e.g. 1/total_servings = 1 serving). Computed by service if not set.
CREATE TABLE recipe_serving_options (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id         UUID          NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
    label             VARCHAR(100)  NOT NULL,
    quantity          NUMERIC(8,3)  NOT NULL DEFAULT 1 CHECK (quantity > 0),
    grams_equivalent  NUMERIC(10,2),
    fraction_of_recipe NUMERIC(12,8) CHECK (fraction_of_recipe > 0 AND fraction_of_recipe <= 1),
    is_default        BOOLEAN       NOT NULL DEFAULT FALSE,
    display_order     INTEGER,

    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Only one default serving option per recipe
CREATE UNIQUE INDEX uq_recipe_serving_default
    ON recipe_serving_options (recipe_id)
    WHERE is_default = TRUE;

CREATE INDEX idx_recipe_serving_options_recipe ON recipe_serving_options (recipe_id, display_order NULLS LAST);
