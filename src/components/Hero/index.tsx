import { useTranslation } from 'react-i18next';

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #5F29B9 0%, #7B26A8 50%, #971F8D 100%)",
      padding: "2rem 1rem",
      minHeight: "85vh",
      display: "flex",
      flexDirection: "column",
      width: "100%"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%"
      }}>
        {/* Text Content */}
        <div style={{
          flex: "1",
          color: "white",
          padding: "2rem",
          minWidth: "300px",
          textAlign: "left"
        }}>
          <h1 style={{
            fontSize: "3rem",
            fontWeight: "700",
            marginBottom: "1.5rem",
            lineHeight: "1.2"
          }}>
            {t('hero.title')}
          </h1>
          
          <p style={{
            fontSize: "1.25rem",
            marginBottom: "2rem",
            lineHeight: "1.6"
          }}>
            {t('hero.subtitle')}
          </p>
          
          <p style={{
            fontSize: "1rem",
            marginBottom: "2rem",
            lineHeight: "1.6",
            opacity: "0.9"
          }}>
            {t('hero.description')}
          </p>
          
          <a href="/try-it" style={{
            display: "inline-block",
            backgroundColor: "white",
            color: "#5F29B9",
            fontWeight: "600",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.375rem",
            textDecoration: "none",
            fontSize: "1rem",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}>
            {t('hero.tryButton')}
          </a>
        </div>
        
        {/* Image */}
        <div style={{
          flex: "1",
          minWidth: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem"
        }}>
          <img 
            src="/img/HeroImage.png" 
            alt="Secure digital voting" 
            style={{
              maxWidth: "100%",
              height: "auto",
              filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))"
            }}
          />
        </div>
      </div>
    </div>
  );
};
