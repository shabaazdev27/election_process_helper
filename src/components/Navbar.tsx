"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Vote, LayoutDashboard, FileText, Calendar, MessageSquare, GraduationCap, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Process Guide", href: "/process", icon: FileText },
  { name: "Timeline", href: "/timeline", icon: Calendar },
  { name: "AI Assistant", href: "/assistant", icon: MessageSquare },
  { name: "Quiz", href: "/quiz", icon: GraduationCap },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <nav 
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md"
      aria-label="Main Navigation"
      data-testid="main-navigation"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 font-poppins text-xl font-bold text-primary"
          aria-label="ElectionGuide India Home"
        >
          <Vote className="h-6 w-6" aria-hidden="true" />
          <span>ElectionGuide India</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
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
          <div className="hidden sm:block px-4 py-2 text-xs font-bold text-primary/40 uppercase tracking-widest border border-primary/10 rounded-full">
            ECI Guided
          </div>
          <button 
            className="md:hidden p-2 text-foreground/70 hover:text-primary transition-colors"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
            data-testid="mobile-menu-button"
            data-state={isOpen ? "open" : "closed"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    data-testid={`mobile-nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-neutral-50"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
