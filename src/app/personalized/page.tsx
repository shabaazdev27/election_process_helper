"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCircle, 
  MapPin, 
  Languages, 
  Target, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

const states = [
  "Maharashtra", "Delhi", "Uttar Pradesh", "Karnataka", "Tamil Nadu", "West Bengal", "Gujarat"
];

const languages = [
  "English", "Hindi", "Marathi", "Bengali", "Tamil", "Kannada", "Gujarati"
];

const interests = [
  "New Registration", "Voter ID Correction", "Aadhaar Linking", "Booth Locating", "Candidate Information"
];

import { useAuth } from "@/components/AuthProvider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PersonalizedPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState({
    state: "",
    language: "",
    interests: [] as string[]
  });

  const handleFinish = async () => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        preferences: prefs,
        onboarded: true
      });
    }
  };

  const handleInterestToggle = (interest: string) => {
    setPrefs(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const isStepValid = () => {
    if (step === 1) return prefs.state !== "";
    if (step === 2) return prefs.language !== "";
    if (step === 3) return prefs.interests.length > 0;
    return true;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-poppins mb-4">Create Your Voter Path</h1>
        <p className="text-foreground/60 max-w-xl mx-auto">
          Tell us a bit about yourself so we can tailor the election guides and timelines to your specific needs.
        </p>
      </div>

      <div className="bg-card border border-border rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-primary/5">
        {/* Progress Bar */}
        <div className="flex justify-between mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= i ? "bg-primary text-white" : "bg-neutral-100 text-foreground/40"
              }`}>
                {step > i ? <CheckCircle2 className="h-6 w-6" /> : i}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i ? "text-primary" : "text-foreground/40"}`}>
                {i === 1 ? "State" : i === 2 ? "Language" : i === 3 ? "Interests" : "Ready"}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold font-poppins">Which state do you live in?</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {states.map((state) => (
                  <button
                    key={state}
                    onClick={() => setPrefs({ ...prefs, state })}
                    className={`p-4 rounded-2xl border text-sm font-semibold transition-all ${
                      prefs.state === state 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Languages className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold font-poppins">Preferred Language?</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setPrefs({ ...prefs, language: lang })}
                    className={`p-4 rounded-2xl border text-sm font-semibold transition-all ${
                      prefs.language === lang 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold font-poppins">What are you looking for?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-5 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between ${
                      prefs.interests.includes(interest)
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    {interest}
                    {prefs.interests.includes(interest) && <CheckCircle2 className="h-5 w-5" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-6">
                <Sparkles className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold font-poppins mb-4">Your Path is Ready!</h2>
              <p className="text-foreground/60 mb-10 max-w-sm mx-auto">
                We've customized your dashboard with guides and timelines specifically for {prefs.state}.
              </p>
              <button 
                onClick={async () => {
                  await handleFinish();
                  window.location.href = "/dashboard";
                }}
                className="inline-flex px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 items-center gap-2"
              >
                Go to My Dashboard
                <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && (
          <div className="mt-12 flex justify-between">
            <button
              onClick={() => setStep(prev => prev - 1)}
              disabled={step === 1}
              className="px-6 py-3 border border-border rounded-xl font-bold text-sm hover:bg-neutral-50 disabled:opacity-0 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep(prev => prev + 1)}
              disabled={!isStepValid()}
              className="px-10 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
