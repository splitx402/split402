# Contributing

Split402 is in public-alpha shape. Keep changes small, typed, and covered by the closest tests.

## Development

```sh
corepack pnpm install
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm vectors:check
```

Use `.env.example` as the template for local demo settings. Never commit `.env`, private keys, funded wallet secrets, or deployment tokens.

## Pull Requests

- Explain the protocol or developer-facing behavior changed.
- Include tests or state why the change is documentation-only.
- Regenerate protocol vectors when protocol artifacts change.
- Keep x402 settlement compatibility intact unless the change is explicitly a new scheme proposal.

## Architecture Guardrails

- The current MVP is an accrual-and-receipt model.
- The merchant receives the gross x402 payment in the existing `exact` scheme.
- Split402 records a signed referral commission liability after settlement.
- Atomic on-chain splitting belongs in a future payment scheme, not a hidden behavior change in the extension.
