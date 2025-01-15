// App.tsx
import React from "react";
import './index.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { VoteValidation } from "./pages/VoteValidation";
import RequestFirma from "./pages/RequestFirma";
// import { WagmiExample } from "./pages/WagmiExample";
// import VotePage from "./pages/VotePage";
// <Route path="/vote" element={<VotePage />} />
// <Route path="/wagmi" element={<WagmiExample />} />

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/vote" element={<VoteValidation />} />
                <Route path="/request" element={<RequestFirma />} />
            </Routes>
        </Router>
    );
};

export default App;
