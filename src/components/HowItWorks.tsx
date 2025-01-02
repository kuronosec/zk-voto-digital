import React from 'react';

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Document",
      description: "Upload the document you want to sign securely to our platform"
    },
    {
      number: "02",
      title: "Generate Proof",
      description: "Our system generates a zero-knowledge proof of your signature"
    },
    {
      number: "03",
      title: "Sign Document",
      description: "Digitally sign the document while maintaining privacy"
    },
    {
      number: "04",
      title: "Verify Signature",
      description: "Anyone can verify the signature without accessing private data"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-purple-200 mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 right-0 transform translate-x-1/2">
                  <div className="w-8 h-0.5 bg-purple-200"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}