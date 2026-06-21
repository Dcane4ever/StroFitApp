-- Enrichment provenance fields on food_items.
-- external_source_name: which provider created/last verified this item (e.g. 'OPEN_FOOD_FACTS', 'USER')
-- external_source_id:   provider's own identifier for this product (e.g. OFF product ID)
-- last_verified_at:     when external data was last confirmed fresh
ALTER TABLE food_items
    ADD COLUMN external_source_name  VARCHAR(100),
    ADD COLUMN external_source_id    VARCHAR(255),
    ADD COLUMN last_verified_at      TIMESTAMPTZ;

CREATE INDEX idx_food_items_external_source ON food_items (external_source_name, external_source_id)
    WHERE external_source_id IS NOT NULL;
