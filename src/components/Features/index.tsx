import './styles.css';

export const Features = () => {
  const features = [
    {
      title: "Zero-Knowledge Proofs",
      description: "Sign documents while maintaining complete privacy of sensitive information"
    },
    {
      title: "Secure Verification",
      description: "Cryptographically secure verification without revealing private data"
    },
    {
      title: "Easy Integration",
      description: "Simple API integration with existing systems and workflows"
    },
    {
      title: "Instant Verification",
      description: "Real-time verification of signatures and documents"
    },
    {
      title: "Global Compliance",
      description: "Meets international digital signature standards and regulations"
    },
    {
      title: "Multiple Formats",
      description: "Support for various document formats and signature types"
    }
  ];

  return (
    <section id="features" className="features-section">
      <div className="features-container">
        <h2 className="features-title">Key Features</h2>
        <div className="features-grid md lg">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
