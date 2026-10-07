# SE2030 Software Engineering – Design Patterns Architecture & Viva Guide
**Project:** Sarasavi Pages – Web-Based Bookstore Management System  
**Module:** SE2030 – Software Engineering (2nd Year, 1st Semester – SLIIT)  
**Reference Lectures:** `Week11_Lecture_DesignPattern-Part01.pdf` & `DesignPattern PartII.pdf`

---

## 📌 Executive Summary / Quick Viva Reference (වීවා එකට කෙටි සටහන)

| Pattern | Category | Lecture Source | Implementation in Sarasavi Pages | Core Classes / Code Files |
| :--- | :--- | :--- | :--- | :--- |
| **1. Singleton** | Creational | **Part I** (Slide 14–27) | Spring Boot IoC Container Beans, JWT Token Generator, Background Schedulers | `JwtUtil.java`, `SyncScheduler.java`, All `@Service` classes |
| **2. Observer** | Behavioral | **Part I** (Slide 28–42) | Audit Logging on Security/Staff events, Real-time DB Sync to MongoDB Replica, Stock Adjustment Logs | `AuditLogService.java`, `SyncScheduler.java`, `InventoryServiceImpl.java` |
| **3. Strategy** | Behavioral | **Part II** (Slide 2–24) | Multi-channel Payment execution (Card, Bank Slip, Cash on Delivery), Promo Discount Calculation | `PaymentServiceImpl.java`, `PaymentMethod.java`, `PromotionServiceImpl.java` |
| **4. Factory Method** | Creational | **Part II** (Slide 25–36) | DTO mapping factories (`StaffResponse.from`), MongoDB to DTO Mirror factories | `StaffResponse.java`, `PaymentMapper.java` |
| **5. Decorator** | Structural | **Part II** (Slide 37–49) | Spring Security Filter Chain wrapping HTTP requests (`JwtAuthFilter`) | `JwtAuthFilter.java`, `SecurityConfig.java` |
| **Bonus: Builder** | Creational | GoF Standard | Fluent object creation across Entities and DTOs using Lombok | `Staff.builder()...build()`, `Payment.java` |
| **Bonus: State** | Behavioral | GoF Standard | Strict Payment Status lifecycle transitions (PENDING → PAID → REFUNDED) | `PaymentServiceImpl.java` (`ALLOWED_TRANSITIONS`) |

---

## 1. Creational: Singleton Pattern (Lecture Part I – Slide 14)

### 📖 Lecture Theory
- **Definition:** Ensures that a class has only **one instance** and provides a global point of access to it.
- **Why we need it:** Prevents unnecessary memory overhead, avoids multiple open database/network resources, and centralizes shared state.

### 💻 Sarasavi Pages Implementation

#### 1. Spring Framework Dependency Injection (IoC Container)
By default in Spring Boot, all beans annotated with `@Service`, `@Repository`, `@Component`, and `@RestController` are instantiated as **Singletons** in the ApplicationContext:
- `StaffService`
- `PaymentService`
- `CartService`
- `InventoryService`

#### 2. Stateless Utilities – `JwtUtil.java`
- **File:** `backend/src/main/java/com/sarasavipages/config/JwtUtil.java`
- **Explanation:** Only a single cryptographic signing key and single algorithm instance is kept in memory to sign and verify tokens for all concurrent staff users.

```java
// Centralized, singleton cryptographic helper
@Component
public class JwtUtil {
    private final Key key;
    // Single shared instance handles token generation & validation across the entire application
    public String generateToken(String username, String role) { ... }
}
```

#### 3. Scheduled Worker – `SyncScheduler.java`
- **File:** `backend/src/main/java/com/sarasavipages/members/sync/scheduler/SyncScheduler.java`
- **Explanation:** A single background thread executor monitors and syncs primary MSSQL tables to MongoDB replicas every 5 minutes.

---

## 2. Behavioral: Observer Pattern (Lecture Part I – Slide 28)

### 📖 Lecture Theory
- **Definition:** Defines a **one-to-many dependency** between objects so that when one object changes state, all its dependents are notified and updated automatically.
- **Components:** Subject (Observable), Observers, `attach()`, `notify()`.

### 💻 Sarasavi Pages Implementation

#### 1. Security & Administrative Audit Logging
- **Files:**  
  - `backend/src/main/java/com/sarasavipages/members/m1_gunathilaka_adminstaff/service/AuditLogService.java`  
  - `backend/src/main/java/com/sarasavipages/members/m1_gunathilaka_adminstaff/service/StaffService.java`
