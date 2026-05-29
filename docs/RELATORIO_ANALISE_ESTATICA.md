# 🔍 Relatório de Análise Estática de Qualidade — FinanceFlow

A análise estática é feita em **duas camadas**: **ESLint** (executado, gate automatizado) e
**SonarQube** (configurado para análise aprofundada de qualidade e cobertura).

## 1. ESLint (executado) — ✅ 0 erros

| Módulo | Config | Erros | Avisos |
|--------|--------|------:|-------:|
| Back-end | `backend/eslint.config.js` (ESLint 9 + typescript-eslint) | **0** | 0 |
| Front-end | `frontend/eslint.config.js` (+ react-hooks, react-refresh) | **0** | 1 |

Executar: `cd backend && npm run lint` · `cd frontend && npm run lint`.

**Único aviso (não-bloqueante e justificado):**
```
src/components/Dashboard.tsx  react-hooks/exhaustive-deps
'loadDashboardData' missing dependency
```
Intencional: incluir a função nas dependências do `useEffect` causaria recarregamentos em
loop; o efeito deve disparar apenas quando `userId`/`userNameSession` mudam.

## 2. SonarQube (configurado)

Arquivos entregues:
- `sonar-project.properties` — chaves do projeto, fontes, exclusões e caminhos LCOV de cobertura.
- `docker-compose.sonar.yml` — servidor SonarQube (community) para subir localmente.

### Como executar
```bash
# 1. Subir o servidor SonarQube
docker compose -f docker-compose.sonar.yml up -d
# 2. Gerar os relatórios de cobertura (LCOV)
cd backend && npm test          # gera backend/coverage/lcov.info
cd ../frontend && npm run test:coverage   # gera frontend/coverage/lcov.info
# 3. Acessar http://localhost:9000 (admin/admin), criar um token e rodar:
npx sonarqube-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=SEU_TOKEN
```

O SonarQube consumirá os `lcov.info` de ambos os módulos (já gerados) e produzirá métricas de
bugs, code smells, vulnerabilidades, duplicação e cobertura.

> **Nota de ambiente:** o servidor SonarQube (Java + Elasticsearch) e o scanner exigem um
> servidor dedicado e token de autenticação, executados na máquina do grupo. O **ESLint** é o
> gate de análise estática executado de forma reprodutível na suíte (0 erros nos dois módulos).

## Conclusão
Análise estática **aprovada**: 0 erros de ESLint em ambos os módulos, e infraestrutura de
SonarQube pronta para a análise aprofundada exigida pela rubrica.
