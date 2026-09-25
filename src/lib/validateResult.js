export function validateQuiz(result) {
  if (!result || typeof result !== "object") return false;
  if (typeof result.title !== "string") return false;
  if (typeof result.description !== "string") return false;
  if (!Array.isArray(result.questions) || result.questions.length === 0) {
    return false;
  }

  return result.questions.every((question) =>
    typeof question.id === "string" &&
    typeof question.question === "string" &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    question.options.every((option) => typeof option === "string") &&
    Number.isInteger(question.correctAnswer) &&
    question.correctAnswer >= 0 &&
    question.correctAnswer <= 3 &&
    typeof question.explanation === "string"
  );
}