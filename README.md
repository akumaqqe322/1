# Cassatix: Legal Document Automation Platform

Cassatix is a production-grade document automation and management platform tailored for high-stakes legal workflows. It addresses the friction of manual document assembly by providing a centralized, version-controlled system for legal templates and high-throughput generation.

---

## 🏛 Project Status: Prototype / MVP
Cassatix is currently in a **functional prototype phase**. While it implements the full core lifecycle from template management to PDF generation, it uses a **mock authentication mechanism** (`x-user-id` header) for rapid prototyping and local RBAC simulation.

---

## 🛑 The Problem
Modern legal teams struggle with:
- **Template Drifting**: Inconsistent versions of "standard" contracts across different lawyer's local drives.
- **Manual Data Entry Errors**: Copy-pasting client info from case files into Word docs leads to costly typos.
- **Governance Gaps**: Who generated what version of which NDA for which client?

## ✨ Main Features

### 📄 Template Lifecycle Management
*   **Segmented Versions**: Manage templates through `DRAFT`, `PUBLISHED`, and `ARCHIVED` statuses.
*   **One-Way Promotion**: Only "PUBLISHED" versions are available for final document production, preventing draft leaking.
*   **Schema Validation**: Automated checks for `.docx` placeholders (e.g., `{{client_name}}`) ensure compatibility before publication.

### ⚡️ Automated Document Generation
*   **AI Extraction Layer**: Upload raw notes or unstructured client PDFs; our LLM-powered engine (Gemini) extracts structured entity data to populate templates.
*   **Case-Link Sourcing**: One-click generation by pulling real-time data from internal case management systems (simulated Project 2.0 source).
*   **Background Assembly**: Distributed workers process intensive `.docx` assembly and `.pdf` conversions without blocking the UI.

### 🔐 Security & Governance
*   **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin`, `Lawyer`, and `Partner` roles.
*   **Full Audit Trail**: Every generation event and template modification is logged with actor metadata.
*   **Swagger Documentation**: Fully explored and testable API at `/api/docs`.

---

## 🏗 Architecture Summary

Cassatix is a distributed full-stack application built for performance and maintainability:

- **Frontend**: React 19 SPA + Vite + Tailwind CSS 4 + shadcn/ui. Handles reactive state with TanStack Query.
- **Backend API**: NestJS (TypeScript) gateway. Manages business logic, RBAC, and job orchestration.
- **Background Worker**: A headless Node.js service dedicated to document assembly and format conversion.
- **Persistence**: PostgreSQL (via Prisma ORM) for relational state.
- **Message Broker**: Redis (via BullMQ) for asynchronous generation job queuing.
- **Object Storage**: S3-compatible storage (MinIO/AWS S3) for template drafts and final artifacts.
- **Intelligence**: Google Gemini API for structured data extraction.

---

## 🔄 Core User Flow

1.  **Drafting**: A **Lawyer** creates a Template Version and uploads a `.docx` with standard delimiters.
2.  **Publication**: An **Admin** reviews and Publishes the version, locking it for production use.
3.  **Extraction**: A user uploads a raw case note; AI extracts the `party_name` and `effective_date`.
4.  **Generation**: The system queues a "Final" generation job using the extraction context.
5.  **Completion**: The **Worker** generates the file, stores it in S3, and notifies the API.
6.  **Review**: The user downloads the finished, formatted `.pdf` directly from the UI.

---

## 👥 Role Model

| Role | Permissions | Use Case |
| :--- | :--- | :--- |
| **Admin** | Full system access, audit logs, user management. | Managing firm-wide standards. |
| **Lawyer** | Template CRUD, Generation, Previewing. | Drafting and testing new legal instruments. |
| **Partner** | Generation, Document retrieval. | Production of client-ready assets from mature templates. |

---

## 🧪 Demo & Testing Scenario

To explore the system without a full identity provider setup:

1.  **Start the Stack**: Run `npm install`, setup infra, and `npm run dev`.
2.  **Access API Docs**: Open `http://localhost:3001/api/docs`.
3.  **Authorize**: Click "Authorize" and enter `user-admin-1` in the `x-user-id` header field.
4.  **Verify Identity**: Test the `GET /users/me` endpoint to see your simulated role and firm info.
5.  **Follow the Flow**: Try listing templates, then generate a PDF for `case-123`.

---

## ⚠️ Known Limitations & Constraints

-   **Mock Identity**: Authentication is simulated via headers. Production deployment requires migrating `RolesGuard` to an OIDC/JWT provider.
-   **Case Sourcing**: The "Project 2.0" case source is currently a simulated service within the worker.
-   **S3 Requirement**: Generation will fail if an S3-compatible service (like MinIO) is not reachable.
-   **LibreOffice Dependency**: PDF conversion requires `libreoffice` binaries on the Worker environment.

---

## 🚀 Setup & Local Development

Reference the detailed instructions in the [Deployment Guide](./DEMO_GUIDE.md) if you are setting up the infrastructure from scratch.

```bash
# Quick Start
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

---
*Cassatix – Precision Legality through Automation.*
