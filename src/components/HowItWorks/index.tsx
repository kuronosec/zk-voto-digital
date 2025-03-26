import React from 'react';
import { useTranslation } from 'react-i18next';

export const HowItWorks = () => {
  const { t } = useTranslation();
  
  // Obtenemos los pasos desde las traducciones
  const steps = [
    {
      number: t('howItWorks.steps.0.number'),
      title: t('howItWorks.steps.0.title'),
      description: t('howItWorks.steps.0.description'),
    },
    {
      number: t('howItWorks.steps.1.number'),
      title: t('howItWorks.steps.1.title'),
      description: t('howItWorks.steps.1.description'),
    },
    {
      number: t('howItWorks.steps.2.number'),
      title: t('howItWorks.steps.2.title'),
      description: t('howItWorks.steps.2.description'),
    },
    {
      number: t('howItWorks.steps.3.number'),
      title: t('howItWorks.steps.3.title'),
      description: t('howItWorks.steps.3.description'),
    },
  ];

  return (
    <section id="how-it-works" style={{
      padding: "80px 20px",
      backgroundColor: "#f8f9fa"
    }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        <h2 style={{
          fontSize: "2rem",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "60px",
          color: "#333"
        }}>{t('howItWorks.title')}</h2>
        
        <div style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          alignItems: "center"
        }}>
          {steps.map((step, index) => (
            <div key={index} style={{
              display: "flex",
              width: "100%",
              marginBottom: index < steps.length - 1 ? "60px" : "0",
              position: "relative",
              alignItems: "flex-start"
            }}>
              <div style={{
                backgroundColor: "#5856D6",
                color: "white",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontWeight: "700",
                flexShrink: 0,
                marginRight: "30px",
                zIndex: "2"
              }}>
                {step.number}
              </div>
              
              <div style={{
                flex: "1",
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                border: "1px solid #eaeaea"
              }}>
                <h3 style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  marginBottom: "12px",
                  color: "#333"
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: "1rem",
                  color: "#666",
                  lineHeight: "1.6",
                  margin: "0"
                }}>
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div style={{
                  position: "absolute",
                  left: "30px",
                  top: "60px",
                  height: "60px",
                  zIndex: "1"
                }}>
                  <div style={{
                    width: "2px",
                    height: "100%",
                    backgroundColor: "#c0c6ff",
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)"
                  }}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};