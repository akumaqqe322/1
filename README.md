# Cassatix: Legal Document Automation Platform

Cassatix is a production-grade document automation and management platform tailored for high-stakes legal workflows. It addresses the friction of manual document assembly by providing a centralized, version-controlled system for legal templates and high-throughput generation.

---

## 🏛 Project Status: Prototype / MVP
Cassatix is currently in a **functional prototype phase**. While it implements the full core lifecycle from template management to PDF generation, it uses a **mock authentication mechanism** (`x-user-id` header) for rapid prototyping and local RBAC simulation.

---

## 📑 Documentation Index

Follow these guides to explore the system in depth:

### 🚀 Getting Started
- **[Demo & Testing Flow](./docs/demo-flow.md)**: A step-by-step walkthrough for reviewers.
- **[Contributing Guide](./docs/contributing.md)**: Standards for repository hygiene and development.

### 🏗 Technical Deep Dives
- **[Architecture Overview](./docs/architecture.md)**: Services, job orchestration, and infrastructure.
- **[Data Model](./docs/data-model.md)**: Relational entities and domain boundaries.
- **[API Overview](./docs/api-overview.md)**: REST endpoint documentation and security model.

### ⚠️ Reality Check
- **[Known Issues & Limitations](./docs/known-issues.md)**: Honest assessment of the current prototype.

---

## ✨ Main Features

### 📄 Template Lifecycle Management
*   **Segmented Versions**: Manage templates through `DRAFT`, `PUBLISHED`, and `ARCHIVED` statuses.
*   **One-Way Promotion**: Only "PUBLISHED" versions are available for final document production, preventing draft leaking.
*   **Safety Gate**: Immutable versioning prevents retrospective changes from affecting historical records.

### ⚡️ Automated Document Generation
*   **AI Extraction Layer**: Upload raw client notes; Gemini AI extracts structured entities to populate templates.
*   **Project 2.0 Integration**: Simulated real-time sourcing from case management data.
*   **Background Assembly**: Distributed workers process intensive `.docx` assembly and `.pdf` conversions without blocking the UI.

### 🛡 Security & Governance
*   **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin`, `Lawyer`, and `Partner` roles.
*   **Full Audit Trail**: Every generation event and template modification is logged with actor metadata.

---

## 🏗 High-Level Architecture

Cassatix is a distributed full-stack application built for performance and maintainability:
- **Frontend**: React 19 SPA + Vite + Tailwind CSS + shadcn/ui.
- **Backend API**: NestJS (TypeScript) gateway.
- **Background Worker**: A headless Node.js service dedicated to document assembly.
- **Data Persistence**: PostgreSQL (Relational), Redis (Queues), S3 (Artifacts).

---

## 🚀 Quick Setup

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development environment
npm run dev
```

---
*Cassatix – Precision Legality through Automation.*
