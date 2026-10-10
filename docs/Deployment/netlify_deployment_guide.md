# Deploying Sarangi Jewels Frontends to Netlify (Free Plan)

This guide provides step-by-step instructions to deploy your frontend applications (`web-store` and `web-admin`) from your Turborepo (using `pnpm`) to Netlify's free plan.

## 1. Prerequisites
- A [Netlify account](https://app.netlify.com/signup) (Free tier is fine).
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## 2. Setting up Netlify Configuration (Optional but Recommended)

Since you are using a monorepo with `turbo` and `pnpm`, it is highly recommended to add a `netlify.toml` file at the root of your project to tell Netlify exactly how to build and where to look for your apps.

Create a `netlify.toml` at the root (`/home/digeeshs/Work/paralava/Projects/sarangi/Code/netlify.toml`):

```toml
# Configuration for web-store
[[builds]]
  base = "apps/web-store" # Update this to match your actual directory structure if different
  publish = "dist"        # Change to ".next" if using Next.js, or "dist" if using Vite/React
  command = "pnpm run build"
  environment = { NODE_VERSION = "20" }

# Configuration for web-admin (if you want to deploy it as a separate site)
[[builds]]
  base = "apps/web-admin" 
  publish = "dist"        # Change to ".next" if using Next.js
  command = "pnpm run build"
  environment = { NODE_VERSION = "20" }
```
*(Note: Netlify handles monorepos well. You'll set up two separate "Sites" in Netlify, one for the store and one for the admin, pointing to the same repository).*

## 3. Deploying via Netlify Dashboard (Step-by-Step)

### Step 3.1: Connect your Repository
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** > **"Import an existing project"**.
3. Select your Git provider (GitHub, GitLab, etc.) and authorize Netlify.
4. Select your `sarangi` repository.

### Step 3.2: Configure the `web-store` Deployment
Netlify will ask for your build settings. Because this is a monorepo, configure it as follows:

- **Base directory:** `apps/web-store` (the folder containing your store's `package.json`).
- **Build command:** `pnpm run build` (or `npx turbo run build --filter=@sarangi/web-store`).
- **Publish directory:** 
  - If Next.js: `.next`
  - If Vite/React: `dist`
  *(Netlify usually auto-detects this if you leave it blank, but it's safer to specify).*

**Environment Variables:**
Click "Add environment variables" and add any required API keys or backend URLs your frontend needs (e.g., `NEXT_PUBLIC_API_URL`, Firebase configs).

Click **Deploy Site**.

### Step 3.3: Configure the `web-admin` Deployment
To deploy the admin dashboard:
1. Go back to your Netlify Team overview.
2. Click **"Add new site"** > **"Import an existing project"**.
3. Select the **same** `sarangi` repository again.
4. This time, configure it for the admin:
   - **Base directory:** `apps/web-admin`
   - **Build command:** `pnpm run build`
   - **Publish directory:** `dist` or `.next`
5. Add admin-specific environment variables.
6. Click **Deploy Site**.

## 4. Handling `pnpm` on Netlify

Netlify natively supports `pnpm`. By specifying `packageManager: "pnpm@9.15.0"` in your root `package.json` (which you already have), Netlify will automatically install and use `pnpm` version 9.15.0 during the build process.

You do not need any custom installation scripts for pnpm.

## 5. Setting Custom Domains (Free!)

Once deployed, Netlify gives you a random URL (e.g., `fancy-unicorn-1234.netlify.app`). 
1. Go to **Site settings** > **Domain management**.
2. Click **Add custom domain**.
3. Enter your domain (e.g., `store.sarangi.com` or `admin.sarangi.com`).
4. Follow the instructions to update your DNS records (CNAME) with your domain provider. Netlify automatically provides free SSL certificates via Let's Encrypt.

## Troubleshooting Builds

If your build fails, check the Netlify Deploy Logs. Common monorepo issues:
- **Missing Environment Variables:** Ensure all `.env` variables used in local development are added to the Netlify dashboard.
- **Node Version:** Your `package.json` specifies Node `>=20`. Ensure you add an environment variable in Netlify: `NODE_VERSION` = `20` to guarantee compatibility.
