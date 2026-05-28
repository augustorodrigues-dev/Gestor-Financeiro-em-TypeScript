# 🔍 Relatório de Análise Estática de Qualidade — FinanceFlow

> Gerado em 2026-05-28 com **ESLint 9** (flat config) + **typescript-eslint**.

A análise estática verifica padrões de qualidade, possíveis bugs e consistência do código
TypeScript, sem executá-lo. Está configurada nos dois módulos e pode ser executada com `npm run lint`.

## Ferramentas e configuração

| Módulo | Config | Plugins/Regras principais |
|--------|--------|---------------------------|
| Back-end | `backend/eslint.config.js` | `@eslint/js` recommended + `typescript-eslint` recommended |
| Front-end | `frontend/eslint.config.js` | acima + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` |

Regras de destaque:
- `@typescript-eslint/no-unused-vars` (warning) — detecta variáveis não utilizadas.
- `react-hooks/rules-of-hooks` (error) — garante uso correto dos hooks do React.
- `react-hooks/exhaustive-deps` (warning) — alerta sobre dependências de `useEffect`.
- `react-refresh/only-export-components` (warning) — boas práticas de Fast Refresh.

## Como executar

```bash
cd backend  && npm run lint
cd frontend && npm run lint
```

## Resultado

| Módulo | Erros | Avisos | Status |
|--------|------:|-------:|:------:|
| Back-end | **0** | 0 | ✅ Limpo |
| Front-end | **0** | 1 | ✅ Aprovado |

### Detalhe do aviso do front-end

```
src/components/Dashboard.tsx
  69:45  warning  React Hook useEffect has a missing dependency: 'loadDashboardData'
                  react-hooks/exhaustive-deps
```

**Análise:** aviso não-bloqueante e intencional. Incluir `loadDashboardData` no array de
dependências causaria recarregamentos em loop; o efeito deve disparar apenas quando
`userId`/`userNameSession` mudam. Mantido como aviso documentado (padrão comum em React).

## Conclusão

O projeto passa na análise estática com **0 erros** em ambos os módulos. O único aviso
remanescente é conhecido, justificado e não representa risco de qualidade.
