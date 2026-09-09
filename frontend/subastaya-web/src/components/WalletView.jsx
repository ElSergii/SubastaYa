import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, Alert, ProgressBar, Badge, Spinner } from 'react-bootstrap';
import { FaWallet, FaLock, FaCircleCheck, FaCirclePlus, FaCalculator, FaShieldHalved } from 'react-icons/fa6';
import { depositWallet } from '../services/api';
import { calculateWalletAnalytics } from '../utils/auctionEngine';

export default function WalletView({ wallet, activeUserId, currentUser, onWalletUpdated, pushNotif }) {
  const [depositAmount, setDepositAmount] = useState(5000);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const isSeller = currentUser?.role === 'Admin';
  const analytics = calculateWalletAnalytics(wallet);
  const isDepositDisabled = cargando || Number(depositAmount) <= 0;

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (isDepositDisabled) return;

    setSuccessMsg('');
    setErrorMsg('');
    setCargando(true);

    try {
      await depositWallet(activeUserId, Number(depositAmount));
      const msg = isSeller 
        ? `¡Se acreditaron $${Number(depositAmount).toLocaleString('es-AR')} a tu capital de Vendedor!`
        : `¡Se depositaron $${Number(depositAmount).toLocaleString('es-AR')} exitosamente!`;
      setSuccessMsg(msg);
      if (pushNotif) pushNotif('exito', isSeller ? 'Capital Acreditado' : 'Fondos Recargados', msg);
      if (onWalletUpdated) onWalletUpdated();
    } catch {
      const msg = 'Error al acreditar saldo a la billetera.';
      setErrorMsg(msg);
      if (pushNotif) pushNotif('error', 'Error de Depósito', msg);
    } finally {
      setCargando(false);
    }
  };

  if (!wallet) {
    return <p className="text-secondary py-4">Cargando datos de billetera digital...</p>;
  }

  return (
    <div className="py-4">
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h3 className="serif fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <FaWallet className="text-warning" /> 
            {isSeller ? 'Billetera del Vendedor & Cobros por Ventas' : 'Mi Billetera Digital & Garantía Escrow'}
          </h3>
          <p className="text-secondary small mb-0">
            {isSeller 
              ? 'Administrá tus ingresos recaudados por subastas liquidadas y tu capital operativo.' 
              : 'Administrá tu saldo disponible y tus garantías de oferta en tiempo real de forma transparente.'}
          </p>
        </div>

        {isSeller && (
          <Badge bg="warning" className="text-dark fw-bold px-3 py-2">
            🏷️ Perfil Vendedor Oficial
          </Badge>
        )}
      </div>

      {/* TARJETAS DE SALDOS PRINCIPALES */}
      <Row className="g-4 mb-4">
        {/* SALDO DISPONIBLE */}
        <Col xs={12} md={4}>
          <Card className="glass-card p-2 border border-success h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small text-uppercase fw-bold d-flex align-items-center gap-1">
                  <FaCircleCheck className="text-success" /> 
                  {isSeller ? 'Recaudación por Ventas' : 'Saldo Líquido Disponible'}
                </span>
                <Badge bg="success" className="text-dark">{isSeller ? 'Acreditado' : 'Líquido'}</Badge>
              </div>
              <h2 className="serif text-success fw-bold mb-1">
                ${wallet.availableBalance.toLocaleString('es-AR')}
              </h2>
              <small className="text-muted mono" style={{ fontSize: '0.75rem' }}>
                {isSeller ? 'Fondos netos cobrados por subastas' : 'Listo para realizar ofertas'}
              </small>
            </Card.Body>
          </Card>
        </Col>

        {/* SALDO RETENIDO / ESCROW */}
        <Col xs={12} md={4}>
          <Card className="glass-card p-2 border border-warning h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small text-uppercase fw-bold d-flex align-items-center gap-1">
                  <FaLock className="text-warning" /> 
                  {isSeller ? 'Comisiones & Escrow Retenido' : 'Garantía Retenida (Escrow)'}
                </span>
                <Badge bg="warning" className="text-dark">{isSeller ? 'En Transición' : 'En Riesgo'}</Badge>
              </div>
              <h2 className="serif text-warning fw-bold mb-1">
                ${wallet.heldBalance.toLocaleString('es-AR')}
              </h2>
              <small className="text-muted mono" style={{ fontSize: '0.75rem' }}>
                {isSeller ? 'Cobros en proceso de liquidación' : 'Reserva activa en subastas'}
              </small>
            </Card.Body>
          </Card>
        </Col>

        {/* SALDO TOTAL */}
        <Col xs={12} md={4}>
          <Card className="glass-card p-2 border border-secondary h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small text-uppercase fw-bold d-flex align-items-center gap-1">
                  <FaWallet className="text-warning" /> Balance Total Cuenta
                </span>
                <Badge bg="dark" className="border border-warning text-warning">Total</Badge>
              </div>
              <h2 className="serif text-light fw-bold mb-1">
                ${wallet.balance.toLocaleString('es-AR')}
              </h2>
              <small className="text-muted mono" style={{ fontSize: '0.75rem' }}>
                {isSeller ? 'Recaudación + Saldo Operativo' : 'Saldo Disponible + Retenido'}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* PANEL DE ANÁLISIS ALGORTÍMICO Y RECARGA DE FONDOS */}
      <Row className="g-4">
        {/* RECARGA DE SALDO / CAPITAL */}
        <Col xs={12} lg={6}>
          <Card className="glass-card p-3 h-100">
            <Card.Body>
              <h5 className="serif fw-bold text-light mb-2">
                {isSeller ? 'Cargar Capital de Vendedor / Depósito' : 'Acreditar Saldo Simulado'}
              </h5>
              <p className="text-secondary small mb-3">
                {isSeller 
                  ? 'Acredita capital para publicar subastas destacadas o patrocinar publicaciones.' 
                  : 'Acreditación inmediata para disponer de liquidez suficiente en subastas de alta gama.'}
              </p>

              {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg('')} className="py-2 small mb-3">{successMsg}</Alert>}
              {errorMsg && <Alert variant="danger" dismissible onClose={() => setErrorMsg('')} className="py-2 small mb-3">{errorMsg}</Alert>}

              <Form onSubmit={handleDeposit} className="d-flex gap-2 align-items-end">
                <Form.Group controlId="depositAmountInput" className="flex-fill">
                  <Form.Label className="small text-secondary">Monto a Depositar ($)</Form.Label>
                  <Form.Control
                    name="depositAmount"
                    type="number"
                    size="sm"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min={500}
                    step={500}
                    className="mono text-warning fw-bold bg-dark border-secondary"
                    aria-label="Monto a Depositar ($)"
                  />
                </Form.Group>
                <Button
                  type="submit"
                  disabled={isDepositDisabled}
                  className="btn-gold btn-sm px-3 fw-bold d-flex align-items-center gap-2"
                  style={{ height: 38 }}
                >
                  {cargando ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FaCirclePlus /> Depositar
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* ANALÍTICA FINANCIERA DEL MOTOR MATEMÁTICO */}
        {analytics && (
          <Col xs={12} lg={6}>
            <Card className="glass-card p-3 h-100 border border-secondary">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="serif fw-bold text-warning mb-0 d-flex align-items-center gap-2">
                    <FaCalculator /> Resumen de Salud Financiera
                  </h5>
                  <Badge bg={analytics.healthStatus.variant} className="text-dark fw-bold">
                    {analytics.healthStatus.text}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-secondary">Ratio de Liquidez Libre:</span>
                    <span className="mono text-success fw-bold">{analytics.liquidityRatio}%</span>
                  </div>
                  <ProgressBar variant="success" now={analytics.liquidityRatio} style={{ height: 8 }} />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-secondary">Ratio de Exposición Escrow:</span>
                    <span className="mono text-warning fw-bold">{analytics.exposureRatio}%</span>
                  </div>
                  <ProgressBar variant="warning" now={analytics.exposureRatio} style={{ height: 8 }} />
                </div>

                <div className="p-2 rounded bg-dark border border-secondary mono small">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-secondary">{isSeller ? 'Capacidad Neta de Inversión:' : 'Poder Máximo de Oferta Neta:'}</span>
                    <span className="text-warning fw-bold fs-6">${analytics.maxBidPower.toLocaleString('es-AR')}</span>
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>
                    <FaShieldHalved className="me-1 text-info" /> 
                    {isSeller 
                      ? 'Fondos garantizados por el sistema Escrow de SubastaYa para liquidación inmediata.' 
                      : 'Protección Escrow: Tus fondos retenidos como garantía se liberan automáticamente al ser sobrepujado.'}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* INFORMACIÓN DE COBRO Y ACREDITACIÓN BANCARIA PARA EL VENDEDOR */}
      {isSeller && (
        <Card className="glass-card p-3 mt-4 border border-warning">
          <Card.Body>
            <h5 className="serif fw-bold text-warning mb-2 d-flex align-items-center gap-2">
              🏦 Cuenta Bancaria & Alias de Acreditación de Ventas
            </h5>
            <p className="text-secondary small mb-3">
              Los fondos acumulados por tus subastas finalizadas se acreditan automáticamente a tu cuenta vinculada de Vendedor.
            </p>

            <Row className="g-3 small mono">
              <Col xs={12} md={4}>
                <div className="p-3 rounded bg-dark border border-secondary">
                  <span className="text-secondary d-block mb-1">ALIAS REGISTRADO:</span>
                  <span className="text-success fw-bold fs-6">subastaya.vendedor.mp</span>
                </div>
              </Col>

              <Col xs={12} md={4}>
                <div className="p-3 rounded bg-dark border border-secondary">
                  <span className="text-secondary d-block mb-1">CBU / CVU:</span>
                  <span className="text-warning fw-bold fs-6">0000003100094827104928</span>
                </div>
              </Col>

              <Col xs={12} md={4}>
                <div className="p-3 rounded bg-dark border border-secondary">
                  <span className="text-secondary d-block mb-1">FRECUENCIA DE LIQUIDACIÓN:</span>
                  <span className="text-info fw-bold fs-6">Inmediata (24/7 Real-Time)</span>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
