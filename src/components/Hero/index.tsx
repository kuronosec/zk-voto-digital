import './styles.css';

export const Hero = () => {
  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Secure Digital Signatures with Zero-Knowledge Proofs
          </h1>
          <p className="hero-description">
            Sign documents securely while maintaining privacy using zero-knowledge proofs.
            The future of digital signatures is here.
          </p>
          <div className="hero-buttons">
            <button className="hero-button-primary">Get Started</button>
            <button className="hero-button-secondary">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
};
