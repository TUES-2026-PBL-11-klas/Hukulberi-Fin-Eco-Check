"use client";

import { useAuth } from "@/lib/useAuth";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingPulse} />
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.displayName?.split(" ")[0] || user.email;
  const canAccessDispatcher = user.role === "DISPATCHER" || user.role === "ADMIN";

  return (
    <div style={styles.wrapper}>
      {/* Top bar */}
      <header style={styles.header}>
        <h1 style={styles.logo}>EcoCheck</h1>
        <div style={styles.headerRight}>
          <span style={styles.roleBadge}>{user.role}</span>
          <span style={styles.userName}>{user.displayName || user.email}</span>
          <button onClick={logout} style={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Welcome section */}
        <div style={styles.welcomeRow}>
          <div>
            <h2 style={styles.welcomeTitle}>Good to see you, {firstName}.</h2>
            <p style={styles.welcomeSubtitle}>
              Ready to make your city cleaner?
            </p>
          </div>
          <button
            onClick={() => router.push("/reports/new")}
            style={styles.reportBtn}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            + Report an Issue
          </button>
        </div>

        {/* Quick action cards */}
        <div style={styles.cardGrid}>
          <div
            style={styles.actionCard}
            onClick={() => router.push("/reports/new")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#f3f4f5")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#ffffff")
            }
          >
            <div style={styles.actionIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"
                  fill="#00513f"
                />
              </svg>
            </div>
            <h3 style={styles.actionTitle}>New Report</h3>
            <p style={styles.actionDesc}>
              Spotted an environmental issue? Pin it on the map and describe
              it.
            </p>
          </div>

          <div
            style={styles.actionCard}
            onClick={() => router.push("/reports")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#f3f4f5")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#ffffff")
            }
          >
            <div style={styles.actionIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  fill="#bec9c3"
                />
              </svg>
            </div>
            <h3 style={styles.actionTitle}>My Reports</h3>
            <p style={styles.actionDesc}>
              Track category, urgency, and confidence from AI triage.
            </p>
          </div>

          {canAccessDispatcher ? (
            <div
              style={styles.actionCard}
              onClick={() => router.push("/dispatcher")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f3f4f5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#ffffff")
              }
            >
              <div style={styles.actionIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 5.75A1.75 1.75 0 0 1 4.75 4h14.5A1.75 1.75 0 0 1 21 5.75v12.5A1.75 1.75 0 0 1 19.25 20H4.75A1.75 1.75 0 0 1 3 18.25V5.75Zm3 1.25a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75H6Zm0 5a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h12a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75H6Zm7.5-4.25a.75.75 0 0 1 .75-.75H18a.75.75 0 0 1 0 1.5h-3.75a.75.75 0 0 1-.75-.75Z"
                    fill="#00513f"
                  />
                </svg>
              </div>
              <h3 style={styles.actionTitle}>Dispatcher Queue</h3>
              <p style={styles.actionDesc}>
                Filter and sort all incoming reports by AI urgency and category.
              </p>
            </div>
          ) : (
            <div style={{ ...styles.actionCard, cursor: "default" }}>
              <div style={styles.actionIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    fill="#bec9c3"
                  />
                </svg>
              </div>
              <h3 style={{ ...styles.actionTitle, color: "#bec9c3" }}>
                Community
              </h3>
              <p style={styles.actionDesc}>
                See what your neighbors are reporting. Coming soon.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
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
    background: "#f3f4f5",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    background: "#ffffff",
  },
  logo: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#00513f",
    letterSpacing: "-0.02em",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  roleBadge: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#00513f",
    background: "#cce8de",
    padding: "0.25rem 0.6rem",
    borderRadius: "9999px",
  },
  userName: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.875rem",
    color: "#191c1b",
    fontWeight: 500,
  },
  logoutBtn: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.8rem",
    color: "#404943",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  main: {
    padding: "2.5rem 2rem",
    maxWidth: "900px",
    margin: "0 auto",
  },
  welcomeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2.5rem",
    flexWrap: "wrap" as const,
    gap: "1rem",
  },
  welcomeTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1.75rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#191c1b",
    marginBottom: "0.25rem",
  },
  welcomeSubtitle: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.9rem",
    color: "#404943",
  },
  reportBtn: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.875rem 1.5rem",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
    flexShrink: 0,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.25rem",
  },
  actionCard: {
    background: "#ffffff",
    borderRadius: "1.5rem",
    padding: "2rem",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  actionIcon: {
    marginBottom: "1rem",
  },
  actionTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#191c1b",
    marginBottom: "0.5rem",
  },
  actionDesc: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.825rem",
    color: "#404943",
    lineHeight: 1.6,
  },
};
