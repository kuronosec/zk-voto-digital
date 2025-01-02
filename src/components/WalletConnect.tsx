import React from 'react';
import { Wallet } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { WalletMenu } from './WalletMenu';

export function WalletConnect() {
  const { isConnected, address, connectWallet } = useWallet();

  if (isConnected && address) {
    return <WalletMenu />;
  }

  return (
    <button
      onClick={connectWallet}
      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
    >
      <Wallet className="w-5 h-5" />
      <span>Connect Wallet</span>
    </button>
  );
}