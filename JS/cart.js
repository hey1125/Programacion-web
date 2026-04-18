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

    document.getElementById("confirm-order")
    .addEventListener("click", async () => {

        //Validar campos
        const name = document.getElementById("name").value;
        const lastname = document.getElementById("lastname").value;
        const address = document.getElementById("address").value;
        const city = document.getElementById("city").value;
        const province = document.getElementById("province").value;
        const zip = document.getElementById("zip").value;

        if (!name || !lastname || !address || !city || !province || !zip) {
            alert("Completa toda la información de envío");
            return;
        }

        const paymentMethodInput = document.querySelector("input[name='payment']:checked");

        if (!paymentMethodInput) {
            alert("Selecciona un método de pago");
            return;
        }

        const paymentMethod = paymentMethodInput.value;

        //Total
        const total = parseFloat(
            document.getElementById("total").textContent.replace("$", "")
        );

        const orderData = {
            shippingAddress: {
                street: address,
                city: city,
                zip: zip,
                country: "Costa Rica"
            },
            paymentMethod,
        };

        console.log(orderData);

        try {
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
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

});