/* eslint-disable react-hooks/exhaustive-deps */
import { FunctionComponent, useMemo } from "react";
import Image from "next/image";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { icons } from "../styles/illustrations";
import { shortenAddress } from "@/utils";

export const Header: FunctionComponent = () => {
  const { isConnected, address } = useAccount();
  const blob = new Blob([icons.aalogo], { type: "image/svg+xml" });
  const aaLogo = useMemo(() => URL.createObjectURL(blob), [icons.aalogo]);
  const { open } = useWeb3Modal();

  return (
    <header className="flex flex-row justify-between">
      <div className="flex flex-row items-center mx-5">
        <Image
          priority
          src={aaLogo}
          width={40}
          height={40}
          alt="Follow us on Twitter"
        />
      </div>
      <div className="flex flex-row gap-3 items-center justify-end">
        <div className="flex m-5 items-center space-x-2">
          {isConnected ? (
            <button
              className="bg-[#EDFFED] rounded-lg text-[#009A08] px-6 py-1 border-2 border-[#009A08] font-rajdhani font-medium"
              onClick={() => open()}
            >
              {address && shortenAddress(address)}
            </button>
          ) : (
            <button
              className="bg-[#009A08] rounded-lg text-white px-6 py-1 font-rajdhani font-medium"
              onClick={() => open()}
            >
              CONNECT WALLET
            </button>
          )}
          {/* {isConnected && <Web3NetworkSwitch />} */}
        </div>
      </div>
    </header>
  );
};
