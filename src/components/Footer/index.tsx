import React from 'react';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      backgroundColor: "#1F2026",
      color: "white",
      padding: "40px 20px",
      width: "100%"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <h2 style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            marginBottom: "10px"
          }}>
            {t('footer.title')}
          </h2>
          <p style={{
            fontSize: "1rem",
            opacity: "0.8",
            textAlign: "center",
            maxWidth: "600px",
            marginBottom: "20px"
          }}>
            {t('footer.description')}
          </p>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px"
        }}>
          <a 
            href="https://github.com/kuronosec/zk-voto-digital" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              textDecoration: "none",
              transition: "opacity 0.2s ease",
              opacity: "0.9"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "0.9"}
          >
            {/* GitHub icon SVG */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginRight: "8px" }}
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            {t('footer.github')}
          </a>
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px"
        }}>
          <a href="/" style={{ color: "white", textDecoration: "none", opacity: "0.8", transition: "opacity 0.2s ease" }}
             onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
             onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"}
          >
            {t('footer.links.home')}
          </a>
          <a href="/#how-it-works" style={{ color: "white", textDecoration: "none", opacity: "0.8", transition: "opacity 0.2s ease" }}
             onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
             onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"}
          >
            {t('footer.links.howItWorks')}
          </a>
          <a href="/try-it" style={{ color: "white", textDecoration: "none", opacity: "0.8", transition: "opacity 0.2s ease" }}
             onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
             onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"}
          >
            {t('footer.links.tryIt')}
          </a>
          <a href="/vote" style={{ color: "white", textDecoration: "none", opacity: "0.8", transition: "opacity 0.2s ease" }}
             onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
             onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"}
          >
            {t('footer.links.vote')}
          </a>
          <a href="https://docs.sakundi.io/es/docs/user-section" style={{ color: "white", textDecoration: "none", opacity: "0.8", transition: "opacity 0.2s ease" }}
             onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
             onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"}
          >
          {t('footer.links.documentation')}
          </a>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "20px",
          width: "100%",
          textAlign: "center",
          fontSize: "0.9rem",
          opacity: "0.6"
        }}>
          <p>{t('footer.copyright', { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
};
