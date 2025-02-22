import React, { createContext, useState, ReactNode, useContext } from "react";

type VoteContextType = {
  verifiableCredential: Record<string, any> | null;
  setVerifiableCredential: (vc: Record<string, any> | null) => void;
  voteScope: number | null;
  setVoteScope: (index: number | null) => void;
};

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [verifiableCredential, setVerifiableCredential] = useState<Record<string, any> | null>(null);
  const [voteScope, setVoteScope] = useState<number | null>(null);

  return (
    <VoteContext.Provider value={{
        verifiableCredential,
        setVerifiableCredential,
        voteScope,
        setVoteScope}}>
      {children}
    </VoteContext.Provider>
  );
};

// Custom hook for using the context
export const useVote = () => {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error("useVote must be used within a VoteProvider");
  }
  return context;
};
