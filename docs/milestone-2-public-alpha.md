# Milestone 2 Public Alpha

Milestone 2 turns the local Devnet proof into something an outside agent can try:

- one hosted Split402 merchant;
- one reusable agent SDK;
- one demo agent that earns referral credit on a valid claim and receives zero credit on an invalid claim.

This is still the MVP accrual model from the architecture document. The merchant receives the gross x402 payment, then emits a signed Split402 receipt that records the referral commission liability. It is not atomic on-chain splitting yet.

## Hosted Merchant

The merchant app is exported from `apps/demo-merchant/src/app.ts` and can be served on Vercel through `api/index.ts`.

Required Vercel/project environment:

- `SPLIT402_MERCHANT_ORIGIN`: optional when using Vercel preview URLs; if absent, the app signs offers for `https://$VERCEL_URL`.
- `SPLIT402_MERCHANT_PAY_TO`: merchant Solana Devnet wallet that can receive the configured SPL token.
- `SPLIT402_SERVICE_SEED_HEX`: merchant service signing seed.
- `SPLIT402_ASSET`: Solana Devnet payment mint.
- `SPLIT402_REQUIRED_AMOUNT_ATOMIC`: decimal atomic token amount.
- `SPLIT402_COMMISSION_BPS`: referral commission basis points.
- `X402_FACILITATOR_URL`: defaults to `https://x402.org/facilitator`.

Useful public endpoints:

- `GET /health`: merchant configuration, pay-to wallet, service public key, and in-memory receipt count.
- `GET /.well-known/split402.json`: public alpha discovery metadata for agents.
- `POST /v1/risk`: x402-paid demo endpoint.
- `GET /debug/receipts`: public demo receipt list, kept in server memory.

`/debug/receipts` is intentionally demo-only. A production merchant needs durable receipt storage and control-plane ingestion.

### Temporary Public Tunnel

When Vercel credentials are not available, the alpha merchant can be exposed with a temporary Cloudflare Quick Tunnel:

```sh
C:\tmp\cloudflared.exe tunnel --protocol http2 --url http://127.0.0.1:4021
```

Start the merchant with the generated `https://*.trycloudflare.com` URL as `SPLIT402_MERCHANT_ORIGIN` before running paid requests. The signed Split402 offer and referral claim both bind to that exact origin.

This is public and agent-testable, but it is not durable hosting. Use the Vercel path or a named Cloudflare tunnel for a stable alpha URL.

## Agent SDK

The SDK lives in `packages/agent-sdk`.

It gives agents:

- `Split402AgentClient` for inspecting offers and making paid JSON requests;
- `createSvmSignerFromBase58` for Solana/x402 demo keys;
- `createReferralClaim` for portable signed referrer claims;
- receipt extraction and verification helpers.

## Demo Agent

The demo agent in `apps/demo-agent/src/index.ts` now uses `@split402/agent-sdk`.

Valid claim:

```sh
$env:SPLIT402_MERCHANT_ORIGIN="https://<hosted-merchant>"
$env:SVM_PRIVATE_KEY="<funded-devnet-buyer-secret>"
corepack pnpm demo:agent
```

Invalid claim:

```sh
$env:SPLIT402_USE_INVALID_CLAIM="true"
corepack pnpm demo:agent
```

The valid run should print a verified receipt with nonzero `referrerCreditAtomic` when the configured payment amount and commission produce at least one atomic unit. The invalid run should still pay the x402 API but return a receipt with zero referral credit.

## Local Public-Alpha Rehearsal

```sh
corepack pnpm demo:setup-existing-token
corepack pnpm demo:paid-suite
```

The existing-token setup uses a deterministic Devnet token account and configures a 1-atomic-unit payment with `10000` commission bps. That makes the valid demo show an earned referral credit while the invalid claim remains zero.

## Completion Evidence

Milestone 2 is complete only after these are all true:

- the hosted merchant URL returns `ok: true` from `/health`;
- the hosted merchant returns a signed Split402 offer from `POST /v1/risk`;
- `@split402/agent-sdk` builds, typechecks, and tests pass;
- the demo agent succeeds against the hosted merchant with a valid claim;
- the demo agent succeeds against the hosted merchant with an invalid claim and zero referral credit.
