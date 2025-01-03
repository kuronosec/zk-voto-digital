import './styles.css';

export const Hero = () => {
  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Zero-knowledge proofs for government-provided user identity
          </h1>
          <p className="hero-description">
            ZK Firma Digital strengthens citizen privacy by minimizing data collection,
            enabling individuals to access a wide range of valuable services
            without disclosing sensitive information while proving their
            identity in an anonymous fashion
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
