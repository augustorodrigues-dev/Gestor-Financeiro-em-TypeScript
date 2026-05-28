# 🗄️ Modelagem do Banco de Dados — FinanceFlow

Banco **PostgreSQL 15**, modelado com **Prisma ORM** (`backend/prisma/schema.prisma`).
Fonte da verdade do schema; este documento descreve entidades e relacionamentos.

## Entidades

### usuario (User)
| Campo | Tipo | Observação |
|-------|------|-----------|
| user_id | Int (PK) | autoincrement |
| name | VarChar(255) | |
| email | VarChar(255) | único |
| password_hash | VarChar(255) | bcrypt |
| role | Enum Role | USER \| ADMIN (default USER) |
| reset_token / reset_token_expires | VarChar / DateTime | recuperação de senha |
| created_at | DateTime | default now() |

### conta (Account)
| Campo | Tipo | Observação |
|-------|------|-----------|
| account_id | Int (PK) | |
| name | VarChar(100) | |
| type | VarChar(50) | CORRENTE/POUPANCA/... |
| balance | Decimal(15,2) | default 0 |
| currency | VarChar(10) | default BRL |
| user_id | Int (FK → usuario) | onDelete: Cascade |

### transacao (Transaction)
| Campo | Tipo | Observação |
|-------|------|-----------|
| transaction_id | Int (PK) | |
| amount | Decimal(15,2) | |
| date | Date | |
| description | Text | |
| type | VarChar(20) | INCOME/EXPENSE |
| is_cleared / is_recurring / recurrence_period | Boolean/String | controle |
| account_id / category_id / creditcard_id / budget_id | Int? (FKs) | onDelete: SetNull |

### Demais entidades de domínio
- **categoria (Category)** — categorias de transação, vinculadas ao usuário.
- **cartaocredito (CreditCard)** — cartões com limite, dia de fechamento/vencimento.
- **objetivo (Goal)** — metas financeiras (valor alvo, prazo).
- **orcamento (Budget)** — orçamentos por categoria/mês/ano.

## Relacionamentos

```
usuario (1) ──< (N) conta
usuario (1) ──< (N) categoria
usuario (1) ──< (N) cartaocredito
usuario (1) ──< (N) objetivo
usuario (1) ──< (N) orcamento

conta        (1) ──< (N) transacao
categoria    (1) ──< (N) transacao   (1) ──< (N) orcamento
cartaocredito(1) ──< (N) transacao
orcamento    (1) ──< (N) transacao
```

- Exclusão de **usuario** → cascata em contas/categorias/cartões/metas/orçamentos.
- Exclusão de **conta/categoria/cartão/orçamento** → transações ficam com FK nula (SetNull),
  preservando o histórico.

## Migrations

Versionadas em `backend/prisma/migrations/`:
1. `20260519170358_init_financeflow_db` — schema inicial.
2. `20260521225113_add_role_to_user` — adição do enum de papéis (USER/ADMIN).

Aplicar: `npx prisma migrate deploy` (ou `migrate dev` em desenvolvimento).
