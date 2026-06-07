# FinanceFlow 💸 — Estratégia e Relatório de Testes

> Documento 04 de 05. Veja o [índice da documentação](./README.md).

## 1. Estratégia: Pirâmide de Testes em 3 Níveis

```
            ▲  Poucos, lentos, alto valor de jornada
            │        ┌───────────────┐
            │        │   E2E (Cypress)│  5 fluxos críticos no navegador
            │        ├───────────────┤
            │        │  Integração    │  41 testes (Supertest + SQLite local real)
            │        │  (Jest+Supertest)
            │     ┌──┴───────────────┴──┐
            │     │     Unitários        │  39 back (Jest) + 39 front (Vitest)
            └─────┴──────────────────────┘
                 Muitos, rápidos, baixo custo
```

| Nível | Ferramenta | O que valida | Onde |
| ----- | ---------- | ------------ | ---- |
| **Unitário (back-end)** | Jest + ts-jest | Regras de negócio dos *Services* isoladamente (mock do Prisma). | `backend/tests/*Service.test.ts`, `BrasilApiService.test.ts` |
| **Unitário (front-end)** | Vitest + Testing Library | Funções de serviço (cliente HTTP) e componentes isolados (ex.: `<Login />`), com `fetch` mockado. | `frontend/src/__tests__/*.test.{ts,tsx}` |
| **Integração** | Jest + Supertest | Pilha completa Rotas→Middleware→Controller→Service→**SQLite** e a **API externa**. | `backend/tests/*.integration.test.ts` |
| **End-to-End** | Cypress | Jornada real do usuário no navegador. | `frontend/cypress/e2e/*.cy.ts` |

### Por que essa divisão?

- Os **unitários** isolam a lógica matemática e as travas de segurança (cálculo de
  fatura, progresso de meta, reversão de saldo), executando em milissegundos.
- Os **de integração** garantem que as camadas conversam corretamente e que a
  **persistência real** e a **API externa** funcionam (exigência explícita do edital).
- Os **E2E** percorrem os fluxos críticos do ponto de vista do usuário final.

## 2. Como Reproduzir os Testes

> Pré-requisito: dependências instaladas e banco local criado/populado
> (use o `instalar.bat`, que gera o `backend/dev.db`). Detalhes no [README](../README.md).

```bash
# A partir da pasta backend/

npm run test:unit          # Apenas unitários (não exige banco)
npm run test:integration   # Apenas integração (usa o SQLite local)
npm test                   # Unitários + integração
npm run test:coverage      # Tudo + relatório de cobertura (HTML/LCOV/texto)
```

```bash
# A partir da pasta frontend/ — testes UNITÁRIOS de front-end (Vitest)

npm test                   # Roda os testes unitários do front-end
npm run test:coverage      # Com relatório de cobertura (frontend/coverage/)
```

```bash
# A partir da pasta frontend/ — testes E2E (com o site rodando em http://localhost:5173)

npm run cypress:open       # Modo interativo (abre o navegador)
npm run cypress:run        # Modo headless (terminal)
```

Ou, pela **raiz** do projeto: `npm run test:coverage` e `npm run test:e2e`.
Para facilitar a apresentação, use os atalhos **`rodar-testes.bat`**.

## 3. Relatório de Cobertura de Código

Gerado por Jest (`coverageReporters: lcov, text, text-summary`). O relatório
navegável fica em **`backend/coverage/lcov-report/index.html`** e o `lcov.info`
alimenta o SonarQube.

> Meta do edital: **70%–80%**. Meta configurada no `jest.config.ts` (gate de CI):
> **75%** em *statements, branches, functions e lines*. **Resultado atingido: ~89%.**

### Resultado obtido (execução real — `npm run test:coverage`)

```
=============================== Coverage summary ===============================
Statements   : 88.92% ( 313/352 )
Branches     : 81.11% ( 116/143 )
Functions    : 96.72% ( 59/61 )
Lines        : 88.72% ( 307/346 )
================================================================================
Test Suites: 15 passed, 15 total
Tests:       80 passed, 80 total
```

#### Cobertura por módulo (destaques)

| Módulo | % Stmts | % Branch | Observação |
| ------ | ------- | -------- | ---------- |
| `src/services` (regras de negócio) | **100%** | 84% | Núcleo de negócio totalmente coberto. |
| `AccountService.ts` | 100% | 100% | — |
| `CategoryService.ts` | 100% | 100% | — |
| `brasilApiService.ts` | 100% | 100% | Sucesso e falha da API externa. |
| `CreditCardService.ts` | 100% | 80% | Cálculo de fatura/limite. |
| `GoalService.ts` | 100% | 87% | Progresso e conclusão. |
| `TransactionService.ts` | 100% | 77% | Saldo e reversão. |
| `src/controllers` | 82% | 81% | Validações e tratamento de erros. |
| `authMiddleware.ts` | 100% | 75% | Token válido/ausente/inválido. |
| `server.ts` | 89% | 62% | Saldo consolidado e rota de bancos. |

> Observação: `src/seed.ts`, `src/prisma.ts` e os arquivos de rota (`*.routes.ts`)
> são excluídos da métrica por serem, respectivamente, *script* de carga, instância
> de infraestrutura e mero roteamento sem lógica.

### Cobertura do front-end (Vitest)

Os testes unitários de front-end geram cobertura própria (provedor V8, relatório
LCOV em `frontend/coverage/`), também consumida pelo SonarQube.

```
% Coverage report (frontend - Vitest)
Statements   : ~98%  | Branches : ~83% | Functions : ~95% | Lines : ~98%
Test Files   : 5 passed (5)
Tests        : 39 passed (39)
```

Destaque: o componente `<Login />` é exercitado com **Testing Library** (renderização,
erro de credenciais inválidas, sucesso de autenticação e navegação para o cadastro),
e os *services* (cliente HTTP) têm seus caminhos de sucesso e de erro validados.

## 4. Dados de Teste (Seed)

O comando `npm run db:seed` popula um cenário determinístico para a demonstração:

| Nome | E-mail | Senha | Papel |
| ---- | ------ | ----- | ----- |
| Jadão o Liso | `jadao@gmail.com` | `1234` | USER |
| DevOps Nando | `nando@gmail.com` | `1234` | USER |
| Alexandra Bargan | `alexandra@gmail.com` | `1234` | ADMIN |

Os testes de integração que precisam de um usuário **criam o seu próprio** usuário
dinâmico (e-mail com `Date.now()`) e fazem *teardown* ao final, evitando poluição
do banco e dependência de ordem de execução.

## 5. Boas Práticas Adotadas

- **Isolamento:** unitários usam `jest.mock` do Prisma; integração roda `--runInBand`
  para evitar concorrência no banco.
- **Determinismo:** dados dinâmicos por execução + *teardown* (`afterAll`).
- **Resiliência de rede:** o teste da API externa valida o contrato tanto no caminho
  de sucesso quanto no de indisponibilidade.
- **Gate de qualidade:** `coverageThreshold` de 75% falha o *build* se a cobertura cair.
