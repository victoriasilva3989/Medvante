# Instalação do PostgreSQL 16 no Windows — Medvante

## 1. Download do instalador

Acesse: https://www.postgresql.org/download/windows/

Clique em **"Download the installer"** (EnterpriseDB) e baixe a versão **16.x** para Windows x86-64.

## 2. Executar o instalador

Execute o `.exe` baixado e siga o wizard:

| Etapa | Valor |
|-------|-------|
| **Installation Directory** | `C:\Program Files\PostgreSQL\16` (padrão) |
| **Select Components** | Marcar todos: PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools |
| **Data Directory** | `C:\Program Files\PostgreSQL\16\data` (padrão) |
| **Password** | Digite e confirme uma senha para o usuário `postgres` (ex: `postgres`) |
| **Port** | `5432` |
| **Locale** | Selecione `Portuguese_Brazil.1252` ou `pt_BR` |
| **Advanced Options** | Manter padrão |

Clique **Next** até concluir. Marque a opção **"Launch Stack Builder at exit"** e feche.

## 3. Verificar instalação

Abra o **Prompt de Comando** ou **PowerShell** e teste:

```cmd
psql --version
```

Deverá exibir algo como `psql (PostgreSQL) 16.x`.

## 4. Criar o banco Medvante

Abra o **SQL Shell (psql)** ou use o terminal:

```cmd
psql -U postgres -h localhost -p 5432
```

Digite a senha do `postgres` que você definiu na instalação. Dentro do psql, execute:

```sql
CREATE DATABASE medvante OWNER postgres;
\q
```

Ou, alternativamente, pelo terminal diretamente:

```cmd
createdb -U postgres -h localhost -p 5432 medvante
```

## 5. Configurar o .env do backend

No arquivo `backend/.env`, configure a conexão:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/medvante
```

Substitua `SUA_SENHA` pela senha que você definiu no passo 2.

## 6. Testar a conexão

No diretório `backend/`:

```cmd
npm run setup
```

Este comando executa as migrations e cria todas as tabelas.

## 7. Verificar tabelas

```cmd
psql -U postgres -d medvante -c "\dt"
```

Deverá listar todas as tabelas do schema.

## Solução de problemas comuns

### Erro: "psql não encontrado"
O `psql` não está no PATH. Adicione manualmente:
- `C:\Program Files\PostgreSQL\16\bin` ao PATH do sistema

### Erro: "FATAL: password authentication failed"
A senha do `postgres` está incorreta. Execute:

```cmd
psql -U postgres
```

E redefine a senha com:

```sql
ALTER USER postgres PASSWORD 'nova-senha';
```

### Erro: "port 5432 is already in use"
Outro serviço está usando a porta 5432. Verifique com:

```cmd
netstat -ano | findstr :5432
```

Ou mude a porta no `postgresql.conf` e reinicie o serviço.

### Erro: "Locale pt_BR not found"
Na instalação, escolha `Portuguese_Brazil.1252` em vez de `pt_BR.UTF-8`. Ou use o locale padrão (`English_United States.1252`) — não afeta o funcionamento.
