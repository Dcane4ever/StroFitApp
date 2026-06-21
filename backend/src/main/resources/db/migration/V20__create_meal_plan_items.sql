-- Line items in a meal plan. Each row is either a food item OR a recipe (exactly one non-null).
CREATE TABLE meal_plan_items (
    id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id           UUID          NOT NULL REFERENCES meal_plans (id) ON DELETE CASCADE,
    meal_type              VARCHAR(20)   NOT NULL CHECK (meal_type IN ('BREAKFAST','LUNCH','DINNER','SNACK')),

    -- Exactly one of food_item_id or recipe_id must be set (enforced in service layer for MVP)
    food_item_id           UUID          REFERENCES food_items (id),
    recipe_id              UUID          REFERENCES recipes (id),

    quantity               NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
    serving_unit_id        UUID          REFERENCES food_serving_units (id) ON DELETE SET NULL,
    serving_unit_label     VARCHAR(50),

    -- Nutrition snapshot (computed at item creation)
    planned_calories       NUMERIC(10,2),
    planned_protein_g      NUMERIC(10,2),
    planned_carbs_g        NUMERIC(10,2),
    planned_fat_g          NUMERIC(10,2),
    planned_fiber_g        NUMERIC(10,2),

    -- Cost snapshot (from cheapest active StorePrice at creation time)
    estimated_cost_php     NUMERIC(10,2),

    -- Name snapshot for display without JOINs
    item_name_snapshot     VARCHAR(255),

    sort_order             INTEGER,

    created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_meal_plan_item_source
        CHECK ((food_item_id IS NOT NULL) != (recipe_id IS NOT NULL))
);

CREATE INDEX idx_meal_plan_items_plan ON meal_plan_items (meal_plan_id, meal_type, sort_order NULLS LAST);
