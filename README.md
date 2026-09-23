# Sarasavi Pages — Web-Based Bookstore Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

> **SLIIT — Faculty of Computing**  
> **Module:** SE2030 Software Engineering Project  
> **Batch & Group:** Y2S1 • Batch 9 • Group 2  
> **Project:** Enterprise Web-Based Bookstore Management System for Sarasavi Pages (Pvt) Ltd.

---

## 📖 Project Overview

**Sarasavi Pages** is an enterprise-grade, cloud-ready web application designed for online book retail and comprehensive administrative management. The platform features an advanced **Role-Based Access Control (RBAC)** architecture that allows distinct departmental administrators to securely manage their respective modules while providing the Super Administrator with full centralized system oversight.

---

## 👥 Group Members & Module Allocation

| # | Member Name | Student ID | Module Scope | Role | Access Level |
|---|-------------|------------|--------------|------|--------------|
| 1 | **Gunathilaka H.D.T.T.** | **IT25101540** | **Module 1: Admin & Staff Management** | `SUPER_ADMIN` | **Full Access** (All Modules + Staff CRUD + Audit Trail) |
| 2 | Anaf M.K.A.S. | IT25102345 | Module 2: Payment Management | `PAYMENT_ADMIN` | Payment & Gateway Operations only |
| 3 | ffZeen A.C. | IT25103342 | Module 3: Customer Service & Tickets | `CUSTOMER_SERVICE_ADMIN` | Helpdesk & Support Tickets only |
| 4 | Dissanayake S.A.S.D. | IT25101062 | Module 4: Inventory & Catalog | `INVENTORY_ADMIN` | Book Inventory & Genre Catalog only |
| 5 | Gayathmi P.G.R. | IT25103013 | Module 5: User Accounts & Profiles | `ACCOUNT_ADMIN` | Customer Accounts & KYC only |
| 6 | Diyes C.L. | IT25100263 | Module 6: Orders & Shopping Cart | `ORDER_ADMIN` | Order Fulfillment & Logistics only |

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.3.4 (Java 17+)
- **Security:** Spring Security with stateless JWT Bearer token authentication
- **Database:** PostgreSQL 16 with Flyway database migration
- **Persistence:** Spring Data JPA / Hibernate
- **Build Tool:** Apache Maven

### Frontend
- **Framework:** Next.js 14 (App Router) + React 18
- **Language:** TypeScript 5.6
- **Styling:** Tailwind CSS with custom glassmorphism and theme tokens
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request interceptors and cookie session handling

### Infrastructure & DevOps
- **Containerization:** Docker & Docker Compose
- **Database Service:** PostgreSQL 16 Alpine container

---

## 📁 Repository Structure

```text
Web-Based-Bookstore/
├── .gitignore
├── README.md
├── LICENSE
├── Antigravity_Master_Prompt_SarasaviPages.md
└── sarasavi-pages-bookstore/
    ├── docker-compose.yml              # PostgreSQL and infrastructure
    ├── .env.example                    # Environment variable configuration
    │
    ├── backend/                        # Spring Boot REST API
    │   ├── pom.xml
    │   └── src/main/
    │       ├── java/com/sarasavipages/
    │       │   ├── SarasaviPagesApplication.java
    │       │   ├── config/             # SecurityConfig, JwtAuthFilter, JwtUtil
    │       │   ├── common/             # ApiResponse, GlobalExceptionHandler
    │       │   └── members/            # Modular member code
    │       │       ├── m1_gunathilaka_adminstaff/
    │       │       │   ├── controller/ # AuthController, StaffController
    │       │       │   ├── service/    # StaffService, AuditLogService
    │       │       │   ├── repository/ # StaffRepository, AuditLogRepository
    │       │       │   ├── entity/     # Staff, AuditLog, StaffRole
    │       │       │   └── dto/        # StaffRequest, StaffResponse, Login
    │       │       └── m2_anaf_payment/
    │       └── resources/
    │           ├── application.yml
    │           └── db/migration/       # V1 Flyway schema and seed data
    │
    └── frontend/                       # Next.js 14 Web Application
        ├── package.json
        ├── tailwind.config.js
        ├── tsconfig.json
        ├── lib/api-client.ts           # Axios client with JWT interceptor
        ├── hooks/useAuth.tsx           # Authentication context & session
        ├── types/admin.ts              # TypeScript domain types & metadata
        ├── components/admin/           # Dynamic role-gated Sidebar & Header
        └── app/
            ├── layout.tsx              # Root layout with AuthProvider & fonts
            ├── globals.css             # Design tokens and glassmorphism utilities
            ├── page.tsx                # Auto-redirect landing page
            ├── login/page.tsx          # Login portal with preset quick-fill chips
            └── (admin)/                # Protected Administration Portal
                ├── layout.tsx          # Authenticated layout guard
                ├── dashboard/page.tsx  # Central Super Admin dashboard
                ├── staff/page.tsx      # Staff CRUD & RBAC management
                ├── audit-logs/page.tsx # Immutable security audit trail
                ├── payment/            # Module 2 dashboard
                ├── customer-service/   # Module 3 dashboard
                ├── inventory/          # Module 4 dashboard
                ├── accounts/           # Module 5 dashboard
                └── orders/             # Module 6 dashboard
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Git**
- **Java Development Kit (JDK 17 or higher)**
- **Node.js (v18.x or v20.x)** and `npm`
- **Docker Desktop** (or PostgreSQL installed locally)

### 2. Clone the Repository
```bash
git clone https://github.com/thevinduthenura/Web-Based-Bookstore.git
cd Web-Based-Bookstore/sarasavi-pages-bookstore
```

### 3. Start Database Service
```bash
docker-compose up -d postgres
```

### 4. Run Spring Boot Backend
```bash
cd backend
./mvnw spring-boot:run
# or on Windows:
mvn spring-boot:run
```
* Backend will start on `http://localhost:8080`.
* Database tables and demo accounts will automatically initialize via Flyway migration.

### 5. Run Next.js Frontend
In a new terminal window:
```bash
cd sarasavi-pages-bookstore/frontend
npm install
npm run dev
```
* Open `http://localhost:3000` in your web browser.

---

## 🔑 Pre-Seeded Staff Accounts for Testing

The system is pre-loaded with BCrypt hashed credentials for testing all roles:

| Username | Password | Assigned Role | Permissions |
|----------|----------|---------------|-------------|
| `GunathilakaT1540` | `1540` | `SUPER_ADMIN` | **Full System Access** (All 6 modules, Staff CRUD, Audits) |
| `AnafS2345` | `2345` | `PAYMENT_ADMIN` | Module 2: Payment & Invoices |
| `ZeenC3342` | `3342` | `CUSTOMER_SERVICE_ADMIN` | Module 3: Customer Service & Tickets |
| `DissanayakeD1062` | `1062` | `INVENTORY_ADMIN` | Module 4: Inventory & Catalog |
| `GayathmiR3013` | `3013` | `ACCOUNT_ADMIN` | Module 5: User Accounts & Profiles |
| `DiyesL0263` | `0263` | `ORDER_ADMIN` | Module 6: Orders & Shopping Cart |

> **Note:** The login page also features **Quick Demo Preset Buttons** allowing one-click autofill for evaluation and presentation purposes.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.