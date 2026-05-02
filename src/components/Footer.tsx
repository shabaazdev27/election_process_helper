import Link from "next/link";
import { Vote, GitBranch, X, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-poppins text-xl font-bold text-primary">
              <Vote className="h-6 w-6" />
              <span>ElectionGuide</span>
            </Link>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Empowering citizens with knowledge about election processes through AI-driven education and interactive tools.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <GitBranch className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <X className="h-5 w-5" />
              </Link>
              <Link href="mailto:khanshabaaz05@gmail.com" className="text-foreground/60 hover:text-primary transition-colors" aria-label="Email Support">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-poppins font-semibold">Resources</h3>
            <ul className="flex flex-col gap-2 text-sm text-foreground/60">
              <li><Link href="/process" className="hover:text-primary transition-colors">Process Guides</Link></li>
              <li><Link href="/timeline" className="hover:text-primary transition-colors">Election Timeline</Link></li>
              <li><Link href="/quiz" className="hover:text-primary transition-colors">Knowledge Assessment</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Official Sources</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-poppins font-semibold">Support</h3>
            <ul className="flex flex-col gap-2 text-sm text-foreground/60">
              <li><Link href="mailto:khanshabaaz05@gmail.com" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/assistant" className="hover:text-primary transition-colors">AI Assistant</Link></li>
              <li><Link href="mailto:khanshabaaz05@gmail.com" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="mailto:khanshabaaz05@gmail.com" className="hover:text-primary transition-colors">Report Issues</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-poppins font-semibold">Legal</h3>
            <ul className="flex flex-col gap-2 text-sm text-foreground/60">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-foreground/40">
          <p>© {new Date().getFullYear()} ElectionGuide India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
