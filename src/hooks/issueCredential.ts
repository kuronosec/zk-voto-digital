import { ethers } from 'ethers';
import { issuerContractAddress, issuerContractABI } from '../constants/issuerContract';
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
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        // Prompt the user to connect MetaMask if no accounts are authorized
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userId = await signer.getAddress();
      const contract = new ethers.Contract(issuerContractAddress, issuerContractABI, signer);
      // The order of the public data in the credential is the following
      // 0 - PublicKeyHash (Goverment public key hash)
      // 1 - Nullifier
      // 2 - Reveal Age above 18
      // 3 - NullifierSeed
      // 4 - SignalHash
      const nullifierSeed = verifiableCredential.proof.signatureValue.public[3];
      const nullifier = verifiableCredential.proof.signatureValue.public[1];
      // Signal used when generating proof
      const signal = BigInt(userId).toString();
      // For the moment this is assumed always the case that age > 18
      const revealArray = [verifiableCredential.proof.signatureValue.public[2]];
      // Get proof from credential
      const proof = verifiableCredential.proof.signatureValue.proof;
      // Call create credential method
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
    } catch (err: unknown) {
      if ((err as any).code === 4001) {
        console.error("User rejected the request.");
        error = "User rejected the request.";
      } else {
        console.error("Error:", err);
        done = false;
        console.error(err);
        error = "Failed to write data to the contract";
      }
    }
  };

  pushData();

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ result: result, error: error, done: done });
    }, 2000);
  });
}