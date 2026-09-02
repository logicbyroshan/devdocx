# ⚙️ DevDocs Installation & Setup Guide

This guide covers local environment setup, configuration options, database initialization, and deployment instructions.

---

## 1. System Prerequisites

Before starting, ensure the following are installed on your workstation:
- **Python**: Version 3.11 or higher
- **Node.js**: Version 18.0 or higher with **npm**
- **Git**: Version 2.30 or higher

---

## 2. Environment Configuration (`.env`)

Create a `.env` file in the project root directory with the following variables:

```env
# Core Django Settings
SECRET_KEY='your-super-secret-key-change-in-production'
DEBUG=True
ALLOWED_HOSTS='localhost,127.0.0.1'

# Optional Database URL (defaults to SQLite if omitted)
# DATABASE_URL='postgres://user:password@localhost:5432/devdocs_db'

# Email Dispatch Configuration (defaults to Console backend if omitted)
EMAIL_HOST_USER=''
EMAIL_HOST_PASSWORD=''
EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL='noreply@devdocs.io'
```

---

## 3. Backend Setup

```bash
# 1. Create Python virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Apply database migrations
python manage.py migrate

# 5. Create default administrator superuser
python manage.py createsu

# 6. Run Django development server
python manage.py runserver 127.0.0.1:8000
```

---

## 4. Frontend Setup

In a separate terminal window:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start Vite development server
npm run dev
```

The frontend will be available at `http://127.0.0.1:5173/`. All `/api/` and `/media/` requests are automatically proxied to the Django backend at `http://127.0.0.1:8000/`.

---

## 5. Production Build & Deployment

To build the project for production:

```bash
# Build React bundle
cd frontend
npm run build
cd ..

# Collect static assets
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate
```

On platforms like Render, Heroku, or Fly.io, `build.sh` automatically executes these steps upon push.
