let categorias = [];
let productos = [];
let categoriaSeleccionada = null;
let tagsSeleccionadas = new Set();

function computedCategorias() {
    var mapa = {};
    productos.forEach(function (p) {
        if (!mapa[p.categoria]) {
            var nombre = p.categoria.split('-').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
            mapa[p.categoria] = { id: p.categoria, nombre: nombre, tags: [] };
        }
    });
    var cats = Object.values(mapa);
    cats.forEach(function (cat) {
        var tagMap = {};
        productos.forEach(function (p) {
            if (p.categoria === cat.id) {
                (p.tags || []).forEach(function (t) {
                    var tid = t.toLowerCase().replace(/\s+/g, "-");
                    if (!tagMap[tid]) {
                        tagMap[tid] = { id: tid, nombre: t };
                    }
                });
            }
        });
        cat.tags = Object.values(tagMap);
    });
    return cats;
}

function renderFiltros() {
    const container = document.getElementById("filtros-container");

    var html = '<div class="filtro-seccion"><h3>Categoría</h3><div class="categoria-pills">';
    html += '<span class="categoria-pill' + (categoriaSeleccionada === null ? ' active' : '') + '" onclick="seleccionarCategoria(null)">Todas</span>';
    categorias.forEach(function (cat) {
        html += '<span class="categoria-pill' + (categoriaSeleccionada === cat.id ? ' active' : '') + '" onclick="seleccionarCategoria(\'' + cat.id + '\')">' + cat.nombre + '</span>';
    });
    html += '</div></div>';

    var tagsDisponibles = [];
    if (categoriaSeleccionada) {
        var cat = categorias.find(function (c) { return c.id === categoriaSeleccionada; });
        if (cat) tagsDisponibles = cat.tags;
    } else {
        categorias.forEach(function (c) {
            c.tags.forEach(function (t) {
                if (!tagsDisponibles.some(function (x) { return x.id === t.id; })) {
                    tagsDisponibles.push(t);
                }
            });
        });
    }

    if (tagsDisponibles.length > 0) {
        html += '<div class="filtro-seccion"><h3>Tags</h3><div class="tags-chips">';
        tagsDisponibles.forEach(function (t) {
            html += '<span class="tag-chip' + (tagsSeleccionadas.has(t.id) ? ' active' : '') + '" onclick="toggleTag(\'' + t.id + '\')">' + t.nombre + '</span>';
        });
        html += '</div></div>';
    }

    container.innerHTML = html;
}

function seleccionarCategoria(catId) {
    categoriaSeleccionada = catId;
    if (catId) {
        var cat = categorias.find(function (c) { return c.id === catId; });
        if (cat) {
            var validIds = cat.tags.map(function (t) { return t.id; });
            tagsSeleccionadas.forEach(function (t) {
                if (!validIds.includes(t)) tagsSeleccionadas.delete(t);
            });
        }
    }
    renderFiltros();
    renderTagsActivas();
    renderProductos();
}

function toggleTag(tagId) {
    if (tagsSeleccionadas.has(tagId)) {
        tagsSeleccionadas.delete(tagId);
    } else {
        tagsSeleccionadas.add(tagId);
    }
    renderFiltros();
    renderTagsActivas();
    renderProductos();
}

function renderTagsActivas() {
    const container = document.getElementById("tags-activas-container");
    const tagsDiv = document.getElementById("tags-activas");
    var hasFilters = categoriaSeleccionada !== null || tagsSeleccionadas.size > 0;
    if (!hasFilters) {
        container.style.display = "none";
        return;
    }
    container.style.display = "block";
    var html = "";
    if (categoriaSeleccionada) {
        var cat = categorias.find(function (c) { return c.id === categoriaSeleccionada; });
        html += '<span class="tag-activa" onclick="seleccionarCategoria(null)">Categoría: ' + (cat ? cat.nombre : categoriaSeleccionada) + ' ✕</span>';
    }
    if (categoriaSeleccionada) {
        var cat = categorias.find(function (c) { return c.id === categoriaSeleccionada; });
        if (cat) {
            tagsSeleccionadas.forEach(function (tagId) {
                cat.tags.forEach(function (t) {
                    if (t.id === tagId) {
                        html += '<span class="tag-activa" onclick="removeTag(\'' + tagId + '\')">' + t.nombre + ' ✕</span>';
                    }
                });
            });
        }
    } else {
        var seen = {};
        tagsSeleccionadas.forEach(function (tagId) {
            categorias.forEach(function (c) {
                c.tags.forEach(function (t) {
                    if (t.id === tagId && !seen[tagId]) {
                        seen[tagId] = true;
                        html += '<span class="tag-activa" onclick="removeTag(\'' + tagId + '\')">' + t.nombre + ' ✕</span>';
                    }
                });
            });
        });
    }
    tagsDiv.innerHTML = html;
}

