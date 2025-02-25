import '../i18n';
import { Header } from "../components/Header";
import QuestionForm from '../components/Voting/QuestionForm';
import { useTranslation } from 'react-i18next';
import './styles.css';

const AdminGUI: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Header />
      <div className="container">
      <h1 className="card-title">Voting System - Create a custom proposal</h1>
      <QuestionForm/>
      </div>
    </div>
  );
}

export default AdminGUI;