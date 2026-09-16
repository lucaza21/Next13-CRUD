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

## Fase 1 — Validación y esquema (en progreso)

- Introducir **Zod** para validar el body en los route handlers (rechazar payloads vacíos/malformados antes de tocar Mongoose), como capa adicional a la validación de Mongoose.
- Unificar `app/addTopic/page.jsx` y `components/EditTopicForm.jsx` en un solo componente `<TopicForm mode="add|edit">` — hoy son ~50 líneas duplicadas con comportamiento de validación distinto entre ambos.

## Fase 2 — Modernizar a patrones actuales de Next (14/15)

- Migrar create/update/delete de fetch + route handlers a **Server Actions** (`"use server"`), con `revalidatePath("/")` en vez de `router.refresh()`.
- Añadir `loading.tsx`, `error.tsx`, `not-found.tsx` por segmento (hoy no existe ninguno).
- Si se sube a Next 15: `params` pasa a ser `Promise` — actualizar los usos en `editTopic/[id]/page.jsx` y `app/api/topics/[id]/route.js`.
- Migrar a **TypeScript** (tipar modelo, props, responses de API).

## Fase 3 — Features "senior"

- Autenticación (NextAuth/Auth.js) con autorización básica (solo el dueño de un topic puede editar/borrar).
- Paginación + búsqueda en el listado (hoy `Topic.find()` trae toda la colección sin límite).
- Estados de carga / deshabilitar botón en submit (evitar doble-submit) en los formularios.
- Tests: unitarios (validación de schema/Zod) + integración (Playwright) para los 3 flujos CRUD.
- Observabilidad: logging estructurado en vez de `console.log` sueltos.
- Opcional: evaluar migrar de Mongoose/Mongo a Prisma + Postgres como ejercicio de stack relacional.
