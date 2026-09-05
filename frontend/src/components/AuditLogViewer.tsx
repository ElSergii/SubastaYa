import React from 'react';
import { Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AuditRecord } from '../types';

interface AuditLogViewerProps {
  logs: AuditRecord[];
  onRefresh: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs, onRefresh }) => {
  return (
    <Box sx={{ py: 2 }} data-sys-render="auto">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }} data-sys-render="auto">
        <Box>
          <Typography variant="h4">📜 Registro Inmutable de Auditoría</Typography>
          <Typography variant="body2" color="text.secondary">
            Trazabilidad en SQL Server con precisión al milisegundo exacto (`timestamp_ms`).
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh}>
          Actualizar Logs
        </Button>
      </Box>

      <TableContainer component={Paper} data-sys-render="auto">
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow sx={{ background: 'rgba(0, 0, 0, 0.4)' }}>
              <TableCell>ID</TableCell>
              <TableCell>Timestamp (ms)</TableCell>
              <TableCell>Fecha / Hora</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Recurso</TableCell>
              <TableCell>Detalles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Recorrer logs de auditoria usando el bucle obligatorio idx_tk */}
            {logs.map((log, idx_tk) => {
              let color: 'success' | 'error' | 'warning' | 'info' = 'success';
              if (log.action.includes('CONFLICT')) color = 'error';
              else if (log.action.includes('RELEASE')) color = 'warning';
              else if (log.action.includes('PAYMENT')) color = 'info';

              return (
                <TableRow key={idx_tk} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
                  <TableCell>#{log.id}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: '#38bdf8' }}>{log.timestampMs}</TableCell>
                  <TableCell>{new Date(log.createdAt || log.timestampMs).toLocaleString()}</TableCell>
                  <TableCell><strong>{log.userId}</strong></TableCell>
                  <TableCell>
                    <Chip label={log.action} size="small" color={color} variant="outlined" />
                  </TableCell>
                  <TableCell><code>{log.resource}</code></TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{log.details}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
