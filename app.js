const API_URL = 'https://dummyjson.com';
const TOKEN_KEY = 'accessToken';

const loginForm = document.querySelector('#login-form');
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('#login-button');
const loginError = document.querySelector('#login-error');

let currentUser = null;
const loginSection = document.querySelector('#login-section');
const panelSection = document.querySelector('#panel-section');

const logoutButton = document.querySelector('#logout-button');
const profilePhoto = document.querySelector('#profile-photo');
const profileName = document.querySelector('#profile-name');
const profileEmail = document.querySelector('#profile-email');
const profilePhone = document.querySelector('#profile-phone');
const profileAge = document.querySelector('#profile-age');

function showLoginError(message) {
    loginError.textContent = message;
    loginError.hidden = false;
}

function hideLoginError() {
    loginError.hidden = true;
}

function showLogin() {
    panelSection.hidden = true;
    loginSection.hidden = false;
}

function showPanel() {
    loginSection.hidden = true;
    panelSection.hidden = false;
}

//peticiones
async function login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('Usuario o contraseña incorrectos');
        }
        throw new Error(`Error del servidor (código ${response.status})`);
    }

    return response.json();
}

//devuelve el usuario, o null si el token ya no sirve (401)
async function fetchProfile(token) {
    const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Error del servidor (código ${response.status})`);
    }

    return response.json();
}

//Pintar el perfil
function renderProfile(user) {
    const fullName = `${user.firstName} ${user.lastName}`;

    profilePhoto.src = user.image;
    profilePhoto.alt = `Foto de ${fullName}`;
    profileName.textContent = fullName;
    profileEmail.textContent = user.email;
    profilePhone.textContent = user.phone;
    profileAge.textContent = user.age;
}

//Sesion
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    currentUser = null;
    loginForm.reset();
    showLogin();
}

async function enterPanel() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        showLogin();
        return;
    }

    try {
        const user = await fetchProfile(token);

        if (user === null) {
        logout();
        showLoginError('Tu sesión expiró. Inicia sesión de nuevo.');
        return;
        }

        currentUser = user;
        renderProfile(user);
        showPanel();
    } catch (error) {
        const message = error instanceof TypeError
        ? 'No se pudo conectar con el servidor'
        : error.message;
        showLogin();
        showLoginError(message);
    }
}

//eventos
async function handleLoginSubmit(event) {
    event.preventDefault();
    hideLoginError();
    loginButton.disabled = true;
    loginButton.textContent = 'Entrando...';

    try {
        const data = await login(usernameInput.value.trim(), passwordInput.value);
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        await enterPanel();
    } catch (error) {
        const message = error instanceof TypeError
        ? 'No se pudo conectar con el servidor'
        : error.message;
        showLoginError(message);
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Entrar';
    }
}

loginForm.addEventListener('submit', handleLoginSubmit);
logoutButton.addEventListener('click', logout);

enterPanel();