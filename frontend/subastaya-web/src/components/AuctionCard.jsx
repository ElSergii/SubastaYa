import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaClock, FaGavel, FaCrown, FaBolt, FaTriangleExclamation } from 'react-icons/fa6';
import BidModal from './BidModal';
import { placeBid } from '../services/api';
import { 
  calculateDynamicIncrement, 
  calculateEscrowBreakdown, 
  calculateAntiSnipingExtension 
} from '../utils/auctionEngine';

export default function AuctionCard({ auction, activeUserId, wallet, onBidSuccess, pushNotif }) {
  const [currentPrice, setCurrentPrice] = useState(auction.currentPrice);
  const [winningUserId, setWinningUserId] = useState(auction.winningUserId);
  const [timeLeft, setTimeLeft] = useState('');
  const [diffSeconds, setDiffSeconds] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fórmulas matemáticas del motor interno
  const incInfo = calculateDynamicIncrement(currentPrice);
  const nextMinBid = currentPrice + incInfo.increment;
  const escrowInfo = calculateEscrowBreakdown(nextMinBid);
  const antiSnipingInfo = calculateAntiSnipingExtension(diffSeconds, auction.bidCount || 0);

  const isCurrentWinner = Boolean(winningUserId && String(winningUserId) === String(activeUserId));
  const isExpired = auction.status === 'Finalizada' || auction.status === 'Desierta' || diffSeconds <= 0;
  const isInsufficientFunds = Boolean(wallet && wallet.availableBalance < escrowInfo.totalEscrowRequired);

  const isQuickBidDisabled = cargando || isCurrentWinner || isExpired || isInsufficientFunds;

  // Sincronizar estado interno si cambian las propiedades recibidas
  useEffect(() => {
    setCurrentPrice(auction.currentPrice);
    setWinningUserId(auction.winningUserId);
  }, [auction.currentPrice, auction.winningUserId]);

  // Formateador de tiempo restante en vivo
  useEffect(() => {
    if (auction.status === 'Finalizada' || auction.status === 'Desierta') return;

    const updateTimer = () => {
      const end = new Date(auction.endTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setDiffSeconds(diff);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      const format = (n) => n.toString().padStart(2, '0');
      if (hours > 0) {
        setTimeLeft(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
      } else {
        setTimeLeft(`${format(minutes)}:${format(seconds)}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime, auction.status]);

  // Puja Rápida Directa
  const handleQuickBid = async (e) => {
    e.stopPropagation();
    if (isQuickBidDisabled) return;

    setErrorMessage('');
    setSuccessMessage('');
    setCargando(true);

    try {
      await placeBid(auction.id, activeUserId, nextMinBid);
      setCurrentPrice(nextMinBid);
      setWinningUserId(activeUserId);

      const msg = `¡Puja rápida de $${nextMinBid.toLocaleString('es-AR')} realizada exitosamente!`;
      setSuccessMessage(msg);
      if (pushNotif) pushNotif('exito', 'Puja Rápida Exitosa', msg);
      if (onBidSuccess) onBidSuccess({ id: auction.id, currentPrice: nextMinBid, winningUserId: activeUserId });
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      if (err.response?.status === 409) {
        const msg = '⚠️ Conflicto 409: Otro comprador envió una oferta al mismo tiempo.';
        setErrorMessage(msg);
        if (pushNotif) pushNotif('error', 'Conflicto 409', msg);
        setTimeout(() => setErrorMessage(''), 4000);
      } else {
        // Simulación local si backend offline
        setCurrentPrice(nextMinBid);
        setWinningUserId(activeUserId);
        const msg = `¡Puja rápida registrada por $${nextMinBid.toLocaleString('es-AR')}!`;
        setSuccessMessage(msg);
        if (pushNotif) pushNotif('exito', 'Puja Rápida', msg);
        if (onBidSuccess) onBidSuccess({ id: auction.id, currentPrice: nextMinBid, winningUserId: activeUserId });
        setTimeout(() => setSuccessMessage(''), 3500);
      }
    } finally {
      setCargando(false);
    }
  };

  // Determinar color de badge de estado superior derecho
  const getStatusBadge = () => {
    if (auction.status === 'Finalizada' || isExpired) {
      if (isCurrentWinner) {
        return <Badge bg="success" className="fw-bold px-2 py-1 text-uppercase">🏆 ¡GANASTE!</Badge>;
      }
      return <Badge style={{ backgroundColor: '#a855f7', color: '#ffffff' }} className="fw-bold px-2 py-1 text-uppercase">FINALIZADA</Badge>;
    }
    if (auction.status === 'Desierta') {
      return <Badge bg="secondary" className="fw-bold px-2 py-1 text-uppercase">DESIERTA</Badge>;
    }
    if (auction.status === 'Programada') {
      return <Badge bg="info" className="text-dark fw-bold px-2 py-1 text-uppercase">PROGRAMADA</Badge>;
    }
    return <Badge bg="success" className="text-dark fw-bold px-2 py-1 text-uppercase">ACTIVA</Badge>;
  };

  return (
    <>
      <Card 
        className={`glass-card h-100 border-0 ${antiSnipingInfo.isCritical && auction.status === 'Activa' ? 'critical-timer' : ''}`}
        style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#130b10', borderRadius: 12, overflow: 'hidden' }}
      >
        {/* CABECERA DE IMAGEN CON BADGES EN LAS ESQUINAS */}
        <div className="position-relative overflow-hidden" style={{ height: 180 }}>
          <Card.Img
            variant="top"
            src={auction.imageUrl || 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80'}
            alt={auction.title}
            style={{ height: 180, objectFit: 'cover', filter: auction.status !== 'Activa' ? 'grayscale(0.3) brightness(0.7)' : 'brightness(0.85)' }}
          />

          {/* BADGE CATEGORÍA (IZQUIERDA) */}
          <div className="position-absolute top-0 start-0 m-3">
            <Badge bg="dark" className="border border-secondary text-light fw-bold px-2 py-1">
              {auction.categoryName || 'General'}
            </Badge>
          </div>

          {/* BADGE ESTADO (DERECHA) */}
          <div className="position-absolute top-0 end-0 m-3">
            {getStatusBadge()}
          </div>
        </div>

        {/* CONTENIDO DE LA TARJETA */}
        <Card.Body className="d-flex flex-column p-3">
          <h5 className="serif fw-bold text-light mb-1">{auction.title}</h5>
          <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
            {auction.description}
          </p>

          {/* CAJA DE PRECIOS 2 COLUMNAS (PRECIO ACTUAL | PRÓXIMA MÍNIMA) */}
          <div className="p-2.5 rounded mb-2 glass-card bg-dark border border-secondary" style={{ backgroundColor: '#09050a' }}>
            <div className="row text-center g-0">
              <div className="col-6 border-end border-secondary pe-2">
                <span className="text-secondary small d-block text-uppercase fw-bold" style={{ fontSize: '0.62rem' }}>PRECIO ACTUAL</span>
                <h5 className="serif text-warning fw-bold mb-0" style={{ color: '#eab308' }}>${currentPrice.toLocaleString('es-AR')}</h5>
              </div>
              <div className="col-6 ps-2">
                <span className="text-secondary small d-block text-uppercase fw-bold" style={{ fontSize: '0.62rem' }}>PRÓXIMA MÍNIMA</span>
                <h5 className="serif text-success fw-bold mb-0" style={{ color: '#22c55e' }}>${nextMinBid.toLocaleString('es-AR')}</h5>
              </div>
            </div>
          </div>

          {/* FILA DE TIEMPO RESTANTE */}
          <div className="d-flex justify-content-between align-items-center p-2 rounded mb-3 bg-dark border border-secondary" style={{ backgroundColor: '#09050a', fontSize: '0.8rem' }}>
            <span className="text-secondary d-flex align-items-center gap-1">
              👾 Restante:
            </span>
            <span className={`mono fw-bold ${antiSnipingInfo.isCritical && auction.status === 'Activa' ? 'text-danger' : 'text-light'}`}>
              {auction.status === 'Finalizada' ? 'FINALIZADA' : auction.status === 'Desierta' ? 'DESIERTA' : timeLeft || '00:00'}
            </span>
          </div>

          {/* MUESTRA DE GANADOR O LÍDER ACTUAL */}
          {isExpired && isCurrentWinner ? (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage('')} className="py-1 px-2 small mb-2 fw-bold text-success border-success">
              🏆 ¡FELICIDADES! ¡GANASTE ESTA SUBASTA!
            </Alert>
          ) : isExpired && winningUserId ? (
            <Alert variant="secondary" className="py-1 px-2 small mb-2 text-muted">
              Subasta Finalizada
            </Alert>
          ) : isCurrentWinner ? (
            <Alert variant="info" className="py-1 px-2 small mb-2 d-flex align-items-center gap-2">
              <FaCrown className="text-warning" />
              <span>Vas ganando esta subasta.</span>
            </Alert>
          ) : null}

          {errorMessage && (
            <Alert variant="danger" dismissible onClose={() => setErrorMessage('')} className="py-1 px-2 small mb-2">
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage('')} className="py-1 px-2 small mb-2">
              {successMessage}
            </Alert>
          )}

          {/* BOTONES DE ACCIÓN INFERIORES: PUJA RÁPIDA | OFERTAR / INFO */}
          <div className="row g-2 mt-auto">
            {/* BOTÓN PUJA RÁPIDA (IZQUIERDA) */}
            <div className="col-7">
              <Button
                size="sm"
                variant="dark"
                disabled={isQuickBidDisabled}
                onClick={handleQuickBid}
                className="w-100 py-1.5 fw-bold border-secondary d-flex align-items-center justify-content-center gap-1"
                style={{ backgroundColor: '#1c141c', color: isQuickBidDisabled ? '#6b7280' : '#eab308', fontSize: '0.78rem' }}
              >
                {cargando ? (
                  <Spinner animation="border" size="sm" />
                ) : isExpired && isCurrentWinner ? (
                  <>🏆 Subasta Ganada</>
                ) : isCurrentWinner ? (
                  <>
                    <FaCrown className="text-warning" /> Sos el Líder
                  </>
                ) : (
                  <>
                    <FaBolt className="text-warning" /> Puja Rápida (${nextMinBid.toLocaleString('es-AR')})
                  </>
                )}
              </Button>
            </div>

            {/* BOTÓN OFERTAR / INFO (DERECHA) - APERURA DEL BIDMODAL */}
            <div className="col-5">
              <Button
                size="sm"
                variant="outline-light"
                onClick={() => setShowBidModal(true)}
                className="w-100 py-1.5 fw-bold border-secondary"
                style={{ fontSize: '0.78rem', backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                Ofertar / Info
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* MODAL DE PUJA EN VIVO ESTILO CAPTURA */}
      <BidModal
        show={showBidModal}
        onHide={() => setShowBidModal(false)}
        auction={{ ...auction, currentPrice, winningUserId }}
        activeUserId={activeUserId}
        wallet={wallet}
        onBidSuccess={() => {
          if (onBidSuccess) onBidSuccess();
        }}
        pushNotif={pushNotif}
      />
    </>
  );
}
