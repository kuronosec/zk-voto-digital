import { FileSignature } from 'lucide-react';
import { WalletConnect } from './WalletConnect';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileSignature className="w-8 h-8" />
          <span className="text-xl font-bold">ZK Firma Digital</span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="hover:text-purple-200 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-purple-200 transition-colors">How it Works</a>
{/*           <a href="#benefits" className="hover:text-purple-200 transition-colors">Benefits</a> */}
        </div>
        <WalletConnect />
      </nav>
    </header>
  );
}