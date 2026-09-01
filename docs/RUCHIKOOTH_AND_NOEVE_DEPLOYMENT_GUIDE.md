# Ruchikooth & Sarangi Jewels.store — Dual Deployment Guide

This comprehensive guide outlines the complete step-by-step deployment procedure for hosting:
1. **Ruchikooth** (`ruchikooth.com` & `admin.ruchikooth.com`) on **Firebase Hosting** (Zero server cost / Global CDN).
2. **sarangijewels.com** (`sarangijewels.com`, `admin.sarangijewels.com`, `api.sarangijewels.com`) on a **VPS** using **Docker Compose** and **Nginx**.

---

## Executive Summary & Architecture Overview

| Application | Domain(s) | Hosting Provider | Tech Stack / Services |
| :--- | :--- | :--- | :--- |
| **Ruchikooth Storefront** | `ruchikooth.com`<br>`www.ruchikooth.com` | Firebase Hosting | React / Next.js (Static/SSG/SPA) |
| **Ruchikooth Admin** | `admin.ruchikooth.com` | Firebase Hosting | React / Next.js (Static/SPA) |
| **sarangijewels.com** | `sarangijewels.com`<br>`www.sarangijewels.com` | VPS (BigRock / Hostinger / etc.) | Docker Container (Next.js 15) |
| **sarangijewels.com Admin** | `admin.sarangijewels.com` | VPS | Docker Container (Next.js 15) |
| **sarangijewels.com API** | `api.sarangijewels.com` | VPS | Docker Container (NestJS) |
| **sarangijewels.com DB & Services** | Internal | VPS | PostgreSQL 16, Redis 7, MinIO, Nginx |

---

# Part 1: Ruchikooth Deployment (Firebase Hosting)

Since **Ruchikooth** utilizes **Firebase** as its backend (Firestore, Firebase Auth, Storage), hosting its frontends directly on **Firebase Hosting** eliminates all server compute costs and preserves 100% of your VPS memory for `sarangijewels.com`.

---

## Step 1: Initialize Firebase Project

1. Open the [Firebase Console](https://console.firebase.google.com/) and sign in.
2. Click **Add Project** and name it `ruchikooth-prod` (or select your existing project).
3. Install the Firebase CLI locally:
   ```bash
   npm install -g firebase-tools
   ```
4. Authenticate with your Firebase account:
   ```bash
   firebase login
   ```

---

## Step 2: Create Multi-Site Hosting Targets

Firebase Hosting supports multiple sub-sites under a single project.

1. In the Firebase Console, go to **Build** $\rightarrow$ **Hosting**.
2. Scroll to the bottom and click **Add another site**.
   - Create Site 1: `ruchikooth-web`
   - Create Site 2: `ruchikooth-admin`
3. In your local Ruchikooth project directory, attach deploy target aliases:
   ```bash
   firebase target:apply hosting store ruchikooth-web
   firebase target:apply hosting admin ruchikooth-admin
   ```

---

## Step 3: Configure `firebase.json`

Ensure your root `firebase.json` file properly points each target to its respective build directory:

```json
{
  "hosting": [
    {
      "target": "store",
      "public": "apps/store/out",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    },
    {
      "target": "admin",
      "public": "apps/admin/out",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}
```

---

## Step 4: Map Custom Domains

1. In Firebase Console $\rightarrow$ **Hosting**:
   - Under `ruchikooth-web`, click **Add custom domain** and enter `ruchikooth.com` (and `www.ruchikooth.com`).
   - Under `ruchikooth-admin`, click **Add custom domain** and enter `admin.ruchikooth.com`.
2. Access your DNS domain manager (e.g., GoDaddy, Namecheap, BigRock) and add the **A Records** and **TXT Records** provided by Firebase.

---

## Step 5: Build and Deploy

Execute the build pipeline and deploy both applications:

```bash
# Export static production builds
npm run build

# Deploy both apps to Firebase Hosting
firebase deploy --only hosting
```

---

# Part 2: sarangijewels.com Deployment (VPS Docker Stack)

`sarangijewels.com` runs a **6-container Docker stack** + Nginx on your VPS (PostgreSQL, Redis, MinIO, NestJS API, Storefront Next.js, Admin Next.js).

---

## Step 1: DNS Records Setup

Log into your domain registrar for `sarangijewels.com` and create four **A Records** pointing to your VPS public IP address:

| Host / Subdomain | Type | Target IP |
| :--- | :--- | :--- |
| `@` (`sarangijewels.com`) | A | `<YOUR_VPS_IP>` |
| `www` | A | `<YOUR_VPS_IP>` |
| `api` | A | `<YOUR_VPS_IP>` |
| `admin` | A | `<YOUR_VPS_IP>` |

---

## Step 2: VPS Server Initialization

1. SSH into your VPS as `root`:
   ```bash
   ssh root@<YOUR_VPS_IP>
   ```

2. Update system packages and install Docker:
   ```bash
   apt update && apt upgrade -y
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   apt install certbot -y
   ```

3. **(Optional for 2GB RAM VPS)** Add a 2GB Swap space to protect against Out-Of-Memory (OOM) process crashes:
   ```bash
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```

---

## Step 3: Application Setup & Secrets Configuration

1. Create working directories:
   ```bash
   mkdir -p /opt/sarangi/infrastructure/certs
   cd /opt/sarangi
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/digeesh09/sarangijewels.com.git .
   ```

3. Create the production environment file:
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```

4. Populate strong passwords and variables:
   ```env
   POSTGRES_PASSWORD=generate_secure_random_password
   REDIS_PASSWORD=generate_secure_random_password
   JWT_SECRET=generate_long_random_jwt_secret_key
   MINIO_ROOT_PASSWORD=generate_secure_minio_password
   NEXT_PUBLIC_API_URL=https://api.sarangijewels.com/v1
   ```

---

## Step 4: Issue Let's Encrypt SSL Certificates

1. Stop any service using port 80 and issue certificates:
   ```bash
   certbot certonly --standalone \
     -d sarangijewels.com \
     -d www.sarangijewels.com \
     -d api.sarangijewels.com \
     -d admin.sarangijewels.com
   ```

2. Copy certificates into the expected infrastructure folder:
   ```bash
   cp -r /etc/letsencrypt/live/sarangijewels.com/* /opt/sarangi/infrastructure/certs/
   ```

---

## Step 5: Launch the Production Docker Stack

1. Start all containers in background mode:
   ```bash
   docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file .env.production up -d
   ```

2. Verify container statuses:
   ```bash
   docker ps
   ```
   *You should see 7 running services (`sarangi-postgres`, `sarangi-redis`, `sarangi-minio`, `sarangi-api`, `sarangi-web-store`, `sarangi-web-admin`, `sarangi-nginx`).*

---

## Step 6: Database Migrations & Validation

1. Run database migrations:
   ```bash
   docker exec -it sarangi-api npx prisma migrate deploy
   ```

2. Verify endpoint accessibility:
   - **Web Storefront:** `https://sarangijewels.com`
   - **Admin Dashboard:** `https://admin.sarangijewels.com`
   - **API Health Check:** `https://api.sarangijewels.com/v1/store/health`

---

## Step 7: Automated SSL Renewal

Add an automated cron job to handle certificate renewals:

```bash
crontab -e
```

Add the following line to check for renewals bi-monthly:
```cron
0 3 1 */2 * certbot renew --quiet && docker exec sarangi-nginx nginx -s reload
```

---

> **Document Created:** July 2026