function removeTag(tagId) {
    tagsSeleccionadas.delete(tagId);
    renderFiltros();
    renderTagsActivas();
    renderProductos();
}

function renderProductos() {
    const grid = document.getElementById("productos-grid");
    let filtrados = productos;

    if (categoriaSeleccionada) {
        filtrados = filtrados.filter(function (p) { return p.categoria === categoriaSeleccionada; });
    }
    if (tagsSeleccionadas.size > 0) {
        filtrados = filtrados.filter(function (p) {
            return (p.tags || []).some(function (t) { return tagsSeleccionadas.has(t.toLowerCase().replace(/\s+/g, "-")); });
        });
    }

    if (filtrados.length === 0) {
        grid.innerHTML = "<p>No hay productos que coincidan con los filtros seleccionados.</p>";
        return;
    }
    grid.innerHTML = filtrados.map(function (p, i) {
        return '<article class="producto-card">' +
            '<div class="producto-imagen">' +
                '<img src="' + p.imagen + '" alt="' + p.nombre + '">' +
            '</div>' +
            '<h3>' + p.nombre + '</h3>' +
            '<p class="precio">' + formatPrecioConDesc(p) + '</p>' +
            '<div class="producto-tags">' +
                p.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join("") +
            '</div>' +
            '<div class="producto-acciones">' +
                '<button class="btn-ver" data-index="' + i + '">Ver</button>' +
                (isLoggedIn() ? '<button class="btn-comprar-card" onclick="agregarAlCarrito(' + p.id + ')">Agregar al carrito</button>' : '<button class="btn-comprar-card" onclick="openLoginModal()">Agregar al carrito</button>') +
            '</div>' +
        '</article>';
    }).join("");
    window.__filtrados = filtrados;
}

function toggleFiltros() {
    document.getElementById('filtros-overlay').classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

async function cargarProductos() {
    try {
        productos = await supaGetProductos();
        categorias = computedCategorias();
        renderFiltros();
        renderProductos();
    } catch (e) {
        document.getElementById("productos-grid").innerHTML =
            '<p>Error al cargar productos desde la base de datos.</p>';
    }
}

function mostrarToast(msg) {
    var t = document.getElementById("toast-msg");
    if (!t) {
        t = document.createElement("div");
        t.id = "toast-msg";
        t.id = "toast-msg";
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(t._hide);
    t._hide = setTimeout(function () { t.style.opacity = "0"; }, 2500);
}

async function agregarAlCarrito(productoId) {
    try {
        await supaAddToCart(getUserId(), productoId, 1);
        mostrarToast("Agregado al carrito");
        updateCarritoBadge();
    } catch (e) {
        mostrarToast("Error al agregar: " + e.message);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    cargarProductos();

    document.getElementById("productos-grid").addEventListener("click", function (e) {
        var btn = e.target.closest(".btn-ver");
        if (btn) {
            var index = parseInt(btn.dataset.index);
            var product = window.__filtrados[index];
            if (product) openProductoModal(product);
        }
    });
});

let currentModalProduct = null;

function openProductoModal(product) {
    currentModalProduct = product;
    const modal = document.getElementById("producto-modal");
    const btn = document.getElementById("modal-add-cart");
    document.getElementById("modal-img").src = product.imagen;
    document.getElementById("modal-img").alt = product.nombre;
    document.getElementById("modal-nombre").textContent = product.nombre;
    document.getElementById("modal-desc").textContent = product.descripcion;
    document.getElementById("modal-precio").innerHTML = formatPrecioConDesc(product);
    if (isLoggedIn()) {
        btn.onclick = function () { agregarAlCarrito(product.id); };
    } else {
        btn.onclick = function () { closeProductoModal(); openLoginModal(); };
    }
    modal.classList.add("active");
    document.body.classList.add("no-scroll");
}

function closeProductoModal() {
    const modal = document.getElementById("producto-modal");
    modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
}
