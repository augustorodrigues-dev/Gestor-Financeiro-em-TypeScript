# FinanceFlow 💸

## Plataforma Web de Gestão Financeira Pessoal

O **FinanceFlow** é uma aplicação web *full stack* (TypeScript de ponta a ponta) para
controle financeiro pessoal: registro de receitas e despesas, saldo consolidado em
tempo real, contas vinculadas a instituições financeiras reais (via **Brasil API**),
cartões de crédito com cálculo de fatura/limite, categorias, metas financeiras e um
painel administrativo com controle de acesso por papéis.

O banco de dados é **local em arquivo (SQLite)** — não exige Docker, servidor de banco
nem conexão com a internet para funcionar.

> 📚 **Documentação completa do projeto** (casos de uso, casos de teste, cobertura e
> análise estática) na pasta **[`docs/`](./docs/README.md)**.

---

## 🚀 Início Rápido (Windows — scripts `.bat`)

Para a forma mais simples de rodar tudo, **dê dois cliques** (nesta ordem):

| Script | O que faz |
| ------ | --------- |
| **`instalar.bat`** | Instala todas as dependências (raiz, backend, frontend), cria o `.env`, gera o Prisma Client, cria o banco SQLite local (`backend/dev.db`) e popula os dados de exemplo. |
| **`rodar-site.bat`** | Inicia backend + frontend juntos e abre o navegador. |
| **`rodar-testes.bat`** | Menu para rodar testes unitários, de integração, cobertura e E2E. |

> Pré-requisitos: **Node.js 20+** e **Git**. (Não precisa de Docker.)

---

## 🧰 Stack Tecnológica

| Camada | Tecnologias |
| ------ | ----------- |
| **Front-end** | React 18, Vite, TypeScript, Tailwind CSS |
| **Back-end** | Node.js, Express, TypeScript, Prisma ORM 7, JWT, Bcrypt |
| **Banco de dados** | **SQLite** (arquivo local) via Prisma + driver adapter `better-sqlite3` |
| **Testes** | Jest + ts-jest + Supertest (back-end), Vitest + Testing Library (front-end), Cypress (E2E) |
| **Qualidade** | ESLint + typescript-eslint, SonarQube/SonarCloud, `npm audit` |

A justificativa detalhada da stack está em
[`docs/01-VISAO-GERAL-E-JUSTIFICATIVA-TECNICA.md`](./docs/01-VISAO-GERAL-E-JUSTIFICATIVA-TECNICA.md).

---

## 📁 Estrutura do Projeto

```text
Gestor-Financeiro-em-TypeScript/
│
├── instalar.bat            # Instala tudo e prepara o banco local
├── rodar-site.bat          # Sobe o site (backend + frontend)
├── rodar-testes.bat        # Executa a suite de testes
├── sonar-project.properties# Configuração do SonarQube/SonarCloud
├── package.json            # Scripts orquestradores (concurrently)
│
├── docs/                   # Documentação técnica (casos de uso, testes, etc.)
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # Modelo de dados (provider: sqlite)
│   │   └── migrations/     # Migrations versionadas (recriam o banco)
│   │   └── (dev.db é criado em backend/dev.db pelas migrations — ignorado no Git)
│   ├── src/
│   │   ├── controllers/    # Tratamento HTTP (I/O e exceções)
│   │   ├── middlewares/    # authMiddleware (JWT)
│   │   ├── routes/         # Endpoints REST
│   │   ├── services/       # Regras de negócio + Prisma + brasilApiService
│   │   ├── prisma.ts       # Prisma Client + adapter SQLite (better-sqlite3)
│   │   ├── seed.ts         # Carga de dados de exemplo
│   │   └── server.ts       # Bootstrap do Express
│   ├── tests/              # Testes unitarios (*Service.test.ts) e de integracao (*.integration.test.ts)
│   ├── eslint.config.mjs   # Análise estática (ESLint flat config)
│   └── jest.config.ts      # Config de testes + threshold de cobertura (75%)
│
└── frontend/
    ├── src/
    │   ├── pages/          # Login, Register, Dashboard, Wallet, AdminPanel
    │   ├── components/     # AccountManager, CategoryManager, CreditCardManager, GoalManager
    │   ├── services/       # Cliente HTTP da API
    │   └── App.tsx
    └── cypress/e2e/        # Testes End-to-End
```

---

