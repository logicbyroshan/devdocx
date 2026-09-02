# 🔒 Security Policy & Architecture

## Supported Versions

| Version | Supported |
| :--- | :--- |
| DevDocs 2.x (React + Django REST) | :white_check_mark: |
| DevDocs 1.x (Legacy Templates) | :x: |

---

## 🛡️ Security Architecture & Controls

### 1. Authoritative Backend Security
- All business logic, input validation, and access control policies (`is_staff`, `IsAuthenticated`, `IsAdminUser`) are enforced on the Django REST Framework backend.
- The React frontend acts strictly as a presentation layer and does not perform client-side security decisions.

### 2. Session & CSRF Protection
- Uses Django's robust session-based authentication with `SameSite=Lax` and `HttpOnly` cookies.
- Single-page application requests for state-modifying operations (`POST`, `PATCH`, `DELETE`) require the `X-CSRFToken` header fetched via `/api/auth/csrf/`.

### 3. Authentication & Rate Limiting
- **Two-Factor OTP Verification**: 6-digit email verification code with strict 10-minute validity and 5-attempt rate limit.
- **Resend Cooldown**: 60-second cooldown period prevents email flooding.

### 4. XSS & Injection Prevention
- All user-supplied Markdown content and discussion comments are processed through DOMPurify and sanitized before rendering to eliminate Cross-Site Scripting (XSS).
- Django ORM parameterized queries prevent SQL injection across all database interactions.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability in DevDocs, please email **security@devdocs.io** instead of opening a public GitHub issue. We aim to respond within 48 hours.
