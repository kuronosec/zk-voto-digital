/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useContext } from "react";
import { Ratings } from "../components/Voting/Ratings";
import { Loader } from "../components/Voting/Loader";

import { useAccount } from "wagmi";
import ZKFirmaDigitalVote from "../public/ZKFirmaDigitalVote.json";
import { hasVoted } from "../utils";
import { writeContract } from "@wagmi/core";
import { wagmiConfig } from "../config";

export default function VotePage() {
  const { isTestMode, setVoted } = useState(null);
  const { isConnected, address } = useAccount();
  const [rating, setRating] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const sendVote = async (
    _rating: string,
    _ZKFirmaDigital: ZKFirmaDigital
  ) => {
    const packedGroth16Proof = packGroth16Proof(
      _ZKFirmaDigital.proof.groth16Proof
    );
    setIsLoading(true);
    try {
      const voteTx = await writeContract(wagmiConfig, {
        abi: ZKFirmaDigitalVote.abi,
        address: `0x${
          isTestMode
            ? process.env.NEXT_PUBLIC_VOTE_CONTRACT_ADDRESS_TEST
            : process.env.NEXT_PUBLIC_VOTE_CONTRACT_ADDRESS_PROD
        }`,
        functionName: "voteForProposal",
        args: [
          _rating,
          _ZKFirmaDigital.proof.nullifierSeed,
          _ZKFirmaDigital.proof.nullifier,
          _ZKFirmaDigital.proof.timestamp,
          address,
          [
            _ZKFirmaDigital.proof.ageAbove18,
          ],
          packedGroth16Proof,
        ],
      });
      setIsLoading(false);
      setIsSuccess(true);
      console.log("Vote transaction: ", voteTx);
    } catch (e) {
      setIsLoading(false);
      console.log(e);
    }
  };

  useEffect(() => {
    // To do: fix the hook in the react lib
    const aaObj = localStorage.getItem("anonAadhaar");
    const anonAadhaarProofs = JSON.parse(aaObj!).anonAadhaarProofs;

    deserialize(
      anonAadhaarProofs[Object.keys(anonAadhaarProofs).length - 1].pcd
    ).then((result) => {
      console.log(result);
      setZKFirmaDigital(result);
    });
  }, [anonAadhaar, latestProof]);

  useEffect(() => {
    ZKFirmaDigital?.proof.nullifier
      ? hasVoted(ZKFirmaDigital?.proof.nullifier, isTestMode).then(
          (response) => {
            if (response) router.push("/results");
            setVoted(response);
          }
        )
      : null;
  }, [isTestMode, router, setVoted, ZKFirmaDigital]);

  useEffect(() => {
    if (isSuccess) router.push("./results");
  }, [router, isSuccess]);

  return (
    <>
      <main className="flex flex-col min-h-[75vh] mx-auto justify-center items-center w-full p-4">
        <div className="max-w-4xl w-full">
          <h2 className="text-[90px] font-rajdhani font-medium leading-none">
            CAST YOUR VOTE
          </h2>
          <div className="text-md mt-4 mb-8 text-[#717686]">
            Next, you have the option to cast your vote alongside your Anon
            Adhaar proof, using your connected ETH address. Your vote will be
            paired with your proof, and the smart contract will initially verify
            your proof before processing your vote.
          </div>

          <div className="flex flex-col gap-5">
            <div className="text-sm sm:text-lg font-medium font-rajdhani">
              {"On a scale of 0 to 5, how likely are you to recommend this hack?".toUpperCase()}
            </div>
            <Ratings setRating={setRating} />

            <div>
              {isConnected ? (
                isLoading ? (
                  <Loader />
                ) : (
                  <button
                    disabled={
                      rating === undefined || ZKFirmaDigital === undefined
                    }
                    type="button"
                    className="inline-block mt-5 bg-[#009A08] rounded-lg text-white px-14 py-1 border-2 border-[#009A08] font-rajdhani font-medium"
                    onClick={() => {
                      if (rating !== undefined && ZKFirmaDigital !== undefined)
                        sendVote(rating, ZKFirmaDigital);
                    }}
                  >
                    VOTE
                  </button>
                )
              ) : (
                <button
                  disabled={true}
                  type="button"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                >
                  You need to connect your wallet first ⬆️
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
