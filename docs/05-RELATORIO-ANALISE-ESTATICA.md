# FinanceFlow 💸 — Relatório de Análise Estática de Qualidade

> Documento 05 de 05. Veja o [índice da documentação](./README.md).
>
> Atende ao requisito de *“cobertura de qualidade obtida por ferramentas de análise
> estática (SonarQube, Codacy, CodeClimate ou equivalentes), contemplando métricas de
> complexidade, duplicação, code smells e vulnerabilidades.”*

A qualidade é avaliada por **três ferramentas complementares**:

| Ferramenta | Foco | Execução |
| ---------- | ---- | -------- |
| **SonarQube / SonarCloud** | Complexidade, duplicação, *code smells*, *bugs*, *security hotspots*, cobertura. | `sonar-scanner` (servidor). |
| **ESLint + typescript-eslint** | *Code smells*, complexidade ciclomática, más práticas — análise **local** e reproduzível. | `npm run lint`. |
| **npm audit** | Vulnerabilidades conhecidas em dependências. | `npm audit`. |

---

## 1. SonarQube / SonarCloud

A configuração está em [`sonar-project.properties`](../sonar-project.properties) (raiz),
já apontando fontes (`backend/src`, `frontend/src`), testes e o relatório de cobertura
(`backend/coverage/lcov.info`).

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
- **Duplicação** — minimizada pela arquitetura em camadas (controllers finos, regras
  centralizadas nos services) e isolamento de constantes (`frontend/src/utils/bancos.ts`).
- **Code smells** — endereçados também pelo ESLint (ver abaixo).
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

## 4. Práticas de Qualidade no Código

- **Arquitetura em camadas** (Routes → Controllers → Services) → baixa complexidade por unidade.
- **Type-safety de ponta a ponta** com TypeScript + Prisma (erros capturados em tempo de compilação).
- **Segurança:** Bcrypt para senhas, JWT obrigatório nas rotas de dados, validação de entrada nos controllers.
- **Integridade referencial:** regras `onDelete` (Cascade/SetNull) no schema do banco.
- **Gate automatizado:** `coverageThreshold` (75%) no Jest reprova *builds* abaixo da meta.
