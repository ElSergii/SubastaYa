# SubastaYa - Plataforma de Subastas en Tiempo Real y Comercio Electrónico

![.NET 9](https://img.shields.io/badge/.NET-9.0-purple)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-red)
![React](https://img.shields.io/badge/React-19.0-blue)
![MUI](https://img.shields.io/badge/MUI-Material%20UI-007FFF)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

**SubastaYa** es una plataforma universitaria completa, funcional y escalable diseñada para subastas en tiempo real y comercio electrónico con arquitectura basada en microservicios, garantía de concurrencia optimista, sistema de retención de fondos Escrow, regla Anti-Sniping y comunicación en tiempo real vía SignalR.

---

## 🏗️ Arquitectura del Sistema

El sistema adopta una **Arquitectura Clean** dividida en los siguientes microservicios independientes:

```
SubastaYa/
│
├── backend/
│   ├── ApiGateway/        # Puerta de entrada unificada para la API REST (Puerto 5000)
│   ├── AuctionService/    # Subastas, Pujas, Categorías, SignalR y Anti-Sniping (Puerto 5003)
│   ├── WalletService/     # Billeteras, Sistema Escrow y Ledger (Puerto 5002)
│   ├── UserService/       # Gestión de Usuarios y Perfiles (Puerto 5001)
│   └── AuctionWorker/     # Process Worker en segundo plano para liquidación automática
│
├── frontend/
│   └── subastaya-web/     # Aplicación SPA React + MUI + Axios + SignalR (Puerto 3000)
│
├── tests/
│   ├── AuctionService.Tests/ # Pruebas unitarias de subastas
│   ├── WalletService.Tests/  # Pruebas unitarias de billetera y retenes
│   └── IntegrationTests/     # Pruebas de integración y estrés de concurrencia
│
├── database/
│   └── scripts/           # Scripts SQL y migraciones
│
├── docs/
│   ├── arquitectura/      # Documentación de diseño
│   ├── diagramas/         # Diagramas ER y de arquitectura
│   └── capturas/          # Capturas para la presentación oral
│
├── docker-compose.yml     # Orquestador Docker Compose
├── .gitignore
└── README.md
```

---

## 🛠️ Tecnologías Utilizadas

- **Backend:** C#, .NET 9, ASP.NET Core Web API, Entity Framework Core, SignalR, Swagger/OpenAPI.
- **Base de Datos:** Microsoft SQL Server 2022, EF Core Code-First con Migraciones y Optimistic Locking (`RowVersion`).
- **Frontend:** React, JavaScript, MUI (Material UI & MUI X), Axios, Custom CSS.
- **Infraestructura:** Docker & Docker Compose.

---

## 🚀 Guía de Inicio Rápido (FASE 1)

### Requisitos Previos
- .NET 9 SDK
- Node.js (v20+)
- Docker Desktop con Docker Compose

### 1. Compilar la Solución .NET Localmente
```bash
dotnet build backend/SubastaYa.sln
```

### 2. Levantar la Infraestructura Completa con Docker Compose
```bash
docker compose up --build
```

---

## 📌 Estado del Desarrollo (Fases del Proyecto)

- [x] **FASE 1:** Estructura de repositorio, solución .NET, proyectos de microservicios, Docker Compose y SQL Server.
- [ ] **FASE 2:** Entidades de Dominio, EF Core Code-First, Migraciones y Datos Semilla.
- [ ] **FASE 3:** AuctionService (CRUD, Escrow Integration, Optimistic Locking, Anti-Sniping).
- [ ] **FASE 4:** WalletService (Billeteras, Sistema Escrow y Ledger).
- [ ] **FASE 5:** UserService y ApiGateway Routing.
- [ ] **FASE 6:** SignalR Real-Time Bidding.
- [ ] **FASE 7:** AuctionWorker Process.
- [ ] **FASE 8:** AuditLog & Stress Test de Concurrencia.
- [ ] **FASE 9:** Frontend React + MUI.
- [ ] **FASE 10:** Integración Completa y Verificación End-to-End.
