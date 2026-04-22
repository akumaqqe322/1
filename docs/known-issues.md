# Known Issues & Limitations - Cassatix

This document provides an honest assessment of the current prototype's constraints and known rough edges.

---

## 🛠 Prototype Constraints

### 🔑 Mock Authentication
- **Current State**: Auth is handled via the `x-user-id` header.
- **Limitation**: There is no password hashing, token expiration, or secure session management.
- **Security Warning**: This mechanism is for rapid prototyping only and must never be exposed to a public network without a JWT/OIDC layer.

### 🏠 Local Infrastructure Dependencies
- **Worker Binaries**: PDF conversion relies on `libreoffice` being installed on the host environment. Failing to find the binary will cause generation jobs to fail.
- **S3 Connectivity**: The system defaults to local MinIO. In unstable network environments, large `.docx` uploads may time out.

---

## 🏗 Logical Limitations

### 🤖 AI Extraction Variance
- **Issue**: Gemini AI extraction is non-deterministic. The same input text may result in slightly different variable keys if the prompt is not strictly constrained.
- **Impact**: Some extracted fields might not match template placeholders exactly (e.g., `client_name` vs `clientName`).

### 📁 Document Assembly
- **Issue**: Complex nested logic (nested loops/conditionals) in `.docx` files is currently limited to the capabilities of the `docxtemplater` configuration.
- **Constraint**: Deep biological or mathematical formulas within Word docs are not supported in the current assembly pipeline.

---

## 🚀 Common Failure Points

1.  **Stuck Jobs**: If a Worker service crashes mid-processing, the status of a `GeneratedDocument` may stay `PROCESSING` indefinitely. 
    *   *Mitigation*: Manual retry or clearing the Redis queue.
2.  **Schema Mismatch**: Uploading a `.docx` with variables that don't exist in the Case Management data.
    *   *Mitigation*: Use the "Preview" flow to identify missing data before "Final" generation.

---

## 🔗 Related Documentation
- [Demo & Testing Flow](./demo-flow.md)
- [Architecture Overview](./architecture.md)
- [Back to README](../README.md)
