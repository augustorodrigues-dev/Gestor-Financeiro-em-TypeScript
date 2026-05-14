# FinanceFlow 💰
[cite_start]**Plataforma de Gestão Financeira Pessoal** [cite: 1, 2]

[cite_start]O FinanceFlow é um protótipo funcional de uma aplicação voltada para o controle de saúde financeira[cite: 5]. [cite_start]Permite gerenciar contas, transações e visualizar cotações de moedas em tempo real[cite: 6, 49].

## [cite_start]🚀 Tecnologias Utilizadas [cite: 9]
- [cite_start]**Front-end:** React 18, TypeScript, Tailwind CSS e Vite[cite: 9, 75].
- [cite_start]**Back-end:** Node.js, Express e TypeScript[cite: 9, 81].
- [cite_start]**API Externa:** AwesomeAPI (Cotações de moedas em tempo real)[cite: 10, 48].

## [cite_start]📦 Estrutura do Projeto [cite: 72, 74]
- [cite_start]`/frontend`: Interface do usuário desenvolvida em React[cite: 75].
- [cite_start]`/backend`: API REST com lógica de negócios e mock de dados[cite: 81, 82].

## 🛠️ Como Executar

### Pré-requisitos
- [cite_start]Node.js v20+ [cite: 9] (Recomendado v24 conforme ambiente de desenvolvimento).
- NPM ou Yarn.

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
- [cite_start]**UC01/UC02:** Fluxo de autenticação simulado (Login/Logout)[cite: 28, 30].
- [cite_start]**UC04:** Registro de transações com atualização de saldo em memória[cite: 34].
- [cite_start]**UC11:** Consulta de cotação de moedas via API externa[cite: 48].

---
Desenvolvido por **Augusto Pereira Rodrigues**.