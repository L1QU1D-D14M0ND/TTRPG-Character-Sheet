# Security Policy

## Reporting Security Issues

If you discover a security vulnerability or security-related issue in this project, please report it responsibly by contacting the maintainer directly through GitHub or via email at `tomrod04@gmail.com`. Please do not report security vulnerabilities through public GitHub issues.

When reporting, please include:
- A description of the issue and potential impact
- Steps to reproduce or a minimal proof of concept
- Any potential remediations if known

We will acknowledge receipt of your report within 48 hours and provide updates on resolution progress.

## Architecture & Data Handling

TTRPG Character Sheet is designed as a **local-first client-side Progressive Web Application (PWA)**:
- **No Remote Telemetry or Tracking:** The application performs no network requests, tracking, or remote analytics.
- **Local Persistence:** Character state is stored strictly in memory, local user-managed JSON files, or an in-browser IndexedDB single draft buffer.
- **No Third-Party Transmission:** No character data, player information, or document contents leave the user's browser or device.
