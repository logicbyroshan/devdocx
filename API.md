# 📡 DevDocs REST API Specification

This document details all REST API endpoints provided by DevDocs.

All API responses follow a consistent JSON envelope schema:

```json
{
  "success": true,
  "message": "Optional human-readable status message",
  "data": {}
}
```

---

## 1. Authentication Endpoints (`/api/auth/`)

### 1.1 `GET /api/auth/csrf/`
Seeds or refreshes the CSRF token cookie for the Single Page Application session.

- **Permissions**: `AllowAny`
- **Response**:
```json
{
  "csrfToken": "aBcD...1234"
}
```

### 1.2 `POST /api/auth/signup/`
Registers a new user account with `is_active=False` and triggers a 6-digit OTP verification email.

- **Permissions**: `AllowAny`
- **Request Body**:
```json
{
  "username": "dev_alex",
  "email": "alex@company.com",
  "first_name": "Alex",
  "last_name": "Dev",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}
```

### 1.3 `POST /api/auth/verify-otp/`
Validates the submitted 6-digit OTP against the session code, activates the account, and creates an authenticated session.

- **Permissions**: `AllowAny`
- **Request Body**:
```json
{
  "otp": "123456"
}
```

### 1.4 `POST /api/auth/resend-otp/`
Dispatches a new OTP code if the 60-second cooldown has elapsed.

- **Permissions**: `AllowAny`

### 1.5 `POST /api/auth/login/`
Authenticates user credentials and sets session cookies.

- **Permissions**: `AllowAny`
- **Request Body**:
```json
{
  "username": "dev_alex",
  "password": "SecurePassword123!"
}
```

### 1.6 `POST /api/auth/logout/`
Terminates the user's active session.

- **Permissions**: `IsAuthenticated`

### 1.7 `GET /api/auth/me/` & `PATCH /api/auth/me/`
Retrieves or updates the current user's profile information.

- **Permissions**: `IsAuthenticated`

---

## 2. Public Content & Docs Endpoints (`/api/blog/`)

### 2.1 `GET /api/blog/home/`
Returns the aggregate dataset for the public homepage.

- **Permissions**: `AllowAny`
- **Response Fields**:
  - `hero_posts`: Array of highlighted articles.
  - `trending_posts`: Top engaged articles.
  - `latest_posts`: Chronologically recent publications.
  - `suggested_posts`: Recommended reading.

### 2.2 `GET /api/blog/posts/`
Returns a paginated, filterable archive of published articles.

- **Query Parameters**:
  - `category`: Category slug/name filter.
  - `search`: Full-text search term.
  - `page`: Page number (default: 1).

### 2.3 `GET /api/blog/posts/<slug>/`
Returns full article content, tags, author details, threaded comments, and related articles.

### 2.4 `POST /api/blog/posts/<slug>/appreciate/`
Toggles appreciation (like) state for the authenticated user.

- **Permissions**: `IsAuthenticated`

### 2.5 `POST /api/blog/posts/<slug>/comments/`
Adds a new comment to the article discussion.

- **Permissions**: `IsAuthenticated`
- **Request Body**:
```json
{
  "body": "Insightful breakdown of decoupled architectures!"
}
```

### 2.6 `GET /api/blog/docs/` & `GET /api/blog/docs/<slug>/`
Returns the developer documentation catalog and detailed architectural blueprints with Mermaid definitions.

---

## 3. Administrative Endpoints (`/api/admin/`)

All `/api/admin/` endpoints require staff privileges (`is_staff = True`).

### 3.1 `GET /api/admin/dashboard/`
Returns operational metrics (`published_count`, `scheduled_count`, `draft_count`, `planned_count`), performance chart metrics, calendar date matrix, and planned ideas.

### 3.2 `GET /api/admin/posts/` & `POST /api/admin/posts/`
List all posts with status filters or create a new post with multipart/form-data thumbnail upload.

### 3.3 `GET /api/admin/posts/<id>/`, `PATCH`, `DELETE`
Manage individual posts.

### 3.4 `POST /api/admin/posts/<id>/toggle-active/`
Toggles active visibility without changing post status.

### 3.5 `POST /api/admin/posts/<id>/toggle-recommend/`
Toggles homepage recommended spotlight flag.

### 3.6 `GET /api/admin/activity/`
Returns overall platform engagement statistics, registered users list, subscribers list, and comments moderation thread.

### 3.7 `POST /api/admin/comments/<id>/toggle-pin/` & `DELETE`
Pin or delete comments.
