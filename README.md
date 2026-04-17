# Cassatix

Cassatix is a professional-grade document automation and management platform tailored for legal workflows. It streamlines the lifecycle of legal templates—from initial drafting and versioning to automated document generation through multiple data sourcing modes.

## Features

### Template Lifecycle Management
*   **Version Control**: Manage templates through distinct stages: DRAFT, PUBLISHED (Live), and ARCHIVED.
*   **Safety Gate**: Visual segregation between the working draft and the production-ready live version ensures stable document generation.
*   **Validation**: Automatic validation system for uploaded .docx files to ensure variable compatibility.

### Automated Document Generation
*   **Multi-Mode Sourcing**: Generate documents using three distinct input methods:
    *   **Case-Based**: Integration with Case Management data (simulated Project 2.0 source).
    *   **AI Extraction**: Automated field extraction from uploaded source documents using Gemini AI logic.
    *   **Manual Entry**: Structured forms for ad-hoc generation context.
*   **Format Support**: Background workers process and output files in both .docx and .pdf formats.
*   **Asynchronous Processing**: High-throughput generation handled via a distributed queue system.

### Security and Governance
*   **Role-Based Access Control**: Granular permissions for Admin, Lawyer, and Partner roles.
*   **Audit Logging**: Comprehensive tracking of all template modifications and document generation events.
*   **Immutable History**: Archived versions are preserved as read-only records for compliance.

## Architecture Overview

The system follows a decoupled, service-oriented architecture designed for scalability and reliability.

*   **Frontend (apps/web)**: A modern, reactive SPA built with React and Vite, utilizing TanStack Query for state synchronization.
*   **API Service (apps/api)**: A NestJS-based gateway handling authentication, template metadata, and generation job orchestration.
*   **Worker Service (apps/worker)**: A dedicated Node.js process focused on intensive document assembly and format conversion chores.
*   **Intelligence Layer**: Integration with Google Gemini API for structured data extraction from unstructured legal text.
*   **Persistence & Queue**: PostgreSQL for relational data, Redis for distributed job queuing (BullMQ), and S3-compatible storage for binary artifacts.

## Core Workflows

### Template Deployment
1.  Define template metadata (name, code, category).
2.  Create a NEW VERSION (Draft).
3.  Upload a .docx file containing placeholders (e.g., `{{clientName}}`).
4.  Run validation to confirm schema integrity.
5.  Promote to LIVE to make the version available for final generation.

### Document Generation
1.  Initialize generation for a specific template.
2.  Select source data (Link to Case, Extract with AI, or Manual Form).
3.  Select workflow:
    *   **Preview**: Uses the latest valid version for internal review.
    *   **Final**: Uses the strictly published LIVE version.
4.  Monitor background processing status.
5.  Download generated assets from secure storage.

## Demo Mode

Cassatix includes a built-in seeding mechanism for evaluation. Running the demo seed populates the system with:
*   Pre-configured legal templates (Power of Attorney, Service Agreement, etc.).
*   Mock "Project 2.0" case data for litigation and corporate matters.
*   Initial user roles and administrative accounts.

## Tech Stack

### Backend & Infrastructure
*   **Framework**: NestJS (TypeScript)
*   **ORM**: Prisma
*   **Database**: PostgreSQL
*   **Task Queue**: BullMQ & Redis
*   **Storage**: S3-Compatible API (MinIO / AWS S3)
*   **Processing**: Docxtemplater, PizZip, LibreOffice

### Frontend
*   **Library**: React 19
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS 4
*   **UI Components**: shadcn/ui & Radix UI
*   **Data Fetching**: TanStack Query (React Query)

## Key Design Decisions

### Normalized Generation Context
To support diverse data sources (Manual, AI, Database), the system utilizes an adapter layer that transforms raw inputs into a unified `GenerationContext`. This ensures the background workers operate on a stable schema regardless of how the data was acquired.

### Background Worker Isolation
Document generation and PDF conversion are expensive operations. By isolating these in a dedicated worker service with BullMQ, we ensure the main API remains responsive during high-load periods.

