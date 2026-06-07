# FinanceFlow 💸 — Visão Geral e Justificativa Técnica

> Documento 01 de 05 da documentação do projeto. Veja o [índice da documentação](./README.md).

## 1. Tema e Domínio Escolhido

O **FinanceFlow** é uma **plataforma web de gestão financeira pessoal**. O domínio
foi escolhido por ser rico em **regras de negócio reais** (cálculo de saldo,
controle de fatura e limite de cartão, progresso de metas, travas de integridade
referencial) e por permitir uma **integração natural com uma API externa**
(catálogo oficial de instituições financeiras do Brasil).

O sistema permite que o usuário:

- registre **receitas e despesas** e acompanhe o **saldo consolidado** em tempo real;
- cadastre **contas bancárias** vinculadas a instituições financeiras reais;
- gerencie **cartões de crédito** com cálculo automático de fatura e limite disponível;
- organize lançamentos por **categorias** personalizadas;
- defina e acompanhe **metas financeiras** com barra de progresso;
- e, no perfil administrativo, faça a **gestão de usuários e papéis de acesso**.

## 2. Justificativa da Stack Tecnológica

A escolha priorizou **um único ecossistema de linguagem (TypeScript de ponta a
ponta)**, reduzindo a curva de aprendizado da equipe e permitindo compartilhar
modelos mentais entre front-end e back-end.

| Camada | Tecnologia | Justificativa |
| ------ | ---------- | ------------- |
| **Front-end** | React 18 + Vite + TypeScript + Tailwind CSS | React é o framework de maior domínio da equipe; Vite oferece *dev server* instantâneo; Tailwind acelera a construção de UI consistente. |
| **Back-end** | Node.js + Express + TypeScript | Express é minimalista e amplamente documentado, adequado a uma API REST em camadas (Routes → Controllers → Services). |
| **ORM** | Prisma ORM 7 (+ driver adapter `better-sqlite3`) | *Type-safety* total entre o schema e o código, *migrations* versionadas e geração automática de cliente tipado. |
| **Banco de dados** | **SQLite** (arquivo local) | Banco relacional com integridade referencial (chaves estrangeiras, *cascade*) — porém **em arquivo único** (`backend/dev.db`), sem servidor, sem Docker e sem internet. Zero configuração para rodar e apresentar. |
| **Autenticação** | JWT + Bcrypt | Padrão de mercado para autenticação *stateless*; Bcrypt protege as senhas com *hash* + *salt*. |
| **Testes** | Jest + ts-jest + Supertest (back-end), Vitest + Testing Library (front-end) e Cypress (E2E) | Cobrem os três níveis da pirâmide de testes exigida. |
| **Qualidade** | ESLint + typescript-eslint (local) e SonarQube/SonarCloud | Análise estática de *code smells*, complexidade, duplicação e vulnerabilidades. |

### Por que REST (monolito em camadas)?

O escopo do projeto é bem delimitado e não exige a complexidade operacional de
microsserviços. Uma API REST monolítica organizada em camadas oferece a melhor
relação **simplicidade × testabilidade**, facilitando a escrita de testes de
integração com o `supertest`.

## 3. Integração com API Externa — Brasil API

> Requisito estrutural: *“integração com pelo menos uma API externa”*.

