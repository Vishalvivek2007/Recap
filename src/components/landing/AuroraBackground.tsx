export function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Big soft blob — purple */}
      <div
        className="absolute -top-1/3 -left-1/4 size-[60vw] rounded-full opacity-40 blur-[120px] animate-aurora"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 60%)",
          animationDelay: "0s",
        }}
      />
      {/* Pink blob, opposite side */}
      <div
        className="absolute top-1/4 -right-1/4 size-[55vw] rounded-full opacity-30 blur-[120px] animate-aurora"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent-pink)) 0%, transparent 60%)",
          animationDelay: "-6s",
        }}
      />
      {/* Amber blob, bottom */}
      <div
        className="absolute -bottom-1/4 left-1/3 size-[50vw] rounded-full opacity-20 blur-[120px] animate-aurora"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent-amber)) 0%, transparent 60%)",
          animationDelay: "-12s",
        }}
      />
      {/* Subtle grid overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--text-primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--text-primary)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Fade-to-bg vignette at edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, hsl(var(--bg-primary)) 100%)",
        }}
      />
    </div>
  );
}