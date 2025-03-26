import { useState } from "react";
import { Button } from "rimble-ui";
import { useTranslation } from 'react-i18next';
import '../../i18n';

import { FileUploader } from '../FileUploader/FileUploader';
import { ValidationStatus } from '../ValidationStatus';
import { verifyProof } from '../../utils/verifyProof';
import { endpointUrl } from '../../constants';
import { Header } from "../Header";
import { Footer } from "../Footer";

export const ZkSign = () => {
  const { t } = useTranslation();
  const [proof, setProof] = useState(null);
  const [signals, setSignals] = useState(null);
  const [done, setDone] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFileUpload = (newProof: any, newSignals: any) => {
    setProof(newProof);
    setSignals(newSignals);
    setDone(null); // Reset validation status when new file is uploaded
    setIsValid(false);
  };

  const runProofs = async () => {
    if (!proof || !signals) {
      setError("Please upload a credential file first");
      return;
    }
    
    setIsVerifying(true);
    setError("");
    
    try {
      const _isValid = await verifyProof(endpointUrl, signals, proof);
      setIsValid(_isValid);
      setDone(proof);
      
      if (_isValid) {
        console.log("Valid credentials");
      } else {
        console.log("Invalid credentials");
        setDone("error");
      }
    } catch (error) {
      setIsValid(false);
      setError('Error in validation: ' + error);
      console.log('Error in validation: ' + error);
    } finally {
      setIsVerifying(false);
    }
  };

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
        padding: "40px 20px 80px",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <div style={{
          maxWidth: "800px",
          width: "100%",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          overflow: "hidden"
        }}>
          <div style={{
            backgroundColor: "#5856D6",
            padding: "20px 15px",
            color: "white"
          }}>
            <h1 style={{
              fontSize: "clamp(1.25rem, 5vw, 1.75rem)",
              fontWeight: "600",
              margin: "0"
            }}>{t('common.identityVerification')}</h1>
          </div>
          
          <div style={{
            padding: "20px 15px",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <div style={{
              marginBottom: "30px"
            }}>
              <h2 style={{
                fontSize: "clamp(1.1rem, 4vw, 1.4rem)",
                color: "#333",
                marginBottom: "16px",
                fontWeight: "500"
              }}>{t('credential.title')}</h2>
              
              <p style={{
                color: "#666",
                lineHeight: "1.6",
                marginBottom: "24px",
                fontSize: "clamp(0.9rem, 3vw, 1rem)"
              }}>
                {t('credential.description')}
              </p>
              
              <div style={{
                backgroundColor: "#f0f4ff",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "24px",
                border: "1px solid #e2e8f0",
                width: "100%",
                boxSizing: "border-box"
              }}>
                <h3 style={{
                  fontSize: "clamp(0.9rem, 3vw, 1rem)",
                  color: "#4a5568",
                  marginBottom: "12px",
                  fontWeight: "500"
                }}>{t('credential.requirements.title')}</h3>
                <ul style={{
                  color: "#4a5568",
                  marginBottom: "0",
                  paddingLeft: "20px",
                  fontSize: "clamp(0.85rem, 2.8vw, 0.95rem)"
                }}>
                  <li style={{ marginBottom: "8px" }}>
                   {t('credential.requirements.item1')}
                  </li>
                  <li style={{ marginBottom: "8px" }}>
                   {t('credential.requirements.item2')}
                  </li>
                  <li style={{ marginBottom: "8px" }}>
                   {t('credential.requirements.item3')}
                  </li>
                  <li>
                   {t('credential.requirements.item4')}
                  </li>
                </ul>
              </div>
              
              <div style={{
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "24px",
                border: "1px solid #e2e8f0",
                width: "100%",
                boxSizing: "border-box",
                overflowX: "auto"
              }}>
                <FileUploader onFileUpload={handleFileUpload} onError={setError} />
                
                {error && (
                  <div style={{
                    backgroundColor: "#fff5f5",
                    color: "#e53e3e",
                    border: "1px solid #fed7d7",
                    borderRadius: "6px",
                    padding: "12px",
                    marginTop: "16px",
                    wordBreak: "break-word"
                  }}>
                    <p style={{ margin: "0" }}>{error}</p>
                  </div>
                )}
              </div>
              
              <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "24px"
              }}>
                <button
                  onClick={runProofs}
                  disabled={isVerifying || !proof || !signals}
                  style={{
                    backgroundColor: "#5856D6",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "6px",
                    fontSize: "clamp(0.9rem, 3vw, 1rem)",
                    fontWeight: "500",
                    cursor: isVerifying || !proof || !signals ? "not-allowed" : "pointer",
                    opacity: isVerifying || !proof || !signals ? "0.7" : "1",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "nowrap"
                  }}
                >
                  {isVerifying ? (
                    <>
                      <div style={{
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        width: "16px",
                        height: "16px",
                        animation: "spin 1s linear infinite",
                        marginRight: "8px"
                      }}></div>
                      <style>{`
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      `}</style>
                      Verifying...
                    </>
                  ) : (
                    "Validate Credential"
                  )}
                </button>
              </div>
              
              <div style={{
                marginTop: "20px",
                width: "100%"
              }}>
                <ValidationStatus isValid={isValid} done={done} />
              </div>
            </div>
            
            <div style={{
              borderTop: "1px solid #edf2f7",
              paddingTop: "20px",
              marginTop: "30px"
            }}>
              <h3 style={{
                fontSize: "clamp(1rem, 3.5vw, 1.1rem)",
                color: "#4a5568",
                marginBottom: "16px"
              }}>{t('requestFirmaFile.zkpInfo.description1')}</h3>
              <p style={{
                color: "#718096",
                fontSize: "clamp(0.85rem, 2.8vw, 0.95rem)",
                lineHeight: "1.6"
              }}>
                {t('requestFirmaFile.zkpInfo.description2')}
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}