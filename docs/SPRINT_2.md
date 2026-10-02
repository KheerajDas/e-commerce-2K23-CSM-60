# SPRINT 2 — E-Commerce Platform
## Product Catalog Expansion, Cart/Order Implementation & Backend Foundation

**Project:** E-Commerce Platform  
**Sprint:** 2  
**Sprint Duration:** 2 Weeks  
**Database:** MySQL  
**Backend:** Node.js + Express.js  
**Frontend:** HTML5, CSS3, JavaScript  
**Development Approach:** Scrum / Agile

---

## 1. Sprint Overview

Sprint 2 builds on the MVP requirements established in Sprint 1.

The main purpose of this sprint is to move from the basic MVP structure toward a more complete e-commerce foundation. This includes expanding the product catalog, introducing product variants and SKUs, preparing image/asset handling, implementing cart and order workflows, and defining the backend/API structure.

The sprint focuses on designing and implementing the core foundation required for a functional e-commerce system. Payment gateway integration, advanced administration, production deployment, and other non-MVP features remain outside this sprint unless specifically completed and tested.

---

## 2. Sprint Goal

> **Build the core catalog, cart, and order-management foundation of the e-commerce platform using a consistent MySQL database and Node.js/Express backend structure.**

By the end of the sprint, the project should have a clear and testable foundation for:

- Product catalog management
- Product variants and SKUs
- Product images/assets
- Shopping cart management
- Order creation and order items
- Basic API structure
- Database relationships
- Validation and error handling

---

## 3. Sprint Objectives

1. Expand the product model to support different product variants.
2. Introduce SKU-level product identification.
3. Support multiple product assets/images.
4. Implement cart and cart-item relationships.
5. Implement order and order-item relationships.
6. Create the basic Node.js/Express API structure.
7. Connect the backend structure with MySQL.
8. Add basic validation and error handling.
9. Prepare the system for later checkout and payment integration.
10. Maintain consistency with the Sprint 1 requirements.

---

## 4. Sprint Backlog

| ID | User Story / Task | Priority | Story Points |
|---|---|---|---:|
| US-2.1 | As an admin, I want products to support variants so that different sizes/colors can be managed. | High | 5 |
| US-2.2 | As an admin, I want each sellable product variation to have an SKU so that inventory items can be uniquely identified. | High | 3 |
| US-2.3 | As an admin, I want to associate multiple images/assets with a product so that customers can view it properly. | Medium | 3 |
| US-2.4 | As a customer, I want to add a selected product/SKU to my cart so that I can purchase it later. | High | 5 |
| US-2.5 | As a customer, I want to update or remove cart items so that I can control my order before checkout. | High | 3 |
| US-2.6 | As a customer, I want to create an order from my cart so that my purchase can be recorded. | High | 5 |
| US-2.7 | As an admin, I want order items to retain product/SKU and quantity information so that orders can be processed correctly. | High | 3 |
| US-2.8 | As a developer, I want REST API endpoints so that the frontend can communicate with the backend. | High | 5 |
| US-2.9 | As a developer, I want validation and error handling so that invalid requests are handled safely. | Medium | 3 |

**Total Story Points: 35**

---

## 5. Product Catalog Expansion

Sprint 1 defined the basic product concept. Sprint 2 expands it to support real-world product variations.

### 5.1 Products

A product represents the main catalog item.

Example:

> Office Chair

A product can have one or more variants/SKUs.

### 5.2 Variants

A variant represents a variation of a product, such as:

- Color
- Size
- Material
- Configuration

Example:

> Office Chair — Black — Large

### 5.3 SKUs

An SKU represents a specific sellable item.

Example:

> CHAIR-BLK-L

Each SKU should be unique.

### 5.4 Assets

Assets represent product-related media such as:

- Product images
- Additional gallery images
- Other supported media

An asset can be associated with a product.

---

## 6. Database Design

The database will remain **MySQL**, consistent with Sprint 1.

### Main Tables

- `USERS`
- `PRODUCTS`
- `VARIANTS`
- `SKUS`
- `ASSETS`
- `CARTS`
- `CART_ITEMS`
- `ORDERS`
- `ORDER_ITEMS`

### 6.1 USERS

