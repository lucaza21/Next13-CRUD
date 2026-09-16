# Plan de mejora — Next13-CRUD

Plan para llevar este CRUD tutorial (Next.js 13 + Mongoose/MongoDB) a un nivel más senior en complejidad, actualización y features.

## Fase 0 — Correcciones críticas ✅ (completada)

- `libs/mongodb.js`: ya no traga errores de conexión (relanza), cachea la conexión (`readyState === 1`) y fuerza DNS público (`8.8.8.8`/`1.1.1.1`) para evitar el bug de resolución SRV de Node en Windows.
- Los 5 route handlers (`app/api/topics/route.js`, `app/api/topics/[id]/route.js`) tienen try/catch real, validan el body en POST (400 si falta título/descripción), devuelven 404 en vez de 200-con-null en GET/PUT, `runValidators: true` en el update, y manejan `CastError` en DELETE (400 en vez de 500 opaco).
- `models/topic.js`: schema con `required`, `trim`, `maxlength`.
- Eliminadas las URLs `http://localhost:3000` hardcodeadas; `TopicsList` y `editTopic/[id]` leen de Mongoose directamente desde los Server Components (sin self-fetch HTTP), usando `.lean()` + `_id.toString()`.
- `editTopic/[id]` usa `notFound()` si el topic no existe, en vez de crashear al desestructurar `undefined`/`null`.
- Typos corregidos: `EditTipicForm` → `EditTopicForm`, `setNewtitle` → `setNewTitle`.
- Configurado `next.config.js` + `.gitignore` para cargar credenciales desde `atlas-credentials.env` sin tocar `.env`.
- Verificado end-to-end contra un cluster de MongoDB Atlas real: crear, listar, editar y borrar topics funcionan. Detalles de la configuración de Atlas y problemas de red/DNS resueltos en [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Fase 1 — Validación y esquema ✅ (completada)

- Zod (`libs/validation.js`, `topicSchema`) valida el body en POST y PUT antes de tocar Mongoose; ambos devuelven 400 con `errors` por campo si falla.
- Contrato de la API unificado: PUT ahora recibe `{ title, description }` (antes `{ newTitle, newDescription }`), consistente con POST.
- `app/addTopic/page.jsx` y `components/EditTopicForm.jsx` reemplazados por un único `components/TopicForm.jsx` (`mode="add"|"edit"`), con estado `isSubmitting` (deshabilita el botón, evita doble-submit) y manejo de errores de Zod en la UI.
- `EditTopicForm.jsx` eliminado. Verificado con `npm run lint` (0 warnings/errores).
- Reemplazados `alert()`/`confirm()` nativos por **react-hot-toast**: `<Toaster />` global en `app/layout.js`, toasts de éxito/error en `TopicForm.jsx`, y un toast custom con botones "Eliminar"/"Cancelar" en `RemoveBtn.jsx` reemplazando el `confirm()` del navegador.
- Endurecido: `GET`/`PUT` en `[id]/route.js` devuelven 400 (no 500) ante un `id` malformado, igual que `DELETE`.
- Botón "Cancelar" en `TopicForm.jsx` (crear/editar) que vuelve a `/` sin guardar.
- Rediseño visual completo con Tailwind (paleta esmeralda consistente): fondo con gradiente en `app/layout.js`, navbar con gradiente oscuro y botón de acento, cards con hover/elevación y backdrop-blur en `TopicsList.jsx`, inputs con focus ring y card de formulario en `TopicForm.jsx`. Sin librerías de UI nuevas.

## Fase 2 — Modernizar a patrones actuales de Next (14/15) ✅ (completada)

- **Server Actions** (`app/actions/topics.js`, `"use server"`): `createTopic`, `updateTopic`, `deleteTopic` — validan con Zod, usan Mongoose directo, y llaman `revalidatePath("/")`. Contrato de retorno consistente: `{ success, message, errors? }`.
- `TopicForm.jsx` y `RemoveBtn.jsx` llaman las Server Actions directamente (ya no hacen `fetch`).
- **Eliminadas las API routes** (`app/api/topics/route.js`, `app/api/topics/[id]/route.js`) — decisión consciente de ir 100% a Server Actions en vez de mantener una REST API paralela.
- `experimental.serverActions: true` habilitado en `next.config.js` (requerido en Next 13.4; se puede quitar al subir a Next 14+, donde es estable).
- Agregados `app/loading.js`, `app/editTopic/[id]/loading.js`, `app/not-found.js` (cubre tanto `notFound()` explícito como rutas inexistentes reales — verificado con `curl` que responde 404), y `app/error.js` (error boundary con botón "Reintentar").
- Bug encontrado y corregido en vivo: `editTopic/[id]/page.jsx` no atrapaba `CastError` al pedir un topic con `id` con formato inválido, cayendo al `error.js` genérico en vez del `not-found.js`. Ahora `getTopicById` captura `CastError` y retorna `null`, dejando que `notFound()` se dispare correctamente.
- Verificado end-to-end contra Atlas real (conexión, páginas cargando, 404 real y `notFound()` mostrando la página custom).
- **Pendiente para más adelante** (decisión explícita, no ahora): migrar a TypeScript. Si se sube a Next 15, recordar que `params` pasa a ser `Promise` en `editTopic/[id]/page.jsx`.

## Fase 3 — Features "senior" (en progreso)

### Autenticación y autorización ✅ (completada)

- **Auth local** con NextAuth v4 (Credentials provider, sesión JWT, sin dependencias externas): `models/user.js` (email/password hasheado con bcryptjs/role), `libs/authOptions.js`, `app/api/auth/[...nextauth]/route.js`.
- Registro vía Server Action (`app/actions/auth.js`, `registerUser`) — quien se registra con el email de `ADMIN_EMAIL` (variable de entorno) queda automáticamente como `role: "admin"`.
- Páginas `/login` y `/register`, `Navbar.jsx` con estado de sesión (login/registro si no hay sesión; email + "Add Topic" + "Cerrar sesión" + "Admin" si hay sesión y es admin).
- **Ownership real**: `Topic` ahora tiene `owner` (ref a `User`). `createTopic` requiere sesión y asigna el owner; `updateTopic`/`deleteTopic` verifican `isOwner || isAdmin` antes de mutar. `TopicsList.jsx` solo muestra los botones de editar/borrar al dueño o a un admin.
- **Middleware** (`middleware.js`) protege `/addTopic`, `/editTopic/**` (requiere sesión) y `/admin` (requiere `role: "admin"`), redirigiendo a `/login`.
- **Panel de admin** (`/admin`): lista todos los usuarios, permite borrar cuentas (con confirmación vía toast, no puede borrarse a sí mismo) — al borrar un usuario se borran en cascada sus topics (`app/actions/admin.js`).
- La ruta `/` también quedó protegida por el middleware (requiere sesión) — el listado de topics ya no es público.
- **Bug de configuración encontrado y corregido**: `NEXTAUTH_SECRET`/`NEXTAUTH_URL` deben vivir en un archivo `.env`/`.env.local` **nativo** de Next (no en `atlas-credentials.env`, que se carga con un loader custom que solo corre en runtime Node.js). `middleware.js` corre en Edge Runtime y no veía esas variables, causando un error de configuración de NextAuth al proteger `/`. Solución: `NEXTAUTH_SECRET`/`NEXTAUTH_URL` van en `.env.local` (nativo, gitignored); `MONGODB_URI`/`ADMIN_EMAIL` siguen en `atlas-credentials.env` (solo se usan en Node.js runtime).
- Scripts de mantenimiento en `scripts/` (uso manual, no se ejecutan como parte de la app): `assign-owner-to-legacy-topics.js` (asigna los topics sin `owner` a un usuario dado) y `promote-to-admin.js` (sube el rol de una cuenta existente a `admin` sin perder la cuenta). Ya usados una vez para migrar los datos previos a este cambio.

### Paginación y búsqueda ✅ (completada)

- `components/SearchBar.jsx` (Client): input que actualiza `?q=` en la URL (resetea a página 1).
- `components/Pagination.jsx` (Server): links "Anterior"/"Siguiente" + "Página X de Y", preservando `q`; no se renderiza si hay una sola página.
- `TopicsList.jsx`: `PAGE_SIZE = 5`, filtro `$or` con `$regex` case-insensitive sobre `title`/`description`, `countDocuments` + `skip`/`limit`, página clamped a un rango válido.
- **Hardening aplicado**: el texto de búsqueda se escapa (`escapeRegExp`) antes de construir el filtro — sin esto, un query como `(a+)+$` podía causar ReDoS (bloqueo del proceso por backtracking catastrófico) además de comportamiento de regex inesperado con caracteres especiales. Verificado con `curl` que ese patrón ya no rompe nada.
- Verificado end-to-end: búsqueda que matchea, búsqueda vacía (mensaje "No se encontraron topics"), y el caso ReDoS, los 3 contra Atlas real.
- **Búsqueda mientras se escribe** con debounce de 350ms (evita disparar una query por cada tecla), incluyendo cuando el campo queda vacío — auto-refresca solo y trae todos los items sin necesidad de darle clic a "Buscar" (decisión final tras probar ambos comportamientos).
- **Bug real encontrado y corregido**: el input de búsqueda quedaba vacío después de cada búsqueda. Causa: `SearchBar` vivía dentro del mismo `Suspense` (creado por `app/loading.js`) que `TopicsList` — cada cambio de `searchParams` resuspende ese límite y React desmonta/remonta TODO lo de adentro, sin importar que el `defaultValue` fuera correcto. Solución (patrón oficial de Next para búsqueda+paginación): `SearchBar` se movió fuera del `Suspense`, y `app/page.js` envuelve solo `TopicsList` con un `<Suspense key={query+page}>` propio. Detalle completo en [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
- Verificado con **Playwright** (navegador real, instalado como devDependency) además de `curl`: login real, búsqueda, y confirmación de que el input retiene el texto tras la navegación.

### Observabilidad ✅ (completada)

- **`pino`** como logger estructurado (`libs/logger.js`), aplicado solo en código que corre en servidor: `libs/mongodb.js`, `app/actions/topics.js`, `app/actions/admin.js`, `app/actions/auth.js`, `components/TopicsList.jsx`. En dev usa `pino-pretty` (coloreado, legible); en producción emite JSON plano.
- Deliberadamente NO se tocaron los `console.error` de Client Components (`TopicForm.jsx`, `RemoveBtn.jsx`, `RemoveUserBtn.jsx`, `login`/`register`) ni los scripts de `scripts/` — esos logs viven en la consola del navegador o son CLIs de un solo uso, fuera del alcance de "logging estructurado del servidor".
- **Bug real encontrado y corregido**: `pino-pretty` como `transport` (basado en worker threads) no es compatible con el bundling de servidor de Next.js — el worker no encuentra su módulo dentro de `.next/server/`, crasheando el dev server. Solución: usar `pino-pretty` como stream síncrono pasado directo al logger, no como `transport`.
- Verificado en vivo (dev server + login real vía Playwright): log estructurado con timestamp/nivel/color aparece correctamente en consola sin crashear.

### Tests unitarios ✅ (completada, parte 1 de 2)

- **Vitest** instalado (`npm run test`), config en `vitest.config.js` con alias `@` igual que Next.
- `libs/search.js`: se extrajo `escapeRegExp` (antes vivía inline en `TopicsList.jsx`) para poder testearla aislada.
- `libs/__tests__/validation.test.js` (11 tests) y `libs/__tests__/search.test.js` (4 tests, incluye el caso de regex hostil `(a+)+$` verificando que se trata como texto literal) — 15/15 pasando.

### Tests de integración ✅ (completada, parte 2 de 2)

- `playwright.config.js`: corre contra un puerto dedicado (3100) para no chocar con el dev server manual del usuario, `npm run test:e2e`.
- `e2e/helpers/db.js`: helper de conexión directa a Mongo (mismo patrón que `scripts/`) para crear un usuario admin de prueba efímero (nunca se usan credenciales reales) y limpiar datos de prueba al final — **la limpieza corre en `afterAll`, incluso si un test falla a mitad de camino**.
- Convención de seguridad para la limpieza: emails de prueba siempre empiezan con `pwtest_`, títulos de topics con `[PW-TEST]` — el cleanup solo borra por esos prefijos, nunca "todo".
- `e2e/topics.spec.js` (5 tests, `test.describe.serial`): registro+login+crear topic, buscar (match y sin match), editar (dueño), un segundo usuario no ve los botones de editar/borrar del topic ajeno, y un admin efímero borra la cuenta y el topic de otro usuario (verificando el borrado en cascada).
- **Bugs reales encontrados y corregidos** durante la implementación:
  1. Un topic huérfano de un intento anterior interrumpido por timeout colisionó con el siguiente run (mismo título fijo) — se agregó un sufijo único (`runId`) también a los títulos de prueba, no solo a los emails.
  2. Cada test abría una pestaña nueva sin cerrar las anteriores, acumulando conexiones WebSocket de Hot Reload de Next hasta agotar recursos y matar el proceso del navegador a mitad de un test — solucionado reusando una única página compartida entre todos los tests del bloque serial (patrón estándar de Playwright para tests dependientes).
- Verificado: 5/5 pasando en dos corridas seguidas (no flaky), y confirmado con una consulta directa a Mongo que no queda ningún dato de prueba huérfano después de correr la suite.

### Pendiente

- Opcional: evaluar migrar de Mongoose/Mongo a Prisma + Postgres como ejercicio de stack relacional.
