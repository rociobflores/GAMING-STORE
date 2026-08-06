// ── CARRITO ──────────────────────────────────────────────
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarContador() {
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const contador = document.getElementById('carrito-contador');
  if (contador) {
    contador.textContent = total;
    contador.style.display = total > 0 ? 'flex' : 'none';
  }
}

function agregarAlCarrito(id, nombre, precio) {
  const existente = carrito.find(item => item.id === id);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1 });
  }
  guardarCarrito();
  actualizarContador();
  renderCarritoPanel();
  mostrarToast(`${nombre} agregado al carrito 🛒`);
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  guardarCarrito();
  actualizarContador();
  renderCarritoPanel();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    eliminarDelCarrito(id);
    return;
  }
  guardarCarrito();
  actualizarContador();
  renderCarritoPanel();
}

function mostrarToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 30px; right: 30px;
      background: #ff72b6; color: white;
      padding: 14px 24px; border-radius: 12px;
      font-family: Lexend, sans-serif; font-size: 14px;
      z-index: 9999; opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: 0 4px 20px rgba(255,114,182,0.4);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => toast.style.opacity = '0', 2500);
}

// ── PANEL CARRITO ─────────────────────────────────────────
function crearPanelCarrito() {
  if (document.getElementById('carrito-panel')) return;

  const overlay = document.createElement('div');
  overlay.id = 'carrito-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 2000; opacity: 0;
    transition: opacity 0.3s ease;
    display: none;
  `;
  overlay.addEventListener('click', cerrarCarrito);

  const panel = document.createElement('div');
  panel.id = 'carrito-panel';
  panel.style.cssText = `
    position: fixed; top: 0; right: -420px;
    width: 400px; height: 100vh;
    background: white;
    z-index: 2001;
    display: flex; flex-direction: column;
    transition: right 0.3s ease;
    box-shadow: -4px 0 20px rgba(0,0,0,0.15);
    font-family: Lexend, sans-serif;
  `;

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid #f0f0f0;">
      <h2 style="margin:0;font-size:1.2rem;font-family:Unbounded,sans-serif;">🛒 Tu carrito</h2>
      <button onclick="cerrarCarrito()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;">✕</button>
    </div>
    <div id="carrito-items" style="flex:1;overflow-y:auto;padding:20px;"></div>
    <div id="carrito-footer" style="padding:20px;border-top:1px solid #f0f0f0;"></div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);
}

function renderCarritoPanel() {
  const itemsEl = document.getElementById('carrito-items');
  const footerEl = document.getElementById('carrito-footer');
  if (!itemsEl || !footerEl) return;

  if (carrito.length === 0) {
    itemsEl.innerHTML = `<p style="text-align:center;color:#aaa;margin-top:40px;">Tu carrito está vacío 🛍️</p>`;
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = carrito.map(item => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f9f9f9;">
      <div style="flex:1;">
        <p style="margin:0;font-size:0.85rem;font-weight:600;color:#333;">${item.nombre}</p>
        <p style="margin:4px 0 0;font-size:0.8rem;color:#ff72b6;">$${item.precio.toLocaleString('es-AR')}</p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button onclick="cambiarCantidad(${item.id}, -1)" style="width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:white;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">−</button>
        <span style="font-size:0.9rem;font-weight:600;min-width:20px;text-align:center;">${item.cantidad}</span>
        <button onclick="cambiarCantidad(${item.id}, 1)" style="width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:white;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">+</button>
        <button onclick="eliminarDelCarrito(${item.id})" style="width:28px;height:28px;border-radius:50%;border:none;background:#fff0f0;cursor:pointer;font-size:0.8rem;color:#ff4444;display:flex;align-items:center;justify-content:center;">✕</button>
      </div>
    </div>
  `).join('');

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  footerEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
      <span style="font-weight:600;">Total</span>
      <span style="font-weight:700;color:#ff72b6;font-size:1.1rem;">$${total.toLocaleString('es-AR')}</span>
    </div>
    <button style="width:100%;padding:16px;background:linear-gradient(90deg,#FF8FB7,#FF85BB);color:white;border:none;border-radius:12px;font-family:Lexend,sans-serif;font-size:1rem;cursor:pointer;" onclick="mostrarToast('¡Gracias por tu compra! 💖')">
      Finalizar compra
    </button>
  `;
}

function abrirCarrito() {
  const panel = document.getElementById('carrito-panel');
  const overlay = document.getElementById('carrito-overlay');
  if (!panel || !overlay) return;
  renderCarritoPanel();
  overlay.style.display = 'block';
  setTimeout(() => {
    overlay.style.opacity = '1';
    panel.style.right = '0';
  }, 10);
}

function cerrarCarrito() {
  const panel = document.getElementById('carrito-panel');
  const overlay = document.getElementById('carrito-overlay');
  if (!panel || !overlay) return;
  overlay.style.opacity = '0';
  panel.style.right = '-420px';
  setTimeout(() => overlay.style.display = 'none', 300);
}

// ── CARGAR PRODUCTOS DESDE JSON ───────────────────────────
async function cargarProductos() {
  try {
    const res = await fetch('products.json');
    const productos = await res.json();
    renderDestacados(productos.filter(p => p.categoria === 'destacado'));
    renderNewCollection(productos.filter(p => p.categoria === 'new'));
    renderProductos(productos.filter(p => p.categoria === 'productos'));
    window._todosLosProductos = productos;
  } catch (e) {
    console.error('Error cargando productos:', e);
  }
}

function crearCard(p, claseArticle) {
  const art = document.createElement('article');
  art.className = claseArticle;
  art.dataset.nombre = p.nombre.toLowerCase();
  art.innerHTML = `
    <img src="${p.img}" alt="${p.nombre}">
    <h3>${p.nombre}</h3>
    <p class="precio">$${p.precio.toLocaleString('es-AR')}</p>
    <button onclick="agregarAlCarrito(${p.id}, '${p.nombre}', ${p.precio})">AÑADIR</button>
  `;
  return art;
}

function renderDestacados(productos) {
  const cont = document.querySelector('.destacados-contenedor');
  if (!cont) return;
  cont.innerHTML = '';
  productos.forEach(p => cont.appendChild(crearCard(p, 'productoD')));
}

function renderNewCollection(productos) {
  const cont = document.querySelector('.productosnc-contenedor');
  if (!cont) return;
  cont.innerHTML = '';
  productos.forEach(p => cont.appendChild(crearCard(p, 'productos-nc')));
}

function renderProductos(productos) {
  const cont = document.querySelector('.productos-contenedor');
  if (!cont) return;
  cont.innerHTML = '';
  productos.forEach(p => cont.appendChild(crearCard(p, 'productosS')));
}

// ── BUSCADOR ──────────────────────────────────────────────
function initBuscador() {
  const input = document.getElementById('buscador');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    const todos = window._todosLosProductos || [];
    if (!q) {
      renderDestacados(todos.filter(p => p.categoria === 'destacado'));
      renderNewCollection(todos.filter(p => p.categoria === 'new'));
      renderProductos(todos.filter(p => p.categoria === 'productos'));
      return;
    }
    const filtrados = todos.filter(p => p.nombre.toLowerCase().includes(q));
    renderDestacados([]);
    renderNewCollection([]);
    renderProductos(filtrados);
    if (filtrados.length === 0) {
      const cont = document.querySelector('.productos-contenedor');
      if (cont) cont.innerHTML = '<p style="text-align:center;font-family:Lexend;padding:2rem;color:#ff72b6">No se encontraron productos.</p>';
    }
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ── VALIDACIÓN DEL FORMULARIO ─────────────────────────────
function initFormulario() {
  const form = document.querySelector('.form-contacto');
  if (!form) return;
  const boton = form.querySelector('.boton-enviar');
  boton.addEventListener('click', (e) => {
    e.preventDefault();
    const nombre = form.querySelector('input[placeholder="nombre"]');
    const apellido = form.querySelector('input[placeholder="apellido"]');
    const email = form.querySelector('input[type="email"]');
    const select = form.querySelector('select');
    const mensaje = form.querySelector('textarea');
    let valido = true;
    [nombre, apellido, email, mensaje].forEach(campo => {
      if (!campo.value.trim()) {
        campo.style.borderColor = '#ff72b6';
        valido = false;
      } else {
        campo.style.borderColor = 'rgba(255,255,255,0.1)';
      }
    });
    if (select.value === 'Selecciona una opción...') {
      select.style.borderColor = '#ff72b6';
      valido = false;
    } else {
      select.style.borderColor = 'rgba(255,255,255,0.1)';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      email.style.borderColor = '#ff72b6';
      valido = false;
    }
    if (valido) {
      mostrarToast('¡Mensaje enviado! Gracias por contactarnos 💌');
      form.reset();
    } else {
      mostrarToast('Por favor completá todos los campos ⚠️');
    }
  });
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  crearPanelCarrito();
  actualizarContador();
  cargarProductos();
  initBuscador();
  initFormulario();

  const carritoBtn = document.querySelector('.carrito-btn');
  if (carritoBtn) carritoBtn.addEventListener('click', abrirCarrito);
});