## ⚙️ Instalação Manual (alternativa aos `.bat`)

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/augustorodrigues-dev/Gestor-Financeiro-em-TypeScript.git
cd Gestor-Financeiro-em-TypeScript

# Instala raiz + backend + frontend de uma vez
npm run install:all
```

### 2. Configurar variáveis de ambiente

```bash
cd backend
cp .env.example .env      # Windows (PowerShell): Copy-Item .env.example .env
cd ..
```

Conteúdo padrão do `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="financeflow_super_secret_key_dev"
PORT=3001
```

### 3. Preparar o banco de dados local (SQLite)

```bash
cd backend
npm run prisma:generate           # Gera o Prisma Client
npm run db:migrate                # Cria backend/dev.db e aplica as migrations
npm run db:seed                   # Popula dados de exemplo
cd ..
```

### 4. Executar a aplicação

```bash
npm run dev                       # Sobe backend + frontend simultaneamente
```

---

## 🌐 Endereços da Aplicação

| Serviço | URL |
| ------- | --- |
| Front-end (React) | http://localhost:5173 |
| Back-end (API) | http://localhost:3001 |

### 🔑 Credenciais de Teste (após o seed)

| Perfil | E-mail | Senha |
| ------ | ------ | ----- |
| Usuário | `jadao@gmail.com` | `1234` |
| Usuário | `nando@gmail.com` | `1234` |
| **Administrador** | `alexandra@gmail.com` | `1234` |

> 💡 Para inspecionar o banco visualmente, abra `backend/dev.db` em qualquer
> ferramenta SQLite (ex.: extensão *SQLite Viewer* do VS Code, *DB Browser for SQLite*)
> ou rode `npx prisma studio` dentro de `backend/`.

---

## 🧪 Testes e Qualidade

A aplicação é validada por uma **pirâmide de testes em 3 níveis**.
**Resultado atual: 119 testes automatizados aprovados** (39 unitários de back-end +
39 unitários de front-end + 41 de integração) **+ 5 fluxos E2E**, com **cobertura de
back-end de ~89%** e **front-end de ~98% (linhas)**.

```bash
# Back-end (a partir de backend/ ou via raiz com npm --prefix)
npm test                  # Unitários + integração
npm run test:unit         # Apenas unitários (não tocam o banco)
npm run test:integration  # Apenas integração (usam o SQLite local)
npm run test:coverage     # Tudo + relatório de cobertura (backend/coverage/)
npm run lint              # Análise estática (ESLint)

# Front-end — testes unitários (Vitest + Testing Library)
cd frontend
npm test                  # Testes unitários do front-end
npm run test:coverage     # Com cobertura (frontend/coverage/)

# Front-end — E2E (com o site rodando em http://localhost:5173)
npm run cypress:open      # Modo interativo
npm run cypress:run       # Modo headless
```

**Análise estática de qualidade** (a partir da raiz):

```bash
npm run quality              # ESLint (code smells/complexidade) + jscpd (duplicação)
npm run quality:duplication  # Apenas o relatório de duplicação (jscpd)
```

Detalhes da estratégia, do relatório de cobertura e da análise estática:

- [`docs/04-ESTRATEGIA-E-RELATORIO-DE-TESTES.md`](./docs/04-ESTRATEGIA-E-RELATORIO-DE-TESTES.md)
- [`docs/05-RELATORIO-ANALISE-ESTATICA.md`](./docs/05-RELATORIO-ANALISE-ESTATICA.md)

---

## ✨ Principais Funcionalidades

- 🔐 **Autenticação e Autorização** — login/cadastro com Bcrypt e papéis (USER/ADMIN).
- 👑 **Painel Administrativo** — CRUD de usuários e gestão de privilégios.
- 📊 **Receitas e Despesas** — CRUD de transações com saldo recalculado automaticamente.
- 💳 **Cartões de Crédito** — cálculo automático de fatura e limite disponível, com travas de exclusão.
- 🏦 **Contas Bancárias** — vinculadas a instituições reais via **Brasil API**.
- 🏷️ **Categorias** — padrão do sistema + personalizadas.
- 🎯 **Metas Financeiras** — progresso percentual e aportes.
- 💰 **Saldo Consolidado** — somatório dinâmico das contas.

---

## 👨‍💻 Equipe

Projeto desenvolvido para a disciplina de **Qualidade de Software** (CESUPA).

- Augusto Rodrigues
- Cauê Barroso
- César Ribeiro
- Fernando Fonseca

> Caso algum nome precise de ajuste, edite esta seção.
