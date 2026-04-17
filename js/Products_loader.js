const API_URL = `${window.location.origin}/api/products`;
const CAT_URL = `${window.location.origin}/api/categories`;

// ── Selectores ────────────────────────────────
const grid        = document.querySelector('.product-grid');
const selCategory = document.querySelectorAll('.filter-group select')[0];
const selPrice    = document.querySelectorAll('.filter-group select')[1];
// Eliminamos selRating porque ya no existe el filtro de calificación

// ── Estado de filtros ─────────────────────────
let activeFilters = {
  
  minPrice : '',
  maxPrice : '',
  sort     : '',
};

// ── Utilidades ────────────────────────────────

/** Construye la URL con los query params activos */
function buildUrl(filters) {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.sort)     params.append('sort', filters.sort);
  const qs = params.toString();
  return qs ? `${API_URL}?${qs}` : API_URL;
}

/** Crea el HTML de una tarjeta de producto (Sin Calificación) */
function createCard(product) {
  const article = document.createElement('article');
  article.className = 'card';
  article.dataset.id = product._id;

  const imgSrc = product.imageUrl || 'img/Ejemplo.jpg';

  article.innerHTML = `
    <div class="card-img">
      <img src="${imgSrc}" alt="${product.name}" loading="lazy"
           onerror="this.src='img/Ejemplo.jpg'">
    </div>
    <div class="card-body">
      <h3>${product.name}</h3>
      <p class="price">$${product.price.toFixed(2)}</p>
      <button class="btn-add" data-id="${product._id}">Agregar al carrito</button>
    </div>
  `;

  // Clic en la tarjeta → detalle del artículo
  article.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-add')) return; 
    window.location.href = `articulo.html?id=${product._id}`;
  });

  // Clic en "Agregar al carrito" (Ahora usa la API)
  article.querySelector('.btn-add').addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(product);
  });

  return article;
}

/** Agrega un producto al carrito (Vía API) */
async function addToCart(product) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Debes iniciar sesión para comprar.");
    return;
  }

  try {
    const res = await fetch(`${window.location.origin}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: product._id, quantity: 1 })
    });

    if (res.ok) {
      showToast(`"${product.name}" agregado al carrito ✓`);
    } else {
      throw new Error("Error al agregar");
    }
  } catch (error) {
    console.error(error);
  }
}

/** Muestra un mensaje temporal */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    Object.assign(toast.style, {
      position: 'fixed', bottom: '30px', right: '30px',
      background: '#222', color: '#fff',
      padding: '12px 20px', borderRadius: '8px',
      fontSize: '0.9rem', fontWeight: '600',
      zIndex: 9999, transition: 'opacity 0.4s',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ── Renderizado y Filtros ─────────────────────

async function loadProducts() {
  grid.innerHTML = '<p>Cargando...</p>'; // Skeleton simplificado
  try {
    const url = buildUrl(activeFilters);
    const res = await fetch(url);
    const products = await res.json();
    grid.innerHTML = '';
    if (products.length === 0) {
      grid.innerHTML = '<p>No hay productos.</p>';
      return;
    }
    products.forEach(p => grid.appendChild(createCard(p)));
  } catch (err) {
    grid.innerHTML = '<p>Error al cargar productos.</p>';
  }
}

async function loadCategories() {
  try {
    const res = await fetch(CAT_URL); 
    if (!res.ok) return;
    const categories = await res.json();
    selCategory.innerHTML = '<option value="">Categoría</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat._id;
      opt.textContent = cat.name;
      selCategory.appendChild(opt);
    });
  } catch (error) { console.error(error); }
}

const priceOptions = [
  { label: 'Precio',       min: '',   max: ''    },
  { label: 'Menos de $50',  min: '0',  max: '50'  },
  { label: '$50 – $100',    min: '50', max: '100' },
  { label: 'Más de $100',   min: '100',max: ''    },
];

function initPriceFilter() {
  selPrice.innerHTML = '';
  priceOptions.forEach((opt, i) => {
    const el = document.createElement('option');
    el.value = i;
    el.textContent = opt.label;
    selPrice.appendChild(el);
  });
}

selCategory.addEventListener('change', () => {
  activeFilters.category = selCategory.value;
  loadProducts();
});

selPrice.addEventListener('change', () => {
  const opt = priceOptions[selPrice.value];
  activeFilters.minPrice = opt.min;
  activeFilters.maxPrice = opt.max;
  loadProducts();
});

// ── Init ──────────────────────────────────────
initPriceFilter();
loadCategories();
loadProducts();