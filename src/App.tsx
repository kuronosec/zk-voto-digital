// App.tsx
import React from "react";
import './index.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { VoteValidation } from "./pages/VoteValidation";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/vote" element={<VoteValidation />} />
            </Routes>
        </Router>
    );
};

export default App;
