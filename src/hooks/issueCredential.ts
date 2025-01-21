import { ethers } from 'ethers';
import { issuerContractAddress, contractABI } from '../constants/contract';
import { Groth16Proof } from 'snarkjs'

type BigNumberish = string | bigint

export type PackedGroth16Proof = [
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish
]

/**
 * Packs a proof into a format compatible with ZKFirmaDigital.sol contract.
 * @param originalProof The proof generated with SnarkJS.
 * @returns The proof compatible with Semaphore.
 */
function packGroth16Proof(
  groth16Proof: Groth16Proof
): PackedGroth16Proof {
  return [
    groth16Proof.pi_a[0],
    groth16Proof.pi_a[1],
    groth16Proof.pi_b[0][1],
    groth16Proof.pi_b[0][0],
    groth16Proof.pi_b[1][1],
    groth16Proof.pi_b[1][0],
    groth16Proof.pi_c[0],
    groth16Proof.pi_c[1],
  ]
}

export const issueCredential = async (verifiableCredential: any):
  Promise<{ result: any; error: string | null; done: boolean }> => {
  var result = "";
  var error = "";
  var done = false;

  const pushData = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userId = await signer.getAddress();
      const contract = new ethers.Contract(issuerContractAddress, contractABI, signer);

      const nullifierSeed = verifiableCredential.proof.signatureValue.public[3];
      const nullifier = verifiableCredential.proof.signatureValue.public[1];
      // Signal used when generating proof
      const signal = userId;
      // For the moment this is assumed always the case that age > 18
      const revealArray = [verifiableCredential.proof.signatureValue.public[2]];
      // Get proof from credential
      const proof = verifiableCredential.proof.signatureValue.proof;

      console.log("userId", userId);
      console.log("nullifierSeed", nullifierSeed);
      console.log("nullifier", nullifier);
      console.log("signal", signal);
      console.log("revealArray", revealArray);
      console.log("proof", proof);
      const result_transaction = await contract.issueCredential(
        userId,
        nullifierSeed,
        nullifier,
        signal,
        revealArray,
        packGroth16Proof(proof),
      );
      result = result_transaction;
      done = true;
    } catch (err) {
      done = false;
      console.error(err);
      error = "Failed to write data to the contract";
    }
  };

  pushData();

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ result: result, error: error, done: done });
    }, 2000);
  });
}