# Security and Deployment Guidelines

This document outlines the security considerations for the Sarangi Jewels platform, detailing how to enforce industry-standard security and addressing the safety of deploying on a local machine.

## Is it safe to deploy on a local machine?

Deploying a production application on a personal or local office machine (like a Debian XFCE4 desktop) comes with significant caveats. While it is perfectly safe for **development and testing**, exposing a local machine to the public internet for **production use** introduces several risks.

### Risks of Local Production Deployment:
1. **Network Exposure:** To make the site accessible globally, you must configure Port Forwarding (NAT) on your home/office router to point traffic to your local machine. This opens your internal network to malicious scans and automated attacks from the internet.
2. **Downtime and Reliability:** Local machines are susceptible to power outages, ISP IP changes (if you don't have a static IP), hardware failures, and accidental shutdowns, resulting in poor uptime.
3. **Bandwidth Limitations:** Residential and standard office ISPs often have asymmetric speeds (slow upload speeds) and data caps, which can bottleneck a web storefront.
4. **Physical Security:** A cloud provider guarantees physical security. A local machine can be accessed or tampered with physically.

### The Verdict:
*   **For Development/Staging:** 100% safe and highly recommended. You can safely simulate a production environment locally without exposing it to the public internet.
*   **For True Production:** **Not recommended**. You should deploy to an isolated cloud environment (e.g., DigitalOcean, AWS, Linode) to protect your local network, ensure 99.9% uptime, and leverage built-in cloud firewalls.

---

## Enforcing Industry-Standard Security

To elevate the Sarangi Jewels platform to enterprise-grade security, whether deployed locally (for staging) or on a cloud VPS (for production), the following layers of security must be implemented.

### 1. Network & Infrastructure Security

*   **Cloudflare Proxy:** Route all DNS traffic through Cloudflare (Proxy mode). This hides your server's true IP address, provides Web Application Firewall (WAF) protection, and mitigates Distributed Denial of Service (DDoS) attacks.
*   **UFW (Uncomplicated Firewall):** Strictly block all incoming traffic except for HTTP (80), HTTPS (443), and SSH (22).
    ```bash
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 22/tcp
    sudo ufw enable
    ```
*   **Fail2Ban:** Install `fail2ban` to automatically ban IP addresses that show malicious signs, such as too many failed SSH login attempts or repeated invalid API requests.
*   **SSH Hardening:** 
    *   Disable password authentication and strictly require SSH Key pairs.
    *   Change the default SSH port (22) to a non-standard port (e.g., 2244) to reduce automated bot noise.
    *   Disable root login (`PermitRootLogin no` in `/etc/ssh/sshd_config`).

### 2. Application-Level Security

*   **TLS/SSL Encryption:** Enforce strict HTTPS using Let's Encrypt or Cloudflare Edge certificates. Never transmit sensitive customer data or admin credentials over plain HTTP.
*   **Rate Limiting:** Implement API rate limiting using NestJS Rate Limiter or Nginx to prevent brute-force attacks on login endpoints and protect against API abuse.
*   **Helmet & Security Headers:** Ensure the NestJS API uses `helmet` to set secure HTTP headers (e.g., preventing XSS, Clickjacking, and disabling MIME sniffing). Next.js storefronts should similarly return robust Content Security Policies (CSP).
*   **Input Validation & Sanitization:** Ensure all incoming API payloads are validated using NestJS `class-validator`. Never trust client-side data.
*   **ORM Security:** Continue utilizing Prisma ORM, which inherently protects against SQL Injection attacks by using parameterized queries.

### 3. Container & Operational Security

*   **Docker Security:** 
    *   Run containers in isolated Docker networks (as configured in the production docker-compose file).
    *   Do not expose internal database ports (Postgres 5432, Redis 6379) to the host machine in production; let them communicate purely via the Docker bridge network.
*   **Principle of Least Privilege:** Ensure database users have only the permissions they need.
*   **Automatic Updates:** Configure `unattended-upgrades` on your Debian/Ubuntu server to ensure the underlying OS receives critical security patches automatically.

### 4. Data Protection & Secrets Management

*   **Environment Variables:** Never commit `.env` files to source control. Ensure file permissions on `.env.production` are restricted to the root/deployment user (`chmod 600 .env.production`).
*   **Database Backups:** Implement automated, encrypted cron job backups of the Postgres database (e.g., using `pg_dump`) and ship them to an off-site location like AWS S3 or a separate backup server.
*   **Authentication & Tokens:** 
    *   Ensure JWT secrets are long, randomly generated, and rotated periodically.
    *   Passwords must remain hashed using strong algorithms like bcrypt/Argon2 (already implemented).

### Summary Checklist for Production Deployment

- [ ] Cloudflare enabled (DNS Proxy)
- [ ] UFW configured (only 80, 443, 22 exposed)
- [ ] SSH hardened (Key-auth only, root disabled)
- [ ] Valid SSL Certificates installed
- [ ] Internal Docker ports secured (Postgres/Redis not bound to 0.0.0.0)
- [ ] API Rate limiting active
- [ ] Automated database backups scheduled

---

## Step-by-Step: Deploying/Testing `sarangijewels.com` Locally

Since `sarangijewels.com` is already deployed live on BigRock, you must trick your local machine into resolving the domain to your local IP (`127.0.0.1`) instead of the live BigRock server. This allows you to test the production domain names locally without affecting the actual live site.

### Step 1: Override DNS Locally via `/etc/hosts`

1. Open a terminal on your Debian machine.
2. Edit the hosts file using root privileges:
   ```bash
   sudo nano /etc/hosts
   ```
3. Add the following line at the very bottom of the file:
   ```text
   127.0.0.1   sarangijewels.com www.sarangijewels.com api.sarangijewels.com admin.sarangijewels.com
   ```
4. Save the file (`Ctrl+O`, then `Enter`) and exit nano (`Ctrl+X`).

*From this point forward, opening `sarangijewels.com` in your local browser will point to your local development environment rather than BigRock. To view the live site again, simply comment out or delete this line.*

### Step 2: Accessing via Currently Running Dev Servers

If you are running the applications in development mode via terminal (e.g., `pnpm run dev`), you must append the development port to the domain in your browser:

*   **Web Store:** `http://sarangijewels.com:3000`
*   **NestJS API:** `http://api.sarangijewels.com:3001`
*   **Web Admin:** `http://admin.sarangijewels.com:3002`

### Step 3 (Optional): Simulating Production Ports (80/443) locally via Docker

If you want to access `http://sarangijewels.com` directly without specifying the `:3000` port (simulating exactly how it behaves on BigRock):

1. **Stop your active `pnpm run dev` servers** to free up the ports.
2. Ensure you have copied your `.env` configuration:
   ```bash
   cp .env.production.example .env.production
   ```
3. Start the local Docker Compose stack (which includes an Nginx reverse proxy):
   ```bash
   docker compose -f infrastructure/docker/docker-compose.yml up -d
   ```
   *(Note: For local testing without SSL, use the standard `docker-compose.yml` instead of the `.prod.yml` variant to bypass Let's Encrypt requirements).*
4. You can now visit `http://sarangijewels.com` in your browser. Nginx will automatically route the traffic to the correct local Docker container.
