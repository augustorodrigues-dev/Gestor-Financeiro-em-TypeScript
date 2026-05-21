# FinanceFlow 💸  
### Plataforma Web de Gestão Financeira Pessoal

O **FinanceFlow** é uma aplicação web full stack desenvolvida para auxiliar usuários no controle da vida financeira de forma simples, moderna e intuitiva.

O sistema permite registrar transações financeiras, visualizar saldo dinâmico atualizado e cadastrar contas vinculadas a instituições financeiras reais utilizando dados da [Brasil API](https://brasilapi.com.br).

O projeto foi estruturado seguindo padrões modernos de desenvolvimento, utilizando um ecossistema TypeScript ponta a ponta, isolamento de banco de dados via Docker, testes automatizados e execução simultânea das camadas da aplicação.

---

# ✨ Funcionalidades

- 📊 **Controle de Receitas e Despesas**  
  Registro completo de entradas e saídas financeiras (CRUD de transações).

- 💰 **Saldo Total Dinâmico**  
  Atualização automática baseada no somatório das contas e transações salvas no banco de dados.

- 🏦 **Cadastro de Contas Bancárias**  
  Integração com instituições financeiras reais listadas via Brasil API.

- 🧪 **Testes de Integração Automatizados**  
  Cobertura de rotas HTTP, validações de erro, persistência e teardown automático.

- 🐳 **Ambiente Isolado com Docker**  
  Inicialização rápida do PostgreSQL e pgAdmin4 sem necessidade de instalação nativa.

- ⚡ **Execução Unificada**  
  Front-end e back-end executados simultaneamente utilizando um único comando.

- 🛠️ **Arquitetura em Camadas**  
  Separação organizada entre rotas, controllers, services e testes.

---

# 🚀 Tecnologias Utilizadas

## Front-end

- React 18
- Vite
- TypeScript
- Tailwind CSS

## Back-end

- Node.js
- Express
- TypeScript
- Prisma ORM
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`

## Banco de Dados & Infraestrutura

- PostgreSQL 15
- Docker
- Docker Compose
- pgAdmin4

## Qualidade & Testes

- Jest
- ts-jest
- Supertest

## API Externa

- Brasil API

---

# 📁 Estrutura do Projeto

```text
GESTOR-FINANCEIRO-EM-TYPESCRIPT/
│
├── backend/
│   │
│   ├── coverage/
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── 20260519170358_init_financeflow_db/
│   │   │       └── migration.sql
│   │   │
│   │   ├── migration_lock.toml
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   └── TransactionController.ts
│   │   │
│   │   ├── routes/
│   │   │   └── transaction.routes.ts
│   │   │
│   │   ├── services/
│   │   │   ├── brasilApiService.ts
│   │   │   └── TransactionService.ts
│   │   │
│   │   └── server.ts
│   │
│   ├── tests/
│   │   └── transactions.integration.test.ts
│   │
│   ├── jest.config.ts
│   ├── package.json
│   ├── prisma.config.ts
│   ├── .env
│   └── tsconfig.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Login.tsx
│   │   │
│   │   ├── services/
│   │   │   └── transactionService.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   │
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docker-compose.yml
├── package.json
├── .gitignore
└── README.md
```

---

# ⚙️ Pré-requisitos

Antes de executar o projeto, certifique-se de possuir instalado:

- Node.js v20+
- NPM
- Docker
- Docker Compose
- Git

---

# 🛠️ Configuração do Ambiente

## 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/augustorodrigues-dev/Gestor-Financeiro-em-TypeScript.git

cd Gestor-Financeiro-em-TypeScript
```

---

## 2️⃣ Instalar as Dependências

O projeto utiliza ambientes isolados para front-end e back-end.

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

O PostgreSQL ficará disponível na porta:

```text
http://localhost:5050
```

---

## 4️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta `backend/`:

```env
DATABASE_URL="postgresql://admin:adminpassword@localhost:5433/financeflow_local"
```

---

## 5️⃣ Executar as Migrations do Prisma

Dentro da pasta `backend/`:

```bash
npx prisma generate

npx prisma migrate dev --name init_local
```

Esses comandos irão:

- Gerar o Prisma Client
- Criar as tabelas do banco PostgreSQL
- Aplicar as migrations automaticamente

---

# 💻 Como Executar a Aplicação

O projeto utiliza o pacote `concurrently` para executar front-end e back-end simultaneamente.

Na raiz do projeto:

```bash
npm run dev
```

---

# 🌐 Endereços da Aplicação

## 🔵 Back-end (API REST)

```text
http://localhost:3001
```

## 🔴 Front-end (React Web App)

```text
http://localhost:5173
```

---

# 🧪 Qualidade de Código & Testes

O back-end conta com uma suíte de testes de integração automatizados utilizando Jest e Supertest.

## Executar Testes + Coverage

Dentro da pasta `backend/`:

```bash
npm run test:coverage
```

---

# ✅ Estratégia de Testes

A suíte de testes cobre:

- ✔️ Criação de transações válidas
- ✔️ Validação de payloads inválidos
- ✔️ Listagem dinâmica de registros
- ✔️ Atualização parcial de dados
- ✔️ Exclusão automatizada (teardown)
- ✔️ Testes de integração HTTP ponta a ponta

A aplicação mantém uma meta de cobertura superior a **70%** nas principais camadas de negócio.

---

# 📊 Gerenciamento Visual com pgAdmin4

O pgAdmin4 está disponível para administração visual do banco de dados.

## 🔐 Acesso

```text
http://localhost:5050
```

## Credenciais

```text
E-mail: admin@financeflow.com
Senha: admin
```

---

## ⚙️ Configuração do Servidor no pgAdmin

### Aba General

```text
Name: FinanceFlow Local
```

### Aba Connection

```text
Host name/address: db
Port: 5432
Maintenance database: financeflow_local
Username: admin
Password: adminpassword
```

---

# 🔄 Integração com a Brasil API

O sistema consome dados da Brasil API para validar instituições financeiras reais durante o cadastro de contas bancárias.

## Endpoint Consumido

```text
https://brasilapi.com.br/api/banks/v1
```

## Objetivo da Integração

- Evitar erros de digitação
- Utilizar códigos ISPB oficiais
- Padronizar nomes bancários
- Garantir consistência dos dados

---

# 📌 Diretrizes da Arquitetura

O desenvolvimento foi estruturado seguindo separação clara de responsabilidades:

## Routes

Responsáveis pelo mapeamento dos endpoints HTTP e distribuição das requisições.

## Controllers

Responsáveis por:

- Validação inicial
- Tratamento de exceções
- Respostas HTTP
- Intermediação entre requisição e regra de negócio

## Services

Responsáveis por:

- Regras de negócio
- Integração com APIs externas
- Persistência de dados via Prisma ORM