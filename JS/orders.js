const API_URL = `${window.location.origin}`;

const ordersTbody = document.getElementById("ordersTbody");
const emptyState = document.getElementById("emptyState");
const searchOrder = document.getElementById("searchOrder");
const filterStatus = document.getElementById("filterStatus");

let allOrders = [];

const statusMap = {
  pending: "Pendiente",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado"
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-CR");
}

function formatCurrency(amount) {
  return `₡ ${Number(amount).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function getStatusBadge(status) {
  const label = statusMap[status] || status;

  let badgeClass = "bg-secondary";
  if (status === "pending") badgeClass = "bg-warning text-dark";
  if (status === "processing") badgeClass = "bg-info text-dark";
  if (status === "shipped") badgeClass = "bg-primary";
  if (status === "delivered") badgeClass = "bg-success";
  if (status === "cancelled") badgeClass = "bg-danger";

  return `<span class="badge ${badgeClass}">${label}</span>`;
}

function renderOrders(orders) {
  ordersTbody.innerHTML = "";

  if (!orders.length) {
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");

  orders.forEach(order => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${order._id}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td>${formatCurrency(order.totalPrice)}</td>
      <td class="text-end">${getStatusBadge(order.status)}</td>
    `;

    ordersTbody.appendChild(row);
  });
}

function applyFilters() {
  const searchValue = searchOrder.value.toLowerCase();
  const selectedStatus = filterStatus.value;

  const filtered = allOrders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchValue);

    const translatedStatus = statusMap[order.status];
    const matchesStatus =
      selectedStatus === "ALL" || translatedStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  renderOrders(filtered);
}

async function loadMyOrders() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/orders/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Error al cargar órdenes");
    }

    const data = await response.json();

    allOrders = data;
    renderOrders(allOrders);

  } catch (error) {
    console.error(error);
    emptyState.classList.remove("d-none");
    emptyState.innerHTML = `
      <div class="fs-1 mb-2">⚠️</div>
      <p>Error cargando órdenes</p>
    `;
  }
}

searchOrder.addEventListener("input", applyFilters);
filterStatus.addEventListener("change", applyFilters);

document.addEventListener("DOMContentLoaded", loadMyOrders);