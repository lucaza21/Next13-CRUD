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

## Fase 3 — Features "senior"

- Autenticación (NextAuth/Auth.js) con autorización básica (solo el dueño de un topic puede editar/borrar).
- Paginación + búsqueda en el listado (hoy `Topic.find()` trae toda la colección sin límite).
- Estados de carga / deshabilitar botón en submit (evitar doble-submit) en los formularios.
- Tests: unitarios (validación de schema/Zod) + integración (Playwright) para los 3 flujos CRUD.
- Observabilidad: logging estructurado en vez de `console.log` sueltos.
- Opcional: evaluar migrar de Mongoose/Mongo a Prisma + Postgres como ejercicio de stack relacional.
