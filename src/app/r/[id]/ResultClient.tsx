"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Copy,
  Check,
  ChevronRight,
  Zap,
  FileText,
  ListChecks,
  Gavel,
} from "lucide-react";
import Link from "next/link";
import { getMeeting } from "@/lib/db/queries";
import type { Meeting, ActionItem, Decision, KeyPointGroup } from "@/types/meeting";
import { ROUTES } from "@/lib/constants";

interface Props {
  id: string;
}

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ms));
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s > 0 ? `${s}s` : ""}`.trim();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs text-text-secondary hover:text-text-primary transition-all"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 text-success"
          >
            <Check className="size-3" />
            Copied
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1"
          >
            <Copy className="size-3" />
            Copy
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

type Tab = "overview" | "transcript" | "actions" | "decisions";

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: "overview", label: "Overview", icon: <Zap className="size-3.5" /> },
  { key: "transcript", label: "Transcript", icon: <FileText className="size-3.5" /> },
  { key: "actions", label: "Action Items", icon: <ListChecks className="size-3.5" /> },
  { key: "decisions", label: "Decisions", icon: <Gavel className="size-3.5" /> },
];

function OverviewTab({ meeting }: { meeting: Meeting }) {
  const { summary } = meeting;

  return (
    <div className="flex flex-col gap-6">
      {/* Topics */}
      {summary.topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summary.topics.map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full text-xs font-medium glass text-text-secondary"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Key Points */}
      {summary.keyPoints.length > 0 && (
        <div className="flex flex-col gap-4">
          {summary.keyPoints.map((group: KeyPointGroup) => (
            <div key={group.topic} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                {group.topic}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {group.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                    <ChevronRight className="size-3.5 mt-0.5 shrink-0 text-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Open Questions */}
      {summary.questions.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Open Questions
          </h3>
          <ul className="flex flex-col gap-2">
            {summary.questions.map((q, i) => (
              <li
                key={i}
                className="px-4 py-2.5 rounded-xl glass text-sm text-text-primary border-l-2 border-accent-amber"
              >
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TranscriptTab({ meeting }: { meeting: Meeting }) {
  const { transcript } = meeting;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {transcript.language ? `Language: ${transcript.language.toUpperCase()}` : ""}
        </span>
        <CopyButton text={transcript.text} />
      </div>

      {transcript.segments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {transcript.segments.map((seg) => (
            <div key={seg.id} className="flex gap-3">
              <span className="text-xs text-text-muted font-mono mt-0.5 w-12 shrink-0">
                {formatTimecode(seg.start)}
              </span>
              <p className="text-sm text-text-primary leading-relaxed">{seg.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
          {transcript.text}
        </p>
      )}
    </div>
  );
}

function formatTimecode(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ActionsTab({ items }: { items: ActionItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-text-muted py-6 text-center">
        No action items identified in this recording.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-4 rounded-xl glass"
        >
          <div className="size-6 rounded-full bg-gradient-hero shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5">
            {i + 1}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-sm text-text-primary font-medium">{item.task}</p>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>{item.assignee}</span>
              {item.deadline && (
                <>
                  <span>·</span>
                  <span className="text-accent-amber">{item.deadline}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DecisionsTab({ decisions }: { decisions: Decision[] }) {
  if (decisions.length === 0) {
    return (
      <p className="text-sm text-text-muted py-6 text-center">
        No explicit decisions identified in this recording.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {decisions.map((d, i) => (
        <div key={i} className="p-4 rounded-xl glass flex flex-col gap-1.5">
          <p className="text-sm text-text-primary font-medium">{d.decision}</p>
          <p className="text-xs text-text-muted leading-relaxed">{d.context}</p>
        </div>
      ))}
    </div>
  );
}

export function ResultClient({ id }: Props) {
  const router = useRouter();
  const [meeting, setMeeting] = React.useState<Meeting | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<Tab>("overview");

  React.useEffect(() => {
    getMeeting(id).then((m) => {
      if (!m) {
        router.replace(ROUTES.record);
        return;
      }
      setMeeting(m);
      setLoading(false);
    });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-text-muted text-sm"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!meeting) return null;

  const fullText = [
    `# ${meeting.summary.title}`,
    `\nDate: ${formatDate(meeting.createdAt)}`,
    `\n## TL;DR\n${meeting.summary.tldr}`,
    meeting.summary.keyPoints.length > 0
      ? `\n## Key Points\n${meeting.summary.keyPoints
          .map((g) => `### ${g.topic}\n${g.points.map((p) => `- ${p}`).join("\n")}`)
          .join("\n\n")}`
      : "",
    meeting.summary.actionItems.length > 0
      ? `\n## Action Items\n${meeting.summary.actionItems
          .map((a, i) => `${i + 1}. [${a.assignee}] ${a.task}${a.deadline ? ` — ${a.deadline}` : ""}`)
          .join("\n")}`
      : "",
    meeting.summary.decisions.length > 0
      ? `\n## Decisions\n${meeting.summary.decisions
          .map((d) => `- ${d.decision}`)
          .join("\n")}`
      : "",
    `\n## Full Transcript\n${meeting.transcript.text}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href={ROUTES.library}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors shrink-0"
          >
            <ArrowLeft className="size-4" />
            Library
          </Link>

          <h1 className="text-sm font-medium text-text-primary truncate">
            {meeting.summary.title}
          </h1>

          <CopyButton text={fullText} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <time>{formatDate(meeting.createdAt)}</time>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatDuration(meeting.duration)}
          </span>
        </div>

        {/* TLDR card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative p-6 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--accent) / 0.1) 0%, hsl(var(--accent-pink) / 0.06) 100%)",
            border: "1px solid hsl(var(--accent) / 0.2)",
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xs font-bold tracking-widest text-accent uppercase mt-0.5">
              TL;DR
            </span>
          </div>
          <p className="mt-2 text-text-primary leading-relaxed">{meeting.summary.tldr}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-col gap-6">
          {/* Tab bar */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-bg-elevated text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.key === "actions" && meeting.summary.actionItems.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-accent text-white text-xs leading-none">
                    {meeting.summary.actionItems.length}
                  </span>
                )}
                {tab.key === "decisions" && meeting.summary.decisions.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-accent-pink text-white text-xs leading-none">
                    {meeting.summary.decisions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === "overview" && <OverviewTab meeting={meeting} />}
              {activeTab === "transcript" && <TranscriptTab meeting={meeting} />}
              {activeTab === "actions" && <ActionsTab items={meeting.summary.actionItems} />}
              {activeTab === "decisions" && <DecisionsTab decisions={meeting.summary.decisions} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
