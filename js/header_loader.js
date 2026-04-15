document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.getElementById('header-placeholder');

    if (headerContainer) {
        fetch('header.html')
            .then(response => {
                if (!response.ok) throw new Error("No se pudo encontrar el archivo header.html");
                return response.text();
            })
            .then(data => {
                headerContainer.innerHTML = data;
                // Una vez cargado el HTML, inicializamos la lógica del buscador
                initBuscadorRealTime();
            })
            .catch(error => console.error('Error cargando el header:', error));
    } else {
        console.error("No se encontró un elemento con el ID 'header-placeholder' en el HTML.");
    }
});

/** * Lógica para el buscador con sugerencias desplegables 
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
            // Usamos la URL de tu API (ajusta el puerto si es necesario)
            const response = await fetch(`http://localhost:5000/api/products?name=${encodeURIComponent(query)}`);
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

/** * Crea los elementos dentro del menú desplegable 
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

window.addEventListener("click", function(event) {
    
    const userIcon = document.querySelector(".user-avatar-icon");
    const menu = document.getElementById("dropdownMenu");

    
    if (userIcon && menu) {
        if (!userIcon.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.remove("active");
        }
    }
});