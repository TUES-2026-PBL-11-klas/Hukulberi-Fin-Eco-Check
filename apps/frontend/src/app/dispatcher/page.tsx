"use client";

import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type ReportStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";
type TriageStatus = "PENDING" | "TRIAGED" | "FAILED";
type AiCategory =
  | "WASTE"
  | "GREENERY"
  | "ROAD_INFRASTRUCTURE"
  | "ILLEGAL_PARKING"
  | "WATER_SEWER"
  | "OTHER";
type AiUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type QueueRow = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: ReportStatus;
  triageStatus: TriageStatus;
  aiCategory: AiCategory | null;
  aiUrgency: AiUrgency | null;
  aiConfidence: number | null;
  assignedUnit: string | null;
  createdAt: string;
  updatedAt: string;
};

const categoryFilters: Array<"ALL" | AiCategory> = [
  "ALL",
  "WASTE",
  "GREENERY",
  "ROAD_INFRASTRUCTURE",
  "ILLEGAL_PARKING",
  "WATER_SEWER",
  "OTHER",
];

const urgencyFilters: Array<"ALL" | AiUrgency> = [
  "ALL",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const statusTabs: Array<"ALL" | ReportStatus> = [
  "ALL",
  "NEW",
  "IN_PROGRESS",
  "RESOLVED",
];

type SortBy = "createdAt" | "urgency";
type SortDirection = "asc" | "desc";

const urgencyRank: Record<AiUrgency, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

const UNIT_OPTIONS = [
  "Waste Management",
  "Parks & Greenery",
  "Roads & Infrastructure",
  "Traffic Enforcement",
  "Water & Sewage",
  "General Services",
];

export default function DispatcherPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState<"ALL" | AiCategory>("ALL");
  const [urgency, setUrgency] = useState<"ALL" | AiUrgency>("ALL");
  const [statusTab, setStatusTab] = useState<"ALL" | ReportStatus>("ALL");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Track which cards have open assign dropdowns
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setIsLoadingQueue(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (category !== "ALL") params.set("category", category);
      if (urgency !== "ALL") params.set("urgency", urgency);
      if (statusTab !== "ALL") params.set("status", statusTab);

      const query = params.toString();
      const path = query ? `/reports/dispatcher/queue?${query}` : "/reports/dispatcher/queue";

      const res = await fetchWithAuth(path);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Failed to load dispatcher queue.");
      }

      const data = (await res.json()) as QueueRow[];
      setQueue(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load dispatcher queue.";
      setError(message);
    } finally {
      setIsLoadingQueue(false);
    }
  }, [category, urgency, statusTab]);

  useEffect(() => {
    if (loading) return;
    const canViewDispatcher = hasDispatcherAccess(user?.role);
    if (!canViewDispatcher) {
      setQueue([]);
      setError("");
      setIsLoadingQueue(false);
      return;
    }
    void loadQueue();
  }, [category, urgency, statusTab, loading, user?.role, loadQueue]);

  const sortedQueue = useMemo(() => {
    const rows = [...queue];
    rows.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        const aRank = a.aiUrgency ? urgencyRank[a.aiUrgency] : 0;
        const bRank = b.aiUrgency ? urgencyRank[b.aiUrgency] : 0;
        comparison = aRank - bRank;
        if (comparison === 0) {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
      }
      return sortDirection === "asc" ? comparison : comparison * -1;
    });
    return rows;
  }, [queue, sortBy, sortDirection]);

  const statusCounts = useMemo(
    () => ({
      ALL: queue.length,
      NEW: queue.filter((item) => item.status === "NEW").length,
      IN_PROGRESS: queue.filter((item) => item.status === "IN_PROGRESS").length,
      RESOLVED: queue.filter((item) => item.status === "RESOLVED").length,
    }),
    [queue],
  );

  // --- Action handlers ---

  async function handleStatusUpdate(reportId: string, newStatus: ReportStatus) {
    setActionLoading(reportId);
    try {
      const res = await fetchWithAuth(`/reports/${reportId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Failed to update status.");
      }
      await loadQueue();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Action failed.";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAssignUnit(reportId: string, unit: string) {
    setActionLoading(reportId);
    setAssigningId(null);
    try {
      const res = await fetchWithAuth(`/reports/${reportId}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ unit }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Failed to assign unit.");
      }
      await loadQueue();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Action failed.";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading || isLoadingQueue) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinnerRing} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const canViewDispatcher = hasDispatcherAccess(user.role);

  if (!canViewDispatcher) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <button onClick={() => router.push("/")} style={styles.backBtn}>
            ← Dashboard
          </button>
          <div style={styles.deniedCard}>
            <h1 style={styles.deniedTitle}>Dispatcher access required</h1>
            <p style={styles.deniedText}>This page is available only for dispatcher and admin roles.</p>
          </div>
        </div>
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
          <Link href="/dispatcher/analytics" style={styles.analyticsLink}>
            📊 Analytics
          </Link>
        </div>

        <div style={styles.heroSection}>
          <span style={styles.badge}>Dispatcher</span>
          <h1 style={styles.heroTitle}>Operations Queue</h1>
          <p style={styles.heroSubtitle}>
            Manage reports: update statuses, assign municipal units, and filter by category, urgency, or status.
          </p>
        </div>

        {/* Status tabs */}
        <div style={styles.tabsRow}>
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              style={statusTab === tab ? styles.tabActive : styles.tab}
            >
              {tab === "ALL" ? "All" : tab.replace("_", " ")}
              <span style={styles.tabCount}>
                {statusCounts[tab] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Filter controls */}
        <div style={styles.controlsShell}>
          <div style={styles.controlsGrid}>
            <label style={styles.controlBlock}>
              <span style={styles.controlLabel}>Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as "ALL" | AiCategory)}
                onFocus={() => setFocusedField("category")}
                onBlur={() => setFocusedField(null)}
                style={selectStyle(focusedField === "category")}
              >
                {categoryFilters.map((value) => (
                  <option key={value} value={value}>
                    {formatLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.controlBlock}>
              <span style={styles.controlLabel}>Urgency</span>
              <select
                value={urgency}
                onChange={(event) => setUrgency(event.target.value as "ALL" | AiUrgency)}
                onFocus={() => setFocusedField("urgency")}
                onBlur={() => setFocusedField(null)}
                style={selectStyle(focusedField === "urgency")}
              >
                {urgencyFilters.map((value) => (
                  <option key={value} value={value}>
                    {formatLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.controlBlock}>
              <span style={styles.controlLabel}>Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortBy)}
                onFocus={() => setFocusedField("sortBy")}
                onBlur={() => setFocusedField(null)}
                style={selectStyle(focusedField === "sortBy")}
              >
                <option value="createdAt">Submitted Time</option>
                <option value="urgency">Urgency</option>
              </select>
            </label>

            <label style={styles.controlBlock}>
              <span style={styles.controlLabel}>Direction</span>
              <select
                value={sortDirection}
                onChange={(event) => setSortDirection(event.target.value as SortDirection)}
                onFocus={() => setFocusedField("sortDirection")}
                onBlur={() => setFocusedField(null)}
                style={selectStyle(focusedField === "sortDirection")}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {!error && sortedQueue.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyTitle}>No queue items for current filters</p>
            <p style={styles.emptySubtitle}>Try broadening category or urgency to view more reports.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {sortedQueue.map((report) => {
              const isActioning = actionLoading === report.id;
              const isAssigning = assigningId === report.id;

              return (
                <article key={report.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <h2 style={styles.cardTitle}>{report.title}</h2>
                      <p style={styles.cardMeta}>{report.location}</p>
                      <p style={styles.cardDescription}>
                        {formatDescriptionPreview(report.description)}
                      </p>
                    </div>

                    <div style={styles.badgeRow}>
                      <span style={statusBadge(report.status)}>{report.status.replace("_", " ")}</span>
                      <span style={triageBadge(report.triageStatus)}>{report.triageStatus}</span>
                      {report.aiUrgency ? <span style={urgencyBadgeStyle(report.aiUrgency)}>{report.aiUrgency}</span> : null}
                    </div>
                  </div>

                  <div style={styles.metaGrid}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Category</span>
                      <span style={styles.metaValue}>
                        {report.aiCategory ? formatLabel(report.aiCategory) : "Pending"}
                      </span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Confidence</span>
                      <span style={styles.metaValue}>{formatConfidence(report.aiConfidence)}</span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Assigned Unit</span>
                      <span style={styles.metaValue}>{report.assignedUnit ?? "Unassigned"}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={styles.actionsRow}>
                    {/* Status transitions */}
                    {report.status === "NEW" && (
                      <button
                        disabled={isActioning}
                        onClick={() => handleStatusUpdate(report.id, "IN_PROGRESS")}
                        style={isActioning ? styles.actionBtnDisabled : styles.actionBtnPrimary}
                      >
                        {isActioning ? "Updating…" : "▶ Start Progress"}
                      </button>
                    )}
                    {report.status === "IN_PROGRESS" && (
                      <button
                        disabled={isActioning}
                        onClick={() => handleStatusUpdate(report.id, "RESOLVED")}
                        style={isActioning ? styles.actionBtnDisabled : styles.actionBtnSuccess}
                      >
                        {isActioning ? "Updating…" : "✓ Mark Resolved"}
                      </button>
                    )}
                    {report.status === "RESOLVED" && (
                      <span style={styles.resolvedLabel}>✔ Resolved</span>
                    )}

                    {/* Assign unit */}
                    {report.status !== "RESOLVED" && (
                      <div style={styles.assignWrapper}>
                        <button
                          onClick={() => setAssigningId(isAssigning ? null : report.id)}
                          style={styles.actionBtnOutline}
                          disabled={isActioning}
                        >
                          {report.assignedUnit ? "⟳ Reassign" : "⊕ Assign Unit"}
                        </button>

                        {isAssigning && (
                          <div style={styles.assignDropdown}>
                            {UNIT_OPTIONS.map((unit) => (
                              <button
                                key={unit}
                                onClick={() => handleAssignUnit(report.id, unit)}
                                style={
                                  report.assignedUnit === unit
                                    ? styles.assignOptionActive
                                    : styles.assignOption
                                }
                              >
                                {unit}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p style={styles.time}>Submitted {new Date(report.createdAt).toLocaleString()}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function formatLabel(value: string): string {
  if (value === "ALL") return "All";
  return value.replaceAll("_", " ");
}

function formatConfidence(confidence: number | null): string {
  if (typeof confidence !== "number") return "-";
  return `${Math.round(confidence * 100)}%`;
}

function formatDescriptionPreview(description: string): string {
  const normalized = description.trim();
  if (!normalized) return "No description provided.";
  if (normalized.length <= 220) return normalized;
  return `${normalized.slice(0, 220).trimEnd()}…`;
}

function statusBadge(status: ReportStatus): React.CSSProperties {
  const map: Record<ReportStatus, React.CSSProperties> = {
    NEW: { background: "#e5f0ff", color: "#1f4b8f" },
    IN_PROGRESS: { background: "#fff2d9", color: "#946200" },
    RESOLVED: { background: "#dff5e8", color: "#0f6b34" },
  };
  return { ...styles.badgeBase, ...map[status] };
}

function triageBadge(status: TriageStatus): React.CSSProperties {
  const map: Record<TriageStatus, React.CSSProperties> = {
    PENDING: { background: "#ecedef", color: "#4a5560" },
    TRIAGED: { background: "#dff5e8", color: "#0f6b34" },
    FAILED: { background: "#ffe3e0", color: "#a3362a" },
  };
  return { ...styles.badgeBase, ...map[status] };
}

function urgencyBadgeStyle(urgency: AiUrgency): React.CSSProperties {
  const map: Record<AiUrgency, React.CSSProperties> = {
    LOW: { background: "#e6f6ec", color: "#1e7a42" },
    MEDIUM: { background: "#fff5dd", color: "#9f6b00" },
    HIGH: { background: "#ffe9d8", color: "#b05700" },
    CRITICAL: { background: "#ffdfe1", color: "#a40f1f" },
  };
  return { ...styles.badgeBase, ...map[urgency] };
}

function hasDispatcherAccess(role?: string | null): boolean {
  const normalizedRole = (role ?? "").trim().toUpperCase();
  return normalizedRole === "DISPATCHER" || normalizedRole === "ADMIN";
}

function selectStyle(isFocused: boolean): React.CSSProperties {
  return {
    ...styles.select,
    ...(isFocused ? styles.selectFocused : null),
  };
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  loadingWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
  },
  loadingSpinner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    maxWidth: "1080px",
    margin: "0 auto",
    padding: "2.5rem 2rem 4rem",
  },
  headerRow: {
    marginBottom: "1.5rem",
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
  analyticsLink: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#00513f",
    textDecoration: "none",
    padding: "0.5rem 1rem",
    borderRadius: "0.6rem",
    background: "rgba(0, 81, 63, 0.08)",
    transition: "background 140ms ease",
  },
  heroSection: {
    marginBottom: "1.5rem",
    padding: "1.5rem",
    borderRadius: "1.5rem",
    background:
      "linear-gradient(135deg, rgba(0, 81, 63, 0.08) 0%, rgba(0, 107, 84, 0.12) 100%)",
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

  // Tabs
  tabsRow: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  tab: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#5f6b67",
    background: "#fff",
    border: "1px solid #e0e3e1",
    borderRadius: "0.65rem",
    padding: "0.55rem 1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    transition: "all 140ms ease",
  },
  tabActive: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#00513f",
    background: "#cce8de",
    border: "1px solid #80c9a8",
    borderRadius: "0.65rem",
    padding: "0.55rem 1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  tabCount: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.72rem",
    fontWeight: 800,
    background: "rgba(0,0,0,0.06)",
    padding: "0.15rem 0.45rem",
    borderRadius: "9999px",
  },

  // Filter controls
  controlsShell: {
    marginBottom: "1.25rem",
    borderRadius: "1rem",
    padding: "0.95rem",
    background: "rgba(248, 249, 250, 0.8)",
    backdropFilter: "blur(24px)",
    boxShadow: "0 8px 24px -4px rgba(31, 41, 38, 0.06)",
  },
  controlsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "0.75rem",
  },
  controlBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  controlLabel: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#5f6b67",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  select: {
    border: "none",
    outline: "none",
    background: "#ecedef",
    borderRadius: "0.65rem",
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.84rem",
    color: "#1c2623",
    padding: "0.6rem 0.7rem",
    transition: "outline-color 140ms ease",
  },
  selectFocused: {
    outline: "2px solid rgba(0, 81, 63, 0.4)",
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
    gap: "0.85rem",
  },
  card: {
    background: "#fff",
    borderRadius: "1.1rem",
    padding: "1.1rem 1.1rem 0.9rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "0.8rem",
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
  cardDescription: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.83rem",
    lineHeight: 1.45,
    color: "#3d4743",
    margin: "0.4rem 0 0 0",
    maxWidth: "62ch",
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
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "0.6rem",
  },
  metaItem: {
    background: "#f3f4f5",
    borderRadius: "0.8rem",
    padding: "0.6rem 0.7rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  metaLabel: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.68rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#687470",
  },
  metaValue: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.83rem",
    fontWeight: 700,
    color: "#1f2926",
  },

  // Actions
  actionsRow: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    marginTop: "0.85rem",
    flexWrap: "wrap",
  },
  actionBtnPrimary: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#fff",
    background: "#00513f",
    border: "none",
    borderRadius: "0.6rem",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    transition: "background 140ms ease",
  },
  actionBtnSuccess: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#fff",
    background: "#0f6b34",
    border: "none",
    borderRadius: "0.6rem",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    transition: "background 140ms ease",
  },
  actionBtnOutline: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#00513f",
    background: "transparent",
    border: "1.5px solid #00513f",
    borderRadius: "0.6rem",
    padding: "0.45rem 0.9rem",
    cursor: "pointer",
    transition: "all 140ms ease",
  },
  actionBtnDisabled: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#999",
    background: "#e8e8e8",
    border: "none",
    borderRadius: "0.6rem",
    padding: "0.5rem 1rem",
    cursor: "not-allowed",
  },
  resolvedLabel: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#0f6b34",
  },
  assignWrapper: {
    position: "relative" as const,
  },
  assignDropdown: {
    position: "absolute" as const,
    top: "calc(100% + 4px)",
    left: 0,
    background: "#fff",
    borderRadius: "0.75rem",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    padding: "0.35rem",
    zIndex: 20,
    minWidth: "200px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "2px",
  },
  assignOption: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.8rem",
    color: "#1c2623",
    background: "transparent",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.7rem",
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "background 100ms ease",
  },
  assignOptionActive: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.8rem",
    color: "#00513f",
    background: "#cce8de",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.7rem",
    cursor: "pointer",
    textAlign: "left" as const,
    fontWeight: 700,
  },

  time: {
    marginTop: "0.75rem",
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.76rem",
    color: "#6e7975",
  },
  deniedCard: {
    marginTop: "1rem",
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
