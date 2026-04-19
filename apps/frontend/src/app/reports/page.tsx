"use client";

import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ReportRow = {
  id: string;
  title: string;
  location: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  triageStatus: "PENDING" | "TRIAGED" | "FAILED";
  aiCategory?: string | null;
  aiUrgency?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
  aiConfidence?: number | null;
  aiReasoning?: string | null;
  createdAt: string;
};

export default function ReportsPage() {
  const { loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReports() {
      setIsLoadingReports(true);
      setError("");

      try {
        const res = await fetchWithAuth("/reports/my");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message ?? "Failed to load reports.");
        }

        const data = (await res.json()) as ReportRow[];
        if (active) setReports(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load reports.";
        if (active) setError(message);
      } finally {
        if (active) setIsLoadingReports(false);
      }
    }

    void loadReports();
    return () => {
      active = false;
    };
  }, []);

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reports],
  );

  if (loading || isLoadingReports) {
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
        <div style={styles.headerRow}>
          <button onClick={() => router.push("/")} style={styles.backBtn}>
            ← Dashboard
          </button>
          <button onClick={() => router.push("/reports/new")} style={styles.primaryBtn}>
            + New Report
          </button>
        </div>

        <div style={styles.heroSection}>
          <span style={styles.badge}>My Reports</span>
          <h1 style={styles.heroTitle}>Track AI Triage Results</h1>
          <p style={styles.heroSubtitle}>
            See category, urgency, and confidence for each report classified by Gemini.
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {!error && sortedReports.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyTitle}>No reports yet</p>
            <p style={styles.emptySubtitle}>Submit your first issue report to start tracking triage.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {sortedReports.map((report) => (
              <article key={report.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <h2 style={styles.cardTitle}>{report.title}</h2>
                    <p style={styles.cardMeta}>{report.location}</p>
                  </div>
                  <div style={styles.badgeRow}>
                    <span style={statusBadge(report.status)}>{report.status.replace("_", " ")}</span>
                    <span style={triageBadge(report.triageStatus)}>{report.triageStatus}</span>
                  </div>
                </div>

                <div style={styles.triageGrid}>
                  <div style={styles.triageItem}>
                    <span style={styles.label}>Category</span>
                    <span style={styles.value}>{formatCategory(report.aiCategory)}</span>
                  </div>

                  <div style={styles.triageItem}>
                    <span style={styles.label}>Urgency</span>
                    {report.aiUrgency ? (
                      <span style={urgencyBadge(report.aiUrgency)}>{report.aiUrgency}</span>
                    ) : (
                      <span style={styles.valueMuted}>Pending</span>
                    )}
                  </div>

                  <div style={styles.triageItem}>
                    <span style={styles.label}>Confidence</span>
                    <span style={styles.value}>{formatConfidence(report.aiConfidence)}</span>
                  </div>
                </div>

                {report.triageStatus === "FAILED" && report.aiReasoning && (
                  <p style={styles.failureReason}>Triage error: {report.aiReasoning}</p>
                )}

                <p style={styles.time}>Submitted {new Date(report.createdAt).toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatCategory(category?: string | null): string {
  if (!category) return "Pending";
  return category.replaceAll("_", " ");
}

function formatConfidence(confidence?: number | null): string {
  if (typeof confidence !== "number") return "-";
  return `${Math.round(confidence * 100)}%`;
}

function statusBadge(status: ReportRow["status"]): React.CSSProperties {
  const map: Record<ReportRow["status"], React.CSSProperties> = {
    NEW: { background: "#e5f0ff", color: "#1f4b8f" },
    IN_PROGRESS: { background: "#fff2d9", color: "#946200" },
    RESOLVED: { background: "#dff5e8", color: "#0f6b34" },
  };

  return { ...styles.badgeBase, ...map[status] };
}

function triageBadge(status: ReportRow["triageStatus"]): React.CSSProperties {
  const map: Record<ReportRow["triageStatus"], React.CSSProperties> = {
    PENDING: { background: "#ecedef", color: "#4a5560" },
    TRIAGED: { background: "#dff5e8", color: "#0f6b34" },
    FAILED: { background: "#ffe3e0", color: "#a3362a" },
  };

  return { ...styles.badgeBase, ...map[status] };
}

function urgencyBadge(urgency: NonNullable<ReportRow["aiUrgency"]>): React.CSSProperties {
  const map: Record<NonNullable<ReportRow["aiUrgency"]>, React.CSSProperties> = {
    LOW: { background: "#e6f6ec", color: "#1e7a42" },
    MEDIUM: { background: "#fff5dd", color: "#9f6b00" },
    HIGH: { background: "#ffe9d8", color: "#b05700" },
    CRITICAL: { background: "#ffdfe1", color: "#a40f1f" },
  };

  return { ...styles.badgeBase, ...map[urgency] };
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
    maxWidth: "980px",
    margin: "0 auto",
    padding: "2.5rem 2rem 4rem",
  },
  headerRow: {
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.875rem",
    color: "#404943",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  primaryBtn: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    border: "none",
    borderRadius: "0.7rem",
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
    color: "#fff",
    padding: "0.65rem 1rem",
    cursor: "pointer",
  },
  heroSection: {
    marginBottom: "1.75rem",
  },
  badge: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#00513f",
    background: "#cce8de",
    padding: "0.35rem 0.75rem",
    borderRadius: "9999px",
    display: "inline-block",
    marginBottom: "0.9rem",
  },
  heroTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "2rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#191c1b",
    marginBottom: "0.6rem",
  },
  heroSubtitle: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.95rem",
    color: "#404943",
  },
  errorBox: {
    background: "#ffe3e0",
    color: "#a3362a",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.88rem",
  },
  emptyCard: {
    background: "#fff",
    borderRadius: "1.2rem",
    padding: "2rem",
  },
  emptyTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontWeight: 700,
    marginBottom: "0.35rem",
  },
  emptySubtitle: {
    fontFamily: "var(--font-inter), sans-serif",
    color: "#5d6763",
  },
  list: {
    display: "grid",
    gap: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "1.1rem",
    padding: "1.1rem 1.1rem 0.9rem",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "0.95rem",
    flexWrap: "wrap",
  },
  cardTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1.02rem",
    fontWeight: 700,
    color: "#191c1b",
    margin: 0,
  },
  cardMeta: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.82rem",
    color: "#55615d",
    margin: "0.2rem 0 0 0",
  },
  badgeRow: {
    display: "flex",
    gap: "0.45rem",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  badgeBase: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    borderRadius: "9999px",
    padding: "0.25rem 0.55rem",
  },
  triageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "0.6rem",
  },
  triageItem: {
    background: "#f3f4f5",
    borderRadius: "0.8rem",
    padding: "0.6rem 0.7rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.68rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#687470",
  },
  value: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.83rem",
    fontWeight: 700,
    color: "#1f2926",
  },
  valueMuted: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.83rem",
    color: "#78837f",
  },
  time: {
    marginTop: "0.75rem",
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.76rem",
    color: "#6e7975",
  },
  failureReason: {
    marginTop: "0.65rem",
    marginBottom: "0.15rem",
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.76rem",
    color: "#a3362a",
    background: "#ffe3e0",
    borderRadius: "0.55rem",
    padding: "0.45rem 0.55rem",
  },
};