### Version Immutable State
Once a template version is ARCHIVED, its storage path and binary content become immutable. This prevents historical document regeneration from being affected by retrospective template changes.

## Limitations

*   **Storage Dependency**: Requires an S3-compatible object storage service for template and document persistence.
*   **Extraction Accuracy**: AI-assisted extraction efficacy depends on the quality of the source text and current LLM model context limits.
*   **LibreOffice Runtime**: PDF conversion requires a LibreOffice installation on the host or container running the Worker service.

## Future Improvements

*   **Native Template Editor**: Browser-based .docx editing to remove the dependency on external office software.
*   **Advanced Logic Engine**: Introduction of complex conditional branching (IF/ELSE) within the variable schema UI.
*   **Multi-Tenant Isolation**: Robust workspace partitioning for multi-firm deployments.

## Setup & Deployment

### 1. Environment Variables
The application requires the following environment variables to be configured in a `.env` file at the root:

**Shared & API Service**
*   `DATABASE_URL`: Connection string for PostgreSQL (e.g., `postgresql://user:pass@host:5432/dbname`).
*   `REDIS_URL`: Connection string for Redis components (e.g., `redis://host:6379`).
*   `GEMINI_API_KEY`: API key for Google Gemini (required for AI Extraction mode).
*   `S3_ENDPOINT`: Endpoint for S3-compatible storage (e.g., `http://localhost:9000` for MinIO).
*   `S3_ACCESS_KEY` & `S3_SECRET_KEY`: Credentials for storage access.
*   `S3_BUCKET`: Name of the bucket for document storage.

**Web Service**
*   `VITE_API_URL`: URL of the API service (e.g., `http://localhost:3001`).

### 2. Local Development

Follow these steps to get the full stack running locally:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Infrastructure**: Ensure PostgreSQL, Redis, and MinIO are running (refer to `docker-compose.yml`).
3.  **Database Setup**:
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```
4.  **Start Services**:
    We recommend running services in separate terminals or using the combined dev command:
    ```bash
    # Combined (using concurrently)
    npm run dev

    # Individual
    npm run dev:web    # Starts Vite on port 3000
    npm run dev:api    # Starts NestJS on port 3001
    npm run dev:worker # Starts background worker
    ```

### 3. Running Services

*   **Web (Port 3000)**: The main user interface for lawyers and admins.
*   **API (Port 3001)**: Handles business logic, authentication, and orchestrates the generation queue.
*   **Worker**: A headless service that consumes jobs from Redis to assembly .docx files and convert them to PDF.

### 4. Production Deployment (Railway)

Cassatix is designed to be deployed as three separate services on Railway:

*   **API Service**: 
    - Start Command: `npm run start:api`
    - Attach PostgreSQL and Redis plugins.
*   **Worker Service**:
    - Start Command: `npm run start:worker`
    - Ensure the environment has `libreoffice` installed (required for PDF conversion).
*   **Web Service**:
    - Start Command: `npm run start:web`
    - Configure the `VITE_API_URL` to point to your deployed API service.

### 5. Common Issues

*   **Prisma Migration Errors**: If switching between different database providers, ensure you clear the `prisma/migrations` folder or use `prisma migrate reset`.
*   **Redis Connection**: Ensure `REDIS_URL` matches the service name in the Docker network (e.g., `redis://redis:6379` vs `localhost`).
*   **Missing Seed Data**: If you encounter a 401 "User not found" upon login, ensure `npx prisma db seed` was executed perfectly to create the initial administrative users.
*   **S3 Bucket Missing**: The system expects the bucket defined in `S3_BUCKET` to exist. If using MinIO, you may need to create it once via the console.

### 6. Verification Steps

To verify the installation:
1.  Navigate to `http://localhost:3000`.
2.  Log in using seeded credentials (e.g., `admin@firm.com`).
3.  Create a test template and upload a valid `.docx`.
4.  Generate a **Preview** and check the **Worker** logs to ensure the assembly job completed successfully.
