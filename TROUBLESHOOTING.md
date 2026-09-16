# Setup y problemas comunes — MongoDB Atlas + Next.js (Windows)

## Configuración de Atlas

- **Organización:** `Propio - Atlas organization`
- **Proyecto:** `crud_next`
- **Cluster:** `Cluster0` (tier **Free / M0**, provider AWS, región N. Virginia us-east-1)
- Producto correcto en Atlas: asegúrate de estar parado en **Atlas** (no en *Cloud Manager* — ese es para MongoDB self-hosted y no tiene tier gratuito M0; se accede a él desde el mismo selector de organización/producto arriba a la izquierda).
- Al crear el cluster, usar **"Automate security setup"** para que Atlas guíe la creación del usuario de BD y el Network Access en el mismo flujo.
- Connection string: Atlas → **Connect** → **Drivers** (no "Compass"/"Shell"/etc.) → copiar el string `mongodb+srv://...` para Node.js.

## Variables de entorno

Todas las variables de entorno viven en **`.env.local`** (archivo nativo de Next, gitignored):

```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3001
ADMIN_EMAIL=...
```

**Historia (ya resuelta, dejar como referencia):** el proyecto usó al principio un archivo custom `atlas-credentials.env`, cargado con un hack en `next.config.js` (`processEnv` de `@next/env` inyectado a mano). Esto funcionaba para código que corre en runtime Node.js (Server Components, Server Actions, API routes), pero causaba dos bugs:
1. `middleware.js` corre en **Edge Runtime**, que nunca ve esa inyección custom — causaba `NEXTAUTH_SECRET missing` / error de configuración de NextAuth en cualquier ruta protegida por middleware.
2. Next.js recarga sus variables de entorno internamente varias veces durante `dev` (compilación bajo demanda de rutas, hot-reload) llamando a `loadEnvConfig`, que **resetea `process.env` a un snapshot tomado antes de nuestra inyección custom** — variables como `MONGODB_URI` desaparecían intermitentemente en rutas compiladas después del arranque (ej. `/api/auth/[...nextauth]`), aunque hubieran funcionado en las primeras peticiones.

**Solución definitiva:** se eliminó el hack de `next.config.js` y todas las variables se consolidaron en `.env.local`, el mecanismo nativo de Next que funciona de forma consistente en ambos runtimes. Los scripts de `scripts/` usan `loadEnvConfig` de `@next/env` (la forma correcta de usarlo, apuntando a la raíz del proyecto) para leer ese mismo archivo fuera del contexto de Next.

`atlas-credentials.env` y `.env.local` están en `.gitignore` — nunca deben llegar al repo.

## Problemas encontrados y solución

### 1. Cluster pausado automáticamente
Atlas pausa clusters M0 tras inactividad prolongada. Síntoma: `querySrv ECONNREFUSED _mongodb._tcp.<host>` aunque la URI sea correcta.
- Ir a Atlas → Clusters → **Resume**.
- Si el mensaje dice que **no se puede reanudar** porque la versión del snapshot es muy vieja: hay que **Terminate** el cluster viejo y crear uno nuevo (M0). Esto cambia el hostname del cluster, así que hay que actualizar `MONGODB_URI`.

### 2. `querySrv ECONNREFUSED` con un cluster nuevo y activo
Si el error persiste incluso con un cluster recién creado, **no es problema de Atlas**. En Windows, el resolver DNS interno de Node.js (librería `c-ares`) a veces no lee correctamente los servidores DNS configurados a nivel de sistema, y falla la consulta SRV que necesita `mongodb+srv://`.

**Diagnóstico:** confirmar que el DNS del sistema sí resuelve el registro:
```bash
nslookup -type=SRV _mongodb._tcp.<tu-cluster>.mongodb.net
```
Si esto devuelve los registros SRV correctamente pero la app sigue fallando, el problema es específico de Node, no de la red/ISP.

**Solución:** forzar a Node a usar un DNS público explícito antes de conectar. Implementado en [libs/mongodb.js](libs/mongodb.js):
```js
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
```

### 3. Puerto 3000 ocupado
`next dev` cae automáticamente al puerto 3001 (`Port 3000 is in use, trying 3001 instead`). No es un error — solo hay que usar `localhost:3001` en el navegador. Si quieres liberar el 3000, busca qué proceso lo tiene con `netstat -ano | findstr :3000` (PowerShell/cmd) y ciérralo.

