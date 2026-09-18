import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Spinner, Table, Alert } from 'react-bootstrap';
import { 
  FaClipboardList, 
  FaGavel, 
  FaCrown, 
  FaTriangleExclamation, 
  FaTrophy, 
  FaBoxOpen, 
  FaTrashCan, 
  FaBolt, 
  FaClock,
  FaCircle,
  FaSquare
} from 'react-icons/fa6';
import { getAuctions, getUserBidsMap, deleteAuction } from '../services/api';
import BidModal from './BidModal';

export default function MyActivitiesView({ currentUser, activeUserId, wallet, onBidSuccess, pushNotif }) {
  const [activeMainTab, setActiveMainTab] = useState('bids'); // 'bids' (Comprador) | 'sales' (Vendedor)
  const [buyerFilter, setBuyerFilter] = useState('all'); // 'all' | 'winning' | 'outbid' | 'won'
  
  const [auctions, setAuctions] = useState([]);
  const [userBidAuctionIds, setUserBidAuctionIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [cargandoEliminarId, setCargandoEliminarId] = useState(null);

  const userIdToMatch = String(activeUserId || currentUser?.id || '10');

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [allAuctions, bidMap] = await Promise.all([
        getAuctions(),
        getUserBidsMap(userIdToMatch)
      ]);

      if (Array.isArray(allAuctions)) {
        setAuctions([...allAuctions]);
      }
      if (bidMap) {
        setUserBidAuctionIds(bidMap);
      }
    } catch (ex) {
      console.error(`[CODE-ERROR] - Error al cargar actividades del usuario ${userIdToMatch}: ${ex.message}`);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 2500);
    return () => clearInterval(interval);
  }, [userIdToMatch]);

  // Handler para cancelar subasta desde Mis Publicaciones
  const handleDeleteAuction = async (auctionId) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas cancelar esta subasta? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    setCargandoEliminarId(auctionId);
    try {
      const res = await deleteAuction(auctionId, userIdToMatch);
      const msg = res?.message || 'Subasta cancelada exitosamente.';
      if (pushNotif) pushNotif('exito', 'Subasta Cancelada', msg);
      await fetchData();
      if (onBidSuccess) onBidSuccess();
    } catch (ex) {
      console.error(`[CODE-ERROR] - Error al eliminar subasta ${auctionId}: ${ex.message}`);
      if (pushNotif) pushNotif('error', 'Error de Cancelación', ex.message || 'No se pudo cancelar la subasta.');
    } finally {
      setCargandoEliminarId(null);
    }
  };

  // --------------------------------------------------------------------------
  // CLASIFICACIÓN DE SUBASTAS PARA COMPRADOR (MIS OFERTAS)
  // --------------------------------------------------------------------------
  const buyerAuctions = auctions.filter((idx_tk) => {
    const isParticipant = userBidAuctionIds.has(String(idx_tk.id)) || String(idx_tk.winningUserId) === userIdToMatch;
    return isParticipant;
  });

  const categorizedBuyerAuctions = buyerAuctions.map((idx_tk) => {
    const isWinner = String(idx_tk.winningUserId) === userIdToMatch;
    const isFinished = idx_tk.status === 'Finalizada' || idx_tk.status === 'FINALIZADA';

    let categoryState = 'outbid'; // 'winning' | 'outbid' | 'won'
    if (isFinished && isWinner) {
      categoryState = 'won';
    } else if (!isFinished && isWinner) {
      categoryState = 'winning';
    } else if (!isFinished && !isWinner) {
      categoryState = 'outbid';
    } else {
      categoryState = 'lost';
    }

    return { ...idx_tk, categoryState };
  });

  const filteredBuyerAuctions = categorizedBuyerAuctions.filter((idx_tk) => {
    if (buyerFilter === 'all') return true;
    return idx_tk.categoryState === buyerFilter;
  });

  // Conteo para Badges de Comprador
  const countWinning = categorizedBuyerAuctions.filter((idx_tk) => idx_tk.categoryState === 'winning').length;
  const countOutbid = categorizedBuyerAuctions.filter((idx_tk) => idx_tk.categoryState === 'outbid').length;
  const countWon = categorizedBuyerAuctions.filter((idx_tk) => idx_tk.categoryState === 'won').length;

  // --------------------------------------------------------------------------
  // CLASIFICACIÓN DE SUBASTAS PARA VENDEDOR (MIS PUBLICACIONES)
  // --------------------------------------------------------------------------
  const sellerAuctions = auctions.filter((idx_tk) => {
    return String(idx_tk.sellerId || idx_tk.seller) === userIdToMatch;
  });

  return (
    <div className="py-4" data-sys-render="auto">
      {/* CABECERA PRINCIPAL */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="serif fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <FaClipboardList className="text-warning" /> Mis Actividades
          </h2>
          <p className="text-secondary small mb-0">
            Seguimiento unificado de tus ofertas activas como comprador y tus subastas publicadas como vendedor.
          </p>
        </div>
        {loading && <Spinner animation="border" size="sm" variant="warning" />}
      </div>

      {/* TABS SUPERIORES DE SELECCIÓN (MIS OFERTAS VS MIS PUBLICACIONES) */}
      <div className="d-flex gap-2 mb-4 border-bottom border-secondary pb-3">
        <Button
          onClick={() => setActiveMainTab('bids')}
          className={`px-4 py-2 fw-bold d-flex align-items-center gap-2 ${
            activeMainTab === 'bids'
              ? 'btn-warning text-dark border-warning'
              : 'btn-dark text-secondary border-secondary'
          }`}
          style={{ borderRadius: 10 }}
        >
          <FaGavel /> Mis Ofertas (Comprador)
          <Badge bg="dark" className="text-warning border border-warning ms-1">
            {buyerAuctions.length}
          </Badge>
        </Button>

        <Button
          onClick={() => setActiveMainTab('sales')}
          className={`px-4 py-2 fw-bold d-flex align-items-center gap-2 ${
            activeMainTab === 'sales'
              ? 'btn-warning text-dark border-warning'
              : 'btn-dark text-secondary border-secondary'
          }`}
          style={{ borderRadius: 10 }}
        >
          <FaBoxOpen /> Mis Publicaciones (Vendedor)
          <Badge bg="dark" className="text-warning border border-warning ms-1">
            {sellerAuctions.length}
          </Badge>
        </Button>
      </div>

      {/* ==================================================================== */}
      {/* PESTAÑA A: MIS OFERTAS (COMPRADOR) */}
      {/* ==================================================================== */}
      {activeMainTab === 'bids' && (
        <div>
          {/* SUB-FILTROS DE ESTADO COMPRADOR */}
          <Card className="glass-card p-3 mb-4 border border-secondary" style={{ backgroundColor: '#130b10', borderRadius: 12 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="text-secondary small fw-bold me-2" style={{ fontSize: '0.75rem' }}>ESTADO OFERTA:</span>

              <Button
                size="sm"
                onClick={() => setBuyerFilter('all')}
                className={`rounded-pill px-3 py-1 fw-bold ${
                  buyerFilter === 'all' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'
                }`}
                style={{ fontSize: '0.78rem' }}
              >
                Todas ({buyerAuctions.length})
              </Button>

              <Button
                size="sm"
                onClick={() => setBuyerFilter('winning')}
                className={`rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${
                  buyerFilter === 'winning' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'
                }`}
                style={{ fontSize: '0.78rem' }}
              >
                <FaCrown className="text-warning" /> Vas Ganando ({countWinning})
              </Button>

              <Button
                size="sm"
                onClick={() => setBuyerFilter('outbid')}
                className={`rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${
                  buyerFilter === 'outbid' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'
                }`}
                style={{ fontSize: '0.78rem' }}
              >
                <FaTriangleExclamation className="text-warning" /> Oferta Superada ({countOutbid})
              </Button>

              <Button
                size="sm"
                onClick={() => setBuyerFilter('won')}
                className={`rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${
                  buyerFilter === 'won' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'
                }`}
                style={{ fontSize: '0.78rem' }}
              >
                <FaTrophy className="text-warning" /> Adjudicadas ({countWon})
              </Button>
            </div>
          </Card>

          {/* GRILLA / LISTADO DE SUBSTAS DEL COMPRADOR */}
          {filteredBuyerAuctions.length === 0 ? (
            <Card className="glass-card p-5 text-center border border-secondary" style={{ backgroundColor: '#130b10', borderRadius: 12 }}>
              <div className="mb-3 fs-1 text-secondary">🔨</div>
              <h5 className="text-light fw-bold">No hay ofertas registradas en esta categoría.</h5>
              <p className="text-secondary small mb-0">
                Explorá el catálogo de subastas en vivo y realizá tu primera oferta para participar.
              </p>
            </Card>
          ) : (
            <Row className="g-4">
              {filteredBuyerAuctions.map((idx_tk) => {
                const nextMinBid = idx_tk.currentPrice + (idx_tk.minimumIncrement || 1000);
                return (
                  <Col xs={12} md={6} lg={4} key={idx_tk.id}>
                    <Card
                      className="glass-card h-100 border-secondary overflow-hidden d-flex flex-column"
                      style={{ backgroundColor: '#130b10', borderRadius: 14 }}
                    >
                      <div className="position-relative" style={{ height: 160 }}>
                        <Card.Img
                          variant="top"
                          src={idx_tk.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'}
                          alt={idx_tk.title}
                          style={{ height: 160, objectFit: 'cover', filter: idx_tk.categoryState === 'won' ? 'brightness(0.9)' : 'brightness(0.8)' }}
                        />
                        <div className="position-absolute top-0 start-0 m-3">
                          <Badge bg="dark" className="border border-secondary text-light fw-bold px-2 py-1" style={{ fontSize: '0.7rem' }}>
                            {idx_tk.categoryName || 'General'}
                          </Badge>
                        </div>

                        <div className="position-absolute top-0 end-0 m-3">
                          {idx_tk.categoryState === 'winning' && (
                            <Badge bg="success" className="text-dark fw-bold px-2 py-1 text-uppercase d-flex align-items-center gap-1">
                              <FaCrown /> Vas Ganando
                            </Badge>
                          )}
                          {idx_tk.categoryState === 'outbid' && (
                            <Badge bg="warning" className="text-dark fw-bold px-2 py-1 text-uppercase d-flex align-items-center gap-1">
                              <FaTriangleExclamation /> Oferta Superada
                            </Badge>
                          )}
                          {idx_tk.categoryState === 'won' && (
                            <Badge style={{ backgroundColor: '#c9a84c', color: '#09050a' }} className="fw-bold px-2 py-1 text-uppercase d-flex align-items-center gap-1">
                              <FaTrophy /> Ganada / Adjudicada
                            </Badge>
                          )}
                          {idx_tk.categoryState === 'lost' && (
                            <Badge bg="secondary" className="fw-bold px-2 py-1 text-uppercase">
                              Finalizada
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Card.Body className="d-flex flex-column p-3">
                        <h5 className="serif fw-bold text-light mb-1">{idx_tk.title}</h5>
                        <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                          {idx_tk.description}
                        </p>

                        <div className="p-2.5 rounded mb-3 bg-dark border border-secondary" style={{ backgroundColor: '#09050a' }}>
                          <div className="row text-center g-0">
                            <div className="col-6 border-end border-secondary pe-2">
                              <span className="text-secondary small d-block text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>PRECIO ACTUAL</span>
                              <h5 className="serif text-warning fw-bold mb-0">${idx_tk.currentPrice.toLocaleString('es-AR')}</h5>
                            </div>
                            <div className="col-6 ps-2">
                              <span className="text-secondary small d-block text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>PRÓXIMA MÍNIMA</span>
                              <h5 className="serif text-success fw-bold mb-0">${nextMinBid.toLocaleString('es-AR')}</h5>
                            </div>
                          </div>
                        </div>

                        {/* ACCIONES SEGÚN ESTADO DE COMPRADOR */}
                        <div className="mt-auto">
                          {idx_tk.categoryState === 'outbid' && (
                            <Button
                              size="sm"
                              className="w-100 fw-bold py-2 btn-warning text-dark border-warning d-flex align-items-center justify-content-center gap-2"
                              onClick={() => {
                                setSelectedAuction(idx_tk);
                                setShowBidModal(true);
                              }}
                            >
                              <FaBolt /> Contraofertar (${nextMinBid.toLocaleString('es-AR')})
                            </Button>
                          )}

                          {idx_tk.categoryState === 'winning' && (
                            <Alert variant="success" className="py-2 px-3 small mb-0 text-center fw-bold border-success text-success">
                              <FaCrown className="me-1" /> ¡Sos el líder actual de la subasta!
                            </Alert>
                          )}

                          {idx_tk.categoryState === 'won' && (
                            <Alert variant="warning" className="py-2 px-3 small mb-0 text-center fw-bold border-warning text-warning" style={{ backgroundColor: 'rgba(201,168,76,0.1)' }}>
                              <FaTrophy className="me-1 text-warning" /> Subasta adjudicada por ${idx_tk.currentPrice.toLocaleString('es-AR')}
                            </Alert>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* PESTAÑA B: MIS PUBLICACIONES (VENDEDOR) */}
      {/* ==================================================================== */}
      {activeMainTab === 'sales' && (
        <div>
          {sellerAuctions.length === 0 ? (
            <Card className="glass-card p-5 text-center border border-secondary" style={{ backgroundColor: '#130b10', borderRadius: 12 }}>
              <div className="mb-3 fs-1 text-secondary">📦</div>
              <h5 className="text-light fw-bold">Aún no has publicado ninguna subasta.</h5>
              <p className="text-secondary small mb-3">
                Creá tu primera subasta en tiempo real para vender artículos con garantía Escrow.
              </p>
            </Card>
          ) : (
            <Row className="g-4">
              {sellerAuctions.map((idx_tk) => {
                const bidsCount = idx_tk.bidCount || 0;
                const canCancel = bidsCount === 0 && (idx_tk.status === 'Activa' || idx_tk.status === 'ACTIVA' || idx_tk.status === 'Programada');

                return (
                  <Col xs={12} md={6} lg={4} key={idx_tk.id}>
                    <Card
                      className="glass-card h-100 border-secondary overflow-hidden d-flex flex-column"
                      style={{ backgroundColor: '#130b10', borderRadius: 14 }}
                    >
                      <div className="position-relative" style={{ height: 160 }}>
                        <Card.Img
                          variant="top"
                          src={idx_tk.imageUrl || 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800'}
                          alt={idx_tk.title}
                          style={{ height: 160, objectFit: 'cover', filter: 'brightness(0.85)' }}
                        />
                        <div className="position-absolute top-0 start-0 m-3">
                          <Badge bg="dark" className="border border-secondary text-light fw-bold px-2 py-1" style={{ fontSize: '0.7rem' }}>
                            {idx_tk.categoryName || 'General'}
                          </Badge>
                        </div>

                        <div className="position-absolute top-0 end-0 m-3">
                          {idx_tk.status === 'Activa' && (
                            <Badge bg="success" className="text-dark fw-bold px-2 py-1 text-uppercase">ACTIVA</Badge>
                          )}
                          {idx_tk.status === 'Finalizada' && (
                            <Badge style={{ backgroundColor: '#a855f7', color: '#ffffff' }} className="fw-bold px-2 py-1 text-uppercase">FINALIZADA</Badge>
                          )}
                          {idx_tk.status === 'Desierta' && (
                            <Badge bg="secondary" className="fw-bold px-2 py-1 text-uppercase">DESIERTA</Badge>
                          )}
                          {idx_tk.status === 'Programada' && (
                            <Badge bg="info" className="text-dark fw-bold px-2 py-1 text-uppercase">PROGRAMADA</Badge>
                          )}
                        </div>
                      </div>

                      <Card.Body className="d-flex flex-column p-3">
                        <h5 className="serif fw-bold text-light mb-1">{idx_tk.title}</h5>
                        <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                          {idx_tk.description}
                        </p>

                        {/* MÉTRICAS CLAVE */}
                        <div className="p-2.5 rounded mb-3 bg-dark border border-secondary mono" style={{ backgroundColor: '#09050a' }}>
                          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem' }}>
                            <span className="text-secondary">Precio Inicial / Base:</span>
                            <span className="text-light fw-bold">${(idx_tk.startingPrice || idx_tk.currentPrice).toLocaleString('es-AR')}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem' }}>
                            <span className="text-secondary">Precio Actual:</span>
                            <span className="text-warning fw-bold">${idx_tk.currentPrice.toLocaleString('es-AR')}</span>
                          </div>
                          <div className="d-flex justify-content-between" style={{ fontSize: '0.78rem' }}>
                            <span className="text-secondary">Ofertas Recibidas:</span>
                            <span className="text-success fw-bold">{bidsCount} oferta(s)</span>
                          </div>
                        </div>

                        {/* BOTÓN CANCELAR O ESTADO */}
                        <div className="mt-auto">
                          {canCancel ? (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={cargandoEliminarId === idx_tk.id}
                              onClick={() => handleDeleteAuction(idx_tk.id)}
                              className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                              style={{ borderColor: '#ef4444', color: '#ef4444' }}
                            >
                              {cargandoEliminarId === idx_tk.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <>
                                  <FaTrashCan /> 🗑️ Cancelar Subasta (0 Ofertas)
                                </>
                              )}
                            </Button>
                          ) : bidsCount > 0 ? (
                            <Alert variant="info" className="py-2 px-3 small mb-0 text-center fw-bold border-info text-info">
                              ✓ En curso con {bidsCount} oferta(s) registradas
                            </Alert>
                          ) : (
                            <Alert variant="secondary" className="py-2 px-3 small mb-0 text-center text-muted">
                              Subasta concluida
                            </Alert>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      )}

      {/* MODAL DE PUJA INTERACTIVO SI EL USUARIO DECIDE CONTRAOFERTAR */}
      {selectedAuction && (
        <BidModal
          show={showBidModal}
          onHide={() => {
            setShowBidModal(false);
            setSelectedAuction(null);
          }}
          auction={selectedAuction}
          activeUserId={userIdToMatch}
          wallet={wallet}
          onBidSuccess={() => {
            fetchData();
            if (onBidSuccess) onBidSuccess();
          }}
          pushNotif={pushNotif}
        />
      )}
    </div>
  );
}

