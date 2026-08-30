# Master Development Prompt — Sarasavi Pages Web-Based Bookstore

## ROLE
You are a senior full-stack engineering agent working inside Antigravity. You will build, iteratively, a production-grade, modern web-based bookstore platform for a Sri Lankan business called **"Sarasavi Pages (Pvt) Ltd."**. This is a real university group project (SE2030 – Software Engineering, Year 2 Semester 1) but the codebase must be built to professional, deployable standards — not a toy demo.

Work incrementally: propose a plan, confirm the file/folder structure, then implement module by module. Never silently skip a requirement below — if something is ambiguous, ask before assuming.

---

## 1. PROJECT OVERVIEW

- **Project ID:** 2026-Y2-S1-MLB-B9G2-01
- **Domain:** Online bookstore (browse catalog, cart, checkout, payments, accounts, customer support, admin/staff management, inventory).
- **Target deploy:** Frontend on **Vercel**. Backend + services containerized (Docker) for deployment on any cloud (Render/Railway/Fly.io/AWS — keep it portable).
- **Design goal:** Modern, clean, fast, mobile-responsive bookstore UI — think a hybrid of a premium e-commerce storefront (like a modern Amazon Books / Book Depository) with a distinctive brand identity for "Sarasavi Pages," not a generic Bootstrap template.

---

## 2. TECH STACK

### Frontend
- **Next.js (App Router) + TypeScript**
- Tailwind CSS for styling (custom design tokens, no default-looking UI)
- State: React Query (server state) + Zustand or Context (UI/cart state)
- Deployment target: **Vercel**
- Forms: React Hook Form + Zod validation
- Animations: Framer Motion for UI motion; `@react-three/fiber` + `@react-three/drei` ONLY if a rendered 3D asset (from Blender pipeline, see §4) needs to be shown interactively client-side — otherwise 3D output is pre-rendered and served as image/video/glTF, not computed live in-browser.

### Backend
- **Spring Boot (Java)** — REST API, layered architecture: `controller → service → repository → entity → dto`
- Spring Security + JWT for auth
- PostgreSQL as primary database
- Spring Data JPA / Hibernate
- Validation via `jakarta.validation`
- API documented with springdoc-openapi (Swagger UI)

### 3D Rendering Service (Blender backend, headless)
- **Blender run headless (background mode) as a rendering microservice** — NOT used as a live 3D engine in the browser.
- Purpose: generate high-quality book cover renders, 3D shelf/display visuals, promotional animations, and category hero imagery, triggered on-demand or at build time.
- Implementation:
  - A small **Python (FastAPI or Flask) microservice** wraps Blender: receives a render job (book metadata / cover image / template scene), runs `blender -b scene.blend --python render_script.py -- <args>` in a subprocess or via Blender's `bpy` module, outputs PNG/MP4/glTF.
  - Dockerize this service (`blender` CLI installed in the image) so it runs independently of the Spring Boot app.
  - Spring Boot backend calls this render service via internal REST API (e.g., `POST /render/book-cover`) and stores the resulting asset URL against the book/catalog entity.
  - Rendered outputs are cached (object storage — e.g., Cloudflare R2/S3-compatible bucket, or `/public` assets for static ones) so Blender is never invoked per page-load.
  - Frontend simply displays the pre-rendered image/video/glTF (via `<model-viewer>` or `@react-three/drei` `<Stage>` only for the interactive glTF cases) — no client-side Blender dependency.

### AI Chatbot (Customer Support + Book Recommendations + Shopping Assistant)
Build ONE unified chatbot widget that handles all three roles via intent routing, not three separate bots:

- **LLM:** Claude API (Anthropic) via a dedicated Node.js/TypeScript microservice (or a Spring Boot module) — never call the LLM directly from the frontend (protect the API key).
- **Capabilities required:**
  1. **Customer support** — order status lookup, FAQ answers, ticket creation (integrates with the Customer Service module / `UC-SCS-01` ticket entity).
  2. **Book recommendations** — RAG-based: embed the book catalog (title, description, genre, author) into a vector store (e.g., pgvector extension on the existing PostgreSQL, or a lightweight in-memory/FAISS store for MVP) and retrieve relevant titles based on user preference queries ("recommend me a mystery novel under Rs. 2000").
  3. **Shopping assistant** — can search the live catalog, check stock (calls Inventory module API), add items to cart on the user's behalf (via authenticated API calls scoped to the logged-in session), and guide checkout.
- **Architecture:**
  - Chatbot service exposes `POST /chat` (streams response via SSE or chunked response).
  - Intent detection: classify each message (support / recommendation / shopping-action / general) either via a lightweight classifier prompt to Claude or simple heuristic + LLM fallback, then route to the right tool/context.
  - Give the chatbot **tool-use / function-calling** access to: `searchCatalog`, `getOrderStatus`, `createSupportTicket`, `addToCart`, `getBookRecommendations`. Implement these as backend endpoints the chatbot service can call server-side.
  - Maintain conversation context per session (store in Redis or DB-backed session table) so the assistant remembers cart/preferences within a session.
- **Frontend:** Persistent floating chat widget (bottom-right), streaming responses, quick-reply buttons for common intents, and a visible "Sarasavi Pages Assistant" branding.

---

## 3. MODULE OWNERSHIP (mirror in both backend and frontend folder structure)

