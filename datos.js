/* ====================================================================
   datos.js · Capa de datos de IMPORTADORA PALIAO
   La usan la tienda (index.html) y el panel (admin.html).
     · Con config.js lleno  → Firebase (datos reales, compartidos por todos).
     · Con config.js vacío  → MODO DEMOSTRACIÓN (datos solo en este navegador).
   ==================================================================== */
(function () {
'use strict';

const CFG = window.PALIO_CONFIG || {};
const FB = Object.assign({}, CFG.firebase || {});
['apiKey', 'authDomain', 'projectId', 'appId'].forEach(k => { FB[k] = String(FB[k] || '').trim(); });
const DOMINIO_USUARIOS = String(CFG.dominioUsuarios || 'palio.app').trim().replace(/^@/, '');
const MODO = FB.apiKey.length > 10 && FB.projectId ? 'firebase' : 'demo';

/* ---------------------------------------------------------------- utilidades */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dinero = n => '$' + Math.round(Number(n) || 0).toLocaleString('es-CO');
const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
const entero = v => { const n = Math.round(Number(String(v ?? '').replace(/[^\d.-]/g, ''))); return Number.isFinite(n) ? n : NaN; };
const fecha = iso => { try { return new Date(iso).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return String(iso || ''); } };
const telWA = tel => { let d = String(tel || '').replace(/\D/g, ''); if (d.length === 10 && d[0] === '3') d = '57' + d; return 'https://wa.me/' + d; };
const AJUSTES_BASE = {
  id: 1, nombre_tienda: 'IMPORTADORA PALIAO', eslogan: 'ENTRETENEMOS TU MUNDO', correo_pedidos: 'importadorapaliao306@gmail.com', whatsapp: '',
  nota_envio: 'El costo del envío se confirma contigo antes de despachar.',
  metodos_pago: ['Contra entrega', 'Transferencia', 'Nequi', 'Daviplata'],
  instrucciones_pago: ''
};

/* ------------------------------------------------------------------- iconos */
const ICONOS = {
  gamepad: '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><circle cx="15" cy="13" r="1"/><circle cx="18" cy="11" r="1"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z"/>',
  disc: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 7.07 2.93"/>',
  headset: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  ghost: '<path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  tv: '<rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  keyboard: '<path d="M10 8h.01M12 12h.01M14 8h.01M16 12h.01M18 8h.01M6 8h.01M7 16h10M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  mouse: '<rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 6v4"/>',
  box: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
  shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  tienda: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  ajustes: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>'
};
const ICONOS_CATEGORIA = ['gamepad', 'disc', 'headset', 'ghost', 'card', 'tv', 'monitor', 'keyboard', 'mouse', 'box', 'shirt', 'gift', 'star'];
const ico = (n, s = 22) => `<svg class="ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n] || ''}</svg>`;

/* imagen de respaldo cuando un producto no tiene foto: ícono dorado sobre fondo oscuro */
function arte(nombreIcono) {
  const icon = ICONOS[nombreIcono] || ICONOS.gamepad;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="g" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#2d2311"/><stop offset="1" stop-color="#0a0804"/></radialGradient><pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#d4af37" stroke-opacity=".08"/></pattern></defs><rect width="400" height="400" fill="url(#g)"/><rect width="400" height="400" fill="url(#p)"/><circle cx="200" cy="200" r="135" fill="none" stroke="#d4af37" stroke-opacity=".18"/><g transform="translate(116 116) scale(7)" fill="none" stroke="#d4af37" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${icon}</g></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ------------------------------------------------- fotos: recorte cuadrado */
function cargarImagen(file) {
  return new Promise((ok, mal) => {
    const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => { URL.revokeObjectURL(u); ok(im); };
    im.onerror = () => { URL.revokeObjectURL(u); mal(new Error('No se pudo leer esa imagen. Prueba con otra foto (JPG, PNG o WebP).')); };
    im.src = u;
  });
}
/* Recorta al centro en cuadrado y reduce: así la foto se ve igual en el panel y en la tienda y pesa poco (se guarda dentro de la base de datos). */
async function reducirImagen(file, lado = 480, calidad = 0.8) {
  if (!file || !/^image\//.test(file.type)) throw new Error('Elige un archivo de imagen (JPG, PNG o WebP).');
  if (file.size > 25 * 1024 * 1024) throw new Error('La imagen es demasiado pesada (máximo 25 MB).');
  const im = await cargarImagen(file);
  const w = im.naturalWidth, h = im.naturalHeight, s = Math.min(w, h);
  const cv = document.createElement('canvas'); cv.width = cv.height = lado;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#0b0905'; cx.fillRect(0, 0, lado, lado);
  cx.imageSmoothingQuality = 'high';
  cx.drawImage(im, (w - s) / 2, (h - s) / 2, s, s, 0, 0, lado, lado);
  return new Promise((ok, mal) => cv.toBlob(b => b ? ok(b) : mal(new Error('No se pudo procesar la imagen.')), 'image/jpeg', calidad));
}
const blobADataURL = blob => new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => mal(new Error('No se pudo leer la imagen.')); r.readAsDataURL(blob); });

/* --------------------------------------------- validación común de productos */
function limpiarProducto(p) {
  const o = {};
  if ('categoria_id' in p) { if (!p.categoria_id) throw new Error('Elige una categoría.'); o.categoria_id = p.categoria_id; }
  if ('nombre' in p) { o.nombre = String(p.nombre || '').trim().slice(0, 120); if (!o.nombre) throw new Error('Escribe el nombre del producto.'); }
  if ('detalle' in p) o.detalle = String(p.detalle || '').trim().slice(0, 200);
  if ('precio' in p) { o.precio = entero(p.precio); if (!(o.precio >= 0 && o.precio <= 100000000)) throw new Error('Revisa el precio: debe ser un número entre 0 y 100.000.000.'); }
  if ('stock' in p) { o.stock = entero(p.stock); if (!(o.stock >= 0 && o.stock <= 1000000)) throw new Error('Revisa el stock: debe ser un número entero de 0 en adelante.'); }
  if ('etiqueta' in p) o.etiqueta = String(p.etiqueta || '').trim().slice(0, 20) || null;
  if ('imagen_url' in p) o.imagen_url = p.imagen_url || null;
  if ('imagen_path' in p) o.imagen_path = p.imagen_path || null;
  if ('activo' in p) o.activo = !!p.activo;
  return o;
}
function limpiarCategoria(c) {
  const o = {};
  if ('nombre' in c) { o.nombre = String(c.nombre || '').trim().slice(0, 40); if (!o.nombre) throw new Error('Escribe el nombre de la categoría.'); }
  if ('icono' in c) o.icono = ICONOS_CATEGORIA.includes(c.icono) ? c.icono : 'gamepad';
  return o;
}
function limpiarAjustes(a) {
  const o = {};
  if ('nombre_tienda' in a) { o.nombre_tienda = String(a.nombre_tienda || '').trim().slice(0, 60); if (!o.nombre_tienda) throw new Error('Escribe el nombre de la tienda.'); }
  if ('eslogan' in a) o.eslogan = String(a.eslogan || '').trim().slice(0, 60);
  if ('correo_pedidos' in a) {
    o.correo_pedidos = String(a.correo_pedidos || '').trim().slice(0, 120);
    if (o.correo_pedidos && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.correo_pedidos) && !/^https?:\/\//.test(o.correo_pedidos) && !/^[a-f0-9]{16,}$/i.test(o.correo_pedidos))
      throw new Error('El correo de pedidos no parece válido.');
  }
  if ('whatsapp' in a) o.whatsapp = String(a.whatsapp || '').replace(/[^\d]/g, '').slice(0, 15);
  if ('nota_envio' in a) o.nota_envio = String(a.nota_envio || '').trim().slice(0, 200);
  if ('instrucciones_pago' in a) o.instrucciones_pago = String(a.instrucciones_pago || '').replace(/\r/g, '').trim().slice(0, 600);
  if ('metodos_pago' in a) {
    o.metodos_pago = [...new Set((a.metodos_pago || []).map(x => String(x).trim().slice(0, 30)).filter(Boolean))].slice(0, 8);
    if (!o.metodos_pago.length) throw new Error('Deja al menos un método de pago.');
  }
  return o;
}
/* Inventario: las unidades salen SOLO cuando tú confirmas el pago. Si reversas el pago o cancelas un pedido ya pagado, vuelven.
   Despachar o dejar el pedido en "nuevo" no toca el inventario. Devuelve qué hacer con el stock y qué campos cambiar. */
function planPedido(p, cambio) {
  const pagado = p.pago_estado === 'confirmado', desc = !!p.stock_descontado;
  if (cambio.tipo === 'estado') {
    if (!['nuevo', 'despachado', 'cancelado'].includes(cambio.estado)) throw new Error('Estado no válido.');
    if (p.estado === 'cancelado' && cambio.estado !== 'cancelado') throw new Error('Un pedido cancelado no se puede reactivar.');
    if (cambio.estado === p.estado) return { campos: {}, stock: null };
    return { campos: { estado: cambio.estado }, stock: cambio.estado === 'cancelado' && desc ? 'devolver' : null };
  }
  if (p.estado === 'cancelado') throw new Error('Este pedido está cancelado: ya no se puede modificar.');
  if (cambio.tipo === 'pagar') {
    if (pagado) throw new Error('Este pedido ya tiene el pago confirmado.');
    return {
      campos: { pago_estado: 'confirmado', pago_metodo: String(cambio.metodo || '').trim().slice(0, 40), pago_ref: String(cambio.ref || '').trim().slice(0, 80), pago_fecha: new Date().toISOString() },
      stock: desc ? null : 'descontar'
    };
  }
  if (cambio.tipo === 'reversar') {
    if (!pagado) throw new Error('Este pedido no tiene un pago confirmado.');
    return { campos: { pago_estado: 'pendiente', pago_metodo: '', pago_ref: '', pago_fecha: null }, stock: desc ? 'devolver' : null };
  }
  throw new Error('Acción no válida.');
}
const resumenStock = (st, cortos) => ({ stock: st === 'descontar' ? 'descontado' : st === 'devolver' ? 'devuelto' : null, cortos: cortos || [] });
function unirLineas(items) {            // suma cantidades si un producto aparece dos veces
  const m = new Map();
  (items || []).forEach(it => { const x = m.get(it.id); if (x) x.cantidad += it.cantidad; else m.set(it.id, { id: it.id, nombre: it.nombre, cantidad: it.cantidad }); });
  return [...m.values()];
}
const ordenarCats = cs => cs.slice().sort((a, b) => (a.orden - b.orden) || String(a.creado).localeCompare(String(b.creado)));
const nuevosPrimero = ps => ps.slice().sort((a, b) => String(b.creado).localeCompare(String(a.creado)));

/* ===================================================================
   MODO DEMOSTRACIÓN (todo en localStorage de este navegador)
   =================================================================== */
/* ---- documento: cotización / comprobante de pago ----
   Un solo constructor para todo: el texto de WhatsApp, el asunto y los campos del correo y el papel que ves en el panel.
   Mientras el pago no esté confirmado es una COTIZACIÓN; al confirmarlo pasa a COMPROBANTE DE PAGO.
   (No es factura electrónica de la DIAN: es un soporte interno del pedido.) */
function documento(o, aj) {
  aj = aj || {}; o = o || {};
  const c = o.cliente || {}, its = o.items || [], pagado = o.pago_estado === 'confirmado';
  const tienda = aj.nombre_tienda || 'IMPORTADORA PALIAO';
  const titulo = pagado ? 'COMPROBANTE DE PAGO' : 'COTIZACIÓN';
  const estado = pagado ? 'PAGADO' : 'PENDIENTE DE PAGO';
  const lin = it => `${it.cantidad} × ${it.nombre} — ${dinero(it.precio * it.cantidad)}`;
  const pagoCli = c.pago || '—';
  const dir = [c.ciudad, c.direccion].filter(Boolean).join(' · ');
  const L = [];
  L.push(`*${tienda}*`, `*${titulo}* · ${estado}`, `Código: *${o.codigo}*`, `Fecha: ${fecha(o.creado)}`, '');
  L.push('*Cliente*', c.nombre || '—', `Cel: ${c.telefono || '—'}${c.correo ? ' · ' + c.correo : ''}`, dir || '—');
  if (c.notas) L.push(`Notas: ${c.notas}`);
  L.push('', '*Productos*', ...its.map(lin), '', `*TOTAL: ${dinero(o.total)}*`, '');
  if (pagado) {
    L.push(`Pago confirmado${o.pago_metodo ? ' por ' + o.pago_metodo : ''}${o.pago_ref ? ' · ref. ' + o.pago_ref : ''}${o.pago_fecha ? ' · ' + fecha(o.pago_fecha) : ''}.`);
  } else {
    L.push(`Forma de pago elegida: ${pagoCli}`);
    if (aj.instrucciones_pago) L.push('', '*Cómo pagar*', aj.instrucciones_pago);
    L.push('', 'Las unidades salen del inventario cuando el pago esté confirmado.');
  }
  const campos = [
    ['Documento', `${titulo} · ${estado}`], ['Pedido', o.codigo], ['Fecha', fecha(o.creado)],
    ['Cliente', c.nombre || '—'], ['Celular', c.telefono || '—'], ['Correo del cliente', c.correo || '—'],
    ['Ciudad', c.ciudad || '—'], ['Dirección', c.direccion || '—'], ['Forma de pago elegida', pagoCli], ['Notas', c.notas || '—'],
    ...its.map((it, i) => ['Producto ' + (i + 1), lin(it)]), ['TOTAL', dinero(o.total)]
  ];
  if (pagado) campos.push(['Pago confirmado', `${o.pago_metodo || '—'}${o.pago_ref ? ' · ref. ' + o.pago_ref : ''}`]);
  return { titulo, estado, pagado, tienda, texto: L.join('\n'), campos, asunto: `${titulo} ${o.codigo} · ${estado} · ${c.nombre || ''} · ${dinero(o.total)}` };
}

const Demo = (() => {
  const LLAVE = 'palio_demo_v3', LLAVE_SES = 'palio_demo_sesion3';
  let memDB = null, memSes = null;
  const ahora = () => new Date().toISOString();

  function semilla() {
    const t = Date.now();
    const cats = [['Consolas', 'gamepad'], ['Videojuegos', 'disc'], ['Accesorios', 'headset'], ['Coleccionables', 'ghost'], ['Tarjetas de regalo', 'card']]
      .map(([nombre, icono], i) => ({ id: 'cat-' + (i + 1), nombre, icono, orden: i + 1, creado: ahora() }));
    const P = (i, c, nombre, detalle, precio, stock, etiqueta) => ({
      id: 'prod-' + i, categoria_id: 'cat-' + c, nombre, detalle, precio, stock, etiqueta: etiqueta || null,
      imagen_url: null, imagen_path: null, activo: true, creado: new Date(t - i * 1000).toISOString()
    });
    return {
      ajustes: Object.assign({}, AJUSTES_BASE),
      categorias: cats,
      productos: [
        P(1, 1, 'Consola PS5 Slim 1TB', 'Versión con disco · incluye control', 2499900, 5),
        P(2, 1, 'Nintendo Switch OLED', 'Pantalla OLED 7" · 64 GB', 1549900, 3, 'Nuevo'),
        P(3, 1, 'Xbox Series S 512GB', 'Digital · blanca', 1399900, 0),
        P(4, 2, 'Zelda: Tears of the Kingdom', 'Nintendo Switch · físico', 229900, 12),
        P(5, 2, 'Mario Kart 8 Deluxe', 'Nintendo Switch · físico', 219900, 9),
        P(6, 2, 'God of War Ragnarök', 'PS5 · físico', 199900, 2),
        P(7, 3, 'Control inalámbrico DualSense', 'PS5 · varios colores', 289900, 14),
        P(8, 3, 'Audífonos gamer 7.1 RGB', 'Micrófono con cancelación de ruido', 159900, 20),
        P(9, 3, 'Teclado mecánico RGB', 'Switches rojos · español', 219900, 7),
        P(10, 3, 'Mousepad XXL 90x40', 'Base antideslizante', 59900, 30),
        P(11, 4, 'Figura coleccionable 25 cm', 'Edición limitada · con base', 129900, 8),
        P(12, 5, 'Gift Card digital 50 USD', 'Código entregado por correo', 239900, 25, 'Nuevo')
      ],
      pedidos: []
    };
  }
  function leer() {
    try { const raw = localStorage.getItem(LLAVE); if (raw) return JSON.parse(raw); } catch (e) {}
    if (memDB) return JSON.parse(JSON.stringify(memDB));
    const db = semilla(); guardar(db); return db;
  }
  function guardar(db) {
    memDB = JSON.parse(JSON.stringify(db));
    try { localStorage.setItem(LLAVE, JSON.stringify(db)); }
    catch (e) { throw new Error('No hay más espacio en el modo demostración. Usa fotos más pequeñas o borra algunas.'); }
  }
  const sesionGuardada = () => { try { return sessionStorage.getItem(LLAVE_SES); } catch (e) { return memSes; } };
  const sesionPoner = v => { memSes = v; try { v ? sessionStorage.setItem(LLAVE_SES, v) : sessionStorage.removeItem(LLAVE_SES); } catch (e) {} };

  function mutar(id, cambio) {
    const db = leer(), p = db.pedidos.find(x => x.id === id);
    if (!p) throw new Error('El pedido no existe.');
    const r = planPedido(p, cambio), cortos = [];
    if (r.stock) unirLineas(p.items).forEach(it => {
      const pr = db.productos.find(x => x.id === it.id); if (!pr) return;
      if (r.stock === 'descontar') { if (pr.stock < it.cantidad) cortos.push(pr.nombre); pr.stock = Math.max(0, pr.stock - it.cantidad); }
      else pr.stock += it.cantidad;
    });
    Object.assign(p, r.campos); if (r.stock) p.stock_descontado = r.stock === 'descontar';
    guardar(db);
    return resumenStock(r.stock, cortos);
  }

  return {
    async catalogo() {
      const db = leer();
      return { ajustes: db.ajustes, categorias: ordenarCats(db.categorias), productos: nuevosPrimero(db.productos.filter(p => p.activo)) };
    },
    async crearPedido(cliente, items) {
      const db = leer(), c = cliente || {};
      const v = k => String(c[k] || '').trim();
      if (!v('nombre') || v('telefono').length < 7 || !v('ciudad') || !v('direccion')) throw new Error('Completa tu nombre, celular, ciudad y dirección.');
      if (!Array.isArray(items) || !items.length) throw new Error('Tu pedido está vacío.');
      let total = 0; const lineas = [];
      for (const it of items) {
        const qty = parseInt(it.cantidad, 10);
        if (!(qty >= 1 && qty <= 99)) throw new Error('La cantidad debe estar entre 1 y 99.');
        const p = db.productos.find(x => x.id === it.id && x.activo);
        if (!p) throw new Error('Uno de los productos ya no está disponible. Actualiza la página.');
        if (p.stock < qty) throw new Error(`No hay suficiente stock de "${p.nombre}" (quedan ${p.stock}).`);
        total += p.precio * qty;
        lineas.push({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: qty });
      }
      const codigo = 'IP-' + Math.random().toString(36).toUpperCase().slice(2, 8);
      db.pedidos.push({
        id: uid(), codigo, estado: 'nuevo', pago_estado: 'pendiente', stock_descontado: false, total, items: lineas, creado: ahora(),
        cliente: { nombre: v('nombre'), telefono: v('telefono'), correo: v('correo'), ciudad: v('ciudad'), direccion: v('direccion'), pago: v('pago'), notas: v('notas') }
      });
      guardar(db);
      return { codigo, total, items: lineas };
    },
    auth: {
      async sesion() { const e = sesionGuardada(); return e ? { email: e } : null; },
      async entrar(email, clave) {
        if (!String(email || '').trim()) throw new Error('Escribe tu usuario.');
        if (clave !== 'demo1234') throw new Error('Usuario o contraseña incorrectos. (En modo demostración la contraseña es demo1234)');
        sesionPoner(String(email).trim()); return { email: String(email).trim() };
      },
      async salir() { sesionPoner(null); },
      async cambiarClave() { throw new Error('En modo demostración no se puede cambiar la contraseña.'); }
    },
    admin: {
      async todo() { const db = leer(); return { ajustes: db.ajustes, categorias: ordenarCats(db.categorias), productos: nuevosPrimero(db.productos) }; },
      async guardarProducto(p) {
        const db = leer(), campos = limpiarProducto(p);
        if (p.id) {
          const x = db.productos.find(q => q.id === p.id); if (!x) throw new Error('Ese producto ya no existe.');
          Object.assign(x, campos); guardar(db); return x;
        }
        const x = Object.assign({ id: uid(), detalle: '', stock: 0, etiqueta: null, imagen_url: null, imagen_path: null, activo: true, creado: ahora() }, campos);
        if (!x.categoria_id || x.precio === undefined) throw new Error('Faltan datos del producto.');
        db.productos.push(x); guardar(db); return x;
      },
      async borrarProducto(id) { const db = leer(); db.productos = db.productos.filter(p => p.id !== id); guardar(db); },
      async subirImagen(blob) { return { url: await blobADataURL(blob), path: 'demo-' + uid() }; },
      async borrarImagen() {},
      async guardarCategoria(c) {
        const db = leer(), campos = limpiarCategoria(c);
        if (c.id) { const x = db.categorias.find(q => q.id === c.id); if (!x) throw new Error('Esa categoría ya no existe.'); Object.assign(x, campos); guardar(db); return x; }
        const x = Object.assign({ id: uid(), icono: 'gamepad', orden: Math.max(0, ...db.categorias.map(q => q.orden)) + 1, creado: ahora() }, campos);
        db.categorias.push(x); guardar(db); return x;
      },
      async borrarCategoria(id) {
        const db = leer(), n = db.productos.filter(p => p.categoria_id === id).length;
        if (n) throw new Error(`Esa categoría tiene ${n} producto${n === 1 ? '' : 's'}. Muévelos a otra categoría o bórralos primero.`);
        db.categorias = db.categorias.filter(c => c.id !== id); guardar(db);
      },
      async ordenarCategorias(ids) { const db = leer(); ids.forEach((id, i) => { const c = db.categorias.find(x => x.id === id); if (c) c.orden = i + 1; }); guardar(db); },
      async guardarAjustes(a) { const db = leer(); Object.assign(db.ajustes, limpiarAjustes(a)); guardar(db); return db.ajustes; },
      async pedidos() { return leer().pedidos.slice().sort((a, b) => String(b.creado).localeCompare(String(a.creado))); },
      async estadoPedido(id, estado) { return mutar(id, { tipo: 'estado', estado }); },
      async confirmarPago(id, datos) { return mutar(id, { tipo: 'pagar', metodo: (datos || {}).metodo, ref: (datos || {}).ref }); },
      async reversarPago(id) { return mutar(id, { tipo: 'reversar' }); },
      async eliminarPedido(id) {
        const db = leer(), p = db.pedidos.find(x => x.id === id);
        if (!p) throw new Error('El pedido no existe.');
        if (p.estado !== 'cancelado') throw new Error('Solo se pueden eliminar pedidos cancelados.');
        db.pedidos = db.pedidos.filter(x => x.id !== id); guardar(db);
      }
    }
  };
})();

/* ===================================================================
   FIREBASE (datos reales: Authentication + Firestore)
   · No usa Storage (exige plan de pago): las fotos viajan dentro del producto, ya reducidas.
   · Los clientes solo leen el catálogo y crean pedidos; el resto lo protegen las reglas (firestore.rules).
   =================================================================== */
const Fb = (() => {
  const VERSION = '10.12.5';
  const BASE = `https://www.gstatic.com/firebasejs/${VERSION}/`;
  let _core = null, _auth = null;

  function core() {
    if (!_core) {
      _core = (async () => {
        let appM, fs;
        try { [appM, fs] = await Promise.all([import(BASE + 'firebase-app.js'), import(BASE + 'firebase-firestore.js')]); }
        catch (e) { throw new Error('No se pudo cargar Firebase. Revisa tu conexión a internet.'); }
        const app = appM.initializeApp({ apiKey: FB.apiKey, authDomain: FB.authDomain, projectId: FB.projectId, appId: FB.appId });
        const db = fs.initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
        return { app, db, fs };
      })();
      _core.catch(() => { _core = null; });
    }
    return _core;
  }
  function autenticacion() {
    if (!_auth) {
      _auth = (async () => {
        const { app } = await core();
        let mod;
        try { mod = await import(BASE + 'firebase-auth.js'); }
        catch (e) { throw new Error('No se pudo cargar Firebase. Revisa tu conexión a internet.'); }
        return { mod, auth: mod.getAuth(app) };
      })();
      _auth.catch(() => { _auth = null; });
    }
    return _auth;
  }

  function traducir(e) {
    const code = String((e && e.code) || ''), m = String((e && e.message) || e || '');
    if (/^auth\/(invalid-credential|wrong-password|user-not-found|invalid-email|missing-password|invalid-login-credentials)$/.test(code)) return 'Usuario o contraseña incorrectos.';
    if (code === 'auth/too-many-requests') return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
    if (code === 'auth/network-request-failed' || code === 'unavailable') return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
    if (code === 'auth/requires-recent-login') return 'Por seguridad, cierra sesión, vuelve a entrar y repite el cambio de contraseña.';
    if (code === 'auth/weak-password') return 'La contraseña es muy débil: usa al menos 8 caracteres.';
    if (code === 'auth/operation-not-allowed') return 'Falta activar el acceso con correo y contraseña en Firebase (Authentication → Sign-in method).';
    if (/^auth\/(invalid-api-key|api-key-not-valid)/.test(code) || /api-key-not-valid/i.test(m)) return 'La apiKey de config.js no es válida. Cópiala de nuevo desde Firebase.';
    if (code === 'permission-denied') return 'No tienes permisos para hacer esto. Inicia sesión de nuevo o revisa las reglas de Firestore (firestore.rules).';
    if (code === 'not-found') return 'Falta crear la base de datos Firestore en tu proyecto de Firebase.';
    if (code === 'resource-exhausted') return 'Se alcanzó el límite gratuito diario de Firebase. Inténtalo mañana o pasa al plan Blaze.';
    return m || 'Ocurrió un error inesperado.';
  }
  function protegido(obj) {
    Object.keys(obj).forEach(k => {
      const f = obj[k];
      if (typeof f === 'function') obj[k] = async (...a) => { try { return await f(...a); } catch (e) { throw new Error(traducir(e)); } };
      else if (f && typeof f === 'object') protegido(f);
    });
    return obj;
  }

  /* El usuario puede escribir "daniel" (sin correo): internamente es daniel@<dominio>. También acepta un correo real. */
  const correoDe = u => { const t = String(u || '').trim().toLowerCase().replace(/\s+/g, ''); return !t ? '' : t.includes('@') ? t : t + '@' + DOMINIO_USUARIOS; };
  const visible = email => String(email || '').endsWith('@' + DOMINIO_USUARIOS) ? String(email).slice(0, -(DOMINIO_USUARIOS.length + 1)) : String(email || '');

  const iso = v => v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (typeof v === 'string' ? v : '');
  const normProd = (id, d) => Object.assign({ categoria_id: '', nombre: '', detalle: '', precio: 0, stock: 0, etiqueta: null, imagen_url: null, imagen_path: null, activo: true, creado: '' }, d, { id });
  const normCat = (id, d) => Object.assign({ nombre: '', icono: 'gamepad', orden: 0, creado: '' }, d, { id });
  const normPed = (id, d) => ({ id, codigo: d.codigo || id, estado: d.estado || 'nuevo', pago_estado: d.pago_estado || 'pendiente', pago_metodo: d.pago_metodo || '', pago_ref: d.pago_ref || '', pago_fecha: iso(d.pago_fecha) || null, stock_descontado: !!d.stock_descontado, cliente: d.cliente || {}, items: d.items || [], total: d.total || 0, creado: iso(d.creado) });
  const quitarSembrado = a => { const o = Object.assign({}, a); delete o.sembrado; return o; };
  const BASE_AJ = quitarSembrado(AJUSTES_BASE); delete BASE_AJ.id;
  const CATS_INICIALES = [['consolas', 'Consolas', 'gamepad'], ['videojuegos', 'Videojuegos', 'disc'], ['accesorios', 'Accesorios', 'headset'], ['coleccionables', 'Coleccionables', 'ghost'], ['tarjetas-de-regalo', 'Tarjetas de regalo', 'card']];

  async function leer(soloActivos) {
    const { db, fs } = await core();
    const prodsQ = soloActivos ? fs.query(fs.collection(db, 'productos'), fs.where('activo', '==', true)) : fs.collection(db, 'productos');
    const [aj, cats, prods] = await Promise.all([fs.getDoc(fs.doc(db, 'config', 'tienda')), fs.getDocs(fs.collection(db, 'categorias')), fs.getDocs(prodsQ)]);
    return { aj, cats, prods, db, fs };
  }
  const armar = r => ({
    ajustes: Object.assign({ id: 1 }, BASE_AJ, quitarSembrado(r.aj.exists() ? r.aj.data() : {})),
    categorias: ordenarCats(r.cats.docs.map(d => normCat(d.id, d.data()))),
    productos: nuevosPrimero(r.prods.docs.map(d => normProd(d.id, d.data())))
  });

  /* Pedidos: una escucha en vivo (cuesta 1 lectura por pedido cambiado, no por consulta). */
  const P = { lista: [], listo: null, baja: null };
  function cerrarPedidos() { if (P.baja) { try { P.baja(); } catch (e) {} } P.baja = null; P.listo = null; P.lista = []; }
  function pedidosEnVivo() {
    if (!P.listo) {
      P.listo = (async () => {
        const { db, fs } = await core();
        return new Promise((ok, mal) => {
          let primera = true;
          P.baja = fs.onSnapshot(
            fs.query(fs.collection(db, 'pedidos'), fs.orderBy('creado', 'desc'), fs.limit(300)),
            snap => { P.lista = snap.docs.map(d => normPed(d.id, d.data({ serverTimestamps: 'estimate' }))); if (primera) { primera = false; ok(); } },
            err => { if (primera) { primera = false; mal(err); } else { P.listo = null; P.baja = null; } }
          );
        });
      })();
      P.listo.catch(() => { cerrarPedidos(); });
    }
    return P.listo;
  }
  async function esAdmin() {
    try { await pedidosEnVivo(); return true; }
    catch (e) { if (e && e.code === 'permission-denied') return false; throw e; }
  }
  /* Aplica un cambio al pedido (y al inventario si corresponde) en una sola transacción. */
  async function aplicar(id, cambio) {
    const { db, fs } = await core();
    return fs.runTransaction(db, async tx => {
      const ref = fs.doc(db, 'pedidos', id), snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('El pedido no existe.');
      const p = snap.data(), r = planPedido(p, cambio), cortos = [], pend = [];
      if (r.stock) {
        for (const it of unirLineas(p.items)) {                // primero todas las lecturas…
          const pr = fs.doc(db, 'productos', it.id), ps = await tx.get(pr);
          if (ps.exists()) pend.push([pr, ps.data(), it]);
        }
        for (const [pr, d, it] of pend) {                      // …y después las escrituras
          if (r.stock === 'descontar') { if ((d.stock || 0) < it.cantidad) cortos.push(d.nombre); tx.update(pr, { stock: Math.max(0, (d.stock || 0) - it.cantidad) }); }
          else tx.update(pr, { stock: (d.stock || 0) + it.cantidad });
        }
      }
      const campos = Object.assign({}, r.campos); if (r.stock) campos.stock_descontado = r.stock === 'descontar';
      if (Object.keys(campos).length) tx.update(ref, campos);
      return resumenStock(r.stock, cortos);
    });
  }
  function codigoPedido() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', b = new Uint32Array(6);
    (window.crypto || window.msCrypto).getRandomValues(b);
    return 'IP-' + [...b].map(n => A[n % A.length]).join('');
  }

  return protegido({
    async catalogo() {
      const r = await leer(true), x = armar(r);
      x.productos = x.productos.filter(p => p.activo !== false);
      return x;
    },
    async crearPedido(cliente, items) {
      const { db, fs } = await core(), c = cliente || {};
      const v = (k, max) => String(c[k] || '').trim().slice(0, max);
      const d = { nombre: v('nombre', 80), telefono: v('telefono', 25), correo: v('correo', 80), ciudad: v('ciudad', 60), direccion: v('direccion', 140), pago: v('pago', 40), notas: v('notas', 300) };
      if (!d.nombre || d.telefono.length < 7 || !d.ciudad || !d.direccion) throw new Error('Completa tu nombre, celular, ciudad y dirección.');
      if (!Array.isArray(items) || !items.length) throw new Error('Tu pedido está vacío.');
      if (items.length > 40) throw new Error('Son demasiados productos en un solo pedido.');
      items.forEach(it => {
        if (!/^[A-Za-z0-9_-]{1,60}$/.test(String(it.id))) throw new Error('Hay un producto no válido en tu pedido.');
        const q = parseInt(it.cantidad, 10);
        if (!(q >= 1 && q <= 99)) throw new Error('La cantidad debe estar entre 1 y 99.');
      });
      // precios y existencias reales, leídos de la base de datos (no del navegador)
      const snaps = await Promise.all(items.map(it => fs.getDoc(fs.doc(db, 'productos', String(it.id))).catch(e => { if (e && e.code === 'permission-denied') return null; throw e; })));
      let total = 0; const lineas = [];
      items.forEach((it, i) => {
        const s = snaps[i], q = parseInt(it.cantidad, 10);
        if (!s || !s.exists() || s.data().activo === false) throw new Error('Uno de los productos ya no está disponible. Actualiza la página.');
        const p = s.data();
        if ((p.stock || 0) < q) throw new Error(`No hay suficiente stock de "${p.nombre}" (quedan ${Math.max(0, p.stock || 0)}).`);
        total += p.precio * q;
        lineas.push({ id: s.id, nombre: p.nombre, precio: p.precio, cantidad: q });
      });
      for (let intento = 0; ; intento++) {
        const codigo = codigoPedido();
        try {
          await fs.setDoc(fs.doc(db, 'pedidos', codigo), { codigo, estado: 'nuevo', stock_descontado: false, cliente: d, items: lineas, total, creado: fs.serverTimestamp() });
          return { codigo, total, items: lineas };
        } catch (e) { if (!(e && e.code === 'permission-denied' && intento < 3)) throw e; }   // código repetido: se genera otro
      }
    },
    auth: {
      async sesion() {
        const { mod, auth } = await autenticacion();
        const u = await new Promise(ok => { const un = mod.onAuthStateChanged(auth, x => { un(); ok(x); }); });
        if (!u) return null;
        if (!(await esAdmin())) { cerrarPedidos(); await mod.signOut(auth); return null; }
        return { email: u.email, usuario: visible(u.email) };
      },
      async entrar(usuario, clave) {
        const { mod, auth } = await autenticacion(), email = correoDe(usuario);
        if (!email) throw new Error('Escribe tu usuario.');
        const r = await mod.signInWithEmailAndPassword(auth, email, String(clave || ''));
        if (!(await esAdmin())) {
          cerrarPedidos(); await mod.signOut(auth);
          throw new Error('Esta cuenta no es administradora. Revisa que su correo esté en el archivo de reglas (firestore.rules) y que lo hayas publicado.');
        }
        return { email: r.user.email, usuario: visible(r.user.email) };
      },
      async salir() { cerrarPedidos(); const { mod, auth } = await autenticacion(); await mod.signOut(auth); },
      async cambiarClave(nueva) {
        const { mod, auth } = await autenticacion();
        if (!auth.currentUser) throw new Error('Inicia sesión de nuevo.');
        await mod.updatePassword(auth.currentUser, nueva);
      }
    },
    admin: {
      async todo() {
        let r = await leer(false);
        if (!(r.aj.exists() && r.aj.data().sembrado)) {            // primera vez: categorías iniciales
          const b = r.fs.writeBatch(r.db), ahora = new Date().toISOString();
          if (!r.cats.docs.length) CATS_INICIALES.forEach(([id, nombre, icono], i) => b.set(r.fs.doc(r.db, 'categorias', id), { nombre, icono, orden: i + 1, creado: ahora }));
          b.set(r.fs.doc(r.db, 'config', 'tienda'), Object.assign({}, BASE_AJ, r.aj.exists() ? r.aj.data() : {}, { sembrado: true }));
          await b.commit();
          r = await leer(false);
        }
        return armar(r);
      },
      async guardarProducto(p) {
        const { db, fs } = await core(), campos = limpiarProducto(p);
        if (p.id) {
          const ref = fs.doc(db, 'productos', p.id);
          await fs.updateDoc(ref, campos);
          return normProd(ref.id, (await fs.getDoc(ref)).data());
        }
        const ref = fs.doc(fs.collection(db, 'productos'));
        const x = Object.assign({ detalle: '', stock: 0, etiqueta: null, imagen_url: null, imagen_path: null, activo: true, creado: new Date().toISOString() }, campos);
        if (!x.categoria_id || x.precio === undefined) throw new Error('Faltan datos del producto.');
        await fs.setDoc(ref, x);
        return normProd(ref.id, x);
      },
      async borrarProducto(id) { const { db, fs } = await core(); await fs.deleteDoc(fs.doc(db, 'productos', id)); },
      async subirImagen(blob) {
        if (blob.size > 450 * 1024) throw new Error('La foto quedó muy pesada. Prueba con otra imagen.');
        return { url: await blobADataURL(blob), path: null };
      },
      async borrarImagen() {},
      async guardarCategoria(cat) {
        const { db, fs } = await core(), campos = limpiarCategoria(cat);
        if (cat.id) {
          const ref = fs.doc(db, 'categorias', cat.id);
          await fs.updateDoc(ref, campos);
          return normCat(ref.id, (await fs.getDoc(ref)).data());
        }
        const todas = await fs.getDocs(fs.collection(db, 'categorias'));
        const ref = fs.doc(fs.collection(db, 'categorias'));
        const x = Object.assign({ icono: 'gamepad', orden: Math.max(0, ...todas.docs.map(d => d.data().orden || 0)) + 1, creado: new Date().toISOString() }, campos);
        await fs.setDoc(ref, x);
        return normCat(ref.id, x);
      },
      async borrarCategoria(id) {
        const { db, fs } = await core();
        const n = (await fs.getCountFromServer(fs.query(fs.collection(db, 'productos'), fs.where('categoria_id', '==', id)))).data().count;
        if (n) throw new Error(`Esa categoría tiene ${n} producto${n === 1 ? '' : 's'}. Muévelos a otra categoría o bórralos primero.`);
        await fs.deleteDoc(fs.doc(db, 'categorias', id));
      },
      async ordenarCategorias(ids) {
        const { db, fs } = await core(), b = fs.writeBatch(db);
        ids.forEach((id, i) => b.update(fs.doc(db, 'categorias', id), { orden: i + 1 }));
        await b.commit();
      },
      async guardarAjustes(a) {
        const { db, fs } = await core(), ref = fs.doc(db, 'config', 'tienda');
        await fs.setDoc(ref, limpiarAjustes(a), { merge: true });
        return Object.assign({ id: 1 }, BASE_AJ, quitarSembrado((await fs.getDoc(ref)).data()));
      },
      async pedidos() { await pedidosEnVivo(); return P.lista.slice(); },
      async estadoPedido(id, estado) { return aplicar(id, { tipo: 'estado', estado }); },
      async confirmarPago(id, datos) { return aplicar(id, { tipo: 'pagar', metodo: (datos || {}).metodo, ref: (datos || {}).ref }); },
      async reversarPago(id) { return aplicar(id, { tipo: 'reversar' }); },
      async eliminarPedido(id) {
        const { db, fs } = await core(), ref = fs.doc(db, 'pedidos', id), s = await fs.getDoc(ref);
        if (!s.exists()) throw new Error('El pedido no existe.');
        if (s.data().estado !== 'cancelado') throw new Error('Solo se pueden eliminar pedidos cancelados.');
        await fs.deleteDoc(ref);
      }
    }
  });
})();

/* ------------------------------------------------------------- exportación */
window.Datos = Object.assign(
  { modo: MODO, esc, dinero, fecha, telWA, entero, documento, ICONOS, ICONOS_CATEGORIA, ico, arte, reducirImagen, validarProducto: limpiarProducto },
  MODO === 'firebase' ? Fb : Demo
);
})();