- **Explanation:** When any significant state change occurs in `StaffService` (e.g. staff created, updated, status toggled, or login), the `AuditLogService` acts as an observer, capturing the event and persisting an immutable entry into `audit_log` without coupling audit code to the primary business action.

```java
// Subject notifies the audit observer
auditLogService.log(
    performedBy, 
    AuditAction.STAFF_CREATED, 
    saved.getUsername(),
    "Staff created: " + saved.getFullName() + " (" + saved.getRole() + ")"
);
```

#### 2. Dual-Tier Database Sync (MSSQL → MongoDB Mirror)
- **File:** `backend/src/main/java/com/sarasavipages/members/sync/scheduler/SyncScheduler.java`
- **Explanation:** Primary database state modifications are observed and synchronized into the secondary MongoDB read-replica to maintain disaster recovery availability.

#### 3. Stock Level Notifications & Log
- **File:** `backend/src/main/java/com/sarasavipages/members/m4_dissanayake_inventory/service/InventoryServiceImpl.java`
- **Explanation:** When stock quantities decrease during order placement, observers detect threshold breaches and log them into `StockAdjustmentLog`, updating `StockStatus` from `IN_STOCK` to `LOW_STOCK` or `OUT_OF_STOCK`.

---

## 3. Behavioral: Strategy Pattern (Lecture Part II – Slide 2)

### 📖 Lecture Theory
- **Definition:** Defines a **family of algorithms**, encapsulates each one, and makes them **interchangeable at runtime** without altering client code.
- **Lecture Slide 10 Exact Example:** **"E-commerce Payment"** (CreditCardPayment, PayPalPayment, etc. with `pay(): void`).

### 💻 Sarasavi Pages Implementation

#### 1. Multi-Channel Payment Engine (Module M2 – Anaf)
- **Files:**  
  - `backend/src/main/java/com/sarasavipages/members/m2_anaf_payment/entity/PaymentMethod.java`  
  - `backend/src/main/java/com/sarasavipages/members/m2_anaf_payment/service/impl/PaymentServiceImpl.java`
- **Explanation:** At bookstore checkout, customers select between multiple payment channels:
  1. `CARD` (Credit/Debit Card via sandbox gateway)
  2. `BANK_TRANSFER` (Slip upload verification)
  3. `DIGITAL_WALLET` (Mobile wallet settlement)
  4. `CASH_ON_DELIVERY` (Order payment on book arrival)

The payment service executes the corresponding processing and approval verification strategy according to the selected `PaymentMethod`:

```java
// Payment Strategy Selection
public PaymentResponse recordPayment(PaymentCreateRequest request) {
    PaymentMethod method = request.getPaymentMethod();
    
    // Algorithm varies based on selected strategy
    if (method == PaymentMethod.CARD) {
        boolean approved = simulateGatewayCharge(request.getAmount());
        payment.setStatus(approved ? PaymentStatus.PAID : PaymentStatus.FAILED);
    } else if (method == PaymentMethod.BANK_TRANSFER) {
        payment.setStatus(PaymentStatus.PENDING); // Awaiting slip verification
    } else if (method == PaymentMethod.CASH_ON_DELIVERY) {
        payment.setStatus(PaymentStatus.PENDING); // Paid on delivery
    }
}
```

#### 2. Promotion & Coupon Discount Strategy (Module M6 – Diyes)
- **File:** `backend/src/main/java/com/sarasavipages/members/m6_diyes_orders/service/PromotionServiceImpl.java`
- **Explanation:** Evaluates discount algorithm variations (Percentage rate vs Maximum capped discount vs Minimum cart spend validation).

```java
@Override
public double calculateDiscount(Promotion promo, double cartTotal) {
    double rate = promo.getDiscountPercentage() > 0 ? promo.getDiscountPercentage() : promo.getDiscountPercent();
    double discount = cartTotal * (rate / 100.0);
    if (promo.getMaxDiscount() > 0) {
        discount = Math.min(discount, promo.getMaxDiscount()); // Strategy capping
    }
    return Math.round(discount * 100.0) / 100.0;
}
```

---

## 4. Creational: Factory Pattern / Factory Method (Lecture Part II – Slide 25)

### 📖 Lecture Theory
- **Definition:** Defines an interface or method for creating an object, but encapsulates object creation logic and hides instantiation complexity from the client.

### 💻 Sarasavi Pages Implementation

