# FinanceFlow 💸

## Plataforma Web de Gestão Financeira Pessoal

O **FinanceFlow** é uma aplicação web full stack desenvolvida para auxiliar usuários no controle da vida financeira de forma simples, moderna e segura.

O sistema permite registrar transações financeiras, visualizar saldo dinâmico atualizado, cadastrar contas vinculadas a instituições financeiras reais utilizando dados da [Brasil API](https://brasilapi.com.br) e gerenciar cartões de crédito de ponta a ponta.

Com os recentes avanços, a plataforma agora conta com sistema de autenticação, níveis de acesso, um painel administrativo completo e uma arquitetura blindada por uma **Pirâmide de Testes Automatizados** (Unitários, Integração e E2E). O código também passou por refatorações de Clean Code, isolando constantes e melhorando a manutenibilidade.

O projeto foi estruturado seguindo padrões modernos de desenvolvimento, utilizando um ecossistema TypeScript ponta a ponta, isolamento de banco de dados via Docker, testes automatizados e segurança com JSON Web Tokens (JWT).

---

# ✨ Funcionalidades

## 🔐 Autenticação e Autorização

Sistema de login e cadastro com criptografia de senhas utilizando **Bcrypt** e controle de acesso baseado em papéis (**USER** e **ADMIN**).

---

## 👑 Painel Administrativo

Área exclusiva para administradores realizarem a gestão completa (**CRUD**) dos usuários e definirem privilégios de acesso.

---

## 📊 Controle de Receitas e Despesas

Registro completo de entradas e saídas financeiras (**CRUD de transações**) vinculadas a contas específicas.

---

## 💳 Gestão de Cartões de Crédito

Módulo completo para cadastro de cartões, acompanhamento de faturas e cálculo matemático automático de limite disponível em tempo real, incluindo travas de segurança contra exclusão indevida.

---

## 💰 Saldo Total Dinâmico

Atualização automática baseada no somatório das contas, transações e faturas salvas no banco de dados.

---

## 🏦 Cadastro de Contas Bancárias (Filtragem Inteligente)

Integração com instituições financeiras reais listadas via [Brasil API](https://brasilapi.com.br). O sistema conta com um filtro modular otimizado que exibe apenas as principais instituições financeiras do país, garantindo uma interface limpa.

---

## 🌱 Database Seeding Automático

População de dados inicial (usuários padrão, administradores, contas e transações de teste) com um único comando para facilitar o ambiente de desenvolvimento.

---

## 🐳 Ambiente Isolado com Docker

Inicialização rápida do PostgreSQL e pgAdmin4 sem necessidade de instalação nativa.

---

## ⚡ Execução Unificada

Front-end e back-end executados simultaneamente utilizando um único comando.

---

# 🚀 Tecnologias Utilizadas

## Front-end

* React 18
* Vite
* TypeScript
* Tailwind CSS

---

## Back-end

* Node.js
* Express
* TypeScript
* Prisma ORM
* bcrypt
* JSON Web Token (JWT)

---

## Banco de Dados & Infraestrutura

* PostgreSQL 15
* Docker & Docker Compose
* pgAdmin4

---

## Qualidade & Testes (Pirâmide Completa)

* Jest & ts-jest (Testes Unitários e de Integração)
* Supertest (Mock de Requisições HTTP)
* Cypress (Testes End-to-End / E2E)

---

# 📁 Estrutura do Projeto

```plaintext id="s2vl0v"
GESTOR-FINANCEIRO-EM-TYPESCRIPT/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── CreditCardController.ts
│   │   │   ├── TransactionController.ts
│   │   │   └── userController.ts
│   │   ├── routes/
│   │   │   ├── creditCard.routes.ts
│   │   │   ├── transaction.routes.ts
│   │   │   └── userRoutes.ts
│   │   ├── services/
│   │   │   ├── brasilApiService.ts
│   │   │   ├── CreditCardService.ts
│   │   │   ├── TransactionService.ts
│   │   │   └── UserService.ts
│   │   └── server.ts
│   └── tests/
│       ├── CreditCardService.test.ts
│       ├── creditCard.integration.test.ts
│       └── transactions.integration.test.ts
│
├── frontend/
│   ├── cypress/
│   │   └── e2e/
│   │       ├── creditCard.cy.ts
│   │       └── users.cy.ts
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── CreditCardManager.tsx
│   │   ├── services/
│   │   └── App.tsx
│   └── cypress.config.ts
│
├── docker-compose.yml
└── package.json
```

---

# ⚙️ Pré-requisitos

Antes de executar o projeto, certifique-se de possuir instalado:

* Node.js v20+
* NPM
* Docker e Docker Compose
* Git

---

# 🛠️ Configuração do Ambiente

## 1️⃣ Clonar o Repositório

```bash id="7w7jq4"
git clone https://github.com/augustorodrigues-dev/Gestor-Financeiro-em-TypeScript.git

cd Gestor-Financeiro-em-TypeScript
```

---

## 2️⃣ Instalar as Dependências

```bash id="7omtrw"
# Dependências da raiz, backend e frontend
npm install

cd backend && npm install

cd ../frontend && npm install
```

---

## 3️⃣ Subir a Infraestrutura Docker

Na raiz do projeto, execute:

```bash id="ok7yjp"
docker compose up -d
```

---

## 4️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta `backend/`:

```env id="mwbjcd"
DATABASE_URL="postgresql://admin:adminpassword@localhost:5433/financeflow_local"

JWT_SECRET="chave_teste"
```

---

## 5️⃣ Executar Migrations e Preparar o Banco

Dentro da pasta `backend/`:

```bash id="i9oj3x"
npx prisma generate

npx prisma migrate dev --name init_local

npx prisma db seed
```

---

# 💻 Como Executar a Aplicação

O projeto utiliza o pacote `concurrently` para executar front-end e back-end simultaneamente.

Na raiz do projeto, execute:

```bash id="1i8bfb"
npm run dev
```

---

# 🌐 Endereços da Aplicação

| Serviço           | URL                   |
| ----------------- | --------------------- |
| Front-end (React) | http://localhost:5173 |
| Back-end (API)    | http://localhost:3001 |
| pgAdmin4          | http://localhost:5050 |

---

# 🧪 Qualidade de Código & Testes

A aplicação possui uma arquitetura robusta validada por uma pirâmide de testes completa, garantindo a integridade desde a regra de negócio até a interface gráfica do usuário final.

---

## 🔬 Testes Unitários e de Integração (Backend)

Cobrem lógicas matemáticas, travas de segurança, rotas HTTP e persistência real no banco de dados.

Executados com Jest e Supertest.

```bash id="h67v4m"
cd backend

npm test
```

---

## 🖥️ Testes End-to-End (E2E) - Frontend

Simulam o comportamento real do usuário interagindo com a interface gráfica, garantindo que o fluxo completo (login, navegação, preenchimento de formulários e exclusão visual) funcione perfeitamente.

Executados com Cypress.

```bash id="qf2jcb"
cd frontend

npx cypress open
```

---

## ✅ Principais Cenários Cobertos

* ✔️ Gestão de Cartões: Cadastro de cartões de crédito na interface com validação de renderização.
* ✔️ Segurança e Validação: Bloqueio de exclusão de cartões com faturas ativas.
* ✔️ Integração Real: Injeção de Bearer Tokens reais nos testes de rotas protegidas.
* ✔️ Teardown Automático: Limpeza do banco de dados ao fim da suíte utilizando requisições DELETE controladas.

---

# 📊 Gerenciamento Visual com pgAdmin4

O pgAdmin4 está disponível para administração visual do banco de dados.

---

## 🔑 Credenciais de Login

```plaintext id="t20vl4"
Email: admin@financeflow.com
Senha: admin
```

---

## ⚙️ Configuração do Servidor

| Campo                | Valor             |
| -------------------- | ----------------- |
| Host name/address    | db                |
| Port                 | 5432              |
| Maintenance database | financeflow_local |
| Username             | admin             |
| Password             | adminpassword     |

---

# 📌 Diretrizes da Arquitetura

O desenvolvimento foi estruturado seguindo o padrão de arquitetura em camadas (MVC adaptado) e princípios de Clean Code.

---

## Routes

Responsáveis pelo mapeamento dos endpoints HTTP e aplicação de middlewares de segurança.

---

## Controllers

Responsáveis pelo tratamento de exceções e envio das respostas HTTP.

---

## Services

Responsáveis pelas regras de negócio rigorosas e persistência de dados utilizando Prisma ORM.

---

## Utils / Constants

Isolamento de dados estáticos para manter os serviços enxutos e organizados.

---

# 👨‍💻 Autor

Desenvolvido por **Augusto Rodrigues** 🚀
