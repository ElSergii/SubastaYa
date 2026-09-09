import axios from 'axios';
import { calculateEscrowBreakdown, calculateDynamicIncrement } from '../utils/auctionEngine';

// Modo de datos: false usa almacén local sin errores de conexión en consola
const USE_HTTP_BACKEND = false;
const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 1500
});

// Usuarios demo
export const DEMO_USER_NAMES = {
  '22222222-2222-2222-2222-222222222222': 'Ana García (Comprador 1)',
  '33333333-3333-3333-3333-333333333333': 'María López (Comprador 2)',
  '44444444-4444-4444-4444-444444444444': 'Carlos Sin Fondos',
  '11111111-1111-1111-1111-111111111111': 'Admin SubastaYa (Vendedor)'
};

// Billeteras iniciales
const LOCAL_WALLETS = {
  '22222222-2222-2222-2222-222222222222': { userId: '22222222-2222-2222-2222-222222222222', balance: 5000000, heldBalance: 0, availableBalance: 5000000 },
  '33333333-3333-3333-3333-333333333333': { userId: '33333333-3333-3333-3333-333333333333', balance: 5000000, heldBalance: 0, availableBalance: 5000000 },
  '44444444-4444-4444-4444-444444444444': { userId: '44444444-4444-4444-4444-444444444444', balance: 0, heldBalance: 0, availableBalance: 0 },
  '11111111-1111-1111-1111-111111111111': { userId: '11111111-1111-1111-1111-111111111111', balance: 5000000, heldBalance: 0, availableBalance: 5000000 }
};

const now = new Date();

// Almacén local de subastas
export const LOCAL_AUCTIONS_STORE = [
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    title: 'MacBook Pro M3 Max 16 Pulgadas',
    description: 'Computadora portátil profesional Apple M3 Max 36GB RAM en estado impecable.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Tecnología',
    startingPrice: 30000,
    currentPrice: 45000,
    minimumIncrement: 2000,
    winningUserId: '22222222-2222-2222-2222-222222222222',
    endTime: new Date(now.getTime() + 45 * 60000).toISOString(),
    status: 'Activa',
    bidCount: 4
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    title: 'Chaqueta de Cuero Vintage Schott NYC',
    description: 'Chaqueta clásica de cuero vacuno talle M en excelente estado de conservación.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Indumentaria',
    startingPrice: 15000,
    currentPrice: 28000,
    minimumIncrement: 1000,
    winningUserId: '33333333-3333-3333-3333-333333333333',
    endTime: new Date(now.getTime() + 60 * 60000).toISOString(),
    status: 'Activa',
    bidCount: 5
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    title: 'Guitarra Gibson Les Paul Reedición 1959',
    description: 'Instrumento musical de alta gama con estuche rígido Custom Shop e inspección certificada.',
    imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Coleccionables',
    startingPrice: 80000,
    currentPrice: 85000,
    minimumIncrement: 2500,
    winningUserId: null,
    endTime: new Date(now.getTime() + 90 * 60000).toISOString(),
    status: 'Activa',
    bidCount: 2
  },
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    title: 'Auto Colección 1:18',
    description: 'Modelo a escala metálico con aperturas de puertas y detalles interiores.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Vehículos',
    startingPrice: 35000,
    currentPrice: 45000,
    minimumIncrement: 2000,
    winningUserId: '22222222-2222-2222-2222-222222222222',
    endTime: new Date(now.getTime() - 3600000).toISOString(),
    status: 'Finalizada',
    bidCount: 5
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    title: 'Teclado Antiguo',
    description: 'Teclado mecánico clásico vintage en perfecto funcionamiento.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Tecnología',
    startingPrice: 10000,
    currentPrice: 10000,
    minimumIncrement: 1000,
    winningUserId: null,
    endTime: new Date(now.getTime() - 7200000).toISOString(),
    status: 'Desierta',
    bidCount: 0
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    title: 'Reloj Vintage 1980',
    description: 'Reloj suizo clásico de colección año 1980 en excelente estado.',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Coleccionables',
    startingPrice: 40000,
    currentPrice: 40000,
    minimumIncrement: 1000,
    winningUserId: null,
    endTime: new Date(now.getTime() - 14400000).toISOString(),
    status: 'Desierta',
    bidCount: 0
  }
];

