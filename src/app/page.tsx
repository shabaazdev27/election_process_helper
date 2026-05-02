import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Zap, 
  Globe, 
  BookOpen, 
  BarChart3,
  Calendar,
  MessageSquare
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section 
        className="relative px-4 pt-20 pb-32 md:pt-32 md:pb-48"
        aria-labelledby="hero-heading"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
        
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-8">
            <Zap className="h-3 w-3" />
            AI-Powered ECI Guide
          </div>
          
          <h1 id="hero-heading" className="text-4xl md:text-7xl font-bold font-poppins mb-6 leading-tight tracking-tight">
            Navigating the World&apos;s <br />
            <span className="text-primary">Largest Democracy</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-3xl mx-auto leading-relaxed">
            Simplified guides for Voter ID (EPIC), booth locating, and AI-driven assistance for the Lok Sabha and State Assembly elections.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
            >
              My Voter Dashboard
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/assistant" 
              className="w-full sm:w-auto px-8 py-4 bg-white border border-border rounded-xl font-bold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
            >
              Ask Election Assistant
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center justify-center gap-2 font-poppins font-semibold">
              <Shield className="h-5 w-5" /> ECI Verified
            </div>
            <div className="flex items-center justify-center gap-2 font-poppins font-semibold">
              <Globe className="h-5 w-5" /> All 28 States
            </div>
            <div className="flex items-center justify-center gap-2 font-poppins font-semibold">
              <CheckCircle className="h-5 w-5" /> NVSP Integrated
            </div>
            <div className="flex items-center justify-center gap-2 font-poppins font-semibold">
              <BarChart3 className="h-5 w-5" /> Live Booth Data
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section 
        className="py-24 bg-card"
        aria-labelledby="features-heading"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl md:text-5xl font-bold font-poppins mb-4">Master the Indian Voting Process</h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              From Form 6 registration to finding your part number on the electoral roll, we&apos;ve got you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Voter ID Guide",
                description: "Complete walkthrough for new registrations, EPIC corrections, and Aadhar-Voter ID linking via Form 6B.",
                icon: BookOpen,
                color: "bg-blue-600"
              },
              {
                title: "Election Timeline",
                description: "Stay updated with notification dates, withdrawal deadlines, and phase-wise polling schedules for your constituency.",
                icon: Calendar,
                color: "bg-orange-500"
              },
              {
                title: "ECI AI Assistant",
                description: "Ask about your booth, your BLO details, or required ID proofs. Powered by Gemini and official ECI data.",
                icon: MessageSquare,
                color: "bg-green-600"
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl border border-border bg-background hover:shadow-xl transition-all group">
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-poppins mb-3">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <Link href={i === 0 ? "/process" : i === 1 ? "/timeline" : "/assistant"} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                  View Guide <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-24"
        aria-labelledby="cta-heading"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative rounded-[3rem] bg-primary p-12 md:p-20 overflow-hidden text-center text-white shadow-2xl shadow-primary/40">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <h2 id="cta-heading" className="text-3xl md:text-5xl font-bold font-poppins mb-6 relative z-10">Ready to cast your vote?</h2>
            <p className="text-white/80 mb-10 max-w-xl mx-auto relative z-10 text-lg">
              Join millions of responsible citizens. Check your name in the electoral roll today.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex px-10 py-5 bg-white text-primary rounded-2xl font-bold text-lg hover:bg-neutral-100 transition-all shadow-xl relative z-10"
            >
              Check Electoral Roll
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
