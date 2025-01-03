import React from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

interface FileUploaderProps {
  onFileUpload: (proof: any, signals: any) => void;
  onError: (error: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, onError }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const credential_file = event.target.files?.[0];

    if (credential_file) {
      const credential_reader = new FileReader();
      credential_reader.onload = (event) => {
        try {
          if (event.target?.result) {
            const json = JSON.parse(event.target.result as string);
            if (json.proof?.signatureValue) {
              onFileUpload(json.proof.signatureValue.proof, json.proof.signatureValue.public);
            } else {
              onError('Invalid file format');
            }
          }
        } catch (error) {
          onError(error instanceof Error ? error.message : 'Error parsing JSON file');
          console.log("Error parsing JSON file: " + error);
        }
      };
      credential_reader.readAsText(credential_file);
    } else {
      console.log("Please upload only JSON files.");
    }
  };

  return (
    <div className="file-upload-container">
  <label className="file-upload-label">
    <input 
      type="file" 
      accept=".json" 
      multiple 
      onChange={handleFileUpload} 
      className="file-upload-input" 
    />
    <span className="file-upload-button">Upload File</span>
  </label>
</div>
  );
};