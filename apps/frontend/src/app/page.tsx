"use client";

import { useAuth } from "@/lib/useAuth";
import { logout } from "@/lib/api";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

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

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <h2 style={styles.welcomeTitle}>
            Welcome back{user.displayName ? `, ${user.displayName}` : ""}
          </h2>
          <p style={styles.welcomeSubtitle}>
            Your dashboard is being built. Soon you&apos;ll be able to report
            and track environmental issues here.
          </p>
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
  loadingText: {
    fontFamily: "var(--font-inter), sans-serif",
    color: "#404943",
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
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
  },
  welcomeCard: {
    background: "#ffffff",
    borderRadius: "1.5rem",
    padding: "2.5rem",
  },
  welcomeTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1.5rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#191c1b",
    marginBottom: "0.75rem",
  },
  welcomeSubtitle: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.95rem",
    color: "#404943",
    lineHeight: 1.6,
  },
};
