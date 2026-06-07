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
| **ESLint + typescript-eslint** | *Code smells*, complexidade ciclomática, más práticas. | `npm run lint` |
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
| **Vulnerabilidades** | npm audit | **0** no front-end; **4 moderadas** no back-end (apenas devDeps) | ✅ Bom |
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

## 2. ESLint (análise estática local)

Configuração *flat config* moderna em
[`backend/eslint.config.mjs`](../backend/eslint.config.mjs), com `typescript-eslint`
(*recommended*) e regras adicionais de *code smell*:

- `complexity` (máx. 12) — barra funções excessivamente complexas;
- `max-lines-per-function` (máx. 80) — evita funções longas;
- `no-duplicate-imports`, `eqeqeq`, `no-unused-vars` — boas práticas gerais.

### Resultado obtido (execução real — `npm run lint`)

```
✔ 0 problems (0 errors, 0 warnings)
```

> O código-fonte do backend está **livre de erros e avisos** do ESLint. Ajustes
> realizados durante a auditoria de qualidade: padronização de *catch* sem variável
> não utilizada e configuração explícita da augmentação de tipos do Express.

## 3. Vulnerabilidades de Dependências (`npm audit`)

| Projeto | Vulnerabilidades | Severidade | Observação |
| ------- | ---------------- | ---------- | ---------- |
| **Frontend** | **0** | — | Limpo. |
| **Backend** | 4 | Moderada | Em dependências **de desenvolvimento** (toolchain de *build/watch*), sem impacto em produção. |

As ocorrências do backend são transitivas do ferramental de desenvolvimento e **não**
afetam o artefato em execução. Remediação opcional:

```bash
cd backend && npm audit fix    # correções não disruptivas
```

> Optou-se por **não** aplicar `npm audit fix --force` para preservar a
> compatibilidade de versões já validada com a suíte de testes.

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
