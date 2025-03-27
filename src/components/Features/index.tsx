import React from 'react';
import { useTranslation } from 'react-i18next';

export const Features = () => {
  const { t } = useTranslation();
  
  // Obtenemos los items de las características desde las traducciones
  const features = [
    {
      title: t('features.items.0.title'),
      description: t('features.items.0.description'),
      icon: t('features.items.0.icon')
    },
    {
      title: t('features.items.1.title'),
      description: t('features.items.1.description'),
      icon: t('features.items.1.icon')
    },
    {
      title: t('features.items.2.title'),
      description: t('features.items.2.description'),
      icon: t('features.items.2.icon')
    },
    {
      title: t('features.items.3.title'),
      description: t('features.items.3.description'),
      icon: t('features.items.3.icon')
    },
    {
      title: t('features.items.4.title'),
      description: t('features.items.4.description'),
      icon: t('features.items.4.icon')
    },
    {
      title: t('features.items.5.title'),
      description: t('features.items.5.description'),
      icon: t('features.items.5.icon')
    }
  ];

  return (
    <section style={{
      position: "relative",
      marginTop: "-85px",
      padding: "0 20px",
      paddingBottom: "30px",
      zIndex: "10",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        background: "white",
        padding: "1.5rem",
        borderRadius: "20px",
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"
      }}>
        <h2 style={{
          fontSize: "2rem",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "40px",
          color: "#333"
        }}>{t('features.title')}</h2>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          justifyContent: "center"
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              backgroundColor: "#E5E5E5",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              display: "flex",
              flexDirection: "column",
              height: "100%"
            }}>
              <div style={{
                fontSize: "2.5rem",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#f0f0f7",
                color: "#5856D6"
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#333"
              }}>{feature.title}</h3>
              <p style={{
                fontSize: "1rem",
                color: "#666",
                lineHeight: "1.5",
                flex: "1"
              }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
