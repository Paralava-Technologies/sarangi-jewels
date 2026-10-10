# Horizontal Scaling & Deployment Guidelines

This document outlines the architectural requirements and necessary configurations to horizontally scale the Sarangi Jewels platform across multiple nodes behind a load balancer on cloud providers like AWS.

## 1. Front-End Applications (Next.js)

Next.js is designed to scale, but its aggressive caching mechanisms require specific configurations when running in a multi-node environment.

### 1.1 The Cache Synchronization Problem
By default, the Next.js App Router (v13+) stores its Data Cache (from `fetch` requests) and Full Route Cache on the local file system of the specific node it is running on. 
- **The Issue:** If you trigger an on-demand revalidation (e.g., `revalidateTag` or `revalidatePath` via a webhook) to update a product price, the cache will only clear on the node that processed the webhook. Other nodes will continue to serve stale data.
- **The Solution:** You must implement a **Custom Cache Handler** that uses a centralized, distributed cache store (such as Redis/AWS ElastiCache). This ensures all Next.js instances read from and write to the exact same cache state. 
- *Note:* If deployed on a managed platform like Vercel, this distributed caching architecture is handled automatically.

### 1.2 Image Optimization
Next.js optimizes images on the fly and caches the output locally.
- In a multi-node setup, the same image might be optimized redundantly on every single node.
- **The Solution:** Configure a Custom Image Loader in Next.js to offload image optimization to an external CDN (e.g., Cloudinary, AWS S3 with CloudFront, or Imgix).

### 1.3 Session Management
The front-end applications are entirely stateless. User sessions are managed via JWTs (JSON Web Tokens) stored in HTTP-only cookies.
- **Benefit:** A request can hit any Next.js node without losing the user's session. Sticky sessions on the load balancer are not required.

---

## 2. Backend API (NestJS)

The NestJS backend requires a few structural changes to safely operate across multiple nodes.

### 2.1 File Storage & Uploads (Critical Blocker)
Currently, the API saves uploaded files (e.g., product images) to the local disk in the `apps/api/public/uploads` directory.
- **The Issue:** In a load-balanced environment, a file uploaded to Node A will not be accessible when a user's subsequent request is routed to Node B.
- **The Solution:** File uploads must be migrated to an object storage service like **AWS S3**. The API must upload files directly to S3 and store the resulting S3 URLs in the database. The local `public/uploads` folder should be deprecated for production use.

### 2.2 Stateless Authentication
Like the front-end, the API utilizes JWTs for authentication, ensuring no session state is maintained in-memory on the server.
- **Benefit:** Safe for Round Robin or Least Connections routing strategies on the load balancer.

### 2.3 Background Jobs
The platform uses background queues (e.g., BullMQ) for asynchronous tasks like email notifications.
- **Requirement:** Ensure BullMQ is connected to a centralized Redis instance. Redis acts as the central message broker, allowing background jobs to scale perfectly and be distributed among all available API nodes without duplication of work.

---

## 3. Recommended AWS Infrastructure Architecture

To horizontally scale this application on AWS, the following architecture is recommended:

1. **Application Load Balancer (ALB):** Routes incoming external HTTPS traffic to the appropriate Next.js and NestJS nodes.
2. **Compute (AWS ECS with Fargate or EKS):** Containerize the Next.js and NestJS applications using Docker. Run them within Auto Scaling Groups based on CPU/Memory utilization.
3. **Distributed Cache (AWS ElastiCache for Redis):** A single managed Redis cluster utilized by:
   - Next.js (for the distributed custom cache handler).
   - NestJS (for rate-limiting, session deduplication, and BullMQ background jobs).
4. **Database (AWS RDS for PostgreSQL):** A managed, highly available database cluster (Multi-AZ).
   - *Scaling Consideration:* If API nodes scale significantly, consider implementing connection pooling (e.g., AWS RDS Proxy or PgBouncer) to prevent exhausting database connections.
5. **Storage & CDN (AWS S3 + CloudFront):** S3 stores all user-uploaded media and static assets. CloudFront sits in front of S3 to cache and serve these assets globally for optimal performance.
