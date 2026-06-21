-- One row per user per date. Created lazily on first item log.
CREATE TABLE diary_entries (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    entry_date   DATE        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_diary_entries_user_date UNIQUE (user_id, entry_date)
);

CREATE INDEX idx_diary_entries_user_date ON diary_entries (user_id, entry_date DESC);