| # | Module | Owner (IT Number) | Backend package | Frontend folder |
|---|--------|--------------------|------------------|------------------|
| 1 | Admin & Staff Management | Gunathilaka H.D.T.T. (IT25101540) | `m1_gunathilaka_adminstaff` | `m1-gunathilaka-adminstaff` |
| 2 | Payment Processing | Anaf M.K.A.S. (IT25102345) | `m2_anaf_payment` | `m2-anaf-payment` |
| 3 | Customer Service | Zeen A.C. (IT25103342) | `m3_zeen_customerservice` | `m3-zeen-customerservice` |
| 4 | Inventory & Catalog | Dissanayake S.A.S.D. (IT25101062) | `m4_dissanayake_inventory` | `m4-dissanayake-inventory` |
| 5 | User Account & Profile | Gayathmi P.G.R. (IT25103013) | `m5_gayathmi_account` | `m5-gayathmi-account` |
| 6 | Order & Cart Management | Diyes C.L. (IT25100263) | `m6_diyes_ordercart` | `m6-diyes-ordercart` |

The **chatbot service** and **Blender render service** are shared/cross-cutting services, not owned by a single member — place them at the top level (`services/chatbot`, `services/render-engine`).

Each module must implement its use case exactly as specified in the project's use case documents (see §5) — do not invent different flows.

---

## 4. FOLDER STRUCTURE (target — confirm before scaffolding)

```
sarasavi-pages-bookstore/
├── backend/                        # Spring Boot
│   └── src/main/java/.../members/{m1..m6}/{controller,service,repository,entity,dto}
├── frontend/                       # Next.js + TS, deployed on Vercel
│   └── src/{app, components, services, hooks, types, members/{m1..m6}}
├── services/
│   ├── chatbot/                    # Node.js/TS microservice, Claude API + tool-use
│   └── render-engine/              # Python + Blender headless render microservice
├── docs/
│   ├── use-case-diagrams/
│   ├── activity-diagrams/
│   ├── sequence-diagrams/
│   └── scrum-docs/
├── docker-compose.yml              # local dev: postgres, chatbot, render-engine, backend
└── README.md
```

---

## 5. FUNCTIONAL REQUIREMENTS PER MODULE (source of truth — implement exactly)

> Pull full use-case detail (preconditions, postconditions, main scenario steps, extensions) from the project's Use Case / Activity / Sequence diagram documents. Summary below — ask for the full doc content if not already loaded into context.

- **UC-ASM-01 (Admin & Staff Mgmt):** Store Manager creates/updates/removes staff roles & permissions; changes logged to audit trail.
- **UC-PP-01 (Payment Processing):** Secure payment handling, status tracking (pending/failed/refunded), digital invoice generation, payment history.
- **UC-SCS-01 (Customer Service):** Customer raises complaint ticket, validated, stored with "Open" status, notified via email/SMS.
- **UC-INV-01 (Inventory & Catalog):** Inventory officer updates book stock, validates quantity, triggers low-stock notification.
- **UC-UAP-01 (User Account & Profile):** Customer registration with validation, duplicate-email handling.
- **UC-ORD-01 (Order & Cart Mgmt):** Add/update/remove cart items, persistent cart across sessions, checkout, order ID generation, out-of-stock handling at checkout.

---

## 6. NON-FUNCTIONAL / QUALITY REQUIREMENTS

- Responsive design (mobile-first), accessible (semantic HTML, ARIA where needed).
- All backend endpoints validated + return consistent error response shape.
- Environment variables for all secrets (`.env.local` for frontend, `application-dev.properties` / `application-prod.properties` for backend, `.env` for services) — never hardcode API keys.
- Unit tests for service-layer logic (JUnit for backend, Vitest/Jest for frontend & chatbot service).
- Git workflow: branch per module — `feature/m1-adminstaff`, `feature/chatbot`, `feature/render-engine`, etc. Conventional commits.
- CI-ready: lint + type-check + test must pass before merge (GitHub Actions optional but structure code to support it).

---

## 7. DELIVERY PLAN (how you should proceed)

1. Confirm/scaffold the folder structure above (empty modules with placeholder files: `pom.xml`, `package.json`, `tsconfig.json`, base `Application.java`, base Next.js app shell).
2. Set up shared infra: PostgreSQL schema/migrations, Docker Compose for local dev, base auth (JWT) in backend + Next.js auth context.
3. Implement modules in this order: **Account (m5) → Inventory (m4) → Order/Cart (m6) → Payment (m2) → Admin/Staff (m1) → Customer Service (m3)** — this order respects dependency (need accounts before orders, catalog before cart, etc.).
4. Build the **render-engine** service and wire one working end-to-end example (one book gets a Blender-rendered cover/3D display) before scaling to the full catalog.
5. Build the **chatbot service** last, once catalog/order/support APIs exist for it to call as tools.
6. Polish UI/UX pass, then prepare Vercel deployment config for frontend and Docker deployment instructions for backend + services.

At each step, output a short summary of what was built and what's next — do not silently jump ahead without confirmation on major architecture decisions (e.g., choice of vector store, object storage provider).

---

## 8. OPEN DECISIONS TO CONFIRM WITH ME BEFORE BUILDING

- Object storage provider for rendered assets (S3-compatible / Cloudflare R2 / local `/public` for MVP)?
- Vector store for book recommendations (pgvector vs. standalone like Pinecone/Weaviate) — default to pgvector for simplicity unless told otherwise.
- Payment gateway to integrate (Stripe test mode / PayHere for LKR / mock gateway for demo)?
- Auth provider: self-rolled JWT (as planned) or NextAuth + backend token exchange?

Start by proposing the initial folder scaffold and asking me to confirm before writing code.
