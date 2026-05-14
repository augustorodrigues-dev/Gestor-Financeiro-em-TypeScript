# FinanceFlow 💰
**Plataforma de Gestão Financeira Pessoal**

O FinanceFlow é um protótipo funcional de uma aplicação web voltada para o controle prático, visual e seguro da saúde financeira pessoal. A plataforma permite o gerenciamento de saldo e a simulação de criação de contas utilizando dados reais do sistema financeiro nacional.

## 🚀 Tecnologias Utilizadas
- **Front-end:** React 18, TypeScript, Tailwind CSS e Vite.
- **Back-end:** Node.js, Express e TypeScript.
- **API Externa:** Brasil API (Integração para consulta oficial de instituições financeiras).

## 📦 Estrutura do Projeto
- `/frontend`: Interface do usuário desenvolvida em React.
- `/backend`: API REST com lógica de negócios, mock de dados e conexão com serviços externos.

## 🛠️ Como Executar

### Pré-requisitos
- Node.js v24+ (Ambiente de desenvolvimento).
- NPM.

### Passo 1: Configurar o Backend
1. Entre na pasta: `cd backend`
2. Instale as dependências: `npm install`
3. Inicie o servidor: `npm run dev`
*O servidor rodará em `http://localhost:3001`*

### Passo 2: Configurar o Frontend
1. Abra um novo terminal.
2. Entre na pasta: `cd frontend`
3. Instale as dependências: `npm install --legacy-peer-deps`
4. Inicie a aplicação: `npm run dev`
*Acesse o link gerado (geralmente `http://localhost:5173`)*

## 📝 Casos de Uso Implementados (Protótipo)
- **UC01/UC02:** Fluxo de autenticação simulado com preenchimento rápido (Login/Logout).
- **UC04:** Registro de transações financeiras com atualização de saldo em memória.
- **UC11:** Simulação de criação de contas buscando a lista oficial de bancos brasileiros em tempo real via Brasil API.

---
Desenvolvido por **Augusto Pereira Rodrigues**.