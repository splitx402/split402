# Security Policy

Split402 is pre-production public alpha software. Do not use it with mainnet funds or production merchant obligations yet.

## Reporting

Please open a private security advisory on GitHub when available, or contact the maintainers privately before publishing exploit details.

Include:

- affected package or app;
- reproduction steps;
- expected impact;
- whether funds, private keys, receipts, or attribution records are at risk.

## Sensitive Data

Never commit:

- `.env` files;
- Solana private keys;
- service signing seeds;
- deployment tokens;
- funded wallet credentials.

The demo uses Solana Devnet and deterministic local fixtures where possible, but real keys may be introduced through `.env` during testing.
