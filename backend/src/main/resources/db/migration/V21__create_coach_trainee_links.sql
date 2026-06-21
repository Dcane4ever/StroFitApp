CREATE TABLE coach_trainee_links (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    trainee_user_id  UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                 CHECK (status IN ('PENDING','ACTIVE','REJECTED','REMOVED')),
    invite_message   TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- A coach may not have the same trainee in two non-terminal states simultaneously
    CONSTRAINT uq_coach_trainee_active UNIQUE (coach_user_id, trainee_user_id)
);

-- One active coach per trainee at a time (MVP constraint)
CREATE UNIQUE INDEX uq_trainee_active_coach
    ON coach_trainee_links (trainee_user_id)
    WHERE status = 'ACTIVE';

CREATE INDEX idx_coach_trainee_coach   ON coach_trainee_links (coach_user_id, status);
CREATE INDEX idx_coach_trainee_trainee ON coach_trainee_links (trainee_user_id, status);
