# Deployment Guide: Noeve Store on Hostinger VPS (with BigRock Domains)

This comprehensive guide covers deploying the Noeve Store platform (API backend + Web Store frontend) on a Hostinger VPS, connecting it to a domain registered on BigRock (`noeve.store`), and securely setting up all required services including PostgreSQL, Redis, and MinIO.

## Prerequisites

- SSH access to your Hostinger VPS.
- Node.js, npm, and **pnpm** installed (`npm install -g pnpm`).
- PM2 installed globally (`npm install -g pm2`).
- Nginx installed (`sudo apt install nginx -y`).
- Docker installed (for MinIO storage).

---

## Step 1: Configure Domains on BigRock

To map your custom domain and services to the Hostinger VPS, point the DNS "A Records" to your VPS's IP address.

1. Log into your **BigRock Control Panel** and open your domain `noeve.store`.
2. **CRITICAL — Switch Name Servers from Parking NS (`sns*.bigrock.com`) to Free DNS Name Servers:**
   - By default, BigRock sets new domains to its Parking Name Servers (e.g., `sns00009.bigrock.com` / `sns00010.bigrock.com`), which **ignore** your custom A records and force every subdomain to resolve to `66.116.209.85`.
   - Scroll down to **DNS Management** at the bottom of the domain overview page and click **Manage DNS**.
   - At the top of the **Manage DNS** popup, look for the notice or button saying **"Name Server Details"** (or _"For your DNS records to take effect, please update your Name Servers to..."_) — usually four servers looking like `noeve.store.orderbox-dns.com` or `dns1.bigrock.in` through `dns4.bigrock.in`.
   - Copy those 4 Name Servers, close the popup, click **Name Servers** under the Domain Registration section at the top of the page, and **replace `sns*.bigrock.com` with those 4 Manage DNS Name Servers**.
3. **Delete any default Parking A Records** inside **Manage DNS -> A Records** that point to `66.116.209.85`, and ensure **Domain Forwarding** is turned **OFF**.
4. Add or update the following **A Records** in **Manage DNS -> A Records** to point to `YOUR_VPS_IP` (`187.127.136.221`):
   - `@` (Frontend Web Store)
   - `www` (Frontend Web Store)
   - `admin` (Admin Dashboard)
   - `api` (Backend API)
   - `s3` (MinIO Object Storage API)
   - `storage` (MinIO Web Console)
5. Save changes. _(Note: Name Server changes take 15 minutes to a few hours to propagate)._
6. **Verify DNS before running Certbot:** On your VPS, run:
   ```bash
   dig +short noeve.store api.noeve.store
   ```
   Wait until the output returns **only** your VPS IP (`187.127.136.221`) and **not** `66.116.209.85`.

---

## Step 2: Database & Storage Setup (PostgreSQL, Redis, MinIO)

### 1. Install PostgreSQL

1. Connect to your VPS via SSH: `ssh root@YOUR_VPS_IP`
2. Install and enable the database service:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib -y
   sudo systemctl enable --now postgresql
   ```
3. Setup the database and user. Open the Postgres prompt (`sudo -u postgres psql`) and run:
   ```sql
   CREATE DATABASE noeve;
   CREATE USER noeve WITH ENCRYPTED PASSWORD 'YOUR_STRONG_DB_PASSWORD';
   GRANT ALL PRIVILEGES ON DATABASE noeve TO noeve;
   ALTER DATABASE noeve OWNER TO noeve;
   \q
   ```

### 2. Install Redis

Redis handles caching and session management.

1. Install and enable the Redis server:
   ```bash
   sudo apt install redis-server -y
   sudo systemctl enable --now redis-server
   ```

### 3. Install Secure MinIO (S3 Alternative for Media)

We use a secure, non-root Docker image (`cgr.dev/chainguard/minio`) and bind it to `127.0.0.1` so it cannot be bypassed or accessed directly without our Nginx reverse proxy.

1. Prepare the storage directory with secure permissions (UID 65532 is used by the Chainguard image):
   ```bash
   sudo mkdir -p /var/www/noeve-media
   sudo chown -R 65532:65532 /var/www/noeve-media
   sudo chmod -R 750 /var/www/noeve-media
   ```
2. Start the MinIO container securely mapped to localhost:
   ```bash
   sudo docker run -d --name minio \
     -p 127.0.0.1:9000:9000 -p 127.0.0.1:9001:9001 \
     --restart always \
     -e "MINIO_ROOT_USER=noeveadmin" \
     -e "MINIO_ROOT_PASSWORD=YOUR_STRONG_MINIO_PASSWORD" \
     -v /var/www/noeve-media:/data \
     cgr.dev/chainguard/minio:latest server /data --console-address ":9001"
   ```

---

## Step 3: Clone the Application

1. Navigate to your web directory:
   ```bash
   cd /var/www/
   ```
2. Clone your repository into `/var/www/noeve-store`:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git noeve-store
   cd /var/www/noeve-store
   ```

