# Liyā Agency — Landing + Vercel Functions + Turso

Landing de agencia boutique bilingüe (español / francés) con HTML/CSS/JS
vanilla y un backend serverless para guardar los contactos en Turso (SQLite
gestionado). Incluye una bandeja privada para consultar los envíos.

## Arquitectura

```text
Vercel
├── /                     → index.html (español) y selector de idioma
├── /fr.html              → versión francesa con precios en MAD
├── /admin.html           → panel privado (noindex)
├── /api/submit           → recibe el formulario
├── /api/admin            → lista, detalle, estados, notas, borrado y export
└── /api/health           → comprueba la conexión con Turso

Turso (SQLite remoto)
└── contactos
```

No hay build step. Vercel sirve los archivos estáticos y ejecuta las funciones
de la carpeta `api/`.

## Estructura

```text
nova-studio/
├── index.html                 # versión ES
├── fr.html                    # versión FR
├── admin.html
├── robots.txt
├── vercel.json
├── .vercelignore
├── .env.example
├── package.json
├── api/
│   ├── submit.js              # POST del formulario
│   ├── admin.js               # API privada del panel
│   └── health.js              # estado de Turso
├── lib/
│   ├── auth.js                # contraseña del panel
│   ├── contactos.js           # validación, SQL y CSV
│   ├── http.js                # helpers de request/response
│   ├── schema.js              # crea la tabla si no existe
│   └── turso.js               # cliente @libsql/client
├── sql/
│   └── schema.sql             # tabla e índices
├── css/
│   ├── admin.css
│   ├── base.css
│   ├── components.css
│   ├── footer.css
│   ├── layout.css
│   ├── variables.css
│   └── sections/
├── js/
│   ├── admin.js
│   ├── language.js            # cookie de idioma y selector ES / FR
│   ├── main.js
│   └── modules/
├── assets/
└── proyectos/                 # fuentes de capturas, no se despliegan
```

## 1. Crear la base de datos en Turso

Instala la CLI si aún no la tienes:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
```

Crea la base de datos y obtén los datos de conexión:

```bash
turso db create liya-agency
turso db show liya-agency --url
turso db tokens create liya-agency
```

Guarda el resultado de `--url` y del token. Los necesitarás en Vercel.

## 2. Crear la tabla

Desde `nova-studio`:

```bash
turso db shell liya-agency < sql/schema.sql
```

O entra en la consola y pega el contenido de `sql/schema.sql`:

```bash
turso db shell liya-agency
```

El script crea la tabla `contactos` y los índices de fecha, estado y proyecto.

> Las funciones también crean la tabla automáticamente en el primer uso
> (`lib/schema.js`). Ejecutar el SQL a mano sigue siendo la opción recomendada
> para tener el esquema visible y controlado desde Turso.

## 3. Variables de entorno

Copia el ejemplo:

```bash
cp .env.example .env.local
```

Rellena:

```env
TURSO_DATABASE_URL="libsql://tu-base-tu-organizacion.turso.io"
TURSO_AUTH_TOKEN="tu-auth-token-de-turso"
# Opcional: si está vacía, se usa la contraseña de respaldo de lib/auth.js.
ADMIN_PASSWORD=""
ADMIN_USER="admin"
```

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | Sí | URL `libsql://...` de Turso |
| `TURSO_AUTH_TOKEN` | Sí | Token de acceso a la base de datos |
| `ADMIN_PASSWORD` | No | Contraseña del panel. Si no se define, se usa la de respaldo de `lib/auth.js`. |
| `ADMIN_USER` | No | Usuario para Basic Auth; por defecto `admin` |

En Vercel: **Project → Settings → Environment Variables**. Añade las mismas
variables para Production, Preview y Development. Pega solo el valor, sin las
comillas del ejemplo. No subas `.env.local` al repositorio.

## 4. Probar en local

```bash
cd nova-studio
npm install
npx vercel dev
```

Abre:

- Web: `http://localhost:3000/`
- Panel: `http://localhost:3000/admin.html`
- Salud: `http://localhost:3000/api/health`

