// App.tsx
import React from "react";
import './index.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VoteValidation from "./pages/VoteValidation";
import RequestFirma from "./pages/RequestFirma";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/vote" element={<VoteValidation />} />
                <Route path="/request-firma" element={<RequestFirma />} />
            </Routes>
        </Router>
    );
};

export default App;
