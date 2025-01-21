/* eslint-disable react-hooks/exhaustive-deps */
import { getTotalVotes } from "@/utils";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "./_app";
import { Loader } from "@/components/Loader";
import { icons } from "@/styles/illustrations";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAnonAadhaar } from "@anon-aadhaar/react";

const getBarHeight = (percentage: number) => {
  return `${percentage}%`;
};

type Rating = {
  rating: number;
  percentage: number;
};

export default function Results() {
  const [voteBreakdown, setVoteBreakdown] = useState<Rating[] | null>(null);
  const { isTestMode } = useContext(AppContext);
  const router = useRouter();
  const [, startReq] = useAnonAadhaar();

  const blob = new Blob([icons.leftArrow], { type: "image/svg+xml" });
  const leftArrow = useMemo(() => URL.createObjectURL(blob), [icons.leftArrow]);

  useEffect(() => {
    getTotalVotes(isTestMode).then((totalVotes) => {
      setVoteBreakdown(totalVotes);
    });
  }, [isTestMode]);

  const onStartAgain = () => {
    startReq({ type: "logout" });
    router.push("/");
  };

  return (
    <main className="flex flex-col min-h-[75vh] mx-auto justify-around items-center w-full p-4">
      <div className="max-w-4xl w-full">
        <h2 className="text-[90px] font-rajdhani text-center font-medium leading-none">
          VOTING RESULTS
        </h2>
      </div>
      <div className="flex justify-center items-end space-x-4 w-full max-w-4xl p-4">
        {voteBreakdown ? (
          voteBreakdown.map((data) => (
            <div
              className="flex flex-col font-rajdhani font-medium items-center"
              key={data.rating}
            >
              <div className="w-24 h-48 flex flex-col-reverse relative">
                <div className="w-full h-full bg-[#FFF9ED] flex flex-col-reverse">
                  <div
                    style={{ height: getBarHeight(data.percentage) }}
                    className="bg-[#FD8B0E]"
                  ></div>
                  <div className="absolute inset-0 flex justify-center items-start pt-1">
                    <span className="text-black font-bold">{data.rating}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center text-gray-500">
                {data.percentage}%
              </div>
            </div>
          ))
        ) : (
          <Loader />
        )}
      </div>
      <p className="font-lg">
        If you try to vote again with the same QR Code, you won’t be able to do
        so because of your{" "}
        <a
          target={"_blank"}
          rel={"noreferrer"}
          href="https://documentation.anon-aadhaar.pse.dev/docs/nullifiers"
          className="underline"
        >
          nullifier
        </a>
        <div
          onClick={() => onStartAgain()}
          className="flex flex-row justify-center gap-2 mt-5 hover:underline cursor-pointer"
        >
          <Image alt="left arrow" src={leftArrow} height={16} width={16} />
          <p className="text-[#535665] font-rajdhani font-semibold">
            START AGAIN
          </p>
        </div>
      </p>
    </main>
  );
}
