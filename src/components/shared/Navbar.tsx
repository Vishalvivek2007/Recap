import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { GradientText } from "./GradientText";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl italic tracking-tight hover:opacity-80 transition-opacity"
        >
          <GradientText>{APP_NAME}</GradientText>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <Link href="#features" className="hover:text-text-primary transition-colors">
            Features
          </Link>
          <Link href="#how" className="hover:text-text-primary transition-colors">
            How it works
          </Link>
          <Link href="#faq" className="hover:text-text-primary transition-colors">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/library"
            className="hidden md:inline text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Library
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}