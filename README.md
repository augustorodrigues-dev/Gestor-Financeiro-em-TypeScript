# FinanceFlow 💸

### Plataforma Web de Gestão Financeira Pessoal

O **FinanceFlow** é uma aplicação web full stack desenvolvida para auxiliar usuários no controle da vida financeira de forma simples, moderna e segura.

O sistema permite criar contas de usuário, registrar transações financeiras, visualizar um saldo dinâmico (com recálculo automatizado via transações ACID) e cadastrar contas vinculadas a instituições financeiras reais utilizando dados da [Brasil API](https://brasilapi.com.br).

O projeto foi estruturado seguindo padrões modernos de desenvolvimento, utilizando um ecossistema TypeScript ponta a ponta, isolamento de banco de dados via Docker, testes automatizados e segurança de ponta a ponta com JSON Web Tokens (JWT).

---

# ✨ Funcionalidades

* 🔐 **Autenticação e Segurança (JWT)**
  Login e Registro de usuários com senhas criptografadas (Bcrypt). Todas as rotas da API são protegidas e o isolamento de dados por usuário é garantido pelo Token.

* 👥 **Gestão de Sessões e Perfis**
  Separação de permissões entre usuários comuns e administradores (Admin Panel), além de controle de encerramento de sessão seguro.

* 📊 **Controle de Receitas e Despesas**
  Registro completo de entradas e saídas financeiras (CRUD completo de transações integrado ao banco de dados).

* 💰 **Saldo Total Dinâmico e Seguro**
  Atualização automática do saldo das contas utilizando operações transacionais ACID (`prisma.$transaction`), garantindo consistência matemática entre as tabelas.

* 🏦 **Cadastro de Contas Bancárias**
  Integração com instituições financeiras reais listadas via Brasil API, com regras de negócio que impedem a exclusão de contas com histórico ativo.

* 🧪 **Testes de Integração Automatizados**
  Cobertura de rotas HTTP, validações de erro, persistência e teardown automático.

* 🐳 **Ambiente Isolado com Docker**
  Inicialização rápida do PostgreSQL e pgAdmin4 sem necessidade de instalação nativa.

* ⚡ **Execução Unificada**
  Front-end e back-end executados simultaneamente utilizando um único comando.

---

# 🚀 Tecnologias Utilizadas

## Front-end

* React 18
* Vite
* TypeScript
* Tailwind CSS

## Back-end

* Node.js
* Express
* TypeScript
* Prisma ORM (`@prisma/client`, `@prisma/adapter-pg`)
* PostgreSQL (`pg`)
* JSON Web Token (JWT)
* Bcryptjs

## Banco de Dados & Infraestrutura

* PostgreSQL 15
* Docker & Docker Compose
* pgAdmin4

## Qualidade & Testes

* Jest
* ts-jest
* Supertest

## API Externa

* Brasil API (Instituições Bancárias)

---

# 📁 Estrutura do Projeto

```text
GESTOR-FINANCEIRO-EM-TYPESCRIPT/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── AccountController.ts
│   │   │   └── TransactionController.ts
│   │   ├── middlewares/
│   │   │   └── authMiddleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── account.routes.ts
│   │   │   └── transaction.routes.ts
│   │   ├── services/
│   │   │   ├── AuthService.ts
│   │   │   ├── AccountService.ts
│   │   │   └── TransactionService.ts
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AccountManager.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── accountService.ts
│   │   │   └── transactionService.ts
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

# ⚙️ Pré-requisitos

Antes de executar o projeto, certifique-se de possuir instalado:

* Node.js v20+
* NPM
* Docker
* Docker Compose
* Git

---

# 🛠️ Configuração do Ambiente

## 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/augustorodrigues-dev/Gestor-Financeiro-em-TypeScript.git

cd Gestor-Financeiro-em-TypeScript
```

---

## 2️⃣ Instalar as Dependências

O projeto utiliza ambientes isolados para front-end e back-end, integrados na raiz.

```bash
# Dependências da raiz
npm install

# Dependências do backend
cd backend
npm install

# Dependências do frontend
cd ../frontend
npm install
```

---

## 3️⃣ Subir a Infraestrutura Docker

Execute na raiz do projeto:

```bash
docker compose up -d
```

---

## 4️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta `backend/`:

```env
DATABASE_URL="postgresql://admin:adminpassword@localhost:5433/financeflow_local"

JWT_SECRET="sua_chave_secreta_aqui"
```

---

## 5️⃣ Executar as Migrations do Prisma

Dentro da pasta `backend/`:

```bash
npx prisma generate

npx prisma migrate dev --name init_local
```

---

# 💻 Como Executar a Aplicação

O projeto utiliza o pacote `concurrently` para executar front-end e back-end simultaneamente.

Na raiz do projeto, execute:

```bash
npm run dev
```

---

# 🌐 Endereços da Aplicação

* **Back-end (API REST):** http://localhost:3001
* **Front-end (React Web App):** http://localhost:5173
* **Banco de Dados (pgAdmin4):** http://localhost:5050

---

# 🧪 Qualidade de Código & Testes

O back-end conta com uma suíte de testes de integração automatizados utilizando Jest e Supertest.

Para executar os testes com verificação de cobertura (dentro da pasta `backend/`):

```bash
npm run test:coverage
```

A aplicação mantém uma meta de cobertura superior a 70% nas principais camadas de negócio, validando payloads, autenticação e restrições estruturais.

---

# 🔄 Integração com a Brasil API

O sistema consome dados da Brasil API para validar instituições financeiras reais durante o cadastro de contas bancárias.

* **Endpoint Consumido:**
  `https://brasilapi.com.br/api/banks/v1`

* **Objetivo:**
  Evitar erros de digitação, utilizar códigos ISPB oficiais e padronizar nomes bancários, enriquecendo a experiência do usuário.

---

# 📌 Diretrizes da Arquitetura

O desenvolvimento foi estruturado seguindo separação clara de responsabilidades:

* **Middlewares:**
  Interceptam requisições, validam tokens JWT e protegem rotas confidenciais.

* **Routes:**
  Responsáveis pelo mapeamento dos endpoints HTTP e distribuição das requisições.

* **Controllers:**
  Fazem a validação inicial, extraem o ID do usuário do Token (`req.user.id`), tratam exceções e gerenciam as respostas HTTP.

* **Services:**
  Concentram 100% das regras de negócio, bloqueios lógicos de exclusão e manipulação segura de banco de dados via Prisma ORM (garantindo operações ACID).
