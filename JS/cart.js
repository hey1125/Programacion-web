document.addEventListener("DOMContentLoaded", () => {

    const items = document.querySelectorAll(".cart-item");
    const subtotalEl = document.getElementById("subtotal");
    const taxEl = document.getElementById("tax");
    const totalEl = document.getElementById("total");

    //Calcular precio total
    function updateTotals() {

        let subtotal = 0;

        document.querySelectorAll(".cart-item").forEach(item => {

            const price = parseFloat(item.dataset.price);
            const qty = parseInt(item.querySelector("input").value);

            subtotal += price * qty;

        });

        const tax = subtotal * 0.13; //Impuesto IVA simulado
        const total = subtotal + tax;

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        taxEl.textContent = `$${tax.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;

    }

    updateTotals();

    //Botones para agregar o quitar cantidad de producto
    document.querySelectorAll(".plus").forEach(btn => {

        btn.addEventListener("click", () => {

            const input = btn.parentElement.querySelector("input");
            input.value = parseInt(input.value) + 1;

            updateTotals();

        });

    });

    document.querySelectorAll(".minus").forEach(btn => {

        btn.addEventListener("click", () => {

            const input = btn.parentElement.querySelector("input");

            if (input.value > 1) {
                input.value = parseInt(input.value) - 1;
                updateTotals();
            }

        });

    });

    //Eliminar producto
    document.querySelectorAll(".delete").forEach(btn => {

        btn.addEventListener("click", () => {

            btn.closest(".cart-item").remove();
            updateTotals();

        });

    });

    //Redirección confirmar orden
    document.getElementById("confirm-order")
        .addEventListener("click", () => {

            window.location.href = "orders.html";

        });

});