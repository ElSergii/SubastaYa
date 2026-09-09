# SubastaYa - Plataforma de Subastas en Tiempo Real

![React](https://img.shields.io/badge/React-19.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3)
![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC292B)

**SubastaYa** es una plataforma web completa de subastas en vivo y gestión financiera Escrow. Diseñada con arquitectura de microservicios en el backend y una interfaz dinámica en React + Bootstrap 5 en el frontend.

---

## 🚀 Funcionalidades Principales

- 🔨 **Pujas en Tiempo Real & Puja Rápida**: Ofertas instantáneas con cálculo automático de incrementos según el rango de precio de la subasta.
- 🛡️ **Garantía Escrow 1 a 1**: Retención transparente en la billetera digital equivalente al 100% de la oferta realizada. Al ser sobrepujado, los fondos se liberan automáticamente.
- 👑 **Control de Liderazgo**: Restricción de autopujas para evitar que el postor líder sobrepuje sus propias ofertas activas.
- 💼 **Billetera de Comprador y Vendedor**:
  - **Compradores**: Gestión de saldo líquido disponible, retenciones activas y recarga simulada.
  - **Vendedores**: Panel de recaudación por ventas, comisiones retenidas, alias de cobro y carga de capital operativo.
- 🔒 **Auditoría de Transacciones**: Historial inmutable de eventos de subasta. Los usuarios consultan su registro privado personal, mientras que el perfil Administrador cuenta con supervisión global.
- ⏱️ **Extensión Anti-Sniping**: Extensión automática de tiempo cuando ingresan ofertas en los últimos segundos antes del cierre.
- ⏱️ **Notificaciones con Auto-cierre y Descarte**: Sistema de alertas emergentes con temporizador y botón `X` de cierre rápido.

---

## 🏗️ Estructura del Proyecto

```
SubastaYa/
├── frontend/
│   └── subastaya-web/      # Aplicación web SPA (React + Vite + Bootstrap 5)
├── backend/
│   ├── ApiGateway/         # Router y puerta de entrada REST API (.NET 9)
│   ├── AuctionService/     # Servicio de subastas, ofertas y tiempo real
│   ├── WalletService/      # Servicio de billetera digital y Escrow
│   └── UserService/        # Gestión de perfiles y usuarios
├── database/
│   └── scripts/            # Scripts SQL para creación de tablas y datos semilla
└── README.md
```

---

## ⚙️ Instalación y Ejecución Local

### 1. Iniciar la Web Frontend

```bash
cd frontend/subastaya-web
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### 2. Base de Datos (SQL Server)

Ejecutar los scripts de estructura y datos de prueba en Microsoft SQL Server en el siguiente orden:

1. `database/scripts/01_UserService.sql`
2. `database/scripts/02_WalletService.sql`
3. `database/scripts/03_AuctionService.sql`

---

## 👥 Cuentas de Prueba (Modo Demo)

| Usuario | Rol | Email | Descripción |
|---|---|---|---|
| **Ana García** | Comprador | `comprador1@test.com` | Cuenta de comprador con saldo para pujar |
| **María López** | Comprador | `comprador2@test.com` | Cuenta de comprador con saldo para pujar |
| **Carlos Sin Fondos** | Comprador | `sinfondos@test.com` | Cuenta para probar validaciones de saldo |
| **Admin SubastaYa** | Vendedor / Admin | `vendedor@test.com` | Crear subastas y ver auditoría global |

---

## 🛠️ Tecnologías

- **Frontend:** React 19, Vite, Bootstrap 5, React Icons, Custom CSS.
- **Backend:** C#, .NET 9 Web API, Entity Framework Core.
- **Base de Datos:** Microsoft SQL Server 2022.
