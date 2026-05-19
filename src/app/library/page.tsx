"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Mic, Search, Trash2, ArrowLeft } from "lucide-react";
import { getAllMeetings, deleteMeeting } from "@/lib/db/queries";
import { AuroraBackground } from "@/components/landing/AuroraBackground";
import { ROUTES } from "@/lib/constants";
import type { Meeting } from "@/types/meeting";

function formatDate(ms: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s > 0 ? `${s}s` : ""}`.trim();
}

export default function LibraryPage() {
  const router = useRouter();
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getAllMeetings().then((data) => {
      setMeetings(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteMeeting(id);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const filtered = meetings.filter(
    (m) =>
      !query ||
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.summary.tldr.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <AuroraBackground />

      <div className="min-h-screen relative">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link
              href={ROUTES.home}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors shrink-0"
            >
              <ArrowLeft className="size-4" />
              Home
            </Link>
            <h1 className="text-sm font-semibold text-text-primary flex-1">Library</h1>
            <Link
              href={ROUTES.record}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-hero text-white text-xs font-medium"
            >
              <Mic className="size-3" />
              New recording
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <input
              type="search"
              placeholder="Search meetings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl glass animate-pulse"
                  style={{ opacity: 1 - i * 0.2 }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <div className="size-16 rounded-full glass flex items-center justify-center">
                <Mic className="size-7 text-text-muted" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-text-primary">
                  {query ? "No matching recordings" : "No recordings yet"}
                </p>
                <p className="text-sm text-text-muted">
                  {query
                    ? "Try a different search term"
                    : "Start your first recording to see it here"}
                </p>
              </div>
              {!query && (
                <Link
                  href={ROUTES.record}
                  className="px-6 py-2.5 rounded-full bg-gradient-hero text-white text-sm font-medium"
                >
                  Start recording
                </Link>
              )}
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="flex flex-col gap-3">
                {filtered.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={ROUTES.result(m.id)}
                      className="group flex items-start gap-4 p-5 rounded-2xl glass hover:border-accent/20 transition-all duration-200 block"
                    >
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                          {m.title}
                        </p>
                        <p className="text-sm text-text-muted line-clamp-2">{m.summary.tldr}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                          <span>{formatDate(m.createdAt)}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDuration(m.duration)}
                          </span>
                          {m.summary.actionItems.length > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-accent">
                                {m.summary.actionItems.length} action{m.summary.actionItems.length !== 1 ? "s" : ""}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, m.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-text-muted hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </>
  );
}
