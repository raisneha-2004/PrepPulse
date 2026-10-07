# PrepPulse - AI Interview Prep Assistant (Frontend)

Modern, interactive AI-powered Interview Preparation frontend built with **React 19**, **Vite**, **Tailwind CSS**, **React Router**, and **Axios**.

---

## ✨ Features

- **🎯 Role-Targeted Setup**: Choose from standard engineering & product roles or provide a custom title, select experience level (Fresher / Experienced), and toggle focus topics dynamically.
- **⚡ Dual Modes**:
  - **Practice Mode**: Static set of questions with instant multi-dimensional evaluation, feedback, strengths, improvements, and skipping allowed.
  - **Mock Interview Mode**: Realistic conversational interview simulation with adaptive AI follow-up questions and live transcript memory.
- **📄 Smart Resume Parsing**: Drag-and-drop PDF resume parser that extracts skills and projects into editable chips to personalize questions.
- **📊 Deep Multi-Metric Evaluation**: Real-time scoring on Technical Accuracy, Relevance, Completeness, and Communication with side-by-side ideal answer comparisons.
- **📈 Comprehensive Performance Reports**: Radial score gauge, competency breakdown bars, executive AI assessment, growth opportunities, revision roadmaps, and printable PDF reports (`window.print`).
- **🗂️ Persistent Local Storage History**: Track progress over time with interactive Recharts line graphs and full past report reviews.
- **🌓 Light & Dark Modes**: Responsive, card-based interface with indigo accents and smooth transitions.
- **🎙️ Speech-to-Text Hook**: Built-in extension hook for Web Speech API audio transcription.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion
- **Visualizations**: Recharts

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Backend Express API running (defaults to `http://localhost:5000/api`)

### 2. Environment Configuration
Create a `.env` file in the `client` directory (or copy from `.env.example`):

```bash
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies & Run
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🧪 Testing & Production Build

```bash
# Validate build bundle
npm run build

# Preview production build
npm run preview
```
