// --- Utilidades de formato ---

// Formatea un número como precio en pesos argentinos
function formatPrecio(num) {
  return '$' + Number(num).toLocaleString('es-AR');
}

// Normaliza un producto de Supabase a un objeto limpio
function mapearProducto(raw) {
  var tags = raw.tags;
  if (typeof tags === 'string') {
    try { tags = JSON.parse(tags); } catch (e) { tags = []; }
  }
  if (!Array.isArray(tags)) tags = [];
  var desc = raw.descuento || 0;
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
    precio: raw.precio,
    categoria: raw.categoria,
    tagId: raw.categoria,
    tags: tags,
    imagen: raw.imagen,
    stock: raw.stock,
    destacado: raw.destacado,
    marca: raw.marca,
    sku: raw.sku,
    descuento: desc,
    precioOriginal: raw.precio,
    precioFinal: desc > 0 ? Math.round(raw.precio * (1 - desc / 100)) : raw.precio
  };
}

// Renderiza el precio con descuento (tachado + final + badge)
function formatPrecioConDesc(p) {
  if (p.descuento > 0) {
    return '<span class="precio-original">' + formatPrecio(p.precioOriginal) + '</span> ' +
           '<span class="precio-descuento">' + formatPrecio(p.precioFinal) + '</span> ' +
           '<span class="badge-descuento">-' + p.descuento + '%</span>';
  }
  return formatPrecio(p.precio);
}

// --- Productos ---

// Trae todos los productos ordenados por ID descendente
async function supaGetProductos() {
  var data = await supaFetch('GET', 'Productos?select=*&order=id.desc');
  return (data || []).map(mapearProducto);
}

// Trae un producto por su ID
async function supaGetProducto(id) {
  var data = await supaFetch('GET', 'Productos?select=*&id=eq.' + id + '&limit=1');
  if (!data || data.length === 0) throw new Error('Producto no encontrado');
  return mapearProducto(data[0]);
}

// Obtiene la lista de categorías únicas disponibles
async function supaGetCategorias() {
  var data = await supaFetch('GET', 'Productos?select=categoria&order=categoria.asc');
  var mapa = {};
  (data || []).forEach(function (r) {
    if (r.categoria) mapa[r.categoria] = true;
  });
  return Object.keys(mapa).map(function (id) {
    return { id: id, nombre: id };
  });
}

// Crea un nuevo producto en Supabase
async function supaCreateProducto(obj) {
  var data = await supaFetch('POST', 'Productos', {
    body: obj,
    prefer: 'return=representation',
  });
  return (data || [])[0] || data;
}

// Actualiza un producto existente por ID
async function supaUpdateProducto(id, obj) {
  var data = await supaFetch('PATCH', 'Productos?id=eq.' + id, {
    body: obj,
    prefer: 'return=representation',
  });
  return (data || [])[0] || data;
}

// Elimina un producto por ID
async function supaDeleteProducto(id) {
  await supaFetch('DELETE', 'Productos?id=eq.' + id);
}

// --- Carrito ---

// Obtiene todos los items del carrito de un usuario
async function supaGetCarrito(usuarioId) {
  var data = await supaFetch('GET', 'Carrito?select=*,Productos(*)&usuario_id=eq.' + usuarioId + '&order=id.asc');
  return data || [];
}

// Agrega un producto al carrito o suma cantidad si ya existe
async function supaAddToCart(usuarioId, productoId, cantidad) {
  var existing = await supaFetch('GET', 'Carrito?select=*&usuario_id=eq.' + usuarioId + '&producto_id=eq.' + productoId + '&limit=1');
  if (existing && existing.length > 0) {
    var nuevaCant = existing[0].cantidad + cantidad;
    await supaFetch('PATCH', 'Carrito?id=eq.' + existing[0].id, {
      body: { cantidad: nuevaCant },
    });
  } else {
    await supaFetch('POST', 'Carrito', {
      body: { usuario_id: usuarioId, producto_id: productoId, cantidad: cantidad },
    });
  }
}

// Elimina un item del carrito por ID
async function supaRemoveFromCart(cartItemId) {
  await supaFetch('DELETE', 'Carrito?id=eq.' + cartItemId);
}

// Actualiza la cantidad de un item (elimina si llega a 0 o menos)
async function supaUpdateCantidad(cartItemId, cantidad) {
  if (cantidad <= 0) {
    return supaRemoveFromCart(cartItemId);
  }
  await supaFetch('PATCH', 'Carrito?id=eq.' + cartItemId, {
    body: { cantidad: cantidad },
  });
}

// Vacía el carrito completo de un usuario
async function supaLimpiarCarrito(usuarioId) {
  await supaFetch('DELETE', 'Carrito?usuario_id=eq.' + usuarioId);
}
