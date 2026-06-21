CREATE TABLE food_items (
    id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name                  VARCHAR(255) NOT NULL,
    description           TEXT,
    category              VARCHAR(100),
    food_type             VARCHAR(30)  NOT NULL DEFAULT 'GENERIC',
    source_type           VARCHAR(30)  NOT NULL DEFAULT 'CURATED',
    confidence_level      VARCHAR(20)  NOT NULL DEFAULT 'HIGH',
    is_verified           BOOLEAN      NOT NULL DEFAULT FALSE,
    is_public             BOOLEAN      NOT NULL DEFAULT TRUE,
    default_serving_unit_id UUID,                 -- FK added after food_serving_units exists
    created_by_user_id    UUID         REFERENCES users (id) ON DELETE SET NULL,
    raw_source_json       JSONB,                  -- stores original API response for enriched items
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_food_type       CHECK (food_type IN ('GENERIC', 'FILIPINO_LOCAL', 'BRANDED_PRODUCT_BASE', 'USER_CUSTOM')),
    CONSTRAINT chk_food_source     CHECK (source_type IN ('CURATED', 'USER', 'OPEN_FOOD_FACTS', 'USDA', 'AI_ENRICHED')),
    CONSTRAINT chk_confidence      CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW', 'ESTIMATED'))
);

-- Full-text search: generated tsvector column for fast name search
ALTER TABLE food_items
    ADD COLUMN search_vector TSVECTOR
        GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, ''))) STORED;

CREATE INDEX idx_food_items_search_vector ON food_items USING GIN (search_vector);
CREATE INDEX idx_food_items_food_type     ON food_items (food_type);
CREATE INDEX idx_food_items_category      ON food_items (category);
CREATE INDEX idx_food_items_created_by    ON food_items (created_by_user_id) WHERE created_by_user_id IS NOT NULL;
CREATE INDEX idx_food_items_verified      ON food_items (is_verified);