// Historial local de pujas
const LOCAL_BIDS = {
  'a4444444-4444-4444-4444-444444444444': [
    { id: 101, postor: 'Ana García (Comprador 1)', userId: '22222222-2222-2222-2222-222222222222', monto: 45000, fecha: '12:41:07 a. m.', timestamp: new Date().toISOString() },
    { id: 102, postor: 'María López (Comprador 2)', userId: '33333333-3333-3333-3333-333333333333', monto: 39000, fecha: '12:40:05 a. m.', timestamp: new Date(Date.now() - 120000).toISOString() }
  ],
  'a5555555-5555-5555-5555-555555555555': [
    { id: 201, postor: 'María López (Comprador 2)', userId: '33333333-3333-3333-3333-333333333333', monto: 28000, fecha: '11:15:22 a. m.', timestamp: new Date().toISOString() },
    { id: 202, postor: 'Ana García (Comprador 1)', userId: '22222222-2222-2222-2222-222222222222', monto: 25000, fecha: '11:12:04 a. m.', timestamp: new Date(Date.now() - 300000).toISOString() }
  ],
  'a6666666-6666-6666-6666-666666666666': [
    { id: 301, postor: 'María López (Comprador 2)', userId: '33333333-3333-3333-3333-333333333333', monto: 85000, fecha: '10:05:10 a. m.', timestamp: new Date().toISOString() }
  ]
};

// Eventos de auditoría
const LOCAL_AUDIT_LOGS = [
  { id: 1, auctionId: 'a4444444-4444-4444-4444-444444444444', userId: '22222222-2222-2222-2222-222222222222', action: 'PUJA_RECIBIDA', amount: 45000, timestamp: new Date().toISOString() },
  { id: 2, auctionId: 'a5555555-5555-5555-5555-555555555555', userId: '33333333-3333-3333-3333-333333333333', action: 'PUJA_RECIBIDA', amount: 28000, timestamp: new Date(Date.now() - 120000).toISOString() }
];

// Verificar expiración de subastas
function autoCheckExpirations() {
  const nowMs = Date.now();
  LOCAL_AUCTIONS_STORE.forEach((auc) => {
    if (auc.status === 'Activa') {
      const endMs = new Date(auc.endTime).getTime();
      if (nowMs >= endMs) {
        auc.status = (auc.bidCount && auc.bidCount > 0) ? 'Finalizada' : 'Desierta';
      }
    }
  });
}

