declare module '@kenshi.io/node-ecvrf' {
  type EcvrfPoint = {
    x: { toString(): string };
    y: { toString(): string };
  };

  type EcvrfScalar = { toString(): string };

  type FastVerifyComponents = {
    uX: string;
    uY: string;
    sHX: string;
    sHY: string;
    cGX: string;
    cGY: string;
  };

  export function decode(proof: string): [EcvrfPoint, EcvrfScalar, EcvrfScalar];
  export function prove(secretKey: string, alpha: string): string;
  export function proofToHash(proof: string): Buffer;
  export function getFastVerifyComponents(
    publicKeyHex: string,
    proofHex: string,
    alpha: string | Buffer,
  ): FastVerifyComponents | 'INVALID';
}
