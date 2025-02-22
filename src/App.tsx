// App.tsx
import React from "react";
import './index.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { VoteProvider } from "./pages/VoteContext";
import HomePage from "./pages/HomePage";
import VoteValidation from "./pages/VoteValidation";
import Vote from "./pages/Vote";
import RequestFirma from "./pages/RequestFirma";

const App: React.FC = () => {
    return (
        <VoteProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/vote-validation" element={<VoteValidation />} />
                    <Route path="/request-firma" element={<RequestFirma />} />
                    <Route path="/vote" element={<Vote />} />
                </Routes>
            </Router>
        </VoteProvider>
    );
};

export default App;
