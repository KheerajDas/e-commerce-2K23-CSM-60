# E-Commerce — Sprint 2 Catalog Data Foundation

This repository contains the Sprint 2 implementation using **Node.js, Express.js and MySQL**.

## Scope

Implemented:
- Category tree management with unique slugs and cycle prevention.
- Product creation, listing and editing.
- Product variants and SKU records.
- Unique SKU codes, decimal prices and non-negative stock.
- JWT-authenticated administrator routes.
- Reproducible seed data.
- Automated validation and authorization tests.

Not implemented in Sprint 2 because the manual places them in Sprint 3 or later:
- Dynamic specification management.
- Asset upload/storage.
- Public catalog search.
- Publication workflows beyond the product status field.
- Payment, shipping and complete checkout.

## Requirements

- Node.js 18+
- MySQL 8+

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` and `JWT_SECRET`.
3. Install packages:

```bash
npm install
```

4. Create the database and tables:

```bash
npm run migrate
```

5. Load reproducible sample data:

```bash
npm run seed
```

6. Start the API:

```bash
npm start
```

The API runs at `http://localhost:3000` by default.

## Environment variables

```text
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_sprint2
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=2h
```

Do not commit `.env` or real secrets.

## Seed administrator

The seed script creates:

- Email: `admin@example.com`
- Password: `Admin@12345`
- Role: `admin`

Change this credential before using the project outside a local demonstration environment.

## API routes

### Authentication

`POST /api/v1/auth/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "Admin@12345"
}
```

The response returns a JWT bearer token.

### Administrative routes

All routes below require:

```text
Authorization: Bearer <token>
```

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/v1/admin/categories` | Create category |
| GET | `/api/v1/admin/categories` | List category tree records |
| PATCH | `/api/v1/admin/categories/:id` | Update/deactivate category |
| POST | `/api/v1/admin/products` | Create draft/product record |
| GET | `/api/v1/admin/products` | List administrative products |
| PATCH | `/api/v1/admin/products/:id` | Update product content/status |
| POST | `/api/v1/admin/products/:id/variants` | Add a product variant |
| POST | `/api/v1/admin/products/:id/skus` | Add validated SKU |
| PATCH | `/api/v1/admin/skus/:id` | Update SKU price/stock/status |

Duplicate slugs and SKU codes are rejected by the database and returned as a client error.

## Tests

Run:

```bash
npm test
```

The automated suite covers catalog schema/model constraints, validation rules, negative-stock rejection, protected admin routes and consistent error responses. A dedicated MySQL integration-test database can be added later for full end-to-end database execution.

## Database notes

- Money uses `DECIMAL(12,2)`, not floating-point storage.
- Stock uses an unsigned integer and application validation.
- Category parent relationships use a foreign key with `ON DELETE RESTRICT` and `ON UPDATE CASCADE`.
- Product/category, variant/product and SKU/variant relationships also use `ON DELETE RESTRICT` and `ON UPDATE CASCADE`.
- Category cycle prevention is checked in the administrative update logic.
