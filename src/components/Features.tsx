import React from 'react';
import { Shield, Lock, FileSignature, UserCheck, Clock, Globe } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: <Shield className="w-12 h-12 text-purple-600" />,
      title: "Zero-Knowledge Proofs",
      description: "Sign documents while maintaining complete privacy of sensitive information"
    },
    {
      icon: <Lock className="w-12 h-12 text-purple-600" />,
      title: "Secure Verification",
      description: "Cryptographically secure verification without revealing private data"
    },
    {
      icon: <UserCheck className="w-12 h-12 text-purple-600" />,
      title: "Easy Integration",
      description: "Simple API integration with existing systems and workflows"
    },
    {
      icon: <Clock className="w-12 h-12 text-purple-600" />,
      title: "Instant Verification",
      description: "Real-time verification of signatures and documents"
    },
    {
      icon: <Globe className="w-12 h-12 text-purple-600" />,
      title: "Global Compliance",
      description: "Meets international digital signature standards and regulations"
    },
    {
      icon: <FileSignature className="w-12 h-12 text-purple-600" />,
      title: "Multiple Formats",
      description: "Support for various document formats and signature types"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}