### 4. Caché de `next dev` corrupta tras editar repetidamente un Client Component
Síntoma: un componente muestra datos/estado incorrectos en el navegador (ej. un input que aparece vacío) pese a que el HTML/payload que devuelve el servidor es correcto (verificable con `curl` inspeccionando la respuesta cruda). En consola del servidor puede no verse nada obvio, pero en el payload de streaming de React aparece un error tipo `Cannot read properties of undefined (reading 'call')` dentro de `ServerComponentWrapper`, seguido de un mecanismo de reintento (`$RX`) que descarta el contenido correcto y deja ese boundary en un estado roto.

Esto ocurre después de editar varias veces seguidas la forma de un Client Component (ej. cambiar de input controlado a no controlado) — la caché incremental de compilación de `next dev` (carpeta `.next`) se desincroniza del código real.

**Solución:** detener el dev server, borrar la carpeta `.next`, y volver a correr `npm run dev`. No es un bug del código.

### 5. Un input dentro de un componente async pierde su valor después de cada búsqueda/navegación
Síntoma: un `<input>` (ej. la barra de búsqueda) muestra el texto mientras se escribe, pero queda vacío justo después de que la navegación (`router.push` con nuevos `searchParams`) trae los resultados — aunque el HTML que devuelve el servidor sea correcto (verificado con Playwright y con `curl`).

**Causa real:** `app/loading.js` crea un límite de `Suspense` que envuelve TODO lo que retorna `page.js`. Cada vez que cambian los `searchParams` y el componente async que depende de ellos (`TopicsList`, que hace `await` a Mongo) se vuelve a suspender, React **desmonta todo el subárbol dentro de ese límite y lo vuelve a montar desde cero** cuando los datos llegan — incluyendo cualquier Client Component que esté ahí adentro (como `SearchBar`), sin importar que sus props/`defaultValue` sean correctos: el problema no es el valor, es que el nodo del DOM se destruye y se crea de nuevo.

**Solución (patrón recomendado por la documentación de Next.js para búsqueda + paginación):** sacar el componente que debe sobrevivir a la navegación (el buscador) **fuera** del `Suspense` que envuelve solo la parte de datos, envolviendo explícitamente nada más el componente async con su propio `<Suspense key={...}>`:
```jsx
// app/page.js
<SearchBar initialQuery={query} />
<Suspense key={`${query}-${page}`} fallback={<Loading />}>
    <TopicsList query={query} page={page} />
</Suspense>
```
`app/loading.js` sigue aplicando para la primera entrada real a la ruta (ej. justo después del login), pero ya no afecta a `SearchBar` en cada búsqueda posterior, porque ahora es hermano del `Suspense`, no hijo suyo.

Verificado con Playwright (navegador real, no solo `curl`): el input retiene el texto correctamente después de buscar.

### 6. Warnings de "resource preloaded but not used" en consola del navegador
Warnings de Chrome DevTools sobre `_next/static/css/app/layout.css` precargado y no usado a tiempo. Es ruido normal de Fast Refresh en modo desarrollo, no afecta funcionalidad — se puede ignorar.

## Deploy en Vercel

- El proyecto de Vercel está conectado a un repo **privado** distinto (`Next13-CRUD-private`), no al público (`Next13-CRUD`). Hay que empujar los cambios a ambos remotos (`origin` = público, `deploy` = privado) para que el deploy se actualice.
- **Variables de entorno**: hay que agregar en Vercel (Settings → Environment Variables) las mismas 4 que en `.env.local`: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (con el dominio real de producción, no `localhost`), `ADMIN_EMAIL`.
- **Atlas Network Access**: por defecto solo permite tu IP local. Vercel usa IPs dinámicas (serverless), así que hay que agregar `0.0.0.0/0` (Allow access from anywhere) en Atlas → Network Access, si no la conexión a Mongo cuelga y las funciones responden 504.

### 7. Login exitoso pero la página se queda mostrando `/login` (solo en producción/Vercel)
Síntoma: el navbar ya refleja la sesión iniciada (email, botón "Cerrar sesión") pero la URL sigue en `/login?callbackUrl=...` y el contenido no cambia. En local (`next dev`) no pasa, solo en producción.

**Causa:** el mismo tipo de bug que el de la búsqueda (ver punto 5) — `router.push("/")` después de un `signIn({ redirect: false })` es una navegación "suave" del lado del cliente, y el **router cache** de Next puede servir una respuesta cacheada de `/` de ANTES de que existiera la cookie de sesión, en vez de pedir la página fresca.

**Solución:** usar una navegación completa del navegador en vez de `router.push` justo después del login/registro:
```js
// en vez de router.push("/") + router.refresh()
window.location.href = "/";
```
Implementado en `app/login/page.jsx` y `app/register/page.jsx`.
