# BTC Dashboard

Dashboard web para seguir el precio de Bitcoin en tiempo real, registrar compras por perfil y compartir el mismo historial entre dos personas.

## Arquitectura actual

- `Local`: `node server.mjs`
- `Online gratis`: `Vercel Hobby + Neon Free`
- `Frontend`: HTML, CSS y JavaScript vanilla
- `Compras compartidas`: API `/api/profiles/.../purchases`
- `Noticias`: API `/api/bitcoin-news`

## Ejecutar en local

```bash
npm install
npm start
```

Abre [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Datos en vivo

- Historial y tiempo real del gráfico: Binance
- Rangos largos: CoinGecko
- Conversión USD/COP: ExchangeRate API
- Noticias: feeds RSS agregados en backend

## Compras compartidas

### En local

El servidor local guarda compras en:

- [data/profile-purchases.runtime.json](</C:/Users/jesus/OneDrive/Documentos/BTC Dashboard/data/profile-purchases.runtime.json>)

Si no existe, se crea a partir de:

- [data/profile-purchases.seed.json](</C:/Users/jesus/OneDrive/Documentos/BTC Dashboard/data/profile-purchases.seed.json>)

### En internet

En Vercel, las compras se guardan en Neon usando `DATABASE_URL`.

## Despliegue gratis recomendado

### 1. Subir el repo a GitHub

Si no tienes repo remoto todavía:

```bash
git init
git add .
git commit -m "Initial BTC dashboard"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

Guía oficial de GitHub:
- [Quickstart for repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories)

### 2. Crear la base gratis en Neon

Usa Neon Free:
- [Neon pricing](https://neon.com/pricing)

La página de pricing indica:
- plan `Free` a `$0`
- `no time limits`
- `scale to zero when inactive`

Dentro de Neon:

1. Crea un proyecto.
2. Copia tu cadena `DATABASE_URL`.
3. Esa será la variable que pondrás en Vercel.

### 3. Crear el deploy gratis en Vercel

Usa Vercel Hobby:
- [Vercel pricing](https://vercel.com/pricing)

La página de pricing indica:
- `Hobby`
- `Free forever`

Pasos:

1. Entra a Vercel.
2. Importa tu repo de GitHub.
3. En `Environment Variables`, crea:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

4. Haz deploy.

Vercel detectará:

- [vercel.json](</C:/Users/jesus/OneDrive/Documentos/BTC Dashboard/vercel.json>)
- API routes en [api](</C:/Users/jesus/OneDrive/Documentos/BTC Dashboard/api>)

## Qué hace el backend gratis

- `GET /api/profiles/:profileId/purchases`
- `POST /api/profiles/:profileId/purchases`
- `DELETE /api/profiles/:profileId/purchases/:purchaseId`
- `GET /api/bitcoin-news`

En el primer uso de la base, se crean:

- tabla `purchases`
- índice por perfil y fecha
- carga inicial desde [data/profile-purchases.seed.json](</C:/Users/jesus/OneDrive/Documentos/BTC Dashboard/data/profile-purchases.seed.json>)

## Variables de entorno

Ejemplo:

- [.env.example](</C:/Users/jesus/OneDrive/Documentos/BTC Dashboard/.env.example>)

## Importante

- El login de perfiles actual sigue siendo simple y del lado cliente.
- Eso sirve para uso privado entre ustedes dos, pero no es seguridad fuerte.
- Si luego quieres, el siguiente paso correcto es mover autenticación real al backend.

## Referencias oficiales

- GitHub: [docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories)
- Vercel: [vercel.com/pricing](https://vercel.com/pricing)
- Neon: [neon.com/pricing](https://neon.com/pricing)
