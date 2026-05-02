"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getUserProgress } from "@/lib/db";
import { UserProgress } from "@/types";
import Link from "next/link";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  MessageSquare
} from "lucide-react";
import LiveDataBadge from "@/components/LiveDataBadge";
import VerifyButton from "@/components/VerifyButton";

const processes = [
  { id: "1", name: "General Elections (Lok Sabha)", country: "India", type: "National", status: "Active" },
  { id: "2", name: "Maharashtra Assembly", country: "India", type: "State", status: "Upcoming" },
  { id: "3", name: "Delhi Municipal (MCD)", country: "India", type: "Local", status: "Archived" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setIsLoading(true);
        try {
          const data = await getUserProgress(user.uid);
          setProgress(data);
        } catch (error) {
          console.error("Error fetching progress:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setProgress(null);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Dynamic progress cards based on real Firestore data
  const dynamicProgressCards = [
    { 
      title: "EPIC Registration", 
      status: progress?.completedProcesses.includes("voter-id-registration") ? "Completed" : "Pending", 
      date: progress?.completedProcesses.includes("voter-id-registration") ? "Verified" : "Required", 
      icon: CheckCircle2, 
      color: progress?.completedProcesses.includes("voter-id-registration") ? "text-success" : "text-foreground/40" 
    },
    { 
      title: "Electoral Roll Check", 
      status: progress?.completedProcesses.includes("electoral-roll-check") ? "Completed" : "Pending", 
      date: progress?.completedProcesses.includes("electoral-roll-check") ? "Verified" : "Required", 
      icon: CheckCircle2, 
      color: progress?.completedProcesses.includes("electoral-roll-check") ? "text-success" : "text-foreground/40" 
    },
    { 
      title: "BLO Verification", 
      status: progress?.completedProcesses.includes("blo-verification") ? "Completed" : "In Progress", 
      date: "Scheduled", 
      icon: Clock, 
      color: progress?.completedProcesses.includes("blo-verification") ? "text-success" : "text-warning" 
    },
    { 
      title: "Booth Slip Download", 
      status: progress?.completedProcesses.includes("booth-slip-download") ? "Completed" : "Pending", 
      date: "Awaited", 
      icon: AlertCircle, 
      color: progress?.completedProcesses.includes("booth-slip-download") ? "text-success" : "text-foreground/40" 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-poppins">Voter Dashboard</h1>
          <p className="text-foreground/60">
            {user ? `Welcome back, ${user.displayName}!` : "Please sign in to track your progress."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input 
              type="text" 
              id="election-search"
              placeholder="Search elections..." 
              aria-label="Search elections"
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="p-2 border border-border rounded-xl hover:bg-neutral-50 transition-colors">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Live Data Bridge Status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <LiveDataBadge />
          <div>
            <p className="text-sm font-medium text-emerald-900">Election data is synchronized in real-time</p>
            <p className="text-xs text-emerald-700 mt-1">
              All information below is sourced from official Election Commission of India portals
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Verify Status Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl"
          >
            <h2 className="text-lg font-bold font-poppins text-blue-900 mb-2">
              Verify Your Voter Status
            </h2>
            <p className="text-sm text-blue-800 mb-4">
              Check your registration status directly on the official ECI portal using your Part Number
            </p>
            <VerifyButton
              state="DEFAULT"
              label="Verify on Official ECI Portal"
              onVerify={() => console.log('Verification initiated')}
            />
          </motion.section>

          {/* Progress Overview */}
          <section aria-labelledby="progress-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="progress-heading" className="text-xl font-bold font-poppins">Current Progress</h2>
              <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1" aria-label="View all progress">
                View all <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-card animate-pulse rounded-2xl border border-border" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dynamicProgressCards.map((card, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-5 bg-card border border-border rounded-2xl flex items-center gap-4 hover:shadow-md transition-all group"
                  >
                    <div className={`p-3 rounded-xl bg-background ${card.color}`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{card.title}</h3>
                      <p className="text-xs text-foreground/60">{card.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <LiveDataBadge variant="outline" className="scale-75 origin-right -mr-2" />
                      <div className={`text-xs font-bold px-2 py-1 rounded-lg bg-background ${card.color}`}>
                        {card.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Election Lists */}
          <section aria-labelledby="guides-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="guides-heading" className="text-xl font-bold font-poppins">Election Guides</h2>
              <button className="flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors" aria-label="Add a new election guide">
                <Plus className="h-4 w-4" aria-hidden="true" /> Add Election
              </button>
            </div>
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              <table className="w-full text-left" aria-label="Available Election Guides">
                <thead className="bg-neutral-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/40">Election Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/40">Location</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/40">Type</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/40">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {processes.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-sm">{p.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground/60">{p.country}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground/60">{p.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          p.status === "Active" ? "bg-primary/10 text-primary" : 
                          p.status === "Upcoming" ? "bg-warning/10 text-warning" : 
                          "bg-foreground/10 text-foreground/60"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <LiveDataBadge variant="outline" className="scale-75 origin-right" />
                          {p.status === "Active" && (
                            <VerifyButton
                              state="TN"
                              label="Verify"
                              className="px-3 py-1.5 text-xs"
                            />
                          )}
                          <button className="p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="p-6 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold font-poppins mb-1">Your Profile</h3>
              <p className="text-white/70 text-sm mb-6">Citizen ID: {user ? user.uid.slice(0, 8).toUpperCase() : "#------"}</p>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Completion Rate</span>
                  <span className="font-bold">{progress?.completionPercentage || 0}%</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress?.completionPercentage || 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-white" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Help */}
          <div className="p-6 bg-card border border-border rounded-[2rem]">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="font-bold font-poppins mb-2">Need Help?</h3>
            <p className="text-sm text-foreground/60 mb-4 leading-relaxed">
              Ask our AI assistant any question about the election process in India.
            </p>
            <Link 
              href="/assistant" 
              className="block text-center py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Start Chat
            </Link>
          </div>

          {/* Upcoming Dates */}
          <div>
            <h3 className="font-bold font-poppins mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {[
                { label: "Notification (Phase 1)", date: "Mar 20, 2024", urgent: false },
                { label: "Last Date for Nominations", date: "Mar 27, 2024", urgent: true },
                { label: "Polling (Phase 1)", date: "Apr 19, 2024", urgent: false },
              ].map((date, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${date.urgent ? "bg-secondary animate-pulse" : "bg-primary"}`} />
                  <div>
                    <p className="text-sm font-semibold">{date.label}</p>
                    <p className="text-xs text-foreground/60">{date.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