#### 1. Static Factory Methods in DTOs (`StaffResponse.java`)
- **File:** `backend/src/main/java/com/sarasavipages/members/m1_gunathilaka_adminstaff/dto/StaffResponse.java`
- **Explanation:** Client controllers never construct DTOs manually or expose internal entities directly. Instead, factory methods instantiate appropriate representations:

```java
public class StaffResponse {
    // Factory method 1: Transforms relational Staff entity to client-safe DTO (omitting password)
    public static StaffResponse from(Staff staff) {
        StaffResponse dto = new StaffResponse();
        dto.setId(staff.getId());
        dto.setUsername(staff.getUsername());
        dto.setFullName(staff.getFullName());
        dto.setEmail(staff.getEmail());
        dto.setEmployeeId(staff.getEmployeeId());
        dto.setRole(staff.getRole());
        dto.setActive(staff.isActive());
        return dto;
    }

    // Factory method 2: Instantiates DTO from MongoDB mirror document
    public static StaffResponse fromMirror(StaffMirror mirror) {
        StaffResponse dto = new StaffResponse();
        dto.setUsername(mirror.getUsername());
        dto.setEmployeeId(mirror.getEmployeeId());
        ...
        return dto;
    }
}
```

#### 2. Model Mappers (`PaymentMapper.java`)
- **File:** `backend/src/main/java/com/sarasavipages/members/m2_anaf_payment/mapper/PaymentMapper.java`
- **Explanation:** Functions as a dedicated factory for mapping entity domain models into responses.

---

## 5. Structural: Decorator Pattern (Lecture Part II – Slide 37)

### 📖 Lecture Theory
- **Definition:** Attaches additional responsibilities and behavior to an object dynamically at runtime without modifying the underlying class structure.
- **Lecture Example:** `SimpleCoffee` dynamically wrapped with `MilkDecorator`, `SugarDecorator`.

### 💻 Sarasavi Pages Implementation

#### 1. Spring Security Filter Chain (`JwtAuthFilter.java`)
- **Files:**  
  - `backend/src/main/java/com/sarasavipages/config/JwtAuthFilter.java`  
  - `backend/src/main/java/com/sarasavipages/config/SecurityConfig.java`
- **Explanation:** In standard Java/Spring Web architecture, the `FilterChain` implements the Decorator / Intercepting Filter pattern. Incoming HTTP requests and responses are wrapped dynamically with security attributes (extracting Bearer token, verifying signature, and decorating the request with authentication context before delegating to controllers).

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) {
        // Decorates request with authenticated principal & roles
        SecurityContextHolder.getContext().setAuthentication(authToken);
        // Proceeds along the wrapped decorator chain
        filterChain.doFilter(request, response);
    }
}
```

---

## 6. Bonus Patterns Implemented in Sarasavi Pages

### A. Builder Pattern (Creational – GoF)
- **Usage:** Used across all JPA entities and MongoDB mirrors using Lombok `@Builder`.
- **Why:** Enables readable, fluent object creation without unwieldy constructors containing 10+ parameters.
- **Code:**
```java
Staff staff = Staff.builder()
        .username(username)
        .password(passwordEncoder.encode(rawPassword))
        .fullName(request.getFullName().trim())
        .email(request.getEmail().trim())
        .employeeId(empId)
        .role(request.getRole())
        .active(true)
        .build();