| Field | Type | Description |
|---|---|---|
| user_id | INT PK | Unique user ID |
| name | VARCHAR(100) | User name |
| email | VARCHAR(150) UNIQUE | User email |
| password_hash | VARCHAR(255) | Encrypted/hashed password |
| role | ENUM | customer/admin |
| created_at | DATETIME | Account creation time |

### 6.2 PRODUCTS

| Field | Type | Description |
|---|---|---|
| product_id | INT PK | Unique product ID |
| name | VARCHAR(150) | Product name |
| description | TEXT | Product description |
| category | VARCHAR(100) | Product category |
| base_price | DECIMAL(10,2) | Base product price |
| status | ENUM | active/inactive |
| created_at | DATETIME | Creation date |

### 6.3 VARIANTS

| Field | Type | Description |
|---|---|---|
| variant_id | INT PK | Unique variant ID |
| product_id | INT FK | Related product |
| name | VARCHAR(100) | Variant name |
| attributes | JSON | Variant attributes |
| created_at | DATETIME | Creation date |

> MySQL `JSON` is used here. PostgreSQL-specific `JSONB` is not used.

### 6.4 SKUS

| Field | Type | Description |
|---|---|---|
| sku_id | INT PK | Unique SKU ID |
| variant_id | INT FK | Related variant |
| sku_code | VARCHAR(100) UNIQUE | Unique SKU code |
| price | DECIMAL(10,2) | Selling price |
| stock_quantity | INT | Available quantity |
| status | ENUM | active/inactive |

### 6.5 ASSETS

| Field | Type | Description |
|---|---|---|
| asset_id | INT PK | Unique asset ID |
| product_id | INT FK | Related product |
| file_url | VARCHAR(500) | Image/file location |
| asset_type | VARCHAR(50) | Type of asset |
| sort_order | INT | Display order |

### 6.6 CARTS

| Field | Type | Description |
|---|---|---|
| cart_id | INT PK | Unique cart ID |
| user_id | INT FK | Cart owner |
| created_at | DATETIME | Creation date |
| updated_at | DATETIME | Last update |

### 6.7 CART_ITEMS

| Field | Type | Description |
|---|---|---|
| cart_item_id | INT PK | Unique item ID |
| cart_id | INT FK | Related cart |
| sku_id | INT FK | Selected SKU |
| quantity | INT | Quantity selected |

### 6.8 ORDERS

| Field | Type | Description |
|---|---|---|
| order_id | INT PK | Unique order ID |
| user_id | INT FK | Customer |
| total_amount | DECIMAL(10,2) | Order total |
| status | ENUM | pending/confirmed/cancelled/completed |
| created_at | DATETIME | Order date |

### 6.9 ORDER_ITEMS

| Field | Type | Description |
|---|---|---|
| order_item_id | INT PK | Unique item ID |
| order_id | INT FK | Related order |
| sku_id | INT FK | Purchased SKU |
| quantity | INT | Purchased quantity |
| unit_price | DECIMAL(10,2) | Price at purchase time |

---

## 7. Entity Relationships

The main relationships are:

```text
USERS
  │
  ├── 1 : M ── CARTS
  │               │
  │               └── 1 : M ── CART_ITEMS ── M : 1 ── SKUS
  │
  └── 1 : M ── ORDERS
                    │
                    └── 1 : M ── ORDER_ITEMS ── M : 1 ── SKUS

PRODUCTS
  │
  ├── 1 : M ── VARIANTS
  │               │
  │               └── 1 : M ── SKUS
  │
  └── 1 : M ── ASSETS
```

### Relationship Summary

- One user can have multiple carts over time.
- One cart contains multiple cart items.
- One SKU can appear in many cart items.
- One user can place multiple orders.
- One order contains multiple order items.
- One product can have multiple variants.
- One variant can have multiple SKUs.
- One product can have multiple assets/images.

---

## 8. Backend/API Structure

The backend will use **Node.js with Express.js**.

Suggested structure:

```text
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── app.js
├── package.json
└── .env
```

The backend will provide REST-style endpoints for the main application functions.

### Suggested API Groups

```text
/api/products
/api/variants
/api/skus
/api/assets
/api/cart
/api/orders
/api/users
```

