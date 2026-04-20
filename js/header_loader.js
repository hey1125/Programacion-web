document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.getElementById('header-placeholder');

    if (headerContainer) {
        fetch('header.html')
            .then(response => {
                if (!response.ok) throw new Error("No se pudo encontrar el archivo header.html");
                return response.text();
            })
            .then(data => {
                // PASO 1: Inyectar el HTML físicamente en la página
                headerContainer.innerHTML = data;

                // PASO 2: Ahora que el HTML ya existe, buscamos el enlace y verificamos el rol
                verificarAccesoAdmin();

                if (typeof initBuscadorRealTime === 'function') initBuscadorRealTime();
            })
            .catch(error => console.error('Error cargando el header:', error));
    }
});

/**
 * Lógica para el buscador con sugerencias desplegables
 */
function initBuscadorRealTime() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('suggestions-box');

    if (!searchInput || !suggestionsBox) return;

    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();

        // Solo buscar si hay al menos 2 caracteres
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        try {
            // "search" es el parámetro que usa el ProductController en el backend
            const response = await fetch(`${window.location.origin}/api/products?search=${encodeURIComponent(query)}`);
            const products = await response.json();

            renderizarSugerencias(products, suggestionsBox);
        } catch (error) {
            console.error('Error al obtener sugerencias:', error);
        }
    });

    // Cerrar el menú si se hace clic fuera del buscador
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });
}

/**
 * Crea los elementos dentro del menú desplegable
 */
function renderizarSugerencias(products, box) {
    if (products.length === 0) {
        box.innerHTML = '<div class="suggestion-item">No se encontraron resultados</div>';
    } else {
        box.innerHTML = products.slice(0, 5).map(p => `
            <div class="suggestion-item" onclick="window.location.href='articulo.html?id=${p._id}'">
                <img src="${p.imageUrl || './img/Ejemplo.jpg'}" alt="${p.name}" class="suggest-img">
                <span class="suggest-name">${p.name}</span>
            </div>
        `).join('');
    }
    box.style.display = 'block';
}

function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("active");
}

window.addEventListener("click", function (event) {
    const userIcon = document.querySelector(".user-avatar-icon");
    const menu = document.getElementById("dropdownMenu");

    if (userIcon && menu) {
        if (!userIcon.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.remove("active");
        }
    }
});

async function verificarAccesoAdmin() {
    const token = localStorage.getItem('token');
    const adminLink = document.getElementById('admin-link');

    if (!token || !adminLink) {
        console.warn("No se encontró el token o el ID 'admin-link' en el DOM.");
        return;
    }

    try {
        const res = await fetch(`${window.location.origin}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Error al consultar el perfil");

        const usuario = await res.json();

        if (usuario.role === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } catch (error) {
        console.error("Error verificando admin:", error);
    }
}