```

### B. State Pattern (Behavioral – Finite State Machine)
- **File:** `backend/src/main/java/com/sarasavipages/members/m2_anaf_payment/service/impl/PaymentServiceImpl.java`
- **Code:**
```java
private static final Map<PaymentStatus, Set<PaymentStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(PaymentStatus.class);
static {
    ALLOWED_TRANSITIONS.put(PaymentStatus.PENDING, EnumSet.of(PaymentStatus.PAID, PaymentStatus.FAILED, PaymentStatus.VOIDED));
    ALLOWED_TRANSITIONS.put(PaymentStatus.PAID, EnumSet.of(PaymentStatus.REFUNDED));
    ALLOWED_TRANSITIONS.put(PaymentStatus.FAILED, EnumSet.of(PaymentStatus.PENDING, PaymentStatus.VOIDED));
    ALLOWED_TRANSITIONS.put(PaymentStatus.REFUNDED, EnumSet.noneOf(PaymentStatus.class));
    ALLOWED_TRANSITIONS.put(PaymentStatus.VOIDED, EnumSet.noneOf(PaymentStatus.class));
}
```
- **Why:** Enforces transactional integrity so a `REFUNDED` payment can never be re-paid or reversed illegally.

---

## 🎯 Viva Q&A Cheat Sheet (වීවා එකේදී අහන ප්‍රශ්න සහ පිළිතුරු)

### Q1: "What design patterns have you used in your project?"
> **Sinhala Answer:**  
> "සර්/මිස්, අපි SE2030 lectures වල උගන්වපු ප්‍රධාන Design Patterns කීපයක්ම අපේ bookstore system එකේ implement කරලා තියෙනවා:  
> 1. **Singleton Pattern**: Spring Boot IoC Container එකෙන් Services, Repositories, සහ අපේ `JwtUtil` වගේ utility classes singleton විදිහට manage වෙනවා.  
> 2. **Observer Pattern**: අපේ `AuditLogService` එක හරහා staff activities සහ security changes observe කරලා audit_log table එකට record වෙනවා. ඒ වගේම secondary MongoDB sync එකත් observer/scheduler concept එකෙන් වෙන්නේ.  
> 3. **Strategy Pattern**: Lecture Part II එකේ තිබ්බ payment example එකම අපේ Module 2 (Payment Management) එකේ තියෙනවා. Card, Bank Slip, Cash on Delivery වගේ multiple payment strategies execute වෙනවා.  
> 4. **Factory Pattern**: අපේ DTO mappings වල static factory methods (`StaffResponse.from`) සහ Entity Mappers පාවිච්චි වෙනවා.  
> 5. **Builder Pattern**: Lombok `@Builder` පාවිච්චි කරලා readable object creation කරලා තියෙනවා."

---

### Q2: "Can you show where the Strategy Pattern is used in code?"
> **Action:** Open [`PaymentServiceImpl.java`](file:///e:/Thevindu/Edits/Personal/SLIIT/2nd%20Year/1st%20Sem/SE/Project/Web-Based-Bookstore/sarasavi-pages-bookstore/backend/src/main/java/com/sarasavipages/members/m2_anaf_payment/service/impl/PaymentServiceImpl.java) and [`PaymentMethod.java`](file:///e:/Thevindu/Edits/Personal/SLIIT/2nd%20Year/1st%20Sem/SE/Project/Web-Based-Bookstore/sarasavi-pages-bookstore/backend/src/main/java/com/sarasavipages/members/m2_anaf_payment/entity/PaymentMethod.java).  
> **Explanation:**  
> "Here in Module M2 (Payment Management), we have multiple payment methods like `CARD`, `BANK_TRANSFER`, and `CASH_ON_DELIVERY`. Depending on the runtime selection by the customer, the system executes different approval and processing strategies. Similarly, in Module M6, the discount calculation strategy dynamically applies percentage discounts or capped maximum limits."

---

### Q3: "How does the Observer Pattern work in your Audit Logging?"
> **Action:** Open [`StaffService.java`](file:///e:/Thevindu/Edits/Personal/SLIIT/2nd%20Year/1st%20Sem/SE/Project/Web-Based-Bookstore/sarasavi-pages-bookstore/backend/src/main/java/com/sarasavipages/members/m1_gunathilaka_adminstaff/service/StaffService.java) and [`AuditLogService.java`](file:///e:/Thevindu/Edits/Personal/SLIIT/2nd%20Year/1st%20Sem/SE/Project/Web-Based-Bookstore/sarasavi-pages-bookstore/backend/src/main/java/com/sarasavipages/members/m1_gunathilaka_adminstaff/service/AuditLogService.java).  
> **Explanation:**  
> "In Module M1, when any core staff action happens (like creating an account or logging in), the subject emits an audit event to `AuditLogService`. The observer handles formatting the event and persisting it into `audit_log` with timestamp, action type, and performing user, decoupling logging from business operations."

---

### Q4: "What is the benefit of the Factory Method in your DTOs?"
> **Action:** Open [`StaffResponse.java`](file:///e:/Thevindu/Edits/Personal/SLIIT/2nd%20Year/1st%20Sem/SE/Project/Web-Based-Bookstore/sarasavi-pages-bookstore/backend/src/main/java/com/sarasavipages/members/m1_gunathilaka_adminstaff/dto/StaffResponse.java).  
> **Explanation:**  
> "Instead of scattering `new StaffResponse(...)` and manual field copies all over the controllers, we provide static factory methods `from(Staff staff)` and `fromMirror(StaffMirror mirror)`. This encapsulates how the DTO is built, ensures sensitive fields like BCrypt passwords are never exposed to the frontend, and allows polymorphically constructing DTOs from both MSSQL entities and MongoDB documents."
