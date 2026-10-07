# AI Interview Prep Assistant - Backend API

A production-ready, stateless REST API backend for an **AI Interview Prep Assistant** built with Node.js (ES modules), Express, and Google Gemini API. 

Designed without any database dependencies; all session history, settings, and interview transcripts can be stored client-side (e.g. in `localStorage`).

---

## 🚀 Tech Stack

- **Runtime & Framework:** Node.js (ES Modules), Express 4.x
- **AI Integration:** `@google/generative-ai` (Gemini Flash, default: `gemini-2.5-flash`)
- **Document Processing:** `multer` (memory-only buffer) + `pdf-parse`
- **Validation:** `zod`
- **Security & Middleware:** `cors`, `express-rate-limit`, `dotenv`

---

## 📁 Project Structure

```text
server/
├── src/
│   ├── config/
│   │   └── env.js                     # Centralized environment variable loader
│   ├── controllers/
│   │   └── interview.controller.js    # Endpoint logic, scoring & AI orchestrations
│   ├── middleware/
│   │   ├── errorHandler.js            # Unified JSON error response handler & AppError
│   │   ├── upload.js                  # Multer memory-only PDF upload validator
│   │   └── validate.js                # Zod request body validation middleware
│   ├── prompts/
│   │   ├── evaluatePrompt.js          # Answer grading and coaching prompt
│   │   ├── followupPrompt.js          # Adaptive conversational follow-up prompt
│   │   ├── questionPrompt.js          # Tailored question generation prompt
│   │   ├── reportPrompt.js            # Qualitative synthesis & study plan prompt
│   │   └── resumePrompt.js            # Structured PDF resume extraction prompt
│   ├── routes/
│   │   └── interview.routes.js        # Route declarations & Zod schemas
│   ├── services/
│   │   ├── gemini.service.js          # Strict JSON Gemini wrapper with auto-retry
│   │   └── resume.service.js          # In-memory PDF text extraction & structuring
│   └── index.js                       # Express app setup, rate limiting & server entry
├── .env.example                       # Example environment file
├── package.json                       # Project dependencies and npm scripts
└── README.md                          # API documentation and curl samples
```

---

## ⚙️ Prerequisites & Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Gemini API Key**: Obtain a free/paid API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

### 3. Environment Configuration

Copy the sample environment file:

```bash
cp .env.example .env
```

Edit `.env` and provide your Gemini API key:

```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the Express HTTP server |
| `NODE_ENV` | `development` | Environment mode (`development` / `production`) |
| `GEMINI_API_KEY` | *(Required)* | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model name |
| `CLIENT_URL` | `*` | Allowed CORS origin (comma-separated for multiples) |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in milliseconds (1 min) |
| `RATE_LIMIT_MAX` | `30` | Maximum allowed requests per window per IP |

### 4. Running the Server

- **Development Mode (watch):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

---

## 🛡️ Security & Reliability Highlights

- **Strict JSON Output:** Gemini responses use `responseMimeType: "application/json"` with automatic retry if parsing fails.
- **Prompt Injection Defense:** All user inputs and resume texts are framed strictly as untrusted data inputs in system prompts. Input answers are capped at 3,000 characters.
- **Zero Storage / Memory Only:** Uploaded PDFs are parsed strictly in memory and discarded immediately after parsing.
- **Unified Error Handling:** Every error returns standard shape:
  ```json
  {
    "error": {
      "message": "Detailed error message",
      "code": "VALIDATION_ERROR"
    }
  }
  ```
- **Server-Computed Scores:** Quantitative metrics (overall weighted average, percentage breakdowns, stats) are computed deterministically on the server, while AI is leveraged for qualitative feedback and coaching.

---

## 📚 API Reference & Sample cURLs

All endpoints are prefixed with `/api`.

### 1. Health Check
Checks if the server is healthy.

- **Method:** `GET`
- **Path:** `/api/health`

```bash
curl -X GET http://localhost:5000/api/health
```

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

### 2. Generate Interview Questions
Generates customized interview questions. If `resumeData` is provided, at least 40% of the questions are generated directly from candidate projects and technologies.

- **Method:** `POST`
- **Path:** `/api/questions/generate`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "role": "Full Stack Engineer",
  "experienceLevel": "Experienced",
  "interviewType": "Technical",
  "topics": ["React", "Node.js", "System Design"],
  "difficulty": "Medium",
  "count": 5,
  "resumeData": {
    "projects": [
      {
        "title": "Realtime Collaboration Canvas",
        "techStack": ["React", "WebSockets", "Redis"]
      }
    ],
    "skills": ["Distributed Systems", "Caching Strategies"]
  }
}
```

