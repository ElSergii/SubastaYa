import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { getAuditLogs } from '../services/api';

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
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon sx={{ color: '#38bdf8' }} /> Historial de Auditoría en Vivo
      </Typography>

      {loading ? (
        <Typography color="gray">Cargando eventos de auditoría...</Typography>
      ) : (
        <TableContainer component={Paper} className="glass-card" sx={{ backgroundColor: 'rgba(30, 41, 59, 0.8)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#0f172a' }}>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Fecha / Hora</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Acción</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Subasta</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Monto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ color: '#94a3b8', textAlign: 'center' }}>
                    No hay registros de auditoría aún.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(15, 23, 42, 0.3)' } }}>
                    <TableCell sx={{ color: '#f8fafc' }}>#{log.id}</TableCell>
                    <TableCell sx={{ color: '#cbd5e1' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell sx={{ color: '#f8fafc' }}>
                      <Chip 
                        label={log.action} 
                        size="small" 
                        sx={{ backgroundColor: '#2563eb', color: '#fff' }} 
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#38bdf8' }}>Subasta #{log.auctionId}</TableCell>
                    <TableCell sx={{ color: '#f8fafc' }}>Usuario #{log.userId}</TableCell>
                    <TableCell sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                      ${log.amount}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
