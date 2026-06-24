import {
  deriveEd25519PublicKey,
  hexToBytes,
  createSampleProtocolArtifacts,
  verifyReferralClaimObject,
  verifySplit402Receipt
} from "@split402/protocol";
import { describe, expect, it } from "vitest";

import {
  corruptReferralClaimSignature,
  createReferralClaim,
  extractReceipt
} from "../src/index.js";

const REFERRER_SEED = hexToBytes(
  "202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f"
);
const PAYOUT_SEED = hexToBytes(
  "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f"
);

describe("Split402 agent SDK", () => {
  it("creates a verifiable referral claim", () => {
    const claim = createReferralClaim({
      privateSeed: REFERRER_SEED,
      routeId: "rte_00000000000000000000000000000003",
      campaignId: "cmp_00000000000000000000000000000002",
      campaignVersionMin: 1,
      payoutWallet: deriveEd25519PublicKey(PAYOUT_SEED),
      resourceOrigin: "http://localhost:4021",
      operationIds: ["wallet-risk-score"],
      issuedAt: "2026-06-24T00:00:00Z",
      expiresAt: "2099-06-24T00:00:00Z",
      nonce: "claim-nonce-000001",
      metadata: { label: "sdk test" }
    });

    expect(claim.referrerWallet).toBe(deriveEd25519PublicKey(REFERRER_SEED));
    expect(verifyReferralClaimObject(claim)).toEqual({ ok: true, errors: [] });
  });

  it("can intentionally corrupt a referral claim for invalid-claim demos", () => {
    const claim = createReferralClaim({
      privateSeed: REFERRER_SEED,
      routeId: "rte_00000000000000000000000000000003",
      campaignId: "cmp_00000000000000000000000000000002",
      campaignVersionMin: 1,
      payoutWallet: deriveEd25519PublicKey(PAYOUT_SEED),
      resourceOrigin: "http://localhost:4021",
      operationIds: ["wallet-risk-score"],
      expiresAt: "2099-06-24T00:00:00Z"
    });

    expect(verifyReferralClaimObject(corruptReferralClaimSignature(claim)).ok).toBe(
      false
    );
  });

  it("extracts a Split402 receipt from an x402 settlement extension", () => {
    const bundle = createSampleProtocolArtifacts();
    const receipt = bundle.artifacts.receipt;
    const extracted = extractReceipt({
      extensions: {
        split402: {
          receipt
        }
      }
    });

    expect(extracted).toEqual(receipt);
    expect(verifySplit402Receipt(extracted, bundle.keys.merchantPublicKey)).toEqual({
      ok: true,
      errors: []
    });
  });
});