A plataforma integra-se à **[Brasil API](https://brasilapi.com.br/api/banks/v1)**,
serviço público que disponibiliza o catálogo oficial de instituições financeiras
brasileiras (código COMPE e nome).

- **Onde:** [`backend/src/services/brasilApiService.ts`](../backend/src/services/brasilApiService.ts)
  consome o endpoint, **filtra** registros inválidos (sem código ou nome) e **limita**
  o retorno às principais instituições.
- **Por quê:** ao cadastrar uma conta, o usuário seleciona uma instituição **real**,
  evitando digitação livre e padronizando os dados.
- **Resiliência:** falhas da API externa são tratadas e devolvidas como erro amigável
  (`Serviço de instituições financeiras indisponível no momento.`).
- **Testes:** a integração é validada por **teste unitário** (mock do `axios`, cobrindo
  os caminhos de sucesso e de falha) e por **teste de integração** (chamada real ao
  endpoint `GET /api/banks`).

## 4. Arquitetura em Camadas (MVC adaptado)

```
Requisição HTTP
      │
      ▼
┌─────────────┐    ┌──────────────┐    ┌────────────┐    ┌─────────────┐
│   Routes    │ →  │ Middlewares  │ →  │ Controllers│ →  │  Services   │ → Prisma → SQLite (arquivo)
│ (endpoints) │    │ (auth JWT)   │    │ (HTTP I/O) │    │ (regras de  │
└─────────────┘    └──────────────┘    └────────────┘    │  negócio)   │
                                                          └─────────────┘
```

- **Routes** (`src/routes/*.routes.ts`): mapeiam endpoints e aplicam o `authMiddleware`.
- **Middlewares** (`src/middlewares/authMiddleware.ts`): validam o token JWT.
- **Controllers** (`src/controllers/*.ts`): validam entrada, tratam exceções e formatam respostas HTTP.
- **Services** (`src/services/*.ts`): concentram as **regras de negócio** e o acesso a dados via Prisma.

Essa separação é o que torna o sistema **altamente testável**: os *Services* são
testados isoladamente (unitários com mock do Prisma) e a pilha completa é testada
de ponta a ponta via `supertest` (integração).

## 5. Modelagem do Banco de Dados

O banco relacional é definido em
[`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) e versionado em
*migrations*. Sete entidades principais:

| Entidade (model) | Tabela | Descrição |
| ---------------- | ------ | --------- |
| `User` | `usuario` | Usuário do sistema, com `role` (USER/ADMIN) e senha em *hash*. |
| `Account` | `conta` | Conta bancária do usuário, com saldo e moeda. |
| `Category` | `categoria` | Categorias de lançamentos (padrão do sistema ou personalizadas). |
| `CreditCard` | `cartaocredito` | Cartões de crédito, com limite e dias de fechamento/vencimento. |
| `Goal` | `objetivo` | Metas financeiras, com valor-alvo, valor atual e prazo. |
| `Budget` | `orcamento` | Orçamentos mensais por categoria. |
| `Transaction` | `transacao` | Lançamentos (receita/despesa) vinculados a conta, categoria e/ou cartão. |

### Diagrama Entidade-Relacionamento (textual)

```
User (1) ───< (N) Account
User (1) ───< (N) Category
User (1) ───< (N) CreditCard
User (1) ───< (N) Goal
User (1) ───< (N) Budget

Account     (1) ───< (N) Transaction   (onDelete: SetNull)
Category    (1) ───< (N) Transaction   (onDelete: SetNull)
CreditCard  (1) ───< (N) Transaction   (onDelete: SetNull)
Budget      (1) ───< (N) Transaction   (onDelete: SetNull)
Category    (1) ───< (N) Budget
```

**Regras de integridade relevantes:**

- A exclusão de um `User` remove em cascata (`onDelete: Cascade`) suas contas,
  categorias, cartões, metas e orçamentos.
- A exclusão de uma `Account`/`Category`/`CreditCard`/`Budget` apenas **desvincula**
  (`onDelete: SetNull`) as transações associadas, preservando o histórico.
- Valores monetários usam o tipo `Decimal` do Prisma para precisão financeira.

## 6. Telas (Front-end) e Operações CRUD

> Requisito: *“no mínimo cinco telas com operações completas de CRUD”*. O FinanceFlow
> entrega **6 áreas de CRUD**.

| # | Tela / Componente | Entidade | C | R | U | D |
| - | ----------------- | -------- | - | - | - | - |
| 1 | Carteira → Contas ([`Wallet.tsx`](../frontend/src/pages/Wallet.tsx) / [`AccountManager.tsx`](../frontend/src/components/AccountManager.tsx)) | Conta | ✅ | ✅ | ✅ | ✅ |
| 2 | Carteira → Transações ([`Wallet.tsx`](../frontend/src/pages/Wallet.tsx) / [`Dashboard.tsx`](../frontend/src/pages/Dashboard.tsx)) | Transação | ✅ | ✅ | ✅ | ✅ |
| 3 | Gestão de Cartões ([`CreditCardManager.tsx`](../frontend/src/components/CreditCardManager.tsx)) | Cartão de Crédito | ✅ | ✅ | ✅ | ✅ |
| 4 | Categorias ([`CategoryManager.tsx`](../frontend/src/components/CategoryManager.tsx)) | Categoria | ✅ | ✅ | ✅ | ✅ |
| 5 | Metas Financeiras ([`GoalManager.tsx`](../frontend/src/components/GoalManager.tsx)) | Meta | ✅ | ✅ | ✅ | ✅ |
| 6 | Painel Administrativo ([`AdminPanel.tsx`](../frontend/src/pages/AdminPanel.tsx)) | Usuário | ✅ | ✅ | ✅ | ✅ |

Telas de apoio: **Login** ([`Login.tsx`](../frontend/src/pages/Login.tsx)) e
**Cadastro** ([`Register.tsx`](../frontend/src/pages/Register.tsx)).
