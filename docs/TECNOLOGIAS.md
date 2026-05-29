# 🚀 Stack Tecnológica e Justificativa — FinanceFlow

Documento alinhado ao que está **efetivamente implementado** no repositório.

## Visão geral
Plataforma web de gestão financeira pessoal: contas, transações, categorias, cartões de
crédito, metas, relatórios e cotação de moedas — com autenticação JWT e controle de acesso.

## Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Front-end | React 18 + TypeScript | Ecossistema maduro; tipagem estática reduz bugs. |
| Estilização | Tailwind CSS | Alta produtividade e design responsivo consistente. |
| Back-end | Node.js + Express + TypeScript | I/O performático; código e tipos compartilhados com o front. |
| ORM | Prisma | Schema declarativo, migrações e type-safety. |
| Banco | PostgreSQL 15 (Docker) | Transações ACID, ideal para dados financeiros. |
| Autenticação | JWT + bcrypt | Stateless e escalável; hash seguro de senhas. |
| Testes (unit/integr.) | Jest + ts-jest + Supertest | Unitários com mocks e integração HTTP + banco real. |
| Testes (componente) | Vitest + React Testing Library | Testes rápidos de componentes React. |
| Testes (E2E) | Cypress | Fluxos ponta a ponta no navegador. |
| Qualidade | ESLint + SonarQube | ESLint como gate executável; SonarQube para análise aprofundada. |
| APIs externas | Brasil API + AwesomeAPI | Instituições financeiras e cotação cambial (sem API key). |

## Integração com APIs externas

### Brasil API (`brasilApiService.ts`) — UC03/UC04
`https://brasilapi.com.br/api/banks/v1` — lista oficial de instituições financeiras
brasileiras, sem necessidade de API key, usada na vinculação de contas.

### AwesomeAPI (`exchangeService.ts`) — UC10
`https://economia.awesomeapi.com.br/last/{par}` — cotação de moedas em tempo real (USD-BRL,
EUR-BRL, etc.), também sem API key. Inclui **cache** para o fluxo alternativo de
indisponibilidade do serviço externo.

> **Nota:** a AwesomeAPI foi adicionada porque a Brasil API não oferece conversão cambial
> confiável. A decisão mantém o critério original (APIs gratuitas, sem chave de acesso).

## Modelagem do banco
Ver [MODELAGEM_BD.md](./MODELAGEM_BD.md) — entidades Usuário, Conta, Categoria, Transação,
CartãoCrédito, Objetivo (Meta) e Orçamento.
