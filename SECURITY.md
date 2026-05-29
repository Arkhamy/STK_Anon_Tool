# Security Policy

## Supported Versions

| Version | Support        |
|---------|----------------|
| Latest  | Security fixes |
| Older   | No support     |

Always use the latest release available on [GitHub Releases](https://github.com/Arkhamy/stk_anon_tool/releases).

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately to: **security@sentrykat.fr**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

Expected response time: **72 hours**.

## Verifying Release Integrity

Each release includes a `SHA256SUMS.txt` file. Verify your download:

```bash
# Linux
sha256sum --check SHA256SUMS.txt

# Windows (PowerShell)
Get-FileHash STK-Anon-Setup.exe -Algorithm SHA256
```

Compare the output against the value in `SHA256SUMS.txt`.

## Security Design

- **Local processing only**: No data is ever sent to external servers.
- **No CDN dependencies**: All libraries are bundled locally in the application.
- **Electron hardening**: Context isolation enabled, Node.js integration disabled, strict Content Security Policy.
- **Automatic updates**: Updates are cryptographically signed and verified by Electron before installation.
- **Dependency monitoring**: Weekly automated CVE scans via GitHub Actions.

## Software Bill of Materials (SBOM)

A `sbom.json` (CycloneDX format) is published with every release for vulnerability tracking.
