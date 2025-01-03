import "./styles.css"; // Importa el archivo de estilos CSS

export const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Upload Document",
      description: "Upload the document you want to sign securely to our platform",
    },
    {
      number: "02",
      title: "Generate Proof",
      description: "Our system generates a zero-knowledge proof of your signature",
    },
    {
      number: "03",
      title: "Sign Document",
      description: "Digitally sign the document while maintaining privacy",
    },
    {
      number: "04",
      title: "Verify Signature",
      description: "Anyone can verify the signature without accessing private data",
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <h2 className="heading">How It Works</h2>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="step-line">
                  <div className="line"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
