# Recapacitar

Aplicación JavaScript preparada para **Cloudflare Pages + Pages Functions + D1**. GitHub conserva el código y Cloudflare ejecuta la API con el binding D1.

## Base de datos

En Cloudflare Dashboard abre **Workers & Pages > D1 > tu base de datos > Console**, pega el contenido de [`schema.sql`](schema.sql) y ejecútalo.

También puedes usar Wrangler:

```bash
npx wrangler d1 execute NOMBRE_DE_TU_DB --remote --file=./schema.sql
```

## Configuración de Pages

- **Production branch:** `main`
- **Build command:** vacío
- **Build output directory:** `/` o `.`
- En **Settings > Functions > D1 database bindings**, añade el binding `DB` y selecciona la base D1 existente.

El nombre debe ser exactamente `DB`, porque las Functions usan `env.DB`. Si usas Wrangler, cambia `database_name` y `database_id` en [`wrangler.toml`](wrangler.toml). El `database_id` aparece en la página de D1.

## Desarrollo local

```bash
npm install -D wrangler
npx wrangler pages dev . --d1=DB=recapacitar-db
```

Para datos locales:

```bash
npx wrangler d1 execute recapacitar-db --local --file=./schema.sql
```

## Incluye

- Registro, inicio y cierre de sesión.
- Contraseñas con hash PBKDF2, nunca en texto plano.
- Sesión con cookie `HttpOnly`, `Secure` y `SameSite=Lax`.
- Perfil editable con nombre, apellidos y biografía.
- Panel responsive e integraciones visuales con GitHub y Cloudflare.
- Consultas D1 preparadas para evitar inyección SQL.

## Endpoints

`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` y `PUT /api/user/profile`.
