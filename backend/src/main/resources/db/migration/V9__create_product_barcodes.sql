-- One product can have multiple barcodes (regional variants, repackaging).
CREATE TABLE product_barcodes (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    branded_product_id UUID        NOT NULL REFERENCES branded_products (id) ON DELETE CASCADE,
    barcode_value      VARCHAR(50) NOT NULL,
    barcode_type       VARCHAR(20) NOT NULL DEFAULT 'EAN13',   -- EAN13, EAN8, UPCA, UPCE, QR
    is_primary         BOOLEAN     NOT NULL DEFAULT TRUE,
    source             VARCHAR(30) NOT NULL DEFAULT 'MANUAL',  -- MANUAL, OPEN_FOOD_FACTS, USER_SCAN
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_barcode_type   CHECK (barcode_type IN ('EAN13', 'EAN8', 'UPCA', 'UPCE', 'QR', 'OTHER')),
    CONSTRAINT chk_barcode_source CHECK (source IN ('MANUAL', 'OPEN_FOOD_FACTS', 'USER_SCAN'))
);

-- Barcode values must be globally unique
CREATE UNIQUE INDEX idx_product_barcodes_value ON product_barcodes (barcode_value);
CREATE INDEX idx_product_barcodes_product    ON product_barcodes (branded_product_id);
