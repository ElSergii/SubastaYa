# Plataforma de Venta de Entradas (React MUI JavaScript + .NET 9 + SQL Server)

**Cátedra:** Proyecto de Software  
**Docente:** Ing. Olivera Lucas  
**Proyecto:** Plataforma corporativa de venta de entradas con arquitectura **React 18 + Material-UI (JavaScript/JSX)** en el Frontend, **ASP.NET Core 9 Web API (C#)** en el Backend y **SQL Server Express** como motor relacional.

---

## 📌 Descripción del Proyecto

Sistema resiliente contra sobreventa de entradas para eventos masivos con control estricto de concurrencia y restauración automática de inventario.

### Características Principales:
1. **Frontend en React + Material-UI (JavaScript/JSX)**:
   - Componentes modulares en `.jsx` (`Navbar`, `EventCatalog`, `SeatMap`, `ShoppingCart`, `AuditLogViewer`, `AdminPanel`).
   - Diseño UI/UX moderno en modo oscuro con biblioteca **Material-UI (MUI)** (`@mui/material`, `@mui/icons-material`, `@emotion/react`).
   - Temporizador regresivo visible (05:00 a 00:00) en el carrito de compras.
   - Notificaciones emergentes (Snackbar/Toast) ante colisiones de concurrencia **HTTP 409 Conflict**.
2. **Backend en ASP.NET Core 9.0 Web API (C#)**:
   - Persistencia relacional con **Entity Framework Core 9.0** Code-First en **SQL Server Express** (`ProyectoSubastaDb`).
   - **Control de Concurrencia (Optimistic Locking)**: Propiedad `[ConcurrencyCheck] Version` en la entidad `Seat`.
   - **Background Worker (`BackgroundService`)**: Proceso automático en segundo plano que libera reservas expira a los 5 minutos.
   - **Transacciones ACID**: Pasarela de pago simulada con rollback automático en caso de fallo.
   - **Auditoría Inmutable (Precisión en ms)**: Registros inmutables con timestamp exacto en milisegundos (`TimestampMs`).
   - **Documentación OpenAPI / Swagger UI**: Accesible en `http://localhost:5000/swagger`.

---

## 📋 Directivas Corporativas Cumplidas

1. **LOGS DE ERROR**: Todo log o excepción capturada inicia con el prefijo obligatorio `[CODE-ERROR] - `.
2. **ITERACIONES**: Todos los bucles iteradores en C# (`foreach`, `for`) y React JavaScript (`map`, `forEach`) utilizan estrictamente la variable `idx_tk`.
3. **MIDDLEWARE**: Interceptor global ASP.NET Core (`CorporateHeaderMiddleware`) que inyecta `X-Api-version: 1.0` en todas las respuestas HTTP.
4. **FRONTEND**: Los contenedores principales de los componentes React renderizan el atributo `data-sys-render="auto"`.

---

## 🚀 Guía de Instalación y Ejecución

### 1. Requisitos Previos
- **.NET 9 SDK** (`dotnet --version`)
- **SQL Server Express** (Servicio `MSSQL$SQLEXPRESS` activo en Windows)
- **Node.js** v18+ y **npm**

### 2. Ejecutar Servidor Backend (.NET 9 Web API + SQL Server)
```bash
cd S:\ProyectoSubasta\backend
dotnet run
```
- ⚡ **API RESTful**: [http://localhost:5000](http://localhost:5000)
- 📄 **Documentación Swagger UI**: [http://localhost:5000/swagger](http://localhost:5000/swagger)

### 3. Ejecutar Cliente Frontend (React + Material-UI en JavaScript)
En otra terminal:
```bash
cd S:\ProyectoSubasta\frontend
npm install
npm run dev
```
- 🌐 **Plataforma Web React**: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Prueba de Estrés de Concurrencia Simultánea

Para ejecutar la prueba automatizada de $N$ peticiones asíncronas concurrentes al mismo asiento:
```bash
cd S:\ProyectoSubasta
npx ts-node scripts/stress-test-net.ts
```

### Resultados de la Prueba:
- **1 Petición** triunfa con `HTTP 201 Created` (Reserva activa por 5 min).
- **19 Peticiones** retornan `HTTP 409 Conflict` ("Asiento ya no disponible").
- **20 Registros** de auditoría inmutable guardados en SQL Server con precisión al milisegundo.
