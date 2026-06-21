CREATE TABLE recipes (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name                  VARCHAR(255)  NOT NULL,
    description           TEXT,
    notes                 TEXT,
    total_servings        NUMERIC(8,2)  CHECK (total_servings > 0),
    default_serving_label VARCHAR(100),
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recipes_user_id ON recipes (user_id, updated_at DESC);
