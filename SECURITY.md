# Security Policy

## Supported versions

This is a continuously deployed website — only the current `main` branch (the
live deployment) is supported. There are no versioned releases to back-port
fixes to.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report privately instead:

- **Preferred:** open a [GitHub private security advisory](https://github.com/Armaan-94/portfolio/security/advisories/new).
- **Or email:** armaanpunia94@gmail.com with the subject line `SECURITY: portfolio`.

Please include:

- a description of the issue and its impact,
- steps to reproduce (or a proof of concept),
- any relevant logs, URLs, or screenshots.

I aim to acknowledge reports within **72 hours** and to provide a remediation
timeline after triage. Once a fix is deployed I'm happy to credit you unless you
prefer to remain anonymous.

## Scope

In scope: this repository's source, its GitHub Actions workflows, and the
deployed site. Out of scope: third-party services it integrates with (Vercel,
Resend, GitHub) — please report those to the respective vendors.
