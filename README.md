# Dani Events - Daniella Zapata Edition

Frontend oficial de Dani Events desarrollado en **React, TypeScript y Vite**, conectado a una API NestJS (`prueba-de-desempe-o-plancity-api` creado por el usuario en GitHub `Dani05-18`). Esta es una **web personalizada y exclusiva de Daniella Zapata**, con un diseño rediseñado para destacar un estilo elegante y femenino, manteniendo la funcionalidad ligera y moderna original para el descubrimiento y gestión de eventos.

## 🚀 Tecnologías Principales

- **[React](https://react.dev/) 19**
- **[TypeScript](https://www.typescriptlang.org/)** para seguridad estructural de los contratos del servidor y escalabilidad.
- **[Vite](https://vitejs.dev/)** como empaquetador eficiente de ultra-baja latencia.
- **[React Router DOM](https://reactrouter.com/)** para navegación robusta con guardias (Protected Routes y Admin Routes).
- **[Axios](https://axios-http.com/)** para persistencia de conexión e intercepción 2-way de JSON Web Tokens (JWT).

## 🗂️ Estructura del Proyecto

El código está confinado de forma limpia en la carpeta `src/`.

### 🧠 Justificación de Decisiones Técnicas

- **Librería HTTP (Axios):** Se eligió Axios por encima de `fetch` nativo debido a la simplicidad para definir interceptores (Request/Response) globales. En particular, la aplicación usa el interceptor de Respuesta de Axios para detectar inyecciones o expiraciones de JWT (`401 Unauthorized`) de manera global y silente, emitiendo un trigger de cierre de sesión dinámico sin romper el flujo de UI.
- **Persistencia de Sesión (LocalStorage):** El token JWT se almacena en `localStorage` (en lugar de cookies o `sessionStorage`) para permitir una rehidratación transparente de la sesión entre distintas pestañas y tras reiniciar el navegador, mejorando drásticamente la experiencia de usuario (UX) para eventos, ya que los usuarios comunes no son retados logísticamente por el inicio de sesión cada vez que cierran el navegador, confiando la seguridad temporal al backend con periodos de caducidad cortos.

```
frontend/
├── .env.example
├── public/                 # Assets estáticos
└── src/
    ├── api/                # Axios instance, interceptors, error handling y servicios
    ├── components/
    │   ├── guards/         # ProtectedRoute, AdminRoute
    │   ├── layout/         # Layout principal, Navbar
    │   └── ui/             # Componentes reutilizables (EventCard, Spinners)
    ├── context/            # AuthContext (Estado local user/token/roles y login/logout)
    ├── pages/
    │   ├── admin/          # Vistas para los administradores (Gestión Categorías / Eventos)
    │   ├── auth/           # Login / Register
    │   ├── profile/        # Mi Perfil y Mis Favoritos
    │   └── public/         # Vistas públicas: Home (Búsquedas) y Event Detail
    ├── types/              # Tipificados estrictos basados en BACKEND_CONTRACT.md
    ├── App.tsx             # Entry-point del enrutado React-Router
    ├── index.css           # Design System Vanilla CSS (Variables y UI tokenizada)
    └── main.tsx            # Arranque React StrictMode
```

## 🔐 Seguridad y Funcionalidades Principales

El frontend delega **siempre** la autoridad de la información y restricción al Backend (JWT Stateless).

- **Interceptores de Axios:** Todo request autenticado inserta el token en memoria automáticamente en el header `Authorization: Bearer <T>`.
- **Expiraciones Dinámicas:** Un interceptor maestro evalúa los códigos `401 Unauthorized` retornados por el servidor. Ante la expiración, vacía automáticamente los estados persistidos para forzar el re-login en vez de bloquearse.
- **Autorización Local:** React Router esconde o revela rutas críticas, pero *no substituye la protección real*. Intentar alterar las rutas manualmente en navegador causará reyecciones HTTP por el Guard de NestJS.
- **Búsqueda Avanzada:** Home cuenta con llamadas parametrizadas del lado backend (vía `search` context) optimizadas para devolver exactamente los parámetros requeridos.
- **Fav-Locking:** Controles visuales evitan peticiones múltiples para un botón de la API mediante mecanismos anti-duplicidad local.
- **Resolución de Conflictos:** Todos los endpoints manejan e interpretan mensajes HTTP provistos por Nest y formatea errores nativos de TypeORM ante eliminaciones forzadas.

## 🛠️ Instalación y Configuración

1. **Requisitos previos:**

   - Node.js (se recomienda la versión v20+)
   - Contar con el Backend de prueba-de-desempe-o-plancity-api corriendo desde la cuenta de Dani05-18.
2. **Instalación de dependencias:**

   ```bash
   cd frontend
   npm install
   ```
3. **Variables de Entorno:**
   Copia el archivo base y ajusta la métrica (por defecto conectará a `http://localhost:3000`):

   ```bash
   cp .env.example .env
   ```

## 💻 Entorno de Desarrollo y Producción

> **Ejecutar servidor local de desarrollo con Hot-Reload (Vite):**

* [ ] 
  ```bash
  npm run dev
  # Estará disponible en http://localhost:5173
  ```

> **Verificar Reglas Estrictas de Tipo (TypeScript):**

```bash
npm run typecheck
```

> **Generar paquete optimizado para la nube / producción:**

```bash
npm run build
```

*(Los archivos se compilarán aligerados y cacheados dentro de la carpeta `/dist`).*
