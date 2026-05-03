import Link from "next/link";
import { 
  FileText, 
  ChevronRight, 
  Search, 
  MapPin, 
  Calendar,
  ArrowRight
} from "lucide-react";

const processes = [
  {
    id: "voter-id-registration",
    title: "New Voter (Form 6)",
    description: "Are you 18+? Learn how to apply for your first EPIC card online via the Voter Portal.",
    steps: 7,
    duration: "15-20 mins",
    category: "Registration"
  },
  {
    id: "epic-correction",
    title: "Correction (Form 8)",
    description: "Need to change your address or photo? Step-by-step guide for EPIC data correction.",
    steps: 5,
    duration: "10 mins",
    category: "Modification"
  },
  {
    id: "aadhaar-linking",
    title: "Aadhaar Linking (Form 6B)",
    description: "Secure your voter profile by linking your Aadhaar number with your EPIC card.",
    steps: 3,
    duration: "5 mins",
    category: "Verification"
  },
  {
    id: "booth-finder",
    title: "Find Your Polling Station",
    description: "Use your location to find nearby polling booths, check amenities, and get directions.",
    steps: 3,
    duration: "2 mins",
    category: "Polling"
  }
];

export default function ProcessPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">Election Process Guides</h1>
        <p className="text-foreground/60 max-w-2xl mx-auto">
          Comprehensive, step-by-step instructions for every stage of the election process.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30" />
          <input 
            type="text" 
            placeholder="Search for a guide..." 
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold">
            <MapPin className="h-4 w-4" />
            <span>India</span>
          </div>
          <button className="text-sm font-bold text-foreground/40 hover:text-primary transition-colors">
            Change Location
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {processes.map((p) => (
          <Link 
            key={p.id} 
            href={p.id === "booth-finder" ? `/process/booth-finder` : `/process/${p.id}`}
            className="group p-8 bg-card border border-border rounded-[2.5rem] hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full">
                {p.category}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold font-poppins mb-3 group-hover:text-primary transition-colors">{p.title}</h2>
            <p className="text-foreground/60 mb-8 leading-relaxed flex-1">
              {p.description}
            </p>
            
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex items-center gap-4 text-xs font-bold text-foreground/40">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {p.steps} Steps
                </div>
                <div className="flex items-center gap-1.5">
                  <ChevronRight className="h-4 w-4" />
                  {p.duration}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
