"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Trophy,
  ArrowRight,
  Info
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { saveQuizResultAction } from "@/lib/db-actions";

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
  },
  {
    question: "Which form is used for new voter registration?",
    options: ["Form 6", "Form 7", "Form 8", "Form 12"],
    answer: 0,
    explanation: "Form 6 is used for new registration of voters or for shifting from one constituency to another."
  },
  {
    question: "What is the full form of EPIC in the context of Indian elections?",
    options: ["Election People ID Card", "Electoral Photo Identity Card", "Every Person Identity Code", "Electronic Photo Info Card"],
    answer: 1,
    explanation: "EPIC stands for Electoral Photo Identity Card, commonly known as the Voter ID card."
  },
  {
    question: "Which form is used for objection or deletion of a name in the electoral roll?",
    options: ["Form 6", "Form 7", "Form 8", "Form 6B"],
    answer: 1,
    explanation: "Form 7 is specifically used for seeking objection to inclusion of a name or seeking deletion of a name from the electoral roll."
  },
  {
    question: "Who was the first Chief Election Commissioner of India?",
    options: ["T. N. Seshan", "Sukumar Sen", "Sunil Arora", "Kalyan Sundaram"],
    answer: 1,
    explanation: "Sukumar Sen was the first Chief Election Commissioner of India, serving from 1950 to 1958."
  },
  {
    question: "What is the maximum number of candidates an EVM (with 4 balloting units) can cater to?",
    options: ["16", "32", "64", "256"],
    answer: 2,
    explanation: "A single balloting unit can cater to 16 candidates. By connecting 4 units, an EVM can cater to a maximum of 64 candidates (including NOTA)."
  },
  {
    question: "What does VVPAT stand for?",
    options: ["Voter Verifiable Paper Audit Trail", "Voter Visual Paper Action Tracker", "Virtual Voter Paper Audit Tool", "Voter Verification Priority Audit Trail"],
    answer: 0,
    explanation: "VVPAT stands for Voter Verifiable Paper Audit Trail. It allows voters to verify that their vote was cast as intended."
  },
  {
    question: "What is the color of the ink used to mark a voter's finger?",
    options: ["Permanent Black", "Indelible Ink (Violet/Purple)", "Surgical Blue", "Silver Nitrate White"],
    answer: 1,
    explanation: "Indelible ink, containing silver nitrate, is used to mark the left forefinger to prevent multiple voting."
  },
  {
    question: "Which article of the Indian Constitution provides for the Election Commission?",
    options: ["Article 324", "Article 356", "Article 370", "Article 280"],
    answer: 0,
    explanation: "Article 324 of the Constitution provides for the establishment of the Election Commission for the superintendence, direction, and control of elections."
  },
  {
    question: "What is the residency requirement to be registered in a constituency?",
    options: ["1 year", "6 months", "Ordinary resident", "Permanent resident for 10 years"],
    answer: 2,
    explanation: "A person must be an 'ordinary resident' in the constituency where they want to be registered as a voter."
  },
  {
    question: "Which form is used for correction of entries in the existing electoral roll?",
    options: ["Form 6", "Form 8", "Form 10", "Form 18"],
    answer: 1,
    explanation: "Form 8 is used for correction of entries, shifting within the constituency, and replacement of EPIC."
  },
  {
    question: "How many members are there in the Election Commission of India currently?",
    options: ["One", "Two", "Three", "Five"],
    answer: 2,
    explanation: "Since 1993, the Election Commission has been a three-member body consisting of the Chief Election Commissioner and two Election Commissioners."
  },
  {
    question: "What is the time period for the Model Code of Conduct (MCC)?",
    options: ["1 month before polling", "From the announcement of the election until results", "Only on polling day", "1 week before polling"],
    answer: 1,
    explanation: "The MCC comes into operation from the date the election schedule is announced by the ECI and stays in force until the results are declared."
  },
  {
    question: "What is the maximum limit of election expenditure for a Lok Sabha candidate (in larger states)?",
    options: ["50 Lakhs", "75 Lakhs", "95 Lakhs", "1.5 Crores"],
    answer: 2,
    explanation: "As of recent updates, the expenditure limit for a candidate in a Lok Sabha constituency is up to 95 Lakhs in larger states."
  },
  {
    question: "Can an NRI (Non-Resident Indian) vote in Indian elections?",
    options: ["No", "Yes, by post only", "Yes, in person at the polling station", "Only if they have dual citizenship"],
    answer: 2,
    explanation: "NRIs can register as Overseas Voters (Form 6A) but they currently must be physically present at the polling station in India to cast their vote."
  },
  {
    question: "Which state in India was the first to use EVMs on an experimental basis?",
    options: ["Kerala", "Goa", "Tamil Nadu", "Gujarat"],
    answer: 0,
    explanation: "EVMs were first used in India in 1982 in the Paravur Assembly Constituency in Kerala on an experimental basis."
  },
  {
    question: "What is a 'Tendered Vote'?",
    options: ["A vote cast by a child", "A vote cast when someone else has already voted in your name", "A vote cast via post", "A vote cast by a candidate"],
    answer: 1,
    explanation: "A Tendered Vote is cast when a voter discovers that someone else has already voted in their name. It is cast on a ballot paper, not the EVM."
  },
  {
    question: "What is the purpose of 'Form 12D'?",
    options: ["New registration", "Postal ballot for 80+ seniors and PwD", "Application for EPIC correction", "Request for booth change"],
    answer: 1,
    explanation: "Form 12D is used by senior citizens (80+) and Persons with Disabilities (PwD) to opt for postal ballot voting from home."
  },
  {
    question: "Who appoints the Chief Election Commissioner of India?",
    options: ["Prime Minister", "Chief Justice of India", "President of India", "Speaker of Lok Sabha"],
    answer: 2,
    explanation: "The President of India appoints the Chief Election Commissioner and the Election Commissioners."
  },
  {
    question: "What is the symbol of the 'None of the Above' (NOTA) option?",
    options: ["A black cross", "A ballot paper with a cross on all candidates", "A magnifying glass", "A human figure standing alone"],
    answer: 1,
    explanation: "The NOTA symbol is a rectangular box with a ballot paper and a cross mark over all the candidates."
  },
  {
    question: "What is 'C-Vigil'?",
    options: ["An app to track candidates", "An app to report MCC violations", "A website to see results", "A helpline for old voters"],
    answer: 1,
    explanation: "cVIGIL is a mobile application developed by ECI to enable citizens to report Model Code of Conduct violations during elections."
  },
  {
    question: "Which constitutional amendment lowered the voting age from 21 to 18?",
    options: ["42nd Amendment", "44th Amendment", "61st Amendment", "73rd Amendment"],
    answer: 2,
    explanation: "The 61st Constitutional Amendment Act, 1988, lowered the voting age from 21 to 18 years."
  },
  {
    question: "What is the 'Qualifying Date' for being enrolled in the electoral roll?",
    options: ["Election Day", "Date of nomination", "January 1st, April 1st, July 1st, or October 1st", "Only January 1st"],
    answer: 2,
    explanation: "Following recent reforms, there are four qualifying dates: Jan 1st, April 1st, July 1st, and Oct 1st of the year of the roll revision."
  },
  {
    question: "Which form is used for voluntary linking of Aadhaar with Voter ID?",
    options: ["Form 6", "Form 6B", "Form 8", "Form 11"],
    answer: 1,
    explanation: "Form 6B is used by existing electors to share their Aadhaar number with the ECI for authentication purposes."
  },
  {
    question: "Who is responsible for the preparation of Electoral Rolls in a constituency?",
    options: ["District Magistrate", "Electoral Registration Officer (ERO)", "Booth Level Officer (BLO)", "Returning Officer (RO)"],
    answer: 1,
    explanation: "The Electoral Registration Officer (ERO) is primarily responsible for the preparation and revision of the electoral rolls for the constituency."
  },
  {
    question: "Who is the officer in charge of the conduct of elections in a constituency?",
    options: ["Electoral Registration Officer", "Returning Officer (RO)", "Chief Electoral Officer", "Observer"],
    answer: 1,
    explanation: "The Returning Officer (RO) is responsible for the conduct of elections in a particular constituency."
  },
  {
    question: "What is the maximum distance a voter should have to travel to a polling station?",
    options: ["1 km", "2 km", "5 km", "10 km"],
    answer: 1,
    explanation: "ECI guidelines state that no voter should ordinarily have to travel more than 2 km to reach a polling station."
  },
  {
    question: "Which state became the first to use VVPAT in all constituencies during an assembly election?",
    options: ["Goa", "Himachal Pradesh", "Gujarat", "Nagaland"],
    answer: 0,
    explanation: "Goa was the first state where VVPAT was used in all constituencies during the 2017 Assembly Elections."
  },
  {
    question: "What is the 'SVEEP' program?",
    options: ["A cleaning drive in ECI offices", "Systematic Voters' Education and Electoral Participation", "Senior Voter Easy Enrollment Process", "State Voter Electronic Enrollment Platform"],
    answer: 1,
    explanation: "SVEEP is the flagship program of the ECI for voter education, spreading voter awareness and promoting voter literacy in India."
  },
  {
    question: "Which form is used for registration as an Overseas Voter?",
    options: ["Form 6", "Form 6A", "Form 6B", "Form 8"],
    answer: 1,
    explanation: "Form 6A is the specific form for Non-Resident Indians (NRIs) to register as overseas electors."
  },
  {
    question: "What is the function of an 'Election Observer'?",
    options: ["To vote on behalf of others", "To monitor and ensure free and fair elections", "To count votes only", "To assist candidates in campaigning"],
    answer: 1,
    explanation: "Election Observers are appointed by the ECI to monitor the election process and ensure it is conducted in a free, fair, and transparent manner."
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
        await saveQuizResultAction(user.uid, "general-election-quiz", score, questions.length);
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
          <p className="text-foreground/60 mb-8">Great job! You&apos;ve completed the election knowledge assessment.</p>
          
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
        <div 
          className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(((currentQuestion) / questions.length) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
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
              role="alert"
              aria-live="polite"
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
