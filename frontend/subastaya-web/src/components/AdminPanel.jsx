import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaUserGear, FaCirclePlus, FaCalculator, FaShieldHalved, FaClock, FaTags } from 'react-icons/fa6';
import { createAuction } from '../services/api';
import { calculateAdminValuation } from '../utils/auctionEngine';

const CATEGORIES = [
  { id: 'c1111111-1111-1111-1111-111111111111', name: 'Tecnología' },
  { id: 'c2222222-2222-2222-2222-222222222222', name: 'Coleccionables' },
  { id: 'c3333333-3333-3333-3333-333333333333', name: 'Indumentaria' },
  { id: 'c4444444-4444-4444-4444-444444444444', name: 'Vehículos' },
];

export default function AdminPanel({ onAuctionCreated, pushNotif }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    categoryId: CATEGORIES[0].id,
    startingPrice: 15000,
    minimumIncrement: 1000,
    durationMinutes: 60
  });

  const [cargando, setCargando] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Asistente algorítmico de valuación en tiempo real
  const valuationAssistant = calculateAdminValuation(formData.startingPrice, formData.categoryId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'startingPrice') {
        const val = calculateAdminValuation(value, updated.categoryId);
        updated.minimumIncrement = val.recommendedIncrement;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setCargando(true);

    try {
      const now = new Date();
      const end = new Date(now.getTime() + Number(formData.durationMinutes) * 60000);

      const dto = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        categoryId: formData.categoryId,
        startingPrice: Number(formData.startingPrice),
        minimumIncrement: Number(formData.minimumIncrement),
        sellerId: '11111111-1111-1111-1111-111111111111',
        startDate: now.toISOString(),
        endDate: end.toISOString()
      };

      await createAuction(dto);
      const msg = `¡Subasta "${formData.title}" creada e iniciada correctamente!`;
      setSuccessMsg(msg);
      if (pushNotif) pushNotif('exito', 'Subasta Creada', msg);

      // Limpiar formulario
      setFormData({
        title: '',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        categoryId: CATEGORIES[0].id,
        startingPrice: 15000,
        minimumIncrement: 1000,
        durationMinutes: 60
      });

      if (onAuctionCreated) onAuctionCreated();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear la subasta.';
      setErrorMsg(msg);
      if (pushNotif) pushNotif('error', 'Error de Publicación', msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="py-4">
      <div className="mb-4">
        <h3 className="serif fw-bold text-light mb-1 d-flex align-items-center gap-2">
          <FaUserGear className="text-warning" /> Panel de Administración & Publicación Inteligente
        </h3>
        <p className="text-secondary small">
          Gestión y publicación de artículos con sugerencia automática de precios y márgenes de mercado.
        </p>
      </div>

      <Row className="g-4">
        {/* FORMULARIO DE PUBLICACIÓN */}
        <Col xs={12} lg={7}>
          <Card className="glass-card p-3">
            <Card.Body>
              <h5 className="serif fw-bold text-light mb-3">Crear y Publicar Nueva Subasta</h5>

              {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg('')} className="py-2 small mb-3">{successMsg}</Alert>}
              {errorMsg && <Alert variant="danger" dismissible onClose={() => setErrorMsg('')} className="py-2 small mb-3">{errorMsg}</Alert>}

              <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <Form.Group controlId="adminTitleInput">
                  <Form.Label>Título del Artículo</Form.Label>
                  <Form.Control
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ej. Cámara Vintage Leica M3 1954"
                    aria-label="Título del Artículo"
                  />
                </Form.Group>

                <Form.Group controlId="adminDescriptionInput">
                  <Form.Label>Descripción Detallada</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detalles sobre el estado del producto y certificados de autenticidad..."
                    aria-label="Descripción Detallada"
                  />
                </Form.Group>

                <Row className="g-2">
                  <Col xs={12} sm={6}>
                    <Form.Group controlId="adminCategorySelect">
                      <Form.Label>Categoría</Form.Label>
                      <Form.Select 
                        name="categoryId" 
                        value={formData.categoryId} 
                        onChange={handleChange}
                        aria-label="Categoría"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6}>
                    <Form.Group controlId="adminDurationInput">
                      <Form.Label>Duración (Minutos)</Form.Label>
                      <Form.Control
                        type="number"
                        name="durationMinutes"
                        required
                        value={formData.durationMinutes}
                        onChange={handleChange}
                        aria-label="Duración (Minutos)"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-2">
                  <Col xs={12} sm={6}>
                    <Form.Group controlId="adminStartingPriceInput">
                      <Form.Label>Precio Base ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="startingPrice"
                        required
                        value={formData.startingPrice}
                        onChange={handleChange}
                        className="text-success fw-bold"
                        aria-label="Precio Base ($)"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6}>
                    <Form.Group controlId="adminMinIncrementInput">
                      <Form.Label>Incremento Mínimo ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="minimumIncrement"
                        required
                        value={formData.minimumIncrement}
                        onChange={handleChange}
                        className="text-warning fw-bold"
                        aria-label="Incremento Mínimo ($)"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="adminImageUrlInput">
                  <Form.Label>URL Imagen de Producto</Form.Label>
                  <Form.Control
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    aria-label="URL Imagen de Producto"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  disabled={cargando}
                  className="btn-gold py-2 mt-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                  {cargando ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <FaCirclePlus /> Publicar Subasta en Vivo
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* ASISTENTE Y SUGERENCIA DE PRECIOS */}
        <Col xs={12} lg={5}>
          <Card className="glass-card p-3 mb-3 border border-secondary">
            <Card.Body>
              <h5 className="serif fw-bold text-warning mb-3 d-flex align-items-center gap-2">
                <FaCalculator /> Asistente de Precio de Mercado
              </h5>
              <p className="text-secondary small mb-3">
                Sugerencia de valores de mercado para maximizar la visibilidad y participación:
              </p>

              <div className="d-flex flex-column gap-2 mb-3">
                <div className="p-2 rounded bg-dark border border-secondary d-flex justify-content-between align-items-center">
                  <span className="text-secondary small">Valor Retail Estimado:</span>
                  <span className="mono text-info fw-bold">${valuationAssistant.recommendedRetail.toLocaleString('es-AR')}</span>
                </div>

                <div className="p-2 rounded bg-dark border border-secondary d-flex justify-content-between align-items-center">
                  <span className="text-secondary small">Incremento Dinámico Sugerido:</span>
                  <span className="mono text-warning fw-bold">+${valuationAssistant.recommendedIncrement.toLocaleString('es-AR')}</span>
                </div>

                <div className="p-2 rounded bg-dark border border-secondary d-flex justify-content-between align-items-center">
                  <span className="text-secondary small">Precio Reserva Sugerido:</span>
                  <span className="mono text-success fw-bold">${valuationAssistant.suggestedReservePrice.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <small className="text-muted mono d-block" style={{ fontSize: '0.72rem' }}>
                <FaShieldHalved className="text-warning me-1" /> Tramo asignado: {valuationAssistant.tierLabel}
              </small>
            </Card.Body>
          </Card>

          <Card className="glass-card p-3 border border-secondary">
            <Card.Body>
              <h6 className="serif fw-bold text-light mb-2">Parámetros del Sistema</h6>
              <div className="d-flex flex-column gap-2 small text-secondary">
                <div className="d-flex align-items-center justify-content-between border-bottom border-secondary pb-1">
                  <span>Worker Background Status:</span>
                  <Badge bg="success" className="text-dark">Activo (10s)</Badge>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span>Anti-Sniping Rule:</span>
                  <span className="mono text-warning">+60s dynamic extension</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