---

## Step 4: Environment Variables (`.env`) & Razorpay Setup

Create your environment file at `/var/www/noeve-store/.env`:

```bash
cd /var/www/noeve-store
nano .env
```

Paste the following configuration, filling in the generated secrets:

```env
# ── Database
# NOTE: If your password contains an '@' symbol (e.g. Sree@21082007), URL-encode '@' as '%40' inside DATABASE_URL!
POSTGRES_USER=noeveadmin
POSTGRES_PASSWORD=Sree@21082007
POSTGRES_DB=noeve
DATABASE_URL=postgresql://noeveadmin:Sree%4021082007@localhost:5432/noeve?schema=public

# ── Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# ── API & JWT
API_PORT=3004
API_URL=https://api.noeve.store
CORS_ORIGINS=https://noeve.store,https://www.noeve.store,https://admin.noeve.store
JWT_SECRET=CHANGE_ME_LONG_RANDOM_JWT_SECRET_MIN_64_CHARS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── MinIO / S3
MINIO_ROOT_USER=noeve
MINIO_ROOT_PASSWORD=CHANGE_ME_MINIO_SECRET
S3_ENDPOINT=https://s3.noeve.store
S3_BUCKET=noeve-media
S3_REGION=ap-south-1

# ── Razorpay (leave blank to use mock/sandbox mode)
RAZORPAY_KEY_ID=rzp_test_TBOuQZ8MZcI1Wo
RAZORPAY_KEY_SECRET=lCaqF8El84vo9ONElpX0dvxt
RAZORPAY_WEBHOOK_SECRET=b7K9mP2vL7qR4xN5bJ1c_G3tY6zM0eR1

# ── Web Store public API URL (baked into Next.js build)
NEXT_PUBLIC_API_URL=https://api.noeve.store/v1
```

### Clean & Symlink `.env` Across Workspaces

Strip any accidental carriage returns (`\r`) or trailing spaces and symlink `.env` into `apps/api`, `apps/web-store`, and `apps/web-admin` so all workspaces always read the exact same file:

```bash
cd /var/www/noeve-store
sed -i 's/\r$//' .env
sed -i 's/[[:space:]]*$//' .env

ln -sf /var/www/noeve-store/.env /var/www/noeve-store/apps/api/.env
ln -sf /var/www/noeve-store/.env /var/www/noeve-store/apps/web-store/.env.local
ln -sf /var/www/noeve-store/.env /var/www/noeve-store/apps/web-admin/.env.local
```

### Verifying Razorpay Keys & Sharing a Razorpay Account Across Domains

1. **Verify your `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` pair from the VPS terminal:**
   ```bash
   source /var/www/noeve-store/.env
   curl -u "$RAZORPAY_KEY_ID:$RAZORPAY_KEY_SECRET" \
     -X POST https://api.razorpay.com/v1/orders \
     -H "Content-Type: application/json" \
     -d '{"amount":100,"currency":"INR","receipt":"test_rcpt_1"}'
   ```
   A valid pair will return `{"id":"order_...","status":"created"}`.
2. **Sharing a Razorpay Account with Another Domain (e.g., `ruchikooth.com`):**
   - **Test Mode (`rzp_test_...`):** Works on any domain immediately without domain registration.
   - **Live Mode (`rzp_live_...`):** Never click "Regenerate Live Key" if another production site is actively using that key (instead, copy the existing `rzp_live_...` Key ID and Key Secret directly). In **Razorpay Dashboard → Account & Settings → Website and app settings**, add `https://www.noeve.store` as an additional website/domain.

---

## Step 5: Install, Generate Prisma Client, Seed DB & Build

Install dependencies, generate the Prisma TypeScript types, push the database schema, seed the initial admin user (`admin@noeve.local` / `Admin123!`), and compile the monorepo apps:

```bash
cd /var/www/noeve-store
pnpm install
pnpm --filter @noeve/api exec prisma generate
pnpm --filter @noeve/api exec prisma db push
pnpm run db:seed
pnpm build
```

---

## Step 6: Start Applications with PM2 (Dedicated Ports: `3004`, `3005`, `3006`)

Because `lifeterrain.com` already occupies ports `3000`–`3002`, we run all `noeve.store` services on dedicated ports **`3004` (API)**, **`3005` (Store)**, and **`3006` (Admin)**.

Make sure you are inside `/var/www/noeve-store` before starting the PM2 services:

```bash
cd /var/www/noeve-store
```

Start the Backend API (running on internal port **3004**):

```bash
API_PORT=3004 PORT=3004 pm2 start pnpm --name "noeve-api" --cwd /var/www/noeve-store -- --filter @noeve/api start:prod
```

Start the Frontend Web Store (running on internal port **3005**):

