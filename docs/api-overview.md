# API Overview - Cassatix

This document provides a logical overview of the Cassatix REST API. The API is built with NestJS and follows a resource-oriented structure.

---

## 🔐 Authentication & Roles (Mock/Dev)

In the current prototype phase, authentication is handled via a **mock identity header**.
- **Header**: `x-user-id`
- **Mechanism**: The `RolesGuard` resolves the user from the database based on this ID.

### Role Implications
Certain endpoints are restricted based on the user's role:
- **admin**: Access to audit logs, system stats, and template deletion.
- **lawyer**: Access to template creation, versioning, and document generation.
- **partner**: Access to case data and document generation.

---

## 📂 Logical Endpoint Groups

### 🏛 Template Management (`/api/templates`)
Manage the high-level legal instrument definitions.
- `GET /`: List templates with optional filtering.
- `POST /`: Create a new template definition (Admin/Lawyer).
- `GET /:id`: Retrieve specific template metadata.
- `PATCH /:id`: Update template configuration.

### 🔄 Template Versioning (`/api/templates/:id/versions`)
Manages the actual content and lifecycle of document versions.
- `POST /`: Create a new draft version.
- `POST /:versionId/file`: Upload the physical `.docx` template.
- `POST /:versionId/publish`: Promote a version to "Live" status.
- `POST /:versionId/preview`: Trigger an asynchronous preview generation.
- `POST /:versionId/generate`: Trigger an asynchronous final document generation.

### 📁 Legal Matters / Cases (`/api/cases`)
Provides the business context for document generation.
- `GET /`: List active matters from the source system.
- `GET /:id`: Retrieve detailed party and case data.
- `GET /:id/context`: Get normalized data variables for template population.

### 📄 Generated Documents (`/api/documents`)
Access to finished or processing artifacts.
- `GET /`: List all generation history.
- `GET /:id`: Check processing status and metadata.
- `GET /:id/download`: Secure redirect to the binary artifact in S3.

### 🤖 Intelligent Assistance (`/api/ai`)
- `POST /extract`: Send raw text/notes to receive structured JSON for template fields.

---

## 🚨 Response Conventions
- **200 OK**: Successful retrieval/update.
- **201 Created**: Successful resource creation.
- **202 Accepted**: Background job (generation) has been queued.
- **401/403**: Authentication/Authorization failure.
- **404**: Resource not found.

---

## 🔗 Related Documentation
- [Architecture Overview](./architecture.md)
- [Data Model](./data-model.md)
- [Back to README](../README.md)
