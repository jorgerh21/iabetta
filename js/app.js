// Configuración
const API_URL = 'https://api.sitioz.com/bettas.php';        // Cambiar si el archivo PHP tiene otro nombre
const CDN_IMAGE_BASE = 'https://cdn.sitioz.com/';

let peces = [];
let cart = [];
let transportadoras = [];

// Elementos del DOM
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

// Helper imagen
function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return CDN_IMAGE_BASE + path.replace(/^\/+/, '');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, (m) => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Carrito
function updateCartUI() {
    const totalItems = cart.length;
    cartCounterSpan.innerText = totalItems;
    if (cartModal.style.display === 'flex') renderCartModal();
}

function renderCartModal() {
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<div class="alert" style="text-align:center;">🛒 Tu carrito está vacío</div>';
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
                    <button data-idx="${idx}" data-delta="del"><i class="fas fa-trash-alt"></i></button>
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
        alert('Este betta ya está en tu carrito. Solo puedes comprar un ejemplar por pedido.');
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

// API
async function loadPeces() {
    try {
        const res = await fetch(`${API_URL}/peces`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        peces = Array.isArray(data) ? data : [];
        renderFishCatalog(searchInput.value);
    } catch (err) {
        fishContainer.innerHTML = `<div class="loading-spinner"><i class="fas fa-exclamation-triangle"></i> Error: ${err.message}</div>`;
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

// Render galería
function renderFishCatalog(filter = '') {
    if (!peces.length) {
        fishContainer.innerHTML = '<div class="loading-spinner">🐟 No hay peces disponibles en este momento.</div>';
        return;
    }
    const filtered = peces.filter(p => p.nombre.toLowerCase().includes(filter.toLowerCase()));
    if (filtered.length === 0) {
        fishContainer.innerHTML = '<div class="loading-spinner">No se encontraron bettas con ese nombre.</div>';
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
                    <button class="btn-add" data-id="${pez.id}" ${yaEnCarrito ? 'disabled style="background:#adb5bd;"' : ''}>
                        ${yaEnCarrito ? '<i class="fas fa-check"></i> Agregado' : '<i class="fas fa-cart-plus"></i> Agregar'}
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
                btn.innerHTML = '<i class="fas fa-check"></i> Agregado';
                btn.disabled = true;
                btn.style.background = '#adb5bd';
            }
        });
    });
}

// Enviar pedido
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
        alert('Agrega al menos un betta para continuar.');
        return;
    }
    const nombre = document.getElementById('clienteNombre').value.trim();
    const email = document.getElementById('clienteEmail').value.trim();
    const telefono = document.getElementById('clienteTelefono').value.trim();
    const direccion = document.getElementById('clienteDireccion').value.trim();
    const transportadora_id = parseInt(transportadoraSelect.value);

    if (!nombre || !email || !direccion || !transportadora_id) {
        alert('Completa todos los campos obligatorios.');
        return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert('Email inválido.');
        return;
    }
    const items = cart.map(item => ({ pez_id: item.id, precio_unitario: item.precio }));
    const payload = { cliente: { nombre, email, telefono, direccion }, items, transportadora_id };

    const submitBtn = checkoutForm.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Procesando...';
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
            orderMessageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ¡Pedido exitoso! Factura #${result.numero_factura || result.factura_id}. Seguimiento: ${result.tracking}`;
            cart = [];
            updateCartUI();
            renderCartModal();
            checkoutForm.reset();
            await loadPeces();
            setTimeout(() => {
                cartModal.style.display = 'none';
                orderMessageDiv.style.display = 'none';
            }, 5000);
        } else {
            throw new Error(result.message || 'Error en el servidor');
        }
    } catch (err) {
        orderMessageDiv.style.display = 'block';
        orderMessageDiv.className = 'alert';
        orderMessageDiv.style.background = '#ffe0e0';
        orderMessageDiv.style.color = '#c00';
        orderMessageDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${err.message}`;
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Eventos modales
viewCartBtn.onclick = () => {
    renderCartModal();
    cartModal.style.display = 'flex';
};
closeModalBtn.onclick = () => cartModal.style.display = 'none';
window.onclick = (e) => { if (e.target === cartModal) cartModal.style.display = 'none'; };
searchInput.addEventListener('input', (e) => renderFishCatalog(e.target.value));

// Inicio
loadPeces();
loadTransportadoras();