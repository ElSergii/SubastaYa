import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, Button, Chip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getAuditLogs } from '../services/api';

const COLORES_ACCION = {
  PUJA_RECIBIDA: { text: '#22c55e', bg: '#052e16', label: 'PUJA_RECIBIDA' },
  PUJA_RECHAZADA_INSUFICIENTE: { text: '#ef4444', bg: '#450a0a', label: 'MONTO_INSUFICIENTE' },
  CONCURRENCIA_409: { text: '#ef4444', bg: '#450a0a', label: '409_CONFLICTO_CONCURRENCIA' },
  CONCURRENCIA_CONFLICITO: { text: '#ef4444', bg: '#450a0a', label: '409_CONFLICTO_CONCURRENCIA' },
  PAGO_GARANTIZADO: { text: '#c9a84c', bg: '#1c1400', label: 'ESCROW_TRANSACCION' },
  ANTI_SNIPING: { text: '#f59e0b', bg: '#1c0d00', label: 'EXTENSION_ANTI_SNIPING' },
};

export default function AuditView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error al cargar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Muestreo suave cada 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <HistoryIcon sx={{ color: '#c9a84c', fontSize: 28 }} />
          <Typography className="serif" variant="h4" sx={{ fontWeight: 800, color: '#f0e8dc' }}>
            Registro de Auditoría en Vivo
          </Typography>
        </Box>

        <Button
          size="small"
          onClick={fetchLogs}
          startIcon={<RefreshIcon sx={{ color: '#c9a84c' }} />}
          sx={{ color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', textTransform: 'none' }}
        >
          Actualizar
        </Button>
      </Box>
      <Typography variant="body2" sx={{ color: '#7a6458', mb: 4 }}>
        Logs inmutables de transacciones ACID, validación de concurrencia optimista (RowVersion) y ofertas recibidas.
      </Typography>

      {loading ? (
        <Typography sx={{ color: '#7a6458' }}>Cargando eventos de auditoría...</Typography>
      ) : logs.length === 0 ? (
        <Card className="glass-card" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#7a6458' }}>
            Sin registros de auditoría aún. Realizá una puja para ver el registro en vivo.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[...logs].reverse().map((log) => {
            const styleInfo = COLORES_ACCION[log.action] || { text: '#c9a84c', bg: '#1c1400', label: log.action };
            return (
              <Card 
                key={log.id} 
                className="glass-card"
                sx={{ 
                  backgroundColor: styleInfo.bg, 
                  border: '1px solid rgba(201, 168, 76, 0.15)',
                  px: 2.5, 
                  py: 1.5 
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={styleInfo.label} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)', 
                        color: styleInfo.text, 
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        fontFamily: 'JetBrains Mono, monospace',
                        border: `1px solid ${styleInfo.text}`
                      }} 
                    />
                    <Typography variant="body2" sx={{ color: '#f0e8dc', fontWeight: 600 }}>
                      Subasta #{log.auctionId}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7a6458', fontFamily: 'JetBrains Mono' }}>
                      Usuario #{log.userId}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography className="serif" variant="body1" sx={{ color: '#c9a84c', fontWeight: 800 }}>
                      ${log.amount?.toLocaleString('es-AR')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7a6458', fontFamily: 'JetBrains Mono', fontSize: '0.7rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
