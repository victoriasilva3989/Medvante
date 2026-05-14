-- Usuário PostgreSQL com privilégios mínimos para a aplicação
-- Uso: psql -U postgres -d medvante -f scripts/create-db-user.sql

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'medvante_app') THEN
    CREATE ROLE medvante_app WITH LOGIN PASSWORD 'trocar-em-producao';
  END IF;
END
$$;

-- Conecta-se ao banco (executar com: \c medvante)
GRANT CONNECT ON DATABASE medvante TO medvante_app;
GRANT USAGE ON SCHEMA public TO medvante_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO medvante_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO medvante_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO medvante_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO medvante_app;

-- Revogar privilégios perigosos explicitamente
REVOKE CREATE ON SCHEMA public FROM medvante_app;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM medvante_app;

-- Nota: em produção, também revogar acesso a tabelas de sistema:
-- REVOKE ALL ON pg_catalog.pg_authid FROM medvante_app;

-- Verificação:
-- \du medvante_app
-- \c medvante medvante_app
-- SELECT * FROM information_schema.table_privileges WHERE grantee = 'medvante_app';
