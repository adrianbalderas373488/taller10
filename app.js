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

//listas de tareas
let todos = [];
const statTotal = document.querySelector('#stat-total');
const statCompleted = document.querySelector('#stat-completed');
const statPending = document.querySelector('#stat-pending');
const statPercent = document.querySelector('#stat-percent');
const todoList = document.querySelector('#todo-list');
const todosMessage = document.querySelector('#todos-message');

const filterSelect = document.querySelector('#filter');
const searchInput = document.querySelector('#search');

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
    todos = [];
    filterSelect.value = 'all';
  searchInput.value = '';
    loginForm.reset();
    showLogin();
}

async function updateTodoOnServer(id, completed) {
    const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
    });

    if (!response.ok) {
        throw new Error(`No se pudo actualizar la tarea (código ${response.status})`);
    }

    return response.json();
}

async function deleteTodoOnServer(id) {
    const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error(`No se pudo eliminar la tarea (código ${response.status})`);
    }

    return response.json();
}

async function handleTodoToggle(checkbox) {
    const id = Number(checkbox.closest('li').dataset.id);
    const todo = todos.find((item) => item.id === id);

    if (!todo) {
        return;
    }

    checkbox.disabled = true;

    try {
        const updatedTodo = await updateTodoOnServer(id, checkbox.checked);
        todo.completed = updatedTodo.completed;
        render();
    } catch (error) {
        checkbox.checked = todo.completed;
        showTodosMessage(getErrorMessage(error));
    } finally {
        checkbox.disabled = false;
    }
}

async function handleTodoDelete(button) {
    const id = Number(button.closest('li').dataset.id);

    button.disabled = true;

    try {
        await deleteTodoOnServer(id);
        todos = todos.filter((item) => item.id !== id);
        render();
    } catch (error) {
        showTodosMessage(getErrorMessage(error));
        button.disabled = false;
    }
}

function handleTodoListChange(event) {
    const checkbox = event.target.closest('input[type="checkbox"]');

    if (checkbox) {
        handleTodoToggle(checkbox);
    }
}

function handleTodoListClick(event) {
    const deleteButton = event.target.closest('button[data-action="delete"]');

    if (deleteButton) {
        handleTodoDelete(deleteButton);
    }
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
        await loadTodos();
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
//mensajes para la seccion de tareas
function showTodosMessage(message) {
    todosMessage.textContent = message;
    todosMessage.hidden = false;
}

function getErrorMessage(error) {
  return error instanceof TypeError
    ? 'No se pudo conectar con el servidor'
    : error.message;
}

async function fetchTodos(userId) {
    const response = await fetch(`${API_URL}/todos/user/${userId}`);

    if (!response.ok) {
        throw new Error(`Error del servidor (código ${response.status})`);
    }

    const data = await response.json();
    return data.todos;
}

function createTodoItem(todo) {
    const item = document.createElement('li');
    item.dataset.id = todo.id;

    if (todo.completed) {
        item.classList.add('completed');
    }

    const label = document.createElement('label');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;

    const text = document.createElement('span');
    text.textContent = todo.todo;

    label.append(checkbox, text);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.dataset.action = 'delete';
    deleteButton.textContent = 'Eliminar';

    item.append(label, deleteButton);
    return item;
}
function getVisibleTodos() {
    const status = filterSelect.value;
    const query = searchInput.value.trim().toLowerCase();

    return todos
        .filter((todo) => {
        if (status === 'pending') {
            return !todo.completed;
        }
        if (status === 'completed') {
            return todo.completed;
        }
        return true;
        })
        .filter((todo) => todo.todo.toLowerCase().includes(query))
        .sort((a, b) => Number(a.completed) - Number(b.completed) || a.id - b.id);
}


function renderTodos() {
    const visibleTodos = getVisibleTodos();
    const items = visibleTodos.map(createTodoItem);
    todoList.replaceChildren(...items);

    if (todos.length === 0) {
        showTodosMessage('No hay tareas para mostrar.');
    } else if (visibleTodos.length === 0) {
        showTodosMessage('Ninguna tarea coincide con el filtro o la búsqueda.');
    } else {
        todosMessage.hidden = true;
    }
}

function renderStats() {
    const total = todos.length;
    const completed = todos.reduce(
        (count, todo) => (todo.completed ? count + 1 : count),
        0
    );
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    statTotal.textContent = total;
    statCompleted.textContent = completed;
    statPending.textContent = pending;
    statPercent.textContent = percent;
}

function render() {
    renderStats();
    renderTodos();
}

//Carga
async function loadTodos() {
    todos = [];
    renderStats();
    todoList.replaceChildren();
    showTodosMessage('Cargando tareas...');

    try {
        todos = await fetchTodos(currentUser.id);
        render();
    } catch (error) {
        const message = error instanceof TypeError
        ? 'No se pudo conectar con el servidor'
        : error.message;
        showTodosMessage(message);
    }
}


loginForm.addEventListener('submit', handleLoginSubmit);
logoutButton.addEventListener('click', logout);
filterSelect.addEventListener('change', renderTodos);
searchInput.addEventListener('input', renderTodos);
todoList.addEventListener('change', handleTodoListChange);
todoList.addEventListener('click', handleTodoListClick);

enterPanel();