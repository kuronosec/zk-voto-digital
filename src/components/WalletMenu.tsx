import React, { useRef, useState } from 'react';
import { LogOut, Copy, ExternalLink } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { shortenAddress } from '../utils/address';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

export function WalletMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { address, chainId, disconnectWallet } = useWallet();

  useOnClickOutside(menuRef, () => setIsOpen(false));

  // Guard clause - if no address, don't render the menu
  if (!address) {
    return null;
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    alert('Address copied to clipboard!');
  };

  const openEtherscan = () => {
    const baseUrl = chainId === 1 ? 'https://etherscan.io' : 'https://sepolia.etherscan.io';
    window.open(`${baseUrl}/address/${address}`, '_blank');
  };

  const shortAddress = shortenAddress(address);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
      >
        <span>{shortAddress}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl text-gray-800 z-50">
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Connected Address</p>
              <div className="flex items-center justify-between mt-1">
                <p className="font-mono text-sm">{shortAddress}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={copyAddress}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={openEtherscan}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Network</p>
              <p className="mt-1 font-medium">
                {chainId === 1 ? 'Ethereum Mainnet' : chainId === 11155111 ? 'Sepolia Testnet' : `Chain ID: ${chainId}`}
              </p>
            </div>

            <button
              onClick={() => {
                disconnectWallet();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}