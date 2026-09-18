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

// Usuarios demo (IDs de 2 dígitos)
export const DEMO_USER_NAMES = {
  '10': 'Ana García (Comprador 1)',
  '20': 'María López (Comprador 2)',
  '30': 'Carlos Sin Fondos',
  '40': 'Admin SubastaYa (Vendedor)'
};

// Billeteras iniciales
const LOCAL_WALLETS = {
  '10': { userId: '10', balance: 5000000, heldBalance: 0, availableBalance: 5000000 },
  '20': { userId: '20', balance: 5000000, heldBalance: 0, availableBalance: 5000000 },
  '30': { userId: '30', balance: 0, heldBalance: 0, availableBalance: 0 },
  '40': { userId: '40', balance: 5000000, heldBalance: 0, availableBalance: 5000000 }
};

const now = new Date();

// Almacén local de subastas (IDs de 2 dígitos)
export const LOCAL_AUCTIONS_STORE = [
  {
    id: '11',
    title: 'MacBook Pro M3 Max 16 Pulgadas',
    description: 'Computadora portátil profesional Apple M3 Max 36GB RAM en estado impecable.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Tecnología',
    startingPrice: 30000,
    currentPrice: 45000,
    minimumIncrement: 2000,
    winningUserId: '10',
    endTime: new Date(now.getTime() + 45 * 60000).toISOString(),
    status: 'Activa',
    bidCount: 4
  },
  {
    id: '12',
    title: 'Chaqueta de Cuero Vintage Schott NYC',
    description: 'Chaqueta clásica de cuero vacuno talle M en excelente estado de conservación.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Indumentaria',
    startingPrice: 15000,
    currentPrice: 28000,
    minimumIncrement: 1000,
    winningUserId: '20',
    endTime: new Date(now.getTime() + 60 * 60000).toISOString(),
    status: 'Activa',
    bidCount: 5
  },
  {
    id: '13',
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
    id: '14',
    title: 'Auto Colección 1:18',
    description: 'Modelo a escala metálico con aperturas de puertas y detalles interiores.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Vehículos',
    startingPrice: 35000,
    currentPrice: 45000,
    minimumIncrement: 2000,
    winningUserId: '10',
    endTime: new Date(now.getTime() - 3600000).toISOString(),
    status: 'Finalizada',
    bidCount: 5
  },
  {
    id: '15',
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
    id: '16',
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
  '11': [
    { id: 101, postor: 'Ana García (Comprador 1)', userId: '10', monto: 45000, fecha: '12:41:07 a. m.', timestamp: new Date().toISOString() },
    { id: 102, postor: 'María López (Comprador 2)', userId: '20', monto: 39000, fecha: '12:40:05 a. m.', timestamp: new Date(Date.now() - 120000).toISOString() }
  ],
  '12': [
    { id: 201, postor: 'María López (Comprador 2)', userId: '20', monto: 28000, fecha: '11:15:22 a. m.', timestamp: new Date().toISOString() },
    { id: 202, postor: 'Ana García (Comprador 1)', userId: '10', monto: 25000, fecha: '11:12:04 a. m.', timestamp: new Date(Date.now() - 300000).toISOString() }
  ],
  '13': [
    { id: 301, postor: 'María López (Comprador 2)', userId: '20', monto: 85000, fecha: '10:05:10 a. m.', timestamp: new Date().toISOString() }
  ]
};

// Eventos de auditoría
const LOCAL_AUDIT_LOGS = [
  { id: 1, auctionId: '11', userId: '10', action: 'PUJA_RECIBIDA', amount: 45000, timestamp: new Date().toISOString() },
  { id: 2, auctionId: '12', userId: '20', action: 'PUJA_RECIBIDA', amount: 28000, timestamp: new Date(Date.now() - 120000).toISOString() }
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
    '1': 'Tecnología',
    '2': 'Coleccionables',
    '3': 'Indumentaria',
    '4': 'Vehículos'
  };

  if (USE_HTTP_BACKEND) {
    try {
      const response = await api.post('/auctions', auctionData);
      if (response.data) return response.data;
    } catch (err) {
      console.error('[CODE-ERROR] - Error HTTP en createAuction:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || 'Error al crear la subasta en el servidor.';
      throw new Error(serverMsg);
    }
  }

  const nextId = String(LOCAL_AUCTIONS_STORE.length + 11);

  const durationHrs = Number(auctionData.durationHours) || 24;
  const calculatedEndTime = auctionData.endDate || auctionData.endTime || new Date(Date.now() + durationHrs * 3600000).toISOString();

  const newAuctionObj = {
    ...auctionData,
    id: nextId,
    title: auctionData.title || auctionData.Titulo || 'Nueva Subasta',
    description: auctionData.description || auctionData.Descripcion || '',
    imageUrl: auctionData.imageUrl || auctionData.UrlImagen || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    startingPrice: Number(auctionData.startingPrice || auctionData.PrecioBase || 1000),
    currentPrice: Number(auctionData.startingPrice || auctionData.PrecioBase || 1000),
    minimumIncrement: Number(auctionData.minimumIncrement || auctionData.IncrementoMinimo || 500),
    categoryName: auctionData.categoryName || categoryNames[auctionData.categoryId] || 'Coleccionables',
    categoryId: auctionData.categoryId || '2',
    sellerId: auctionData.sellerId || auctionData.seller || '40',
    bidCount: 0,
    winningUserId: null,
    endTime: calculatedEndTime,
    status: 'Activa'
  };

  LOCAL_AUCTIONS_STORE.unshift(newAuctionObj);

  LOCAL_AUDIT_LOGS.push({
    id: Math.floor(10 + Math.random() * 89),
    auctionId: nextId,
    userId: String(newAuctionObj.sellerId),
    action: 'SUBASTA_CREADA',
    amount: newAuctionObj.startingPrice,
    timestamp: new Date().toISOString()
  });

  return newAuctionObj;
};

// Eliminar/Cancelar subasta
export const deleteAuction = async (auctionId, userId) => {
  if (USE_HTTP_BACKEND) {
    try {
      const response = await api.delete(`/auctions/${auctionId}`, {
        params: { userId }
      });
      return response.data;
    } catch (err) {
      console.error('[CODE-ERROR] - Error HTTP en deleteAuction:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || 'Error al eliminar la subasta en el servidor.';
      throw new Error(serverMsg);
    }
  }

  const idx = LOCAL_AUCTIONS_STORE.findIndex((auc) => String(auc.id) === String(auctionId));
  if (idx === -1) {
    throw new Error(`Subasta con ID ${auctionId} no encontrada.`);
  }

  const target = LOCAL_AUCTIONS_STORE[idx];
  const isSeller = String(target.sellerId) === String(userId);
  const isAdmin = String(userId) === '40' || String(userId) === '00000000-0000-0000-0000-000000000040';

  if (!isSeller && !isAdmin) {
    throw new Error('Solo el vendedor creador o un Administrador puede cancelar esta subasta.');
  }

  const bids = LOCAL_BIDS[auctionId] || [];
  if ((target.bidCount && target.bidCount > 0) || bids.length > 0) {
    throw new Error('No se puede cancelar una subasta que ya posee ofertas registradas.');
  }

  LOCAL_AUCTIONS_STORE.splice(idx, 1);
  delete LOCAL_BIDS[auctionId];

  LOCAL_AUDIT_LOGS.push({
    id: Math.floor(10 + Math.random() * 89),
    auctionId: String(auctionId),
    userId: String(userId),
    action: 'SUBASTA_CANCELADA',
    amount: target.currentPrice,
    timestamp: new Date().toISOString()
  });

  return { success: true, message: 'Subasta cancelada exitosamente.' };
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
  const userName = DEMO_USER_NAMES[userId] || `Usuario #${userId}`;
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

  const newBidId = Math.floor(100 + Math.random() * 899);

  const newBidObj = {
    id: newBidId,
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
    id: Math.floor(10 + Math.random() * 89),
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
    id: Math.floor(10 + Math.random() * 89),
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
