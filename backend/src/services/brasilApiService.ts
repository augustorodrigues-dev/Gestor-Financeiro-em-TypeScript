import axios from 'axios';

export const getBanks = async () => {
  try {
    const response = await axios.get('https://brasilapi.com.br/api/banks/v1');
    const validBanks = response.data.filter((bank: any) => bank.code && bank.name);
    
    return validBanks.slice(0, 20); 
  } catch (error) {
    console.error("Erro ao buscar bancos na Brasil API:", error);
    throw new Error("Serviço de instituições financeiras indisponível no momento.");
  }
};