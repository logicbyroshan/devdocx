# 🤝 Contributing to DevDocs

Thank you for your interest in contributing to **DevDocs**!

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🛠️ Development Workflow

1. **Fork & Clone**: Fork the repository and clone your fork locally.
2. **Branch**: Create a descriptive feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Backend Setup**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   python manage.py test
   ```
4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. **Linting & Formatting**: Ensure code adheres to standards.
6. **Testing**: Run the automated test suite before opening a pull request:
   ```bash
   python manage.py test
   cd frontend && npm run build
   ```
7. **Submit PR**: Push your branch and open a Pull Request with a clear description of the changes.
