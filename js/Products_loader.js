const API_URL = `${window.location.origin}/api/products`;
const CAT_URL = `${window.location.origin}/api/categories`;

// ── Selectores ────────────────────────────────
const grid        = document.querySelector('.product-grid');
const selCategory = document.querySelectorAll('.filter-group select')[0];
const selPrice    = document.querySelectorAll('.filter-group select')[1];
const selRating   = document.querySelectorAll('.filter-group select')[2];

// ── Estado de filtros ─────────────────────────
let activeFilters = {
  category : '',
  minPrice : '',
  maxPrice : '',
  sort     : '',
};

// ── Utilidades ────────────────────────────────

/** Genera las estrellas según un rating 0-5 */
function renderStars(rating = 0) {
  const full  = Math.round(rating);
  const stars = '★'.repeat(full) + '☆'.repeat(5 - full);
  return stars;
}

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

/** Crea el HTML de una tarjeta de producto */
function createCard(product) {
  const article = document.createElement('article');
  article.className = 'card';
  article.dataset.id = product._id;

  const imgSrc = product.imageUrl || 'img/Ejemplo.jpg';
  const rating = product.rating ?? 0;
  const reviews = product.numReviews ?? 0;

  article.innerHTML = `
    <div class="card-img">
      <img src="${imgSrc}" alt="${product.name}" loading="lazy"
           onerror="this.src='img/Ejemplo.jpg'">
    </div>
    <div class="card-body">
      <h3>${product.name}</h3>
      <p class="stars">${renderStars(rating)} <span>(${reviews})</span></p>
      <p class="price">$${product.price.toFixed(2)}</p>
      <button class="btn-add" data-id="${product._id}">Agregar al carrito</button>
    </div>
  `;

  // Clic en la tarjeta → detalle del artículo
  article.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-add')) return; // lo maneja el botón
    window.location.href = `articulo.html?id=${product._id}`;
  });

  // Clic en "Agregar al carrito"
  article.querySelector('.btn-add').addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(product);
  });

  return article;
}

/** Agrega un producto al carrito (localStorage) */
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(i => i._id === product._id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  showToast(`"${product.name}" agregado al carrito ✓`);
}

/** Muestra un mensaje temporal en pantalla */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    Object.assign(toast.style, {
      position: 'fixed', bottom: '30px', right: '30px',
      background: '#4285f4', color: '#fff',
      padding: '12px 20px', borderRadius: '8px',
      fontSize: '0.9rem', fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999, transition: 'opacity 0.4s',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ── Renderizado principal ─────────────────────

function showSkeleton(n = 6) {
  grid.innerHTML = Array.from({ length: n }, () => `
    <article class="card" style="animation:pulse 1.2s infinite alternate">
      <div class="card-img" style="background:#e0e0e0"></div>
      <div class="card-body">
        <div style="height:16px;background:#e0e0e0;border-radius:4px;margin-bottom:10px"></div>
        <div style="height:12px;background:#e0e0e0;border-radius:4px;width:60%;margin-bottom:10px"></div>
        <div style="height:20px;background:#e0e0e0;border-radius:4px;width:40%"></div>
      </div>
    </article>
  `).join('');
}

function showError(msg) {
  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888">
      <p style="font-size:2rem">😕</p>
      <p>${msg}</p>
      <button onclick="loadProducts()"
        style="margin-top:16px;padding:10px 24px;background:#4285f4;color:#fff;
               border:none;border-radius:6px;cursor:pointer;font-weight:600">
        Reintentar
      </button>
    </div>`;
}

async function loadProducts() {
  showSkeleton();

  try {
    const url = buildUrl(activeFilters);
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

    const products = await res.json();

    grid.innerHTML = '';

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888">
          <p style="font-size:2rem">🔍</p>
          <p>No se encontraron productos con estos filtros.</p>
        </div>`;
      return;
    }

    products.forEach(p => grid.appendChild(createCard(p)));

  } catch (err) {
    console.error('Error al cargar productos:', err);
    showError('No se pudieron cargar los productos. Verifica tu conexión o que el servidor esté activo.');
  }
}

// ── Filtros ───────────────────────────────────

/** Carga las categorías reales desde la API */
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
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

// Opciones de precio
const priceOptions = [
  { label: 'Precio',        min: '',   max: ''    },
  { label: 'Menos de $50',  min: '0',  max: '50'  },
  { label: '$50 – $100',    min: '50', max: '100' },
  { label: '$100 – $200',   min: '100',max: '200' },
  { label: 'Más de $200',   min: '200',max: ''    },
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

// Eventos de filtros
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

selRating.addEventListener('change', () => {
  // Si tu API soporta filtro por rating agrégalo aquí.
  // Por ahora ordenamos de mayor a menor precio como ejemplo.
  const val = selRating.value;
  activeFilters.sort = val === 'Calificación' ? '' : val;
  loadProducts();
});

// ── Animación skeleton ────────────────────────
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes pulse {
    from { opacity: 1; }
    to   { opacity: 0.5; }
  }
`;
document.head.appendChild(styleEl);

// ── Init ──────────────────────────────────────
initPriceFilter();
loadCategories();
loadProducts();