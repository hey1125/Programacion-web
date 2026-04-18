const API_URL = `${window.location.origin}`;

document.addEventListener("DOMContentLoaded", loadOrders);

const tbody = document.getElementById("adminOrdersTbody");
const emptyState = document.getElementById("adminEmptyState");

function getStatusBadge(status) {
    switch (status) {
        case "pending":
            return `<span class="badge bg-warning text-dark">Pendiente</span>`;
        case "processing":
            return `<span class="badge bg-info text-dark">Procesando</span>`;
        case "shipped":
            return `<span class="badge bg-primary">Enviado</span>`;
        case "delivered":
            return `<span class="badge bg-success">Entregado</span>`;
        case "cancelled":
            return `<span class="badge bg-danger">Cancelado</span>`;
        default:
            return `<span class="badge bg-secondary">${status}</span>`;
    }
}

async function loadOrders() {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            showEmpty("Debes iniciar sesión");
            return;
        }

        const response = await fetch(`${API_URL}/api/orders`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 403) {
            showEmpty("Acceso denegado: solo administradores");
            return;
        }

        if (response.status === 401) {
            showEmpty("Sesión inválida o expirada");
            return;
        }

        if (!response.ok) {
            throw new Error("Error al cargar órdenes");
        }

        const orders = await response.json();

        if (!orders || orders.length === 0) {
            showEmpty("No hay órdenes registradas");
            return;
        }

        renderOrders(orders);

    } catch (error) {
        console.error(error);
        showEmpty("Error al cargar órdenes");
    }
}

function renderOrders(orders) {
    tbody.innerHTML = "";
    emptyState.classList.add("d-none");

    orders.forEach(order => {
        const row = `
            <tr>
                <td>${order._id}</td>
                <td>${order.user?.name || "N/A"}</td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>₡${Number(order.totalPrice).toLocaleString("es-CR")}</td>
                <td>${getStatusBadge(order.status)}</td>
                <td class="text-center">
                    <select class="form-select form-select-sm"
                        onchange="updateStatus('${order._id}', this.value)">
                        <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pendiente</option>
                        <option value="processing" ${order.status === "processing" ? "selected" : ""}>Procesando</option>
                        <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Enviado</option>
                        <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Entregado</option>
                        <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Cancelado</option>
                    </select>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

async function updateStatus(orderId, newStatus) {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.status === 403) {
            alert("Solo un administrador puede cambiar estados");
            return;
        }

        if (response.status === 401) {
            alert("Sesión inválida o expirada");
            return;
        }

        if (!response.ok) {
            throw new Error("Error al actualizar estado");
        }

        showMessage("Estado actualizado correctamente", "success");

    } catch (error) {
        console.error(error);
        alert("No se pudo actualizar el estado");
    }
}

function showEmpty(msg) {
    tbody.innerHTML = "";
    emptyState.classList.remove("d-none");
    emptyState.innerHTML = `<p class="mb-0">${msg}</p>`;
}

function showMessage(msg, type = "success") {
    const div = document.createElement("div");

    div.className = `alert alert-${type} position-fixed top-0 end-0 m-3 shadow`;
    div.style.zIndex = 9999;
    div.style.minWidth = "250px";

    div.innerText = msg;

    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}