export async function generateQuiz(input) {
  const response = await fetch("http://localhost:5000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input })
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to generate quiz.");
  }

  return result.data;
}