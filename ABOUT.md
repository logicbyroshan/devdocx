# 📖 About DevDocs

**DevDocs** is an open-source technical publishing platform and documentation engine designed specifically for software engineers, systems architects, and engineering teams.

---

## 🎯 Mission & Philosophy

Modern engineering teams require a publication medium that treats technical documentation and technical writing with first-class tooling. DevDocs was engineered around three core tenets:

1. **Architecture & Blueprints First**: Complex systems are best explained through visual blueprints, interaction sequences, and entity relationship diagrams alongside clear technical narratives.
2. **Authoritative Backend Security**: The presentation layer (React) is decoupled from the authoritative backend (Django). Business logic, rate limits, and access controls remain strictly enforced by Django.
3. **Restrained, High-Density Aesthetics**: Designed with inspiration from world-class developer docs (Stripe, GitHub, Linear) with dark/light themes, accessible monospace typography (`JetBrains Mono`, `Sora`, `DM Serif Display`), and zero layout shift.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Responsibility |
| :--- | :--- | :--- |
| **Backend Core** | Django 5.2 (Python 3.11+) | Authoritative business logic, ORM data models, security middleware |
| **REST API** | Django REST Framework (DRF) | RESTful API contracts, validation serializers, permission gating |
| **Frontend SPA** | React 18.3, Vite | Client-side routing, state management, component tree |
| **Styling & Design** | Tailwind CSS, PostCSS | Custom surface tokens, typography, dark/light theme classes |
| **Diagram Engine** | Mermaid.js | Dynamic client-side rendering of flowcharts & sequence diagrams |
| **Code Highlighting** | PrismJS | Syntax highlighting with one-click clipboard copying |
| **Persistence** | SQLite / PostgreSQL | Relational storage with composite indexing |
| **Session Security** | Django SessionAuth, CSRF | HttpOnly/SameSite Lax cookie session authentication |

---

## 👥 Authors & Maintainers

DevDocs is built and maintained by the DevDocs open-source engineering community.