// Obtener subastas
export const getAuctions = async () => {
  autoCheckExpirations();
  if (USE_HTTP_BACKEND) {
    try {
      const response = await api.get('/auctions');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {}
  }
  return LOCAL_AUCTIONS_STORE;
};

// Obtener subasta por ID
export const getAuctionById = async (id) => {
  autoCheckExpirations();
  const localAuc = LOCAL_AUCTIONS_STORE.find(a => a.id === id) || null;
  if (USE_HTTP_BACKEND) {
    try {
      const response = await api.get(`/auctions/${id}`);
      if (response.data) return response.data;
    } catch (err) {}
  }
  return localAuc;
};

// Obtener historial de pujas
export const getBidsByAuctionId = async (auctionId) => {
  const localList = LOCAL_BIDS[auctionId] || [];
  if (USE_HTTP_BACKEND) {
    try {
      const response = await api.get(`/auctions/${auctionId}/bids`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {}
  }
  return localList;
};

// Crear nueva subasta
export const createAuction = async (auctionData) => {
  const categoryNames = {
    'c1111111-1111-1111-1111-111111111111': 'Tecnología',
    'c2222222-2222-2222-2222-222222222222': 'Coleccionables',
    'c3333333-3333-3333-3333-333333333333': 'Indumentaria',
    'c4444444-4444-4444-4444-444444444444': 'Vehículos'
  };

  const newAuctionObj = {
    ...auctionData,
    id: crypto.randomUUID(),
    currentPrice: Number(auctionData.startingPrice),
    categoryName: categoryNames[auctionData.categoryId] || 'Coleccionables',
    bidCount: 0,
    winningUserId: null,
    endTime: auctionData.endDate || new Date(Date.now() + 3600000).toISOString(),
    status: 'Activa'
  };

  LOCAL_AUCTIONS_STORE.unshift(newAuctionObj);
  return newAuctionObj;
};

// Recalcular billeteras
export const recalculateWallets = () => {
  Object.keys(LOCAL_WALLETS).forEach((uId) => {
    LOCAL_WALLETS[uId].heldBalance = 0;
  });

  LOCAL_AUCTIONS_STORE.forEach((auc) => {
    if (auc.status === 'Activa' && auc.winningUserId && LOCAL_WALLETS[auc.winningUserId]) {
      const breakdown = calculateEscrowBreakdown(auc.currentPrice);
      LOCAL_WALLETS[auc.winningUserId].heldBalance += breakdown.totalEscrowRequired;
    }
  });

  Object.keys(LOCAL_WALLETS).forEach((uId) => {
    const w = LOCAL_WALLETS[uId];
    w.availableBalance = Math.max(0, w.balance - w.heldBalance);
  });
};

// Registrar puja
export const placeBid = async (auctionId, userId, amount) => {
  const numAmount = Number(amount);
  const userName = DEMO_USER_NAMES[userId] || `Usuario #${String(userId).substring(0, 8)}`;
  const nowIso = new Date().toISOString();
  const timeStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const targetAuction = LOCAL_AUCTIONS_STORE.find(a => a.id === auctionId);

  if (targetAuction) {
    if (targetAuction.winningUserId && String(targetAuction.winningUserId) === String(userId)) {
      throw new Error('Ya sos el líder de esta subasta. Debés esperar a que otro comprador realice una oferta superior.');
    }

    const incInfo = calculateDynamicIncrement(targetAuction.currentPrice);
    const minRequired = targetAuction.currentPrice + incInfo.increment;
    if (numAmount < minRequired) {
      throw new Error(`La oferta ($${numAmount.toLocaleString('es-AR')}) debe superar o igualar la oferta mínima de $${minRequired.toLocaleString('es-AR')}`);
    }

    targetAuction.currentPrice = numAmount;
    targetAuction.winningUserId = userId;
    targetAuction.bidCount = (targetAuction.bidCount || 0) + 1;

    const endMs = new Date(targetAuction.endTime).getTime();
    const nowMs = Date.now();
    const diffSec = (endMs - nowMs) / 1000;
    if (diffSec <= 60 && diffSec > 0) {
      targetAuction.endTime = new Date(endMs + 60000).toISOString();
    }
  }

  recalculateWallets();

  const newBidObj = {
    id: Date.now(),
    auctionId,
    userId,
    postor: userName,
    monto: numAmount,
    amount: numAmount,
    fecha: timeStr,
    timestamp: nowIso
  };

  if (!LOCAL_BIDS[auctionId]) {
    LOCAL_BIDS[auctionId] = [];
  }
  LOCAL_BIDS[auctionId].unshift(newBidObj);

  LOCAL_AUDIT_LOGS.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    auctionId,
    userId,
    action: 'PUJA_RECIBIDA',
    amount: numAmount,
    timestamp: nowIso
  });

  return newBidObj;
};

// Obtener billetera
export const getWallet = async (userId) => {
  recalculateWallets();
  return LOCAL_WALLETS[userId] || { userId, balance: 5000000, heldBalance: 0, availableBalance: 5000000 };
};

// Recargar billetera
export const depositWallet = async (userId, amount) => {
  const current = LOCAL_WALLETS[userId] || { userId, balance: 5000000, heldBalance: 0, availableBalance: 5000000 };
  current.balance += Number(amount);
  current.availableBalance += Number(amount);
  LOCAL_WALLETS[userId] = current;

  LOCAL_AUDIT_LOGS.push({
    id: Date.now(),
    auctionId: 'DEPOSITO_BANCARIO',
    userId,
    action: 'PAGO_GARANTIZADO',
    amount: Number(amount),
    timestamp: new Date().toISOString()
  });

  return current;
};

// Obtener logs de auditoría
export const getAuditLogs = async (auctionId) => {
  return LOCAL_AUDIT_LOGS;
};

export default api;
