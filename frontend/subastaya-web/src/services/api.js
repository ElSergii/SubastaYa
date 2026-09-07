import axios from 'axios';

// URL base del API Gateway (YARP)
const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 1500 // Tiempo límite para evitar esperas en la consola si el servidor no está corriendo
});

// Billetera local simulada para modo sin conexión
const LOCAL_WALLETS = {
  '22222222-2222-2222-2222-222222222222': { userId: '22222222-2222-2222-2222-222222222222', balance: 150000, heldBalance: 28000, availableBalance: 122000 },
  '33333333-3333-3333-3333-333333333333': { userId: '33333333-3333-3333-3333-333333333333', balance: 220000, heldBalance: 125000, availableBalance: 95000 },
  '44444444-4444-4444-4444-444444444444': { userId: '44444444-4444-4444-4444-444444444444', balance: 0, heldBalance: 0, availableBalance: 0 },
  '11111111-1111-1111-1111-111111111111': { userId: '11111111-1111-1111-1111-111111111111', balance: 999999, heldBalance: 0, availableBalance: 999999 }
};

const LOCAL_AUDIT_LOGS = [
  { id: 1, auctionId: 'a2222222-2222-2222-2222-222222222222', userId: '33333333-3333-3333-3333-333333333333', action: 'PUJA_RECIBIDA', amount: 125000, timestamp: new Date().toISOString() },
  { id: 2, auctionId: 'a1111111-1111-1111-1111-111111111111', userId: '22222222-2222-2222-2222-222222222222', action: 'PUJA_RECIBIDA', amount: 45000, timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 3, auctionId: 'a4444444-4444-4444-4444-444444444444', userId: '22222222-2222-2222-2222-222222222222', action: 'ESCROW_TRANSACCION', amount: 28000, timestamp: new Date(Date.now() - 300000).toISOString() }
];

// Obtener todas las subastas activas
export const getAuctions = async () => {
  try {
    const response = await api.get('/auctions');
    return response.data;
  } catch (err) {
    return null;
  }
};

// Obtener detalle de una subasta
export const getAuctionById = async (id) => {
  try {
    const response = await api.get(`/auctions/${id}`);
    return response.data;
  } catch (err) {
    return null;
  }
};

// Crear una nueva subasta (Exclusivo Admin / Vendedor)
export const createAuction = async (auctionData) => {
  try {
    const response = await api.post('/auctions', auctionData);
    return response.data;
  } catch (err) {
    return { ...auctionData, id: crypto.randomUUID(), currentPrice: auctionData.startingPrice, bidCount: 0 };
  }
};

// Realizar una puja en una subasta
export const placeBid = async (auctionId, userId, amount) => {
  try {
    const response = await api.post(`/auctions/${auctionId}/bids`, {
      userId,
      amount
    });
    return response.data;
  } catch (err) {
    if (err.response?.status === 409) {
      throw err;
    }
    return { auctionId, userId, amount, bidTime: new Date().toISOString() };
  }
};

// Obtener el saldo de la billetera de un usuario
export const getWallet = async (userId) => {
  try {
    const response = await api.get(`/wallets/${userId}`);
    return response.data;
  } catch (err) {
    return LOCAL_WALLETS[userId] || { userId, balance: 100000, heldBalance: 0, availableBalance: 100000 };
  }
};

// Recargar saldo en la billetera
export const depositWallet = async (userId, amount) => {
  try {
    const response = await api.post(`/wallets/${userId}/deposit`, {
      amount
    });
    return response.data;
  } catch (err) {
    const current = LOCAL_WALLETS[userId] || { userId, balance: 100000, heldBalance: 0, availableBalance: 100000 };
    current.balance += Number(amount);
    current.availableBalance += Number(amount);
    LOCAL_WALLETS[userId] = current;
    return current;
  }
};

// Obtener historial de auditoria de pujas
export const getAuditLogs = async (auctionId) => {
  try {
    const url = auctionId ? `/auditlogs?auctionId=${auctionId}` : '/auditlogs';
    const response = await api.get(url);
    return response.data;
  } catch (err) {
    return LOCAL_AUDIT_LOGS;
  }
};

export default api;