```bash
curl -X POST http://localhost:5000/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Full Stack Engineer",
    "experienceLevel": "Experienced",
    "interviewType": "Technical",
    "topics": ["React", "Node.js", "System Design"],
    "difficulty": "Medium",
    "count": 5
  }'
```

**Response (200 OK):**
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "In your Realtime Collaboration Canvas project, how did you handle state synchronization and conflict resolution using WebSockets and Redis?",
      "topic": "System Design",
      "difficulty": "Medium",
      "type": "Technical"
    },
    {
      "id": "q2",
      "question": "How does Node.js event loop handle asynchronous I/O operations under high concurrency?",
      "topic": "Node.js",
      "difficulty": "Medium",
      "type": "Technical"
    }
  ]
}
```

---

### 3. Evaluate Candidate Answer
Evaluates a single answer. Assigns dimension scores (0-10), computes a server-weighted overall score, gives 2-3 sentences of constructive feedback, strengths, improvements, and an ideal model answer.

- **Method:** `POST`
- **Path:** `/api/answer/evaluate`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "question": "What is the difference between SQL and NoSQL databases, and how do you choose between them?",
  "answer": "SQL databases are relational and structured with ACID compliance, like PostgreSQL. NoSQL databases are non-relational, like MongoDB or Cassandra, designed for flexible schemas and horizontal scalability.",
  "role": "Backend Developer",
  "difficulty": "Medium"
}
```

```bash
curl -X POST http://localhost:5000/api/answer/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the difference between SQL and NoSQL databases?",
    "answer": "SQL is relational with ACID properties. NoSQL is document or key-value based and scales horizontally.",
    "role": "Backend Developer",
    "difficulty": "Medium"
  }'
```

**Response (200 OK):**
```json
{
  "scores": {
    "technicalAccuracy": 8.5,
    "relevance": 9.0,
    "completeness": 7.0,
    "clarity": 8.5
  },
  "overall": 8.3,
  "feedback": "Clear explanation of relational vs non-relational models and schema paradigms. Adding a brief mention of CAP theorem or specific query pattern trade-offs would make the answer even stronger.",
  "strengths": [
    "Accurately highlighted ACID compliance vs horizontal scalability",
    "Clear, concise terminology"
  ],
  "improvements": [
    "Mention data consistency models and join complexity",
    "Provide a concrete decision framework based on workload types"
  ],
  "idealAnswer": "SQL databases are relational with strict schemas and ACID compliance, optimal for complex queries and transactional integrity (e.g. banking). NoSQL databases provide flexible data models (document, key-value, graph) and horizontal scaling, ideal for high-throughput distributed workloads and evolving schemas."
}
```

---

### 4. Generate Ideal Answer
Generates an ideal candidate response and key points for a question that the user skipped.

- **Method:** `POST`
- **Path:** `/api/answer/ideal`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "question": "Explain the Virtual DOM and reconciliation in React.",
  "topic": "React",
  "role": "Frontend Developer",
  "difficulty": "Medium",
  "experienceLevel": "Mid"
}
```

```bash
curl -X POST http://localhost:5000/api/answer/ideal \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain the Virtual DOM and reconciliation in React.",
    "topic": "React",
    "role": "Frontend Developer",
    "difficulty": "Medium",
    "experienceLevel": "Mid"
  }'
```

**Response (200 OK):**
```json
{
  "idealAnswer": "The Virtual DOM is a lightweight JavaScript representation of the actual DOM...",
  "keyPoints": [
    "Lightweight representation of real DOM",
    "Uses a diffing algorithm (reconciliation)",
    "Updates only changed nodes for better performance"
  ],
  "example": ""
}
```

---

### 5. Conversational Follow-up Question
Dynamically asks the next question based on the ongoing conversation history. Adapts dynamically: if previous score < 5, asks a clarifying foundational question; if > 8, challenges the candidate with deeper architectural trade-offs.

- **Method:** `POST`
- **Path:** `/api/interview/followup`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "role": "Senior Backend Engineer",
  "interviewType": "Technical",
  "difficulty": "Hard",
  "history": [
    {
      "question": "How would you design a distributed caching layer?",
      "answer": "I would use Redis cluster with consistent hashing to distribute keys evenly and prevent hotspot servers.",
      "overall": 9.0
    }
  ]
}
```

```bash
curl -X POST http://localhost:5000/api/interview/followup \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Senior Backend Engineer",
    "interviewType": "Technical",
    "difficulty": "Hard",
    "history": [
      {
        "question": "How would you design a distributed caching layer?",
        "answer": "I would use Redis cluster with consistent hashing.",
        "overall": 9.0
      }
    ]
  }'
```

