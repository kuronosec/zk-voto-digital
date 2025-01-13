// App.tsx
import React from "react";
import './index.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
// import VotePage from "./pages/VotePage";
// <Route path="/vote" element={<VotePage />} />

const App: React.FC = () => {
    return (
        <Router>
            <nav>
                <Link to="/">Home</Link> | <Link to="/about">About</Link> | <Link to="/contact">Contact</Link>
            </nav>

            <Routes>
                <Route path="/" element={<HomePage />} />
            </Routes>
        </Router>
    );
};

export default App;
