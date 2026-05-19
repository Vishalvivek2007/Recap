import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { GradientText } from "@/components/shared/GradientText";

export function Footer() {
  return (
    <footer className="relative px-6 py-12 border-t border-border-subtle">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl italic">
            <GradientText>{APP_NAME}</GradientText>
          </span>
          <span className="text-text-muted text-sm">
            · Built for 8x Engineer
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-text-muted">
          <Link href="/library" className="hover:text-text-primary transition-colors">
            Library
          </Link>
          <Link href="/settings" className="hover:text-text-primary transition-colors">
            Settings
          </Link>
          
           <a href="https://github.com/Vishalvivek2007/Recap"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}