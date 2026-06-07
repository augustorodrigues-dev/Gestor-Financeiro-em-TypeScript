# FinanceFlow 💸 — Relatório de Análise Estática de Qualidade

> Documento 05 de 05. Veja o [índice da documentação](./README.md).
>
> Atende ao requisito de *“cobertura de qualidade obtida por ferramentas de análise
> estática (SonarQube, Codacy, CodeClimate ou equivalentes), contemplando métricas de
> complexidade, duplicação, code smells e vulnerabilidades.”*

A qualidade é avaliada por **ferramentas complementares**, todas **locais e
reproduzíveis** (e exportáveis para o SonarQube quando desejado):

| Ferramenta | Foco | Execução |
| ---------- | ---- | -------- |
| **ESLint + typescript-eslint** | *Code smells*, complexidade ciclomática, regras de Hooks (React), más práticas — **back-end E front-end**. | `npm run lint` |
| **jscpd** | Duplicação de código (*copy/paste detection*). | `npm run quality:duplication` |
| **npm audit** | Vulnerabilidades conhecidas em dependências. | `npm audit` |
| **SonarQube / SonarCloud** | Consolida todas as métricas + cobertura em um *dashboard*. | `sonar-scanner` (servidor) |

> Atalho: `npm run quality` executa ESLint + jscpd de uma vez.

### 📊 Resultado consolidado (execução real)

| Métrica de qualidade | Ferramenta | Resultado | Avaliação |
| -------------------- | ---------- | --------- | --------- |
| **Code smells** | ESLint | **0 problemas** (0 erros, 0 avisos) | ✅ Ótimo |
| **Complexidade** | ESLint (`complexity` ≤ 12) | **0 violações** | ✅ Ótimo |
| **Duplicação** | jscpd | **2,88%** de linhas duplicadas (limite: 5%) | ✅ Ótimo |
| **Vulnerabilidades** | npm audit | **0** no front-end; **3 moderadas** no back-end (só na CLI do Prisma, *devDep*) | ✅ Bom |
| **Cobertura de testes** | Jest + Vitest (LCOV) | **~89% back-end** / **~98% linhas front-end** | ✅ Acima da meta |

---

## 1. SonarQube / SonarCloud

A configuração está em [`sonar-project.properties`](../sonar-project.properties) (raiz),
já apontando fontes (`backend/src`, `frontend/src`), testes e os relatórios de cobertura
(`backend/coverage/lcov.info` e `frontend/coverage/lcov.info`).

### Como executar (SonarQube local via Docker)

> ℹ️ **Observação:** o Docker abaixo é **apenas** para o servidor opcional do SonarQube
> (ferramenta de análise). A aplicação FinanceFlow e seus testes **não** usam Docker —
> o banco é o arquivo local SQLite (`backend/dev.db`).

```bash
# 1. Subir o servidor SonarQube (porta 9000, login padrão admin/admin)
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community

# 2. Gerar a cobertura (necessária para a métrica de coverage no Sonar)
cd backend && npm run test:coverage

# 3. Rodar o scanner a partir da RAIZ do projeto
#    (instale o sonar-scanner CLI e gere um token em My Account > Security)
sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.login=SEU_TOKEN
```

> Alternativa em nuvem (sem servidor local): **SonarCloud** — conectar o repositório
> GitHub e usar o mesmo `sonar-project.properties`.

### Métricas avaliadas pelo Sonar

- **Complexidade** (ciclomática e cognitiva) — limitada por design: a lógica vive em
  *Services* pequenos e coesos.
- **Duplicação** — medida em **2,88%** pelo jscpd (seção 4), minimizada pela arquitetura
  em camadas (controllers finos, regras centralizadas nos services).
- **Code smells** — **0** no ESLint (seção 2).
- **Vulnerabilidades / Security Hotspots** — senhas com *hash* (Bcrypt), autenticação
  JWT em todas as rotas de dados, e `npm audit` (seção 3).
- **Cobertura** — importada do LCOV: **~89% (back-end)** e **~98% linhas (front-end)**
  (ver [04-ESTRATEGIA-E-RELATORIO-DE-TESTES.md](./04-ESTRATEGIA-E-RELATORIO-DE-TESTES.md)).

