function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
  showAnswer
}) {
  return (
    <div className="question-card">
      <h2>{question.question}</h2>

      <div className="options">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctAnswer;

          let className = "option";

          if (showAnswer && isCorrect) className += " correct";
          if (showAnswer && isSelected && !isCorrect) className += " incorrect";
          if (!showAnswer && isSelected) className += " selected";

          return (
            <button
              key={index}
              className={className}
              onClick={() => onSelect(index)}
              disabled={showAnswer}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {showAnswer && (
        <div className="explanation">
          <strong>
            {selectedAnswer === question.correctAnswer
              ? "✓ Correct!"
              : "✗ Incorrect"}
          </strong>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;