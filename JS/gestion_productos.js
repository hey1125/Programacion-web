const API_URL = `${window.location.origin}`;

// ── Referencias DOM ──────────────────────────────────────────────────────────
const tablaBody        = document.getElementById("tabla-body");
const estadoTabla      = document.getElementById("estado-tabla");
const buscadorInput    = document.getElementById("buscador-input");
const filtroCategoria  = document.getElementById("filtro-categoria");
const modalOverlay     = document.getElementById("modal-overlay");
const modalTitulo      = document.getElementById("modal-titulo");
const btnNuevo         = document.getElementById("btn-nuevo");
const btnCancelar      = document.getElementById("btn-cancelar");
const btnGuardar       = document.getElementById("btn-guardar");

const campoId          = document.getElementById("producto-id");
const campoNombre      = document.getElementById("producto-nombre");
const campoDesc        = document.getElementById("producto-descripcion");
const campoCategoria      = document.getElementById("producto-categoria");
const campoNuevaCategoria = document.getElementById("nueva-categoria");
const campoPrecio      = document.getElementById("producto-precio");
const campoStock       = document.getElementById("producto-stock");
const campoImagen      = document.getElementById("producto-imagen");
const previewContainer = document.getElementById("preview-container");
const imagenPreview    = document.getElementById("imagen-preview");
const imagenActual     = document.getElementById("imagen-actual");

let todosLosProductos = [];
let imagenActualUrl   = ''; // URL de la imagen existente al editar

// Vista previa al seleccionar archivo
campoImagen.addEventListener('change', () => {
    const file = campoImagen.files[0];
    if (file) {
        imagenPreview.src = URL.createObjectURL(file);
        previewContainer.style.display = 'block';
    }
});

function getToken() {
    return localStorage.getItem("token");
}

// ── Cargar categorías en ambos <select> ──────────────────────────────────────
async function cargarCategorias() {
    try {
        const res = await fetch(`${API_URL}/api/categories`);
        if (!res.ok) return;

        const categorias = await res.json();

        categorias.forEach(cat => {
            // Filtro de la tabla
            const optFiltro = document.createElement("option");
            optFiltro.value = cat._id;
            optFiltro.textContent = cat.name;
            filtroCategoria.appendChild(optFiltro);

            // Modal de creación/edición
            const optModal = document.createElement("option");
            optModal.value = cat._id;
            optModal.textContent = cat.name;
            campoCategoria.appendChild(optModal);
        });

    } catch (error) {
        console.error("Error cargando categorías:", error);
    }
}

// ── Cargar productos desde la API ────────────────────────────────────────────
async function cargarProductos() {
    mostrarEstado("Cargando productos...");
    tablaBody.innerHTML = "";

    try {
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error("Error al cargar productos");

        todosLosProductos = await res.json();
        aplicarFiltros();

    } catch (error) {
        console.error(error);
        mostrarEstado("⚠️ Error al cargar los productos");
    }
}

