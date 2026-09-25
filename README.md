# StudyForge — AI-Powered Interactive Quiz Generator

StudyForge is a React + Node.js application that converts free-form study topics or notes into an interactive multiple-choice quiz using Google's Gemini API.

The project was built for the Flam Frontend Internship Assignment, with a focus on React architecture, real AI integration, structured data handling, validation, responsive UI, and resilience to unreliable AI output.

## Features

* Free-form study input
* Real Gemini LLM integration
* Server-side API key protection
* Structured JSON AI responses
* JSON parsing and validation
* Zod schema validation
* Client-side response validation
* Loading state
* Empty-input handling
* Malformed JSON handling
* Invalid AI response handling
* API failure handling
* Stale-request protection
* Interactive answer selection
* Immediate correct/incorrect feedback
* Answer explanations
* Question progress tracking
* Final score screen
* Retry incorrect questions
* Responsive mobile-friendly UI

## Tech Stack

### Frontend

* React
* JavaScript
* Vite
* CSS

### Backend

* Node.js
* Express.js
* CORS
* dotenv

### AI & Validation

* Google Gemini API
* Zod

## Architecture

```text
User
  ↓
React Frontend
  ↓
Express API
  ↓
Gemini API
  ↓
JSON Parsing
  ↓
Zod Schema Validation
  ↓
Validated Quiz Data
  ↓
React Quiz UI
```

The Gemini API key is kept on the server and is never exposed to the browser.

## Project Structure

```text
flam-studyforge/
├── server/
│   ├── index.js
│   └── generate.js
│
├── src/
│   ├── components/
│   ├── lib/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── README.md
```

## Setup

### Requirements

* Node.js 18+
* npm
* Gemini API key

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd flam-studyforge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the Gemini API key

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Do not commit `.env` to GitHub.

### 4. Start the application

```bash
npm start
```

The application will run at:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

Backend health check:

```text
http://localhost:5000/api/health
```

The health endpoint should return:

```json
{
  "success": true,
  "message": "StudyForge API is running"
}
```

## Usage

1. Open the application in the browser.
2. Enter a study topic or paste study notes.
3. Click **Generate Quiz**.
4. Wait for Gemini to generate the quiz.
5. Select an answer for each question.
6. View immediate feedback and explanations.
7. Complete the quiz to view the final score.
8. Retry incorrect questions or create a new quiz.

Example input:

```text
JavaScript closures, promises, async/await and the event loop
```

## AI Integration

StudyForge uses Gemini to generate structured multiple-choice quiz data.

The backend instructs Gemini to return a specific JSON structure:

```json
{
  "title": "JavaScript Async Programming",
  "description": "A quiz covering promises and async programming",
  "questions": [
    {
      "id": "q1",
      "question": "What is a Promise?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 1,
      "explanation": "Explanation of the correct answer."
    }
  ]
}
```

The response is parsed and validated before it reaches the React UI.

This prevents malformed or unexpected AI output from being rendered directly.

## Error Handling

The application explicitly handles several unreliable-AI and network scenarios:

### Empty input

The user cannot submit an empty study topic.

### Invalid input

The backend validates the input type and length before calling Gemini.

### Empty AI response

An empty response from Gemini is treated as an error.

### Malformed JSON

The backend attempts to extract and parse JSON. Invalid JSON is rejected.

### Invalid response structure

Zod validates:

* Quiz title
* Description
* Question structure
* Four options per question
* Correct answer index
* Answer explanations

Invalid data is rejected instead of being rendered.

### API failure

Gemini/API failures are caught by the Express backend and displayed as a user-friendly error state.

### Stale responses

Each generation request receives an identifier. If an older request finishes after a newer request, its result is ignored so it cannot overwrite the latest quiz.

## Security

The Gemini API key is stored only in the server-side `.env` file.

The key is intentionally **not** stored in a `VITE_` environment variable because Vite exposes `VITE_` variables to client-side code.

The `.env` file is included in `.gitignore` and must never be committed to GitHub.

An `.env.example` file is provided for setup:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## AI Usage Note

AI-assisted development tools were used during implementation for code generation, debugging, documentation, and development guidance.

All generated implementation was reviewed and adapted for the project, and the developer is responsible for understanding the submitted code and architecture.

Gemini is used at runtime to generate quiz content from the user's study material.

## Known Limitations

* Quiz quality depends on the quality of the supplied study material and Gemini's generated output.
* AI-generated questions should still be reviewed by the user for academic accuracy.
* Quiz history is not persisted.
* There is no authentication or user account system.
* There is no database.
* The application requires an active Gemini API connection to generate quizzes.
* Gemini API usage is subject to the limits of the configured API account.
* The application currently generates five questions per quiz.

## Why No Database or Authentication?

The assignment is intentionally focused on frontend architecture, AI integration, structured data handling, and resilience to unreliable AI output.

Authentication, databases, RAG, and additional infrastructure were intentionally excluded to keep the implementation focused and within the assignment's time constraint.

## Time Spent

Approximately **8 hours** were spent on the implementation, including:

* Project setup
* React UI development
* Express backend
* Gemini integration
* JSON parsing and validation
* Error handling
* Interactive quiz functionality
* Responsive UI
* Testing and documentation

## Demo

**Screen recording:**
ADD YOUR DEMO VIDEO LINK HERE

The demo demonstrates:

* Study topic input
* AI quiz generation
* Interactive answer selection
* Answer explanations
* Progress tracking
* Final score
* Retry incorrect answers
* Responsive interface

## Repository

**GitHub:**
ADD YOUR GITHUB REPOSITORY LINK HERE

## License

This project was created as part of a frontend internship assignment.
