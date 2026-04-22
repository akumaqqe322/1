# Demo & Testing Flow - Cassatix

This guide provides a walkthrough for reviewers to evaluate the core functionality of Cassatix.

---

## 🎭 Persona: The Lawyer (Setup)

1.  **Define a Template**: Navigate to "Templates" and create a metadata record (e.g., "Non-Disclosure Agreement").
2.  **Draft a Version**: Create a new version.
3.  **Content Injection**: Upload a `.docx` file using the `{{variableName}}` syntax. 
    *   *Tip*: Use `{{clientName}}` and `{{effectiveDate}}` to match seeded case data.
4.  **Promote**: Promote the version to **Published**.

---

## 🎭 Persona: The Partner (Production)

1.  **Identify Matter**: Navigate to the "Cases" list.
2.  **Trigger Generation**: Select a case and choose "Generate Document".
3.  **Bridge Sourcing**: Select your published template and choose "Link to Case".
4.  **Verification**: 
    - Verify the status moves from `QUEUED` to `COMPLETED`.
    - Download the final PDF and inspect that the `{{clientName}}` has been accurately replaced with data from the case management source.

---

## 🎭 Persona: The Admin (Governance)

1.  **System Health**: Check the Dashboard for aggregate generation stats.
2.  **Compliance**: Visit the "Audit Logs" to see the chronological history of who promoted a specific template version and who generated the final client PDF.

---

## 🔗 Related Documentation
- [Known Issues](./known-issues.md)
- [Architecture Overview](./architecture.md)
- [API Overview](./api-overview.md)
- [Back to README](../README.md)
