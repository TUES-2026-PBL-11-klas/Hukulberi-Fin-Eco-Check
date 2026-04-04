"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingPulse} />
      </div>
    );
  }

  const firstName = user?.displayName?.split(" ")[0] || "";

  return (
    <div style={styles.wrapper}>
      {/* Decorative gradient strip at top */}
      <div style={styles.gradientStrip} />

      <div style={styles.container}>
        {/* Hero section — editorial style */}
        <div style={styles.heroSection}>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>Account Created</span>
          </div>

          <h1 style={styles.heroTitle}>
            {firstName ? (
              <>
                Welcome,
                <br />
                <span style={styles.heroName}>{firstName}.</span>
              </>
            ) : (
              <>
                You&apos;re
                <br />
                all set.
              </>
            )}
          </h1>

          <p style={styles.heroSubtitle}>
            Your EcoCheck account is ready. Here&apos;s how you can start making
            an impact in your community.
          </p>
        </div>

        {/* Feature cards — asymmetric grid */}
        <div style={styles.featureGrid}>
          <div
            style={{
              ...styles.featureCard,
              ...styles.featureCardLarge,
              background:
                hoveredFeature === 0
                  ? "#f3f4f5"
                  : styles.featureCardLarge.background,
            }}
            onMouseEnter={() => setHoveredFeature(0)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div style={styles.featureNumber}>01</div>
            <div style={styles.featureIconWrap}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"
                  fill="#00513f"
                />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Report Issues</h3>
            <p style={styles.featureDesc}>
              Pin environmental problems on an interactive map. Add photos,
              descriptions, and severity levels so the right teams can respond.
            </p>
          </div>

          <div style={styles.featureColumnRight}>
            <div
              style={{
                ...styles.featureCard,
                ...styles.featureCardSmall,
                background:
                  hoveredFeature === 1
                    ? "#f3f4f5"
                    : styles.featureCardSmall.background,
              }}
              onMouseEnter={() => setHoveredFeature(1)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div style={styles.featureNumber}>02</div>
              <div style={styles.featureIconWrap}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                    fill="#00513f"
                  />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>Track Progress</h3>
              <p style={styles.featureDesc}>
                Follow every report from submission to resolution in real time.
              </p>
            </div>

            <div
              style={{
                ...styles.featureCard,
                ...styles.featureCardSmall,
                background:
                  hoveredFeature === 2
                    ? "#f3f4f5"
                    : styles.featureCardSmall.background,
              }}
              onMouseEnter={() => setHoveredFeature(2)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div style={styles.featureNumber}>03</div>
              <div style={styles.featureIconWrap}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
                    fill="#00513f"
                  />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>Community</h3>
              <p style={styles.featureDesc}>
                Join citizens working together for a cleaner, greener city.
              </p>
            </div>
          </div>
        </div>

        {/* Stats row — editorial metric display */}
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <span style={styles.statNumber}>24h</span>
            <span style={styles.statLabel}>Avg. Response Time</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.stat}>
            <span style={styles.statNumber}>98%</span>
            <span style={styles.statLabel}>Resolution Rate</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.stat}>
            <span style={styles.statNumber}>1.2k+</span>
            <span style={styles.statLabel}>Active Citizens</span>
          </div>
        </div>

        {/* CTA */}
        <div style={styles.ctaSection}>
          <button
            onClick={() => router.push("/")}
            style={styles.ctaButton}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Go to Dashboard
          </button>
          <p style={styles.ctaHint}>
            You can always update your profile from the dashboard settings.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.footerText}>
          &copy; {new Date().getFullYear()} EcoCheck
        </span>
      </footer>
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
    background: "#f8f9fa",
    display: "flex",
    flexDirection: "column",
  },

  /* Decorative strip */
  gradientStrip: {
    height: "4px",
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
    flexShrink: 0,
  },

  container: {
    flex: 1,
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto",
    padding: "4rem 2rem 2rem",
  },

  /* Hero */
  heroSection: {
    marginBottom: "3.5rem",
  },
  badgeRow: {
    marginBottom: "1.5rem",
  },
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
  },
  heroTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "3.25rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.08,
    color: "#191c1b",
    marginBottom: "1.25rem",
  },
  heroName: {
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "1.05rem",
    color: "#404943",
    lineHeight: 1.7,
    maxWidth: "480px",
  },

  /* Feature grid — asymmetric */
  featureGrid: {
    display: "flex",
    gap: "1.25rem",
    marginBottom: "3rem",
  },
  featureColumnRight: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
    flex: 1,
  },
  featureCard: {
    borderRadius: "1.5rem",
    padding: "2rem",
    transition: "background 0.2s ease",
    cursor: "default",
  },
  featureCardLarge: {
    flex: "0 0 50%",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-end",
    minHeight: "340px",
  },
  featureCardSmall: {
    flex: 1,
    background: "#ffffff",
  },
  featureNumber: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#bec9c3",
    letterSpacing: "0.05em",
    marginBottom: "1.25rem",
  },
  featureIconWrap: {
    marginBottom: "1rem",
  },
  featureTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1.1rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#191c1b",
    marginBottom: "0.5rem",
  },
  featureDesc: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.875rem",
    color: "#404943",
    lineHeight: 1.6,
  },

  /* Stats row */
  statsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2.5rem",
    background: "#ffffff",
    borderRadius: "1.5rem",
    padding: "2rem 2.5rem",
    marginBottom: "3rem",
  },
  stat: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "0.35rem",
  },
  statNumber: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1.75rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#00513f",
  },
  statLabel: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#404943",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  },
  statDivider: {
    width: "1px",
    height: "40px",
    background: "rgba(190,201,195,0.15)",
  },

  /* CTA */
  ctaSection: {
    textAlign: "center" as const,
    marginBottom: "2rem",
  },
  ctaButton: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
    border: "none",
    borderRadius: "0.75rem",
    padding: "1rem 3rem",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  ctaHint: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.8rem",
    color: "#bec9c3",
    marginTop: "1rem",
  },

  /* Footer */
  footer: {
    padding: "1.5rem 2rem",
    textAlign: "center" as const,
  },
  footerText: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.75rem",
    color: "#bec9c3",
  },
};
