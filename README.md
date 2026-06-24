# Split402

[![CI](https://github.com/splitx402/split402/actions/workflows/ci.yml/badge.svg)](https://github.com/splitx402/split402/actions/workflows/ci.yml)

Split402 is a referral, attribution, and commission layer for x402-paid APIs and agent tools.

This repository contains the Split402 protocol core plus the first x402 integration demo. Milestone 0 stabilizes signed artifacts and test vectors. Milestone 1 adds a single-merchant Solana Devnet demo without introducing database, payout-worker, or token-bonding concerns yet. Milestone 2 starts the public alpha with a hostable merchant, an agent SDK, and a referral-earning demo agent.

> Public alpha: Split402 currently records merchant-signed referral commission receipts after normal x402 settlement. It does not atomically split funds on-chain yet. Do not use with mainnet funds.

## Packages

- `@split402/protocol`: canonical types, Zod schemas, signing bytes, hashes, operation digests, Ed25519 helpers, ID and amount utilities, commission math, and an offline verifier CLI.
- `@split402/x402-extension`: x402 client/server extension glue for signed offers, referral claims, attribution validation, and signed settlement receipts.
- `@split402/express`: lightweight Express request-context adapter for Split402-aware routes.
- `@split402/agent-sdk`: small SDK for agents that inspect offers, pay Split402-enabled x402 APIs, attach referral claims, and verify receipts.
- `@split402/test-vectors`: language-neutral fixtures generated from the protocol package.
- `@split402/demo-merchant`: x402-protected Express merchant API for the single-merchant Devnet demo.
- `@split402/demo-agent`: SDK-backed paying buyer agent that attaches a referral claim and verifies the returned Split402 receipt.

## Commands

```sh
corepack pnpm install
corepack pnpm vectors:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm demo:merchant
corepack pnpm demo:agent
```

The critical invariant for Milestone 0 is that protocol artifacts are deterministic and verifiable offline. The Milestone 1 runbook is in `docs/milestone-1-devnet-demo.md`; the public-alpha Milestone 2 runbook is in `docs/milestone-2-public-alpha.md`.

## Quick Demo

```sh
corepack pnpm demo:setup-existing-token
corepack pnpm demo:paid-suite
```

The paid suite starts a merchant, inspects the x402 `402 Payment Required` response, pays the API through Solana Devnet x402, verifies a credited Split402 referral receipt, and verifies the invalid-claim zero-credit path.
