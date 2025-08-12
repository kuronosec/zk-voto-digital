import React from 'react';
import ReactDOM from 'react-dom';
import { WagmiProvider } from 'wagmi';
import "./i18n";
import './index.css';
import App from './App';
import { wagmiConfig } from './config';

ReactDOM.render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <App />
    </WagmiProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
