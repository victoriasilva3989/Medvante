ALTER TABLE sessoes
  ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS token VARCHAR(255),
  ALTER COLUMN expira_em DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sessoes_refresh_token ON sessoes(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
