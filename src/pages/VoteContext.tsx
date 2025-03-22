import React, { createContext, useContext, useState } from 'react';

interface VoteContextType {
  verifiableCredential: Record<string, any> | null;
  setVerifiableCredential: (vc: Record<string, any> | null) => void;
  voteScope: number | null;
  setVoteScope: (index: number | null) => void;
};

const VoteContext = createContext<VoteContextType | null>(null);

export const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [verifiableCredential, setVerifiableCredential] = useState<Record<string, any> | null>(null);
  const [voteScope, setVoteScope] = useState<number | null>(null);

  const value = {
    verifiableCredential,
    setVerifiableCredential,
    voteScope,
    setVoteScope
};

  return (
    <VoteContext.Provider value={value}>
      {children}
    </VoteContext.Provider>
  );
};

export const useVote = () => {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error('useVote must be used within a VoteProvider');
  }
  return context;
};
