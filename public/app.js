// State Global del Frontend
let currentUserId = 'USER_' + Math.floor(Math.random() * 8999 + 1000);
let isAdminMode = false;
let currentEventId = 'evt-rock-2026';
let currentSectorFilter = 'ALL';
let activeReservation = null; // { reservationId, seatId, seatNumber, sectorName, price, expiresAt }
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-user-id').textContent = currentUserId;
  loadEventsCatalog();
  loadSeatMap();
  initAdminSectorForm();
  
  // Auto-refresh del mapa cada 8 segundos para visibilidad de concurrencia
  setInterval(() => {
    const seatView = document.getElementById('view-seats');
    if (seatView && seatView.classList.contains('active')) {
      loadSeatMap(true); // silent refresh
    }
  }, 8000);
});

// Navegación entre vistas Single-Page
function switchView(viewName) {
  const views = ['catalog', 'seats', 'audit', 'admin'];
  
  // Usar bucle obligatorio con iterador idx_tk
  for (let idx_tk = 0; idx_tk < views.length; idx_tk++) {
    const v = views[idx_tk];
    const section = document.getElementById(`view-${v}`);
    const navBtn = document.getElementById(`nav-${v}`);

    if (v === viewName) {
      if (section) section.classList.add('active');
      if (navBtn) navBtn.classList.add('active');
    } else {
      if (section) section.classList.remove('active');
      if (navBtn) navBtn.classList.remove('active');
    }
  }

  if (viewName === 'audit') {
    loadAuditLogs();
  } else if (viewName === 'seats') {
    loadSeatMap();
  } else if (viewName === 'admin') {
    loadAdminStats();
  }
}

