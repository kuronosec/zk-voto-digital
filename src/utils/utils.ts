import { ethers } from "ethers";
import votingAbi from "../public/ZKFirmaDigitalVote.json";
import { RPC_URL } from "../constants/networks";
import { voteContractAddress } from "../constants/voteContract";

const checkMetaMaskStatus = async () => {
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (accounts.length === 0) {
      console.log("MetaMask is locked or no accounts are connected.");
      return false;
  }
  console.log("MetaMask is unlocked and accounts are connected.");
  return true;
};

const providerUrl = RPC_URL;

export const getTotalVotes = async (useTestZKFirmaDigital: boolean): Promise<any> => {
  void useTestZKFirmaDigital;
  const voteBreakdown = [
    { rating: 0, percentage: 0 },
    { rating: 1, percentage: 0 },
    { rating: 2, percentage: 0 },
    { rating: 3, percentage: 0 },
    { rating: 4, percentage: 0 },
    { rating: 5, percentage: 0 },
  ];

  const provider = ethers.getDefaultProvider(providerUrl);
  const voteContract = new ethers.Contract(voteContractAddress, votingAbi.abi, provider);

  const proposalCount = await voteContract.getProposalCount();

  // Initialize a variable to store the total vote count
  let totalVoteCount = 0;

  // Iterate through the proposals and sum their vote counts
  for (let i = 0; i < proposalCount; i++) {
    const voteCount = await voteContract.getProposal(i);
    totalVoteCount += Number(voteCount[1]);
  }

  await Promise.all(
    voteBreakdown.map(async (rating) => {
      const voteCount = await voteContract.getProposal(rating.rating);
      const percentage = Math.floor(
        (Number(voteCount[1]) / totalVoteCount) * 100
      );
      rating.percentage = percentage;
    })
  );

  return voteBreakdown;
};

export const hasVoted = async (
  userNullifier: string,
  useTestZKFirmaDigital: boolean
): Promise<boolean> => {
  void useTestZKFirmaDigital;
  const provider = ethers.getDefaultProvider(providerUrl);
  const voteContract = new ethers.Contract(voteContractAddress, votingAbi.abi, provider);

  return await voteContract.checkVoted(userNullifier);
};

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
