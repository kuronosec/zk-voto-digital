import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createProposal } from "../../hooks/CreateProposal";

function QuestionForm() {
  const { t } = useTranslation();
  
  // State for the question text
  const [question, setQuestion] = useState("");
  // State for the possible options; start with one empty option field
  const [options, setOptions] = useState([""]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<boolean | null>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update question state
  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  // Update a specific option
  const handleoptionChange = (index, e) => {
    const newoptions = [...options];
    newoptions[index] = e.target.value;
    setOptions(newoptions);
  };

  // Add a new empty option field
  const addOptionField = () => {
    setOptions([...options, ""]);
  };

  // Remove an option field at a specific index
  const removeoptionField = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    // You can process your question and options here
    console.log("Question:", question);
    console.log("Options:", options);
    try {
      const { _result, _error, _done } = await createProposal(question, options);
      setResult(_result);
      setDone(_done);
      setError(_error);
      console.log("Result: ", result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('questionForm.messages.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formStyles = {
    formGroup: {
      marginBottom: "24px"
    },
    label: {
      display: "block",
      fontSize: "1rem",
      fontWeight: "500",
      marginBottom: "8px",
      color: "#4a5568"
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      fontSize: "1rem",
      borderRadius: "6px",
      border: "1px solid #e2e8f0",
      transition: "border-color 0.2s",
      outline: "none"
    },
    optionContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: "12px",
      gap: "10px"
    },
    buttonSecondary: {
      backgroundColor: "#f8f9fa",
      border: "1px solid #e2e8f0",
      color: "#4a5568",
      padding: "8px 16px",
      borderRadius: "6px",
      fontSize: "0.9rem",
      cursor: "pointer",
      transition: "all 0.2s"
    },
    buttonPrimary: {
      backgroundColor: "#5856D6",
      color: "white",
      border: "none",
      padding: "12px 24px",
      borderRadius: "6px",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "background-color 0.2s"
    },
    buttonRemove: {
      backgroundColor: "#fee2e2",
      border: "none",
      color: "#e53e3e",
      padding: "8px 12px",
      borderRadius: "6px",
      fontSize: "0.9rem",
      cursor: "pointer",
      transition: "all 0.2s"
    },
    success: {
      backgroundColor: "#f0fff4",
      color: "#38a169",
      border: "1px solid #c6f6d5",
      borderRadius: "6px",
      padding: "16px",
      marginTop: "20px"
    },
    error: {
      backgroundColor: "#fff5f5",
      color: "#e53e3e",
      border: "1px solid #fed7d7",
      borderRadius: "6px",
      padding: "16px",
      marginTop: "20px"
    }
  };

  return (
    <div>
      <p style={{
        color: "#4a5568",
        marginBottom: "24px",
        fontSize: "1.1rem",
        lineHeight: "1.6"
      }}>
        {t('questionForm.intro')}
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={formStyles.formGroup}>
          <label style={formStyles.label}>{t('questionForm.question.label')}</label>
          <input
            type="text"
            value={question}
            onChange={handleQuestionChange}
            placeholder={t('questionForm.question.placeholder')}
            required
            style={formStyles.input}
          />
          <p style={{
            fontSize: "0.9rem",
            color: "#718096",
            marginTop: "8px"
          }}>
            {t('questionForm.question.help')}
          </p>
        </div>
        
        <div style={formStyles.formGroup}>
          <label style={formStyles.label}>{t('questionForm.options.label')}</label>
          
          <div style={{
            backgroundColor: "#f8fafc",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "16px"
          }}>
            {options.map((option, index) => (
              <div key={index} style={formStyles.optionContainer}>
                <div style={{
                  backgroundColor: "#5856D6",
                  color: "white",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                  fontWeight: "bold"
                }}>
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleoptionChange(index, e)}
                  placeholder={t('questionForm.options.placeholder', { number: index + 1 })}
                  required
                  style={{
                    ...formStyles.input,
                    flex: "1"
                  }}
                />
                {options.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeoptionField(index)}
                    style={formStyles.buttonRemove}
                  >
                    {t('questionForm.options.remove')}
                  </button>
                )}
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addOptionField}
              style={{
                ...formStyles.buttonSecondary,
                marginTop: "10px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <span style={{ marginRight: "8px" }}>+</span> {t('questionForm.options.add')}
            </button>
          </div>
          
          {error && (
            <div style={formStyles.error}>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}
          
          {done && (
            <div style={formStyles.success}>
              <p style={{ margin: 0 }}>{t('questionForm.messages.success')}</p>
            </div>
          )}
        </div>
        
        <div style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <button 
            type="submit" 
            style={{
              ...formStyles.buttonPrimary,
              opacity: isSubmitting ? "0.7" : "1",
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('questionForm.submit.submitting') : t('questionForm.submit.button')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuestionForm;