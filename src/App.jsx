import { useRef, useState } from "react";
import PromptInput from "./components/PromptInput";
import Quiz from "./components/Quiz";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import { generateQuiz } from "./lib/api";
import { validateQuiz } from "./lib/validateResult";

function App() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestId = useRef(0);
  const lastInput = useRef("");

  const handleGenerate = async (input) => {
    const id = ++requestId.current;

    lastInput.current = input;
    setLoading(true);
    setError(null);
    setQuiz(null);

    try {
      const result = await generateQuiz(input);

      if (id !== requestId.current) return;

      if (!validateQuiz(result)) {
        throw new Error("The AI returned an unexpected quiz format.");
      }

      setQuiz(result);
    } catch (error) {
      if (id !== requestId.current) return;
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  };

  const handleRetry = () => {
    if (lastInput.current) {
      handleGenerate(lastInput.current);
    }
  };

  const handleRestart = (newQuiz = null) => {
    setQuiz(newQuiz);
    setError(null);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <span className="logo-mark">S</span>
          StudyForge
        </div>
        <span className="nav-label">AI-powered learning</span>
      </nav>

      <main>
        {!quiz && !loading && !error && (
          <PromptInput onGenerate={handleGenerate} loading={loading} />
        )}

        {loading && <LoadingState />}

        {error && !loading && (
          <ErrorState message={error} onRetry={handleRetry} />
        )}

        {quiz && !loading && !error && (
          <Quiz
            key={`${quiz.title}:${quiz.questions.map((question) => question.id).join("|")}`}
            quiz={quiz}
            onRestart={handleRestart}
          />
        )}
      </main>

      <footer>
        Built with React + Node.js + Gemini
      </footer>
    </div>
  );
}

export default App;