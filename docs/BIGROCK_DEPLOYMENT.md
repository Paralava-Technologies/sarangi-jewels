# Sarangi Jewels — Bigrock Shared Linux Hosting Deployment Guide

This document provides a step-by-step guide to deploying the Sarangi Jewels application (API, Web Store, and Web Admin) onto a **Bigrock.in Shared Linux Hosting** environment using cPanel.

Since Bigrock Shared Hosting does not support Docker, you will deploy the Next.js and NestJS applications natively using cPanel's **"Setup Node.js App"** feature. 

## Prerequisites on Bigrock
1. **cPanel Access:** Ensure your Bigrock plan includes cPanel with the **"Setup Node.js App"** (Phusion Passenger) feature enabled.
2. **Domain Configuration:** `sarangijewels.com` must be mapped to your hosting account.
3. **Subdomains:** Create the following subdomains in cPanel:
   - `api.sarangijewels.com` (for the NestJS backend)
   - `admin.sarangijewels.com` (for the Web Admin portal)
4. **Database:** Bigrock typically provides **MySQL**. Since Sarangi Jewels is configured for **PostgreSQL**, you must either:
   - Verify if Bigrock offers PostgreSQL on your specific plan.
   - Or, use a free/managed external PostgreSQL database like [Supabase](https://supabase.com) or [Neon.tech](https://neon.tech), and connect to it using the connection string.
5. **SSL Certificates:** Install Let's Encrypt SSL for `sarangijewels.com`, `api.sarangijewels.com`, and `admin.sarangijewels.com` via cPanel's SSL/TLS Status module.

---

## Step 1: Prepare the Build Locally

Shared hosting servers typically enforce strict CPU and memory limits. Running a full monorepo build process (`pnpm install && pnpm build`) on the server will almost certainly crash (Out Of Memory). You must build the applications on your local machine and upload the compiled assets.

Open your terminal locally in the `Code` directory and run:

### 1. Build the API (NestJS)
```bash
pnpm install
npx prisma generate
pnpm --filter @noeve/api build
```

### 2. Build the Web Store (Next.js)
The Web Store is configured to use Next.js `standalone` mode, which creates a highly optimized, self-contained server ideal for shared hosting.
```bash
export NEXT_PUBLIC_API_URL=https://api.sarangijewels.com
pnpm --filter @noeve/web-store build
```

### 3. Build the Web Admin (Next.js)
```bash
export NEXT_PUBLIC_API_URL=https://api.sarangijewels.com
pnpm --filter @noeve/web-admin build
```

---

## Step 2: Prepare Deployment Folders

Before uploading, package the built files into structured folders on your local machine so they are ready for cPanel.

### Prepare the API Folder (`noeve-api.zip`)
Create a local folder named `noeve-api` and copy the following into it:
1. `apps/api/dist/` (The entire compiled folder)
2. `apps/api/package.json`
3. `apps/api/prisma/` (To run database migrations)
4. Create a `.env` file containing your production variables:
   ```env
   DATABASE_URL="your-postgresql-database-url"
   JWT_SECRET="your-secure-secret-key"
   PORT=3001
   ```
*Zip this folder into `noeve-api.zip`.*

### Prepare the Web Store Folder (`sarangijewels.com.zip`)
1. Create a local folder named `sarangijewels.com`.
2. Copy all contents from `apps/web-store/.next/standalone/` into `sarangijewels.com/`.
3. Copy the `apps/web-store/public/` folder into `sarangijewels.com/public/`.
4. Copy the `apps/web-store/.next/static/` folder into `sarangijewels.com/.next/static/`.
5. Create a `.env.production` file:
   ```env
   NEXT_PUBLIC_API_URL=https://api.sarangijewels.com
   PORT=3000
   ```
*Zip this folder into `sarangijewels.com.zip`.*

### Prepare the Web Admin Folder (`noeve-admin.zip`)
Repeat the exact same process as the Web Store, but using files from `apps/web-admin/`.
*Zip this folder into `noeve-admin.zip`.*

---

## Step 3: Upload and Extract in cPanel

1. Log in to your **Bigrock cPanel**.
2. Go to **File Manager**.
3. Create three new directories in your home root (outside of `public_html` for better security):
   - `/home/username/noeve-api`
   - `/home/username/sarangijewels.com`
   - `/home/username/noeve-admin`
4. Upload and extract your zip files into their respective directories.

---

## Step 4: Setup Node.js Apps in cPanel

In your cPanel dashboard, navigate to **Software > Setup Node.js App**. You will create an application for each service.

### 1. Configure the API
- **Node.js Version:** 20.x
- **Application Mode:** Production
- **Application Root:** `noeve-api`
- **Application URL:** `api.sarangijewels.com`
- **Application Startup File:** `dist/main.js`
- **Action:** Click "Create". 
- **Action:** Once created, scroll down to the "Run NPM Install" button and click it to install the production `node_modules` for the NestJS API.

### 2. Configure the Web Store
- **Node.js Version:** 20.x
- **Application Mode:** Production
- **Application Root:** `sarangijewels.com`
- **Application URL:** `sarangijewels.com`
- **Application Startup File:** `server.js`
- **Action:** Click "Create". (Next.js standalone already includes its required modules, so you do not need to run NPM install).

### 3. Configure the Web Admin
- **Node.js Version:** 20.x
- **Application Mode:** Production
- **Application Root:** `noeve-admin`
- **Application URL:** `admin.sarangijewels.com`
- **Application Startup File:** `server.js`
- **Action:** Click "Create".

---

## Step 5: Database Migrations

You must apply your Prisma database schema to your PostgreSQL database.
If you are using a managed database (like Supabase), you can simply run this command from your local terminal:

```bash
# From your local /Code/apps/api directory
export DATABASE_URL="your-production-database-url"
npx prisma migrate deploy
```

If you have SSH access to your Bigrock cPanel account:
```bash
ssh username@sarangijewels.com
cd ~/noeve-api
npx prisma migrate deploy
```

## Step 6: Start and Restart Applications

Go back to the **Setup Node.js App** page in cPanel. 
Ensure the status icon is green for all three applications (`sarangijewels.com`, `admin.sarangijewels.com`, and `api.sarangijewels.com`). If they are stopped, click the **Start** button. If you ever update environment variables or upload new code, click the **Restart** button to apply changes.

Your application is now live on Bigrock Shared Hosting!
