# FinanceFlow 💸

## Plataforma Web de Gestão Financeira Pessoal

O **FinanceFlow** é uma aplicação web full stack desenvolvida para auxiliar usuários no controle da vida financeira de forma simples, moderna e segura.

O sistema permite registrar transações financeiras, visualizar saldo dinâmico atualizado e cadastrar contas vinculadas a instituições financeiras reais utilizando dados da [Brasil API](https://brasilapi.com.br).

Com os recentes avanços, a plataforma agora conta com sistema de autenticação, níveis de acesso e um painel administrativo completo. O código também passou por refatorações de Clean Code, isolando constantes e melhorando a manutenibilidade.

O projeto foi estruturado seguindo padrões modernos de desenvolvimento, utilizando um ecossistema TypeScript ponta a ponta, isolamento de banco de dados via Docker, testes automatizados e segurança de ponta a ponta com JSON Web Tokens (JWT).

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

## 💰 Saldo Total Dinâmico

Atualização automática baseada no somatório das contas e transações salvas no banco de dados.

---

## 🏦 Cadastro de Contas Bancárias (Filtragem Inteligente)

Integração com instituições financeiras reais listadas via [Brasil API](https://brasilapi.com.br). O sistema conta com um filtro modular otimizado que exibe apenas as principais instituições financeiras do país, garantindo uma interface limpa.

---

## 🌱 Database Seeding Automático

População de dados inicial (usuários padrão, contas e transações de teste) com um único comando para facilitar o ambiente de desenvolvimento.

---

## 🧪 Testes de Integração Automatizados

Cobertura de rotas HTTP, validações de erro, persistência e teardown automático utilizando **Jest** e **Supertest**, cobrindo fluxos de transações e gestão de usuários.

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
* @prisma/client
* @prisma/adapter-pg

---

## Banco de Dados & Infraestrutura

* PostgreSQL 15
* Docker
* Docker Compose
* pgAdmin4

---

## Qualidade & Testes

* Jest
* ts-jest
* Supertest

---

## API Externa

* [Brasil API](https://brasilapi.com.br)

---

# 📁 Estrutura do Projeto

```plaintext
GESTOR-FINANCEIRO-EM-TYPESCRIPT/
│
├── backend/
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── TransactionController.ts
│   │   │   └── userController.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── transaction.routes.ts
│   │   │   └── userRoutes.ts
│   │   │
│   │   ├── services/
│   │   │   ├── brasilApiService.ts
│   │   │   ├── TransactionService.ts
│   │   │   └── UserService.ts
│   │   │
│   │   └── server.ts
│   │
│   ├── tests/
│   │   ├── transactions.integration.test.ts
│   │   └── users.integration.test.ts
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   │
│   │   ├── services/
│   │   ├── utils/
│   │   │   └── knownBanks.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
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

## 5️⃣ Executar Migrations e Preparar o Banco

Dentro da pasta `backend/`:

```bash
npx prisma generate

npx prisma migrate dev --name init_local
```

---

## 6️⃣ Popular o Banco de Dados (Seeding)

Ainda na pasta `backend/`:

```bash
npx prisma db seed
```

Caso precise resetar completamente o banco de dados futuramente:

```bash
npx prisma migrate reset
```

---

# 💻 Como Executar a Aplicação

O projeto utiliza o pacote `concurrently` para executar front-end e back-end simultaneamente.

Na raiz do projeto, execute:

```bash
npm run dev
```

---

# 🌐 Acessos da Aplicação

| Serviço           | URL                   |
| ----------------- | --------------------- |
| Back-end (API)    | http://localhost:3001 |
| Front-end (React) | http://localhost:5173 |
| pgAdmin4          | http://localhost:5050 |

---

# 🧪 Qualidade de Código & Testes

O back-end conta com suítes de testes de integração automatizados utilizando Jest e Supertest para garantir a estabilidade do CRUD de Transações e da Gestão de Usuários.

Para executar os testes com verificação de cobertura (dentro da pasta `backend/`):

```bash
npm run test:coverage
```

---

## Estratégia de Testes

A suíte de testes cobre múltiplos cenários, incluindo:

* ✔️ CRUD de Usuários: Criação de administradores, edição de privilégios e exclusão em cascata.
* ✔️ Segurança e Validação: Bloqueio de e-mails duplicados e proteção de rotas (Erro 400 e 401).
* ✔️ Transações Seguras: Criação de transações válidas vinculadas a contas.
* ✔️ Listagem e Atualização: Testes de requisições GET e PUT com atualização de dados.
* ✔️ Teardown Automático: Limpeza do banco de dados ao fim da suíte utilizando requisições DELETE controladas.

---

# 📊 Gerenciamento Visual com pgAdmin4

O pgAdmin4 está disponível para administração visual do banco de dados via Docker.

## Credenciais de Login

```plaintext
Email: admin@financeflow.com
Senha: admin
```

---

## Configuração do Servidor no pgAdmin

| Campo                | Valor             |
| -------------------- | ----------------- |
| Name                 | FinanceFlow Local |
| Host name/address    | db                |
| Port                 | 5432              |
| Maintenance database | financeflow_local |
| Username             | admin             |
| Password             | adminpassword     |

---

# 📌 Diretrizes da Arquitetura

O desenvolvimento foi estruturado seguindo o padrão de arquitetura em camadas (MVC adaptado) e princípios de Clean Code para garantir uma separação clara de responsabilidades.

---

## Routes

Responsáveis apenas pelo mapeamento dos endpoints HTTP, aplicação de middlewares de segurança (JWT) e distribuição das requisições.

---

## Controllers

Responsáveis pela validação inicial, tratamento de exceções (`try/catch`), envio das respostas HTTP e intermediação entre as camadas.

---

## Services

Responsáveis por abrigar as regras de negócio da aplicação, integração com APIs externas, criptografia de senhas e persistência de dados utilizando o Prisma ORM (garantindo operações ACID).

---

## Utils / Constants

Isolamento de dados estáticos e de configurações externas (como os códigos da Brasil API), mantendo os serviços enxutos e fáceis de dar manutenção.

---

# 📦 Principais Recursos do Projeto

* Arquitetura Full Stack moderna com TypeScript
* Persistência de dados segura com Prisma ORM
* API REST estruturada com Express e JWT
* Banco PostgreSQL isolado via Docker
* Controle de autenticação e autorização
* Painel administrativo com gerenciamento de usuários
* Integração com API externa filtrada via dicionário estático (Clean Code)
* Duas suítes de testes automatizados de integração
* Estrutura escalável e ambiente de desenvolvimento padronizado

---

# 👨‍💻 Autor

Desenvolvido por **Augusto Rodrigues** 🚀