# FinanceFlow 💸
### Plataforma Web de Gestão Financeira Pessoal

O **FinanceFlow** é uma aplicação web full stack desenvolvida para auxiliar usuários no controle da vida financeira de forma simples, moderna e intuitiva. O sistema permite registrar transações financeiras, visualizar saldo dinâmico atualizado e cadastrar contas vinculadas a instituições financeiras reais utilizando dados da **Brasil API**.

O projeto foi estruturado seguindo padrões modernos de desenvolvimento, utilizando um ecossistema TypeScript ponta a ponta, isolamento de banco de dados via Docker e execução simultânea das camadas da aplicação.

---

# ✨ Funcionalidades

- 📊 **Controle de Receitas e Despesas**  
  Registro detalhado de entradas e saídas financeiras.

- 💰 **Saldo Total Dinâmico**  
  Atualização automática baseada no somatório das contas e transações salvas no banco de dados.

- 🏦 **Cadastro de Contas Bancárias**  
  Integração com instituições financeiras reais listadas via Brasil API.

- 🐳 **Ambiente Isolado com Docker**  
  Inicialização rápida do PostgreSQL e pgAdmin4 sem necessidade de instalação nativa do banco.

- ⚡ **Execução Unificada**  
  Script maestro configurado para rodar Front-end e Back-end simultaneamente utilizando um único terminal.

- 🛠️ **Arquitetura em Camadas**  
  Separação organizada entre controllers, services e rotas da API.

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
- `@prisma/adapter-pg`
- `pg`

## Banco de Dados & Infraestrutura
- PostgreSQL 15
- Docker
- Docker Compose
- pgAdmin4

## API Externa
- Brasil API

---

# 📁 Estrutura do Projeto

O projeto segue uma arquitetura multi-camadas organizada para facilitar manutenção, escalabilidade e separação de responsabilidades.

```text
GESTOR-FINANCEIRO-EM-TYPESCRIPT/
│
├── backend/                          # API REST e Camada de Dados
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
│   │   ├── controllers/             # Requisições e respostas HTTP
│   │   │   └── TransactionController.ts
│   │   │
│   │   ├── routes/                  # Endpoints da API
│   │   │   └── transaction.routes.ts
│   │   │
│   │   ├── services/                # Regras de negócio e integrações
│   │   │   ├── brasilApiService.ts
│   │   │   └── TransactionService.ts
│   │   │
│   │   └── server.ts                # Inicialização do Express
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma.config.ts
│   ├── .env
│   └── tsconfig.json
│
├── frontend/                        # Interface Web React
│   │
│   ├── src/
│   │   ├── components/              # Componentes visuais
│   │   ├── services/                # Comunicação HTTP com a API
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docker-compose.yml               # Containers PostgreSQL + pgAdmin4
├── package.json                     # Script maestro com concurrently
├── .gitignore
└── README.md
```

---

# ⚙️ Pré-requisitos

Antes de executar o projeto, certifique-se de possuir instalado:

- Node.js v20+ ou superior
- NPM
- Docker
- Docker Compose
- Git

---

# 🛠️ Configuração do Ambiente

## 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/augustorodrigues-dev/Gestor-Financeiro-em-TypeScript.git
```

```bash
cd Gestor-Financeiro-em-TypeScript
```

---

## 2️⃣ Instalar as Dependências

O projeto utiliza dependências separadas entre raiz, backend e frontend.

Execute os comandos abaixo:

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

O projeto utiliza Docker Compose para inicializar:

- PostgreSQL
- pgAdmin4

Execute o comando abaixo na raiz do projeto:

```bash
docker compose up -d
```

O banco PostgreSQL ficará exposto externamente na porta:

```text
localhost:5433
```

---

## 4️⃣ Configurar as Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta `backend/`:

```env
DATABASE_URL="postgresql://admin:adminpassword@localhost:5433/financeflow_local"
```

---

## 5️⃣ Executar as Migrations do Prisma

Com os containers rodando, execute:

```bash
cd backend
```

```bash
npx prisma generate
```

```bash
npx prisma migrate dev --name init_local
```

Esses comandos irão:

- gerar os tipos TypeScript do Prisma
- sincronizar o schema
- criar as tabelas no PostgreSQL

---

# 💻 Como Executar a Aplicação

O projeto utiliza o pacote `concurrently` na raiz para executar Front-end e Back-end simultaneamente.

Na raiz do projeto, execute:

```bash
npm run dev
```

---

## 🌐 Endereços da Aplicação

### 🔵 Back-end
```text
http://localhost:3001
```

### 🔴 Front-end
```text
http://localhost:5173
```

---

# 📊 Gerenciamento Visual com pgAdmin4

O pgAdmin4 está disponível para administração visual do banco de dados.

## Acesso

```text
http://localhost:5050
```

## Credenciais de Login

```text
E-mail: admin@financeflow.com
Senha: admin
```

---

## Configuração do Servidor no pgAdmin

Ao acessar o pgAdmin pela primeira vez, registre um novo servidor utilizando os dados abaixo:

### Aba "General"
```text
Name: FinanceFlow Local
```

### Aba "Connection"
```text
Host name/address: db
Port: 5432
Maintenance database: financeflow_local
Username: admin
Password: adminpassword
```

---

# 🔄 Integração com a Brasil API

O sistema utiliza a **Brasil API** para consultar instituições financeiras reais do Brasil.

Endpoint utilizado:

```text
https://brasilapi.com.br/api/banks/v1
```

Essa integração permite que o sistema utilize dados bancários reais durante o cadastro de contas.

---

# 🗄️ Banco de Dados

O projeto utiliza:

- PostgreSQL 15
- Prisma ORM
- Prisma Migrations
- Docker Compose
- pgAdmin4

A arquitetura atual foi preparada para futura migração para ambientes cloud, incluindo suporte ao Neon Database.

---

# 📌 Arquitetura Utilizada

O Back-end segue uma arquitetura baseada em separação de responsabilidades:

## Controllers
Responsáveis por:
- receber requisições HTTP
- validar entradas
- retornar respostas da API

## Services
Responsáveis por:
- regras de negócio
- integrações externas
- comunicação com Prisma ORM

## Routes
Responsáveis por:
- mapear endpoints da aplicação
- organizar a estrutura da API REST

---

# 🎯 Objetivo do Projeto

O FinanceFlow foi desenvolvido com foco em:

- aprendizado de arquitetura full stack moderna
- integração entre React + Node.js
- utilização profissional de TypeScript
- utilização de Prisma ORM
- containerização com Docker
- consumo de APIs externas
- organização escalável de projetos