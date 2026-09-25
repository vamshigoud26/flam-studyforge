import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite"
].filter((model, index, list) => model && list.indexOf(model) === index);

const RETRYABLE_STATUSES = new Set([408, 429, 500, 503, 504]);
const MAX_ATTEMPTS_PER_MODEL = 2;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error) {
  const status = error?.status;
  const message = String(error?.message || "").toLowerCase();

  return (
    RETRYABLE_STATUSES.has(status) ||
    message.includes("high demand") ||
    message.includes("try again") ||
    message.includes("unavailable") ||
    message.includes("overloaded")
  );
}

async function generateWithFallback(prompt) {
  let lastError;

  for (const modelName of MODEL_CANDIDATES) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt += 1) {
      try {
        const result = await model.generateContent(prompt);
        return result;
      } catch (error) {
        lastError = error;

        if (!isRetryable(error) || attempt === MAX_ATTEMPTS_PER_MODEL) {
          break;
        }

        await sleep(500 * 2 ** (attempt - 1));
      }
    }

    console.warn(
      `Model ${modelName} failed (${lastError?.status || "unknown"}): ${String(lastError?.message || lastError).slice(0, 180)}`
    );
  }

  throw lastError || new Error("Quiz generation failed.");
}

const QuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().min(1)
});

const QuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  questions: z.array(QuestionSchema).min(1).max(10)
});

function extractJSON(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI response did not contain valid JSON.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

export async function generateQuiz(userInput) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const prompt = `
You are an educational quiz generation engine.

Create an interactive multiple-choice quiz based on the user's study material.

IMPORTANT:
Return ONLY valid JSON.
Do not return Markdown.
Do not return code fences.
Do not return any text before or after the JSON.

The JSON MUST follow exactly this structure:
{
  "title": "string",
  "description": "string",
  "questions": [
    {
      "id": "q1",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ]
}

Rules:
1. Generate exactly 5 questions.
2. Each question exactly 4 options.
3. correctAnswer is an integer from 0 to 3.
4. Only one option is correct.
5. Questions must be relevant to the user's input.
6. Give a useful explanation for every answer.
7. Mix conceptual and practical questions when possible.
8. Avoid duplicate questions.
9. IDs must be q1, q2, q3, q4, q5.

User study material:
${userInput}
`;

  const result = await generateWithFallback(prompt);
  const text = result.response.text();

  if (!text || !text.trim()) {
    throw new Error("AI returned an empty response.");
  }

  let parsed;
  try {
    parsed = JSON.parse(extractJSON(text));
  } catch {
    throw new Error("AI returned malformed JSON.");
  }

  const validation = QuizSchema.safeParse(parsed);

  if (!validation.success) {
    console.error("Validation error:", validation.error.format());
    throw new Error("AI returned an invalid quiz structure.");
  }

  return validation.data;
}