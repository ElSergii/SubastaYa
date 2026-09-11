# SubastaYa - Plataforma de Subastas en Tiempo Real

Plataforma web de subastas en vivo con sistema de garantías Escrow y actualización en tiempo real. La arquitectura está dividida en un frontend cliente (React + Vite + Bootstrap) y microservicios backend (.NET 9 + SQL Server).

---

## Características

- **Pujas en tiempo real**: Actualización automática de ofertas con reglas dinámicas de incremento mínimo según la cotización del producto.
- **Sistema Escrow**: Retención automática de saldo en billetera como garantía al momento de realizar una oferta. Si un postor es superado, los fondos se liberan automáticamente.
- **Validación de liderazgo**: Prevención de autopujas consecutivas por parte del comprador que lidera la subasta.
- **Gestión de Billeteras**:
  - *Compradores*: Consulta de saldo líquido disponible, reservas activas en subastas y acreditación de saldo de prueba.
  - *Vendedores*: Panel de recaudación, comisiones retenidas, alias de cobro y carga de capital.
- **Auditoría inmutable**: Registro de eventos y transacciones con visibilidad privada para usuarios y supervisión global para administradores.
- **Extensión anti-sniping**: Adición automática de tiempo ante ofertas registradas en los momentos finales del cierre.

---

## Estructura del Repositorio

```text
SubastaYa/
├── frontend/
│   └── subastaya-web/      # SPA desarrollada con React 19, Vite y Bootstrap 5
├── backend/
│   ├── ApiGateway/         # Punto de entrada y enrutamiento (.NET 9 API Gateway)
│   ├── AuctionService/     # Microservicio de gestión de subastas y pujas
│   ├── WalletService/      # Microservicio de billeteras y retenciones Escrow
│   └── UserService/        # Microservicio de usuarios y autenticación
├── database/
│   └── scripts/            # Scripts SQL de inicialización y datos semilla
└── docker-compose.yml      # Orquestación de contenedores locales
```

---

## Instalación y Ejecución

### Frontend

1. Navegar al directorio de la aplicación web:
   ```bash
   cd frontend/subastaya-web
   ```
2. Instalar dependencias e iniciar el servidor de desarrollo:
   ```bash
   npm install
   npm run dev
   ```
   La aplicación se ejecutará en `http://localhost:5173`.

### Base de Datos

Para inicializar las tablas y datos de prueba en SQL Server, ejecutar los scripts SQL en el siguiente orden:

1. `database/scripts/01_UserService.sql`
2. `database/scripts/02_WalletService.sql`
3. `database/scripts/03_AuctionService.sql`

---

## Cuentas de Prueba (Entorno Demo)

| ID | Usuario | Rol | Email | Propósito |
|---|---|---|---|---|
| `10` | Ana García | Comprador | `comprador1@test.com` | Pruebas de puja activa y saldo suficiente |
| `20` | María López | Comprador | `comprador2@test.com` | Pruebas de competencia en ofertas |
| `30` | Carlos Sin Fondos | Comprador | `sinfondos@test.com` | Validaciones de rechazo por saldo insuficiente |
| `40` | Admin SubastaYa | Vendedor / Admin | `vendedor@test.com` | Publicación de artículos y auditoría global |

---

## Stack Tecnológico

- **Frontend:** React 19, Vite, Bootstrap 5, React Icons.
- **Backend:** C#, .NET 9 Web API, Entity Framework Core.
- **Base de Datos:** Microsoft SQL Server 2022.
- **Contenedores:** Docker & Docker Compose.

