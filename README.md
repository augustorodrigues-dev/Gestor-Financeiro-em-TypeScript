# FinanceFlow 💰
**Plataforma de Gestão Financeira Pessoal**

O FinanceFlow é um protótipo funcional de uma aplicação web voltada para o controle prático, visual e seguro da saúde financeira pessoal. A plataforma centraliza o gerenciamento de saldo e permite a simulação de abertura de contas utilizando dados reais de instituições financeiras brasileiras.

## 🚀 Tecnologias Utilizadas
* **Front-end:** React 18, TypeScript, Tailwind CSS e Vite.
* **Back-end:** Node.js, Express e TypeScript.
* **API Externa:** [Brasil API](https://brasilapi.com.br) (Consulta oficial de instituições financeiras).

---

## 📂 Estrutura do Projeto

```text
financeflow/
├── backend/
│   ├── src/
│   │   ├── services/       # Conexão com APIs externas (Brasil API)
│   │   └── server.ts       # Configuração do Express e rotas
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Components (Login, Dashboard)
│   │   ├── App.tsx         # Gerenciamento de rotas e estados
│   │   └── main.tsx        # Ponto de entrada React
│   ├── package.json
│   └── tsconfig.json
└── .gitignore              # Configuração de arquivos ignorados no Git
```
## 🛠️ Como Executar

**Pré-requisitos**

* **Node.js v24+** (Ambiente de desenvolvimento atualizado).

* **NPM** (Gerenciador de pacotes).

**1. Preparando o Backend**

Abra o seu terminal na pasta raiz do projeto e execute os comandos abaixo:

```text

# Entrar na pasta do backend
cd backend

# Instalar dependências
npm install

# Iniciar o servidor em modo de desenvolvimento
npm run dev

```
O servidor estará rodando em: http://localhost:3001

**2. Preparando o Frontend**

Em um novo terminal, navegue até a pasta do frontend e execute:

```text

# Entrar na pasta do frontend
cd frontend

# Instalar dependências (usando flag de compatibilidade)
npm install --legacy-peer-deps

# Iniciar a interface web
npm run dev

```
Acesse a aplicação em: http://localhost:5173

## ⚙️ Configuração Adicional

A aplicação utiliza a Brasil API para popular dinamicamente a lista de instituições financeiras. Certifique-se de que sua máquina possui acesso à internet para que as requisições ao endpoint /api/banks funcionem corretamente durante os testes de criação de conta. O login está configurado com credenciais padrão para facilitar o acesso rápido ao Dashboard.
