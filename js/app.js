// Configuración
const API_URL = '/api.php';   // Cambiar si es necesario (ej: '/bettas.php')
const CDN_IMAGE_BASE = 'https://cdn.sitioz.com/imagenes/';

// Variables globales
let peces = [];
let cart = [];
let transportadoras = [];

// Elementos DOM
const fishContainer = document.getElementById('fishListContainer');
const searchInput = document.getElementById('searchInput');
const viewCartBtn = document.getElementById('viewCartBtn');
const cartModal = document.getElementById('cartModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalDisplay = document.getElementById('cartTotalDisplay');
const cartCounterSpan = document.getElementById('cartCounter');
const checkoutForm = document.getElementById('checkoutForm');
const transportadoraSelect = document.getElementById('transportadoraId');
const orderMessageDiv = document.getElementById('orderMessage');

// Funciones auxiliares
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return CDN_IMAGE_BASE + path.replace(/^\/+/, '');
}

function updateCartUI() {
    const totalItems = cart.length;
    cartCounterSpan.innerText = totalItems;
    if (cartModal.style.display === 'flex') renderCartModal();
}

function renderCartModal() {
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<div class="alert">Carrito vacío</div>';
        cartTotalDisplay.innerText = 'Total: $0';
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.precio;
        html += `
            <div class="cart-item">
                <div><strong>${escapeHtml(item.nombre)}</strong><br>$${item.precio.toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button data-idx="${idx}" data-delta="del">🗑️</button>
                </div>
            </div>
        `;
    });
    cartItemsList.innerHTML = html;
    cartTotalDisplay.innerText = `Total: $${total.toFixed(2)}`;

    document.querySelectorAll('.cart-item-qty button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            cart.splice(idx, 1);
            updateCartUI();
            renderCartModal();
            renderFishCatalog(searchInput.value);
        });
    });
}

function addToCart(pez) {
    if (cart.some(i => i.id === pez.id)) {
        alert('Este pez ya está en tu carrito. Solo puedes comprar un ejemplar de cada.');
        return false;
    }
    cart.push({
        id: pez.id,
        nombre: pez.nombre,
        precio: parseFloat(pez.precio),
        imagen: pez.imagen
    });
    updateCartUI();
    return true;
}

// API calls
async function loadPeces() {
    try {
        const res = await fetch(`${API_URL}/peces`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        peces = Array.isArray(data) ? data : [];
        renderFishCatalog(searchInput.value);
    } catch (err) {
        fishContainer.innerHTML = `<div class="loading">❌ Error cargando peces: ${err.message}</div>`;
    }
}

async function loadTransportadoras() {
    try {
        const res = await fetch(`${API_URL}/transportadoras`);
        const data = await res.json();
        transportadoras = Array.isArray(data) ? data : [];
        transportadoraSelect.innerHTML = '<option value="">Seleccione...</option>';
        transportadoras.forEach(t => {
            transportadoraSelect.innerHTML += `<option value="${t.id}">${escapeHtml(t.nombre)}</option>`;
        });
    } catch (err) {
        console.error('Error transportadoras:', err);
    }
}

// Renderizado de catálogo
function renderFishCatalog(filter = '') {
    if (!peces.length) {
        fishContainer.innerHTML = '<div class="loading">🐟 No hay peces disponibles en este momento.</div>';
        return;
    }
    const filtered = peces.filter(p => p.nombre.toLowerCase().includes(filter.toLowerCase()));
    if (filtered.length === 0) {
        fishContainer.innerHTML = '<div class="loading">No se encontraron bettas con ese nombre.</div>';
        return;
    }

    let html = '';
    filtered.forEach(pez => {
        const imagenCompleta = getImageUrl(pez.imagen);
        const imageHtml = imagenCompleta ? 
            `<img src="${escapeHtml(imagenCompleta)}" alt="${escapeHtml(pez.nombre)}">` : 
            '<div class="no-image">🐠</div>';
        const yaEnCarrito = cart.some(i => i.id === pez.id);
        html += `
            <div class="fish-card">
                <div class="fish-img">${imageHtml}</div>
                <div class="fish-info">
                    <div class="fish-name">${escapeHtml(pez.nombre)}</div>
                    <div class="fish-price">$${parseFloat(pez.precio).toFixed(2)}</div>
                    <button class="btn-add" data-id="${pez.id}" ${yaEnCarrito ? 'disabled style="background:#aaa; cursor:default;"' : ''}>
                        ${yaEnCarrito ? '✓ Ya agregado' : '➕ Agregar al carrito'}
                    </button>
                </div>
            </div>
        `;
    });
    fishContainer.innerHTML = html;

    document.querySelectorAll('.btn-add:not([disabled])').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const pez = peces.find(p => p.id === id);
            if (pez && addToCart(pez)) {
                btn.innerText = '✓ Ya agregado';
                btn.disabled = true;
            }
        });
    });
}

// Envío del pedido
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega peces antes de continuar.');
        return;
    }
    const nombre = document.getElementById('clienteNombre').value.trim();
    const email = document.getElementById('clienteEmail').value.trim();
    const telefono = document.getElementById('clienteTelefono').value.trim();
    const direccion = document.getElementById('clienteDireccion').value.trim();
    const transportadora_id = parseInt(transportadoraSelect.value);

    if (!nombre || !email || !direccion || !transportadora_id) {
        alert('Por favor completa: nombre, email, dirección y transportadora');
        return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert('Ingresa un email válido');
        return;
    }

    const items = cart.map(item => ({
        pez_id: item.id,
        precio_unitario: item.precio
    }));

    const payload = {
        cliente: { nombre, email, telefono, direccion },
        items: items,
        transportadora_id: transportadora_id
    };

    const submitBtn = checkoutForm.querySelector('.btn-primary');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Procesando...';
    submitBtn.disabled = true;
    orderMessageDiv.style.display = 'none';

    try {
        const res = await fetch(`${API_URL}/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            orderMessageDiv.style.display = 'block';
            orderMessageDiv.className = 'alert';
            orderMessageDiv.innerHTML = `✅ ¡Pedido exitoso! Factura #${result.numero_factura || result.factura_id}. Seguimiento: ${result.tracking}`;
            cart = [];
            updateCartUI();
            renderCartModal();
            checkoutForm.reset();
            await loadPeces(); // recargar catálogo
            setTimeout(() => {
                cartModal.style.display = 'none';
                orderMessageDiv.style.display = 'none';
            }, 4000);
        } else {
            throw new Error(result.message || 'Error en el servidor');
        }
    } catch (err) {
        orderMessageDiv.style.display = 'block';
        orderMessageDiv.className = 'alert';
        orderMessageDiv.style.background = '#ffe0e0';
        orderMessageDiv.innerHTML = `❌ ${err.message}`;
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});

// Eventos modales y búsqueda
viewCartBtn.onclick = () => {
    renderCartModal();
    cartModal.style.display = 'flex';
};
closeModalBtn.onclick = () => cartModal.style.display = 'none';
window.onclick = (e) => { if (e.target === cartModal) cartModal.style.display = 'none'; };
searchInput.addEventListener('input', (e) => renderFishCatalog(e.target.value));

// Inicialización
loadPeces();
loadTransportadoras();