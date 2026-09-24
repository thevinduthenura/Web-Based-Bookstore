# Sarasavi Pages — Web-Based Bookstore Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![MSSQL](https://img.shields.io/badge/Database-MSSQL%20%2F%20Postgres-CC292B.svg)](https://www.microsoft.com/sql-server)
[![MongoDB](https://img.shields.io/badge/Replica-MongoDB-47A248.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

> **SLIIT — Faculty of Computing**  
> **Module:** SE2030 Software Engineering Project  
> **Batch & Group:** Y2S1 • Batch 9 • Group 2  
> **Project:** Enterprise Web-Based Bookstore Management System for Sarasavi Pages (Pvt) Ltd.

---

## 📖 Project Overview

**Sarasavi Pages** is an enterprise-grade full-stack web-based bookstore and inventory platform. It combines a warm editorial consumer storefront inspired by classical literary aesthetics with a comprehensive **Role-Based Access Control (RBAC)** departmental administration suite.

The system features:
1. **Full-Featured Consumer E-Commerce Experience:**
   - Classical aesthetic bookstore with live inventory, curated collections, and author spotlights.
   - Dedicated paginated Catalog page (`/catalog`) with real-time title/author search, genre filtering, price sorting, and instant stock indicators.
   - Interactive slide-over shopping bag drawer with live subtotal calculation.
   - Full multi-step Checkout and Payment procedure (Shipping details, payment gateway simulation with Credit/Debit/Bank Transfer, order confirmation).
   - Order Tax Invoice generation with simulated email notification and direct one-click `.txt` invoice download.
   - Customer Order History and Live Tracking page (`/orders`) with status progression timelines (Confirmed -> Processing -> Dispatched -> Delivered).
2. **Tiered Membership & Access Distinction System:**
   - **Strict Access Separation:** Newly registered customer accounts default to `STANDARD` tier with zero membership perks, no KYC badge, and 0% discount.
   - **Self-Service Membership Activation:** Users can choose from **Reader Basic** (10% storewide discount) or **Scholar Premium** (20% storewide discount + free priority delivery).
   - **Instant Payment & Activation:** Users pay for membership directly via card/bank transfer, receive immediate activation, and download an official **Membership Tax Invoice** on the spot.
   - Customer Account Dashboard (`/account`) with profile editing, membership tier controls, and payment receipt ledger.
3. **3-Tier Resilient Enterprise Data Architecture:**
   - **Tier 1 (Primary Operational DB):** Microsoft SQL Server (MSSQL) / JPA for all transactional writes (users, books, inventory, carts/orders, transactions).
   - **Tier 2 (Secondary Read Mirror):** MongoDB replica mirroring `books_mirror` and `orders_mirror` via a Spring `@Scheduled` background worker running every 5 minutes.
   - **Tier 3 (Disaster Recovery JSON Backup):** Automated daily Spring `@Scheduled` worker running at 02:00 AM exporting all tables to timestamped `/backups/YYYY-MM-DD/*.json` with `manifest.json` and 30-day retention auto-purging.
4. **Departmental Administration Portals:**
   - 6 distinct admin roles with departmental views: Super Admin, Payment, Customer Service, Inventory, Accounts, and Orders.

---

## 👥 Group Members & Module Allocation

| # | Member Name | Student ID | Module Scope | Role | Access Level |
|---|-------------|------------|--------------|------|--------------|
| 1 | **Gunathilaka H.D.T.T.** | **IT25101540** | **Module 1: Admin & Staff Management** | `SUPER_ADMIN` | **Full Access** (All Modules + Staff CRUD + Audit Trail + Disaster Recovery) |
| 2 | Anaf M.K.A.S. | IT25102345 | Module 2: Payment Management | `PAYMENT_ADMIN` | Payment & Gateway Operations only |
| 3 | Zeen A.C. | IT25103342 | Module 3: Customer Service & Tickets | `CUSTOMER_SERVICE_ADMIN` | Helpdesk & Support Tickets only |
| 4 | Dissanayake S.A.S.D. | IT25101062 | Module 4: Inventory & Catalog | `INVENTORY_ADMIN` | Book Inventory & Genre Catalog only |
| 5 | Gayathmi P.G.R. | IT25103013 | Module 5: User Accounts & Profiles | `ACCOUNT_ADMIN` | Customer Accounts & KYC only |
| 6 | Diyes C.L. | IT25100263 | Module 6: Orders & Shopping Cart | `ORDER_ADMIN` | Order Fulfillment & Logistics only |

---

## 🏛️ 3-Tier Data Architecture

```mermaid
graph TD
    User([Customer / Admin]) -->|REST API / JWT| Backend[Spring Boot 3.3.4 Application]
    
    subgraph "Tier 1: Primary Operational Storage (MSSQL / JPA)"
        Backend -->|Transactional Reads & Writes| MSSQL[(MSSQL Primary Database)]
        MSSQL --- T_Books[Books]
        MSSQL --- T_Users[Users / Staff]
        MSSQL --- T_Orders[Carts & Orders]
        MSSQL --- T_Inv[Inventory Items]
        MSSQL --- T_Audits[Audit Logs]
    end

    subgraph "Tier 2: Replica Mirror for Redundancy (MongoDB)"
        Backend -.->|@Scheduled Every 5 Min SyncScheduler| Mongo[(MongoDB Mirror)]
        Mongo --- M_Books[books_mirror Collection]
        Mongo --- M_Orders[orders_mirror Collection]
    end

    subgraph "Tier 3: Disaster Recovery JSON Backups"
        Backend -.->|@Scheduled Daily 02:00 AM BackupScheduler| Backups[Timestamped JSON Store]
        Backups --- B_JSON["/backups/YYYY-MM-DD/*.json + manifest.json"]
        Backups --- B_Retention["Auto-purge folders > 30 Days"]
    end
```

### 1. Tier 1: MSSQL Primary Operational Database
- Stores relational entities: Books, Users, Staff, Carts/Orders, Inventory, and Audit Logs.
- Enforces ACID transactions, unique constraints, and referential integrity.
- Production profile: `application-mssql.yml`. Development fallback: `application-h2.yml`.

### 2. Tier 2: MongoDB Secondary Read Mirror
- Document collections: `books_mirror` and `orders_mirror`.
- Synchronized by `SyncScheduler.java`:
  - Runs every 5 minutes (`fixedRate = 300000ms`).
  - Fetches records modified or added in MSSQL and upserts into MongoDB.
  - Fail-safe design: if MongoDB is unreachable, the scheduler logs warnings with retry resilience without crashing primary operations.

### 3. Tier 3: Disaster Recovery JSON Backup Engine
- Executed by `BackupScheduler.java`:
  - Automated cron schedule: `0 0 2 * * ?` (Daily at 02:00 AM).
  - Serializes all MSSQL table records into formatted JSON files under `/backups/YYYY-MM-DD/`:
    - `books.json`
    - `orders.json`
    - `inventory.json`
    - `manifest.json` (Includes timestamp, total records, record counts per table, and environment metadata).
  - Retention Policy: Automatically scans and purges backup directories older than 30 days.

---

## 📡 Disaster Recovery & Sync Admin Endpoints

Super Admins can trigger backups, inspect MongoDB sync status, or manually flush mirrors on-demand:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/admin/data/backup/trigger` | Triggers an immediate full database export to `/backups/YYYY-MM-DD/` | Super Admin (`SUPER_ADMIN`) |
| `GET` | `/api/admin/data/mirror/status` | Returns sync status, mirror document counts, and latest backup folder info | Super Admin (`SUPER_ADMIN`) |
| `POST` | `/api/admin/data/mirror/flush` | Manually flushes and resynchronizes all MSSQL records to MongoDB mirrors | Super Admin (`SUPER_ADMIN`) |

---

## 🛍️ Customer Experience & Core Features

### 1. Shopping Cart & Standard Checkout Flow
- **Floating Cart Bag:** View current items, update quantities, or remove items.
- **Member Tier Discount Application:** Displays original subtotal, membership tier discount, shipping fee, and net total.
- **Multi-Step Checkout Procedure:**
  1. **Shipping Details:** Full Name, Phone, Shipping Address, and optional Delivery Notes.
  2. **Payment Methods:** Credit Card, Debit Card, or Direct Bank Transfer (with account details).
  3. **Order Placement:** Validates stock, clears cart, saves order to customer history with order reference (`ORD-XXXXX`).
  4. **Official Tax Invoice:** Displays invoice number, VAT breakdown, timestamp, and provides an instant one-click **"Download Tax Invoice (.txt)"** button.

### 2. Membership Tiers & Separation
- **Standard Account (Default):**
  - Newly registered users have `tier: 'STANDARD'`, `membership: 'NONE'`, and `0%` discount.
  - No false badges or unearned VIP privileges.
- **Reader Basic Tier:**
  - LKR 1,500 / year.
  - 10% discount on all book purchases.
  - Member book club access.
- **Scholar Premium Tier:**
  - LKR 3,500 / year.
  - 20% discount on all purchases.
  - Free priority delivery & invitation to author book signings.
- **Self-Service Instant Upgrade:**
  - Available from the desktop navigation, the homepage banner, or the Customer Dashboard.
  - Pay via card/bank transfer -> Instant activation -> Instant official **Membership Tax Invoice (.txt)** download.

### 3. Dedicated Customer Views
- **Home (`/`):** Hero editorial showcase, featured selections, author quotes, customer testimonials, and live shopping bag drawer.
- **Catalog (`/catalog`):** Paginated catalog (8 books per page) with category chips (Fiction, Classic, Philosophy, Poetry, History), real-time search, sorting, and in-stock badges.
- **Order History & Tracking (`/orders`):** Lists all past customer orders with delivery status pills (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`), interactive 4-step courier progress bar, item breakdowns, and receipt download.
- **Customer Dashboard (`/account`):** View personal information, edit profile, check active membership, upgrade plans, and download transaction receipts.

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.3.4 (Java 17+)
- **Security:** Spring Security with stateless JWT Bearer token authentication & BCrypt hashing
- **Primary Database:** Microsoft SQL Server (MSSQL) / PostgreSQL / H2 Dev Fallback
- **Secondary Database:** MongoDB (Spring Data MongoDB)
- **Data Backup:** Jackson ObjectMapper JSR-310 JSON serialization engine
- **Task Scheduling:** Spring `@Scheduled` with `@EnableScheduling`

### Frontend
- **Framework:** Next.js 14 (App Router) + React 18
- **Language:** TypeScript 5.6
- **Styling:** Custom Vanilla CSS & Tailwind CSS tokens (Warm paper `#efead5`, Forest `#34451D`, Lime `#B7D85A`)
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request interceptors

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Java Development Kit (JDK 17 or higher)**
- **Node.js (v18.x or v20.x)** and `npm`
- **MongoDB** (optional; required for Tier 2 mirror; local dev runs seamlessly without it via H2 profile)
- **MSSQL / PostgreSQL** (optional; local dev defaults to in-memory H2)

### 2. Running Spring Boot Backend
```bash
cd sarasavi-pages-bookstore/backend

# Run with local H2 in-memory profile (Zero external database required):
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

# Or run with MSSQL and MongoDB Tier 1/2 enabled:
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mssql
```
* Backend starts at `http://localhost:8080`.
* Pre-seeded data, admin accounts, and book catalog will automatically initialize.

### 3. Running Next.js Frontend
In a new terminal window:
```bash
cd sarasavi-pages-bookstore/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
* Open `http://localhost:3000` in your web browser.

---

## 🔑 Pre-Seeded Accounts for Testing

### Staff & Departmental Admin Accounts
| Username | Password | Assigned Role | Permissions |
|----------|----------|---------------|-------------|
| `GunathilakaT1540` | `1540` | `SUPER_ADMIN` | **Full System Access** (All 6 modules, Staff CRUD, Audits, Disaster Recovery) |
| `AnafS2345` | `2345` | `PAYMENT_ADMIN` | Module 2: Payment & Invoices |
| `ZeenC3342` | `3342` | `CUSTOMER_SERVICE_ADMIN` | Module 3: Customer Service & Tickets |
| `DissanayakeD1062` | `1062` | `INVENTORY_ADMIN` | Module 4: Inventory & Catalog |
| `GayathmiR3013` | `3013` | `ACCOUNT_ADMIN` | Module 5: User Accounts & Profiles |
| `DiyesL0263` | `0263` | `ORDER_ADMIN` | Module 6: Orders & Shopping Cart |

### Customer Accounts
- **New Registration:** Any new account registered on the `/login` page automatically starts as a **Standard User** (`isMember: false`, `tier: 'STANDARD'`, `0% discount`).
- **Demo Customer Account:** Pre-configured demo login available via the Quick-Fill chips on `/login`.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.