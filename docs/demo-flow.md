# Cassatix: End-to-End Demo & Testing Flow

This guide outlines the ideal user journey through Cassatix. Since this is a specialized legal tool, following this flow ensures you see the full range of versioning, automation, and governance features.

---

## 🎬 The Ideal User Journey

### 1. Initial State & Login
*   **Action**: Navigate to the Web UI and "Login."
*   **Expected Behavior**: In the current prototype phase, you will be automatically authenticated as an **Admin** user (seeded as `admin@firm.com`) using a mock session.
*   **Verification**: Check the sidebar or profile page to verify you are assigned the `admin-role`.

### 2. Template Definition
*   **Action**: Go to **Templates** → **Create Template**.
*   **Input**: Name: "Master Service Agreement", Code: "MSA-V1", Category: "Contracts".
*   **Expected Behavior**: A new template record is created. It is currently "Empty" with no files.

### 3. Versioning & Upload (The "Lawyer" Flow)
*   **Action**: Click into the template and **Create New Version**.
*   **Action**: Upload a `.docx` file containing variables like `{{clientName}}`, `{{effectiveDate}}`, and `{{contractAmount}}`.
*   **Expected Behavior**: The system stores the file in S3 and enters the `DRAFT` state.
*   **Verification**: The UI should show the file as "Uploaded" and the version as "v1 (Draft)".

### 4. Promotion to Production
*   **Action**: Select the draft version and click **Promote to Published (Live)**.
*   **Expected Behavior**: This version is now locked. It becomes the "Canonical source of truth" for all final client documents.
*   **Verification**: The template status in the main list changes to `ACTIVE` with `v1` listed as the LIVE version.

### 5. Document Generation (The "Partner" Flow)
*   **Action**: Navigate to **Cases** (Simulated Legal Matters).
*   **Action**: Select an active case (e.g., "MegaCorp Litigation") and click **Generate Document**.
*   **Action**: Select "Master Service Agreement" and choose **"Link to Case"** as the data source.
*   **Action**: Select **Final** output mode and **PDF** format.
*   **Expected Behavior**: The API validates permissions, pulls the case data, and queues a job for the background worker.
*   **Verification**: You will see a "Queued" or "Processing" status and eventually a **Download** button.

### 6. Audit & Governance
*   **Action**: Navigate to **System Logs** (Admin only).
*   **Expected Behavior**: You should see a chronological log of:
    *   *System: Template Created*
    *   *Lawyer: Version Drafted*
    *   *Admin: Version Published*
    *   *Partner: Final Document Generated*

---

## 📊 Expected Demo Data (Seeded)

The system comes pre-populated with "Project 2.0" data to facilitate immediate testing:
- **Cases**: A mix of Litigation (case-101) and Corporate (case-505) matters with associated parties and dates.
- **Templates**: A baseline "Power of Attorney" template is often pre-published in the seed.
- **Roles**: Admin, Lawyer, and Partner roles with distinct access layers.

---

## 🔍 Prototype vs. Production Status

| Category | Prototype Status (Current) | Production Intended Behavior |
| :--- | :--- | :--- |
| **Auth** | Mock `x-user-id` headers. | Full JWT/OIDC (OpenID Connect) integration. |
| **Validation** | Placeholder detection via regex. | Full deep-schema parsing for variable types. |
| **Case Source** | Local simulated service. | Direct API integration with Firm ERP/CMS. |
| **PDF Engine** | Local LibreOffice instances. | Dedicated serverless conversion lambda/pool. |

---

## 🛠 Troubleshooting & Common Failures

-   **Worker Offline**: If the generation status stays "Queued" indefinitely, the `Worker` service may have encountered a memory limit or crashed. Check the worker console logs.
-   **S3 Connection**: If file uploads fail immediately, ensure the `S3_ENDPOINT` and credentials correlate to an accessible bucket.
-   **Extraction "Vibe"**: AI Extraction quality varies based on the clarity of the source text. For best results, use structured notes with clearly labeled entities.

---

## 🗒 Note on Deployment Instability

If the live environment is unresponsive, the intended behavior of Cassatix is to act as a **transactional state machine**. 
- The API *must* ensure that no document is ever generated from an un-validated draft.
- The Worker *must* ensure that every generation event results in a permanent, immutable record in both the relational database (metadata) and S3 (artifact).
