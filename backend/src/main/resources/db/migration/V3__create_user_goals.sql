CREATE TABLE user_goals (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    goal_type         VARCHAR(20)  NOT NULL,
    calorie_target    INTEGER      NOT NULL,
    protein_target_g  NUMERIC(6, 1) NOT NULL,
    carbs_target_g    NUMERIC(6, 1) NOT NULL,
    fats_target_g     NUMERIC(6, 1) NOT NULL,
    fiber_target_g    NUMERIC(6, 1),
    daily_budget_php  NUMERIC(8, 2),
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    starts_on         DATE         NOT NULL DEFAULT CURRENT_DATE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_goal_type             CHECK (goal_type IN ('CUT', 'BULK', 'RECOMP', 'MAINTAIN')),
    CONSTRAINT chk_goal_calorie_positive CHECK (calorie_target > 0),
    CONSTRAINT chk_goal_protein_positive CHECK (protein_target_g >= 0),
    CONSTRAINT chk_goal_carbs_positive   CHECK (carbs_target_g >= 0),
    CONSTRAINT chk_goal_fats_positive    CHECK (fats_target_g >= 0),
    CONSTRAINT chk_goal_budget_positive  CHECK (daily_budget_php IS NULL OR daily_budget_php >= 0)
);

-- Only one active goal per user at any time
CREATE UNIQUE INDEX idx_user_goals_active
    ON user_goals (user_id)
    WHERE is_active = TRUE;

CREATE INDEX idx_user_goals_user_id ON user_goals (user_id);
