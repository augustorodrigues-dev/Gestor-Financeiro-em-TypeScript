@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title FinanceFlow - Suite de Testes

if not exist "backend\node_modules" (
  echo [ERRO] Dependencias nao instaladas. Rode primeiro o instalar.bat
  pause
  exit /b 1
)

:menu
cls
echo ============================================================
echo    FinanceFlow - Suite de Testes Automatizados
echo    (Banco LOCAL em arquivo SQLite - sem Docker)
echo ============================================================
echo.
echo   [1] Backend completo + COBERTURA   (unit + integracao)  [recomendado]
echo   [2] Backend - apenas UNITARIOS     (nao exige banco)
echo   [3] Backend - apenas INTEGRACAO
echo   [4] Frontend - UNITARIOS (Vitest) + cobertura
echo   [5] E2E - Cypress                  (requer o site rodando)
echo   [6] TUDO: backend(cobertura) + frontend + E2E
echo   [0] Sair
echo.
set /p OP="Escolha uma opcao [1]: "
if "%OP%"=="" set OP=1

if "%OP%"=="1" goto :cobertura
if "%OP%"=="2" goto :unit
if "%OP%"=="3" goto :integ
if "%OP%"=="4" goto :front
if "%OP%"=="5" goto :e2e
if "%OP%"=="6" goto :tudo
if "%OP%"=="0" exit /b 0
goto :menu

REM ---------- Garante banco preparado + seed ----------
:prepara_banco
echo  - Preparando o banco local (migrations + seed)...
pushd backend
call npm run db:migrate >nul
call npm run db:seed >nul
popd
goto :eof

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
echo === Frontend: testes UNITARIOS (Vitest) + cobertura ===
call npm --prefix frontend run test:coverage
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

:tudo
call :prepara_banco
echo.
echo === 1/3: Backend com cobertura ===
call npm --prefix backend run test:coverage
echo.
echo === 2/3: Frontend (Vitest) com cobertura ===
call npm --prefix frontend run test:coverage
echo.
echo === 3/3: E2E (Cypress) ===
echo [IMPORTANTE] Verifique se o site esta rodando em http://localhost:5173
call npm --prefix frontend run cypress:run
echo.
pause
goto :menu
