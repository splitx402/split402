# Milestone 1 Devnet Demo

This demo wires Split402 into a real x402-protected Express API on Solana Devnet.

## What It Proves

- The merchant advertises a signed Split402 offer inside the x402 `402 Payment Required` response.
- The buyer pays through x402 and echoes the Split402 offer plus a referral claim.
- The merchant verifies Split402 attribution before x402 settlement.
- After settlement, the merchant returns a signed Split402 receipt in the x402 payment response extensions.
- A valid referral claim accrues the configured 20 percent commission.
- An invalid referral claim leaves the x402 payment unchanged but produces zero referral commission.

## Run

Install once:

```sh
corepack pnpm install
```

Terminal 1:

```sh
corepack pnpm demo:merchant
```

Verify the unpaid x402 handshake and signed Split402 offer:

```sh
corepack pnpm demo:inspect-offer
```

Run preflight before spending Devnet funds:

```sh
corepack pnpm demo:preflight
```

`demo:preflight` checks the merchant health endpoint, verifies the unpaid x402 `402` response and Split402 offer, derives the buyer address from `SVM_PRIVATE_KEY` when present, checks buyer balance for the advertised payment asset, and checks that the merchant pay-to wallet has a token account for that asset. Buyer SOL is reported as diagnostic data, but it is not required by the x402 SVM flow because the facilitator supplies the fee payer. It exits non-zero until the buyer key, buyer payment-token balance, and merchant pay-to token account are ready for the paid demo.

Create a disposable buyer key and request Devnet SOL for fees:

```sh
corepack pnpm demo:setup-buyer
```

`demo:setup-buyer` creates or reuses `SVM_PRIVATE_KEY`, writes it to ignored local `.env` when safe, and opportunistically requests Devnet SOL for direct-wallet debugging. It does not mint Devnet USDC, and buyer SOL is not required for the x402 demo. Use the printed buyer address with a Devnet USDC source/faucet, then rerun `demo:preflight`.

If the public Solana RPC airdrop is rate-limited, fund the printed buyer address with Devnet SOL through one of the Solana Foundation guide options:

- Solana faucet: https://faucet.solana.com/
- Solana devnet SOL guide: https://solana.com/developers/guides/getstarted/solana-token-airdrop-and-faucets

Fund the same printed buyer address with Solana Devnet USDC through Circle's public faucet. Also fund the merchant pay-to wallet once with Solana Devnet USDC so its associated token account exists for incoming x402 transfers. The merchant pay-to wallet is printed by `/health` and `demo:preflight`.

- Circle faucet: https://faucet.circle.com/
- Asset: USDC
- Network: Solana Devnet
- Mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

If faucet UX blocks the USDC path, use the deterministic existing-token fallback:

```sh
corepack pnpm demo:setup-existing-token
corepack pnpm demo:paid-suite
```

`demo:setup-existing-token` verifies a pre-existing Devnet SPL token account controlled by a deterministic demo key, writes ignored local `.env` values, and configures a 1-atomic-unit payment with `SPLIT402_COMMISSION_BPS=10000` so the valid receipt shows a nonzero referral credit while the invalid receipt remains zero. This fallback is for local proof only: the buyer and merchant pay-to are the same deterministic wallet because that is the token account already available in Devnet state.

If you have a funded system-owned Devnet service key, you can instead create a disposable local demo mint:

```sh
corepack pnpm demo:setup-mint
```

`demo:setup-mint` creates a new SPL mint, mints demo tokens to the buyer, creates the merchant pay-to associated token account, and writes `SPLIT402_ASSET` plus `SPLIT402_REQUIRED_AMOUNT_ATOMIC` to ignored local `.env`. The default deterministic service address is a nonce account on Devnet, so it cannot pay rent for this setup path; set `SPLIT402_SERVICE_SEED_HEX` to a funded system-owned key before using it.

Run the local Split402 hook harness:

```sh
corepack pnpm --filter @split402/x402-extension test
```

This local harness proves the Split402 offer, attribution validation, settlement-extension receipt, valid-claim commission, and invalid-claim zero-commission behavior without submitting an on-chain payment. The live `demo:agent` run below is still required to prove the full Devnet x402 settlement path.

Terminal 2:

```sh
$env:SVM_PRIVATE_KEY="<base58-devnet-buyer-secret-key>"
corepack pnpm demo:agent
```

Invalid-claim path:

```sh
$env:SPLIT402_USE_INVALID_CLAIM="true"
corepack pnpm demo:agent
```

One-command final proof:

```sh
corepack pnpm demo:paid-suite
```

`demo:paid-suite` builds the workspace, starts the demo merchant, runs preflight, executes one valid paid request and one invalid-claim paid request, verifies both returned receipts, checks the valid receipt accrues the configured commission bps, and checks the invalid-claim receipt accrues zero commission.

## Required Devnet Inputs

`SVM_PRIVATE_KEY` must be a base58-encoded Solana keypair secret for a buyer wallet funded for the x402 Devnet flow. The merchant defaults are deterministic for local demos:

- `SPLIT402_MERCHANT_ORIGIN`: defaults to `http://localhost:4021`
- `SPLIT402_MERCHANT_PAY_TO`: defaults to a deterministic demo public key
- `SPLIT402_SERVICE_SEED_HEX`: defaults to a deterministic local signing seed
- `SPLIT402_ASSET`: defaults to Solana Devnet USDC mint `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- `SPLIT402_REQUIRED_AMOUNT_ATOMIC`: defaults to `10000`
- `SPLIT402_COMMISSION_BPS`: defaults to `2000`
- `X402_FACILITATOR_URL`: defaults to `https://x402.org/facilitator`
- `SPLIT402_SYNC_FACILITATOR`: defaults to `true`; set to `false` only for offline `/health` checks
- `SPLIT402_SOLANA_RPC_URL`: defaults to `https://api.devnet.solana.com` for preflight balance checks
- `SPLIT402_AIRDROP_LAMPORTS`: defaults to `1000000000` for `demo:setup-buyer`
- `SPLIT402_FORCE_AIRDROP`: set to `true` to request another SOL airdrop for an existing buyer key
- `SPLIT402_SKIP_AIRDROP`: set to `true` to only create/reuse the buyer key and check balances

The merchant health endpoint exposes the Split402 service public key and pay-to wallet:

```sh
curl http://localhost:4021/health
```

Receipts are kept in memory for the demo and can be inspected at:

```sh
curl http://localhost:4021/debug/receipts
```
