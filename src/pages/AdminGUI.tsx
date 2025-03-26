import '../i18n';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import QuestionForm from '../components/Voting/QuestionForm';
import { useTranslation } from 'react-i18next';

const AdminGUI: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header />
      <main style={{
        flex: "1",
        backgroundColor: "#f8f9fa",
        padding: "40px 20px 80px"
      }}>
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          overflow: "hidden"
        }}>
          <div style={{
            backgroundColor: "#5856D6",
            padding: "25px 30px",
            color: "white"
          }}>
            <h1 style={{
              fontSize: "1.75rem",
              fontWeight: "600",
              margin: "0"
            }}>{t('questionForm.options.title')}</h1>
          </div>
          
          <div style={{
            padding: "30px"
          }}>
            <QuestionForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AdminGUI;