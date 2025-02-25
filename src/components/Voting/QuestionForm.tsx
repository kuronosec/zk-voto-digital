import { useState } from "react";
import { createProposal } from "../../hooks/CreateProposal";

function QuestionForm() {
  // State for the question text
  const [question, setQuestion] = useState("");
  // State for the possible options; start with one empty option field
  const [options, setOptions] = useState([""]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<boolean | null>(false);

  // Update question state
  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  // Update a specific option
  const handleoptionChange = (index, e) => {
    const newoptions = [...options];
    newoptions[index] = e.target.value;
    setOptions(newoptions);
  };

  // Add a new empty option field
  const addoptionField = () => {
    setOptions([...options, ""]);
  };

  // Remove an option field at a specific index
  const removeoptionField = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // You can process your question and options here
    console.log("Question:", question);
    console.log("Options:", options);
    try {
      const { _result, _error, _done } = await createProposal(question, options);
      setResult(_result);
      setDone(_done);
      setError(_error);
      console.log("Result: ", result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Question:</label>
        <input
          type="text"
          value={question}
          onChange={handleQuestionChange}
          placeholder="Enter your question here"
        />
      </div>
      <div>
        <label>Possible options:</label>
        {options.map((option, index) => (
          <div key={index} style={{ marginBottom: "0.5rem" }}>
            <input
              type="text"
              value={option}
              onChange={(e) => handleoptionChange(index, e)}
              placeholder={`option ${index + 1}`}
            />
            {options.length > 1 && (
              <button type="button" onClick={() => removeoptionField(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addoptionField}>
          Add option
        </button>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : done ? (
        <p style={{ color: 'red' }}>Voting proposal was send succesfully!</p>
      ) : (
        <p></p>
      )}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

export default QuestionForm;
