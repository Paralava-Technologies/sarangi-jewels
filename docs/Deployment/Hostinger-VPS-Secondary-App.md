# Deployment Guide: Sarangi Jewels on Hostinger VPS (Alongside `lifeterrain.com` & `noeve.store`)

This guide covers deploying **Sarangi Jewels** (`@sarangi/api`, `@sarangi/web-store`, `@sarangi/web-admin`) on your existing Hostinger VPS (`187.127.136.221`) alongside `lifeterrain.com` and `noeve.store`, using subdomains on `noeve.store` (or `lifeterrain.com`) since Sarangi Jewels does not have a dedicated domain yet.

## Port & Resource Allocation Overview

To prevent any conflicts with your already running applications on the VPS:

| Application | Service | Internal Port | Subdomain (Recommended) |
| :--- | :--- | :--- | :--- |
| **LifeTerrain** | Existing Apps | `3000` – `3002` | `lifeterrain.com` |
| **Noeve Store** | API / Store / Admin | `3004` / `3005` / `3006` | `api.noeve.store` / `noeve.store` / `admin.noeve.store` |
| **Sarangi Jewels** | **Backend API** (`@sarangi/api`) | **`3007`** | **`sarangi-api.noeve.store`** |
| **Sarangi Jewels** | **Web Store** (`@sarangi/web-store`) | **`3008`** | **`sarangi.noeve.store`** |
| **Sarangi Jewels** | **Admin Panel** (`@sarangi/web-admin`) | **`3009`** | **`sarangi-admin.noeve.store`** |
| **Shared Services** | PostgreSQL / Redis / MinIO | `5432` / `6379` / `9000` | Shared instance (`sarangi` DB, `s3.noeve.store`) |

> **Note:** Node.js, `pnpm`, `pm2`, PostgreSQL, Redis, MinIO, Nginx, and Certbot are already installed on your VPS from the `noeve.store` setup, so we only need to create a new database and deploy the app.

---

## Step 1: Add Subdomain DNS Records on BigRock

Log into your **BigRock Control Panel** for `noeve.store` (or `lifeterrain.com` if you prefer using that domain), go to **Manage DNS -> A Records**, and add the following 3 **A Records** pointing to your Hostinger VPS IP (`187.127.136.221`):

- **Host:** `sarangi` → **Points to:** `187.127.136.221` (Frontend Web Store)
- **Host:** `sarangi-admin` → **Points to:** `187.127.136.221` (Admin Dashboard)
- **Host:** `sarangi-api` → **Points to:** `187.127.136.221` (Backend API)

Verify DNS propagation from your VPS terminal before running Certbot in Step 6:
```bash
dig +short sarangi.noeve.store sarangi-api.noeve.store sarangi-admin.noeve.store
```
*(Wait until all three return `187.127.136.221`).*

---

## Step 2: Create the `sarangi` PostgreSQL Database

SSH into your Hostinger VPS:
```bash
ssh root@187.127.136.221
```

Since PostgreSQL is already installed and running with user `noeveadmin` (or you can create a dedicated `sarangiadmin` user), create a separate database `sarangi` so Sarangi Jewels data is completely isolated from Noeve Store:

```bash
sudo -u postgres psql
```

Run the following SQL commands inside the `psql` prompt:
```sql
CREATE DATABASE sarangi;
GRANT ALL PRIVILEGES ON DATABASE sarangi TO noeveadmin;
ALTER DATABASE sarangi OWNER TO noeveadmin;
\q
```
*(Alternatively, if you want a separate DB user: `CREATE USER sarangiadmin WITH ENCRYPTED PASSWORD 'YOUR_DB_PASSWORD'; GRANT ALL PRIVILEGES ON DATABASE sarangi TO sarangiadmin; ALTER DATABASE sarangi OWNER TO sarangiadmin;`)*

---

## Step 3: Clone the Sarangi Jewels Repository

1. Navigate to `/var/www/` and clone the repository into `/var/www/sarangi-jewels`:
   ```bash
   cd /var/www/
   git clone https://github.com/Paralava-Technologies/sarangi-jewels.git sarangi-jewels
   cd /var/www/sarangi-jewels
   ```

---

## Step 4: Configure Environment Variables (`.env`)

Create the root `.env` file inside `/var/www/sarangi-jewels`:

```bash
cd /var/www/sarangi-jewels
nano .env
```

Paste the following configuration (note the ports `3007` and `50052`, and database `sarangi`):

