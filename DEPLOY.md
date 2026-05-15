# Deploy do MedVante

## Visão Geral

- **Frontend** → Vercel (React + Vite)
- **Backend** → Railway (Express + TypeScript + PostgreSQL)
- **Banco** → PostgreSQL 16 (via Railway)

---

## 1. Deploy do Backend no Railway

### 1.1 Criar o projeto no Railway

1. Acesse https://railway.app e faça login com GitHub
2. Clique em **New Project** → **Deploy from GitHub repo**
3. Selecione o repositório `victoriasilva3989/Medvante`
4. Na tela de deploy, clique em **Deploy** (vai falhar no começo, é normal)

### 1.2 Adicionar PostgreSQL

1. Clique em **New** → **Database** → **Add PostgreSQL**
2. Railway vai criar um banco PostgreSQL e linkar automaticamente com o backend
3. Anote a variável `DATABASE_URL` gerada (vai aparecer nas variáveis de ambiente)

### 1.3 Configurar root directory

1. No painel do Railway, clique no serviço do backend
2. Vá em **Settings** → **Root Directory**
3. Defina como: `backend`
4. Isso faz o Railway usar o `railway.toml` dentro da pasta `backend/`

### 1.4 Configurar variáveis de ambiente

No Railway, vá em **Variables** e adicione:

| Variável | Valor | Obrigatória |
|---|---|---|
| `DATABASE_URL` | *(gerado automaticamente pelo Railway PostgreSQL)* | Sim |
| `JWT_SECRET` | `sua-chave-secreta-com-pelo-menos-32-caracteres-aqui` | Sim |
| `CERT_ENCRYPTION_KEY` | `sua-chave-para-criptografar-certificados-aqui` | Sim |
| `FRONTEND_URL` | `https://medvante.vercel.app` | Sim |
| `PORT` | `3000` | Sim |
| `NODE_ENV` | `production` | Sim |
| `START_JOBS` | `true` | Sim |
| `SEFAZ_AMBIENTE` | `2` *(1=produção, 2=homologação)* | Sim |
| `NFSE_AMBIENTE` | `homologacao` | Sim |
| `SEFAZ_CERT_PATH` | *(caminho do certificado no servidor)* | Se for emitir NF-e |
| `SEFAZ_CERT_PASSWORD` | *(senha do certificado)* | Se for emitir NF-e |
| `NFSE_INSCRICAO_MUNICIPAL` | *(inscrição municipal do prestador)* | Se for emitir NFS-e |

> **Atenção:** `JWT_SECRET` e `CERT_ENCRYPTION_KEY` devem ser diferentes das usadas em desenvolvimento. Gere valores aleatórios com no mínimo 32 caracteres.

### 1.5 Verificar o deploy

1. Aguarde o deploy terminar (pode levar 2-3 minutos na primeira vez)
2. Acesse a URL gerada pelo Railway + `/api/health`
3. Deve retornar: `{ "status": "ok", "timestamp": "..." }`

---

## 2. Deploy do Frontend no Vercel

### 2.1 Importar o projeto

1. Acesse https://vercel.com e faça login com GitHub
2. Clique em **Add New** → **Project**
3. Selecione o repositório `victoriasilva3989/Medvante`
4. Na tela de configuração, **não mexa no Root Directory** (deixe como `./`)

### 2.2 Configurar variável de ambiente

No Vercel, vá em **Environment Variables** e adicione:

| Variável | Valor |
|---|---|
| `VITE_API_URL` | `https://backend-production-xxxx.up.railway.app` |

> Substitua `https://backend-production-xxxx.up.railway.app` pela URL gerada pelo Railway (a mesma do `/api/health`).

### 2.3 Configurar Framework

O Vercel deve detectar automaticamente o **Vite** como framework. Verifique:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 2.4 Deploy

1. Clique em **Deploy**
2. Aguarde o build terminar (cerca de 1-2 minutos)
3. Acesse a URL gerada (ex: `https://medvante.vercel.app`)

---

## 3. Pós-deploy

### 3.1 Criar primeiro usuário

Como o banco está vazio, você precisa criar o primeiro usuário via API:

```bash
curl -X POST https://backend-production-xxxx.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medvante.com","password":"senha-forte-aqui","nome":"Administrador","role":"admin"}'
```

### 3.2 Atualizar FRONTEND_URL no Railway

Depois que o Vercel gerar a URL do frontend, volte ao Railway e atualize:

```
FRONTEND_URL = https://medvante.vercel.app
```

Isso é necessário para o CORS funcionar corretamente.

### 3.3 Testar o login

Acesse `https://medvante.vercel.app/login` e faça login com o email/senha cadastrados.

---

## 4. Variáveis de Ambiente — Resumo

### Vercel (Frontend)
```
VITE_API_URL=https://backend-production-xxxx.up.railway.app
```

### Railway (Backend)
```
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://...(gerado pelo Railway)...
JWT_SECRET=<mínimo 32 caracteres, aleatório>
CERT_ENCRYPTION_KEY=<mínimo 32 caracteres, aleatório>
FRONTEND_URL=https://medvante.vercel.app
START_JOBS=true
SEFAZ_AMBIENTE=2
NFSE_AMBIENTE=homologacao
```

---

## 5. Solução de Problemas

| Problema | Causa provável | Solução |
|---|---|---|
| 404 ao navegar | SPA routing sem rewrites | O `vercel.json` já resolve isso |
| CORS error | `FRONTEND_URL` no Railway aponta para URL errada | Atualize com a URL exata do Vercel |
| 502 Bad Gateway | Backend não iniciou ou crashou | Veja os logs no Railway |
| 401 Token inválido | JWT_SECRET diferente entre sessões | Mantenha o mesmo JWT_SECRET sempre |
| Banco não encontrado | DATABASE_URL errada ou migrations não rodaram | Verifique as variáveis e rode migrations manualmente |
| "Muitas requisições" | Rate limit atingido | Espere 15 minutos |
