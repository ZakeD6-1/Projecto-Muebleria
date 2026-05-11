function isLoggedIn() {
    return sessionStorage.getItem("isLoggedIn") === "true";
}

function login(username, password) {
    if (username === "admin" && password === "admin") {
        sessionStorage.setItem("isLoggedIn", "true");
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem("isLoggedIn");
    updateNav();
    closeLoginModal();
}

function showLoginError() {
    const msg = document.getElementById("login-error");
    if (msg) msg.style.display = "block";
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const username = document.getElementById("login-user").value;
    const password = document.getElementById("login-pass").value;
    if (login(username, password)) {
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

function updateNav() {
    const altaItem = document.getElementById("nav-alta-producto");
    const loginItem = document.getElementById("nav-login");
    if (altaItem) {
        altaItem.style.display = isLoggedIn() ? "" : "none";
    }
    if (loginItem) {
        loginItem.innerHTML = isLoggedIn()
            ? '<a href="#" onclick="logout()">Cerrar sesión</a>'
            : '<a href="#" onclick="openLoginModal()">Ingresar</a>';
    }
}

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
                <p id="login-error" class="login-error" style="display:none;">Usuario o contraseña incorrectos.</p>
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