`npx vercel dev` carga las variables de `.env.local` y ejecuta las funciones
igual que en Vercel.

## 5. Desplegar en Vercel

1. Sube el proyecto a GitHub/GitLab/Bitbucket.
2. En Vercel, pulsa **Add New → Project** e importa el repositorio.
3. En **Root Directory**, selecciona `nova-studio`.
4. Framework Preset: **Other**.
5. Build Command: déjalo vacío.
6. Output Directory: déjalo vacío.
7. Añade las variables de entorno del paso 3.
8. Pulsa **Deploy**.

La web quedará en `https://tu-proyecto.vercel.app/` y el panel en
`https://tu-proyecto.vercel.app/admin.html`. La versión francesa está en
`https://tu-proyecto.vercel.app/fr.html`.

> Es importante seleccionar `nova-studio` como Root Directory. Si despliegas
> la raíz del repositorio, Vercel no encontrará `api/` en el lugar correcto.

## Idioma y precios

La portada detecta el país con la cabecera `x-vercel-ip-country`:

| País | Versión | Moneda | Planes |
| --- | --- | --- | --- |
| España / resto | Español (`/`) | EUR | 399 € · 799 € · 99 € |
| Marruecos | Francés (`/fr.html`) | MAD | 4 300 · 8 600 · 1 100 MAD |

Las reglas viven en `vercel.json` (redirects condicionales). El selector
ES / FR guarda la preferencia en la cookie `liya_lang`, de modo que la elección
manual se mantiene al volver a `/`. Los enlaces `/?lang=es` y `/?lang=fr`
permiten forzar el idioma sin depender de la geolocalización.

> Las condiciones `has` / `missing` de `vercel.json` no se aplican con
> `npx vercel dev`; para probar la redirección por país hay que usar un
> deployment de Vercel (Preview o Production). La navegación manual ES / FR
> sí funciona en local.

## API

### `POST /api/submit`

Recibe el formulario de la landing, valida en servidor y guarda en Turso.

Respuesta correcta:

```json
{
  "ok": true,
  "id": 1,
  "created_at": "2026-10-22T14:00:00.000Z"
}
```

Si falla la validación:

```json
{
  "ok": false,
  "error": "Revisa los campos marcados.",
  "errors": {
    "email": "Introduce un email válido."
  }
}
```

El campo `lang` (`es` / `fr`) del payload determina el idioma de los errores
del servidor y el texto de consentimiento guardado. Así la versión francesa
mantiene sus mensajes en francés también si la validación falla en servidor.

### `/api/admin`

Requiere `Authorization: Bearer <ADMIN_PASSWORD>` o Basic Auth.

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/api/admin?resource=list&q=&status=&project=` | Lista y estadísticas |
| `GET` | `/api/admin?resource=detail&id=1` | Detalle completo |
| `GET` | `/api/admin?resource=export&format=csv` | Exporta CSV o JSON |
| `PATCH` | `/api/admin?id=1` | Cambia estado y notas |
| `DELETE` | `/api/admin?id=1` | Elimina un contacto |

Ejemplo con curl:

```bash
curl "https://tu-proyecto.vercel.app/api/admin?resource=list" \
  -H "Authorization: Bearer TU_ADMIN_PASSWORD"
