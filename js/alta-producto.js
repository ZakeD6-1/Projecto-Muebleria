// --- Categorías ---

// Carga el select de categorías desde Supabase
async function cargarCategorias() {
    var select = document.getElementById("categoria");
    var editId = new URLSearchParams(window.location.search).get("edit");
    try {
        var cats = await supaGetCategorias();
        select.innerHTML = '<option value="">Seleccione una categoría</option>';
        cats.forEach(function (c) {
            var opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.nombre;
            select.appendChild(opt);
        });
        // Si estamos editando, selecciona la categoría del producto
        if (editId) {
            var p = await supaGetProducto(editId);
            select.value = p.categoria;
        }
    } catch (e) {
        console.error("Error al cargar categorías:", e);
    }
}

// Inicializa el formulario de alta/edición de producto
function initAltaProducto() {
    // Solo administradores pueden acceder
    if (!isAdmin()) {
        window.location.href = "index.html";
        return;
    }

    cargarCategorias();

    var params = new URLSearchParams(window.location.search);
    var editId = params.get("edit");

    // Si hay parámetro "edit", precarga los datos del producto
    if (editId) {
        document.querySelector("h1").textContent = "Editar Producto";
        cargarProductoParaEditar(editId);
    }

    // Muestra el input para agregar una categoría nueva
    document.getElementById("btn-nueva-categoria").addEventListener("click", function () {
        document.getElementById("nueva-categoria-input").style.display = "block";
        document.getElementById("input-nueva-categoria").focus();
    });

    // Oculta el input de nueva categoría sin guardar
    document.getElementById("btn-cancelar-categoria").addEventListener("click", function () {
        document.getElementById("nueva-categoria-input").style.display = "none";
        document.getElementById("input-nueva-categoria").value = "";
    });

    // Agrega la nueva categoría al select
    document.getElementById("btn-confirmar-categoria").addEventListener("click", function () {
        var input = document.getElementById("input-nueva-categoria");
        var nombre = input.value.trim();
        if (!nombre) return;
        var id = nombre;
        var select = document.getElementById("categoria");
        var opt = document.createElement("option");
        opt.value = id;
        opt.textContent = nombre;
        opt.selected = true;
        select.appendChild(opt);
        input.value = "";
        document.getElementById("nueva-categoria-input").style.display = "none";
    });

    // Guarda o actualiza el producto al enviar el formulario
    document.getElementById("producto-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        var data = {
            nombre: document.getElementById("nombre").value,
            descripcion: document.getElementById("descripcion").value,
            precio: parseFloat(document.getElementById("precio").value),
            categoria: document.getElementById("categoria").value,
            tags: document.getElementById("tags").value.split(",").map(function (t) { return t.trim(); }).filter(Boolean),
            imagen: document.getElementById("imagen-url").value,
            stock: document.querySelector('input[name="stock"]:checked').value,
            destacado: document.getElementById("destacado").checked,
            marca: document.getElementById("marca").value,
            sku: document.getElementById("sku").value,
            descuento: parseInt(document.getElementById("descuento").value) || 0,
        };
        try {
            if (editId) {
                await supaUpdateProducto(editId, data);
                alert("Producto actualizado correctamente.");
            } else {
                await supaCreateProducto(data);
                alert("Producto creado correctamente.");
                document.getElementById("producto-form").reset();
            }
            cargarCategorias();
            cargarProductosLista();
        } catch (err) {
            alert("Error: " + err.message);
        }
    });
}

// Precarga los datos de un producto en el formulario para editar
async function cargarProductoParaEditar(id) {
    try {
        var p = await supaGetProducto(id);
        document.getElementById("nombre").value = p.nombre;
        document.getElementById("descripcion").value = p.descripcion;
        document.getElementById("precio").value = p.precio;
        document.getElementById("categoria").value = p.categoria;
        document.getElementById("tags").value = (p.tags || []).join(", ");
        document.getElementById("imagen-url").value = p.imagen;
        if (p.stock === "Sin Stock") {
            document.getElementById("stock-no").checked = true;
        } else {
            document.getElementById("stock-si").checked = true;
        }
        document.getElementById("destacado").checked = p.destacado;
        document.getElementById("marca").value = p.marca || "";
        document.getElementById("sku").value = p.sku || "";
        document.getElementById("descuento").value = p.descuento || 0;
    } catch (err) {
        alert("Error al cargar producto: " + err.message);
    }
}

// --- Listado de productos ---

// Renderiza la tabla con todos los productos existentes
async function cargarProductosLista() {
    var tbody = document.getElementById("productos-tbody");
    try {
        var productos = await supaGetProductos();
        tbody.innerHTML = "";
        if (productos.length === 0) {
            tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;padding:2rem;color:#999;'>No hay productos.</td></tr>";
            return;
        }
        productos.forEach(function (p) {
            var img = p.imagen || "";
            tbody.innerHTML += "<tr>" +
                "<td>" + (img ? "<img src='" + img + "' alt='" + p.nombre + "' class='thumb'>" : "") + "</td>" +
                "<td>" + p.nombre + "</td>" +
                "<td>" + p.categoria + "</td>" +
                "<td>" + formatPrecio(p.precio) + "</td>" +
                "<td>" + (p.descuento > 0 ? p.descuento + "%" : "-") + "</td>" +
                "<td>" + p.stock + "</td>" +
                "<td>" +
                    "<a href='alta-producto.html?edit=" + p.id + "' class='btn-editar-link'>Editar</a>" +
                    "<button onclick='eliminarProducto(" + p.id + ",\"" + p.nombre.replace(/"/g,'&quot;') + "\")' class='btn-eliminar-admin'>Eliminar</button>" +
                "</td></tr>";
        });
    } catch (err) {
        tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;padding:2rem;color:#e74c3c;'>Error: " + err.message + "</td></tr>";
    }
}

// Elimina un producto tras confirmación del usuario
async function eliminarProducto(id, nombre) {
    if (!confirm('¿Eliminar el producto "' + nombre + '"?')) return;
    try {
        await supaDeleteProducto(id);
        alert("Producto eliminado.");
        cargarProductosLista();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    initAltaProducto();
    cargarProductosLista();
});
