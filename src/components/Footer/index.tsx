import "./styles.css"; // Asegúrate de importar los estilos

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="footer-title">ZK Firma Digital</span>
            </div>
            <p className="footer-text">
              Secure digital identities with zero-knowledge proofs
            </p>
          </div>
          <div>
            <h3 className="footer-heading">Product</h3>
            <ul className="footer-list">
              <li><a href="#features" className="footer-link">Features</a></li>
              <li><a href="#how-it-works" className="footer-link">How it Works</a></li>
              <li><a href="#" className="footer-link">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-list">
              <li><a href="#" className="footer-link">About</a></li>
              <li><a href="#" className="footer-link">Blog</a></li>
              <li><a href="#" className="footer-link">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="footer-heading">Connect</h3>
            <div className="footer-icons">
              {/* Enlace de GitHub o redes sociales */}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Sakundi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
