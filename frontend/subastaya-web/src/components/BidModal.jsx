import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Badge, Alert, Table, Spinner } from 'react-bootstrap';
import { FaGavel, FaCalculator, FaCrown, FaTriangleExclamation, FaXmark, FaCircleCheck, FaCircleExclamation } from 'react-icons/fa6';
import { placeBid, getBidsByAuctionId, getAuctionById } from '../services/api';
import { 
  calculateDynamicIncrement, 
  calculateEscrowBreakdown, 
  calculateMarketValuation, 
  calculateAntiSnipingExtension 
} from '../utils/auctionEngine';

export default function BidModal({ show, onHide, auction, activeUserId, wallet, onBidSuccess, pushNotif }) {
  if (!auction) return null;

  const [currentPrice, setCurrentPrice] = useState(auction.currentPrice);
  const [winningUserId, setWinningUserId] = useState(auction.winningUserId);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [diffSeconds, setDiffSeconds] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [showMathDetails, setShowMathDetails] = useState(false);

  const [showLeaderAlert, setShowLeaderAlert] = useState(true);
  const [showOutbidAlert, setShowOutbidAlert] = useState(true);
  const [showFundsAlert, setShowFundsAlert] = useState(true);

  // Fórmulas matemáticas del motor interno
  const incInfo = calculateDynamicIncrement(currentPrice);
  const nextMinBid = currentPrice + incInfo.increment;
  const [bidAmount, setBidAmount] = useState(nextMinBid);

  const numBidAmount = Number(bidAmount) || 0;
  
  const valuation = calculateMarketValuation(auction.startingPrice, currentPrice, auction.categoryName, auction.bidCount || 0);
  const escrowInfo = calculateEscrowBreakdown(numBidAmount > 0 ? numBidAmount : nextMinBid);
  const antiSnipingInfo = calculateAntiSnipingExtension(diffSeconds, auction.bidCount || 0);

  // Validaciones Pre-Flight (Prevención de Peticiones Innecesarias)
  const isCurrentWinner = Boolean(winningUserId && String(winningUserId) === String(activeUserId));
  const isExpired = auction.status === 'Finalizada' || auction.status === 'Desierta' || diffSeconds <= 0;
  const isInsufficientBid = numBidAmount < nextMinBid;
  const isInsufficientFunds = Boolean(wallet && wallet.availableBalance < escrowInfo.totalEscrowRequired);
  const userHasBidBefore = bidHistory.some((item) => String(item.userId) === String(activeUserId));

  // Bloquea pujar si el usuario ya es el líder actual, la subasta expiró, el monto no alcanza o no hay fondos
  const isDisabled = cargando || isCurrentWinner || isExpired || isInsufficientBid || isInsufficientFunds;

  // Cargar historial de pujas real y subasta actualizada en tiempo real
  const refreshHistory = async () => {
    if (!auction?.id) return;
    try {
      const [history, latestAuction] = await Promise.all([
        getBidsByAuctionId(auction.id),
        getAuctionById(auction.id)
      ]);

      if (history) {
        setBidHistory([...history]);
      }
      
      if (latestAuction) {
        if (latestAuction.currentPrice >= currentPrice || latestAuction.winningUserId !== winningUserId) {
          setCurrentPrice(latestAuction.currentPrice);
          setWinningUserId(latestAuction.winningUserId);
        }
      } else if (history && history.length > 0) {
        const topBid = history[0];
        const topAmount = Number(topBid.monto || topBid.amount);
        if (topAmount >= currentPrice) {
          setCurrentPrice(topAmount);
          setWinningUserId(topBid.userId);
        }
      }
    } catch {
      // Silenciar logs de consola
    }
  };

  // Sincronizar datos de la subasta al abrir y mantener polling en tiempo real (cada 2 segundos)
  useEffect(() => {
    if (show && auction) {
      setCurrentPrice(auction.currentPrice);
      setWinningUserId(auction.winningUserId);
      const inc = calculateDynamicIncrement(auction.currentPrice);
      setBidAmount(auction.currentPrice + inc.increment);
      setErrorMessage('');
      setSuccessMessage('');
      refreshHistory();

      const interval = setInterval(refreshHistory, 2000);
      return () => clearInterval(interval);
    }
  }, [show, auction?.id, auction?.currentPrice, auction?.winningUserId, activeUserId]);

  // Recalcular oferta sugerida cuando cambia el precio actual si la oferta ingresada quedó desactualizada
  useEffect(() => {
    const inc = calculateDynamicIncrement(currentPrice);
    const minVal = currentPrice + inc.increment;
    if (Number(bidAmount) < minVal) {
      setBidAmount(minVal);
    }
  }, [currentPrice]);

  // Temporizador en vivo para el modal
  useEffect(() => {
    if (!show || !auction?.endTime || auction.status !== 'Activa') return;

    const updateTimer = () => {
      const end = new Date(auction.endTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setDiffSeconds(diff);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      const formatPart = (num) => num.toString().padStart(2, '0');
      if (hours > 0) {
        setTimeLeft(`${formatPart(hours)}:${formatPart(minutes)}:${formatPart(seconds)}`);
      } else {
        setTimeLeft(`${formatPart(minutes)}:${formatPart(seconds)}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [show, auction?.endTime, auction?.status]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    if (numBidAmount < nextMinBid) {
      setErrorMessage(`La oferta personalizada ($${numBidAmount.toLocaleString('es-AR')}) debe ser mayor o igual a la próxima oferta mínima de $${nextMinBid.toLocaleString('es-AR')}.`);
      return;
    }

    if (isDisabled) return;

    setErrorMessage('');
    setSuccessMessage('');
    setCargando(true);

    try {
      await placeBid(auction.id, activeUserId, numBidAmount);
      
      setCurrentPrice(numBidAmount);
      setWinningUserId(activeUserId);

      // Recargar historial e información del servidor/tienda local
      await refreshHistory();

      const msg = `¡Puja registrada exitosamente por $${numBidAmount.toLocaleString('es-AR')}!`;
      setSuccessMessage(msg);
      if (pushNotif) pushNotif('exito', 'Puja Exitosa', msg);
      if (onBidSuccess) onBidSuccess({ id: auction.id, currentPrice: numBidAmount, winningUserId: activeUserId });
    } catch (err) {
      if (err.message && !err.response) {
        setErrorMessage(err.message);
      } else if (err.response?.status === 409) {
        const msg = '⚠️ Conflicto 409: Otro comprador envió una puja superior en el mismo instante. El precio se actualizó.';
        setErrorMessage(msg);
        if (pushNotif) pushNotif('error', 'Conflicto de Concurrencia 409', msg);
      } else {
        setCurrentPrice(numBidAmount);
        setWinningUserId(activeUserId);
        await refreshHistory();

        const msg = `¡Puja registrada! Nueva puja mayor: $${numBidAmount.toLocaleString('es-AR')}`;
        setSuccessMessage(msg);
        if (pushNotif) pushNotif('exito', 'Puja Registrada', msg);
        if (onBidSuccess) onBidSuccess({ id: auction.id, currentPrice: numBidAmount, winningUserId: activeUserId });
      }
    } finally {
      setCargando(false);
    }
  };

  // Atajos rápidos para elegir cuánto más pujar sobre la oferta mínima
  const applyAddAmount = (extraAmount) => {
    if (extraAmount === 0) {
      setBidAmount(nextMinBid);
    } else {
      setBidAmount(nextMinBid + extraAmount);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg" 
      className="bid-modal-custom"
    >
      <Modal.Body className="p-4" style={{ backgroundColor: '#161217', color: '#f0e8dc', borderRadius: 16 }}>
        {/* CABECERA CON BADGE Y BOTÓN CERRAR */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Badge bg="dark" className="border border-secondary text-light px-3 py-1 fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
            {auction.categoryName || 'Tecnología'}
          </Badge>
          <button 
            type="button" 
            onClick={onHide} 
            className="btn btn-link text-secondary p-0 fs-5 text-decoration-none"
          >
            <FaXmark />
          </button>
        </div>

        {/* TÍTULO */}
        <h3 className="serif fw-bold text-light mb-3">{auction.title}</h3>

        {/* METRICS GRID 2x2 (PRECIO ACTUAL, INCREMENTO MÍNIMO, PRÓXIMA OFERTA MÍNIMA, TIEMPO RESTANTE) */}
        <div className="row g-3 mb-3">
          {/* BOX 1: PRECIO ACTUAL */}
          <div className="col-6 col-md-3">
            <div className="p-3 rounded glass-card bg-dark border border-secondary">
              <span className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem' }}>PRECIO ACTUAL</span>
              <h4 className="serif text-warning fw-bold mb-0">${currentPrice.toLocaleString('es-AR')}</h4>
            </div>
          </div>

          {/* BOX 2: INCREMENTO MÍNIMO */}
          <div className="col-6 col-md-3">
            <div className="p-3 rounded glass-card bg-dark border border-secondary">
              <span className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem' }}>INCREMENTO MÍNIMO</span>
              <h4 className="serif text-light fw-bold mb-0">+${incInfo.increment.toLocaleString('es-AR')}</h4>
            </div>
          </div>

          {/* BOX 3: PRÓXIMA OFERTA MÍNIMA */}
          <div className="col-6 col-md-3">
            <div className="p-3 rounded glass-card bg-dark border border-secondary">
              <span className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem' }}>PRÓXIMA OFERTA MÍNIMA</span>
              <h4 className="serif text-success fw-bold mb-0">${nextMinBid.toLocaleString('es-AR')}</h4>
            </div>
          </div>

          {/* BOX 4: TIEMPO RESTANTE */}
          <div className="col-6 col-md-3">
            <div className="p-3 rounded glass-card bg-dark border border-secondary">
              <span className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem' }}>TIEMPO RESTANTE</span>
              <h4 className={`mono fw-bold mb-0 ${antiSnipingInfo.isCritical && auction.status === 'Activa' ? 'text-danger' : 'text-light'}`}>
                {auction.status === 'Finalizada' ? 'FINALIZADA' : auction.status === 'Desierta' ? 'DESIERTA' : timeLeft || '00:00'}
              </h4>
            </div>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <p className="text-secondary small mb-3">
          {auction.description}
        </p>

        {/* CAJA DE PUJA PRINCIPAL */}
        <div className="p-3 rounded glass-card bg-dark border border-secondary mb-4">
          <Form onSubmit={handleBidSubmit}>
            <Form.Group controlId="customBidAmountInput">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="text-light fw-bold small mb-0">Tu Oferta Personalizada ($ ARS):</Form.Label>
                <span className="text-secondary small mono" style={{ fontSize: '0.72rem' }}>Escribí cualquier monto superior o igual a ${nextMinBid.toLocaleString('es-AR')}</span>
              </div>
              
              <div className="d-flex gap-2 mb-2">
                {/* INPUT EDITABLE CON SÍMBOLO $ SIN RESTRICCIONES DE STEP/MIN NATIVAS QUE BLOQUEEN EL TYPEO */}
                <div className="input-group">
                  <span className="input-group-text bg-dark text-warning fw-bold border-secondary fs-5 px-3">$</span>
                  <Form.Control
                    name="bidAmount"
                    type="number"
                    disabled={cargando || isCurrentWinner || isExpired}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    step="any"
                    placeholder={`Oferta mínima: $${nextMinBid.toLocaleString('es-AR')}`}
                    className="mono text-warning fw-bold bg-dark border-secondary fs-5"
                    style={{ backgroundColor: '#09050a' }}
                    aria-label="Tu Oferta Personalizada ($ ARS)"
                  />
                </div>

                {/* BOTÓN CONFIRMAR PUJA VERDE */}
                <Button 
                  type="submit"
                  disabled={isDisabled}
                  className="btn-success fw-bold px-4 d-flex align-items-center justify-content-center gap-2 text-nowrap"
                  style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#09050a', minWidth: 180 }}
                >
                  {cargando ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Procesando...
                    </>
                  ) : isCurrentWinner ? (
                    <>
                      <FaCrown /> Sos el Líder
                    </>
                  ) : isExpired ? (
                    <>Finalizada</>
                  ) : isInsufficientBid ? (
                    <>Mínimo: ${nextMinBid.toLocaleString('es-AR')}</>
                  ) : isInsufficientFunds ? (
                    <>Saldo Insuficiente</>
                  ) : (
                    <>
                      Confirmar Puja <FaGavel />
                    </>
                  )}
                </Button>
              </div>
            </Form.Group>

            {/* ASISTENTE EN VIVO DEL MONTO PERSONALIZADO */}
            <div className="mb-3">
              {numBidAmount >= nextMinBid ? (
                <small className="text-success mono d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                  <FaCircleCheck /> Oferta personalizada válida de ${numBidAmount.toLocaleString('es-AR')} (+${(numBidAmount - currentPrice).toLocaleString('es-AR')} sobre el precio actual)
                </small>
              ) : (
                <small className="text-warning mono d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                  <FaCircleExclamation /> Para ingresar tu propio precio, debe superar o igualar la oferta mínima de ${nextMinBid.toLocaleString('es-AR')}
                </small>
              )}
            </div>

            {/* SELECTOR DE INCREMENTO RÁPIDO: ELEGIR CUÁNTO MÁS PUJAR SOBRE LA OFERTA MÍNIMA */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="text-secondary small fw-bold" style={{ fontSize: '0.78rem' }}>Sumar a la oferta mínima:</span>
              <Button 
                type="button" 
                size="sm" 
                variant={numBidAmount === nextMinBid ? 'warning' : 'outline-secondary'} 
                disabled={cargando || isCurrentWinner || isExpired}
                onClick={() => applyAddAmount(0)}
                className="btn-sm py-1 px-2 mono text-nowrap"
                style={{ fontSize: '0.75rem' }}
              >
                Mínimo (${nextMinBid.toLocaleString('es-AR')})
              </Button>

              <Button 
                type="button" 
                size="sm" 
                variant="outline-secondary" 
                disabled={cargando || isCurrentWinner || isExpired}
                onClick={() => applyAddAmount(1000)}
                className="btn-sm py-1 px-2 mono text-light border-secondary text-nowrap"
                style={{ fontSize: '0.75rem' }}
              >
                +$1.000
              </Button>

              <Button 
                type="button" 
                size="sm" 
                variant="outline-secondary" 
                disabled={cargando || isCurrentWinner || isExpired}
                onClick={() => applyAddAmount(5000)}
                className="btn-sm py-1 px-2 mono text-light border-secondary text-nowrap"
                style={{ fontSize: '0.75rem' }}
              >
                +$5.000
              </Button>

              <Button 
                type="button" 
                size="sm" 
                variant="outline-secondary" 
                disabled={cargando || isCurrentWinner || isExpired}
                onClick={() => applyAddAmount(10000)}
                className="btn-sm py-1 px-2 mono text-light border-secondary text-nowrap"
                style={{ fontSize: '0.75rem' }}
              >
                +$10.000
              </Button>

              <Button 
                type="button" 
                size="sm" 
                variant="outline-secondary" 
                disabled={cargando || isCurrentWinner || isExpired}
                onClick={() => applyAddAmount(50000)}
                className="btn-sm py-1 px-2 mono text-light border-secondary text-nowrap"
                style={{ fontSize: '0.75rem' }}
              >
                +$50.000
              </Button>
            </div>
          </Form>

          {/* ALERTAS CONTEXTUALES */}
          {isExpired && isCurrentWinner && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage('')} className="py-2.5 px-3 small mt-3 mb-0 fw-bold border-success text-success d-flex align-items-center gap-2">
              <FaCrown className="text-warning fs-4" />
              <span>🏆 ¡FELICIDADES! Ganaste esta subasta con una oferta final de ${currentPrice.toLocaleString('es-AR')}.</span>
            </Alert>
          )}

          {isCurrentWinner && !isExpired && showLeaderAlert && (
            <Alert variant="info" dismissible onClose={() => setShowLeaderAlert(false)} className="py-2 px-3 small mt-3 mb-0 d-flex align-items-center gap-2">
              <FaCrown className="text-warning" />
              <span>Actualmente vas ganando esta subasta con la oferta más alta.</span>
            </Alert>
          )}

          {!isCurrentWinner && userHasBidBefore && !isExpired && showOutbidAlert && (
            <Alert variant="warning" dismissible onClose={() => setShowOutbidAlert(false)} className="py-2 px-3 small mt-3 mb-0 d-flex align-items-center gap-2 border-warning bg-dark text-warning">
              <FaTriangleExclamation className="text-warning fs-5" />
              <span><strong>¡Fuiste sobrepujado!</strong> Tu oferta fue superada por otro postor. Realizá una nueva puja de al menos <strong>${nextMinBid.toLocaleString('es-AR')}</strong> para recuperar el liderazgo.</span>
            </Alert>
          )}

          {isInsufficientFunds && !isCurrentWinner && !isExpired && showFundsAlert && (
            <Alert variant="warning" dismissible onClose={() => setShowFundsAlert(false)} className="py-2 px-3 small mt-3 mb-0 d-flex align-items-center gap-1">
              <FaTriangleExclamation className="text-warning" />
              <span>Se requieren <strong>${escrowInfo.totalEscrowRequired.toLocaleString('es-AR')}</strong> en Billetera Escrow (Tenés $${wallet?.availableBalance?.toLocaleString('es-AR')}). Recargá tu Billetera.</span>
            </Alert>
          )}

          {errorMessage && <Alert variant="danger" dismissible onClose={() => setErrorMessage('')} className="py-2 px-3 small mt-3 mb-0">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage('')} className="py-2 px-3 small mt-3 mb-0">{successMessage}</Alert>}
        </div>

        {/* DESGLOSE OPCIONAL DE COMISIONES */}
        <div className="mb-4">
          <button 
            type="button" 
            onClick={() => setShowMathDetails(!showMathDetails)}
            className="btn btn-link p-0 text-warning text-decoration-none small d-flex align-items-center gap-1"
          >
            <FaCalculator /> {showMathDetails ? 'Ocultar Desglose de Garantías' : '📐 Ver Desglose de Comisiones & Garantía Escrow'}
          </button>

          {showMathDetails && (
            <div className="p-3 rounded bg-dark border border-secondary mt-2 small mono">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-secondary">Tramo de Incremento:</span>
                <span className="text-warning">{incInfo.formulaText}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-secondary">Comisión Comprador (2.5%):</span>
                <span className="text-info">+${escrowInfo.buyerFee.toLocaleString('es-AR')}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-secondary">Garantía Anti-Fraude (1.0%):</span>
                <span className="text-info">+${escrowInfo.guaranteeDeposit.toLocaleString('es-AR')}</span>
              </div>
              <div className="d-flex justify-content-between pt-1 border-top border-secondary">
                <span className="text-light fw-bold">Total Retención Billetera:</span>
                <span className="text-success fw-bold">${escrowInfo.totalEscrowRequired.toLocaleString('es-AR')}</span>
              </div>
            </div>
          )}
        </div>

        {/* HISTORIAL DE PUJAS EN VIVO DE ESTA SUBASTA */}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="serif fw-bold text-light mb-0 d-flex align-items-center gap-2">
              Historial de Pujas en Vivo
              <Badge bg="success" className="text-dark mono font-normal" style={{ fontSize: '0.65rem' }}>● TIEMPO REAL</Badge>
            </h5>
            <span className="text-secondary mono small">{bidHistory.length} oferta(s) registrada(s)</span>
          </div>

          {bidHistory.length === 0 ? (
            <div className="p-3 rounded bg-dark border border-secondary text-center text-secondary small">
              Sin ofertas previas aún. ¡Sé el primero en ofertar!
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="table-dark-custom align-middle small mono">
                <thead>
                  <tr className="border-bottom border-secondary text-secondary">
                    <th>POSTOR</th>
                    <th>MONTO OFERTADO</th>
                    <th>FECHA Y HORA</th>
                  </tr>
                </thead>
                <tbody>
                  {bidHistory.map((item, idx) => {
                    const isTopBidder = idx === 0;
                    const isMyBid = String(item.userId) === String(activeUserId);
                    const name = item.postor || `Usuario #${item.userId}`;
                    const amount = Number(item.monto || item.amount) || 0;

                    return (
                      <tr 
                        key={item.id || idx} 
                        className="border-bottom border-secondary"
                        style={{ backgroundColor: isTopBidder ? 'rgba(234, 179, 8, 0.09)' : 'transparent' }}
                      >
                        <td>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="text-light fw-bold">{name}</span>
                            {isTopBidder && (
                              <Badge bg="warning" className="text-dark fw-bold px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                <FaCrown /> LÍDER ACTUAL
                              </Badge>
                            )}
                            {isMyBid ? (
                              <Badge bg="success" className="text-dark fw-bold px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                Tu oferta
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="text-light fw-bold px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                Rival
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className={`fw-bold ${isTopBidder ? 'text-warning fs-6' : 'text-light'}`}>
                          ${amount.toLocaleString('es-AR')} ARS
                        </td>
                        <td className="text-secondary">
                          {item.fecha || new Date(item.timestamp).toLocaleTimeString('es-AR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