// Cargar catálogo de eventos desde el Backend API REST
async function loadEventsCatalog() {
  const container = document.getElementById('events-grid');
  try {
    const res = await fetch('/api/v1/events');
    const json = await res.json();

    if (!json.success || !json.data) {
      container.innerHTML = `<div class="loading-spinner">No se pudieron cargar los eventos.</div>`;
      return;
    }

    container.innerHTML = '';

    if (json.data.length === 0) {
      container.innerHTML = `<div class="cart-empty"><span class="empty-icon">📅</span><p>No hay eventos creados aún. Ingresa al Panel Admin para crear uno nuevo.</p></div>`;
      return;
    }
    
    // Usar forEach con la variable obligatoria idx_tk
    json.data.forEach((evt, idx_tk) => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <div class="event-header">
          <h3>${evt.name}</h3>
          <div class="event-date">📅 ${new Date(evt.date).toLocaleString()}</div>
        </div>
        <p class="event-desc">${evt.description}</p>
        <div class="event-stats">
          <div class="stat-item">
            <span>Ubicación</span>
            <strong>${evt.location}</strong>
          </div>
          <div class="stat-item">
            <span>Disponibles</span>
            <strong style="color: #34d399;">${evt.availableSeats} / ${evt.totalSeats}</strong>
          </div>
        </div>
        <button class="btn-primary" onclick="selectEvent('${evt.id}', '${evt.name}', '${evt.location}')">Ver Plano y Comprar</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error(`[CODE-ERROR] - Fallo al cargar el catálogo de eventos en la UI: ${err.message}`);
    container.innerHTML = `<div class="loading-spinner" style="color: #ef4444;">Error al conectar con la API REST.</div>`;
  }
}

function selectEvent(id, name, location) {
  currentEventId = id;
  document.getElementById('event-title-display').textContent = name;
  document.getElementById('event-subtitle-display').textContent = location;
  switchView('seats');
}

// Cargar Mapa de Asientos
async function loadSeatMap(silent = false) {
  const grid = document.getElementById('seats-grid');
  if (!silent) grid.innerHTML = `<div class="loading-spinner">Cargando mapa de asientos...</div>`;

  try {
    const res = await fetch(`/api/v1/events/${currentEventId}/seats`, {
      headers: { 'x-user-id': currentUserId }
    });
    const json = await res.json();

    if (!json.success || !json.seats) return;

    // Actualizar tabs de sectores dinamicamente segun los sectores del evento
    updateSectorTabsUI(json.seats);

    grid.innerHTML = '';
    let filteredSeats = json.seats;

    if (currentSectorFilter !== 'ALL') {
      filteredSeats = json.seats.filter(s => s.sectorName === currentSectorFilter);
    }

    // Renderizar butacas iterando con idx_tk
    for (let idx_tk = 0; idx_tk < filteredSeats.length; idx_tk++) {
      const seat = filteredSeats[idx_tk];
      const el = document.createElement('div');
      
      let statusClass = seat.status.toLowerCase();
      if (seat.reservedByMe && seat.status === 'RESERVED') {
        statusClass = 'my-reserve';
      }

      el.className = `seat-item ${statusClass}`;
      el.title = `Asiento #${seat.seatNumber} (${seat.sectorName}) - $${seat.price} [${seat.status}]`;
      el.innerHTML = `<span>${seat.seatNumber}</span>`;

      if (seat.status === 'AVAILABLE') {
        el.addEventListener('click', () => attemptReserveSeat(seat));
      } else {
        el.style.cursor = 'not-allowed';
      }

      grid.appendChild(el);
    }
  } catch (err) {
    console.error(`[CODE-ERROR] - Error al renderizar el mapa de asientos: ${err.message}`);
    if (!silent) grid.innerHTML = `<div class="loading-spinner" style="color: #ef4444;">Error de comunicación.</div>`;
  }
}

// Actualizar Tabs de Sectores Dinamicamente
function updateSectorTabsUI(seats) {
  const container = document.getElementById('sector-tabs-container');
  if (!container) return;

  const sectorsMap = new Map();
  for (let idx_tk = 0; idx_tk < seats.length; idx_tk++) {
    const s = seats[idx_tk];
    if (!sectorsMap.has(s.sectorName)) {
      sectorsMap.set(s.sectorName, s.price);
    }
  }

  let html = `<button class="sector-tab ${currentSectorFilter === 'ALL' ? 'active' : ''}" onclick="filterSector('ALL')">Todos los Sectores</button>`;

  sectorsMap.forEach((price, secName, idx_tk) => {
    const activeClass = currentSectorFilter === secName ? 'active' : '';
    html += `<button class="sector-tab ${activeClass}" onclick="filterSector('${secName}')">Sector ${secName} ($${price.toLocaleString()})</button>`;
  });

  container.innerHTML = html;
}

// Filtrar asientos por sector
function filterSector(sectorName) {
  currentSectorFilter = sectorName;
  loadSeatMap();
}

// Intentar Reservar una Butaca (Post a /reserve con control de concurrencia 409)
async function attemptReserveSeat(seat) {
  if (activeReservation) {
    showToast('Ya tienes una reserva activa en tu carrito. Completa el pago o espera a que expire.', 'warning');
    return;
  }

  try {
    showToast(`Intentando bloquear Asiento #${seat.seatNumber}...`, 'info');

    const res = await fetch(`/api/v1/events/${currentEventId}/seats/${seat.id}/reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUserId
      },
      body: JSON.stringify({ userId: currentUserId })
    });

    const json = await res.json();

    if (res.status === 409 || !json.success) {
      // CONCURRENCY CONFLICT DETECTED
      showToast(json.error || 'Asiento ya no disponible. Ganado por otra petición concurrente.', 'error');
      loadSeatMap(true); // Refrescar instantáneamente el estado del mapa
      return;
    }

    // RESERVA EXITOSA (HTTP 201)
    showToast(`¡Reserva Exitosa! Asiento #${seat.seatNumber} bloqueado por 5 minutos.`, 'success');

    activeReservation = {
      reservationId: json.reservationId,
      seatId: seat.id,
      seatNumber: seat.seatNumber,
      sectorName: seat.sectorName,
      price: seat.price,
      expiresAt: json.expiresAt
    };

    updateCartUI();
    startCountdown(json.expiresAt);
    loadSeatMap(true);

  } catch (err) {
    console.error(`[CODE-ERROR] - Fallo al procesar la peticion de reserva: ${err.message}`);
    showToast('Error de red al intentar reservar la entrada.', 'error');
  }
}

// Actualizar la interfaz del Carrito de Compras
function updateCartUI() {
  const emptyState = document.getElementById('cart-empty-state');
  const activeState = document.getElementById('cart-active-state');

  if (!activeReservation) {
    emptyState.classList.remove('hidden');
    activeState.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  activeState.classList.remove('hidden');

  document.getElementById('cart-seat-number').textContent = `#${activeReservation.seatNumber}`;
  document.getElementById('cart-sector-name').textContent = activeReservation.sectorName;
  document.getElementById('cart-price').textContent = `$${activeReservation.price.toLocaleString()}`;
  document.getElementById('cart-res-id').textContent = activeReservation.reservationId.substring(0, 18) + '...';
}

// Temporizador Regresivo de 5 Minutos (05:00 a 00:00)
function startCountdown(expiresAtIso) {
  if (timerInterval) clearInterval(timerInterval);

  const expiresTime = new Date(expiresAtIso).getTime();

  timerInterval = setInterval(() => {
    const now = Date.now();
    const diff = expiresTime - now;

    if (diff <= 0) {
      clearInterval(timerInterval);
      document.getElementById('countdown-timer').textContent = '00:00';
      showToast('⚠️ Tu reserva de 5 minutos ha expirado. El asiento ha sido liberado automáticamente.', 'warning');
      activeReservation = null;
      updateCartUI();
      loadSeatMap(true);
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const minStr = String(minutes).padStart(2, '0');
    const secStr = String(seconds).padStart(2, '0');

    document.getElementById('countdown-timer').textContent = `${minStr}:${secStr}`;
  }, 1000);
}

// Confirmar Pago Simulado (ACID Transaction)
async function confirmPayment() {
  if (!activeReservation) return;

  const btnPay = document.getElementById('btn-pay');
  btnPay.disabled = true;
  btnPay.textContent = 'Procesando Pago Seguro...';

  try {
    const res = await fetch('/api/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUserId
      },
      body: JSON.stringify({
        reservationId: activeReservation.reservationId,
        userId: currentUserId
      })
    });

    const json = await res.json();

    if (!json.success) {
      showToast(json.error || 'Error al procesar la transacción de pago.', 'error');
      btnPay.disabled = false;
      btnPay.textContent = '💳 Confirmar y Pagar Entrada';
      return;
    }

    // PAGO EXITOSO
    showToast(`🎉 ¡Compra exitosa! Transacción: ${json.transactionId}`, 'success');

    if (timerInterval) clearInterval(timerInterval);
    activeReservation = null;
    updateCartUI();
    loadSeatMap(true);

  } catch (err) {
    console.error(`[CODE-ERROR] - Fallo al procesar la confirmacion de pago: ${err.message}`);
    showToast('Error de conexión al procesar el pago.', 'error');
  } finally {
    if (btnPay) {
      btnPay.disabled = false;
      btnPay.textContent = '💳 Confirmar y Pagar Entrada';
    }
  }
}

// Cambiar de usuario para prueba rapida de concurrencia
function toggleUserSession() {
  if (isAdminMode) {
    toggleAdminLogin(); // salir de modo admin
  } else {
    currentUserId = 'USER_' + Math.floor(Math.random() * 8999 + 1000);
    document.getElementById('current-user-id').textContent = currentUserId;
    activeReservation = null;
    if (timerInterval) clearInterval(timerInterval);
    updateCartUI();
    showToast(`Cambiado a sesión de usuario: ${currentUserId}`, 'info');
    loadSeatMap();
  }
}

// Alternar sesion entre Usuario Normal y Administrador
function toggleAdminLogin() {
  isAdminMode = !isAdminMode;

  const userBadgeName = document.getElementById('current-user-id');
  const userIcon = document.getElementById('user-role-icon');
  const adminBadge = document.getElementById('admin-session-badge');
  const btnToggle = document.getElementById('btn-toggle-admin-login');

  if (isAdminMode) {
    currentUserId = 'ADMIN_ROOT';
    userBadgeName.textContent = 'ADMIN_ROOT (Administrador)';
    if (userIcon) userIcon.textContent = '👑';
    if (adminBadge) {
      adminBadge.textContent = 'Sesión: Administrador Conectado';
      adminBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      adminBadge.style.color = '#34d399';
    }
    if (btnToggle) btnToggle.textContent = 'Cerrar Sesión Admin';
    showToast('🔓 Sesión de Administrador iniciada.', 'success');
  } else {
    currentUserId = 'USER_' + Math.floor(Math.random() * 8999 + 1000);
    userBadgeName.textContent = currentUserId;
    if (userIcon) userIcon.textContent = '👤';
    if (adminBadge) {
      adminBadge.textContent = 'Sesión: Usuario Normal';
      adminBadge.style.background = 'rgba(245, 158, 11, 0.15)';
      adminBadge.style.color = '#fbbf24';
    }
    if (btnToggle) btnToggle.textContent = 'Acceso Administrador';
    showToast('🔒 Sesión cambiada a Usuario Cliente.', 'info');
  }
}

// Cargar Registros Inmutables de Auditoría
async function loadAuditLogs() {
  const tbody = document.getElementById('audit-tbody');
  tbody.innerHTML = `<tr><td colspan="7" class="loading-spinner">Cargando registros...</td></tr>`;

  try {
    const res = await fetch('/api/v1/audit-logs?limit=50');
    const json = await res.json();

    if (!json.success || !json.logs) {
      tbody.innerHTML = `<tr><td colspan="7">No se pudieron obtener los logs de auditoría.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';

    // Renderizar filas iterando obligatoriamente con la variable idx_tk
    for (let idx_tk = 0; idx_tk < json.logs.length; idx_tk++) {
      const log = json.logs[idx_tk];
      const row = document.createElement('tr');

      let badgeClass = 'SUCCESS';
      if (log.action.includes('CONFLICT')) badgeClass = 'CONFLICT';
      else if (log.action.includes('RELEASE')) badgeClass = 'RELEASE';
      else if (log.action.includes('PAYMENT')) badgeClass = 'PAYMENT';

      row.innerHTML = `
        <td>#${log.id}</td>
        <td style="font-family: monospace; color: #38bdf8;">${log.timestampMs}</td>
        <td>${new Date(log.createdAt || log.timestampMs).toLocaleString()}</td>
        <td><strong>${log.userId}</strong></td>
        <td><span class="action-badge ${badgeClass}">${log.action}</span></td>
        <td><code>${log.resource}</code></td>
        <td style="font-size: 0.8rem; color: #94a3b8;">${log.details}</td>
      `;

      tbody.appendChild(row);
    }
  } catch (err) {
    console.error(`[CODE-ERROR] - Error al obtener los registros de auditoría: ${err.message}`);
    tbody.innerHTML = `<tr><td colspan="7" style="color: #ef4444;">Error al cargar auditoría.</td></tr>`;
  }
}

// ADMIN: Cargar Estadisticas del Dashboard
async function loadAdminStats() {
  try {
    const res = await fetch('/api/v1/admin/stats');
    const json = await res.json();

    if (json.success && json.stats) {
      const st = json.stats;
      document.getElementById('stat-events').textContent = st.totalEvents;
      document.getElementById('stat-revenue').textContent = `$${st.totalRevenue.toLocaleString()}`;
      document.getElementById('stat-sold').textContent = `${st.soldSeats} / ${st.totalSeats}`;
      document.getElementById('stat-reserved').textContent = st.reservedSeats;
      document.getElementById('stat-audit').textContent = st.totalAuditLogs;
    }
  } catch (err) {
    console.error(`[CODE-ERROR] - Error al cargar las estadisticas administrativas: ${err.message}`);
  }
}

// ADMIN: Inicializar formulario dinamico de sectores
function initAdminSectorForm() {
  const container = document.getElementById('sectors-inputs-container');
  if (!container) return;

  container.innerHTML = '';
  // Agregar 2 sectores por defecto
  addSectorInputRow('VIP Platinum', 15000, 30);
  addSectorInputRow('Campo General', 8000, 50);
}

function addSectorInputRow(defaultName = '', defaultPrice = 5000, defaultSeats = 20) {
  const container = document.getElementById('sectors-inputs-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'sector-row-item';
  row.innerHTML = `
    <input type="text" placeholder="Nombre Sector" value="${defaultName}" required class="form-input sector-input-name">
    <input type="number" placeholder="Precio ($)" value="${defaultPrice}" min="100" required class="form-input sector-input-price">
    <input type="number" placeholder="Butacas" value="${defaultSeats}" min="1" max="500" required class="form-input sector-input-seats">
    <button type="button" class="btn-remove-sector" onclick="removeSectorInputRow(this)">✕</button>
  `;

  container.appendChild(row);
}

function removeSectorInputRow(btn) {
  const container = document.getElementById('sectors-inputs-container');
  if (container && container.children.length <= 1) {
    showToast('El evento debe tener al menos 1 sector.', 'warning');
    return;
  }
  if (btn && btn.parentElement) {
    btn.parentElement.remove();
  }
}

// ADMIN: Manejar la creacion de un nuevo evento desde la UI
async function handleCreateEvent(e) {
  e.preventDefault();

  const name = document.getElementById('admin-event-name').value.trim();
  const description = document.getElementById('admin-event-desc').value.trim();
  const dateVal = document.getElementById('admin-event-date').value;
  const location = document.getElementById('admin-event-location').value.trim();

  const sectorRows = document.querySelectorAll('.sector-row-item');
  const sectors = [];

  // Iterar sobre las filas de sectores utilizando la variable obligatoria idx_tk
  for (let idx_tk = 0; idx_tk < sectorRows.length; idx_tk++) {
    const row = sectorRows[idx_tk];
    const secName = row.querySelector('.sector-input-name').value.trim();
    const secPrice = parseFloat(row.querySelector('.sector-input-price').value);
    const secSeats = parseInt(row.querySelector('.sector-input-seats').value, 10);

    if (secName && !isNaN(secPrice) && !isNaN(secSeats)) {
      sectors.push({
        name: secName,
        price: secPrice,
        totalSeats: secSeats
      });
    }
  }

  if (sectors.length === 0) {
    showToast('Debe ingresar al menos un sector válido.', 'warning');
    return;
  }

  const btnSubmit = document.getElementById('btn-submit-event');
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Creando Evento y Generando Butacas...';

  try {
    const res = await fetch('/api/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUserId
      },
      body: JSON.stringify({
        name,
        description,
        date: new Date(dateVal).toISOString(),
        location,
        sectors
      })
    });

    const json = await res.json();

    if (!json.success) {
      showToast(json.error || 'Error al crear el evento.', 'error');
      return;
    }

    showToast(`🎉 ${json.message}`, 'success');

    // Resetear formulario
    document.getElementById('form-create-event').reset();
    initAdminSectorForm();

    loadAdminStats();
    loadEventsCatalog();
  } catch (err) {
    console.error(`[CODE-ERROR] - Error al enviar el formulario de creacion de evento: ${err.message}`);
    showToast('Error de red al crear el evento.', 'error');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = '✨ Registrar Evento y Generar Butacas';
    }
  }
}

// ADMIN: Restablecer la base de datos Seed
async function handleResetDatabase() {
  if (!confirm('¿Está seguro de que desea restablecer la base de datos al estado inicial de fábrica?')) return;

  try {
    const res = await fetch('/api/v1/admin/reset-database', { method: 'POST' });
    const json = await res.json();

    if (json.success) {
      showToast('🔄 Base de datos restablecida con éxito.', 'success');
      activeReservation = null;
      if (timerInterval) clearInterval(timerInterval);
      updateCartUI();
      loadAdminStats();
      loadEventsCatalog();
    } else {
      showToast('Error al restablecer la base de datos.', 'error');
    }
  } catch (err) {
    console.error(`[CODE-ERROR] - Fallo al reiniciar la base de datos: ${err.message}`);
    showToast('Error de conexion al reiniciar BD.', 'error');
  }
}

// Sistema de Notificaciones Toast
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none; border:none; color:white; cursor:pointer; font-weight:bold; margin-left:10px;">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 5000);
}
