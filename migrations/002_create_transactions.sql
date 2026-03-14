CREATE TABLE IF NOT EXISTS transactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id     UUID REFERENCES users(id),
    receiver_id   UUID REFERENCES users(id),
    amount        NUMERIC(12, 2) NOT NULL,
    status        VARCHAR(20) DEFAULT 'completed',
    flagged       BOOLEAN DEFAULT FALSE,
    flag_reason   VARCHAR(255),
    created_at    TIMESTAMP DEFAULT NOW()
);
