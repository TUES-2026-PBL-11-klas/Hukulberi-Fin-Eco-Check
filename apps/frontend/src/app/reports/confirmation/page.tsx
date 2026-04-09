"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmationContent() {
  const { loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const reportId = params.get("id");

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingPulse} />
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.gradientStrip} />

      <div style={styles.container}>
        {/* Success icon */}
        <div style={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#cce8de" />
            <path
              d="M7 12.5l3.5 3.5 6.5-7"
              stroke="#00513f"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Hero text */}
        <div style={styles.heroSection}>
          <span style={styles.badge}>Report Submitted</span>
          <h1 style={styles.heroTitle}>
            Thank you for
            <br />
            reporting.
          </h1>
          <p style={styles.heroSubtitle}>
            Your report has been received and is now in our queue. Our AI will
            analyse it and route it to the right municipal team automatically.
          </p>
        </div>

        {/* Info card */}
        <div style={styles.card}>
          <div style={styles.cardRow}>
            <div style={styles.cardItem}>
              <span style={styles.cardLabel}>Status</span>
              <span style={styles.statusBadge}>NEW</span>
            </div>
            <div style={styles.cardItem}>
              <span style={styles.cardLabel}>AI Triage</span>
              <span style={styles.triagedBadge}>PENDING</span>
            </div>
            {reportId && (
              <div style={styles.cardItem}>
                <span style={styles.cardLabel}>Report ID</span>
                <span style={styles.cardValue}>#{reportId.slice(0, 8)}</span>
              </div>
            )}
          </div>

          <div style={styles.timelineSection}>
            <p style={styles.timelineTitle}>What happens next</p>
            <div style={styles.timeline}>
              <TimelineStep
                step="01"
                title="AI Triage"
                desc="Gemini analyses your description to determine category and urgency."
                done={false}
              />
              <TimelineStep
                step="02"
                title="Routing"
                desc="Report is assigned to the correct municipal unit."
                done={false}
              />
              <TimelineStep
                step="03"
                title="Resolution"
                desc="The assigned team responds and resolves the issue."
                done={false}
              />
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={styles.ctaRow}>
          <button
            onClick={() => router.push("/reports/new")}
            style={styles.secondaryBtn}
          >
            Submit Another
          </button>
          <button
            onClick={() => router.push("/reports")}
            style={styles.secondaryBtn}
          >
            View My Reports
          </button>
          <button
            onClick={() => router.push("/")}
            style={styles.primaryBtn}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelineStep({
  step,
  title,
  desc,
  done,
}: {
  step: string;
  title: string;
  desc: string;
  done: boolean;
}) {
  return (
    <div style={timelineStyles.step}>
      <div
        style={{
          ...timelineStyles.dot,
          background: done ? "#00513f" : "#f3f4f5",
          border: done ? "none" : "2px solid #cce8de",
        }}
      >
        {done && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5l2.5 2.5 3.5-4"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <div style={timelineStyles.content}>
        <span style={timelineStyles.stepNumber}>{step}</span>
        <p style={timelineStyles.title}>{title}</p>
        <p style={timelineStyles.desc}>{desc}</p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div style={styles.loadingWrapper}>
          <div style={styles.loadingPulse} />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loadingWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
  },
  loadingPulse: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#cce8de",
  },
  wrapper: {
    minHeight: "100vh",
    background: "#f8f9fa",
  },
  gradientStrip: {
    height: "4px",
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
  },
  container: {
    maxWidth: "640px",
    margin: "0 auto",
    padding: "3rem 2rem 4rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "2rem",
  },
  iconWrap: {
    marginBottom: "-0.5rem",
  },
  heroSection: {},
  badge: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#00513f",
    background: "#cce8de",
    padding: "0.35rem 0.75rem",
    borderRadius: "9999px",
    display: "inline-block",
    marginBottom: "1rem",
  },
  heroTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "2.5rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    color: "#191c1b",
    marginBottom: "0.75rem",
  },
  heroSubtitle: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.95rem",
    color: "#404943",
    lineHeight: 1.7,
  },
  card: {
    background: "#ffffff",
    borderRadius: "1.5rem",
    padding: "2rem",
  },
  cardRow: {
    display: "flex",
    gap: "2rem",
    marginBottom: "2rem",
    flexWrap: "wrap" as const,
  },
  cardItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
  },
  cardLabel: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#bec9c3",
  },
  statusBadge: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#00513f",
    background: "#cce8de",
    padding: "0.3rem 0.65rem",
    borderRadius: "9999px",
    display: "inline-block",
  },
  triagedBadge: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#404943",
    background: "#f3f4f5",
    padding: "0.3rem 0.65rem",
    borderRadius: "9999px",
    display: "inline-block",
  },
  cardValue: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#191c1b",
    letterSpacing: "-0.01em",
  },
  timelineSection: {},
  timelineTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "#191c1b",
    marginBottom: "1.25rem",
    letterSpacing: "-0.01em",
  },
  timeline: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  ctaRow: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
  },
  secondaryBtn: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#404943",
    background: "#ffffff",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.875rem 1.5rem",
    cursor: "pointer",
  },
  primaryBtn: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.875rem 2rem",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
};

const timelineStyles: Record<string, React.CSSProperties> = {
  step: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  },
  dot: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "2px",
  },
  content: {
    flex: 1,
  },
  stepNumber: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#bec9c3",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: "0.15rem",
  },
  title: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#191c1b",
    letterSpacing: "-0.01em",
    marginBottom: "0.2rem",
  },
  desc: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.8rem",
    color: "#404943",
    lineHeight: 1.5,
  },
};
