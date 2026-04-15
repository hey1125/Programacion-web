const API_URL = `${window.location.origin}/api/products`;

async function cargarArticulo() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    const container = document.getElementById('articulo-container');
    const reseñasContainer = document.getElementById('reseñas-container');

    if (!container || !reseñasContainer) return;
    if (!id) {
        container.innerHTML = "<h2>Producto no encontrado</h2>";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Error en la petición");
        const p = await res.json();

        // Inyectamos la estructura que definiste en tu SCSS
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
                    <p class="descripcion">${p.description || 'Sin descripción disponible.'}</p>
                    
                    <div class="botones">
                        <button class="agregar"><i class="fa-solid fa-cart-plus"></i> Agregar al carrito</button>
                        <button class="comprar">Comprar ahora</button>
                    </div>
                </div>
            </div>
        `;

        // Renderizar reseñas si existen
        if (p.reviews && p.reviews.length > 0) {
            reseñasContainer.innerHTML = p.reviews.map(r => `
                <div class="reseña">
                    <div class="reseña__header">
                        <span class="reseña__usuario">${r.user}</span>
                        <span class="reseña__estrellas">${'★'.repeat(r.rating)}</span>
                    </div>
                    <p class="reseña__texto">${r.comment}</p>
                </div>
            `).join('');
        } else {
            reseñasContainer.innerHTML = '<p class="reseña__texto">No hay reseñas aún.</p>';
        }

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = "<h2>Error al conectar con el servidor</h2>";
    }
}

document.addEventListener('DOMContentLoaded', cargarArticulo);