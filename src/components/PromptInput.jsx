import { useRef, useState } from "react";

function PromptInput({ onGenerate, loading }) {
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!input.trim() || loading) return;
    onGenerate(input.trim());
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError("");
    setFileName("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/extract", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not read the file.");
      }

      setInput(result.text);
      setFileName(file.name);
    } catch (error) {
      setFileError(error.message);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="prompt-section">
      <h1>Turn your notes into a quiz.</h1>

      <p>
        Paste your notes or upload a file to generate an interactive quiz.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setFileName("");
            setFileError("");
          }}
          placeholder="Paste your study notes here..."
          maxLength={5000}
          rows={8}
          disabled={loading}
        />

        <div className="input-footer">
          <label
            className="upload-plus"
            title="Upload PDF, TXT, DOCX, Markdown, or CSV"
          >
            <span>+</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx,.md,.csv"
              onChange={handleFileUpload}
              disabled={loading}
              hidden
            />
          </label>

          <span className="character-count">{input.length}/5000</span>

          <button
            type="submit"
            disabled={loading || !input.trim()}
          >
            {loading ? "Generating..." : "Generate Quiz →"}
          </button>
        </div>

        {fileName && <p className="file-name">Loaded: {fileName}</p>}
        {fileError && <p className="file-error">{fileError}</p>}
      </form>
    </section>
  );
}

export default PromptInput;