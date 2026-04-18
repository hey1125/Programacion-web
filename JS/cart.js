const API_URL = `${window.location.origin}`;

document.addEventListener("DOMContentLoaded", async () => {

    const cartItemsContainer = document.querySelector(".cart-items");
    const subtotalEl = document.getElementById("subtotal");
    const taxEl = document.getElementById("tax");
    const totalEl = document.getElementById("total");

    // ─── Renderizar items del carrito ────────────────────────────────────────
    function renderCartItems(items) {
        cartItemsContainer.innerHTML = "";

        if (!items || items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Tu carrito está vacío.</p>
                </div>`;
            updateTotals();
            return;
        }

        items.forEach(item => {
            const product = item.product;
            const productId = product._id;
            const price = item.price ?? product.price;
            const qty = item.quantity;
            const imageUrl = product.imageUrl || "img/placeholder.jpg";
            const name = product.name;

            const div = document.createElement("div");
            div.classList.add("cart-item");
            div.dataset.id = productId;
            div.dataset.price = price;

            div.innerHTML = `
                <img src="${imageUrl}" alt="${name}">
                <div class="cart-info">
                    <h3>${name}</h3>
                    <span class="price">$${parseFloat(price).toFixed(2)}</span>
                    <div class="quantity">
                        <button class="qty-btn minus">-</button>
                        <input type="number" value="${qty}" min="1">
                        <button class="qty-btn plus">+</button>
                    </div>
                </div>
                <button class="delete">🗑</button>
            `;

            cartItemsContainer.appendChild(div);
        });

        bindItemEvents();
        updateTotals();
    }

    // ─── Calcular totales ────────────────────────────────────────────────────
    function updateTotals() {
        let subtotal = 0;

        document.querySelectorAll(".cart-item").forEach(item => {
            const price = parseFloat(item.dataset.price);
            const qty = parseInt(item.querySelector("input").value);
            subtotal += price * qty;
        });

        const tax = subtotal * 0.13;
        const total = subtotal + tax;

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        taxEl.textContent = `$${tax.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
    }

    // ─── Eventos de cada item (+ / - / eliminar) ─────────────────────────────
    function bindItemEvents() {

        document.querySelectorAll(".plus").forEach(btn => {
            btn.addEventListener("click", async () => {
                const item = btn.closest(".cart-item");
                const input = item.querySelector("input");
                const productId = item.dataset.id;
                const newQty = parseInt(input.value) + 1;

                const ok = await updateItemInAPI(productId, newQty);
                if (ok) {
                    input.value = newQty;
                    updateTotals();
                }
            });
        });

        document.querySelectorAll(".minus").forEach(btn => {
            btn.addEventListener("click", async () => {
                const item = btn.closest(".cart-item");
                const input = item.querySelector("input");
                const productId = item.dataset.id;
                const newQty = parseInt(input.value) - 1;

                if (newQty < 1) return;

                const ok = await updateItemInAPI(productId, newQty);
                if (ok) {
                    input.value = newQty;
                    updateTotals();
                }
            });
        });

        document.querySelectorAll(".delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                const item = btn.closest(".cart-item");
                const productId = item.dataset.id;

                const ok = await removeItemFromAPI(productId);
                if (ok) {
                    item.remove();
                    updateTotals();
                }
            });
        });
    }

    // ─── Llamadas a la API ───────────────────────────────────────────────────
    function getToken() {
        return localStorage.getItem("token");
    }

    async function fetchCart() {
        try {
            const res = await fetch(`${API_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if (!res.ok) throw new Error("No se pudo cargar el carrito");

            const data = await res.json();
            return data.items || [];
        } catch (error) {
            console.error(error);
            alert("Error al cargar el carrito");
            return [];
        }
    }

    async function updateItemInAPI(productId, quantity) {
        try {
            const res = await fetch(`${API_URL}/api/cart/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({ quantity })
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Error al actualizar cantidad");
                return false;
            }
            return true;
        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor");
            return false;
        }
    }

    async function removeItemFromAPI(productId) {
        try {
            const res = await fetch(`${API_URL}/api/cart/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Error al eliminar producto");
                return false;
            }
            return true;
        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor");
            return false;
        }
    }

    // ─── Confirmar pedido ────────────────────────────────────────────────────
    document.getElementById("confirm-order").addEventListener("click", async () => {

        const name     = document.getElementById("name").value.trim();
        const lastname = document.getElementById("lastname").value.trim();
        const address  = document.getElementById("address").value.trim();
        const city     = document.getElementById("city").value.trim();
        const province = document.getElementById("province").value.trim();
        const zip      = document.getElementById("zip").value.trim();

        if (!name || !lastname || !address || !city || !province || !zip) {
            alert("Completa toda la información de envío");
            return;
        }

        const paymentMethodInput = document.querySelector("input[name='payment']:checked");
        if (!paymentMethodInput) {
            alert("Selecciona un método de pago");
            return;
        }

        const orderData = {
            shippingAddress: {
                street: address,
                city,
                zip,
                country: "Costa Rica"
            },
            paymentMethod: paymentMethodInput.value
        };

        try {
            const res = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Error al crear la orden");
                return;
            }

            alert("Pedido creado correctamente");
            window.location.href = "orders.html";

        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor");
        }
    });

    // ─── Inicio: cargar carrito desde la API ─────────────────────────────────
    const items = await fetchCart();
    renderCartItems(items);

});