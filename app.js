const API_URL = 'https://dummyjson.com';
const TOKEN_KEY = 'accessToken';

const loginForm = document.querySelector('#login-form');
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('#login-button');
const loginError = document.querySelector('#login-error');

function showLoginError(message) {
    loginError.textContent = message;
    loginError.hidden = false;
}

function hideLoginError() {
    loginError.hidden = true;
}

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

async function handleLoginSubmit(event) {
    event.preventDefault();
    hideLoginError();
    loginButton.disabled = true;
    loginButton.textContent = 'Entrando...';

    try {
        const data = await login(usernameInput.value.trim(), passwordInput.value);
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        console.log('Login correcto', data);
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