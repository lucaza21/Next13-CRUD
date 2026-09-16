# Setup y problemas comunes — MongoDB Atlas + Next.js (Windows)

## Configuración de Atlas

- **Organización:** `Propio - Atlas organization`
- **Proyecto:** `crud_next`
- **Cluster:** `Cluster0` (tier **Free / M0**, provider AWS, región N. Virginia us-east-1)
- Producto correcto en Atlas: asegúrate de estar parado en **Atlas** (no en *Cloud Manager* — ese es para MongoDB self-hosted y no tiene tier gratuito M0; se accede a él desde el mismo selector de organización/producto arriba a la izquierda).
- Al crear el cluster, usar **"Automate security setup"** para que Atlas guíe la creación del usuario de BD y el Network Access en el mismo flujo.
- Connection string: Atlas → **Connect** → **Drivers** (no "Compass"/"Shell"/etc.) → copiar el string `mongodb+srv://...` para Node.js.

## Variables de entorno en un archivo custom (`atlas-credentials.env`)

Este proyecto guarda las credenciales de Mongo en `atlas-credentials.env` (no en `.env`), con:

```
MONGODB_USERNAME=...
MONGODB_PASSWORD=...
MONGODB_URI=mongodb+srv://...
```

Next.js **no carga automáticamente** archivos con nombre custom (solo `.env`, `.env.local`, `.env.development`, etc.), así que en [next.config.js](next.config.js) se usa `processEnv` de `@next/env` (el paquete interno que usa el propio Next) para inyectar ese archivo a `process.env` al arrancar.

`atlas-credentials.env` está en `.gitignore` — nunca debe llegar al repo.

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

### 4. Warnings de "resource preloaded but not used" en consola del navegador
Warnings de Chrome DevTools sobre `_next/static/css/app/layout.css` precargado y no usado a tiempo. Es ruido normal de Fast Refresh en modo desarrollo, no afecta funcionalidad — se puede ignorar.
