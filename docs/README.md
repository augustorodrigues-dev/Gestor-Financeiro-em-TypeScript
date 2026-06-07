# 📚 Documentação Técnica — FinanceFlow 💸

Esta pasta reúne toda a documentação exigida pelo edital do **Projeto Prático:
Desenvolvimento de Plataforma Web Completa**.

| # | Documento | Conteúdo |
| - | --------- | -------- |
| 01 | [Visão Geral e Justificativa Técnica](./01-VISAO-GERAL-E-JUSTIFICATIVA-TECNICA.md) | Tema, justificativa da stack, arquitetura, integração com API externa, modelagem do banco e telas/CRUD. |
| 02 | [Casos de Uso](./02-CASOS-DE-USO.md) | **18 casos de uso** (ator, pré-condições, fluxo principal, fluxos alternativos, pós-condições). |
| 03 | [Casos de Teste](./03-CASOS-DE-TESTE.md) | Casos de teste por caso de uso + matriz de rastreabilidade (identificador, objetivo, dados, passos, resultado esperado/obtido, status). |
| 04 | [Estratégia e Relatório de Testes](./04-ESTRATEGIA-E-RELATORIO-DE-TESTES.md) | Pirâmide de testes, como reproduzir e **relatório de cobertura (~89%)**. |
| 05 | [Relatório de Análise Estática](./05-RELATORIO-ANALISE-ESTATICA.md) | SonarQube, ESLint e `npm audit` — complexidade, duplicação, *code smells*, vulnerabilidades. |

## Mapa de Conformidade com o Edital

| Requisito do edital | Onde está atendido |
| ------------------- | ------------------ |
| Front-end interativo | React + Vite + Tailwind (`frontend/`) |
| Back-end com lógica de negócio | Express + Services (`backend/src`) |
| Banco de dados persistente | SQLite (arquivo local) + Prisma (`backend/prisma`) |
| Integração com ≥ 1 API externa | Brasil API — [doc 01 §3](./01-VISAO-GERAL-E-JUSTIFICATIVA-TECNICA.md#3-integração-com-api-externa--brasil-api) |
| ≥ 5 telas com CRUD completo | 6 áreas de CRUD — [doc 01 §6](./01-VISAO-GERAL-E-JUSTIFICATIVA-TECNICA.md#6-telas-front-end-e-operações-crud) |
| ≥ 15 casos de uso | 18 casos — [doc 02](./02-CASOS-DE-USO.md) |
| Casos de teste documentados por caso de uso | [doc 03](./03-CASOS-DE-TESTE.md) |
| Testes em 3 níveis (unit, integração, E2E) | [doc 04](./04-ESTRATEGIA-E-RELATORIO-DE-TESTES.md) |
| Relatório de cobertura (70–100%) | ~89% — [doc 04 §3](./04-ESTRATEGIA-E-RELATORIO-DE-TESTES.md#3-relatório-de-cobertura-de-código) |
| Relatório de análise estática de qualidade | [doc 05](./05-RELATORIO-ANALISE-ESTATICA.md) |
| Documentação de instalação e execução | [README principal](../README.md) |
| Código versionado em Git | Repositório Git (histórico de *commits* por *sprint*). |
