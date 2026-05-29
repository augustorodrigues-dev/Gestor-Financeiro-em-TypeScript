# FinanceFlow 💸  
## Plataforma Web de Gestão Financeira Pessoal

O **FinanceFlow** é uma aplicação web full stack desenvolvida para auxiliar usuários no controle da vida financeira de forma simples, moderna e segura.

O sistema permite registrar transações financeiras, visualizar saldo dinâmico atualizado e cadastrar contas vinculadas a instituições financeiras reais utilizando dados da [Brasil API](https://brasilapi.com.br).

Com os recentes avanços, a plataforma agora conta com sistema de autenticação, níveis de acesso e um painel administrativo completo.

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

## 🏦 Cadastro de Contas Bancárias
Integração com instituições financeiras reais listadas via [Brasil API](https://brasilapi.com.br).

---

## 🌱 Database Seeding Automático
População de dados inicial (usuários padrão, contas e transações de teste) com um único comando para facilitar o ambiente de desenvolvimento.

---

## 🧪 Testes de Integração Automatizados
Cobertura de rotas HTTP, validações de erro, persistência e teardown automático utilizando **Jest** e **Supertest**.

---

## 🐳 Ambiente Isolado com Docker
Inicialização rápida do PostgreSQL e pgAdmin4 sem necessidade de instalação nativa.

---

## ⚡ Execução Unificada
Front-end e back-end executados simultaneamente utilizando um único comando.

---

# 🚀 Tecnologias Utilizadas

## Front-end
- React 18
- Vite
- TypeScript
- Tailwind CSS

---

## Back-end
- Node.js
- Express
- TypeScript
- Prisma ORM
- bcrypt
- @prisma/client
- @prisma/adapter-pg

---

## Banco de Dados & Infraestrutura
- PostgreSQL 15
- Docker
- Docker Compose
- pgAdmin4

---

## Qualidade & Testes
- Jest
- ts-jest
- Supertest

---

## API Externa
- [Brasil API](https://brasilapi.com.br)

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
│   ├── tests/
│   │   └── transactions.integration.test.ts
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

> Caso precise resetar completamente o banco de dados futuramente:
>
> ```bash
> npx prisma migrate reset
> ```

---

# 💻 Como Executar a Aplicação

O projeto utiliza o pacote `concurrently` para executar front-end e back-end simultaneamente.

Na raiz do projeto, execute:

```bash
npm run dev
```

---

# 🌐 Acessos da Aplicação

| Serviço | URL |
|---|---|
| Back-end (API) | `http://localhost:3001` |
| Front-end (React) | `http://localhost:5173` |
| pgAdmin4 | `http://localhost:5050` |

---

# 🧪 Qualidade de Código & Testes

O projeto adota uma **pirâmide de testes completa nos três níveis** — unitário, integração e
end-to-end — além de **cobertura de código** e **análise estática**. Documentação detalhada:

- 📋 [Casos de Uso (20)](docs/CASOS_DE_USO.md)
- 🧪 [Casos de Teste](docs/CASOS_DE_TESTE.md)
- 📊 [Relatório de Cobertura](docs/RELATORIO_COBERTURA.md)
- 🔍 [Relatório de Análise Estática](docs/RELATORIO_ANALISE_ESTATICA.md)
- 🚀 [Tecnologias](docs/TECNOLOGIAS.md) · 🗄️ [Modelagem do BD](docs/MODELAGEM_BD.md)

## Resumo da suíte (208 testes)

| Nível | Ferramenta | Local | Qtd. |
|-------|------------|-------|-----:|
| Unitário (back-end) | Jest + ts-jest (mocks) | `backend/tests/unit` | 93 |
| Integração (back-end) | Jest + Supertest + PostgreSQL | `backend/tests/integration` | 29 |
| Unitário/Componente (front-end) | Vitest + Testing Library | `frontend/src/**/*.test.tsx` | 80 |
| End-to-End | Cypress | `frontend/cypress/e2e` | 6 |

## Cobertura de código (meta 70–80%)

| Módulo | Linhas | Statements |
|--------|-------:|-----------:|
| Back-end | **89.9%** | 87.9% |
| Front-end | **89.3%** | 85.3% |

## Comandos

```bash
# BACK-END (requer Docker/Postgres no ar) — pasta backend/
npm test               # unit + integração + cobertura
npm run lint           # análise estática (ESLint)

# FRONT-END — pasta frontend/
npm test               # testes unitários/componente (Vitest)
npm run test:coverage  # com relatório de cobertura (gera lcov para o SonarQube)
npm run lint           # análise estática (ESLint)
npm run test:e2e       # testes end-to-end (Cypress) — sobe o front; requer back-end na 3001 + seed

# QUALIDADE — SonarQube (raiz do projeto)
docker compose -f docker-compose.sonar.yml up -d   # sobe o servidor (http://localhost:9000)
npx sonarqube-scanner -Dsonar.token=SEU_TOKEN      # análise (ver docs/RELATORIO_ANALISE_ESTATICA.md)
```

## Estratégia de Testes

A suíte cobre, entre outros:

- ✔️ Autenticação JWT e controle de acesso (login, 401, middleware)
- ✔️ CRUD completo: transações, contas, usuários, categorias, cartões e metas (POST/GET/PUT/DELETE)
- ✔️ Testes negativos barrando payloads inválidos (Erro 400)
- ✔️ Regras de negócio (bloqueio de exclusão, saldo atômico, limite crítico de cartão, progresso de meta)
- ✔️ Integração com Brasil API e AwesomeAPI (câmbio, com cache)
- ✔️ Fluxos de UI ponta a ponta (login, dashboard, painel admin, telas e perfil)

---

# 📊 Gerenciamento Visual com pgAdmin4

O pgAdmin4 está disponível para administração visual do banco de dados via Docker.

## Credenciais de Login

```txt
Email: admin@financeflow.com
Senha: admin
```

---

## Configuração do Servidor no pgAdmin

| Campo | Valor |
|---|---|
| Name | FinanceFlow Local |
| Host name/address | db |
| Port | 5432 |
| Maintenance database | financeflow_local |
| Username | admin |
| Password | adminpassword |

---

# 📌 Diretrizes da Arquitetura (Back-end)

O desenvolvimento foi estruturado seguindo o padrão de arquitetura em camadas (**MVC**) para garantir uma separação clara de responsabilidades.

## Routes
Responsáveis apenas pelo mapeamento dos endpoints HTTP e distribuição das requisições.

---

## Controllers
Responsáveis pela validação inicial, tratamento de exceções (`try/catch`), envio das respostas HTTP e intermediação entre as camadas.

---

## Services
Responsáveis por abrigar as regras de negócio da aplicação, integração com APIs externas, criptografia de senhas e persistência de dados utilizando o Prisma ORM.

---

# 📦 Principais Recursos do Projeto

- Arquitetura Full Stack moderna com TypeScript
- Persistência de dados com Prisma ORM
- API REST estruturada com Express
- Banco PostgreSQL isolado via Docker
- Controle de autenticação e autorização
- Painel administrativo com gerenciamento de usuários
- Integração com API externa de instituições bancárias
- Testes automatizados de integração
- Estrutura escalável seguindo MVC
- Ambiente de desenvolvimento padronizado

---

# 👨‍💻 Autor

Desenvolvido por **Augusto Rodrigues** 🚀
