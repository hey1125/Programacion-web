(() => {
  "use strict";

  const tbody = document.getElementById("ordersTbody");
  const pagination = document.getElementById("ordersPagination");
  const emptyState = document.getElementById("emptyState");

  const filterStatus = document.getElementById("filterStatus");
  const searchOrder = document.getElementById("searchOrder");

  const PAGE_SIZE = 5;

  let allOrders = [];
  let filteredOrders = [];
  let currentPage = 1;

  function formatMoney(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function badgeClass(status) {
    switch (status) {
      case "Entregado": return "badge-soft-success";
      case "Enviado": return "badge-soft-info";
      case "Pendiente": return "badge-soft-warning";
      case "Cancelado": return "badge-soft-danger";
      default: return "badge-soft-muted";
    }
  }

  function getEstado(o) {
    return o.estado ?? o.Estado ?? o.status ?? o.estadoOrden ?? "";
  }

  function getId(o) {
    return o.id ?? o.ID ?? o.idOrden ?? "";
  }

  function getFecha(o) {
    return o.fecha ?? o.Fecha ?? "";
  }

  function getTotal(o) {
    return o.total ?? o.Total ?? 0;
  }

  function applyFilters() {
    const status = filterStatus.value;
    const q = (searchOrder.value || "").trim().toLowerCase();

    filteredOrders = allOrders.filter(o => {
      const estado = getEstado(o);
      const id = String(getId(o)).toLowerCase();

      const okStatus = (status === "ALL") ? true : estado === status;
      const okQuery = q ? id.includes(q) : true;

      return okStatus && okQuery;
    });

    currentPage = 1;
    render();
  }

  function pagedItems() {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }

  function renderTable() {
    tbody.innerHTML = "";

    if (filteredOrders.length === 0) {
      emptyState.classList.remove("d-none");
      return;
    }
    emptyState.classList.add("d-none");

    for (const o of pagedItems()) {
      const id = getId(o);
      const fecha = getFecha(o);
      const total = getTotal(o);
      const estado = getEstado(o);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="fw-semibold">${id}</td>
        <td class="text-muted">${fecha}</td>
        <td>${formatMoney(total)}</td>
        <td class="text-end">
          <span class="badge rounded-pill ${badgeClass(estado)}">${estado}</span>
        </td>
      `;
      tbody.appendChild(tr);
    }
  }

  function renderPagination() {
    pagination.innerHTML = "";

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

    const prev = document.createElement("li");
    prev.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    prev.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
    prev.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) { currentPage--; render(); }
    });
    pagination.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === currentPage ? "active" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        render();
      });
      pagination.appendChild(li);
    }

    const next = document.createElement("li");
    next.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
    next.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
    next.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) { currentPage++; render(); }
    });
    pagination.appendChild(next);
  }

  function render() {
    renderTable();
    renderPagination();
  }

  async function loadOrders() {
    const res = await fetch("data/orders.json");
    if (!res.ok) throw new Error("No se pudo cargar data/orders.json. Revisá rutas.");

    allOrders = await res.json();

    // ordena por fecha desc (si viene fecha vacía, no revienta)
    allOrders.sort((a, b) => (getFecha(a) < getFecha(b) ? 1 : -1));

    filteredOrders = [...allOrders];
    render();
  }

  filterStatus.addEventListener("change", applyFilters);
  searchOrder.addEventListener("input", applyFilters);

  loadOrders().catch(err => {
    console.error(err);
    emptyState.classList.remove("d-none");
    emptyState.innerHTML = `
      <div class="fs-1 mb-2">⚠️</div>
      <p class="mb-0">Error cargando órdenes. Revisá la ruta <code>data/orders.json</code>.</p>
    `;
  });
})();