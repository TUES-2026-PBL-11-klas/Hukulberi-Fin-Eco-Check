"use client";

import { useState } from "react";
import Link from "next/link";
import { setToken, fetchWithAuth } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchWithAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Invalid credentials");
      }

      const data = await res.json();
      setToken(data.accessToken);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* Left — Branding panel */}
      <div style={styles.brandPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoMark}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.15)" />
              <path
                d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm-1 17l-5-5 1.4-1.4L19 22.2l7.6-7.6L28 16l-9 9z"
                fill="#fff"
              />
            </svg>
          </div>
          <h1 style={styles.brandTitle}>EcoCheck</h1>
          <p style={styles.brandSubtitle}>
            Report and track environmental issues in your city. Together we
            build a cleaner, greener future.
          </p>
        </div>

        <p style={styles.brandFooter}>
          &copy; {new Date().getFullYear()} EcoCheck &middot; All rights
          reserved
        </p>
      </div>

      {/* Right — Login form */}
      <div style={styles.formPanel}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSubtitle}>
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={styles.input}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "inset 0 0 0 2px rgba(0,81,63,0.4)")
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <div style={styles.field}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Password</label>
                <a href="#" style={styles.forgotLink}>
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={styles.input}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "inset 0 0 0 2px rgba(0,81,63,0.4)")
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={styles.signupText}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={styles.signupLink}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Inline styles following the "Living Ledger" design system ── */

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
  },

  /* Brand panel (left) */
  brandPanel: {
    flex: "0 0 44%",
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "3.5rem",
  },
  brandContent: {
    marginTop: "auto",
    marginBottom: "auto",
  },
  logoMark: {
    marginBottom: "2rem",
  },
  brandTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "2.75rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    marginBottom: "1rem",
  },
  brandSubtitle: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "1.05rem",
    lineHeight: 1.7,
    opacity: 0.8,
    maxWidth: "28rem",
  },
  brandFooter: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.8rem",
    opacity: 0.5,
  },

  /* Form panel (right) */
  formPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa", // surface
    padding: "2rem",
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px",
  },
  formHeader: {
    marginBottom: "2.5rem",
  },
  formTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "1.75rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#191c1b", // on-surface
    marginBottom: "0.5rem",
  },
  formSubtitle: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.95rem",
    color: "#404943", // on-surface-variant
  },

  /* Form */
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "#191c1b",
  },
  forgotLink: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.8rem",
    color: "#00513f",
    textDecoration: "none",
    fontWeight: 500,
  },
  input: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.95rem",
    padding: "0.8rem 1rem",
    borderRadius: "0.75rem",
    border: "none",
    background: "#ecedef", // surface-container-high
    color: "#191c1b",
    outline: "none",
    transition: "box-shadow 0.2s ease",
  },
  errorBox: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.85rem",
    color: "#ba1a1a",
    background: "#ffdad6",
    padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
  },
  submitBtn: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.85rem",
    marginTop: "0.5rem",
    transition: "opacity 0.2s ease",
  },
  signupText: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.875rem",
    color: "#404943",
    textAlign: "center" as const,
    marginTop: "2rem",
  },
  signupLink: {
    color: "#00513f",
    fontWeight: 500,
    textDecoration: "none",
  },
};
