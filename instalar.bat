@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title FinanceFlow - Instalacao do Ambiente

echo ============================================================
echo    FinanceFlow - Instalacao Automatica do Ambiente
echo    (Banco LOCAL em arquivo SQLite - sem Docker)
echo ============================================================
echo.

REM ---------- Verificacao do Node.js ----------
where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo        Instale o Node.js 20+ em https://nodejs.org e rode novamente.
  pause
  exit /b 1
)
for /f "delims=" %%v in ('node --version') do echo  - Node.js %%v detectado.
echo.

REM ---------- Dependencias ----------
echo [1/5] Instalando dependencias da RAIZ...
call npm install || goto :erro

echo.
echo [2/5] Instalando dependencias do BACKEND...
call npm --prefix backend install || goto :erro

echo.
echo [3/5] Instalando dependencias do FRONTEND...
call npm --prefix frontend install || goto :erro

REM ---------- Variaveis de ambiente ----------
echo.
echo [4/5] Configurando variaveis de ambiente...
if not exist "backend\.env" (
  copy "backend\.env.example" "backend\.env" >nul
  echo  - Arquivo backend\.env criado a partir de .env.example
) else (
  echo  - backend\.env ja existe. Mantido.
)

REM ---------- Banco de dados (SQLite local) ----------
echo.
echo [5/5] Preparando o banco de dados local (SQLite)...
pushd backend
echo  - Gerando o Prisma Client...
call npm run prisma:generate || (popd & goto :erro)
echo  - Aplicando as migrations (cria o arquivo backend\dev.db)...
call npm run db:migrate || (popd & goto :erro)
echo  - Populando dados de exemplo (seed)...
call npm run db:seed
popd
echo  - Banco de dados pronto e populado.

echo.
echo ============================================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo.
echo    Proximos passos:
echo      - rodar-site.bat    : inicia a aplicacao (frontend + backend)
echo      - rodar-testes.bat  : executa a suite de testes
echo ============================================================
pause
exit /b 0

:erro
echo.
echo [ERRO] Falha durante a instalacao. Revise as mensagens acima.
pause
exit /b 1
