import { useMemo, useState } from "react";
import QuestionCard from "./QuestionCard";

function Quiz({ quiz, onRestart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQuestion = quiz.questions[currentIndex];

  const score = useMemo(
    () =>
      quiz.questions.reduce(
        (total, question) =>
          total + (answers[question.id] === question.correctAnswer ? 1 : 0),
        0
      ),
    [answers, quiz.questions]
  );

  const handleSelect = (answerIndex) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: answerIndex
    }));
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);
      setShowAnswer(false);
    } else {
      setFinished(true);
    }
  };

  const handleRetryWrong = () => {
    const wrongQuestions = quiz.questions.filter(
      (question) => answers[question.id] !== question.correctAnswer
    );

    if (wrongQuestions.length === 0) {
      onRestart();
      return;
    }

    const baseTitle = quiz.title.replace(/( — Retry)+$/, "");

    onRestart({
      ...quiz,
      title: `${baseTitle} — Retry`,
      questions: wrongQuestions
    });

    setCurrentIndex(0);
    setAnswers({});
    setShowAnswer(false);
    setFinished(false);
  };

  if (finished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const wrongCount = quiz.questions.length - score;

    return (
      <div className="results">
        <div className="result-icon">✓</div>
        <p className="eyebrow">QUIZ COMPLETE</p>
        <h1>{quiz.title}</h1>
        <div className="score-circle">
          <strong>{percentage}%</strong>
          <span>{score} / {quiz.questions.length}</span>
        </div>
        <p className="result-message">
          You answered {score} correctly and {wrongCount} incorrectly.
        </p>

        <div className="result-actions">
          {wrongCount > 0 && (
            <button className="primary-button" onClick={handleRetryWrong}>
              Retry Wrong Answers
            </button>
          )}
          <button className="secondary-button" onClick={() => onRestart()}>
            Create New Quiz
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div>
          <p className="eyebrow">STUDYFORGE QUIZ</p>
          <h1>{quiz.title}</h1>
          <p>{quiz.description}</p>
        </div>
        <button className="restart-link" onClick={() => onRestart()}>
          New Quiz
        </button>
      </div>

      <div className="progress-info">
        <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
        <span>{score} correct</span>
      </div>

      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id]}
        onSelect={handleSelect}
        showAnswer={showAnswer}
      />

      <button
        className="next-button"
        onClick={handleNext}
        disabled={!showAnswer}
      >
        {currentIndex === quiz.questions.length - 1
          ? "See Results"
          : "Next Question →"}
      </button>
    </div>
  );
}

export default Quiz;