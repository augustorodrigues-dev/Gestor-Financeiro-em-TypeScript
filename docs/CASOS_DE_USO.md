# 📋 Casos de Uso — FinanceFlow

Documentação alinhada à especificação oficial do grupo (20 casos de uso, UC01–UC20).
Plataforma de gestão financeira pessoal: React + Express + Prisma + PostgreSQL, autenticação
JWT, controle de acesso por papéis e integração com APIs externas (Brasil API e AwesomeAPI).

## Atores
| Ator | Descrição |
|------|-----------|
| **Usuário (USER)** | Gerencia contas, transações, categorias, cartões, metas e perfil. |
| **Administrador (ADMIN)** | Gestão de todos os usuários da plataforma. |
| **Sistema** | Regras automáticas (saldo, token JWT, alertas, validações). |
| **APIs externas** | Brasil API (instituições financeiras) e AwesomeAPI (cotação de moedas). |

## Rastreabilidade (UC → implementação → testes)

| UC | Nome | Status | Implementação | Testes |
|----|------|--------|---------------|--------|
| UC01 | Autenticar no Sistema | ✅ | `UserController.login` | unit + integração + E2E |
| UC02 | Auto-Cadastro de Usuário | ✅ | `UserController.create` | unit + integração + `Register.test` |
| UC03 | Gerenciar Contas Financeiras | ✅ | `AccountService` / `AccountManager` | unit + integração + `AccountManager.test` |
| UC04 | Registrar Transação | ✅ | `TransactionService.createTransaction` | unit + integração + `Dashboard.test` |
| UC05 | Gerenciar Categorias | ✅ | `CategoryService` / `CategoryManager` | unit + integração + `CategoryManager.test` |
| UC06 | Visualizar Dashboard | ✅ | `Dashboard` (saldo, extrato) + `Reports` | `Dashboard.test` + E2E |
| UC07 | Gerar Relatório Financeiro | ✅ | `ReportService.getSummary` / `Reports` | unit + integração + `Reports.test` |
| UC08 | Gerenciar Cartão de Crédito | ✅ | `CreditCardService` / `CreditCardManager` | unit + integração + `CreditCardManager.test` |
| UC09 | Gerenciar Metas Financeiras | ✅ | `GoalService` / `GoalManager` | unit + integração + `GoalManager.test` |
| UC10 | Consultar Cotação de Moeda | ✅ | `exchangeService` / `Reports` | unit + `Reports.test` |
| UC11 | Editar Perfil | ✅ | `UserService.updateProfile` / `Profile` | unit + integração + `Profile.test` |
| UC12 | Modificar ou Excluir Transação | ✅ | `TransactionController.update/delete` | unit + integração + `Dashboard.test` |
| UC13 | Filtrar e Pesquisar Transações | ✅ | `Dashboard` (busca + filtro de tipo) | `Dashboard.test` |
| UC14 | Gerenciar Usuários da Plataforma | ✅ | `UserController.listAll/update` | unit + integração + `AdminPanel.test` |
| UC15 | Encerrar Sessão | ✅ | `App.handleLogout` | `App.test` |
| UC16 | Exportar Extrato PDF/CSV | ✅¹ | `Reports.exportCSV` | `Reports.test` |
| UC17 | Gerenciar Transações Agendadas | ✅² | `TransactionService` (isRecurring) + `/scheduled` | unit |
| UC18 | Recuperação de Senha | ✅³ | `UserService.generateResetToken/resetPassword` / `ForgotPassword` | unit + integração + `ForgotPassword.test` |
| UC19 | Alertar Contas Próximas ao Vencimento | ✅ | `ReportService.getUpcomingDue` / banner no Dashboard | unit + `Dashboard.test` |
| UC20 | Notificar Limite Crítico do Cartão | ✅ | `CreditCardService` (usagePercent/critical) / `CreditCardManager` | unit + `CreditCardManager.test` |

> **Notas de honestidade sobre o escopo:**
> ¹ **UC16** — exportação **CSV** totalmente funcional (download no navegador). Para **PDF**, usa-se a impressão do navegador (Ctrl+P → "Salvar como PDF"), evitando dependência extra.
> ² **UC17** — persistência de transações recorrentes (`isRecurring`/`recurrencePeriod`) e listagem de agendadas implementadas. A **execução automática via cron** está documentada como evolução futura (não há job em background em produção).
> ³ **UC18** — geração/validação de token de redefinição implementada. Como o projeto **não possui serviço de e-mail**, o token é retornado pela API para o fluxo de demonstração (em produção iria por e-mail).

