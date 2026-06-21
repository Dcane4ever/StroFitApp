-- Lightweight log of every barcode lookup attempt against external providers.
-- One row per (barcode_value, source_name) attempt. Used to track coverage gaps
-- and avoid hammering providers for barcodes that never return results.
CREATE TABLE barcode_lookup_log (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode_value   VARCHAR(50)   NOT NULL,
    source_name     VARCHAR(100)  NOT NULL,
    status          VARCHAR(20)   NOT NULL CHECK (status IN ('HIT','MISS','ERROR')),
    error_message   TEXT,
    looked_up_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_barcode_lookup_log_value ON barcode_lookup_log (barcode_value, looked_up_at DESC);
CREATE INDEX idx_barcode_lookup_log_source ON barcode_lookup_log (source_name, status);
