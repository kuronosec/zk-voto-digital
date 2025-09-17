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

function buildVoteArguments(proof: ZkProof, vote: bigint) {
  if (!proof.proof.piA.length || !proof.proof.piB.length || !proof.proof.piC.length) {
    throw new Error('Invalid proof structure')
  }

  // Extract public signals
  const nullifier = BigInt(proof.pubSignals[0]);
  const citizenship = BigInt(proof.pubSignals[6]);
  const identityCreationTimestamp = BigInt(proof.pubSignals[15]);
  const currentDate = BigInt(proof.pubSignals[13]);
  const root = BigInt(proof.pubSignals[11]);

  const a = [BigInt(proof.proof.piA[0]), BigInt(proof.proof.piA[1])] as const
  const b = [
    [BigInt(proof.proof.piB[0][1]), BigInt(proof.proof.piB[0][0])],
    [BigInt(proof.proof.piB[1][1]), BigInt(proof.proof.piB[1][0])],
  ] as const
  const c = [BigInt(proof.proof.piC[0]), BigInt(proof.proof.piC[1])] as const

  const types = ["uint256", "tuple(uint256, uint256, uint256)"];
  const values = [
    vote as bigint,
    [
      nullifier,
      citizenship,
      identityCreationTimestamp
    ],
  ]

  return {
    args: [
      ethers.utils.hexZeroPad("0x" + root.toString(16), 32),
      currentDate,
      ethers.utils.defaultAbiCoder.encode(types, values),
      { a, b, c },
    ] as const,
  }
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

    const voteParams = await contract.voteParams();
    const votingQuestion = voteParams[0];
    // Get the total number of proposals
    const length = await contract.getProposalCount();
    
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

export const castVote = async (verifiableCredential: any, selectedProposalIndex: number, authMethod: 'firma-digital' | 'passport' = 'firma-digital'):
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

      // Handle Firma Digital voting (existing logic)
      const voteContract = new ethers.Contract(voteContractAddress, voteContractABI, signer);
      
      if (authMethod === 'passport') {
        // Handle ZK Passport voting
        const zkPassportVoteAddress = process.env.REACT_APP_ZK_PASSPORT_VOTE_CONTRACT_ADDRESS;
        if (!zkPassportVoteAddress) {
          throw new Error('ZK Passport vote contract address not configured');
        }

        // Parse the ZK proof from verifiableCredential
        const zkProof = JSON.parse(verifiableCredential);

        const { args } = buildVoteArguments(zkProof, BigInt(selectedProposalIndex));
        
        const [registrationRoot, currentDate, userPayload, zkPoints_] = args;

        // Execute the vote
        /* console.log("Get Public Signals");
        const chainSignals = await voteContract.getPublicSignals(
          registrationRoot,
          currentDate,
          userPayload
        );
        console.log('contract public signals:', chainSignals);
        console.log(
          "proof pubSignals (hex):",
          zkProof.pubSignals.map((s: string) => "0x" + BigInt(s).toString(16))
        );*/
        console.log("Execute the vote");
        const result_transaction = await voteContract.execute(
          registrationRoot,
          currentDate,
          userPayload,
          zkPoints_
        );
        
        result = result_transaction;
        done = true;
      } else if (authMethod === 'firma-digital') {

        // The order of the public data in the credential is the following
        // 0 - PublicKeyHash (Goverment public key hash)
        // 1 - Nullifier
        // 2 - Reveal Age above 18
        // 3 - NullifierSeed
        // 4 - SignalHash
        // const nullifierSeed = voteContract.voteScope();
        const verifiableCredentialJSON = JSON.parse(verifiableCredential);

        const nullifierSeed = verifiableCredentialJSON.proof.signatureValue.public[3];
        const nullifier = verifiableCredentialJSON.proof.signatureValue.public[1];
        // Signal used when generating proof
        const signal = BigInt(userId).toString();
        // For the moment this is assumed always the case that age > 18
        const revealArray = [verifiableCredentialJSON.proof.signatureValue.public[2]];
        // Get proof from credential
        const proof = verifiableCredentialJSON.proof.signatureValue.proof;
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
      }
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
    const getRootUrl = `${process.env.REACT_APP_AUTH_SERVER_URL || 'https://app.sakundi.io'}/signed-root`;
    const res = await fetch(`${getRootUrl}/${root}`);
    const data = await res.json();

    return {
      // Signature of root state signed by relayer private key.
      signature: data.signature,
      // Time when the event was caught, a.k.a state transition timestamp
      timestamp: data.timestamp,
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

      // Parse the ZK proof from verifiableCredential
      const zkProof = JSON.parse(proof);

      const { args } = await buildTreeArguments(zkProof);

      const [root, timestamp, signature] = args;

      console.log("Update the Root");
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