# Dani Events - Daniella Zapata Edition

Frontend de **Dani Events**, una aplicación de descubrimiento y gestión de eventos construida con **React 19, TypeScript y Vite**, que consume una API REST hecha en NestJS (`prueba-de-desempe-o-plancity-api`, cuenta `Dani05-18` en GitHub). El proyecto cubre todo el ciclo de uso de una plataforma de eventos: navegación pública, autenticación, favoritos, perfil de usuario y un panel de administración con operaciones CRUD completas, todo con tipado estricto de extremo a extremo.

## 📋 Tabla de contenido

- [Tecnologías](#-tecnologías-principales)
- [Funcionalidades implementadas](#-funcionalidades-implementadas)
- [Modelo de datos](#-modelo-de-datos)
- [Endpoints consumidos](#-endpoints-consumidos)
- [Estructura del proyecto](#️-estructura-del-proyecto)
- [Decisiones técnicas](#-justificación-de-decisiones-técnicas)
- [Instalación y configuración](#️-instalación-y-configuración)
- [Scripts disponibles](#-scripts-disponibles)
- [Pruebas](#-pruebas)
- [Limitaciones conocidas](#-limitaciones-conocidas)

## 🚀 Tecnologías Principales

- **[React](https://react.dev/) 19** — librería de UI, usada con componentes funcionales y hooks.
- **[TypeScript](https://www.typescriptlang.org/) ~5.7** — tipado estricto en todo el proyecto: entidades, DTOs, respuestas de error y props de componentes.
- **[Vite](https://vitejs.dev/) 6** — servidor de desarrollo y bundler de build.
- **[React Router DOM](https://reactrouter.com/) 7** — enrutamiento declarativo con rutas anidadas y guardas de acceso (`ProtectedRoute`, `AdminRoute`).
- **[Axios](https://axios-http.com/) 1.7** — cliente HTTP con interceptores de request (inyección de JWT) y de response (manejo global de `401`).
- **[Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)** — pruebas unitarias y de integración sobre JSDOM.

## ✅ Funcionalidades implementadas

### Público (sin sesión)
- **Home con listado de eventos**: trae eventos y categorías desde el backend y los muestra en una grilla de tarjetas (`EventCard`).
- **Búsqueda por texto**: barra de búsqueda que filtra eventos por nombre/descripción vía el parámetro `search` de la API.
- **Filtro por categoría**: chips de categoría (incluido "Todos") que filtran los eventos vía el parámetro `categoryId`.
- **Detalle de evento**: página individual con imagen principal, categoría, fecha formateada en español (`es-CO`), ubicación, precio (o "Entrada Libre" si es 0), capacidad, descripción y galería de imágenes adicionales.
- **Estado vacío**: mensaje dedicado cuando una búsqueda o filtro no arroja resultados.
- **Página 404**: ruta comodín (`*`) para URLs no encontradas.

### Autenticación
- **Registro** (`/register`) con nombre, correo y contraseña (mínimo 6 caracteres).
- **Login** (`/login`) con correo y contraseña.
- **Logout**: invalida la sesión en backend y limpia el estado local, redirigiendo a `/login`.
- **Persistencia de sesión**: el `accessToken` (JWT) se guarda en `localStorage` bajo la clave `dani_events_token` y se rehidrata automáticamente al recargar la página, validando el token contra `/users/me`.
- **Cierre de sesión automático ante expiración**: un interceptor de Axios detecta respuestas `401`, limpia el token guardado y redirige a `/login` sin que el usuario deba hacer nada manualmente.
- **Manejo de errores del backend**: los mensajes de validación de NestJS (que pueden venir como `string` o `string[]`) se normalizan y muestran en pantalla mediante `getApiErrorMessage`.

### Usuario autenticado
- **Favoritos**: agregar/quitar un evento de favoritos desde la tarjeta (`EventCard`) o desde el detalle del evento, con control anti-doble-clic (`favLoading`) mientras la petición está en curso.
- **Página "Mis Favoritos"**: lista solo los eventos marcados, con estado vacío propio y actualización optimista de la lista al quitar un favorito.
- **Perfil**: muestra nombre, correo, rol y fecha de registro del usuario autenticado.
- **Cambio de contraseña**: formulario con contraseña actual y nueva (mínimo 6 caracteres), con mensajes de éxito/error.

### Panel de administración (rol `admin`)
- **Gestión de categorías** (`/admin/categories`): tabla con listado, creación, edición y eliminación de categorías mediante un modal reutilizable. Si el backend rechaza el borrado (por tener eventos asociados) se muestra un mensaje explicativo en vez del error crudo.
- **Gestión de eventos** (`/admin/events`): tabla con listado, creación y edición de eventos mediante modal con formulario completo (nombre, categoría, fecha/hora, ubicación, precio, capacidad, URL de imagen principal, descripción) y eliminación con confirmación.
- **Formateo de fecha para inputs**: al editar un evento, la fecha ISO del backend se convierte al formato que exige `<input type="datetime-local">` respetando la zona horaria local, y se reconvierte a ISO al guardar.

### Seguridad y control de acceso
- **`ProtectedRoute`**: exige sesión activa; si no hay usuario autenticado, redirige a `/login`.
- **`AdminRoute`**: exige sesión activa **y** rol `admin`; si el usuario no es admin, redirige a `/`.
- **Defensa en profundidad**: el frontend oculta rutas/opciones según el rol, pero la autorización real la sigue validando el backend (guards de NestJS), de modo que manipular la URL manualmente no da acceso real a los datos.
- **`ErrorBoundary`**: captura errores de renderizado no controlados en cualquier parte del árbol de componentes y muestra una pantalla de recuperación con botón para volver al inicio, en vez de una pantalla en blanco.

## 🧬 Modelo de datos

Los tipos en `src/types/index.ts` reflejan exactamente las entidades y DTOs del backend:

| Entidad/DTO | Campos principales |
|---|---|
| `User` | `id`, `name`, `email`, `role` (`admin` \| `user`), `createdAt` |
| `Category` | `id`, `name`, `description`, `createdAt`, `updatedAt` |
| `Event` | `id`, `name`, `description`, `date`, `location`, `price`, `capacity`, `categoryId`, `category`, `images[]`, `createdAt`, `updatedAt` |
| `EventImage` | `id`, `url`, `order`, `eventId`, `createdAt` |
| `Favorite` | `id`, `userId`, `eventId`, `event`, `createdAt` |
| `RegisterDto` / `LoginDto` | credenciales de entrada para auth |
| `AuthResponseDto` | `accessToken`, `user` |
| `ChangePasswordDto` | `currentPassword`, `newPassword` |
| `Create/UpdateCategoryDto`, `Create/UpdateEventDto` | payloads de administración |
| `QueryEventParams` | `search`, `categoryId` (filtros de `/events`) |
| `ApiErrorResponse` | `statusCode`, `message` (`string \| string[]`), `error` |

## 🔌 Endpoints consumidos

Todos los servicios viven en `src/api/` y se agrupan por dominio:

- **`authApi`** (`src/api/auth.ts`): `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`.
- **`usersApi`** (`src/api/users.ts`): `GET /users/me`, `PATCH /users/me/password`.
- **`categoriesApi`** (`src/api/categories.ts`): `GET /categories`, `GET /categories/:id`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`.
- **`eventsApi`** (`src/api/events.ts`): `GET /events` (con `search`/`categoryId`), `GET /events/:id`, `POST /events`, `PATCH /events/:id`, `DELETE /events/:id`.
- **`favoritesApi`** (`src/api/favorites.ts`): `GET /favorites`, `POST /favorites/:eventId`, `DELETE /favorites/:eventId`.

Toda la comunicación pasa por una única instancia de Axios (`src/api/client.ts`) configurada con `baseURL` desde `VITE_API_BASE_URL`.

## 🗂️ Estructura del proyecto

```
frontend/
├── .env.example
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── src/
    ├── api/                     # Instancia de Axios, interceptores, manejo de errores y un servicio por recurso
    │   ├── client.ts            # baseURL, interceptores request/response, helpers de token
    │   ├── errors.ts            # getApiErrorMessage / getApiErrorStatus
    │   ├── auth.ts / users.ts / categories.ts / events.ts / favorites.ts
    │   └── index.ts             # barril de exportación
    ├── components/
    │   ├── guards/               # ProtectedRoute, AdminRoute, ErrorBoundary
    │   ├── layout/                # Layout (wrapper con <Outlet/>), Navbar
    │   └── ui/                    # EventCard, LoadingSpinner
    ├── context/
    │   └── AuthContext.tsx        # Estado global de sesión: user, token, rol, login/register/logout
    ├── hooks/
    │   └── useFetch.ts            # Hook genérico GET<T> con manejo de loading/error diferenciado (red, 400/422, 401/403)
    ├── pages/
    │   ├── admin/                 # AdminCategoriesPage, AdminEventsPage (CRUD con modal)
    │   ├── auth/                  # LoginPage, RegisterPage (+ LoginPage.test.tsx)
    │   ├── favorites/             # FavoritesPage
    │   ├── profile/                # ProfilePage (datos + cambio de contraseña)
    │   ├── public/                 # HomePage, EventDetailPage, NotFoundPage
    │   └── index.tsx               # barril de exportación de páginas
    ├── types/
    │   └── index.ts                # Entidades, DTOs y tipos de error basados en el contrato del backend
    ├── utils/
    │   └── formatters.ts            # formatToCurrency (+ formatters.test.ts)
    ├── App.tsx                       # Definición de rutas (públicas, protegidas y de admin)
    ├── index.css                      # Design system en CSS plano (variables, componentes UI)
    ├── main.tsx                        # Punto de arranque de React (StrictMode)
    └── setupTests.ts                    # Configuración global de Vitest/Testing Library
```

## 🧠 Justificación de decisiones técnicas

- **Axios en lugar de `fetch` nativo**: se eligió Axios por la facilidad de declarar interceptores globales de request/response. El interceptor de respuesta detecta `401 Unauthorized` en cualquier petición, limpia la sesión y dispara el logout automático sin que cada componente tenga que manejarlo por su cuenta.
- **Persistencia del JWT en `localStorage`**: se prefirió sobre `sessionStorage` o cookies para que la sesión sobreviva a recargas de página y se comparta entre pestañas, delegando la expiración real de la sesión al tiempo de vida corto del token en el backend.
- **Un servicio por recurso en `src/api/`**: cada archivo (`auth`, `users`, `categories`, `events`, `favorites`) expone únicamente los métodos HTTP que ese recurso soporta, tipados con los DTOs de `src/types`, para que cualquier cambio de contrato del backend se detecte en tiempo de compilación.
- **`AuthContext` como única fuente de verdad de sesión**: centraliza `user`, `token`, `role`, `authenticated` y `loading`, evitando estados duplicados o desincronizados entre componentes.
- **Guardas de ruta declarativas (`ProtectedRoute`/`AdminRoute`)**: usan `<Outlet />` de React Router para envolver grupos de rutas en vez de repetir la validación en cada página.
- **`ErrorBoundary` de clase**: React aún requiere un componente de clase para capturar errores de renderizado; se usa exclusivamente para eso, sin lógica de negocio dentro.

## 🛠️ Instalación y configuración

1. **Requisitos previos**
   - Node.js v20 o superior.
   - El backend `prueba-de-desempe-o-plancity-api` (cuenta `Dani05-18`) corriendo y accesible (por defecto en `http://localhost:3000`).

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Variable disponible:

   | Variable | Descripción | Valor por defecto |
   |---|---|---|
   | `VITE_API_BASE_URL` | URL base del backend (sin `/` al final) | `http://localhost:3000` |

## 📜 Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo con Hot Reload en `http://localhost:5173`. |
| `npm run build` | Verifica tipos (`tsc -b`) y genera el build de producción en `/dist`. |
| `npm run preview` | Sirve localmente el build ya generado, para probarlo como en producción. |
| `npm run typecheck` | Corre `tsc --noEmit` para verificar tipos sin generar archivos. |

> **Nota:** el proyecto tiene Vitest y Testing Library instalados y archivos de prueba ya escritos (`LoginPage.test.tsx`, `formatters.test.ts`), pero `package.json` no incluye un script `test`. Mientras no se agregue, las pruebas se pueden correr con `npx vitest`.

## 🧪 Pruebas

- **Configuración**: `vitest.config.ts` usa el plugin de React, entorno `jsdom` y `src/setupTests.ts` como archivo de configuración global (incluye matchers de `@testing-library/jest-dom`).
- **Pruebas existentes**:
  - `src/pages/auth/LoginPage.test.tsx`: prueba de integración que renderiza `LoginPage` dentro de `AuthProvider` y `BrowserRouter`, y verifica que el formulario y sus textos clave se muestren correctamente.
  - `src/utils/formatters.test.ts`: pruebas unitarias de `formatToCurrency` (formato de moneda en pesos colombianos, incluido el caso `0`).
- **Cómo ejecutarlas**: `npx vitest` (modo watch) o `npx vitest run` (una sola pasada).

## ⚠️ Limitaciones conocidas

- El endpoint `/favorites` no permite verificar si **un** evento puntual es favorito; por eso `EventDetailPage` trae todos los favoritos del usuario y busca el evento en esa lista. Es correcto funcionalmente, pero no escalaría bien con muchos favoritos.
- Las imágenes de un evento se gestionan como una lista de URLs de texto (no hay subida de archivos); el formulario de administración de eventos solo permite cargar una URL de imagen principal.
- El manejo de errores de eliminación de categorías con eventos asociados asume que el backend responde `500`; si el backend cambia ese código de estado, el mensaje amigable dejaría de mostrarse.

---

## Cómo reemplazar tu README actual por este

1. Abre el proyecto en tu editor y ubica el archivo `README.md` en la raíz.
2. Selecciona todo su contenido actual y bórralo.
3. Copia el contenido de este documento y pégalo completo en `README.md` (o descarga este archivo y usa `mv README.new.md README.md` desde la terminal, reemplazando cuando te lo pida).
4. Guarda el archivo.
5. Si el proyecto está en Git, confirma el cambio:

   ```bash
   git add README.md
   git commit -m "docs: ampliar README con funcionalidades, endpoints y guía de pruebas"
   git push
   ```

Con eso tu repositorio queda con la versión nueva y más completa.
