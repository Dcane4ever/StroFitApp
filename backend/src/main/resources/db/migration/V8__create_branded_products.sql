-- Packaged commercial products. Nutrition lives on the linked food_item.
CREATE TABLE branded_products (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    food_item_id     UUID         NOT NULL UNIQUE REFERENCES food_items (id) ON DELETE CASCADE,
    brand_name       VARCHAR(255) NOT NULL,
    product_name     VARCHAR(255) NOT NULL,
    manufacturer     VARCHAR(255),
    package_size_text VARCHAR(100),           -- e.g. "180g", "3 x 25g sachets", "1L"
    net_weight_g     NUMERIC(8, 2),           -- total net weight in grams (parsed from label)
    serving_size_g   NUMERIC(7, 2),           -- declared serving size in grams
    serving_size_label VARCHAR(100),          -- e.g. "1 sachet (25g)", "2 tablespoons"
    image_url        VARCHAR(500),
    country_of_sale  VARCHAR(10)  DEFAULT 'PH',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_branded_products_brand ON branded_products (brand_name);
