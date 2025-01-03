import './styles.css';

export const Features = () => {
  const features = [
    {
      title: "Secure Verification",
      description: "Cryptographically secure verification without revealing private data"
    },
    {
      title: "Proof of Humanity",
      description: "Show that you are not a bot, something critical in the AI era"
    },
    {
      title: "Verify Age",
      description: "Prove that you are older than 18 years without sending your sensitive identity"
    },
    {
      title: "Vote Anonymously and Safely",
      description: "Participate in voting campaigns in an anonymous way while demostrating your participation rights"
    },
    {
      title: "Easy Integration",
      description: "Simple API integration with existing systems and workflows"
    },
    {
      title: "Instant Verification",
      description: "Real-time verification of signatures and documents"
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
