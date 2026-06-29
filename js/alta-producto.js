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
        if (editId) {
            var p = await supaGetProducto(editId);
            select.value = p.categoria;
        }
    } catch (e) {
        console.error("Error al cargar categorías:", e);
    }
}

function initAltaProducto() {
    if (!isAdmin()) {
        window.location.href = "index.html";
        return;
    }

    cargarCategorias();

    var params = new URLSearchParams(window.location.search);
    var editId = params.get("edit");

    if (editId) {
        document.querySelector("h1").textContent = "Editar Producto";
        cargarProductoParaEditar(editId);
    }

    document.getElementById("btn-nueva-categoria").addEventListener("click", function () {
        document.getElementById("nueva-categoria-input").style.display = "block";
        document.getElementById("input-nueva-categoria").focus();
    });

    document.getElementById("btn-cancelar-categoria").addEventListener("click", function () {
        document.getElementById("nueva-categoria-input").style.display = "none";
        document.getElementById("input-nueva-categoria").value = "";
    });

    document.getElementById("btn-confirmar-categoria").addEventListener("click", function () {
        var input = document.getElementById("input-nueva-categoria");
        var nombre = input.value.trim();
        if (!nombre) return;
        var id = nombre.toLowerCase().replace(/\s+/g, "-");
        var select = document.getElementById("categoria");
        var opt = document.createElement("option");
        opt.value = id;
        opt.textContent = nombre;
        opt.selected = true;
        select.appendChild(opt);
        input.value = "";
        document.getElementById("nueva-categoria-input").style.display = "none";
    });

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

async function cargarProductosLista() {
    var container = document.getElementById("productos-lista");
    try {
        var productos = await supaGetProductos();
        if (productos.length === 0) {
            container.innerHTML = "<p>No hay productos.</p>";
            return;
        }
        var html = "<table style='width:100%;border-collapse:collapse;'>" +
            "<thead><tr style='text-align:left;background:#f5f5f5;'>" +
            "<th style='padding:8px;'>Imagen</th>" +
            "<th style='padding:8px;'>Nombre</th>" +
            "<th style='padding:8px;'>Categoría</th>" +
            "<th style='padding:8px;'>Precio</th>" +
            "<th style='padding:8px;'>Dto.</th>" +
            "<th style='padding:8px;'>Stock</th>" +
            "<th style='padding:8px;'></th>" +
            "</tr></thead><tbody>";
        productos.forEach(function (p) {
            var img = p.imagen || "";
            html += "<tr style='border-bottom:1px solid #ddd;'>" +
                "<td style='padding:8px;'>" +
                    (img ? "<img src='" + img + "' alt='" + p.nombre + "' style='width:60px;height:60px;object-fit:cover;border-radius:6px;display:block;'>" : "") +
                "</td>" +
                "<td style='padding:8px;'>" + p.nombre + "</td>" +
                "<td style='padding:8px;'>" + p.categoria.split('-').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ') + "</td>" +
                "<td style='padding:8px;'>" + formatPrecio(p.precio) + "</td>" +
                "<td style='padding:8px;'>" + (p.descuento > 0 ? p.descuento + "%" : "-") + "</td>" +
                "<td style='padding:8px;'>" + p.stock + "</td>" +
                "<td style='padding:8px;'>" +
                    "<a href='alta-producto.html?edit=" + p.id + "' style='margin-right:8px;color:#4a7c5a;'>Editar</a>" +
                    "<button onclick='eliminarProducto(" + p.id + ",\"" + p.nombre.replace(/"/g,'&quot;') + "\")' style='background:none;border:none;color:#e74c3c;cursor:pointer;'>Eliminar</button>" +
                "</td></tr>";
        });
        html += "</tbody></table>";
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = "<p>Error al cargar productos: " + err.message + "</p>";
    }
}

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
