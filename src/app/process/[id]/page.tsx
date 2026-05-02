"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Circle, 
  Info, 
  FileCheck, 
  Clock, 
  ExternalLink,
  MessageSquare,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { markProcessCompleted, markProcessViewed } from "@/lib/db";
import LiveDataBadge from "@/components/LiveDataBadge";
import VerifyButton from "@/components/VerifyButton";

const mockProcess = {
  id: "voter-id-registration",
  title: "New Voter Registration (Form 6)",
  description: "Participate in the world's largest democratic exercise. Register for your EPIC card today.",
  steps: [
    {
      title: "Check Eligibility",
      description: "Ensure you are an Indian citizen and 18+ years of age.",
      details: "You must be a citizen of India and have attained the age of 18 years on the qualifying date (usually Jan 1st of the election year).",
      documents: ["Aadhaar Card", "Birth Certificate"],
      duration: "2 mins"
    },
    {
      title: "Prepare Digital Copies",
      description: "Keep your photograph and address proof ready for upload.",
      details: "You will need a passport-sized photograph (JPEG) and scanned copies of age and address proofs (PDF/JPEG).",
      documents: ["Passport Photo", "Electricity/Gas Bill"],
      duration: "5 mins"
    },
    {
      title: "Fill Form 6 on Voter Portal",
      description: "Complete the application on the NVSP or Voter Service Portal.",
      details: "Provide your constituency details, family EPIC numbers (if any), and current address accurately.",
      documents: [],
      duration: "15 mins"
    },
    {
      title: "Field Verification",
      description: "The Booth Level Officer (BLO) will visit for verification.",
      details: "A BLO will visit your residence to verify the documents and details provided in the application.",
      documents: [],
      duration: "BLO Visit"
    }
  ]
};

export default function ProcessDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (user && id) {
      markProcessViewed(user.uid, id);
    }
  }, [user, id]);

  const handleStepComplete = async (index: number) => {
    setCurrentStep(index + 1);
    if (user && index === mockProcess.steps.length - 1) {
      await markProcessCompleted(user.uid, id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/process" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Guides
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Progress & Content */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h1 className="text-4xl font-bold font-poppins mb-4">{mockProcess.title}</h1>
            <p className="text-lg text-foreground/60 leading-relaxed">
              {mockProcess.description}
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <LiveDataBadge />
            </motion.div>
          </section>

          <div className="space-y-4">
            {mockProcess.steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-3xl border transition-all ${
                  i === currentStep 
                    ? "bg-card border-primary ring-4 ring-primary/5 shadow-xl" 
                    : "bg-background border-border"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => handleStepComplete(i)}
                    className={`mt-1 shrink-0 ${i <= currentStep ? "text-primary" : "text-foreground/20"}`}
                  >
                    {i < currentStep ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-bold font-poppins ${i === currentStep ? "text-primary" : "text-foreground"}`}>
                        {step.title}
                      </h3>
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {step.duration}
                      </span>
                    </div>
                    <p className="text-foreground/60 text-sm mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {i === currentStep && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-border">
                          <p className="text-sm text-foreground/70 mb-4 italic">
                            {step.details}
                          </p>
                          {step.documents.length > 0 && (
                            <div className="bg-neutral-50 p-4 rounded-2xl">
                              <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FileCheck className="h-4 w-4" /> Required Documents
                              </h4>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {step.documents.map((doc, j) => (
                                  <li key={j} className="flex items-center gap-2 text-xs font-medium">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    {doc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Sticky Helper */}
        <div className="space-y-8">
          <div className="sticky top-24 space-y-6">
            {/* Verify Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-[2rem]"
            >
              <h3 className="font-bold font-poppins mb-2 text-emerald-900">Verify Your Status</h3>
              <p className="text-xs text-emerald-800 mb-4">
                Once you&apos;ve completed Step 2, use your Part Number to verify your status on the official ECI portal.
              </p>
              <VerifyButton
                state="TN"
                label="Check Registration Status"
                className="w-full"
              />
            </motion.div>

            {/* Quick Actions */}
            <div className="p-8 bg-primary text-white rounded-[2.5rem] shadow-xl shadow-primary/20">
              <h3 className="text-xl font-bold font-poppins mb-4">Questions?</h3>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Not sure about a specific step? Ask our AI assistant for instant clarification.
              </p>
              <Link 
                href="/assistant" 
                className="flex items-center justify-center gap-2 w-full py-4 bg-white text-primary rounded-2xl font-bold hover:bg-neutral-100 transition-all"
              >
                <MessageSquare className="h-5 w-5" />
                Ask AI Assistant
              </Link>
            </div>

            {/* Official Link */}
            <div className="p-6 bg-card border border-border rounded-[2rem]">
              <h4 className="text-sm font-bold font-poppins mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Official Resource
              </h4>
              <p className="text-xs text-foreground/60 mb-4 leading-relaxed">
                This guide is based on official instructions from the Election Commission of India (ECI).
              </p>
              <a 
                href="#" 
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl text-xs font-bold text-primary hover:bg-neutral-100 transition-all group"
              >
                Visit Official Site
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
