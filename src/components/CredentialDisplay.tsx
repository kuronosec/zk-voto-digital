import React from 'react';
import { displayMethod } from '../constants/displayConfig';

interface CredentialDisplayProps {
  data: {
    address: string;
    type: string;
    issuanceDate: string;
    IssuerDID: string;
    RecipientDID: string;
  };
}

export const CredentialDisplay: React.FC<CredentialDisplayProps> = ({ data }) => {
  const certificateStyle: React.CSSProperties = {
    backgroundColor: displayMethod.backgroundColor,
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'left',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle: React.CSSProperties = {
    color: displayMethod.titleTextColor,
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px'
  };

  const descriptionStyle: React.CSSProperties = {
    color: displayMethod.descriptionTextColor,
    fontSize: '14px',
    marginBottom: '10px'
  };

  const issuerStyle: React.CSSProperties = {
    color: displayMethod.issuerTextColor,
    fontSize: '16px',
    fontStyle: 'italic',
    marginBottom: '10px'
  };

  return (
    <div style={certificateStyle}>
      <img 
        src={displayMethod.logo.uri} 
        alt={displayMethod.logo.alt} 
        style={{ width: '150px', borderRadius: '50%', marginBottom: '10px' }} 
      />
      <div style={issuerStyle}>{displayMethod.description}</div>
      <div>Issuer:</div>
      <div style={issuerStyle}>{displayMethod.issuerName}</div>
      <div>User Address:</div>
      <div style={descriptionStyle}>{data.address}</div>
      <div>Type:</div>
      <div style={descriptionStyle}>{data.type}</div>
      <div>Issuance Date:</div>
      <div style={descriptionStyle}>{data.issuanceDate}</div>
      <div>Issuer DID:</div>
      <div style={descriptionStyle}>{data.IssuerDID}</div>
      <div>Recipient DID:</div>
      <div style={descriptionStyle}>{data.RecipientDID}</div>
    </div>
  );
};