**Response (200 OK):**
```json
{
  "reaction": "Excellent. Let's look deeper into failure scenarios.",
  "question": "When a node fails in your consistent hashing ring, how do you mitigate cache stampedes on the underlying primary database?",
  "topic": "Distributed Caching"
}
```

---

### 5. Final Performance Report
Calculates comprehensive statistics, skill breakdown percentages, strong/weak areas, recommended topics for study, and an executive debrief summary.

- **Method:** `POST`
- **Path:** `/api/interview/report`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "role": "Frontend Developer",
  "interviewType": "Technical",
  "difficulty": "Medium",
  "results": [
    {
      "question": "Explain the Virtual DOM and reconciliation.",
      "topic": "React",
      "answer": "React creates a lightweight in-memory representation of DOM...",
      "skipped": false,
      "scores": {
        "technicalAccuracy": 9,
        "relevance": 9,
        "completeness": 8.5,
        "clarity": 9
      },
      "overall": 8.9
    },
    {
      "question": "How does Webpack tree shaking work?",
      "topic": "Build Tools",
      "answer": "",
      "skipped": true
    }
  ]
}
```

```bash
curl -X POST http://localhost:5000/api/interview/report \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Frontend Developer",
    "interviewType": "Technical",
    "difficulty": "Medium",
    "results": [
      {
        "question": "Explain React Virtual DOM.",
        "topic": "React",
        "answer": "Virtual DOM is a copy of real DOM used to diff changes efficiently.",
        "skipped": false,
        "scores": {
          "technicalAccuracy": 8.5,
          "relevance": 8.5,
          "completeness": 8,
          "clarity": 9
        },
        "overall": 8.5
      }
    ]
  }'
```

**Response (200 OK):**
```json
{
  "overallPercent": 85,
  "breakdown": {
    "technical": 85,
    "communication": 90,
    "accuracy": 85,
    "completeness": 80
  },
  "stats": {
    "total": 2,
    "answered": 1,
    "skipped": 1
  },
  "strongAreas": [
    "Solid understanding of React core mechanics and reconciliation",
    "Clear and concise articulation"
  ],
  "weakAreas": [
    "Build tools and asset optimization pipelines (e.g., Tree shaking)"
  ],
  "recommendedTopics": [
    "Webpack & Vite bundling mechanisms",
    "ES Modules static analysis and dead code elimination",
    "Web Performance Optimization"
  ],
  "summary": "The candidate exhibited strong fundamentals in core React concepts with very good communication clarity. Focus on frontend tooling and bundling optimizations to become a well-rounded candidate."
}
```

---

### 6. Parse Resume PDF
Parses a PDF resume strictly in memory using `pdf-parse` and Gemini, extracting structured details.

- **Method:** `POST`
- **Path:** `/api/resume/parse`
- **Content-Type:** `multipart/form-data`
- **Form Field:** `resume` (PDF file, max 5MB)

```bash
curl -X POST http://localhost:5000/api/resume/parse \
  -F "resume=@/path/to/candidate_resume.pdf"
```

**Response (200 OK):**
```json
{
  "name": "Jane Doe",
  "education": [
    "B.S. in Computer Science, State University, 2023"
  ],
  "skills": [
    "Full-Stack Development",
    "RESTful API Design",
    "Microservices"
  ],
  "technologies": [
    "JavaScript",
    "TypeScript",
    "Node.js",
    "React",
    "PostgreSQL",
    "Docker"
  ],
  "projects": [
    {
      "title": "E-Commerce Microservices",
      "description": "Built event-driven backend services handling orders and payments.",
      "techStack": ["Node.js", "Express", "RabbitMQ", "PostgreSQL"]
    }
  ],
  "experience": [
    {
      "role": "Software Engineering Intern",
      "company": "Tech Corp",
      "summary": "Developed internal REST APIs and improved database query latency by 30%."
    }
  ]
}
```

---

## 🧪 Error Responses

All error responses adhere to a consistent JSON payload:

```json
{
  "error": {
    "message": "Validation error: role: Role is required; count: Count cannot exceed 15",
    "code": "VALIDATION_ERROR"
  }
}
```

Common status codes:
- `400 BAD_REQUEST`: Missing parameters, validation failure, non-PDF file, or empty/scanned PDF.
- `404 NOT_FOUND`: Route does not exist.
- `429 RATE_LIMIT_EXCEEDED`: Exceeded 30 requests/minute per IP.
- `500 INTERNAL_SERVER_ERROR`: Missing configuration or server issue.
- `502 BAD_GATEWAY`: AI model failed to produce valid JSON after retry.
