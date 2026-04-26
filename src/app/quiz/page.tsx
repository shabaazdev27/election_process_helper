"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Trophy,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { saveQuizResult } from "@/lib/db";

const questions = [
  {
    question: "What is the minimum age to register to vote in India?",
    options: ["16 years old", "18 years old", "21 years old", "25 years old"],
    answer: 1,
    explanation: "As per the Indian Constitution, the minimum age to vote is 18 years. You can apply for registration at 17+ so you are ready by the time you turn 18."
  },
  {
    question: "What does NOTA stand for on an Indian EVM?",
    options: ["None of the Applicants", "None of the Above", "New Options To Apply", "No Other Trusted Agent"],
    answer: 1,
    explanation: "NOTA (None of the Above) allows voters to officially register a vote of rejection for all candidates who are contesting an election."
  },
  {
    question: "Which constitutional body conducts elections in India?",
    options: ["Supreme Court", "Parliament", "Election Commission of India", "Ministry of Home Affairs"],
    answer: 2,
    explanation: "The Election Commission of India (ECI) is an autonomous constitutional authority responsible for administering election processes in India."
  },
  {
    question: "How long is the term of the Lok Sabha unless dissolved earlier?",
    options: ["4 years", "5 years", "6 years", "Permanent"],
    answer: 1,
    explanation: "The Lok Sabha, or the Lower House of Parliament, has a term of 5 years from the date appointed for its first meeting."
  }
];

export default function QuizPage() {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (user) {
        await saveQuizResult(user.uid, "general-election-quiz", score, questions.length);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-12 bg-card border border-border rounded-[3rem] shadow-2xl"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8">
            <Trophy className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold font-poppins mb-2">Quiz Completed!</h1>
          <p className="text-foreground/60 mb-8">Great job! You've completed the election knowledge assessment.</p>
          
          <div className="text-6xl font-bold text-primary mb-12">
            {Math.round((score / questions.length) * 100)}%
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={resetQuiz}
              className="w-full sm:w-auto px-8 py-4 border border-border rounded-2xl font-bold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-5 w-5" /> Retake Quiz
            </button>
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              Back to Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Progress */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Knowledge Assessment</span>
            <h1 className="text-2xl font-bold font-poppins">Question {currentQuestion + 1} of {questions.length}</h1>
          </div>
          <span className="text-sm font-bold text-foreground/40">
            {Math.round(((currentQuestion) / questions.length) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold font-poppins leading-snug">
              {q.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {q.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(i)}
                disabled={isAnswered}
                className={`p-6 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                  selectedOption === i 
                    ? isAnswered 
                      ? i === q.answer ? "bg-success/5 border-success text-success" : "bg-secondary/5 border-secondary text-secondary"
                      : "bg-primary/5 border-primary text-primary"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                <span className="font-semibold">{option}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedOption === i 
                    ? isAnswered 
                      ? i === q.answer ? "border-success bg-success text-white" : "border-secondary bg-secondary text-white"
                      : "border-primary bg-primary text-white"
                    : "border-border group-hover:border-primary/50"
                }`}>
                  {isAnswered && i === q.answer && <CheckCircle2 className="h-4 w-4" />}
                  {isAnswered && selectedOption === i && i !== q.answer && <XCircle className="h-4 w-4" />}
                </div>
              </button>
            ))}
          </div>

          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl ${selectedOption === q.answer ? "bg-success/5 border border-success/20" : "bg-secondary/5 border border-secondary/20"}`}
            >
              <div className="flex gap-3">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-1">{selectedOption === q.answer ? "Correct!" : "Incorrect"}</p>
                  <p className="text-sm opacity-80 leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end">
            {!isAnswered ? (
              <button 
                onClick={handleConfirm}
                disabled={selectedOption === null}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                Confirm Answer
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
              >
                {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
