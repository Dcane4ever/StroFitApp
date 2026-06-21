-- Optional price data per food item or branded product.
-- Exactly one of food_item_id or branded_product_id must be non-null (enforced by check constraint).
CREATE TABLE store_prices (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    food_item_id        UUID         REFERENCES food_items (id) ON DELETE CASCADE,
    branded_product_id  UUID         REFERENCES branded_products (id) ON DELETE CASCADE,

    store_name          VARCHAR(100) NOT NULL,        -- e.g. "Puregold", "Palengke", "7-Eleven"
    price_php           NUMERIC(8, 2) NOT NULL,
    quantity_g          NUMERIC(8, 2) NOT NULL,       -- what quantity this price covers in grams
    quantity_label      VARCHAR(100),                 -- human label e.g. "1 can (180g)", "per 100g"
    currency            VARCHAR(5)   NOT NULL DEFAULT 'PHP',
    observed_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    reported_by_user_id UUID         REFERENCES users (id) ON DELETE SET NULL,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_store_prices_target CHECK (
        (food_item_id IS NOT NULL AND branded_product_id IS NULL) OR
        (food_item_id IS NULL AND branded_product_id IS NOT NULL)
    ),
    CONSTRAINT chk_store_prices_amount_positive   CHECK (price_php > 0),
    CONSTRAINT chk_store_prices_quantity_positive CHECK (quantity_g > 0)
);

CREATE INDEX idx_store_prices_food_item ON store_prices (food_item_id)        WHERE food_item_id IS NOT NULL;
CREATE INDEX idx_store_prices_product   ON store_prices (branded_product_id)  WHERE branded_product_id IS NOT NULL;
CREATE INDEX idx_store_prices_active    ON store_prices (is_active);