The exact endpoints can be expanded during implementation.

---

## 9. Validation and Error Handling

Basic validation should be applied to:

- Required fields
- Email format
- Positive quantities
- Valid product/SKU IDs
- Stock availability
- Unique SKU codes
- Valid order/cart ownership

Example error categories:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

## 10. Security Considerations

The following practices are planned:

- Passwords must be stored as hashes rather than plain text.
- Database credentials must be stored in environment variables.
- User input must be validated.
- Admin-only operations must require authorization.
- SQL queries should use parameterized/prepared statements.
- Sensitive information should not be returned in API responses.

---

## 11. Frontend Integration

The frontend will communicate with the backend using HTTP requests.

Main flow:

```text
User
  ↓
Frontend
  ↓
REST API
  ↓
Express.js
  ↓
MySQL
```

For example:

```text
Product Page
     ↓
Select Variant/SKU
     ↓
Add to Cart
     ↓
POST /api/cart/items
     ↓
Database
```

---

## 12. Testing Plan

Testing in Sprint 2 will focus on the features actually implemented during the sprint.

### Functional Tests

- Product/variant creation
- SKU creation
- SKU uniqueness
- Product asset association
- Add item to cart
- Update cart quantity
- Remove cart item
- Create order
- Validate stock
- Retrieve order details

### API Tests

Each implemented endpoint should be tested for:

- Valid request
- Missing required fields
- Invalid IDs
- Unauthorized access
- Successful response
- Appropriate error response

**Important:** Test counts and pass/fail numbers should only be documented after the tests have actually been executed.

---

## 13. Definition of Done

A Sprint 2 task is considered complete when:

- [ ] Required code/design is implemented.
- [ ] MySQL structure is consistent with the documented schema.
- [ ] API endpoint works for the implemented feature.
- [ ] Input validation is applied.
- [ ] Errors are handled appropriately.
- [ ] The feature is tested.
- [ ] No known critical error remains.
- [ ] Documentation is updated.
- [ ] Changes are committed to the repository.

---

## 14. Sprint Review

The Sprint Review should demonstrate the features that were actually completed.

Expected demonstration:

1. Product catalog structure
2. Product variant selection
3. SKU identification
4. Product assets/images
5. Cart operations
6. Order creation
7. Backend API communication
8. MySQL data storage

Only completed and tested features should be presented as implemented.

---

## 15. Sprint Retrospective

### What went well

- The project requirements from Sprint 1 were extended into a more detailed catalog structure.
- The database remains based on MySQL.
- Product, cart, and order responsibilities are separated.
- The API structure provides a foundation for frontend/backend communication.

### What could be improved

- Database relationships should be reviewed before implementation.
- API contracts should be documented before frontend integration.
- More automated tests can be introduced in future sprints.
- Authentication and authorization can be expanded in later development.

### Action Items

| Action | Responsible Role | Target |
|---|---|---|
| Review database relationships | Backend Developer | Next Sprint |
| Complete API documentation | Backend Developer | Next Sprint |
| Improve automated testing | Development Team | Next Sprint |
| Complete frontend/API integration | Frontend + Backend | Next Sprint |

---

## 16. Sprint 2 Deliverables

The expected Sprint 2 deliverables are:

1. Updated database design
2. Product/variant/SKU model
3. Asset/image model
4. Cart and cart-item model
5. Order and order-item model
6. Backend/API structure
7. Validation and error-handling structure
8. Testing documentation for actually completed features
9. Updated project documentation

---

## 17. Future Scope

The following features can be handled in later sprints:

- Payment gateway integration
- Advanced authentication
- Email notifications
- Order tracking
- Admin dashboard
- Product reviews and ratings
- Advanced search and filtering
- Inventory management
- Production deployment
- Performance optimization

---

## 18. Sprint 2 Summary

Sprint 2 expands the e-commerce MVP into a more structured system by introducing product variants, SKUs, assets, cart items, and order items.

The sprint keeps the technology stack consistent:

**Frontend:** HTML5, CSS3, JavaScript  
**Backend:** Node.js + Express.js  
**Database:** MySQL

The resulting foundation prepares the project for further development while avoiding claims about features or test results that have not actually been implemented or verified.
