# 🗳️ Election Process Education Assistant

ElectionGuide is a premium, AI-powered platform designed to educate citizens about voting processes, registration procedures, and election timelines. Built with Next.js 14, Firebase, and Google Gemini.

## 🚀 Features

- **AI Assistant**: Real-time Q&A with Google Gemini (Vertex AI) to clarify election procedures.
- **Process Guides**: Interactive, step-by-step walkthroughs for voter registration, ID verification, and more.
- **Visual Timeline**: Track election phases and milestones with a dynamic, interactive timeline.
- **Knowledge Assessment**: Gamified quizzes to test and improve your understanding of the election process.
- **Voter Dashboard**: Personalized hub to track your progress and upcoming deadlines.
- **Premium Design**: Built with a "Civic Trust" design system, using Framer Motion for smooth animations and Tailwind CSS for a modern aesthetic.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI**: Google Gemini (Google AI SDK)
- **Backend**: Firebase (Auth & Firestore)
- **State Management**: Zustand
- **Types**: TypeScript

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file and add your **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/):
   ```env
   GEMINI_API_KEY=your_key_here
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📐 Architecture

The app follows a modern Next.js architecture with:
- `src/app`: App Router for routing and layouts.
- `src/components`: Reusable UI components.
- `src/lib`: Configuration for Firebase and Gemini.
- `src/api`: API routes for AI and data processing.

## 🛡️ Security & Quality

- **Type Safety**: Fully typed with TypeScript.
- **Validation**: Schema validation using Zod.
- **Accessibility**: Built with WCAG principles in mind (semantic HTML, proper contrast).
- **Security**: Prepared for Firebase Security Rules and JWT-based auth.

---
Built by Antigravity AI Assistant.
