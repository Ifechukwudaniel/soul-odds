// The .d.ts must be referenced explicitly so consumers that pull this file in
// through imports (e.g. packages/contracts tests) get the ambient types too.
// oxlint-disable-next-line triple-slash-reference
/// <reference path="./node-ecvrf.d.ts" />
import * as ecvrf from '@kenshi.io/node-ecvrf';
import type { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export type VrfProof = readonly [bigint, bigint, bigint, bigint];

export function publicKeyArrayFromPrivateKey(privateKey: Hex): readonly [bigint, bigint] {
  const { publicKey } = privateKeyToAccount(privateKey);
  return [BigInt(`0x${publicKey.slice(4, 68)}`), BigInt(`0x${publicKey.slice(68, 132)}`)];
}

export function generateVrfProof(privateKey: Hex, requestId: Hex): VrfProof {
  // node-ecvrf hex-decodes inputs with Buffer.from(value, 'hex'), so a 0x prefix yields an
  // empty buffer; alpha must match the on-chain abi.encodePacked(requestId) — 32 raw bytes.
  const proofHex = ecvrf.prove(privateKey.slice(2), requestId.slice(2));
  const [gamma, c, s] = ecvrf.decode(proofHex);
  return [
    BigInt(gamma.x.toString()),
    BigInt(gamma.y.toString()),
    BigInt(c.toString()),
    BigInt(s.toString()),
  ] as const;
}
