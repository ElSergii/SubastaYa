import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { FaGavel, FaXmark, FaPlus, FaImage, FaTag, FaDollarSign, FaClock } from 'react-icons/fa6';
import { createAuction } from '../services/api';

export default function CreateAuctionModal({ show, onHide, currentUser, onAuctionCreated, pushNotif }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('2');
  const [startingPrice, setStartingPrice] = useState('');
  const [minimumIncrement, setMinimumIncrement] = useState('');
  const [durationHours, setDurationHours] = useState('24');
  const [imageUrl, setImageUrl] = useState('');

  const [cargando, setCargando] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId('2');
    setStartingPrice('');
    setMinimumIncrement('');
    setDurationHours('24');
    setImageUrl('');
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validaciones de negocio antes de enviar
    if (!title.trim()) {
      setErrorMessage('El título de la subasta es obligatorio.');
      return;
    }

    const numStart = Number(startingPrice);
    if (isNaN(numStart) || numStart <= 0) {
      setErrorMessage('El precio base debe ser un valor numérico mayor a $0.');
      return;
    }

    const numInc = Number(minimumIncrement);
    if (isNaN(numInc) || numInc <= 0) {
      setErrorMessage('El incremento mínimo debe ser un valor numérico mayor a $0.');
      return;
    }

    const numDuration = Number(durationHours);
    if (isNaN(numDuration) || numDuration <= 0) {
      setErrorMessage('La duración de la subasta debe ser mayor a 0 horas.');
      return;
    }

    setCargando(true);

    const categoryNames = {
      '1': 'Tecnología',
      '2': 'Coleccionables',
      '3': 'Indumentaria',
      '4': 'Vehículos'
    };

    const sellerId = currentUser?.id || '40';
    const endDateIso = new Date(Date.now() + numDuration * 3600000).toISOString();

    const auctionPayload = {
      title: title.trim(),
      description: description.trim() || 'Subasta publicada en la plataforma SubastaYa.',
      categoryId,
      categoryName: categoryNames[categoryId] || 'Coleccionables',
      startingPrice: numStart,
      minimumIncrement: numInc,
      durationHours: numDuration,
      endDate: endDateIso,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80',
      sellerId,
      seller: sellerId
    };

    try {
      const newAuction = await createAuction(auctionPayload);
      if (pushNotif) {
        pushNotif('exito', 'Subasta Publicada', `¡La subasta "${newAuction.title}" ha sido publicada exitosamente!`);
      }
      if (onAuctionCreated) {
        onAuctionCreated(newAuction);
      }
      handleClose();
    } catch (err) {
      console.error('[CODE-ERROR] - Error al publicar subasta:', err);
      setErrorMessage(err.message || 'Error al procesar la publicación de la subasta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      className="create-auction-modal"
    >
      <Modal.Body className="p-4" style={{ backgroundColor: '#161217', color: '#f0e8dc', borderRadius: 16 }}>
        {/* Cabecera */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center border border-warning"
              style={{ width: 36, height: 36, backgroundColor: 'rgba(201,168,76,0.15)' }}
            >
              <FaGavel className="text-warning fs-5" />
            </div>
            <div>
              <h4 className="serif fw-bold text-light mb-0">Publicar Nueva Subasta</h4>
              <span className="text-secondary small">Completá los datos para activar tu subasta en tiempo real</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-link text-secondary p-0 fs-5 text-decoration-none"
          >
            <FaXmark />
          </button>
        </div>

        {errorMessage && (
          <Alert variant="danger" dismissible onClose={() => setErrorMessage('')} className="py-2 px-3 small mb-3">
            {errorMessage}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Título */}
          <Form.Group className="mb-3" controlId="auctionTitle">
            <Form.Label className="text-light fw-bold small">Título de la Subasta *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: MacBook Pro M3 Max 16 Pulgadas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-dark text-light border-secondary"
              style={{ backgroundColor: '#09050a' }}
            />
          </Form.Group>

          {/* Descripción */}
          <Form.Group className="mb-3" controlId="auctionDescription">
            <Form.Label className="text-light fw-bold small">Descripción del Artículo</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Detallá las especificaciones, estado físico y garantía del producto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-dark text-light border-secondary"
              style={{ backgroundColor: '#09050a' }}
            />
          </Form.Group>

          {/* Categoría y Duración */}
          <Row className="g-3 mb-3">
            <Col xs={12} md={6}>
              <Form.Group controlId="auctionCategory">
                <Form.Label className="text-light fw-bold small d-flex align-items-center gap-1">
                  <FaTag className="text-warning" /> Categoría *
                </Form.Label>
                <Form.Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="bg-dark text-light border-secondary"
                  style={{ backgroundColor: '#09050a' }}
                >
                  <option value="1">💻 Tecnología</option>
                  <option value="2">🏺 Coleccionables</option>
                  <option value="3">👕 Indumentaria</option>
                  <option value="4">🚗 Vehículos</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="auctionDuration">
                <Form.Label className="text-light fw-bold small d-flex align-items-center gap-1">
                  <FaClock className="text-warning" /> Duración de la Subasta *
                </Form.Label>
                <Form.Select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="bg-dark text-light border-secondary"
                  style={{ backgroundColor: '#09050a' }}
                >
                  <option value="1">1 Hora (Prueba rápida)</option>
                  <option value="2">2 Horas</option>
                  <option value="6">6 Horas</option>
                  <option value="12">12 Horas</option>
                  <option value="24">24 Horas (1 Día)</option>
                  <option value="48">48 Horas (2 Días)</option>
                  <option value="72">72 Horas (3 Días)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Precio Base e Incremento Mínimo */}
          <Row className="g-3 mb-3">
            <Col xs={12} md={6}>
              <Form.Group controlId="auctionStartingPrice">
                <Form.Label className="text-light fw-bold small d-flex align-items-center gap-1">
                  <FaDollarSign className="text-success" /> Precio Base ($ ARS) *
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ej: 50000"
                  min="1"
                  step="any"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  required
                  className="bg-dark text-warning fw-bold mono border-secondary"
                  style={{ backgroundColor: '#09050a' }}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="auctionMinimumIncrement">
                <Form.Label className="text-light fw-bold small d-flex align-items-center gap-1">
                  <FaDollarSign className="text-info" /> Incremento Mínimo ($ ARS) *
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ej: 2000"
                  min="1"
                  step="any"
                  value={minimumIncrement}
                  onChange={(e) => setMinimumIncrement(e.target.value)}
                  required
                  className="bg-dark text-info fw-bold mono border-secondary"
                  style={{ backgroundColor: '#09050a' }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* URL de Imagen */}
          <Form.Group className="mb-4" controlId="auctionImageUrl">
            <Form.Label className="text-light fw-bold small d-flex align-items-center gap-1">
              <FaImage className="text-secondary" /> URL de Imagen (Opcional)
            </Form.Label>
            <Form.Control
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="bg-dark text-light border-secondary"
              style={{ backgroundColor: '#09050a' }}
            />
            <Form.Text className="text-secondary" style={{ fontSize: '0.72rem' }}>
              Dejá en blanco para asignar una imagen por defecto de alta resolución.
            </Form.Text>
          </Form.Group>

          {/* Botones de Acción */}
          <div className="d-flex justify-content-end gap-2 pt-2 border-top border-secondary">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleClose}
              disabled={cargando}
              className="px-4 fw-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={cargando}
              className="btn-gold px-4 fw-bold d-flex align-items-center gap-2"
              style={{ backgroundColor: '#c9a84c', borderColor: '#c9a84c', color: '#09050a' }}
            >
              {cargando ? (
                <>
                  <Spinner animation="border" size="sm" />
                  Publicando...
                </>
              ) : (
                <>
                  <FaPlus /> Publicar Subasta
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

