# Hosting a Secondary Next.js Application on Hostinger VPS (Without a Domain)

Since you do not have a dedicated domain name for the new site, you have two primary ways to access it while running it alongside your existing application:
1. **Via IP Address and Port**: e.g., `http://YOUR_VPS_IP:3001` or `http://YOUR_VPS_IP:8080`
2. **Via Subdirectory on Existing Domain**: e.g., `https://your-existing-domain.com/new-app` (Requires Next.js `basePath` configuration).

This guide focuses on the most straightforward method: **IP Address and Port**, along with a guide to use **Nginx** as a reverse proxy for it.

## Prerequisites
- SSH access to your Hostinger VPS.
- Node.js and npm installed.
- PM2 installed globally (`npm install -g pm2`).
- Nginx (if you are using it for the main site).

## Step 1: Upload and Prepare the Application
1. Connect to your VPS via SSH:
   ```bash
   ssh root@YOUR_VPS_IP
   ```
2. Navigate to your web directory (commonly `/var/www/`):
   ```bash
   cd /var/www/
   ```
3. Create a new folder for your second application:
   ```bash
   mkdir second-app
   cd second-app
   ```
4. Transfer your Next.js project files into this folder (using Git, FTP, or SCP). Make sure to exclude `node_modules` and `.next`.
5. Install dependencies and build the app:
   ```bash
   npm install
   npm run build
   ```

## Step 2: Start the Application with PM2 on a Custom Port
Your main application is likely running on port 3000. We will run the new one on port 3001 to avoid conflicts.

1. Start the Next.js app using PM2 and specify port 3001:
   ```bash
   PORT=3001 pm2 start npm --name "second-app" -- start
   ```
2. Save the PM2 process list so it automatically restarts on server reboot:
   ```bash
   pm2 save
   ```

## Step 3: Accessing the Application

### Option A: Direct Access via IP and Port (Easiest)
If you don't want to configure Nginx for this app, you can access it directly using the server's IP.
1. Open port 3001 in your firewall. If you are using UFW on Ubuntu:
   ```bash
   ufw allow 3001
   ```
   *(Note: You can also manage firewall rules from the Hostinger VPS Dashboard -> Network -> Firewall).*
2. You can now access the site at:
   `http://YOUR_VPS_IP:3001`

### Option B: Using Nginx (Recommended)
If you want to use Nginx to serve the site via the IP address on a different port (like 8080) for better performance and reverse-proxy management:

1. Create a new Nginx configuration block:
   ```bash
   nano /etc/nginx/sites-available/second-app
   ```
2. Add the following configuration (Replace `YOUR_VPS_IP` with your actual VPS IP address):
   ```nginx
   server {
       listen 8080; # You can use any open port like 8080
       server_name YOUR_VPS_IP;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. Enable the configuration by creating a symlink:
   ```bash
   ln -s /etc/nginx/sites-available/second-app /etc/nginx/sites-enabled/
   ```
4. Test the Nginx configuration and restart the service:
   ```bash
   nginx -t
   systemctl restart nginx
   ```
5. Allow the Nginx listen port in the firewall (e.g., 8080):
   ```bash
   ufw allow 8080
   ```
6. Access your site at `http://YOUR_VPS_IP:8080`.

## Alternative: Subdirectory on Existing Domain
If you prefer to access it like `https://existing-domain.com/second-app`, you must:
1. Update `next.config.js` in your second app with `basePath: '/second-app'`.
2. Rebuild the app (`npm run build`).
3. Add a new `location /second-app` block in your existing domain's Nginx configuration (usually in `/etc/nginx/sites-available/main-app`) pointing to `http://localhost:3001`.

