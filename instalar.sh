#!/bin/bash

# Define o diretório atual do script
cd "$(dirname "$0")"

# Define o título do terminal (se suportado pelo emulador de terminal)
echo -ne "\033]0;FinanceFlow - Instalacao do Ambiente\007"

echo "============================================================"
echo "    FinanceFlow - Instalacao Automatica do Ambiente"
echo "    (Banco LOCAL em arquivo SQLite - sem Docker)"
echo "============================================================"
echo ""

# Função executada caso ocorra algum erro
erro() {
  echo ""
  echo "[ERRO] Falha durante a instalacao. Revise as mensagens acima."
  read -p "Pressione Enter para sair..."
  exit 1
}

# ---------- Verificacao do Node.js ----------
if ! command -v node >/dev/null 2>&1; then
  echo "[ERRO] Node.js nao encontrado."
  echo "       Instale o Node.js 20+ usando o gerenciador do seu sistema ou em https://nodejs.org"
  read -p "Pressione Enter para sair..."
  exit 1
fi

NODE_VERSION=$(node --version)
echo " - Node.js $NODE_VERSION detectado."
echo ""

# ---------- Dependencias ----------
echo "[1/5] Instalando dependencias da RAIZ..."
npm install || erro

echo ""
echo "[2/5] Instalando dependencias do BACKEND..."
npm --prefix backend install || erro

echo ""
echo "[3/5] Instalando dependencias do FRONTEND..."
npm --prefix frontend install || erro

# ---------- Variaveis de ambiente ----------
echo ""
echo "[4/5] Configurando variaveis de ambiente..."
if [ ! -f "backend/.env" ]; then
  cp "backend/.env.example" "backend/.env" 2>/dev/null
  echo " - Arquivo backend/.env criado a partir de .env.example"
else
  echo " - backend/.env ja existe. Mantido."
fi

# ---------- Banco de dados (SQLite local) ----------
echo ""
echo "[5/5] Preparando o banco de dados local (SQLite)..."
cd backend || erro

echo " - Gerando o Prisma Client..."
npm run prisma:generate || erro

echo " - Aplicando as migrations (cria o arquivo backend/dev.db)..."
npm run db:migrate || erro

echo " - Populando dados de exemplo (seed)..."
npm run db:seed || erro

cd ..

echo ""
echo "============================================================"
echo "    INSTALACAO CONCLUIDA COM SUCESSO!"
echo ""
echo "    Proximos passos:"
echo "      - ./rodar-site.sh    : inicia a aplicacao (frontend + backend)"
echo "      - ./testes.sh        : executa a suite de testes"
echo "============================================================"

read -p "Pressione Enter para concluir..."
exit 0