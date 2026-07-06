// Productos destacados para el carrusel y últimos 3 productos
let destacados = [];
let nuevos = [];

// Carga todos los productos desde Supabase y separa destacados
async function cargarIndex() {
    try {
        var todos = await supaGetProductos();
        destacados = todos.filter(function (p) { return p.destacado; });
        nuevos = todos.slice(0, 3);
    } catch (e) {
        console.error("Error al cargar productos:", e);
    }
    renderCarousel();
    renderNuevos();
}

// Carrusel infinito con arrastre y auto-play
function renderCarousel() {
    const track = document.getElementById("carousel-track");
    if (destacados.length === 0) {
        track.innerHTML = '<p class="mensaje-vacio">No hay productos destacados.</p>';
        return;
    }
    // Duplica items para efecto infinito
    var items = [...destacados, ...destacados];
    track.innerHTML = items.map(function (p, i) {
        return '<article class="producto-card carousel-item">' +
            '<div class="producto-imagen">' +
                '<img src="' + p.imagen + '" alt="' + p.nombre + '">' +
            '</div>' +
            '<h3>' + p.nombre + '</h3>' +
            '<p class="precio">' + formatPrecioConDesc(p) + '</p>' +
            '<button class="btn-ver" data-index="' + i + '">Ver</button>' +
        '</article>';
    }).join("");

    var halfWidth = function () { return track.scrollWidth / 2; };
    var isDragging = false, startX = 0, scrollLeft = 0, isPaused = false;
    var scrollTimeout, initialized = false;

    function wrapScroll() {
        if (track.scrollLeft >= halfWidth()) { track.scrollLeft -= halfWidth(); }
        if (track.scrollLeft <= 0) { track.scrollLeft += halfWidth(); }
    }

    // Auto-desplazamiento continuo
    function autoScroll() {
        if (!initialized) { track.scrollLeft = halfWidth(); initialized = true; }
        if (!isDragging && !isPaused) { track.scrollLeft += 0.5; wrapScroll(); }
        requestAnimationFrame(autoScroll);
    }
    autoScroll();

    // Pausa al hacer hover o al arrastrar
    track.addEventListener("mouseenter", function () { isPaused = true; });
    track.addEventListener("mouseleave", function () {
        isPaused = false;
        if (isDragging) { isDragging = false; track.style.cursor = ""; wrapScroll(); }
    });
    track.addEventListener("mousedown", function (e) {
        isDragging = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft; track.style.cursor = "grabbing";
    });
    track.addEventListener("mousemove", function (e) {
        if (!isDragging) return; e.preventDefault();
        var x = e.pageX - track.offsetLeft;
        var walk = (x - startX) * 1.5;
        var ns = scrollLeft - walk;
        var hw = halfWidth();
        if (ns < 0) { ns += hw; startX = x; scrollLeft = ns; }
        else if (ns >= hw) { ns -= hw; startX = x; scrollLeft = ns; }
        track.scrollLeft = ns;
    });
    track.addEventListener("mouseup", function () { isDragging = false; track.style.cursor = ""; wrapScroll(); });

    // Botones de navegación lateral
    function scrollByCard(dir) {
        isPaused = true; track.scrollLeft += dir * (320 + 24); wrapScroll();
        clearTimeout(scrollTimeout); scrollTimeout = setTimeout(function () { isPaused = false; }, 3000);
    }
    document.getElementById("arrow-left").addEventListener("click", function () { scrollByCard(-1); });
    document.getElementById("arrow-right").addEventListener("click", function () { scrollByCard(1); });

    // Abre modal al hacer clic en "Ver"
    track.addEventListener("click", function (e) {
        var btn = e.target.closest(".btn-ver");
        if (btn) {
            var idx = parseInt(btn.dataset.index);
            abrirModal(destacados[idx % destacados.length]);
        }
    });
}

// Grilla con los últimos 3 productos agregados
function renderNuevos() {
    var grid = document.getElementById("nuevos-grid");
    if (nuevos.length === 0) {
        grid.innerHTML = '<p class="mensaje-vacio">No hay productos.</p>';
        return;
    }
    grid.innerHTML = nuevos.map(function (p, i) {
        return '<article class="producto-card">' +
            '<div class="producto-imagen">' +
                '<img src="' + p.imagen + '" alt="' + p.nombre + '">' +
            '</div>' +
            '<h3>' + p.nombre + '</h3>' +
            '<p class="precio">' + formatPrecioConDesc(p) + '</p>' +
            '<div class="producto-acciones"><button class="btn-ver" onclick="abrirModal(nuevos[' + i + '])">Ver</button></div>' +
        '</article>';
    }).join("");
}

document.addEventListener("DOMContentLoaded", function () {
    cargarIndex();
});

// Modal de detalle de producto
function abrirModal(p) {
    var modal = document.getElementById("producto-modal");
    document.getElementById("modal-img").src = p.imagen;
    document.getElementById("modal-img").alt = p.nombre;
    document.getElementById("modal-nombre").textContent = p.nombre;
    document.getElementById("modal-desc").textContent = p.descripcion;
    document.getElementById("modal-precio").innerHTML = formatPrecioConDesc(p);
    modal.classList.add("active");
    document.body.classList.add("no-scroll");
}

function closeProductoModal() {
    var modal = document.getElementById("producto-modal");
    modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
}
