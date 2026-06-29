async function cargarCheckout() {
    var container = document.getElementById("checkout-contenido");
    if (!isLoggedIn()) {
        container.innerHTML =
            '<div class="checkout-vacio">' +
                '<p>Inicia sesión para continuar.</p>' +
                '<button onclick="openLoginModal()" class="btn-checkout-login">Iniciar sesión</button>' +
            '</div>';
        return;
    }
    try {
        var items = await supaGetCarrito(getUserId());
        if (items.length === 0) {
            container.innerHTML =
                '<div class="checkout-vacio">' +
                    '<p>Tu carrito está vacío.</p>' +
                    '<a href="catalogo.html">Ir al catálogo</a>' +
                '</div>';
            return;
        }
        renderCheckout(container, items);
    } catch (e) {
        container.innerHTML = '<p>Error al cargar el carrito: ' + e.message + '</p>';
    }
}

function renderCheckout(container, items) {
    var total = 0;
    var html = '<div class="checkout-section">' +
        '<h2>Resumen del pedido</h2>' +
        '<div id="checkout-resumen"><table>' +
        '<thead><tr><th>Producto</th><th>Cant.</th><th>Subtotal</th></tr></thead><tbody>';
    items.forEach(function (item) {
        var p = item.Productos;
        var desc = p.descuento || 0;
        var precioFinal = desc > 0 ? Math.round(p.precio * (1 - desc / 100)) : p.precio;
        var subtotal = precioFinal * item.cantidad;
        total += subtotal;
        html += '<tr><td>' + p.nombre + '</td><td>' + item.cantidad + '</td><td>' + formatPrecio(subtotal) + '</td></tr>';
    });
    html += '</tbody></table></div>' +
        '<div class="checkout-total">Total: ' + formatPrecio(total) + '</div>' +
    '</div>';

    html += '<form id="checkout-form" onsubmit="procesarPago(event)">' +
        '<div class="checkout-section">' +
            '<h2>Datos de pago</h2>' +
            '<div class="checkout-field">' +
                '<label for="checkout-tarjeta">Tipo de tarjeta</label>' +
                '<select id="checkout-tarjeta" required>' +
                    '<option value="">Seleccionar</option>' +
                    '<option value="debito">Débito</option>' +
                    '<option value="credito">Crédito</option>' +
                '</select>' +
            '</div>' +
            '<div class="checkout-field">' +
                '<label for="checkout-titular">Nombre del titular</label>' +
                '<input type="text" id="checkout-titular" required>' +
            '</div>' +
            '<div class="checkout-field">' +
                '<label for="checkout-numero">Número de tarjeta</label>' +
                '<input type="text" id="checkout-numero" required maxlength="19" placeholder="1234 5678 9012 3456">' +
            '</div>' +
            '<div class="checkout-row">' +
                '<div class="checkout-field">' +
                    '<label for="checkout-vencimiento">Vencimiento</label>' +
                    '<input type="text" id="checkout-vencimiento" required placeholder="MM/AA" maxlength="5">' +
                '</div>' +
                '<div class="checkout-field">' +
                    '<label for="checkout-cvv">CVV</label>' +
                    '<input type="text" id="checkout-cvv" required maxlength="4" placeholder="123">' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<div class="checkout-section">' +
            '<h2>Datos de envío</h2>' +
            '<div class="checkout-field">' +
                '<label for="checkout-nombre">Nombre completo</label>' +
                '<input type="text" id="checkout-nombre" required>' +
            '</div>' +
            '<div class="checkout-field">' +
                '<label for="checkout-direccion">Dirección</label>' +
                '<input type="text" id="checkout-direccion" required placeholder="Calle, número, piso">' +
            '</div>' +
            '<div class="checkout-row">' +
                '<div class="checkout-field">' +
                    '<label for="checkout-ciudad">Ciudad</label>' +
                    '<input type="text" id="checkout-ciudad" required>' +
                '</div>' +
                '<div class="checkout-field">' +
                    '<label for="checkout-provincia">Provincia</label>' +
                    '<input type="text" id="checkout-provincia" required>' +
                '</div>' +
            '</div>' +
            '<div class="checkout-row">' +
                '<div class="checkout-field">' +
                    '<label for="checkout-cp">Código postal</label>' +
                    '<input type="text" id="checkout-cp" required>' +
                '</div>' +
                '<div class="checkout-field">' +
                    '<label for="checkout-telefono">Teléfono</label>' +
                    '<input type="tel" id="checkout-telefono" required>' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<button type="submit" id="checkout-submit">Confirmar compra</button>' +
    '</form>';

    container.innerHTML = html;
}

async function procesarPago(e) {
    e.preventDefault();
    var btn = document.getElementById("checkout-submit");
    btn.disabled = true;
    btn.textContent = "Procesando...";
    try {
        await supaLimpiarCarrito(getUserId());
        alert("¡Compra realizada con éxito! Te llegará un resumen a tu correo.");
        window.location.href = "index.html";
    } catch (err) {
        alert("Error al procesar la compra: " + err.message);
        btn.disabled = false;
        btn.textContent = "Confirmar compra";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    cargarCheckout();
});
