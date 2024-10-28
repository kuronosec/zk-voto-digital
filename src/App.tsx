// Import libraries
import React, { useState } from "react";
import { Button, Text } from "rimble-ui";
import { useTranslation } from 'react-i18next';
import './i18n';

// Import styles
import "./App.css";
import ListVerifiableCredentials from './ListVerifiableCredentials';

// Import library used to verify zk proofs (zk-snarks)
// Install: npm install snarkjs
const snarkjs = require("snarkjs");
const endpointUrl = process.env.REACT_APP_ENDPOINT_URL || "http://localhost:8000/vkey.json";

// From CA Issuers
// URI:http://fdi.sinpe.fi.cr/repositorio/CA%20SINPE%20-%20PERSONA%20FISICA%20v2(2).crt
export const productionPublicKeyHash =
  '15100764808137121660160871414130376377652473835020058565951744372715764457760'

// The verification requieres the verification zkey from the server side (Verifier)
// And the public and proof files from the user (prover)
const verifyProof = async (_verificationkey: string, publicSignals: any, proof: any) => {
	if (! _verificationkey || ! publicSignals || ! proof) {
		console.log('Empty inputs');
		const res = false;
		return res;
	}
	// First verify the goverment public key hash
	let pubkeyHash = productionPublicKeyHash;

	if (publicSignals[0] !== pubkeyHash) {
		throw new Error('VerificationError: public key mismatch.');
	}

	const vkey_json = await fetch(_verificationkey).then(function (res) {
		return res.json();
	});

	// Actually call the Snarkjs API
	const res = await snarkjs.groth16.verify(vkey_json, publicSignals, proof);
	return res;
};

function App() {
	const { t } = useTranslation();
	const [proof, setProof] = useState(null);
	const [signals, setSignals] = useState(null);
	const [done, setDone] = useState(null);
	const [isValid, setIsValid] = useState(false);
	const [error, setError] = useState("");

	// Retrieve verification key from server
	let verificationKeyFile = endpointUrl;

	const runProofs = () => {
		try {
			verifyProof(verificationKeyFile, signals, proof).then((_isValid) => {
				setIsValid(_isValid);
				setProof(proof);
				setSignals(signals);
				if (_isValid) {
					console.log("Valid credentials");
					setDone(proof);
				} else {
					setIsValid(false);
					console.log("Invalid credentials");
					setDone("error" as any);
				}
			});
		} catch (error) {
			setIsValid(false);
			console.log('Error in validation: '+error);
		}
	};

	// Function to handle file uploads
	// So the user (prover) can upload the credential file containing the proof
	// and public inputs
	const handleFileUpload = (event) => {
		const credential_file = event.target.files[0];

		if (credential_file) {
			// Read and parse the credential file
			const credential_reader = new FileReader();
			credential_reader.onload = (event) => {
				try {
					if(event.target != null && event.target.result != null) {
						const json = JSON.parse(event.target.result as string);
						if(json.proof != null && json.proof.signatureValue != null) {
							setProof(json.proof.signatureValue.proof);
							setSignals(json.proof.signatureValue.public);
						} else {
							setIsValid(false);
							return;
						}
					} else {
						setIsValid(false);
						return;
					}
				} catch (error) {
					setIsValid(false);
					setError(error as string);
					console.log("Error parsing JSON file: "+error);
				}
			};
			credential_reader.readAsText(credential_file);
		} else {
			console.log("Please upload only JSON files.");
		}
	};

	return (
		<div className="cardWhiteProfile">
			<h1>ZK Firma Digital</h1>
			<h4>
			    {t('input')}
			</h4>
			<div>
				{done && <Text> {isValid ? t('logged-in'): <p style={{ color: "red" }}>{t('wrong-credential')}</p>}</Text>}
				{done && isValid && <ListVerifiableCredentials />}
			</div>
			<div>
				{/* Input for uploading two files */}
				<input type="file" accept=".json" multiple onChange={handleFileUpload}/>
			</div>
			<div>
				{/* Display error message if any */}
				{error.length > 0 && <p style={{ color: "red" }}>{error}</p>}
				<Button.Outline onClick={runProofs}>{t('button')}</Button.Outline>
			</div>
		</div>
	);
}

export default App;
