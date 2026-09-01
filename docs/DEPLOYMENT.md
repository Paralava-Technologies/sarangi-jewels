# Sarangi Jewels — Deployment Guide

This guide details how to deploy the Sarangi Jewels stack (API, Web Store, Web Admin) along with the required infrastructure (PostgreSQL, Redis, MinIO, Nginx) to a production Ubuntu server using Docker Compose.

## Prerequisites

1.  **Ubuntu VPS** (e.g., DigitalOcean, AWS EC2, Hetzner) with at least 2GB RAM.
2.  **Domain Name** with DNS A-records pointing to your VPS IP:
    *   `sarangijewels.com` (Web Store)
    *   `api.sarangijewels.com` (NestJS API)
    *   `admin.sarangijewels.com` (Web Admin)
3.  **Docker & Docker Compose** installed on the server.
4.  **GitHub Actions** (Optional) configured with secrets for CI/CD.

## 1. Initial Server Setup

SSH into your server and install Docker if you haven't already:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```
*(Log out and log back in to apply the group change)*

Create the deployment directory:
```bash
sudo mkdir -p /opt/sarangi/infrastructure/docker
sudo mkdir -p /opt/sarangi/infrastructure/nginx
sudo mkdir -p /opt/sarangi/infrastructure/certs
sudo chown -R $USER:$USER /opt/sarangi
cd /opt/sarangi
```

## 2. Configuration

Copy the production environment variables template (`.env.production.example` to `.env.production`) to your server at `/opt/sarangi/.env.production`.

```bash
nano .env.production
```
*Fill in **strong** passwords for Postgres, Redis, MinIO, and a long random string for `JWT_SECRET`.*

Copy the Docker Compose and Nginx files to your server:
*   `infrastructure/docker/docker-compose.prod.yml` -> `/opt/sarangi/infrastructure/docker/docker-compose.prod.yml`
*   `infrastructure/nginx/nginx.prod.conf` -> `/opt/sarangi/infrastructure/nginx/nginx.prod.conf`

## 3. SSL/TLS Certificates (Let's Encrypt)

Before starting the full stack, you need SSL certificates. The `docker-compose.prod.yml` file mounts the certs from `/opt/sarangi/infrastructure/certs`.

If you are using Certbot locally on the host:
```bash
sudo apt update && sudo apt install certbot -y
sudo certbot certonly --standalone -d sarangijewels.com -d www.sarangijewels.com -d api.sarangijewels.com -d admin.sarangijewels.com
```
Then symlink or copy them into the certs directory:
```bash
# Example
sudo cp -r /etc/letsencrypt/archive/sarangijewels.com/* /opt/sarangi/infrastructure/certs/
```

*Alternatively, the docker-compose file has an Nginx/Certbot setup you can use for webroot challenges.*

## 4. Deploying via GitHub Actions (CI/CD)

The project includes a `.github/workflows/ci.yml` file which automatically builds the Docker images and deploys them to your server via SSH when you push to the `main` branch.

To use this, set the following secrets in your GitHub repository:
*   `DOCKER_HUB_USERNAME`: Your Docker Hub username.
*   `DOCKER_HUB_TOKEN`: A Docker Hub Personal Access Token.
*   `SSH_HOST`: The IP address of your VPS.
*   `SSH_USER`: The SSH username (e.g., `root` or `ubuntu`).
*   `SSH_PRIVATE_KEY`: The SSH private key to access your VPS.

## 5. Manual Deployment

If you prefer to deploy manually or pull the pre-built images:

```bash
cd /opt/sarangi

# Pull latest images (assuming they are pushed to a registry)
# Or build them locally if you cloned the repo:
# docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file .env.production build

# Start the stack
docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file .env.production up -d
```

## 6. Database Initialization

On the very first deployment, you need to run the database migrations to set up the schemas:

```bash
# Run migrations inside the API container
docker exec -it sarangi-api npx prisma migrate deploy

# (Optional) Seed the database with initial products/admin user
docker exec -it sarangi-api npm run db:seed
```

## 7. Verifying the Deployment

*   **API:** Visit `https://api.sarangijewels.com/v1/store/health` - should return `{"status": "ok"}`
*   **Web Store:** Visit `https://sarangijewels.com`
*   **Web Admin:** Visit `https://admin.sarangijewels.com`

## Architecture Overview

*   **Nginx (Port 80/443):** Terminates TLS, handles HTTP->HTTPS redirects, serves Next.js static files aggressively, and proxies requests to the appropriate container based on the subdomain.
*   **Next.js (Web Store & Admin):** Run as minimal standalone Node.js servers.
*   **NestJS (API):** Serves the main backend logic.
*   **Postgres:** Primary relational database.
*   **Redis:** Caching and session storage (used by API).
*   **MinIO:** S3-compatible object storage for product images.
