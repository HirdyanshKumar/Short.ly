# Short.ly Backend Documentation

This directory contains the server-side logic for **Short.ly**, a modern URL shortening and analytics platform. Built with **Node.js** and **Express**, ensuring performance, scalability, and clean architecture.

---

## 📦 Tech Stack & Packages

We utilize a robust set of libraries to handle everything from database connections to security and analytics.

### Core Dependencies
- **[express](https://expressjs.com/)**: Fast, unopinionated, minimalist web framework for Node.js. Used for routing and handling HTTP requests.
- **[mongoose](https://mongoosejs.com/)**: Elegant MongoDB object modeling for Node.js. Used to define schemas for Users, URLs, and Analytics data.
- **[dotenv](https://www.npmjs.com/package/dotenv)**: Loads environment variables from a `.env` file into `process.env`, keeping secrets secure.
- **[cors](https://www.npmjs.com/package/cors)**: Middleware to enable Cross-Origin Resource Sharing, allowing the frontend to communicate with the API.
- **[morgan](https://www.npmjs.com/package/morgan)**: HTTP request logger middleware for logging API requests in the terminal (useful for debugging).

### Authentication & Security
- **[jsonwebtoken (JWT)](https://jwt.io/)**: Used to generate and verify access tokens. Securely identifies logged-in users via `Bearer` tokens.
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)**: A library to hash passwords before saving them to the database and verify them during login.
- **[joi](https://joi.dev/)**: Powerful schema description language and data validator. Used to validate incoming request bodies (e.g., ensuring emails are valid formats).

### Functional Utilities
- **[nanoid](https://github.com/ai/nanoid)**: A tiny, secure, URL-friendly unique string ID generator. Used to create the short codes (e.g., `abc12345`).
- **[qrcode](https://www.npmjs.com/package/qrcode)**: Used to generate QR code data URLs for shortened links.
- **[ua-parser-js](https://www.npmjs.com/package/ua-parser-js)**: Parses the `User-Agent` string to extract browser, engine, OS, CPU, and device type for analytics.
- **[geoip-lite](https://www.npmjs.com/package/geoip-lite)**: Looks up the geolocation (Country, City) of an IP address for geographic analytics.

---

## 🔄 Request Flow

How a typical request is processed in the Short.ly backend:

1.  **Entry Point**: The request hits `src/app.js`.
2.  **Global Middleware**:
    *   **CORS**: Ensures the browser allows the request.
    *   **JSON Parsing**: `express.json()` parses the incoming body.
    *   **Logging**: `morgan` logs the request details.
3.  **Routing**:
    *   If the request matches `/api`, it is routed to `src/routes/route.js`.
    *   If it matches a short code (e.g., `GET /abc12345`), it is handled by the redirect logic directly in `app.js`.
4.  **Route-Specific Middleware**:
    *   **Authentication**: Protected routes verify the JWT using `auth.middleware.js`. If valid, `req.user` is populated with user details.
5.  **Controller**: The request reaches the specific controller function (e.g., `createShortUrl`), which performs the business logic and database operations.

---

## 📨 Response Protocol

We follow a strict, standardized JSON response structure for consistency across all endpoints.

All responses are sent using helper functions located in `src/utils/response.js`.

### 1. Success Response
**Status Code**: `200 OK` 

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // ... requested data object (e.g., user info, url details)
  }
}
```

*   `success`: Always `true` for successful operations.
*   `message`: A human-readable success message.
*   `data`: The payload containing the actual resource(s).

### 2. Error Response
**Status Codes**: `400` (Bad Request), `401` (Unauthorized), `404` (Not Found), `500` (Server Error), etc.

```json
{
  "success": false,
  "message": "Detailed error description"
}
```

*   `success`: Always `false`.
*   `message`: Description of what went wrong (e.g., "Invalid password", "URL not found").

---

## 🛠 Project Structure

```bash
src/
├── app.js               # Express application setup
├── index.js             # Server entry point
├── config/              # DB connection config
├── controllers/         # Business logic for each route
├── middlewares/         # Auth and other interceptors
├── models/              # Mongoose schemas (User, Url, Analytics)
├── routes/              # API route definitions
├── services/            # Shared logic (e.g., Analytics logging)
└── utils/               # Helpers (Response, URL expiry check)
```

---

## 📡 API Endpoint Reference

Detailed documentation of inputs and outputs for every route.

### 🔐 Authentication

#### 1. Signup
*   **Endpoint**: `POST /api/auth/signup`
*   **Description**: Registers a new user.
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "securePassword123",
      "username": "OptionalName"
    }
    ```
*   **Success Response** (200):
    ```json
    {
      "success": true,
      "message": "Signup successful",
      "data": {
        "token": "eyJhbGciOiJIUzI1Ni...",
        "user": { "id": "...", "email": "..." }
      }
    }
    ```

#### 2. Login
*   **Endpoint**: `POST /api/auth/login`
*   **Description**: Authenticates a user and returns a JWT.
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "securePassword123"
    }
    ```
*   **Success Response** (200): Returns same structure as Signup.

---

### 🔗 URL Management

#### 1. Create Short URL
*   **Endpoint**: `POST /api/url/create`
*   **Headers**: `Authorization: Bearer <token>`
*   **Request Body**:
    ```json
    {
      "originalUrl": "https://very-long-url.com/xyz",
      "customAlias": "my-link", 
      "isPrivate": false,
      "password": "optionalUnlockPassword"
    }
    ```
*   **Success Response** (200):
    ```json
    {
      "success": true,
      "data": {
        "shortUrl": "http://localhost:3000/my-link",
        "url": { ...urlObject }
      }
    }
    ```

#### 2. Get My URLs
*   **Endpoint**: `GET /api/url/mine`
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response** (200): Returns an array of URL objects owned by the user.

#### 3. Toggle URL Status
*   **Endpoint**: `PATCH /api/url/:id/toggle`
*   **Headers**: `Authorization: Bearer <token>`
*   **Description**: Activates or deactivates a URL.
*   **Response**: Returns the updated URL object with flipped `isActive` status.

#### 4. Update Privacy
*   **Endpoint**: `PATCH /api/url/:id/privacy`
*   **Headers**: `Authorization: Bearer <token>`
*   **Request Body**: `{ "isPrivate": true/false }`
*   **Response**: Returns the updated URL object.

#### 5. Update Alias
*   **Endpoint**: `PATCH /api/url/:id/alias`
*   **Headers**: `Authorization: Bearer <token>`
*   **Request Body**: `{ "customAlias": "new-alias" }`
*   **Response**: Returns the updated URL object.

#### 6. Delete URL
*   **Endpoint**: `DELETE /api/url/:id`
*   **Headers**: `Authorization: Bearer <token>`
*   **Response**: `{ "success": true, "message": "Deleted" }`

---

### 📊 Analytics

#### 1. Get Summary
*   **Endpoint**: `GET /api/analytics/:id/summary`
*   **Headers**: `Authorization: Bearer <token>`
*   **Response**:
    ```json
    {
      "success": true,
      "data": {
        "totalClicks": 120,
        "uniqueUsers": 85
      }
    }
    ```

#### 2. Get Daily Chart
*   **Endpoint**: `GET /api/analytics/:id/chart`
*   **Headers**: `Authorization: Bearer <token>`
*   **Response**:
    ```json
    {
      "success": true,
      "data": [
        { "date": "2023-10-01", "count": 12 },
        { "date": "2023-10-02", "count": 15 }
      ]
    }
    ```

#### 3. Get Breakdown
*   **Endpoint**: `GET /api/analytics/:id/breakdown`
*   **Headers**: `Authorization: Bearer <token>`
*   **Response**: Returns distribution data for Devices, Browsers, and Countries.
    ```json
    {
      "success": true,
      "data": {
        "byDevice": [{ "name": "mobile", "value": 40 }, ...],
        "byBrowser": [{ "name": "Chrome", "value": 60 }, ...],
        "byCountry": [{ "name": "US", "value": 20 }, ...]
      }
    }
    ```

---

### 🧩 Utilities

#### 1. Generate QR Code
*   **Endpoint**: `GET /api/qr/:id`
*   **Description**: Generates a Data URL based QR code for the short link.
*   **Response**:
    ```json
    {
      "success": true,
      "data": {
        "qr": "data:image/png;base64,..."
      }
    }
    ```

#### 2. Unlock Protected URL
*   **Endpoint**: `POST /api/unlock/:shortId`
*   **Description**: Verifies password for a protected link.
*   **Request Body**: `{ "password": "users-input-password" }`
*   **Response**:
    ```json
    {
      "success": true,
      "message": "Unlocked",
      "data": { "originalUrl": "https://..." }
    }
    ```
