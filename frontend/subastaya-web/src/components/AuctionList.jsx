import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import { FaGavel, FaLaptop, FaIcons, FaShirt, FaCar, FaCircle, FaSquare, FaCalculator } from 'react-icons/fa6';
import AuctionCard from './AuctionCard';
import { getAuctions, LOCAL_AUCTIONS_STORE } from '../services/api';

export default function AuctionList({ activeUserId, wallet, onBidSuccess, pushNotif }) {
  const [auctions, setAuctions] = useState(LOCAL_AUCTIONS_STORE);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todas');

  const fetchAuctionsList = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await getAuctions();
      if (Array.isArray(data) && data.length > 0) {
        setAuctions([...data]);
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionsList(true);
    const interval = setInterval(() => fetchAuctionsList(false), 2000);
    return () => clearInterval(interval);
  }, []);

  // FILTRADO DINÁMICO DE SUBASTAS (100% FUNCIONAL Y EXACTO)
  const filteredAuctions = auctions.filter((auc) => {
    const categoryMatch = selectedCategory === 'Todas' || auc.categoryName === selectedCategory;
    const statusMatch = selectedStatus === 'Todas' || 
      (selectedStatus === 'Activas' && auc.status === 'Activa') ||
      (selectedStatus === 'Finalizadas' && auc.status === 'Finalizada') ||
      (selectedStatus === 'Desiertas' && auc.status === 'Desierta');
    return categoryMatch && statusMatch;
  });

  return (
    <div className="py-4">
      {/* CABECERA TITULO */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="serif fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <FaGavel className="text-warning" /> Catálogo de Subastas
          </h2>
          <p className="text-secondary small mb-0">
            Participá en tiempo real en subastas activas de alta gama con garantía de protección y transparencia.
          </p>
        </div>
        {loading && <Spinner animation="border" size="sm" variant="warning" />}
      </div>

      {/* BARRA DE FILTROS (COMO EN LA CAPTURA DE PANTALLA) */}
      <Card className="glass-card p-3 mb-4 border border-secondary" style={{ backgroundColor: '#130b10', borderRadius: 12 }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* GRUPO 1: CATEGORÍA */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="text-secondary small fw-bold me-1" style={{ fontSize: '0.75rem' }}>CATEGORÍA:</span>
            
            <Button
              size="sm"
              onClick={() => setSelectedCategory('Todas')}
              className={`rounded-pill px-3 py-1 fw-bold ${selectedCategory === 'Todas' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              Todas
            </Button>

            <Button
              size="sm"
              onClick={() => setSelectedCategory('Tecnología')}
              className={`rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${selectedCategory === 'Tecnología' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              <FaLaptop /> Tecnología
            </Button>

            <Button
              size="sm"
              onClick={() => setSelectedCategory('Coleccionables')}
              className={`rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${selectedCategory === 'Coleccionables' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              <FaIcons /> Coleccionables
            </Button>

            <Button
              size="sm"
              onClick={() => setSelectedCategory('Indumentaria')}
              className={`rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${selectedCategory === 'Indumentaria' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              <FaShirt /> Indumentaria
            </Button>

            <Button
              size="sm"
              onClick={() => setSelectedCategory('Vehículos')}
              className={`rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${selectedCategory === 'Vehículos' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              <FaCar /> Vehículos
            </Button>
          </div>

          {/* GRUPO 2: ESTADO */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="text-secondary small fw-bold me-1" style={{ fontSize: '0.75rem' }}>ESTADO:</span>
            
            <Button
              size="sm"
              onClick={() => setSelectedStatus('Todas')}
              className={`rounded-pill px-3 py-1 fw-bold ${selectedStatus === 'Todas' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              Todas
            </Button>

            <Button
              size="sm"
              onClick={() => setSelectedStatus('Activas')}
              className={`rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${selectedStatus === 'Activas' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              <FaCircle className="text-success" style={{ fontSize: 8 }} /> Activas
            </Button>

            <Button
              size="sm"
              onClick={() => setSelectedStatus('Finalizadas')}
              className={`rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${selectedStatus === 'Finalizadas' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              <FaSquare style={{ color: '#a855f7', fontSize: 8 }} /> Finalizadas
            </Button>

            <Button
              size="sm"
              onClick={() => setSelectedStatus('Desiertas')}
              className={`rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${selectedStatus === 'Desiertas' ? 'btn-success text-dark' : 'btn-dark text-secondary border-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              <FaCircle className="text-secondary" style={{ fontSize: 8 }} /> Desiertas
            </Button>
          </div>
        </div>
      </Card>

      {/* GRILLA DE TARJETAS CON EL FORMATO EXACTO */}
      {filteredAuctions.length === 0 ? (
        <Card className="glass-card p-4 text-center">
          <p className="text-secondary mb-0">No se encontraron subastas con los filtros seleccionados.</p>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredAuctions.map((auc) => (
            <Col xs={12} md={6} lg={4} key={auc.id}>
              <AuctionCard 
                auction={auc} 
                activeUserId={activeUserId} 
                wallet={wallet}
                pushNotif={pushNotif}
                onBidSuccess={(updatedAuction) => {
                  if (updatedAuction && updatedAuction.id) {
                    setAuctions((prev) => 
                      prev.map((item) => 
                        item.id === updatedAuction.id 
                          ? { ...item, ...updatedAuction, bidCount: (item.bidCount || 0) + 1 } 
                          : item
                      )
                    );
                  } else {
                    fetchAuctionsList();
                  }
                  if (onBidSuccess) onBidSuccess();
                }}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
