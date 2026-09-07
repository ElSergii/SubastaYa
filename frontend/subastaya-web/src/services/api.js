import axios from 'axios';

// URL base del API Gateway (YARP)
const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Obtener todas las subastas activas
export const getAuctions = async () => {
  const response = await api.get('/auctions');
  return response.data;
};

// Obtener detalle de una subasta
export const getAuctionById = async (id) => {
  const response = await api.get(`/auctions/${id}`);
  return response.data;
};

// Realizar una puja en una subasta
export const placeBid = async (auctionId, userId, amount) => {
  const response = await api.post(`/auctions/${auctionId}/bids`, {
    userId,
    amount
  });
  return response.data;
};

// Obtener el saldo de la billetera de un usuario
export const getWallet = async (userId) => {
  const response = await api.get(`/wallets/${userId}`);
  return response.data;
};

// Recargar saldo en la billetera
export const depositWallet = async (userId, amount) => {
  const response = await api.post(`/wallets/${userId}/deposit`, {
    amount
  });
  return response.data;
};

// Obtener historial de auditoria de pujas
export const getAuditLogs = async (auctionId) => {
  const url = auctionId ? `/auditlogs?auctionId=${auctionId}` : '/auditlogs';
  const response = await api.get(url);
  return response.data;
};

export default api;
