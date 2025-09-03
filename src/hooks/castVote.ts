import { ethers } from 'ethers';
import { voteContractAddress, voteContractABI } from '../constants/voteContract';
import { replicatorContractAddress, replicatorContractABI } from '../constants/replicatorContract';
import { Groth16Proof } from 'snarkjs'
import { ZkProof } from '@rarimo/zk-passport'

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

interface Proposal {
  description: string;
  voteCount: number;
}

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

export const getVoteData = async ():
  Promise<{ _data: any; _error: string | null }> => {
  let data: any = null;
  let error: string | null = null;

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      // Prompt the user to connect MetaMask if no accounts are authorized
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(voteContractAddress, voteContractABI, signer);

    let proposals: Proposal[] = [];

    const votingQuestion = await contract.votingQuestion();
    const length = await contract.getProposalCount(); // Get the total number of proposals
    
    console.log("Número de propuestas:", length.toNumber());
    
    if (length.toNumber() === 0) {
      console.log("proposals is empty.");
      error = 'No proposals yet available for user.';
    } else {
      for (let i = 0; i < length.toNumber(); i++) {
        const proposal = await contract.proposals(i);
        proposals.push({
          description: proposal.description,
          voteCount: proposal.voteCount.toNumber()
        });
      }

      data = {
        votingQuestion: votingQuestion,
        proposals: proposals
      };

      console.log("Datos formateados correctamente:", data);
    }
  } catch (err: unknown) {
    console.error("Error en getVoteData:", err);
    if ((err as any).code === 4001) {
      error = "User rejected the request.";
    } else {
      error = "Wallet no yet available.";
    }
  }

  return { 
    _data: data, 
    _error: error 
  };
}

export const hasVoted = async (
  userNullifier: string,
  useTestZKFirmaDigital: boolean
): Promise<boolean> => {
  const provider = ethers.getDefaultProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const voteContract = new ethers.Contract(
    `0x${
      useTestZKFirmaDigital
        ? process.env.NEXT_PUBLIC_VOTE_CONTRACT_ADDRESS_TEST
        : process.env.NEXT_PUBLIC_VOTE_CONTRACT_ADDRESS_PROD
    }`,
    voteContractABI,
    provider
  );

  return await voteContract.checkVoted(userNullifier);
};

export const castVote = async (verifiableCredential: any, selectedProposalIndex: number):
  Promise<{ _result: any; _error: string | null; _done: boolean }> => {
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
      const voteContract = new ethers.Contract(voteContractAddress, voteContractABI, signer);
      // The order of the public data in the credential is the following
      // 0 - PublicKeyHash (Goverment public key hash)
      // 1 - Nullifier
      // 2 - Reveal Age above 18
      // 3 - NullifierSeed
      // 4 - SignalHash
      // const nullifierSeed = voteContract.voteScope();
      const nullifierSeed = verifiableCredential.proof.signatureValue.public[3];
      const nullifier = verifiableCredential.proof.signatureValue.public[1];
      // Signal used when generating proof
      const signal = BigInt(userId).toString();
      // For the moment this is assumed always the case that age > 18
      const revealArray = [verifiableCredential.proof.signatureValue.public[2]];
      // Get proof from credential
      const proof = verifiableCredential.proof.signatureValue.proof;
      // Call vote method
      const result_transaction = await voteContract.voteForProposal(
        selectedProposalIndex,
        nullifierSeed,
        nullifier,
        signal,
        revealArray,
        packGroth16Proof(proof)
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

  await pushData();

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ _result: result, _error: error, _done: done });
    }, 2000);
  });
}

export const updatePassportRoot = async (proof: any):
  Promise<{ _result: any; _error: string | null; _done: boolean }> => {
  var result = "";
  var error = "";
  var done = false;

  async function getSignedRootState(root: string) {
    const API_BASE_URL = 'https://replication.sakundi.io'

    const requestUrl = new URL(`${API_BASE_URL}/integrations/proof-verification-relayer/v2/state`)
    requestUrl.searchParams.set('filter[root]', root)
    console.log(requestUrl.toString());

    const res = await fetch(requestUrl.toString())
    console.log(res.body);
    const { data } = await res.json()
    console.log("data: ", data);

    return {
      // Signature of root state signed by relayer private key.
      signature: data.attributes.signature,
      // Time when the event was caught, a.k.a state transition timestamp
      timestamp: data.attributes.timestamp,
    }
  }

  async function buildTreeArguments(proof: ZkProof) {
    if (!proof.proof.piA.length || !proof.proof.piB.length || !proof.proof.piC.length) {
      throw new Error('Invalid proof structure')
    }

    const root = BigInt(proof.pubSignals[11]).toString(16);

    const { signature, timestamp } = await getSignedRootState(root);

    return {
      args: [
        "0x"+root,
        BigInt("0x"+timestamp),
        "0x"+signature,
      ] as const,
    }
  }

  async function pushData() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        // Prompt the user to connect MetaMask if no accounts are authorized
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const RegistrationSMTReplicator = new ethers.Contract(
        replicatorContractAddress, replicatorContractABI, signer);

      const { args } = await buildTreeArguments(proof);

      const [root, timestamp, signature] = args;

      const result_transaction = await RegistrationSMTReplicator.transitionRootWithSignature
          (root, timestamp, signature);
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
  }

  await pushData();

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ _result: result, _error: error, _done: done });
    }, 2000);
  });
}