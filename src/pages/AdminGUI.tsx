import '../i18n';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import QuestionForm from '../components/Voting/QuestionForm';
import { useWallet } from "../contexts/WalletContext";
import './styles.css';

const AdminGUI: React.FC = () => {
  const { isConnected, connect, error: walletError } = useWallet();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header />
      <main style={{
        flex: "1 0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem"
      }}>
        <h1 className="card-title">Voting System - Create a custom proposal</h1>
        
        <div className="container" style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          height: "50vh",
          width: "100%",
          maxWidth: "800px",
        }}>
          {!isConnected ? (
            <div style={{textAlign: 'center'}}>
              <p className="card-subtitle">Please connect your wallet to create a proposal</p>
              <button
                onClick={connect}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  backgroundColor: "#007BFF",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "5px",
                  marginTop: "20px"
                }}
              >
                Connect Wallet
              </button>
              {walletError && (
                <p style={{ color: 'red', marginTop: '10px' }}>{walletError}</p>
              )}
            </div>
          ) : (
            <QuestionForm />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AdminGUI;