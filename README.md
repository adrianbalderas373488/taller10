# Mi panel con DummyJSON

Página con HTML, CSS y JavaScript puro para iniciar sesión, ver el perfil
y administrar tareas con la API de DummyJSON.

## Métodos de arreglo usados

- `map`: en `renderTodos`, convierte cada tarea en un elemento `<li>`.
- `reduce`: en `renderStats`, cuenta las tareas completadas.
- `filter`: en `getVisibleTodos`, deja solo las tareas que cumplen el filtro y la búsqueda. También en `handleTodoDelete`, para quitar la tarea eliminada.
- `sort`: en `getVisibleTodos`, pone primero las tareas pendientes.
- `find`: en `handleTodoToggle` y `handleTodoDelete`, localiza la tarea por su id.

Página publicada: https://adrianbalderas373488.github.io/taller10/