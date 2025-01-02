import React from 'react';
import { Shield, Lock, FileSignature } from 'lucide-react';

export function Hero() {
  return (
    <div className="bg-gradient-to-b from-purple-800 to-indigo-900 text-white py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Secure Digital Signatures with Zero-Knowledge Proofs
          </h1>
          <p className="text-xl mb-8 text-purple-100">
            Sign documents securely while maintaining privacy using zero-knowledge proofs.
            The future of digital signatures is here.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold hover:bg-purple-100 transition-colors">
              Get Started
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}