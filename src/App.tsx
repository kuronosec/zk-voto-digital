import React from "react";
import "./i18n";
import './index.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { VoteProvider } from "./pages/VoteContext";
import { WalletProvider } from "./context/WalletContext";
import HomePage from "./pages/HomePage";
import VoteValidation from "./pages/VoteValidation";
import Vote from "./pages/Vote";
import AdminGUI from "./pages/AdminGUI";
import RequestFirma from "./pages/RequestFirma";
import Results from "./pages/Results";
import { ZkSign } from "./components/ZkSign";
import { MobileInstructions } from "./pages/MobileInstructions";
import PassportVote from "./pages/PassportVote";
import PassportVerification from "./components/PassportVerification";
import PassportCallback from "./components/PassportCallback";

const App: React.FC = () => {
    return (
        <WalletProvider>
            <VoteProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/vote-validation" element={<VoteValidation />} />
                        <Route path="/request-firma" element={<RequestFirma />} />
                        <Route path="/vote" element={<Vote />} />
                        <Route path="/vote/passport" element={<PassportVote />} />
                        <Route path="/vote/passport/verify" element={<PassportVerification />} />
                        <Route path="/vote/passport/callback" element={<PassportCallback />} />
                        <Route path="/create-proposal" element={<AdminGUI />} />
                        <Route path="/results" element={<Results />} />
                        <Route path="/try-it" element={<ZkSign />} />
                        <Route path="/mobile-connect" element={<MobileInstructions />} />
                    </Routes>
                </Router>
            </VoteProvider>
        </WalletProvider>
    );
};

export default App;
