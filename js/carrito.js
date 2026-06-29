async function cargarCarrito() {
    var container = document.getElementById("carrito-contenido");
    if (!isLoggedIn()) {
        container.innerHTML =
            '<div class="carrito-login-msg">' +
                '<p>Inicia sesión para ver tu carrito.</p>' +
                '<button onclick="openLoginModal()">Iniciar sesión</button>' +
            '</div>';
        return;
    }
    try {
        var items = await supaGetCarrito(getUserId());
        if (items.length === 0) {
            container.innerHTML =
                '<div class="carrito-vacio">' +
                    '<p>Tu carrito está vacío.</p>' +
                    '<a href="catalogo.html">Ir al catálogo</a>' +
                '</div>';
            return;
        }
        var total = 0;
        var html = '<table class="carrito-tabla">' +
            '<thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead><tbody>';
        items.forEach(function (item) {
            var p = item.Productos;
            var desc = p.descuento || 0;
            var precioFinal = desc > 0 ? Math.round(p.precio * (1 - desc / 100)) : p.precio;
            var subtotal = precioFinal * item.cantidad;
            total += subtotal;
            var img = p.imagen || "";
            html += '<tr>' +
                '<td class="carrito-producto">' +
                    (img ? '<img class="carrito-thumb" src="' + img + '" alt="' + p.nombre + '">' : '') +
                    '<span>' + p.nombre + '</span>' +
                '</td>' +
                '<td>' + (desc > 0 ? formatPrecio(precioFinal) + ' <span class="badge-descuento">-' + desc + '%</span>' : formatPrecio(p.precio)) + '</td>' +
                '<td>' +
                    '<div class="carrito-cantidad">' +
                        '<button onclick="cambiarCantidad(' + item.id + ', ' + (item.cantidad - 1) + ')">-</button>' +
                        '<span>' + item.cantidad + '</span>' +
                        '<button onclick="cambiarCantidad(' + item.id + ', ' + (item.cantidad + 1) + ')">+</button>' +
                    '</div>' +
                '</td>' +
                '<td>' + formatPrecio(subtotal) + '</td>' +
                '<td><button class="btn-eliminar-item" onclick="eliminarItem(' + item.id + ')">✕</button></td>' +
            '</tr>';
        });
        html += '</tbody></table>';
        html += '<div class="carrito-total">Total: ' + formatPrecio(total) + '</div>';
        html += '<div class="carrito-acciones">' +
            '<button class="btn-comprar" onclick="comprar()">Comprar</button>' +
        '</div>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<p>Error al cargar el carrito: ' + e.message + '</p>';
    }
}

async function cambiarCantidad(cartItemId, nuevaCant) {
    try {
        await supaUpdateCantidad(cartItemId, nuevaCant);
        await cargarCarrito();
        updateCarritoBadge();
    } catch (e) {
        alert("Error: " + e.message);
    }
}

async function eliminarItem(cartItemId) {
    try {
        await supaRemoveFromCart(cartItemId);
        await cargarCarrito();
        updateCarritoBadge();
    } catch (e) {
        alert("Error: " + e.message);
    }
}

function comprar() {
    window.location.href = "checkout.html";
}

function openCarritoProducto(nombre, img, desc, precio) {
    const modal = document.getElementById("producto-modal");
    document.getElementById("carrito-modal-img").src = img;
    document.getElementById("carrito-modal-img").alt = nombre;
    document.getElementById("carrito-modal-nombre").textContent = nombre;
    document.getElementById("carrito-modal-desc").textContent = desc;
    document.getElementById("carrito-modal-precio").textContent = precio;
    modal.classList.add("active");
    document.body.classList.add("no-scroll");
}

function closeCarritoProducto() {
    const modal = document.getElementById("producto-modal");
    modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
}

document.addEventListener("DOMContentLoaded", function () {
    cargarCarrito();
});
