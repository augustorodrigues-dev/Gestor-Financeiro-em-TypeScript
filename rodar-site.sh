#!/bin/bash

# Define o diretório atual do script
cd "$(dirname "$0")"

# Define o título do terminal (se suportado pelo emulador de terminal)
echo -ne "\033]0;FinanceFlow - Aplicacao\007"

echo "============================================================"
echo "   FinanceFlow - Iniciando a Aplicacao"
echo "============================================================"
echo ""

# ---------- Verificacao basica ----------
if [ ! -d "backend/node_modules" ]; then
  echo "[ERRO] Dependencias nao instaladas. Rode primeiro o instalar.sh"
  read -p "Pressione Enter para sair..."
  exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "[ERRO] Dependencias do frontend ausentes. Rode primeiro o instalar.sh"
  read -p "Pressione Enter para sair..."
  exit 1
fi

if [ ! -f "backend/.env" ]; then
  cp "backend/.env.example" "backend/.env" 2>/dev/null
  echo " - backend/.env criado a partir de .env.example"
fi

# ---------- Banco de dados local (SQLite) ----------
if [ ! -f "backend/dev.db" ]; then
  echo " - Banco nao encontrado. Preparando o SQLite local..."
  cd backend
  npm run prisma:generate >/dev/null 2>&1
  npm run db:migrate
  npm run db:seed
  cd ..
fi

echo ""
echo "============================================================"
echo "   Servidores iniciando. NAO feche esta janela."
echo ""
echo "     Frontend (site) :  http://localhost:5173"
echo "     Backend  (API)  :  http://localhost:3001"
echo ""
echo "   Credenciais de teste:"
echo "     USER  -> jadao@gmail.com     / 1234"
echo "     ADMIN -> alexandra@gmail.com / 1234"
echo ""
echo "   Pressione Ctrl+C para encerrar os servidores."
echo "============================================================"
echo ""

# Tenta abrir o navegador (xdg-open no Linux, open no macOS)
if command -v xdg-open > /dev/null; then
  xdg-open "http://localhost:5173" &
elif command -v open > /dev/null; then
  open "http://localhost:5173" &
fi

# Roda backend + frontend simultaneamente (concurrently)
npm run dev

read -p "Pressione Enter para encerrar..."
exit 0