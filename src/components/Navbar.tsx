"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Vote, LayoutDashboard, FileText, Calendar, MessageSquare, GraduationCap, User, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Process Guide", href: "/process", icon: FileText },
  { name: "Timeline", href: "/timeline", icon: Calendar },
  { name: "AI Assistant", href: "/assistant", icon: MessageSquare },
  { name: "Quiz", href: "/quiz", icon: GraduationCap },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-poppins text-xl font-bold text-primary">
          <Vote className="h-6 w-6" />
          <span>ElectionGuide India</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-foreground/70"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[1.45rem] left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold">{user.displayName}</span>
                <span className="text-[10px] text-foreground/40">{user.email}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-foreground/60"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95"
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
