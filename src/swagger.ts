export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Plataforma de Venta de Entradas API',
    version: '1.0.0',
    description: 'API RESTful para la venta de entradas de eventos masivos con control de concurrencia (Optimistic Locking), transacciones ACID y background jobs de auto-liberacion.',
    contact: {
      name: 'Arquitecto de Software & Tech Lead',
      email: 'techlead@productora-eventos.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Servidor Local de Desarrollo'
    }
  ],
  paths: {
    '/events': {
      get: {
        summary: 'Listado paginado del catalogo de eventos',
        tags: ['Catálogo'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          '200': { description: 'Lista de eventos obtenida con exito' }
        }
      }
    },
    '/events/{eventId}/seats': {
      get: {
        summary: 'Estado actual de todas las butacas de un evento',
        tags: ['Asientos'],
        parameters: [
          { name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Estado de las butacas retornado exitosamente' }
        }
      }
    },
    '/events/{eventId}/seats/{seatId}/reserve': {
      post: {
        summary: 'Reserva temporal de una butaca (Lock 5 min) con Optimistic Locking',
        tags: ['Reservas & Concurrencia'],
        parameters: [
          { name: 'eventId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'seatId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string', example: 'USER_123' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Reserva creada exitosamente por 5 minutos' },
          '409': { description: 'Conflicto de concurrencia: El asiento ya no esta disponible' }
        }
      }
    },
    '/payments': {
      post: {
        summary: 'Simulacion de pasarela de pago transaccional (ACID)',
        tags: ['Pagos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reservationId'],
                properties: {
                  reservationId: { type: 'string', example: 'res-uuid...' },
                  userId: { type: 'string', example: 'USER_123' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Pago procesado exitosamente' },
          '400': { description: 'Error al procesar el pago o reserva expirada' }
        }
      }
    },
    '/audit-logs': {
      get: {
        summary: 'Consulta de registros inmutables de auditoria',
        tags: ['Auditoría'],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } }
        ],
        responses: {
          '200': { description: 'Registros de auditoria retornado exitosamente' }
        }
      }
    }
  }
};
