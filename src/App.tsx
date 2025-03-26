// App.tsx
import React from "react";
import "./i18n";
import './index.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { VoteProvider } from "./pages/VoteContext";
import HomePage from "./pages/HomePage";
import VoteValidation from "./pages/VoteValidation";
import Vote from "./pages/Vote";
import AdminGUI from "./pages/AdminGUI";
import RequestFirma from "./pages/RequestFirma";
import Results from "./pages/Results";
import { ZkSign } from "./components/ZkSign";

const App: React.FC = () => {
    return (
        <VoteProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/vote-validation" element={<VoteValidation />} />
                    <Route path="/request-firma" element={<RequestFirma />} />
                    <Route path="/vote" element={<Vote />} />
                    <Route path="/create-proposal" element={<AdminGUI />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/try-it" element={<ZkSign />} />
                </Routes>
            </Router>
        </VoteProvider>
    );
};

export default App;
