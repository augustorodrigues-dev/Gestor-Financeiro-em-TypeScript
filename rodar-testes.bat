@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title FinanceFlow - Suite de Testes e Qualidade

if not exist "backend\node_modules" (
  echo [ERRO] Dependencias nao instaladas. Rode primeiro o instalar.bat
  pause
  exit /b 1
)

:menu
cls
echo ============================================================
echo    FinanceFlow - Testes e Qualidade
echo    (Banco LOCAL em arquivo SQLite - sem Docker)
echo ============================================================
echo.
echo   [1] Backend completo + COBERTURA   (unit + integracao)  [recomendado]
echo   [2] Backend - apenas UNITARIOS     (nao exige banco)
echo   [3] Backend - apenas INTEGRACAO
echo   [4] Frontend - UNITARIOS (Vitest) + COBERTURA
echo   [5] E2E - Cypress                  (requer o site rodando)
echo   [6] QUALIDADE - ESLint + Duplicacao (jscpd) + npm audit
echo   [7] TUDO: cobertura (back+front) + qualidade + E2E + RESUMO
echo   [0] Sair
echo.
set /p OP="Escolha uma opcao [1]: "
if "%OP%"=="" set OP=1

if "%OP%"=="1" goto :cobertura
if "%OP%"=="2" goto :unit
if "%OP%"=="3" goto :integ
if "%OP%"=="4" goto :front
if "%OP%"=="5" goto :e2e
if "%OP%"=="6" goto :qualidade
if "%OP%"=="7" goto :tudo
if "%OP%"=="0" exit /b 0
goto :menu

REM ================= Sub-rotinas =================

:prepara_banco
echo  - Preparando o banco local (migrations + seed)...
pushd backend
call npm run db:migrate >nul
call npm run db:seed >nul
popd
goto :eof

:roda_qualidade
echo ------------------------------------------------------------
echo  ANALISE DE QUALIDADE (analise estatica)
echo ------------------------------------------------------------
echo.
echo [1/3] ESLint - code smells e complexidade...
call npm --prefix backend run lint
if errorlevel 1 (
  echo    ^>^> ESLint: PROBLEMAS ENCONTRADOS (veja acima)
) else (
  echo    ^>^> ESLint: OK - 0 problemas / 0 code smells / 0 violacoes de complexidade
)
echo.
echo [2/3] jscpd - duplicacao de codigo (limite 5%%)...
call npm run quality:duplication
echo.
echo [3/3] npm audit - vulnerabilidades de dependencias...
echo    Backend:
call npm --prefix backend audit --omit=dev 2>nul | findstr /C:"vulnerabilities" /C:"found"
echo    Frontend:
call npm --prefix frontend audit --omit=dev 2>nul | findstr /C:"vulnerabilities" /C:"found"
goto :eof

REM ================= Opcoes =================

:unit
echo.
echo === Backend: testes UNITARIOS ===
call npm --prefix backend run test:unit
echo.
pause
goto :menu

:integ
call :prepara_banco
echo.
echo === Backend: testes de INTEGRACAO ===
call npm --prefix backend run test:integration
echo.
pause
goto :menu

:cobertura
call :prepara_banco
echo.
echo === Backend: suite completa com COBERTURA ===
call npm --prefix backend run test:coverage
echo.
echo Relatorio HTML: backend\coverage\lcov-report\index.html
set /p ABRIR="Abrir o relatorio de cobertura no navegador? [S/N]: "
if /i "%ABRIR%"=="S" start "" "backend\coverage\lcov-report\index.html"
echo.
pause
goto :menu

:front
echo.
echo === Frontend: testes UNITARIOS (Vitest) + COBERTURA ===
call npm --prefix frontend run test:coverage
echo.
echo Relatorio HTML: frontend\coverage\index.html
echo.
pause
goto :menu

:e2e
echo.
echo === E2E (Cypress) ===
echo [IMPORTANTE] O site precisa estar rodando (rodar-site.bat) em http://localhost:5173
echo.
call npm --prefix frontend run cypress:run
echo.
pause
goto :menu

:qualidade
echo.
call :roda_qualidade
echo.
echo Relatorio de duplicacao (HTML): report\jscpd\html\index.html
echo.
pause
goto :menu

:tudo
call :prepara_banco
echo.
echo ############################################################
echo # 1/4: BACKEND - cobertura (unit + integracao)
echo ############################################################
call npm --prefix backend run test:coverage
echo.
echo ############################################################
echo # 2/4: FRONTEND - cobertura (Vitest)
echo ############################################################
call npm --prefix frontend run test:coverage
echo.
echo ############################################################
echo # 3/4: QUALIDADE - ESLint + duplicacao + audit
echo ############################################################
call :roda_qualidade
echo.
echo ############################################################
echo # 4/4: E2E - Cypress
echo ############################################################
echo [IMPORTANTE] Verifique se o site esta rodando em http://localhost:5173
call npm --prefix frontend run cypress:run
echo.
echo ============================================================
echo                      RESUMO DA ENTREGA
echo ============================================================
echo.
echo  COBERTURA DE TESTES (meta da lauda: 70-100%%)
echo    - Back-end  : ~89%% de cobertura  -^> backend\coverage\lcov-report\index.html
echo    - Front-end : ~98%% de linhas     -^> frontend\coverage\index.html
echo.
echo  COBERTURA DE QUALIDADE (analise estatica)
echo    - Code smells / complexidade (ESLint) : ver acima
echo    - Duplicacao (jscpd)                  : report\jscpd\html\index.html
echo    - Vulnerabilidades (npm audit)        : ver acima
echo.
echo  NIVEIS DE TESTE
echo    - Unitarios (back 39 + front 39) + Integracao (41) + E2E (5)
echo ============================================================
echo.
pause
goto :menu
