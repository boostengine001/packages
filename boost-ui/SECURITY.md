# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in `@boostengine/ui`,
please report it responsibly:

1. **Do NOT open a public GitHub issue** for the vulnerability.
2. Email **boostengine001@gmail.com** with:
   - A description of the vulnerability
   - Steps to reproduce or a proof of concept
   - The affected version(s)
   - Any potential impact you have identified
3. You will receive an acknowledgement within **72 hours**, and we aim to publish a fix
   for critical issues within **7 days**.

## Scope

This package ships **client-side UI components only** — it contains no network calls,
no telemetry, and zero runtime dependencies. Vulnerabilities of interest include XSS via
component props (e.g. unescaped user content), prototype pollution in utilities such as
`deepMerge`, and supply-chain issues in the build pipeline.
