import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { useWallet } from "../context/WalletContext";

type VoteContextType = {
  verifiableCredential: Record<string, any> | null;
  setVerifiableCredential: (vc: Record<string, any> | null) => void;
  voteScope: number | null;
  setVoteScope: (index: number | null) => void;
  hasVoted: boolean;
  setHasVoted: (voted: boolean) => void;
  isLoading: boolean;
};

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [verifiableCredential, setVerifiableCredential] = useState<Record<string, any> | null>(null);
  const [voteScope, setVoteScope] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { isConnected, account } = useWallet();

  useEffect(() => {
    if (!isConnected || !account) {
      setVerifiableCredential(null);
      setHasVoted(false);
      setIsLoading(false);
    }
  }, [isConnected, account]);

  useEffect(() => {
    const checkVoteStatus = async () => {
      if (verifiableCredential && isConnected && account) {
        try {
          setIsLoading(false);
        } catch (error) {
          console.error("Error checking vote status:", error);
          setIsLoading(false);
        }
      }
    };

    checkVoteStatus();
  }, [verifiableCredential, isConnected, account]);

  return (
    <VoteContext.Provider 
      value={{
        verifiableCredential,
        setVerifiableCredential,
        voteScope,
        setVoteScope,
        hasVoted,
        setHasVoted,
        isLoading
      }}
    >
      {children}
    </VoteContext.Provider>
  );
};

export const useVote = () => {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error("useVote must be used within a VoteProvider");
  }
  return context;
};
