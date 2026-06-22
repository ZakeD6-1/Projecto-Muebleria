function formatPrecio(num) {
  return '$' + Number(num).toLocaleString('es-AR');
}

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

function formatPrecioConDesc(p) {
  if (p.descuento > 0) {
    return '<span class="precio-original">' + formatPrecio(p.precioOriginal) + '</span> ' +
           '<span class="precio-descuento">' + formatPrecio(p.precioFinal) + '</span> ' +
           '<span class="badge-descuento">-' + p.descuento + '%</span>';
  }
  return formatPrecio(p.precio);
}

async function supaGetProductos() {
  const { data, error } = await _supabase
    .from('Productos')
    .select('*')
    .order('id', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapearProducto);
}

async function supaGetProducto(id) {
  const { data, error } = await _supabase
    .from('Productos')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapearProducto(data);
}

async function supaGetCategorias() {
  const { data, error } = await _supabase
    .from('Productos')
    .select('categoria')
    .order('categoria', { ascending: true });
  if (error) throw error;
  var mapa = {};
  (data || []).forEach(function (r) {
    if (r.categoria) mapa[r.categoria] = true;
  });
  return Object.keys(mapa).map(function (id) {
    var nombre = id.charAt(0).toUpperCase() + id.slice(1);
    if (id === 'mesa') nombre = 'Mesas';
    else if (id === 'silla') nombre = 'Sillas';
    else if (id === 'cama') nombre = 'Camas';
    else if (id === 'sommier') nombre = 'Sommiers';
    return { id: id, nombre: nombre };
  });
}

async function supaCreateProducto(obj) {
  const { data, error } = await _supabase
    .from('Productos')
    .insert(obj)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function supaUpdateProducto(id, obj) {
  const { data, error } = await _supabase
    .from('Productos')
    .update(obj)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function supaDeleteProducto(id) {
  const { error } = await _supabase
    .from('Productos')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

async function supaGetCarrito(usuarioId) {
  const { data, error } = await _supabase
    .from('Carrito')
    .select('*, Productos(*)')
    .eq('usuario_id', usuarioId)
    .order('id', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function supaAddToCart(usuarioId, productoId, cantidad) {
  const { data: existing } = await _supabase
    .from('Carrito')
    .select('*')
    .eq('usuario_id', usuarioId)
    .eq('producto_id', productoId)
    .maybeSingle();
  if (existing) {
    const nuevaCant = existing.cantidad + cantidad;
    const { error } = await _supabase
      .from('Carrito')
      .update({ cantidad: nuevaCant })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await _supabase
      .from('Carrito')
      .insert({ usuario_id: usuarioId, producto_id: productoId, cantidad });
    if (error) throw error;
  }
}

async function supaRemoveFromCart(cartItemId) {
  const { error } = await _supabase
    .from('Carrito')
    .delete()
    .eq('id', cartItemId);
  if (error) throw error;
}

async function supaUpdateCantidad(cartItemId, cantidad) {
  if (cantidad <= 0) {
    return supaRemoveFromCart(cartItemId);
  }
  const { error } = await _supabase
    .from('Carrito')
    .update({ cantidad })
    .eq('id', cartItemId);
  if (error) throw error;
}

async function supaLimpiarCarrito(usuarioId) {
  const { error } = await _supabase
    .from('Carrito')
    .delete()
    .eq('usuario_id', usuarioId);
  if (error) throw error;
}
