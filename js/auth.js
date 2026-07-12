// --- Sesión: lectura de datos del usuario desde sessionStorage ---

function isLoggedIn() {
    return sessionStorage.getItem("userId") !== null;
}

function getUserRol() {
    return sessionStorage.getItem("userRol") || "";
}

function getUserId() {
    return sessionStorage.getItem("userId");
}

function getUserNombre() {
    return sessionStorage.getItem("userNombre") || "";
}

function isAdmin() {
    return getUserRol() === "admin";
}

// Autentica contra Supabase y guarda sesión en sessionStorage
async function login(username, password) {
    var data = await supaFetch('GET', 'Usuarios?select=*&email=eq.' + encodeURIComponent(username) + '&password=eq.' + encodeURIComponent(password) + '&limit=1');
    if (!data || data.length === 0) return false;
    var user = data[0];
    sessionStorage.setItem("userId", user.id);
    sessionStorage.setItem("userEmail", user.email);
    sessionStorage.setItem("userNombre", user.nombre);
    sessionStorage.setItem("userRol", user.rol);
    return true;
}

// Cierra sesión: limpia storage y actualiza UI
function logout() {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userNombre");
    sessionStorage.removeItem("userRol");
    updateNav();
    closeLoginModal();
}

function showLoginError() {
    const msg = document.getElementById("login-error");
    if (msg) msg.style.display = "block";
}

// Maneja el envío del formulario de login
async function handleLoginSubmit(e) {
    e.preventDefault();
    const username = document.getElementById("login-user").value;
    const password = document.getElementById("login-pass").value;
    const ok = await login(username, password);
    if (ok) {
        updateNav();
        closeLoginModal();
        const current = window.location.pathname.split("/").pop();
        if (current === "alta-producto.html") {
            window.location.reload();
        }
    } else {
        showLoginError();
    }
}

// Modal de inicio de sesión
function openLoginModal() {
    const modal = document.getElementById("login-modal");
    if (modal) modal.classList.add("active");
    document.body.classList.add("no-scroll");
    const form = document.getElementById("login-form");
    if (form) {
        form.reset();
        const msg = document.getElementById("login-error");
        if (msg) msg.style.display = "none";
    }
}

function closeLoginModal() {
    const modal = document.getElementById("login-modal");
    if (modal) modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
}

// Actualiza el badge del carrito con la cantidad total de items
async function updateCarritoBadge() {
    const badge = document.getElementById("carrito-badge");
    if (!badge) return;
    if (!isLoggedIn()) {
        badge.textContent = "0";
        badge.style.display = "none";
        return;
    }
    try {
        var data = await supaFetch('GET', 'Carrito?select=cantidad&usuario_id=eq.' + getUserId());
        const total = (data || []).reduce(function (sum, item) { return sum + item.cantidad; }, 0) || 0;
        badge.textContent = total;
        badge.style.display = total > 0 ? "flex" : "none";
    } catch (_) {
        // Error al obtener badge del carrito — se mantiene el valor actual
    }
}

// Actualiza la navegación: muestra/oculta "Alta Producto" según rol y el botón de login
function updateNav() {
    const altaItem = document.getElementById("nav-alta-producto");
    const loginItem = document.getElementById("nav-login");
    if (altaItem) {
        altaItem.style.display = isAdmin() ? "" : "none";
    }
    if (loginItem) {
        loginItem.innerHTML = isLoggedIn()
            ? '<a href="#" onclick="logout()">Cerrar sesión (' + getUserNombre() + ')</a>'
            : '<a href="#" onclick="openLoginModal()">Ingresar</a>';
    }
    updateCarritoBadge();
}

// Inyecta el HTML del modal de login y actualiza la navegación al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    const loginModalHtml = `
    <div id="login-modal" class="login-modal">
        <div class="login-modal-backdrop" onclick="closeLoginModal()"></div>
        <div class="login-modal-content">
            <div class="login-modal-header">
                <h2>Iniciar sesión</h2>
                <button class="login-cerrar" onclick="closeLoginModal()">✕</button>
            </div>
            <form id="login-form" onsubmit="handleLoginSubmit(event)">
                <div>
                    <label for="login-user">Usuario</label>
                    <input type="text" id="login-user" name="username" required autocomplete="username">
                </div>
                <div>
                    <label for="login-pass">Contraseña</label>
                    <input type="password" id="login-pass" name="password" required autocomplete="current-password">
                </div>
                <p id="login-error" class="login-error">Usuario o contraseña incorrectos.</p>
                <div class="login-actions">
                    <button type="submit">Ingresar</button>
                </div>
            </form>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML("beforeend", loginModalHtml);
    updateNav();
});
