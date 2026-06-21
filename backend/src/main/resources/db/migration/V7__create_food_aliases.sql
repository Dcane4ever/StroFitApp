-- Alternative names for food search: Filipino names, English translations,
-- colloquial shorthand, common misspellings, regional names.
CREATE TABLE food_aliases (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    food_item_id UUID         NOT NULL REFERENCES food_items (id) ON DELETE CASCADE,
    alias        VARCHAR(255) NOT NULL,
    language     VARCHAR(10)  NOT NULL DEFAULT 'fil',    -- 'fil', 'en', 'ceb', etc.
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_aliases_food_item ON food_aliases (food_item_id);

-- Full-text index on aliases for search
ALTER TABLE food_aliases
    ADD COLUMN alias_search_vector TSVECTOR
        GENERATED ALWAYS AS (to_tsvector('english', coalesce(alias, ''))) STORED;

CREATE INDEX idx_food_aliases_search ON food_aliases USING GIN (alias_search_vector);
