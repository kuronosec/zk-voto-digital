import './styles.css';

export const Header = () => {
  return (
    <header className="header">
      <nav className="nav-container">
        <div className="brand">
          <a href="/">
            <span>ZK Firma Digital</span>
          </a>
        </div>
        <div className="nav-links md">
          <a href="/#features">Features</a>
          <a href="/#how-it-works">How it Works</a>
          <a href="/vote">Digital Vote</a>
          <a href="/create-proposal">Create Proposal</a>
          <a href="/results">See Voting Results</a>
        </div>
        {/* <WalletConnect /> */}
      </nav>
    </header>
  );
};
