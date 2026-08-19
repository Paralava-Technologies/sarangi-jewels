# Sarangi Jewels System Architecture & Technologies

## 1. System Overview

Sarangi Jewels is a unified platform comprising multiple front-end applications powered by a single, centralized backend API. The system is designed to provide a seamless shopping experience for customers across web and mobile platforms, while offering robust management tools for administrators. 

The repository is structured as a **Monorepo** using **pnpm workspaces** and **Turborepo** to ensure code reusability (shared types, UI tokens, API clients) and optimized build pipelines.

## 2. Technologies and Frameworks

### Core Infrastructure
- **Package Manager:** `pnpm` (fast, disk-space efficient).
- **Monorepo Build System:** `Turborepo` for orchestrating builds, linting, and testing across multiple apps and packages.
- **Language:** `TypeScript` (v5.7) strictly enforced across all applications and packages for end-to-end type safety.

### Backend (`apps/api`)
The central source of truth for business logic, catalog management, inventory, and order processing.
- **Framework:** `NestJS` (v10) - A progressive Node.js framework providing a modular, scalable architecture.
- **Database ORM:** `Prisma` (v6) connected to a **PostgreSQL** database.
- **Authentication:** `Passport.js` with `JWT` (JSON Web Tokens) and `bcrypt` for password hashing.
- **Validation:** `class-validator`, `class-transformer`, and `zod` for robust DTO (Data Transfer Object) validation.
- **Payments:** Integrated with `Razorpay`.
- **Email/Notifications:** `Nodemailer`.
- **Testing:** `Vitest`.

### Customer Web Store (`apps/web-store`)
The primary storefront for customers.
- **Framework:** `Next.js 15` utilizing the App Router for optimal Server-Side Rendering (SSR), SEO, and fast page loads.
- **UI Library:** `React 19`.
- **Styling:** `Tailwind CSS` alongside `PostCSS` and `autoprefixer` for responsive, utility-first styling.
- **Testing:** `Vitest` with `@testing-library/react`.

### Admin Dashboard (`apps/web-admin`)
A separate web application for internal staff to manage orders, catalog, and inventory.
- **Framework:** `Next.js 15` (App Router).
- **UI Library:** `React 19`.
- **Styling:** `Tailwind CSS`.
- **Testing:** `Vitest`.

### Customer Mobile App (`apps/mobile-store`)
A native mobile application for iOS and Android.
- **Framework:** `React Native` (v0.76) with `Expo` (v52).
- **Routing:** `Expo Router` for file-based navigation.
- **Local Storage:** `@react-native-async-storage/async-storage`.
- **Styling/Theme:** Shared UI tokens from the monorepo workspace.

### Shared Packages (`packages/`)
- **`@noeve/api-client`**: A shared HTTP client and React Query hooks wrapper used by all frontends.
- **`@noeve/shared-types`**: TypeScript interfaces and enums shared between the API and frontends.
- **`@noeve/ui-tokens`**: Design system tokens (colors, typography) shared across web and mobile.
- **`@noeve/validation`**: Shared Zod validation schemas.
- **`@noeve/config-typescript`**: Centralized `tsconfig`.

## 3. Architecture Patterns

### Domain-Driven Design (DDD) in API
The NestJS backend is structured into distinct domain modules:
- `auth`: Authentication and authorization.
- `users`: User profiles and addresses.
- `catalog`: Categories, products, and variants.
- `orders`: Order processing and lifecycle management.
- `cart`: Shopping cart management.
- `reviews`: Product reviews and ratings.
- `settings`: Application-wide configurations.

### API Communication
All frontend applications communicate with the backend via RESTful APIs endpoints exposed under `/api/v1/`.
The `api-client` package centralizes API calls, ensuring type-safe requests and responses using the interfaces defined in `shared-types`.

### Security Architecture
- **Role-Based Access Control (RBAC):** NestJS Guards enforce roles (e.g., `CUSTOMER`, `ADMIN`).
- **Data Protection:** Passwords are never stored in plaintext. JWTs are used for stateless, secure session management.
- **Environment Management:** Environment variables are strictly validated using `Zod`.

## 4. Deployment Architecture
- **API & Database:** Typically deployed to containerized environments (e.g., Docker, AWS ECS, or Fly.io) with a managed PostgreSQL instance.
- **Web Applications (Next.js):** Optimized for deployment on platforms like Vercel or custom Node.js servers via Docker.
- **Mobile Application:** Built and deployed using EAS (Expo Application Services) to the Apple App Store and Google Play Store.