```env
# ── Database
# NOTE: URL-encode '@' as '%40' inside DATABASE_URL!
POSTGRES_USER=noeveadmin
POSTGRES_PASSWORD=Sree@21082007
POSTGRES_DB=sarangi
DATABASE_URL=postgresql://noeveadmin:Sree%4021082007@localhost:5432/sarangi?schema=public

# ── Redis (shared local instance)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# ── API & JWT
NODE_ENV=production
API_PORT=3007
GRPC_PORT=50052
API_URL=https://sarangi-api.noeve.store
CORS_ORIGINS=https://sarangi.noeve.store,https://sarangi-admin.noeve.store
JWT_SECRET=CHANGE_ME_SARANGI_LONG_RANDOM_JWT_SECRET_MIN_64_CHARS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── MinIO / S3 (reusing the running MinIO service with a separate bucket)
MINIO_ROOT_USER=noeveadmin
MINIO_ROOT_PASSWORD=CHANGE_ME_MINIO_SECRET
S3_ENDPOINT=https://s3.noeve.store
S3_BUCKET=sarangi-media
AWS_S3_BUCKET=sarangi-media
S3_REGION=ap-south-1

# ── Razorpay (Test or Live keys)
RAZORPAY_KEY_ID=rzp_test_TBOuQZ8MZcI1Wo
RAZORPAY_KEY_SECRET=lCaqF8El84vo9ONElpX0dvxt
RAZORPAY_WEBHOOK_SECRET=b7K9mP2vL7qR4xN5bJ1c_G3tY6zM0eR1

# ── Next.js Public API URL (baked into web-store and web-admin during build)
NEXT_PUBLIC_API_URL=https://sarangi-api.noeve.store/v1
```

### Clean & Symlink `.env` Across Workspaces

Strip any accidental `\r` or trailing whitespace and symlink `.env` to all three apps (`apps/api`, `apps/web-store`, `apps/web-admin`):

```bash
cd /var/www/sarangi-jewels
sed -i 's/\r$//' .env
sed -i 's/[[:space:]]*$//' .env

ln -sf /var/www/sarangi-jewels/.env /var/www/sarangi-jewels/apps/api/.env
ln -sf /var/www/sarangi-jewels/.env /var/www/sarangi-jewels/apps/web-store/.env.local
ln -sf /var/www/sarangi-jewels/.env /var/www/sarangi-jewels/apps/web-admin/.env.local
```

> **Note:** `GRPC_PORT=50052` ensures `@sarangi/api`'s internal gRPC microservice does not collide with `noeve-api` on port `50051`, and `API_PORT=3007` automatically configures `@sarangi/web-store`'s `/public/:path*` image rewrite to point to `http://localhost:3007`.

---

## Step 5: Install Dependencies, Push Prisma Schema, Seed & Build

Run the following commands in `/var/www/sarangi-jewels`:

```bash
cd /var/www/sarangi-jewels
pnpm install
pnpm --filter @sarangi/api exec prisma generate
pnpm --filter @sarangi/api exec prisma db push
pnpm run db:seed
pnpm build
```

*(Note: `pnpm run db:seed` creates the default Sarangi Jewels accounts:)*
- **Admin:** `admin@sarangi.local` / `Admin123!`
- **Customer:** `customer@sarangi.local` / `Customer123!`

---

## Step 6: Start Sarangi Jewels Services with PM2 (`3007`, `3008`, `3009`)

Start all three services under PM2 using dedicated ports `3007`, `3008`, and `3009`:

```bash
cd /var/www/sarangi-jewels

# 1. Start Sarangi Backend API (Port 3007)
API_PORT=3007 PORT=3007 pm2 start pnpm --name "sarangi-api" --cwd /var/www/sarangi-jewels -- --filter @sarangi/api start:prod

# 2. Start Sarangi Web Store (Port 3008)
PORT=3008 pm2 start pnpm --name "sarangi-store" --cwd /var/www/sarangi-jewels -- --filter @sarangi/web-store exec next start -p 3008

# 3. Start Sarangi Admin Dashboard (Port 3009)
PORT=3009 pm2 start pnpm --name "sarangi-admin" --cwd /var/www/sarangi-jewels -- --filter @sarangi/web-admin exec next start -p 3009

# 4. Save the PM2 process list
pm2 save
```

Check that all processes (`noeve-*` and `sarangi-*`) are `online`:
```bash
pm2 status
```

---

## Step 7: Configure Nginx Reverse Proxy & SSL (HTTPS)

### 1. Create the Nginx Config for Sarangi Jewels

```bash
sudo nano /etc/nginx/sites-available/sarangi
```

Paste the following server blocks:

```nginx
# Sarangi Jewels — Backend API (Port 3007)
server {
    listen 80;
    server_name sarangi-api.noeve.store;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Sarangi Jewels — Frontend Web Store (Port 3008)
server {
    listen 80;
    server_name sarangi.noeve.store;

    location / {
        proxy_pass http://127.0.0.1:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Sarangi Jewels — Admin Dashboard (Port 3009)
server {
    listen 80;
    server_name sarangi-admin.noeve.store;

    location / {
        proxy_pass http://127.0.0.1:3009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and reload Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/sarangi /etc/nginx/sites-enabled/sarangi
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Provision SSL Certificates with Certbot

Once `dig +short sarangi.noeve.store sarangi-api.noeve.store sarangi-admin.noeve.store` returns `187.127.136.221`, run Certbot:

```bash
sudo certbot --nginx -d sarangi.noeve.store -d sarangi-admin.noeve.store -d sarangi-api.noeve.store
```

---

## Step 8: Updating Sarangi Jewels Later (Git Pull Workflow)

Whenever you push new changes to GitHub (`main` branch), update the VPS deployment with:

```bash
cd /var/www/sarangi-jewels
git pull origin main
pnpm install
pnpm --filter @sarangi/api exec prisma generate
pnpm --filter @sarangi/api exec prisma db push
pnpm build
pm2 restart sarangi-api sarangi-store sarangi-admin --update-env
```
