import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Table } from 'react-bootstrap';
import { FaClockRotateLeft, FaArrowRotateRight, FaShieldHalved, FaFingerprint, FaHashtag } from 'react-icons/fa6';
import { getAuditLogs } from '../services/api';
import { calculateAuditIntegrity } from '../utils/auctionEngine';

const COLORES_ACCION = {
  PUJA_RECIBIDA: { variant: 'success', textClass: 'text-success', label: 'PUJA_RECIBIDA' },
  PUJA_RECHAZADA_INSUFFICIENTE: { variant: 'danger', textClass: 'text-danger', label: 'MONTO_INSUFICIENTE' },
  CONCURRENCIA_409: { variant: 'danger', textClass: 'text-danger', label: '409_CONFLICTO_CONCURRENCIA' },
  CONCURRENCIA_CONFLICITO: { variant: 'danger', textClass: 'text-danger', label: '409_CONFLICTO_CONCURRENCIA' },
  PAGO_GARANTIZADO: { variant: 'warning', textClass: 'text-warning', label: 'ESCROW_TRANSACCION' },
  ANTI_SNIPING: { variant: 'info', textClass: 'text-info', label: 'EXTENSION_ANTI_SNIPING' },
};

export default function AuditView({ currentUser, activeUserId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === 'Admin';
  const effectiveUserId = activeUserId || currentUser?.id;

  const fetchLogs = async () => {
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch {
      // Silenciar logs de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  // FILTRADO PRIVADO DE AUDITORÍA: EL ADMIN VE TODO, LOS USUARIOS SOLO SUS REGISTROS
  const filteredLogs = logs.filter((log) => {
    if (isAdmin) return true;
    return String(log.userId) === String(effectiveUserId);
  });

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="serif fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <FaClockRotateLeft className="text-warning" /> 
            {isAdmin ? 'Auditoría Global de Transacciones (Admin)' : 'Tu Auditoría Privada de Transacciones'}
          </h3>
          <p className="text-secondary small mb-0">
            {isAdmin 
              ? 'Supervisión completa del sistema y registros de todos los usuarios.'
              : 'Historial privado e inmutable de tus ofertas y movimientos con garantía de integridad.'}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {isAdmin ? (
            <Badge bg="danger" className="px-3 py-2 fw-bold">
              👑 Vista de Administrador
            </Badge>
          ) : (
            <Badge bg="secondary" className="px-3 py-2 fw-bold">
              🔒 Registro Privado Personal
            </Badge>
          )}

          <Button
            size="sm"
            variant="outline-gold"
            onClick={fetchLogs}
            className="d-flex align-items-center gap-2 fw-bold"
          >
            <FaArrowRotateRight /> Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-secondary py-4">Cargando eventos de auditoría...</p>
      ) : filteredLogs.length === 0 ? (
        <Card className="glass-card p-4 text-center">
          <p className="text-secondary mb-0">
            {isAdmin 
              ? 'Sin registros de auditoría registrados en el sistema.' 
              : 'No tenés registros de auditoría personales aún. Realizá una puja o depósito para ver tu historial en vivo.'}
          </p>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table className="table-dark-custom align-middle small mono">
            <thead>
              <tr className="border-bottom border-secondary text-secondary">
                <th>Comprobante Digital</th>
                <th>Evento</th>
                <th>Subasta ID</th>
                <th>Usuario ID</th>
                <th>Monto ($)</th>
                <th>Marca de Tiempo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredLogs].reverse().map((log) => {
                const styleInfo = COLORES_ACCION[log.action] || { variant: 'warning', textClass: 'text-warning', label: log.action };
                const integrity = calculateAuditIntegrity(log);

                return (
                  <tr key={log.id} className="border-bottom border-secondary">
                    <td>
                      <span className="text-warning fw-bold d-flex align-items-center gap-1">
                        <FaFingerprint /> {integrity.hash}
                      </span>
                    </td>
                    <td>
                      <Badge bg={styleInfo.variant} className="text-dark fw-bold">
                        {styleInfo.label}
                      </Badge>
                    </td>
                    <td className="text-light">
                      <FaHashtag className="text-secondary" /> {log.auctionId?.substring(0, 8)}...
                    </td>
                    <td className="text-secondary">
                      Usuario #{log.userId?.substring(0, 8)}
                    </td>
                    <td>
                      <span className={`fw-bold ${integrity.deltaClass}`}>
                        {integrity.deltaText}
                      </span>
                    </td>
                    <td className="text-secondary">
                      {new Date(log.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                    </td>
                    <td>
                      <Badge bg="dark" className="border border-success text-success fw-bold d-inline-flex align-items-center gap-1">
                        <FaShieldHalved /> OK
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