```

### `GET /api/health`

Comprueba que las variables existen y que Turso responde:

```json
{
  "ok": true,
  "service": "liya-contact-api",
  "database": "turso",
  "schema": true,
  "db": true
}
```

## Qué guarda cada contacto

- Nombre, email, empresa, proyecto, etiqueta del proyecto, mensaje y consentimiento.
- Fecha de alta y última actualización.
- Estado interno: `new`, `read` o `archived`.
- Notas internas.
- Página de origen, referrer y parámetros UTM / `gclid` / `fbclid`.
- Tiempo que tardó el usuario en enviar el formulario.
- Pantalla, ventana, densidad de píxel, plataforma, idioma y zona horaria.
- Cookies, Do Not Track, tema del sistema, movimiento reducido y puntos táctiles.
- Núcleos de CPU, memoria del dispositivo y tipo de conexión.
- IP, user-agent, `Accept-Language`, `Origin` y `Host`.
- El JSON original completo.

El formulario incluye un honeypot oculto (`website`). Si llega relleno, el
servidor responde `202` sin guardar nada.

## Panel privado

`admin.html` no está enlazado desde la web, lleva `noindex, nofollow` y no
contiene datos por sí mismo: todo se pide a `/api/admin` con la contraseña.

Incluye:

- Búsqueda por nombre, email, empresa, mensaje o proyecto.
- Filtros por estado y proyecto.
- Detalle con formulario, contexto, dispositivo, servidor y JSON original.
- Cambio de estado, notas internas y borrado.
- Exportación CSV/JSON.

La contraseña se guarda en `sessionStorage`, no en una URL ni en una cookie.
Para cerrar sesión, pulsa **Salir**.

## Seguridad

- La contraseña de respaldo está configurada en `lib/auth.js`. Si el repositorio se hace público, define `ADMIN_PASSWORD` en Vercel y rota esa contraseña.
- No compartas el token de Turso ni la contraseña del panel.
- En producción todo va por HTTPS.
- `robots.txt` y `vercel.json` añaden `noindex` al panel, pero no sustituyen a
  la autenticación.
- Si rotas el token de Turso, actualiza la variable en Vercel y vuelve a
  desplegar.
- Para producción seria, valora añadir rate limiting o un proveedor de auth.

## Edición rápida

| Qué quiero cambiar | Dónde |
| --- | --- |
| Textos de la landing (ES) | `index.html` |
| Textos de la landing (FR) | `fr.html` |
| Idioma / redirección por país | `vercel.json` + `js/language.js` |
| Color de acento | `css/variables.css` |
| Formulario | `index.html` + `fr.html` + `js/modules/contact.js` |
| Endpoint del formulario | `data-contact-endpoint="/api/submit"` |
| Validación servidor | `lib/contactos.js` |
| SQL de contactos | `lib/contactos.js` |
| Tabla de Turso | `sql/schema.sql` + `lib/schema.js` |
| Panel privado | `admin.html` + `js/admin.js` + `css/admin.css` |
| Contraseña del panel | `ADMIN_PASSWORD` en Vercel o respaldo en `lib/auth.js` |
| Conexión a Turso | `lib/turso.js` |
| Cabeceras y cache | `vercel.json` |

## Notas

- Las dos landings usan `?v=16` en CSS y JS para evitar versiones antiguas en
  caché. Si editas estilos o scripts, sube ese número en `index.html`,
  `fr.html` y en los imports de `js/main.js`. `admin.html` usa `admin.css?v=4`
  y `admin.js?v=4`.
- `/proyectos/` y `/sql/` están en `.vercelignore`: no se publican, pero siguen
  en el repositorio como fuente. Las rutas llevan `/` inicial para no excluir
  `assets/img/proyectos/`, que sí debe desplegarse.
- El antiguo backend `server.py` y su SQLite local se han retirado. La única
  fuente de datos es Turso.

## Solución de problemas

### Las capturas del portfolio dan 404 en Vercel

Comprueba que `.vercelignore` usa `/proyectos/` (con barra inicial) y no
`proyectos/`. Sin la barra, Vercel también excluye `assets/img/proyectos/`,
que es donde viven las capturas publicadas. Después vuelve a desplegar.

### El formulario devuelve 500 o el panel no carga contactos

Abre `/api/health` en el deployment:

- `{"ok":true,...,"schema":true}`: Turso y la tabla están listos.
- `code:"missing_env"`: faltan `TURSO_DATABASE_URL` o `TURSO_AUTH_TOKEN` en
  Vercel.
- `code:"db_unreachable"`: el token o la URL de Turso no son válidos.

La versión actual crea la tabla automáticamente al primer uso
(`lib/schema.js`). Si el deployment todavía es antiguo, ejecuta
`sql/schema.sql` en Turso o vuelve a desplegar. Mientras el servidor no esté
disponible, el formulario ofrece un enlace `mailto:` para no perder el
mensaje.
