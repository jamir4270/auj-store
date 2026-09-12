# Software Requirements Specification (SRS) — AUJ Store

**Document Version:** 1.0.0  
**Status:** Approved / Baseline Active  
**Target System:** AUJ Store Management & POS System  
**Last Updated:** 2026-09-12  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the **AUJ Store** web application. It provides a complete reference for developers, administrators, and stakeholders regarding system behavior, capabilities, and interface requirements.

### 1.2 Scope
AUJ Store is an integrated retail and print-services management application. It handles:
* **Point of Sale (POS):** Order creation, cart management, instant checkout, and partial payment handling.
* **Printing & Photocopying Services:** Configuration and calculation of print jobs (paper type, paper size, color mode, page counts, copies).
* **Inventory Management:** Product cataloging, stock tracking, cost/price tracking, categorization, and threshold alerts.
* **Order History & Management:** Order tracking, line item inspection, status updating (Complete / Incomplete), and transaction auditing.
* **Business Analytics:** Sales metrics, profit calculations, top-selling product insights, and category breakdowns.
* **User Authentication & Access Control:** Secure cookie-based authentication via Supabase Auth with PostgreSQL Row-Level Security (RLS).

---

## 2. Overall Description

### 2.1 Product Perspective
AUJ Store is built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, and Supabase (PostgreSQL, Auth, SSR).

### 2.2 User Characteristics
* **Store Owner / Admin:** Full access to inventory modifications, cost updates, rate configuration, financial analytics, and order fulfillment.
* **Cashier / Staff:** Ability to create orders, input print jobs, complete sales, record partial payments, and search inventory.

---

## 3. Specific Functional Requirements

### 3.1 Authentication & Session Management
* **FR-AUTH-1:** The system shall authenticate users using email and password via Supabase Auth.
* **FR-AUTH-2:** Protected routes (`/protected/*`) must be inaccessible to unauthenticated sessions and redirect to `/auth/login`.
* **FR-AUTH-3:** Authentication sessions must use HTTP-only cookies managed through `@supabase/ssr`.

### 3.2 Point of Sale (POS) & Order Creation (`/orders`)
* **FR-POS-1:** The user shall be able to browse and search active products by name or category.
* **FR-POS-2:** The user shall be able to add inventory products to the active cart with adjustable quantities.
* **FR-POS-3:** The user shall be able to configure print jobs (service type, paper type, size, color mode, page count, copies) and add them to the order.
* **FR-POS-4:** The system shall compute line item subtotals, order total, and estimated profit.
* **FR-POS-5:** The system shall support order payment statuses: `complete` and `incomplete`.
* **FR-POS-6:** For `incomplete` orders, the system shall record `partial_payment` and calculate outstanding balance.
* **FR-POS-7:** Completing an order shall automatically decrement stock quantities in the `products` table.

### 3.3 Print Job Service Calculator (`/print-job`)
* **FR-PRNT-1:** The system shall store and query print service configurations in the `print_job` table (singular name verified).
* **FR-PRNT-2:** The system shall validate supported print options:
  * **Service Types:** `photocopy`, `print`
  * **Paper Types:** `copier`, `photo`
  * **Paper Sizes:** `short`, `a4`, `long`, `2r`, `3r`, `4r`, `5r`
  * **Color Modes:** `b&w`, `color`
* **FR-PRNT-3:** The system shall compute pricing based on `service_rates` table matrix.

### 3.4 Inventory Management (`/inventory`)
* **FR-INV-1:** The user shall be able to create, view, edit, and delete products.
* **FR-INV-2:** Each product shall track `name`, `quantity`, `price`, `cost`, `category`, and `stock_threshold`.
* **FR-INV-3:** The system shall flag items whose `quantity <= stock_threshold` as `low_stock` or `out_of_stock`.
* **FR-INV-4:** The system shall provide distinct categories via the `unique_categories` view.

### 3.5 Sales History & Order Tracking (`/history`)
* **FR-HIST-1:** The user shall be able to view historical orders with filtering by date, status, and search keywords.
* **FR-HIST-2:** Expanding an order shall display associated `order_items` and `print_job` records.
* **FR-HIST-3:** Deleting an order shall cascade-delete related `order_items` and `print_job` records.

### 3.6 Analytics & Reports (`/analytics` & `/dashboard`)
* **FR-ANLY-1:** The dashboard shall display Key Performance Indicators: Total Revenue, Gross Profit, Total Orders, and Low Stock Alerts.
* **FR-ANLY-2:** The system shall present visual sales charts, category distributions, and top-selling items.

---

## 4. Non-Functional Requirements

### 4.1 Performance & Scalability
* **NFR-PERF-1:** POS search and cart calculations must respond with sub-100ms UI latency.
* **NFR-PERF-2:** Database operations must use indexed foreign keys and connection pooling for concurrent client transactions.

### 4.2 Security & Integrity
* **NFR-SEC-1:** All database tables must have PostgreSQL Row-Level Security enabled.
* **NFR-SEC-2:** Deleting a product that is referenced in historical sales (`order_items`) must be restricted (`ON DELETE RESTRICT`) to preserve historical accounting integrity.
* **NFR-SEC-3:** All environment secrets must remain server-side (`SUPABASE_SERVICE_ROLE_KEY`, DB passwords).

### 4.3 Usability & Design
* **NFR-UI-1:** The interface must be responsive across desktop POS terminals and tablet displays.
* **NFR-UI-2:** Clean dark/light theme support adhering to shadcn/ui and Tailwind CSS design tokens.