---

## Detalhamento dos fluxos

### UC01 — Autenticar no Sistema
**Ator:** Usuário/Admin · **Pré:** cadastro ativo · **Pós:** token JWT emitido.
Fluxo: informa e-mail/senha → valida campos → compara hash bcrypt → gera JWT → redireciona.
Alternativo: credenciais inválidas → HTTP 401.

### UC02 — Auto-Cadastro de Usuário
**Ator:** Visitante · **Pré:** e-mail não cadastrado.
Fluxo: informa nome/e-mail/senha → valida unicidade → bcrypt → cria com perfil padrão → login automático.
Alternativo: e-mail duplicado → HTTP 400.

### UC03 — Gerenciar Contas Financeiras (CRUD)
**Ator:** Usuário. Cria/lista/edita/exclui contas. Alternativo: exclusão bloqueada se houver transações vinculadas.

### UC04 — Registrar Transação
**Ator:** Usuário · **Pré:** conta ativa. Cria receita/despesa; saldo atualizado atomicamente (`prisma.$transaction`). Alternativo: campos ausentes → 400.

### UC05 — Gerenciar Categorias (CRUD)
**Ator:** Usuário. Cria categorias personalizadas (ícone/cor); lista padrão + personalizadas. Alternativo: categorias padrão não podem ser removidas.

### UC06 — Visualizar Dashboard
**Ator:** Usuário. Exibe saldo consolidado, extrato e indicadores (receitas/despesas no módulo Relatórios). Alternativo: estado vazio sem dados.

### UC07 — Gerar Relatório Financeiro
**Ator:** Usuário. Compila totais (receitas, despesas, saldo) com filtro de período opcional. Exportável (UC16).

### UC08 — Gerenciar Cartão de Crédito (CRUD)
**Ator:** Usuário. Cadastra cartões com limite/fechamento/vencimento; calcula uso da fatura. Alternativo: histórico mantido ao excluir (FK SetNull).

### UC09 — Gerenciar Metas Financeiras (CRUD)
**Ator:** Usuário. Cria metas, registra aportes, acompanha progresso. Alternativo: metas concluídas recebem status visual de sucesso.

### UC10 — Consultar Cotação de Moeda
**Ator:** Usuário. Converte moedas em tempo real (AwesomeAPI). Alternativo: usa cache quando o serviço externo está indisponível.

### UC11 — Editar Perfil
**Ator:** Usuário. Atualiza nome/e-mail/senha. Alternativo: e-mail já em uso por outra conta → 400.

### UC12 — Modificar ou Excluir Transação
**Ator:** Usuário. Edita/remove transações; saldo recalculado. Alternativo: cancelamento não altera nada.

### UC13 — Filtrar e Pesquisar Transações
**Ator:** Usuário. Busca por descrição e filtro por tipo (receita/despesa) no extrato. Alternativo: estado "sem resultados".

### UC14 — Gerenciar Usuários da Plataforma
**Ator:** Admin. Lista usuários, edita nome/papel. Alternativo: nome/role ausentes → 400.

### UC15 — Encerrar Sessão
**Ator:** Usuário/Admin. Remove token, limpa estados e redireciona ao login. Alternativo: expiração do JWT encerra a sessão.

### UC16 — Exportar Extrato PDF/CSV
**Ator:** Usuário. Exporta movimentações em CSV (download) e PDF (impressão do navegador). Alternativo: sem dados, nada é exportado.

### UC17 — Gerenciar Transações Agendadas
**Ator:** Usuário. Marca transações como recorrentes (período) e lista as agendadas. Alternativo: data inválida rejeitada.

### UC18 — Recuperação de Senha
**Ator:** Usuário · **Pré:** e-mail existente. Gera token (validade 1h) e redefine a senha. Alternativo: mensagem genérica para e-mails inexistentes.

### UC19 — Alertar Contas Próximas ao Vencimento
**Ator:** Usuário. Sistema identifica lançamentos com `dueDate` próximos e exibe alerta no Dashboard. Alternativo: contas vencidas marcadas como `overdue`.

### UC20 — Notificar Limite Crítico do Cartão
**Ator:** Usuário. Calcula o percentual do limite usado e exibe alerta crítico ao atingir ≥ 80%. Alternativo: permite estouro e marca status crítico.
