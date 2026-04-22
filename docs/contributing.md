# Contributing to Cassatix

Thank you for your interest in improving Cassatix. This guide outlines our project standards and development hygiene.

---

## 🏗 Repository Structure
- `apps/api`: NestJS Backend.
- `apps/web`: React Frontend (Vite).
- `apps/worker`: Background Job Processor.
- `docs/`: All documentation (Architecture, API, Data Model).

---

## 🛠 Development Workflow

### 1. Code Standards
- **TypeScript**: Strictly typed. Avoid `any`.
- **Linting**: Run `npm run lint` before committing.
- **Styling**: Use Tailwind CSS utility classes exclusively.

### 2. Documentation
- All new features **MUST** be accompanied by an update to the relevant markdown file in `docs/`.
- Ensure all relative links between documents are maintained.
- Use Mermaid for diagrams where structure or flow is involved.

### 3. Commit Guidelines
- Use descriptive commit messages.
- Categorize changes (e.g., `feat:`, `fix:`, `docs:`, `chore:`).

---

## 📝 Reporting Issues
Please use the provided GitHub Issue Templates:
- **Bug Report**: Include environment data and logs.
- **Feature Request**: Describe the business problem and architecture impact.

---

## 🔗 Related Documentation
- [Back to README](../README.md)
- [Architecture Overview](./architecture.md)
