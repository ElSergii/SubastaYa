import React, { useState } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { FaGavel, FaLock, FaUserShield, FaUserCheck } from 'react-icons/fa6';

export const DEMO_ACCOUNTS = [
  { 
    id: '22222222-2222-2222-2222-222222222222', 
    name: 'Ana García (Comprador 1)', 
    email: 'comprador1@test.com', 
    role: 'Comprador', 
    avatar: 'A' 
  },
  { 
    id: '33333333-3333-3333-3333-333333333333', 
    name: 'María López (Comprador 2)', 
    email: 'comprador2@test.com', 
    role: 'Comprador', 
    avatar: 'M' 
  },
  { 
    id: '44444444-4444-4444-4444-444444444444', 
    name: 'Carlos Sin Fondos', 
    email: 'sinfondos@test.com', 
    role: 'Comprador', 
    avatar: 'C' 
  },
  { 
    id: '11111111-1111-1111-1111-111111111111', 
    name: 'Admin SubastaYa (Vendedor)', 
    email: 'vendedor@test.com', 
    role: 'Admin', 
    avatar: '⚙️' 
  }
];

export default function LoginModal({ open, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('demo');

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!email) return;

    if (email.includes('admin') || email.includes('vendedor')) {
      const user = DEMO_ACCOUNTS.find(a => a.role === 'Admin');
      onLoginSuccess(user);
    } else {
      const user = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase()) || DEMO_ACCOUNTS[0];
      onLoginSuccess(user);
    }
  };

  return (
    <Modal show={open} onHide={onClose} centered size="md" className="login-modal-bootstrap">
      <Modal.Body className="p-4">
        {/* CABECERA CON ISOTIPO */}
        <div className="text-center mb-4">
          <div 
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
            style={{ width: 54, height: 54, backgroundColor: 'rgba(201, 168, 76, 0.12)', border: '1px solid #c9a84c' }}
          >
            <FaGavel style={{ color: '#c9a84c', fontSize: 24 }} />
          </div>
          <h4 className="serif fw-bold text-light mb-1">Acceso a SubastaYa</h4>
          <p className="text-secondary small mb-0">Seleccioná tu cuenta o ingresá credenciales</p>
        </div>

        {/* SELECTOR DE MODO DE INGRESO */}
        <div className="d-flex border-bottom border-secondary mb-4">
          <button
            type="button"
            className={`btn flex-fill py-2 rounded-0 fw-bold border-0 ${activeTab === 'demo' ? 'text-warning border-bottom border-warning border-2' : 'text-secondary'}`}
            onClick={() => setActiveTab('demo')}
          >
            Cuentas Rápidas (Demo)
          </button>
          <button
            type="button"
            className={`btn flex-fill py-2 rounded-0 fw-bold border-0 ${activeTab === 'form' ? 'text-warning border-bottom border-warning border-2' : 'text-secondary'}`}
            onClick={() => setActiveTab('form')}
          >
            Ingreso con Email
          </button>
        </div>

        {activeTab === 'demo' ? (
          <div className="d-flex flex-column gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.id}
                onClick={() => onLoginSuccess(acc)}
                className="d-flex align-items-center justify-content-between p-3 rounded glass-card border border-secondary"
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ 
                      width: 38, 
                      height: 38, 
                      backgroundColor: acc.role === 'Admin' ? 'rgba(155, 35, 53, 0.4)' : 'rgba(201, 168, 76, 0.15)',
                      color: acc.role === 'Admin' ? '#fca5a5' : '#c9a84c',
                      border: `1px solid ${acc.role === 'Admin' ? '#9b2335' : '#c9a84c'}`
                    }}
                  >
                    {acc.avatar}
                  </div>
                  <div>
                    <h6 className="mb-0 text-light fw-bold">{acc.name}</h6>
                    <small className="text-secondary mono" style={{ fontSize: '0.75rem' }}>{acc.email}</small>
                  </div>
                </div>

                <Badge 
                  bg={acc.role === 'Admin' ? 'danger' : 'warning'} 
                  className="text-dark fw-bold px-2 py-1"
                >
                  {acc.role === 'Admin' ? <FaUserShield className="me-1" /> : <FaUserCheck className="me-1" />}
                  {acc.role}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <Form onSubmit={handleCustomLogin} className="d-flex flex-column gap-3">
            <Form.Group controlId="loginEmailInput">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="comprador1@test.com"
                autoComplete="email"
                aria-label="Correo Electrónico"
              />
            </Form.Group>

            <Form.Group controlId="loginPasswordInput">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-label="Contraseña"
              />
            </Form.Group>

            <Button
              type="submit"
              className="btn-gold py-2 mt-2 w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
            >
              <FaLock /> Iniciar Sesión
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}