```bash
PORT=3005 pm2 start pnpm --name "noeve-store" --cwd /var/www/noeve-store -- --filter @noeve/web-store exec next start -p 3005
```

Start the Admin Dashboard (running on internal port **3006**):

```bash
PORT=3006 pm2 start pnpm --name "noeve-admin" --cwd /var/www/noeve-store -- --filter @noeve/web-admin exec next start -p 3006
```

Save the process list to restart on server reboot:

```bash
pm2 save
pm2 startup
```

---

## Step 7: Nginx Configuration & SSL

Now, route the public domains securely to the PM2 internal ports (`3004`, `3005`, `3006`) using Nginx reverse proxy.

### 1. Nginx Setup

Create or update the Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/noeve
```

Paste the following server blocks to route all subdomains to their dedicated internal ports:

```nginx
# API Backend Server Block (Port 3004)
server {
    listen 80;
    server_name api.noeve.store;
    location / {
        proxy_pass http://127.0.0.1:3004;
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

# Frontend Web Store Server Block (Port 3005)
server {
    listen 80;
    server_name noeve.store www.noeve.store;
    location / {
        proxy_pass http://127.0.0.1:3005;
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

# Admin Dashboard Server Block (Port 3006)
server {
    listen 80;
    server_name admin.noeve.store;
    location / {
        proxy_pass http://127.0.0.1:3006;
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

# MinIO API / Storage Bucket Server Block (Port 9000)
server {
    listen 80;
    server_name s3.noeve.store;
    client_max_body_size 100M; # Allow large media uploads
    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# MinIO Web Console Server Block (Port 9001)
server {
    listen 80;
    server_name storage.noeve.store;
    location / {
        proxy_pass http://localhost:9001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and restart Nginx:

```bash
ln -s /etc/nginx/sites-available/noeve /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 2. Secure with SSL (HTTPS)

Install Let's Encrypt Certbot to automatically generate free SSL certificates:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Run certbot to secure all your domains at once:

```bash
sudo certbot --nginx -d noeve.store -d www.noeve.store -d admin.noeve.store -d api.noeve.store -d s3.noeve.store -d storage.noeve.store
```

Follow the prompts, and Certbot will automatically update your Nginx configuration to support `https://`.

> **Troubleshooting Certbot `unauthorized` / `404` Error (e.g., `Detail: 66.116.209.85: Invalid response... 404`):**
> If Certbot shows an IP address different from your Hostinger VPS IP (`187.127.136.221`)—such as `66.116.209.85`—it means your domain on BigRock is still pointing to **BigRock's default parked page IP** instead of your VPS:
>
> 1. In your **BigRock Control Panel -> Manage DNS -> A Records**, **delete** all existing default A records pointing to `66.116.209.85` (including any wildcard `*` A record).
> 2. Ensure **Domain Forwarding** is disabled in BigRock.
> 3. Also ensure ports `80` and `443` are open on your VPS (`sudo ufw allow 80 && sudo ufw allow 443`) and in the Hostinger VPS Firewall panel, and remove the default Nginx site if it conflicts (`sudo rm -f /etc/nginx/sites-enabled/default && sudo systemctl reload nginx`).
> 4. Run `dig +short noeve.store api.noeve.store` on your VPS. Once it returns `187.127.136.221`, re-run the `sudo certbot --nginx ...` command above.

Your application and storage are now fully live, locked down, and accessible via secure HTTPS domains!

---

## Step 8: Updating the Hosted Site (Deploying New Changes)

Whenever you make changes locally, follow this two-part workflow to deploy updates to your Hostinger VPS:

### 1. On Your Local Machine

Commit and push your latest code to GitHub:

```bash
git add .
git commit -m "your commit message"
git push origin main
```

### 2. On Your Hostinger VPS (via SSH)

SSH into your VPS, pull the latest code, rebuild the monorepo, and restart the PM2 processes:

```bash
cd /var/www/noeve-store

# 1. Pull the latest changes from Git
git pull origin main

# 2. Install any new dependencies
pnpm install

# 3. Regenerate Prisma client & apply any schema changes to PostgreSQL
pnpm --filter @noeve/api exec prisma generate
pnpm --filter @noeve/api exec prisma db push

# 4. Rebuild all packages and apps
pnpm build

# 5. Restart the running PM2 services with --update-env to pick up the new build and .env changes
pm2 restart noeve-api noeve-store noeve-admin --update-env
```

_(Tip: Because `apps/api/.env`, `apps/web-store/.env.local`, and `apps/web-admin/.env.local` are symlinked to `/var/www/noeve-store/.env`, any edits to `/var/www/noeve-store/.env` apply everywhere automatically—just run `sed -i 's/\r$//' .env && sed -i 's/[[:space:]]_$//' .env` after editing to ensure no trailing whitespace).\*
