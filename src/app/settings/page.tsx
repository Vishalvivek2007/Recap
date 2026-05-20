"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowLeft, Sun, Moon, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { AuroraBackground } from "@/components/landing/AuroraBackground";
import { GradientText } from "@/components/shared/GradientText";
import { db } from "@/lib/db/schema";
import { getAllMeetings } from "@/lib/db/queries";
import { APP_NAME, APP_DESCRIPTION, ROUTES } from "@/lib/constants";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TECH_STACK = ["Next.js", "Groq", "Whisper", "Llama 3.3", "Three.js"] as const;

const ease = [0.16, 1, 0.3, 1] as const;

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Section({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
      className="glass rounded-2xl p-6 flex flex-col gap-5"
    >
      {children}
    </motion.section>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
      <p className="text-xs text-text-muted">{description}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [meetingCount, setMeetingCount] = React.useState<number | null>(null);
  const [storageUsed, setStorageUsed] = React.useState<string | null>(null);
  const [clearing, setClearing] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    getAllMeetings().then((meetings) => {
      setMeetingCount(meetings.length);
      const totalBytes = meetings.reduce(
        (sum, m) => sum + (m.audioBlob?.size ?? 0),
        0
      );
      setStorageUsed(formatBytes(totalBytes));
    });
  }, []);

  async function handleClearData() {
    setClearing(true);
    try {
      await db.meetings.clear();
      setMeetingCount(0);
      setStorageUsed(formatBytes(0));
      setDialogOpen(false);
      toast.success("All data cleared");
    } catch {
      toast.error("Failed to clear data");
    } finally {
      setClearing(false);
    }
  }

  return (
    <>
      <AuroraBackground />

      <div className="min-h-screen relative">
        <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link
              href={ROUTES.home}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors shrink-0"
            >
              <ArrowLeft className="size-4" />
              Home
            </Link>
            <span className="text-border-subtle select-none">·</span>
            <h1 className="text-sm font-semibold text-text-primary flex-1">
              Settings
            </h1>
            <Link
              href={ROUTES.library}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Library
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="font-display text-3xl italic">
              <GradientText>Settings</GradientText>
            </h2>
            <p className="text-text-muted text-sm mt-1.5">
              Manage your preferences and local data.
            </p>
          </motion.div>

          {/* Appearance */}
          <Section delay={0.08}>
            <SectionHeader
              title="Appearance"
              description="Choose your preferred color scheme."
            />
            {mounted && (
              <div className="flex gap-2">
                {(
                  [
                    { value: "light", label: "Light", Icon: Sun },
                    { value: "dark", label: "Dark", Icon: Moon },
                  ] as const
                ).map(({ value, label, Icon }) => {
                  const active = theme === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      aria-pressed={active}
                      className={[
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200",
                        active
                          ? "border-[hsl(var(--accent)/0.5)] bg-[hsl(var(--accent)/0.08)] text-text-primary"
                          : "border-border-subtle text-text-muted hover:text-text-primary hover:border-border-strong bg-transparent",
                      ].join(" ")}
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Storage */}
          <Section delay={0.14}>
            <SectionHeader
              title="Storage"
              description="Meeting data is stored locally in your browser — never uploaded."
            />

            <div className="flex items-center gap-8">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">
                  Meetings
                </span>
                <span className="text-2xl font-semibold tabular-nums text-text-primary">
                  {meetingCount ?? "—"}
                </span>
              </div>
              <div className="w-px h-10 bg-border-subtle" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">
                  Audio stored
                </span>
                <span className="text-2xl font-semibold tabular-nums text-text-primary">
                  {storageUsed ?? "—"}
                </span>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button className="self-start flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--destructive)/0.35)] text-[hsl(var(--destructive))] text-sm font-medium hover:bg-[hsl(var(--destructive)/0.06)] transition-all duration-200">
                  <Trash2 className="size-4" />
                  Clear all data
                </button>
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="!bg-bg-elevated border-border-strong"
              >
                <DialogHeader>
                  <DialogTitle className="text-text-primary font-semibold">
                    Clear all data?
                  </DialogTitle>
                  <DialogDescription className="text-text-muted">
                    This permanently deletes all{" "}
                    {meetingCount != null && meetingCount > 0
                      ? `${meetingCount} meeting${meetingCount === 1 ? "" : "s"}`
                      : "meetings"}
                    , including transcripts, summaries, and audio recordings.
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="border-none !bg-transparent !p-0 mt-1 gap-2">
                  <DialogClose asChild>
                    <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-strong transition-all duration-200">
                      Cancel
                    </button>
                  </DialogClose>
                  <button
                    onClick={handleClearData}
                    disabled={clearing}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium bg-[hsl(var(--destructive))] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {clearing ? "Clearing…" : "Delete everything"}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Section>

          {/* About */}
          <Section delay={0.2}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-xl italic">
                  <GradientText>{APP_NAME}</GradientText>
                </span>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
                  {APP_DESCRIPTION}
                </p>
                <p className="text-xs text-text-muted">
                  Built for 8x Engineer
                </p>
              </div>
              <a
                href="https://github.com/Vishalvivek2007/Recap"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle text-xs text-text-muted hover:text-text-primary hover:border-border-strong transition-all duration-200"
              >
                <ExternalLink className="size-3.5" />
                GitHub
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.06)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Section>
        </main>
      </div>
    </>
  );
}
