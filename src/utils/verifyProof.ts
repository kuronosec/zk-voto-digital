import * as snarkjs from 'snarkjs';
import { productionPublicKeyHash } from "../constants";

export const verifyProof = async (_verificationkey: string, publicSignals: any, proof: any): Promise<boolean> => {
  if (!_verificationkey || !publicSignals || !proof) {
    console.log('Empty inputs');
    return false;
  }

  // First verify the government public key hash
  if (publicSignals[0] !== productionPublicKeyHash) {
    throw new Error('VerificationError: public key mismatch.');
  }

  const vkey_json = await fetch(_verificationkey).then((res) => res.json());
  return await snarkjs.groth16.verify(vkey_json, publicSignals, proof);
};