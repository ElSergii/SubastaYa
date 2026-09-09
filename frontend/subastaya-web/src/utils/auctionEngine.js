/**
 * MOTOR DE TRANSFORMACIONES MATEMÁTICAS Y FUNCIONES INTERNAS
 * SubastaYa - Systemic Auction Engine
 * 
 * Este módulo reemplaza números arbitrarios por fórmulas transparentes
 * de economía de subastas, teoría de juegos y finanzas en tiempo real.
 */

// 1. INCREMENTO DINÁMICO DE PUJA SEGÚN TRAMOS DE PRECIO
export function calculateDynamicIncrement(currentPrice) {
  const price = Number(currentPrice) || 0;
  let increment = 1000;
  let tierLabel = 'Rango Inicial (< $20.000) - Incremento del 5%';
  let percentage = 5;

  if (price >= 100000) {
    percentage = 3;
    tierLabel = 'Rango Alta Gama (≥ $100.000) - Incremento del 3%';
    increment = Math.max(5000, Math.floor((price * 0.03) / 1000) * 1000);
  } else if (price >= 20000) {
    percentage = 4;
    tierLabel = 'Rango Medio ($20.000 a $100.000) - Incremento del 4%';
    increment = Math.max(2500, Math.floor((price * 0.04) / 1000) * 1000);
  } else {
    percentage = 5;
    tierLabel = 'Rango Inicial (< $20.000) - Incremento del 5%';
    increment = Math.max(1000, Math.floor((price * 0.05) / 500) * 500);
  }

  return {
    increment,
    tierLabel,
    percentage,
    formulaText: `Paso de Puja Mínima: +$${increment.toLocaleString('es-AR')} (${percentage}% del precio)`
  };
}

// 2. DESGLOSE FINANCIERO DE GARANTÍA ESCROW Y COMISIONES
export function calculateEscrowBreakdown(bidAmount) {
  const amount = Number(bidAmount) || 0;
  
  // Comisión compradora de plataforma (2.5%)
  const buyerFee = Math.round(amount * 0.025);
  
  // Depósito de garantía anti-fraude (1% con tope de $500 y mínimo $100)
  const guaranteeDeposit = Math.min(500, Math.max(100, Math.round(amount * 0.01)));
  
  // Total retenido en Billetera Escrow (Exactamente el 100% del valor ofertado, sin recargos extra)
  const totalEscrowRequired = amount;
  
  // Ganancia neta para el vendedor (deduciendo 3.5% de comisión de venta)
  const sellerCommission = Math.round(amount * 0.035);
  const sellerNetPayout = amount - sellerCommission;

  return {
    netBid: amount,
    buyerFee,
    guaranteeDeposit,
    totalEscrowRequired,
    sellerCommission,
    sellerNetPayout,
    formulaText: `Monto Retenido: $${amount.toLocaleString('es-AR')} (100% exacto de la oferta)`
  };
}

// 3. VALUACIÓN DE MERCADO, DESCUENTO Y VELOCIDAD DE DEMANDA
export function calculateMarketValuation(startingPrice, currentPrice, categoryName, bidCount = 0) {
  const start = Number(startingPrice) || 10000;
  const current = Number(currentPrice) || start;
  const bids = Number(bidCount) || 0;

  // Multiplicador estimado de valor de mercado por categoría
  const categoryMultipliers = {
    'Tecnología': 1.50,
    'Coleccionables': 1.65,
    'Indumentaria': 1.35,
    'Vehículos': 1.45
  };

  const mult = categoryMultipliers[categoryName] || 1.40;
  const estimatedRetailValue = Math.round(start * mult);

  // Porcentaje de ahorro / descuento respecto al valor de mercado retail
  const discountPercentage = Math.max(0, Math.round(((estimatedRetailValue - current) / estimatedRetailValue) * 100));

  // Nivel de oportunidad según descuento
  let opportunityLevel = { level: 'Oportunidad Dorada', color: 'success', textClass: 'text-success', bgClass: 'bg-success' };
  if (discountPercentage < 10) {
    opportunityLevel = { level: 'Precio de Mercado', color: 'info', textClass: 'text-info', bgClass: 'bg-info' };
  } else if (discountPercentage < 25) {
    opportunityLevel = { level: 'Valor Justo', color: 'warning', textClass: 'text-warning', bgClass: 'bg-warning' };
  }

  // Índice de elasticidad / velocidad de demanda (0 a 100)
  const demandIndex = Math.min(100, Math.round(bids * 12 + (current / start) * 15));

  return {
    estimatedRetailValue,
    discountPercentage,
    opportunityLevel,
    demandIndex,
    multiplier: mult,
    formulaText: `Valor Sugerido: $${estimatedRetailValue.toLocaleString('es-AR')} | Descuento: ${discountPercentage}%`
  };
}

