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

async function login(username, password) {
    const { data, error } = await _supabase
        .from('Usuarios')
        .select('*')
        .eq('email', username)
        .eq('password', password)
        .single();
    if (error || !data) return false;
    sessionStorage.setItem("userId", data.id);
    sessionStorage.setItem("userEmail", data.email);
    sessionStorage.setItem("userNombre", data.nombre);
    sessionStorage.setItem("userRol", data.rol);
    return true;
}

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

async function updateCarritoBadge() {
    const badge = document.getElementById("carrito-badge");
    if (!badge) return;
    if (!isLoggedIn()) {
        badge.textContent = "0";
        badge.style.display = "none";
        return;
    }
    const { count, error } = await _supabase
        .from('Carrito')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', getUserId());
    if (!error) {
        badge.textContent = count || 0;
        badge.style.display = count > 0 ? "inline" : "none";
    }
}

function updateNav() {
    const altaItem = document.getElementById("nav-alta-producto");
    const loginItem = document.getElementById("nav-login");
    if (altaItem) {
        altaItem.style.display = isAdmin() ? "" : "none";
    }
    if (loginItem) {
        loginItem.innerHTML = isLoggedIn()
            ? '<a href="#" onclick="logout()">Cerrar sesi\u00f3n (' + getUserNombre() + ')</a>'
            : '<a href="#" onclick="openLoginModal()">Ingresar</a>';
    }
    updateCarritoBadge();
}

document.addEventListener("DOMContentLoaded", function () {
    const loginModalHtml = `
    <div id="login-modal" class="login-modal">
        <div class="login-modal-backdrop" onclick="closeLoginModal()"></div>
        <div class="login-modal-content">
            <div class="login-modal-header">
                <h2>Iniciar sesi\u00f3n</h2>
                <button class="login-cerrar" onclick="closeLoginModal()">\u2715</button>
            </div>
            <form id="login-form" onsubmit="handleLoginSubmit(event)">
                <div>
                    <label for="login-user">Usuario</label>
                    <input type="text" id="login-user" name="username" required autocomplete="username">
                </div>
                <div>
                    <label for="login-pass">Contrase\u00f1a</label>
                    <input type="password" id="login-pass" name="password" required autocomplete="current-password">
                </div>
                <p id="login-error" class="login-error" style="display:none;">Usuario o contrase\u00f1a incorrectos.</p>
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
