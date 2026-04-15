"use client";

import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import { useEffect, useState } from "react";

type StatsData = {
  total: number;
  byStatus: {
    NEW: number;
    IN_PROGRESS: number;
    RESOLVED: number;
  };
  byUrgency: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  byCategory: {
    WASTE: number;
    GREENERY: number;
    ROAD_INFRASTRUCTURE: number;
    ILLEGAL_PARKING: number;
    WATER_SEWER: number;
    OTHER: number;
  };
  avgResolutionMs: number | null;
};

function hasDispatcherAccess(role?: string | null): boolean {
  const normalizedRole = (role ?? "").trim().toUpperCase();
  return normalizedRole === "DISPATCHER" || normalizedRole === "ADMIN";
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;
    return `${days}d ${remainHours}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatCategoryLabel(value: string): string {
  return value.replaceAll("_", " ");
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!hasDispatcherAccess(user?.role)) {
      setIsLoading(false);
      return;
    }

    let active = true;

    async function loadStats() {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetchWithAuth("/reports/stats");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message ?? "Failed to load analytics.");
        }
        const data = (await res.json()) as StatsData;
        if (active) setStats(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load analytics.";
        if (active) setError(msg);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadStats();
    return () => { active = false; };
  }, [loading, user?.role]);

  if (loading || isLoading) {
    return (
      <div style={s.loadingWrapper}>
        <div style={s.spinnerRing} />
      </div>
    );
  }

  if (!user || !hasDispatcherAccess(user.role)) {
    return (
      <div style={s.wrapper}>
        <div style={s.container}>
          <div style={s.deniedCard}>
            <h1 style={s.deniedTitle}>Dispatcher access required</h1>
            <p style={s.deniedText}>Analytics are only available for dispatcher and admin roles.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <div style={s.gradientStrip} />
      <div style={s.container}>
        <div style={s.headerRow}>
          <Link href="/dispatcher" style={s.backBtn}>← Back to Queue</Link>
        </div>

        <div style={s.heroSection}>
          <span style={s.badge}>Analytics</span>
          <h1 style={s.heroTitle}>Operational Reporting</h1>
          <p style={s.heroSubtitle}>
            Overview of report counts by status, urgency, and category, plus average resolution time.
          </p>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        {stats && (
          <>
            {/* Summary row */}
            <div style={s.summaryRow}>
              <div style={{ ...s.summaryCard, ...s.summaryTotal }}>
                <span style={s.summaryLabel}>Total Reports</span>
                <span style={s.summaryValue}>{stats.total}</span>
              </div>
              <div style={s.summaryCard}>
                <span style={s.summaryLabel}>Avg. Resolution Time</span>
                <span style={s.summaryValue}>{formatDuration(stats.avgResolutionMs)}</span>
              </div>
            </div>

            {/* Status breakdown */}
            <section style={s.section}>
              <h2 style={s.sectionTitle}>By Status</h2>
              <div style={s.barGrid}>
                {(["NEW", "IN_PROGRESS", "RESOLVED"] as const).map((key) => {
                  const count = stats.byStatus[key];
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={key} style={s.barRow}>
                      <span style={s.barLabel}>{key.replace("_", " ")}</span>
                      <div style={s.barTrack}>
                        <div
                          style={{
                            ...s.barFill,
                            width: `${Math.max(pct, 2)}%`,
                            background: statusColor(key),
                          }}
                        />
                      </div>
                      <span style={s.barCount}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Urgency breakdown */}
            <section style={s.section}>
              <h2 style={s.sectionTitle}>By Urgency</h2>
              <div style={s.cardGrid}>
                {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((key) => (
                  <div
                    key={key}
                    style={{
                      ...s.urgencyCard,
                      borderLeft: `4px solid ${urgencyColor(key)}`,
                    }}
                  >
                    <span style={s.urgencyLabel}>{key}</span>
                    <span style={s.urgencyCount}>{stats.byUrgency[key]}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Category breakdown */}
            <section style={s.section}>
              <h2 style={s.sectionTitle}>By Category</h2>
              <div style={s.barGrid}>
                {(Object.keys(stats.byCategory) as Array<keyof typeof stats.byCategory>).map(
                  (key) => {
                    const count = stats.byCategory[key];
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={key} style={s.barRow}>
                        <span style={s.barLabel}>{formatCategoryLabel(key)}</span>
                        <div style={s.barTrack}>
                          <div
                            style={{
                              ...s.barFill,
                              width: `${Math.max(pct, 2)}%`,
                              background: "#00513f",
                            }}
                          />
                        </div>
                        <span style={s.barCount}>{count}</span>
                      </div>
                    );
                  },
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case "NEW": return "#3b82f6";
    case "IN_PROGRESS": return "#f59e0b";
    case "RESOLVED": return "#10b981";
    default: return "#94a3b8";
  }
}

function urgencyColor(urgency: string): string {
  switch (urgency) {
    case "LOW": return "#10b981";
    case "MEDIUM": return "#f59e0b";
    case "HIGH": return "#f97316";
    case "CRITICAL": return "#ef4444";
    default: return "#94a3b8";
  }
}

const s: Record<string, React.CSSProperties> = {
  loadingWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
  },
  spinnerRing: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "4px solid #e0e0e0",
    borderTopColor: "#00513f",
    animation: "spin 0.8s linear infinite",
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
    maxWidth: "960px",
    margin: "0 auto",
    padding: "2.5rem 2rem 4rem",
  },
  headerRow: {
    marginBottom: "1.5rem",
  },
  backBtn: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.875rem",
    color: "#404943",
    textDecoration: "none",
  },
  heroSection: {
    marginBottom: "2rem",
    padding: "1.5rem",
    borderRadius: "1.5rem",
    background: "linear-gradient(135deg, rgba(0, 81, 63, 0.08) 0%, rgba(0, 107, 84, 0.12) 100%)",
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
    background: "#ffdad6",
    color: "#ba1a1a",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.88rem",
  },

  // Summary
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  summaryCard: {
    background: "#fff",
    borderRadius: "1.1rem",
    padding: "1.25rem 1.3rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  summaryTotal: {
    background: "linear-gradient(135deg, #00513f, #007a5e)",
    color: "#fff",
  },
  summaryLabel: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    opacity: 0.8,
  },
  summaryValue: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "2rem",
    fontWeight: 800,
  },

  // Sections
  section: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "#191c1b",
    marginBottom: "0.8rem",
  },

  // Bar chart
  barGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  barRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr 50px",
    alignItems: "center",
    gap: "0.75rem",
  },
  barLabel: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#404943",
    textTransform: "capitalize",
  },
  barTrack: {
    height: "28px",
    background: "#ecedef",
    borderRadius: "0.5rem",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "0.5rem",
    transition: "width 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  },
  barCount: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.9rem",
    fontWeight: 800,
    color: "#191c1b",
    textAlign: "right",
  },

  // Urgency cards
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "0.75rem",
  },
  urgencyCard: {
    background: "#fff",
    borderRadius: "0.9rem",
    padding: "1rem 1.1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  urgencyLabel: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#5f6b67",
  },
  urgencyCount: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#191c1b",
  },

  // Denied
  deniedCard: {
    marginTop: "3rem",
    background: "#fff",
    borderRadius: "1rem",
    padding: "1.4rem",
  },
  deniedTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#1c1e1d",
    marginBottom: "0.5rem",
  },
  deniedText: {
    fontFamily: "var(--font-inter), sans-serif",
    color: "#56635f",
  },
};
