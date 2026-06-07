@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title FinanceFlow - Aplicacao

echo ============================================================
echo    FinanceFlow - Iniciando a Aplicacao
echo ============================================================
echo.

REM ---------- Verificacao basica ----------
if not exist "backend\node_modules" (
  echo [ERRO] Dependencias nao instaladas. Rode primeiro o instalar.bat
  pause
  exit /b 1
)
if not exist "frontend\node_modules" (
  echo [ERRO] Dependencias do frontend ausentes. Rode primeiro o instalar.bat
  pause
  exit /b 1
)
if not exist "backend\.env" (
  copy "backend\.env.example" "backend\.env" >nul
  echo  - backend\.env criado a partir de .env.example
)

REM ---------- Banco de dados local (SQLite) ----------
if not exist "backend\dev.db" (
  echo  - Banco nao encontrado. Preparando o SQLite local...
  pushd backend
  call npm run prisma:generate >nul
  call npm run db:migrate
  call npm run db:seed
  popd
)

echo.
echo ============================================================
echo    Servidores iniciando. NAO feche esta janela.
echo.
echo      Frontend (site) :  http://localhost:5173
echo      Backend  (API)  :  http://localhost:3001
echo.
echo    Credenciais de teste:
echo      USER  -^> jadao@gmail.com     / 1234
echo      ADMIN -^> alexandra@gmail.com / 1234
echo.
echo    Pressione Ctrl+C para encerrar os servidores.
echo ============================================================
echo.

start "" http://localhost:5173

REM Roda backend + frontend simultaneamente (concurrently)
call npm run dev

pause
exit /b 0