## 2. ESLint (análise estática local — back-end **e** front-end)

Há **duas** configurações *flat config* com `typescript-eslint` (*recommended*):

- [`backend/eslint.config.mjs`](../backend/eslint.config.mjs) — regras de *code smell*:
  `complexity` (máx. 12), `max-lines-per-function` (máx. 80), `no-duplicate-imports`,
  `eqeqeq`, `no-unused-vars`.
- [`frontend/eslint.config.mjs`](../frontend/eslint.config.mjs) — mesmas regras +
  **`react-hooks`** (regras dos Hooks e dependências de efeitos) e `react-refresh`.

### Resultado obtido (execução real — `npm run lint`)

```
Back-end : ✔ 0 problems (0 errors, 0 warnings)
Front-end: ✔ 0 problems (0 errors, 0 warnings)
```

> **Todo o código-fonte (back + front) está livre de erros e avisos** do ESLint.
> Ajustes feitos na auditoria: *catch* sem variável não utilizada e augmentação de
> tipos do Express (back), e correção das dependências de `useEffect` via `useCallback`
> + remoção de prop não utilizada (front).

## 3. Vulnerabilidades de Dependências (`npm audit`)

| Projeto | Vulnerabilidades | Severidade | Observação |
| ------- | ---------------- | ---------- | ---------- |
| **Frontend** | **0** | — | Limpo. |
| **Backend** | **3** | Moderada | Exclusivamente na **CLI do Prisma** (`prisma`, *devDependency*) — fora do artefato em execução. |

Foi aplicado `npm audit fix` (correção não disruptiva), que resolveu a única ocorrência
de **produção** (`qs`, transitiva do Express: `6.15.1 → 6.15.2`). Após a suíte completa
de testes confirmar que nada quebrou (80/80 aprovados), o número caiu de 4 para 3.

As **3 ocorrências remanescentes** têm origem única e rastreável:

```
prisma@7.8.0  →  @prisma/dev  →  @hono/node-server (<1.19.13)
```

Ou seja, vêm da **ferramenta de linha de comando do Prisma** (usada para `migrate`/
`generate`/`seed`), que é **devDependency** e **não** integra o servidor em execução.
A correção automática exigiria `npm audit fix --force`, que faria *downgrade* do Prisma
para a 6.x (*breaking change*) — por isso foi **deliberadamente evitada** para preservar
a compatibilidade já validada pela suíte de testes.

## 4. Duplicação de Código (jscpd)

A duplicação é medida pelo **jscpd** (detecção de *copy/paste*), configurado em
[`.jscpd.json`](../.jscpd.json) com limite de **5%** (o *build* falha acima disso).

### Resultado obtido (execução real — `npm run quality:duplication`)

```
┌────────────┬────────────────┬─────────────┬──────────────┬──────────────────┐
│ Format     │ Files analyzed │ Total lines │ Clones found │ Duplicated lines │
├────────────┼────────────────┼─────────────┼──────────────┼──────────────────┤
│ typescript │ 30             │ 1516        │ 7            │ 63 (4.16%)       │
│ tsx        │ 11             │ 1456        │ 3            │ 39 (2.68%)       │
│ Total:     │ 51             │ 3536        │ 10           │ 102 (2.88%)      │
└────────────┴────────────────┴─────────────┴──────────────┴──────────────────┘
```

- **2,88%** de linhas duplicadas no código de produção — bem abaixo do limite de 5%.
- Os 10 *clones* concentram-se nos blocos `try/catch` boilerplate dos *controllers*
  (tratamento de erro HTTP padronizado) — duplicação aceitável e de baixo risco.
- Gera também um relatório HTML navegável em `report/jscpd/` (ignorado no Git).

## 5. Práticas de Qualidade no Código

- **Arquitetura em camadas** (Routes → Controllers → Services) → baixa complexidade por unidade.
- **Type-safety de ponta a ponta** com TypeScript + Prisma (erros capturados em tempo de compilação).
- **Segurança:** Bcrypt para senhas, JWT obrigatório nas rotas de dados, validação de entrada nos controllers.
- **Integridade referencial:** regras `onDelete` (Cascade/SetNull) no schema do banco.
- **Gate automatizado:** `coverageThreshold` (75%) no Jest reprova *builds* abaixo da meta.
