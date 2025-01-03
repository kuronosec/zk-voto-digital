import './styles.css';

export const Header = () => {
  return (
    <header className="header">
      <nav className="nav-container">
        <div className="brand">
          {/* <FileSignature className="w-8 h-8" /> */}
          <span>ZK Firma Digital</span>
        </div>
        <div className="nav-links md">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#example">Example</a>
          {/* <a href="#benefits">Benefits</a> */}
        </div>
        {/* <WalletConnect /> */}
      </nav>
    </header>
  );
};
