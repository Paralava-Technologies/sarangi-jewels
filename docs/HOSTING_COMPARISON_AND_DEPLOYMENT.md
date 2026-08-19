# Sarangi Jewels — Hosting Comparison & Deployment Guide

> Comprehensive analysis of hosting providers and step-by-step deployment instructions for **sarangijewels.com**

---

## Table of Contents

1. [What Needs to Run](#1-what-needs-to-run)
2. [Provider Comparison](#2-provider-comparison)
3. [BigRock VPS Plans Breakdown](#3-bigrock-vps-plans-breakdown)
4. [Hetzner Cloud Plans Breakdown](#4-hetzner-cloud-plans-breakdown)
5. [RAM Requirement Analysis](#5-ram-requirement-analysis)
6. [Feature Comparison Matrix](#6-feature-comparison-matrix)
7. [Recommendation](#7-recommendation)
8. [Deployment Guide (BigRock VPS)](#8-deployment-guide-bigrock-vps)
9. [Post-Deployment Checklist](#9-post-deployment-checklist)
10. [Cost Projections](#10-cost-projections)

---

## 1. What Needs to Run

The production stack requires **6 Docker containers** + Nginx:

| Service        | Image                | Role                            | Port       |
| -------------- | -------------------- | ------------------------------- | ---------- |
| **PostgreSQL** | `postgres:16-alpine` | Primary database                | 5432       |
| **Redis**      | `redis:7-alpine`     | Caching / sessions              | 6379       |
| **MinIO**      | `minio/minio:latest` | S3-compatible object storage    | 9000, 9001 |
| **API**        | Custom (NestJS)      | Backend logic                   | 3001       |
| **Web Store**  | Custom (Next.js 15)  | Customer storefront             | 3000       |
| **Web Admin**  | Custom (Next.js 15)  | Admin dashboard                 | 3002       |
| **Nginx**      | `nginx:1.27-alpine`  | Reverse proxy + TLS termination | 80, 443    |

The entire stack runs via a single command using the existing `infrastructure/docker/docker-compose.prod.yml`.

---

## 2. Provider Comparison

### 2.1 BigRock VPS Cloud (India)

| Plan            | Price/mo    | Price/yr     | RAM      | vCPU  | Storage       | Type         |
| --------------- | ----------- | ------------ | -------- | ----- | ------------- | ------------ |
| VPS Cloud 2     | ~₹899       | ~₹10,788     | 2 GB     | 1     | 40 GB SSD     | India DC     |
| **VPS Cloud 3** | **~₹1,399** | **~₹16,788** | **4 GB** | **2** | **60 GB SSD** | **India DC** |
| VPS Cloud 4     | ~₹2,199     | ~₹26,388     | 6 GB     | 2     | 100 GB SSD    | India DC     |

- **Data Center:** Mumbai / Delhi (10-30ms latency for Indian users)
- **Payment:** INR (UPI, Netbanking, Credit/Debit card)
- **GST Invoice:** Yes
- **Support:** Indian timezone, Hindi/English

### 2.2 Hetzner Cloud (Germany)

| Plan      | Price/mo             | Price/yr     | RAM      | vCPU  | Storage   | Type          |
| --------- | -------------------- | ------------ | -------- | ----- | --------- | ------------- |
| **CPX12** | **$14.09 (~₹1,175)** | **~₹14,100** | **2 GB** | **1** | **40 GB** | **Europe DC** |
| CPX22     | $23.59 (~₹1,967)     | ~₹23,604     | 4 GB     | 2     | 80 GB     | Europe DC     |
| CPX32     | $42.59 (~₹3,550)     | ~₹42,600     | 8 GB     | 4     | 160 GB    | Europe DC     |

- **Data Center:** Nuremberg / Falkenstein, Germany (150-200ms latency to India)
- **Payment:** International credit card / PayPal (forex charges apply)
- **GST Invoice:** Not available (EU VAT only)
- **Support:** European timezone, English/German

---

## 3. BigRock VPS Plans Breakdown

### VPS Cloud 2 — ₹899/mo (2 GB, 1 vCPU, 40 GB SSD)

| Aspect                | Assessment                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Stack feasibility** | ⚠️ **Tight.** 6 Docker containers + OS need ~650 MB idle, ~1.6-1.8 GB under load. Leaves very little headroom. |
| **Traffic spikes**    | ❌ Risk of OOM (Out Of Memory) kills during peak traffic                                                       |
| **Mitigations**       | Disable MinIO → use Cloudflare R2 (free 10GB). Or add swap space (slower).                                     |
| **Verdict**           | Only if budget is strictly under ₹1,000/mo. Plan to upgrade soon.                                              |

### VPS Cloud 3 — ₹1,399/mo (4 GB, 2 vCPU, 60 GB SSD) ✅ **Recommended**

| Aspect                | Assessment                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **Stack feasibility** | ✅ **Comfortable.** 4 GB leaves ~2 GB free after all services run, enough for traffic spikes. |
| **Traffic spikes**    | ✅ Handles concurrent users well                                                              |
| **Growth room**       | ⚠️ Some room for moderate traffic growth                                                      |
| **Verdict**           | **Best value** — cheapest plan that runs the full stack comfortably with Indian DC.           |

### VPS Cloud 4 — ₹2,199/mo (6 GB, 2 vCPU, 100 GB SSD)

| Aspect                | Assessment                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **Stack feasibility** | ✅✅ **Ample.** Plenty of RAM for all services + future additions (monitoring, staging, etc.) |
| **Traffic spikes**    | ✅✅ Can handle significant traffic                                                           |
| **Growth room**       | ✅ Excellent headroom for 1-2 years of growth                                                 |
| **Verdict**           | Choose if you want to "set and forget" without worrying about resources.                      |

---

## 4. Hetzner Cloud Plans Breakdown

### CPX12 — $14.09/mo (~₹1,175) (2 GB, 1 vCPU, 40 GB)

| Aspect                | Assessment                                                                       |
| --------------------- | -------------------------------------------------------------------------------- |
| **Stack feasibility** | ⚠️ Same 2 GB limitation as BigRock VPS 2                                         |
| **Indian latency**    | ❌ 150-200ms                                                                     |
| **Verdict**           | More expensive than BigRock VPS 2, same RAM, worse latency for India. Not ideal. |

### CPX22 — $23.59/mo (~₹1,967) (4 GB, 2 vCPU, 80 GB)

| Aspect                     | Assessment                                                      |
| -------------------------- | --------------------------------------------------------------- |
| **Stack feasibility**      | ✅ Same as BigRock VPS 3                                        |
| **Indian latency**         | ❌ 150-200ms                                                    |
| **Price vs BigRock VPS 3** | ❌ **₹568/mo more expensive** than BigRock VPS 3                |
| **Verdict**                | Good specs but significantly more expensive + European latency. |

### CPX32 — $42.59/mo (~₹3,550) (8 GB, 4 vCPU, 160 GB)

| Aspect                     | Assessment                                                                      |
| -------------------------- | ------------------------------------------------------------------------------- |
| **Stack feasibility**      | ✅✅ Overkill for current needs                                                 |
| **Indian latency**         | ❌ 150-200ms                                                                    |
| **Price vs BigRock VPS 4** | ❌ **₹1,351/mo more expensive**                                                 |
| **Verdict**                | Only makes sense if you already use Hetzner ecosystem or need European hosting. |

---

## 5. RAM Requirement Analysis

### Memory usage per service

| Service              | Idle        | Under Load          |
| -------------------- | ----------- | ------------------- |
| PostgreSQL           | ~100 MB     | ~300-500 MB         |
| Redis                | ~10 MB      | ~50 MB              |
| MinIO                | ~50 MB      | ~200 MB             |
| NestJS API           | ~150 MB     | ~400 MB             |
| Web Store (Next.js)  | ~100 MB     | ~250 MB             |
| Web Admin (Next.js)  | ~80 MB      | ~200 MB             |
| Nginx                | ~10 MB      | ~50 MB              |
| OS + Docker overhead | ~150 MB     | ~200 MB             |
| **Total**            | **~650 MB** | **~1.65 - 1.85 GB** |

### Capacity by plan

| Plan                              | RAM      | Headroom     | Can handle?                     |
| --------------------------------- | -------- | ------------ | ------------------------------- |
| BigRock VPS 2 / Hetzner CPX12     | 2 GB     | ~150 MB      | ⚠️ Marginal — vulnerable to OOM |
| **BigRock VPS 3** / Hetzner CPX22 | **4 GB** | **~2.15 GB** | ✅ Comfortable                  |
| BigRock VPS 4 / Hetzner CPX32     | 6+ GB    | 4+ GB        | ✅✅ Ample                      |

---

## 6. Feature Comparison Matrix

| Feature                   | **BigRock VPS**                      | **Hetzner Cloud**                       |
| ------------------------- | ------------------------------------ | --------------------------------------- |
| **Docker support**        | ✅ Install manually via SSH          | ✅ Install manually via SSH             |
| **Docker Compose deploy** | ✅ `docker compose up -d`            | ✅ `docker compose up -d`               |
| **SSL via Certbot**       | ✅                                   | ✅                                      |
| **DNS management**        | ✅ Domain registrar (add A records)  | Need separate DNS (Cloudflare, etc.)    |
| **Backups**               | Check with support                   | ✅ Snapshot system (paid, ~€0.01/GB/mo) |
| **cPanel included**       | May be optional (disable if present) | ❌ No cPanel                            |
| **Root SSH access**       | ✅ Full                              | ✅ Full                                 |
| **IPv4 address**          | ✅ Included                          | ✅ Included                             |
| **Data center location**  | 🇮🇳 **India** (Mumbai/Delhi)          | 🇪🇺 Europe (Germany/Finland)             |
| **Latency to India**      | **10-30 ms**                         | 150-200 ms                              |
| **Payment in INR**        | ✅ UPI, Netbanking, Card             | ❌ USD (credit card / PayPal)           |
| **GST invoice**           | ✅                                   | ❌                                      |
| **Support timezone**      | 🇮🇳 Indian IST                        | 🇪🇺 European CET                         |

---

## 7. Recommendation

### 🥇 Best Overall: BigRock VPS Cloud 3 (₹1,399/mo)

| Criterion   | Score                                       |
| ----------- | ------------------------------------------- |
| Cost        | ✅ Cheaper than equivalently spec'd Hetzner |
| RAM (4 GB)  | ✅ Comfortably runs full stack              |
| Indian DC   | ✅ 10-30ms for Indian customers             |
| INR billing | ✅ No forex charges                         |
| GST invoice | ✅ Business-ready                           |

### 🥈 Budget Pick: BigRock VPS Cloud 2 (₹899/mo)

- Only if under ₹1,000/mo is a hard constraint
- Must disable MinIO and use external S3 (Cloudflare R2 free tier) to save RAM
- Plan to upgrade to VPS 3 when traffic grows

### 🥉 Alternative: Hetzner CPX22 ($23.59/mo ≈ ₹1,967)

- Only if you specifically need European hosting
- More expensive than BigRock VPS 3 for same RAM
- Add ₹500-800/yr for Cloudflare DNS to reduce latency

---

## 8. Deployment Guide (BigRock VPS)

### Prerequisites

| Item                            | Details                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------- |
| BigRock VPS Cloud 3 (or higher) | Ubuntu 22.04/24.04 LTS recommended                                               |
| Domain                          | `sarangijewels.com` managed via BigRock or Cloudflare                                  |
| DNS Records                     | `sarangijewels.com` → VPS IP, `api.sarangijewels.com` → VPS IP, `admin.sarangijewels.com` → VPS IP |
| SSL                             | Let's Encrypt (auto-configured in Docker Compose)                                |

---

### Step 1: Initial Server Setup

SSH into your VPS:

```bash
ssh root@<your-vps-ip>
```

Update the system:

```bash
apt update && apt upgrade -y
```

Install Docker:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Log out and log back in for the group change to take effect:

```bash
exit
# SSH back in
ssh root@<your-vps-ip>
```

Create the deployment directory:

```bash
mkdir -p /opt/noeve/infrastructure/docker
mkdir -p /opt/noeve/infrastructure/nginx
mkdir -p /opt/noeve/infrastructure/certs
cd /opt/noeve
```

---

### Step 2: Get the Code

Clone the repository directly on the server:

```bash
git clone https://github.com/digeesh09/sarangijewels.com.git /opt/noeve
cd /opt/noeve
```

Or if you prefer to deploy from your local machine, copy the files via SCP:

```bash
# From your local machine
scp -r /home/digeeshs/Work/paralava/Projects/noeve/Code/* root@<your-vps-ip>:/opt/noeve/
```

---

### Step 3: Configure Environment

Copy the production environment template:

```bash
cp .env.production.example .env.production
```

Edit the file with strong, unique values:

```bash
nano .env.production
```

Required changes:

| Variable              | What to set                                              |
| --------------------- | -------------------------------------------------------- |
| `POSTGRES_PASSWORD`   | Strong random password (e.g., `openssl rand -base64 32`) |
| `REDIS_PASSWORD`      | Different strong random password                         |
| `JWT_SECRET`          | Long random string (min 64 chars)                        |
| `MINIO_ROOT_PASSWORD` | Another strong password                                  |
| `NEXT_PUBLIC_API_URL` | `https://api.sarangijewels.com/v1` (unchanged)                 |

> **💡 Tip:** Generate secure passwords with: `openssl rand -base64 32`

---

### Step 4: Copy Nginx and Docker Compose Configs

Ensure the production config files are in place (they should be if you cloned the repo):

```bash
ls infrastructure/docker/docker-compose.prod.yml
ls infrastructure/nginx/nginx.prod.conf
```

---

### Step 5: Obtain SSL Certificates

Before starting the stack, get Let's Encrypt certificates. First, install Certbot:

```bash
apt install certbot -y
```

Stop any service on port 80 (make sure nothing is running yet):

```bash
certbot certonly --standalone \
  -d sarangijewels.com \
  -d www.sarangijewels.com \
  -d api.sarangijewels.com \
  -d admin.sarangijewels.com
```

Copy certificates to the certs directory expected by Docker Compose:

```bash
cp -r /etc/letsencrypt/live/sarangijewels.com/* /opt/noeve/infrastructure/certs/
```

---

### Step 6: Deploy the Stack

```bash
cd /opt/noeve

# Start everything
docker compose -f infrastructure/docker/docker-compose.prod.yml \
  --env-file .env.production up -d
```

Check that all containers are running:

```bash
docker ps
```

You should see all 7 containers: `noeve-postgres`, `noeve-redis`, `noeve-minio`, `noeve-api`, `noeve-web-store`, `noeve-web-admin`, `noeve-nginx`.

---

### Step 7: Database Migrations

Run Prisma migrations to set up the database schema:

```bash
docker exec -it noeve-api npx prisma migrate deploy
```

Optionally seed the database with initial data:

```bash
docker exec -it noeve-api npm run db:seed
```

---

### Step 8: Verify Deployment

Test each endpoint:

| URL                                       | Expected Result        |
| ----------------------------------------- | ---------------------- |
| `https://api.sarangijewels.com/v1/store/health` | `{"status": "ok"}`     |
| `https://sarangijewels.com`                     | Web store loads        |
| `https://admin.sarangijewels.com`               | Admin login page loads |

---

### Step 9: Set Up Auto-Renewal for SSL

Add a cron job to renew Let's Encrypt certificates automatically:

```bash
crontab -e
```

Add the following line (renews every 2 months, reloads nginx):

```bash
0 3 1 */2 * certbot renew --quiet && docker exec noeve-nginx nginx -s reload
```

---

## 9. Post-Deployment Checklist

- [ ] DNS A records propagate (check with `dig sarangijewels.com`)
- [ ] SSL certificates installed and valid
- [ ] All 7 Docker containers running (`docker ps`)
- [ ] API health endpoint returns 200
- [ ] Web store loads without errors
- [ ] Admin panel loads without errors
- [ ] Database migrations applied successfully
- [ ] Seed data loaded (if needed)
- [ ] MinIO accessible and images can be uploaded
- [ ] CORS configured correctly (API accepts requests from store & admin domains)
- [ ] Logging configured (check logs with `docker logs noeve-api`)

---

## 10. Cost Projections

### Year 1 — BigRock VPS Cloud 3

| Item                           | Cost                   |
| ------------------------------ | ---------------------- |
| VPS (₹1,399 × 12)              | ₹16,788                |
| Domain renewal (`sarangijewels.com`) | ~₹800-1,000/yr         |
| SSL (Let's Encrypt)            | ✅ Free                |
| **Total Year 1**               | **~₹17,588 - ₹17,788** |
| **Total per month**            | **~₹1,466 - ₹1,482**   |

### Year 1 — BigRock VPS Cloud 2 (budget option)

| Item                                   | Cost                   |
| -------------------------------------- | ---------------------- |
| VPS (₹899 × 12)                        | ₹10,788                |
| Domain renewal                         | ~₹800-1,000/yr         |
| SSL (Let's Encrypt)                    | ✅ Free                |
| Cloudflare R2 (external S3, free tier) | ✅ Free (10 GB)        |
| Upstash Redis (external, free tier)    | ✅ Free                |
| **Total Year 1**                       | **~₹11,588 - ₹11,788** |
| **Total per month**                    | **~₹966 - ₹982**       |

---

## Quick Reference

### Common Docker Commands

```bash
# View all container status
docker ps

# View logs for a service
docker logs noeve-api
docker logs noeve-web-store

# Restart a service
docker restart noeve-api

# Stop the entire stack
docker compose -f infrastructure/docker/docker-compose.prod.yml down

# Update containers (after pulling new images)
docker compose -f infrastructure/docker/docker-compose.prod.yml pull
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d

# Run migrations after update
docker exec noeve-api npx prisma migrate deploy
```

### Useful Monitoring Commands

```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check Docker disk usage
docker system df

# View real-time logs across all services
docker compose -f infrastructure/docker/docker-compose.prod.yml logs -f
```

---

> **Last Updated:** July 2026
>
> **Note:** Prices are approximate and may vary. Always check the provider's website for current pricing.