// ── Renderizar filas en la tabla ─────────────────────────────────────────────
function renderProductos(productos) {
    tablaBody.innerHTML = "";

    if (!productos.length) {
        mostrarEstado("No se encontraron productos");
        return;
    }

    ocultarEstado();

    productos.forEach(product => {
        const categoriaNombre = product.category?.name || "Sin categoría";
        const imagen = product.imageUrl || "img/placeholder.jpg";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${imagen}" class="producto-img" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>${categoriaNombre}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="editar" data-id="${product._id}">✏️</button>
                <button class="eliminar" data-id="${product._id}">🗑️</button>
            </td>
        `;

        tr.querySelector(".editar").addEventListener("click", () => abrirEditar(product));
        tr.querySelector(".eliminar").addEventListener("click", () => eliminarProducto(product._id, tr));

        tablaBody.appendChild(tr);
    });
}

// ── Filtros: búsqueda por texto y categoría ───────────────────────────────────
function aplicarFiltros() {
    const texto     = buscadorInput.value.toLowerCase();
    const catId     = filtroCategoria.value;

    const filtrados = todosLosProductos.filter(p => {
        const coincideTexto = p.name.toLowerCase().includes(texto);
        const coincideCat   = !catId || p.category?._id === catId;
        return coincideTexto && coincideCat;
    });

    renderProductos(filtrados);
}

buscadorInput.addEventListener("input", aplicarFiltros);
filtroCategoria.addEventListener("change", aplicarFiltros);

// ── Modal: abrir para crear ───────────────────────────────────────────────────
btnNuevo.addEventListener("click", () => {
    modalTitulo.textContent  = "Nuevo Producto";
    campoId.value            = "";
    campoNombre.value        = "";
    campoDesc.value          = "";
    campoCategoria.value        = "";
    campoNuevaCategoria.value   = "";
    campoPrecio.value           = "";
    campoStock.value         = "";
    campoImagen.value        = '';
    imagenActualUrl          = '';
    previewContainer.style.display = 'none';
    imagenPreview.src        = '';
    modalOverlay.classList.add("active");
});

// ── Modal: abrir para editar ──────────────────────────────────────────────────
function abrirEditar(product) {
    modalTitulo.textContent  = "Editar Producto";
    campoId.value            = product._id;
    campoNombre.value        = product.name;
    campoDesc.value          = product.description || "";
    campoCategoria.value        = product.category?._id || "";
    campoNuevaCategoria.value   = "";
    campoPrecio.value        = product.price;
    campoStock.value         = product.stock;
    campoImagen.value        = '';
    imagenActualUrl          = product.imageUrl || '';
    if (imagenActualUrl) {
        imagenPreview.src        = imagenActualUrl;
        imagenActual.textContent = 'Imagen actual (sube una nueva para reemplazarla)';
        previewContainer.style.display = 'block';
    } else {
        previewContainer.style.display = 'none';
    }
    modalOverlay.classList.add("active");
}

// ── Modal: cerrar ─────────────────────────────────────────────────────────────
btnCancelar.addEventListener("click", () => modalOverlay.classList.remove("active"));
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove("active");
});

// ── Crear categoría nueva en la API ──────────────────────────────────────────
async function crearCategoria(nombre) {
    const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ name: nombre })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Error al crear la categoría');
    }

    // Agregar la nueva categoría a ambos <select> para usarla de inmediato
    [filtroCategoria, campoCategoria].forEach(select => {
        const opt = document.createElement('option');
        opt.value       = data._id;
        opt.textContent = data.name;
        select.appendChild(opt);
    });

    return data._id;
}

// ── Guardar producto (crear o actualizar) ─────────────────────────────────────
btnGuardar.addEventListener("click", async () => {
    const id = campoId.value.trim();

    const nombre    = campoNombre.value.trim();
    let   categoria = campoCategoria.value;
    const precio    = parseFloat(campoPrecio.value);
    const stock     = parseInt(campoStock.value);

    if (!nombre || (!categoria && !campoNuevaCategoria.value.trim()) || isNaN(precio) || isNaN(stock)) {
        alert("Completa los campos obligatorios: nombre, categoría, precio y stock");
        return;
    }

    // Si escribió una nueva categoría, crearla primero
    const nombreNuevaCat = campoNuevaCategoria.value.trim();
    if (nombreNuevaCat) {
        try {
            categoria = await crearCategoria(nombreNuevaCat);
            campoNuevaCategoria.value = '';
        } catch (err) {
            alert(err.message);
            return;
        }
    }

    // Usar FormData para poder enviar el archivo
    const formData = new FormData();
    formData.append('name',        nombre);
    formData.append('description', campoDesc.value.trim());
    formData.append('category',    categoria);
    formData.append('price',       precio);
    formData.append('stock',       stock);

    if (campoImagen.files[0]) {
        formData.append('image', campoImagen.files[0]);
    }

    try {
        const url    = id ? `${API_URL}/api/products/${id}` : `${API_URL}/api/products`;
        const method = id ? 'PUT' : 'POST';

        // No incluir Content-Type: el navegador lo setea automáticamente con el boundary correcto
        const res = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error al guardar el producto");
            return;
        }

        modalOverlay.classList.remove("active");
        await cargarProductos();

    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
});

// ── Eliminar producto ─────────────────────────────────────────────────────────
async function eliminarProducto(id, fila) {
    if (!confirm("¿Desea eliminar este producto?")) return;

    try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error al eliminar el producto");
            return;
        }

        fila.remove();

        // Actualizar lista en memoria
        todosLosProductos = todosLosProductos.filter(p => p._id !== id);

        if (!tablaBody.querySelector("tr")) {
            mostrarEstado("No hay productos registrados");
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
}

// ── Helpers de estado ─────────────────────────────────────────────────────────
function mostrarEstado(msg) {
    estadoTabla.textContent = msg;
    estadoTabla.style.display = "block";
}

function ocultarEstado() {
    estadoTabla.style.display = "none";
}

// ── Inicio ────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    await cargarCategorias();
    await cargarProductos();
});