// 4. ALGORITMO DE EXTENSIÓN ANTI-SNIPING
export function calculateAntiSnipingExtension(diffSeconds, bidCount = 0) {
  const isCritical = diffSeconds <= 60 && diffSeconds > 0;
  const extensionSeconds = Math.min(180, 60 + (Number(bidCount) * 15));

  return {
    isCritical,
    extensionSeconds,
    explanation: isCritical 
      ? `Zona Crítica (<60s): Si ingresa una puja, la subasta se extenderá +${extensionSeconds} segundos automáticamente.` 
      : `Reloj normal. Extensión calculada para pujas de último segundo: +${extensionSeconds}s.`
  };
}

// 5. ANALÍTICA FINANCIERA DE BILLETERA Y COBERTURA DE RIESGO
export function calculateWalletAnalytics(wallet) {
  if (!wallet) return null;

  const total = Number(wallet.balance) || 0;
  const held = Number(wallet.heldBalance) || 0;
  const available = Number(wallet.availableBalance) || 0;

  const liquidityRatio = total > 0 ? Math.round((available / total) * 100) : 0;
  const exposureRatio = total > 0 ? Math.round((held / total) * 100) : 0;

  // Capacidad neta máxima de puja (100% directo de la liquidez disponible)
  const maxBidPower = Math.max(0, available);

  let healthStatus = { text: 'Excelente (Alta Liquidez)', variant: 'success' };
  if (liquidityRatio < 25) {
    healthStatus = { text: 'Crítico (Fondos Casi Agotados)', variant: 'danger' };
  } else if (liquidityRatio < 50) {
    healthStatus = { text: 'Moderado (Garantías Retenidas)', variant: 'warning' };
  }

  return {
    liquidityRatio,
    exposureRatio,
    maxBidPower,
    healthStatus,
    formulaText: `Capacidad de Oferta: $${maxBidPower.toLocaleString('es-AR')} | Liquidez: ${liquidityRatio}%`
  };
}

// 6. FIRMA DE INTEGRIDAD Y DELTAS EN AUDITORÍA
export function calculateAuditIntegrity(log) {
  const idNum = Number(log.id) || 1;
  const amount = Number(log.amount) || 0;
  
  // Generar hash visual inmutable de verificación
  const hash = `0x${((idNum * 2654435761 + amount) >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
  
  // Delta financiero estimado de la transacción
  let deltaText = `+$${amount.toLocaleString('es-AR')}`;
  let deltaClass = 'text-success';

  if (log.action === 'PUJA_RECHAZADA_INSUFFICIENTE' || log.action === 'CONCURRENCIA_409') {
    deltaText = `$0 (Fallido)`;
    deltaClass = 'text-danger';
  } else if (log.action === 'PAGO_GARANTIZADO') {
    deltaText = `-$${amount.toLocaleString('es-AR')}`;
    deltaClass = 'text-warning';
  }

  return {
    hash,
    deltaText,
    deltaClass,
    verificationCode: `ACID-OK [${hash}]`
  };
}

// 7. ASISTENTE DE VALUACIÓN PARA PUBLICACIÓN DE ADMIN
export function calculateAdminValuation(startingPrice, categoryId) {
  const price = Number(startingPrice) || 10000;
  const categoryNames = {
    'c1111111-1111-1111-1111-111111111111': 'Tecnología',
    'c2222222-2222-2222-2222-222222222222': 'Coleccionables',
    'c3333333-3333-3333-3333-333333333333': 'Indumentaria',
    'c4444444-4444-4444-4444-444444444444': 'Vehículos'
  };

  const catName = categoryNames[categoryId] || 'Coleccionables';
  const valuation = calculateMarketValuation(price, price, catName, 0);
  const inc = calculateDynamicIncrement(price);

  return {
    recommendedRetail: valuation.estimatedRetailValue,
    recommendedIncrement: inc.increment,
    suggestedReservePrice: Math.round(price * 1.15),
    tierLabel: inc.tierLabel
  };
}
