# System Architecture - Cassatix

Cassatix is a distributed legal automation platform built for scalability and reliability. It decouples user interactions from intensive document processing using a message-oriented architecture.

---

## 🏛 System Modules

The platform is composed of several independent services and data stores:

### 1. API Gateway (`apps/api`)
- **Technology**: NestJS (Node.js).
- **Responsibility**: Business logic, Role-Based Access Control, metadata persistence, and job orchestration.
- **Entry Point**: Serves the REST API to the Web frontend.

### 2. Background Worker (`apps/worker`)
- **Technology**: Node.js + BullMQ.
- **Responsibility**: Intensive CPU tasks including `.docx` assembly with XML injection and PDF conversion.
- **Isolation**: Operates independently of the API to prevent blocking the user interface during heavy generation loads.

### 3. Frontend Web (`apps/web`)
- **Technology**: React 19 + Vite.
- **Responsibility**: Responsive user interface for template management and document requesting.

### 4. Infrastructure Layer
- **PostgreSQL**: Relational storage for template schemas, version history, and audit logs.
- **Redis**: The message broker used by BullMQ to manage the generation queue.
- **S3 Storage**: Canonical home for all binary artifacts (DOCX/PDF).

---

## 🔄 Core Lifecycles

### Template Content Lifecycle
Templates move through a strict set of states to ensure production safety.

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Create Template
    DRAFT --> DRAFT: Update / Upload binary
    DRAFT --> PUBLISHED: Promote to LIVE
    PUBLISHED --> DRAFT: Create new version
    PUBLISHED --> ARCHIVED: Retire version
    ARCHIVED --> [*]
```

### Async Generation Flow
Document generation is asynchronous, following an event-driven pattern.

```mermaid
sequenceDiagram
    participant Web as Web (SPA)
    participant API as API Service
    participant Queue as Redis Queue
    participant Worker as Worker Service

    Web->>API: POST /generate
    API->>Queue: Enqueue Job (Context + Template)
    API-->>Web: 202 Accepted (Job ID)
    Queue->>Worker: Process Job
    Worker->>Worker: Assemble & Convert
    Worker->>API: Mark Completed
    Web->>API: Poll / WebSocket status
    API-->>Web: Status: Finished (Download Link)
```

---

## 🔒 Security & Roles
Access is governed by a hierarchical role model (Admin, Lawyer, Partner) implemented at the API level via NestJS Guards.

---

## 🔗 Related Documentation
- [Data Model](./data-model.md)
- [API Overview](./api-overview.md)
- [Known Issues](./known-issues.md)
- [Back to README](../README.md)
