"use client";

import { motion } from "framer-motion";
import { 
  Calendar, 
  Flag, 
  Bell, 
  ChevronRight,
  Download,
  Share2
} from "lucide-react";

const phases = [
  {
    name: "Pre-Polling Phase",
    date: "March - April 2024",
    status: "Completed",
    milestones: [
      { title: "ECI Notification", date: "Mar 16", status: "Completed" },
      { title: "Phase 1 Nominations", date: "Mar 20 - Mar 27", status: "Completed" },
      { title: "Scrutiny of Papers", date: "Mar 28", status: "Completed" },
    ]
  },
  {
    name: "Polling Phase (General Elections)",
    date: "April - June 2024",
    status: "Active",
    milestones: [
      { title: "Phase 1 Polling", date: "Apr 19", status: "Completed" },
      { title: "Phase 4 Polling", date: "May 13", status: "Active" },
      { title: "Final Phase (Phase 7)", date: "Jun 01", status: "Upcoming" },
    ]
  },
  {
    name: "Counting & Results",
    date: "June 4, 2024",
    status: "Upcoming",
    milestones: [
      { title: "Counting of Votes", date: "Jun 04", status: "Upcoming" },
      { title: "Results Declaration", date: "Jun 04", status: "Upcoming" },
      { title: "Formation of Govt", date: "By Jun 16", status: "Upcoming" },
    ]
  }
];

export default function TimelinePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">Election Timeline</h1>
          <p className="text-foreground/60 max-w-2xl">
            Stay ahead of key dates and deadlines for the upcoming 2024 Indian General Election (Lok Sabha).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>

      <div className="space-y-16">
        {phases.map((phase, i) => (
          <div key={i} className="relative">
            {/* Phase Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-3 rounded-2xl ${phase.status === "Active" ? "bg-primary text-white" : "bg-neutral-100 text-foreground/40"}`}>
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-poppins">{phase.name}</h2>
                <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">{phase.date}</p>
              </div>
              {phase.status === "Active" && (
                <span className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 bg-success rounded-full animate-pulse" />
                  Active Phase
                </span>
              )}
            </div>

            {/* Timeline Vertical Line */}
            <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-border -z-10 hidden md:block" />

            {/* Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ml-0 md:ml-16">
              {phase.milestones.map((ms, j) => (
                <motion.div 
                  key={j}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: j * 0.1 }}
                  className="p-6 bg-card border border-border rounded-3xl hover:shadow-xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/5 rounded-lg">
                      {ms.date}
                    </span>
                    {ms.status === "Completed" ? (
                      <Flag className="h-4 w-4 text-success" />
                    ) : (
                      <Bell className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <h3 className="font-bold font-poppins mb-2 group-hover:text-primary transition-colors">
                    {ms.title}
                  </h3>
                  <button className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors">
                    Details <ChevronRight className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Subscription CTA */}
      <section className="mt-24 p-8 md:p-12 bg-neutral-900 text-white rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold font-poppins mb-4">Get Important Alerts</h2>
            <p className="text-white/60">
              Receive timely notifications about upcoming deadlines and changes to the election schedule directly to your inbox.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 md:w-64 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
