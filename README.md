<p align="center">
  <img src="public/logo.png" alt="CourseForge" width="280" />
</p>

<p align="center">
  <strong>Transform documents into structured courses with AI</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a>
</p>

---

## Overview

CourseForge uses six specialized AI agents powered by Google Gemini to transform any document into a complete, production-ready course. Upload a PDF, markdown file, or text document and watch as our agents collaborate to create lessons, quizzes, interactive elements, and video scripts.

## Features

- **Multi-Agent Architecture** — Six specialized agents work together: Director, Architect, Writer, Assessor, Engager, and Producer
- **Document Intelligence** — Analyzes PDFs, markdown, and text files to extract key concepts
- **Complete Course Generation** — Creates modules, lessons, quizzes, and learning objectives
- **Video Script Writing** — Generates production-ready scripts with visual notes
- **Interactive Elements** — Adds reflections, discussions, and hands-on activities
- **Export Options** — Download as JSON or Markdown

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Upload    │ ──▶ │   Analyze   │ ──▶ │  Structure  │
│  Document   │     │   Content   │     │   Course    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
┌─────────────┐     ┌─────────────┐     ┌──────▼──────┐
│   Export    │ ◀── │   Review    │ ◀── │   Generate  │
│   Course    │     │   & Refine  │     │   Content   │
└─────────────┘     └─────────────┘     └─────────────┘
```

**The Agents:**

| Agent | Role | Model |
|-------|------|-------|
| Director | Orchestrates workflow, manages conversation | Gemini 2.5 Pro |
| Architect | Designs course structure and learning paths | Gemini 2.5 Flash |
| Writer | Creates detailed lesson content | Gemini 2.5 Pro |
| Assessor | Builds quizzes and assessments | Gemini 2.5 Flash |
| Engager | Adds interactive elements | Gemini 2.5 Flash |
| Producer | Writes video scripts | Gemini 2.5 Flash |

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **AI:** Google Gemini API (2.5 Pro & Flash)
- **State:** Zustand with persistence
- **Animations:** Framer Motion

## Getting Started

```bash
# Clone the repository
git clone https://github.com/SaaiAravindhRaja/CourseForge.git
cd CourseForge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating courses.

## Environment Variables

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).


```env
GEMINI_API_KEY=your_gemini_api_key
```

---
