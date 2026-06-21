-- One meal plan per user per date. This is a planning scratchpad — does not affect diary.
CREATE TABLE meal_plans (
    id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    plan_date              DATE          NOT NULL,

    -- Target macros for the day (copied from active user goal at creation time)
    target_calories        NUMERIC(8,2),
    target_protein_g       NUMERIC(7,2),
    target_carbs_g         NUMERIC(7,2),
    target_fat_g           NUMERIC(7,2),

    -- Budget snapshot from active user goal at creation time
    budget_limit_php       NUMERIC(10,2),

    notes                  TEXT,

    created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_meal_plans_user_date UNIQUE (user_id, plan_date)
);

CREATE INDEX idx_meal_plans_user_date ON meal_plans (user_id, plan_date DESC);
