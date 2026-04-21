const API_URL = `${window.location.origin}/api/products`;

async function cargarArticulo() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const container = document.getElementById('articulo-container');

    if (!container) return;
    if (!id) {
        container.innerHTML = "<h2>Producto no encontrado</h2>";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Error al obtener el producto");
        const p = await res.json();
        const description = (p.description || 'Sin descripción')
        .replace(/\\n/g, "\n")
        .replace(/\n/g, "<br>");


        container.innerHTML = `
            <div class="articulo">
                <div class="articulo__imagenes">
                    <img src="${p.imageUrl || 'img/Ejemplo.jpg'}" alt="${p.name}" class="principal">
                    <div class="miniaturas">
                        <img src="${p.imageUrl || 'img/Ejemplo.jpg'}" alt="miniatura">
                    </div>
                </div>

                <div class="articulo__info">
                    <h2>${p.name}</h2>
                    <p class="precio">$${p.price.toLocaleString()}</p>
                    <p class="description">${description || 'Sin descripción disponible.'}</p>
                    
                    <div class="botones">
                        <button class="agregar" id="btn-add">
                            <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Evento para el carrito
        document.getElementById('btn-add').addEventListener('click', () => {
            agregarAlCarrito(p);
        });

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = "<h2>Error al cargar el producto</h2>";
    }
}

async function agregarAlCarrito(producto) {
    const token = localStorage.getItem('token');

    // 1. Verificamos si el usuario está logueado
    if (!token) {
        alert("Debes iniciar sesión para añadir productos al carrito.");
        window.location.href = 'login.html'; // Opcional: redirigir al login
        return;
    }

    try {
        // 2. Enviamos el ID del producto a tu ruta de carrito
        // Ajusta la URL según tu backend (ej: /api/cart o /api/users/cart)
       const response = await fetch(`${window.location.origin}/api/cart`, { 
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        productId: producto._id,
        quantity: 1
    })
});

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al añadir al carrito");
        }

        const resultado = await response.json();

        // 3. Feedback visual
        alert(`¡${producto.name} se añadió a tu carrito en la nube!`);
        
        // Si tienes un contador en el header, podrías actualizarlo aquí
        if (typeof actualizarContadorCarritoAPI === 'function') {
            actualizarContadorCarritoAPI();
        }

    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo agregar el producto: " + error.message);
    }
}

document.addEventListener('DOMContentLoaded', cargarArticulo);