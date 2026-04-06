"use client";

import { useAuth } from "@/lib/useAuth";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewReportPage() {
  const { loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    photoUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingPulse} />
      </div>
    );
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const body: Record<string, string> = {
        title: form.title,
        description: form.description,
        location: form.location,
      };
      if (form.photoUrl.trim()) body.photoUrl = form.photoUrl.trim();

      const res = await fetchWithAuth("/reports", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message ?? "Something went wrong. Please try again.");
        return;
      }

      const report = await res.json();
      router.push(`/reports/confirmation?id=${report.id}`);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  const charCount = form.description.length;
  const maxChars = 2000;

  return (
    <div style={styles.wrapper}>
      <div style={styles.gradientStrip} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.headerRow}>
          <button onClick={() => router.push("/")} style={styles.backBtn}>
            ← Dashboard
          </button>
        </div>

        <div style={styles.heroSection}>
          <span style={styles.badge}>New Report</span>
          <h1 style={styles.heroTitle}>Report an Issue</h1>
          <p style={styles.heroSubtitle}>
            Describe the environmental issue you&apos;ve spotted. Our AI will
            route it to the right municipal team automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Title */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="title">
              Issue Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Overflowing bin on Main Street"
              value={form.title}
              onChange={handleChange}
              maxLength={120}
              required
              style={styles.input}
              onFocus={(e) =>
                (e.currentTarget.style.outline =
                  "2px solid rgba(0,81,63,0.4)")
              }
              onBlur={(e) => (e.currentTarget.style.outline = "none")}
            />
          </div>

          {/* Description */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the issue in detail — what you see, severity, any hazard to people..."
              value={form.description}
              onChange={handleChange}
              maxLength={maxChars}
              required
              rows={6}
              style={styles.textarea}
              onFocus={(e) =>
                (e.currentTarget.style.outline =
                  "2px solid rgba(0,81,63,0.4)")
              }
              onBlur={(e) => (e.currentTarget.style.outline = "none")}
            />
            <span style={styles.charCount}>
              {charCount}/{maxChars}
            </span>
          </div>

          {/* Location */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="location">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. Corner of Vitosha Blvd and Graf Ignatiev St, Sofia"
              value={form.location}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) =>
                (e.currentTarget.style.outline =
                  "2px solid rgba(0,81,63,0.4)")
              }
              onBlur={(e) => (e.currentTarget.style.outline = "none")}
            />
          </div>

          {/* Photo URL (optional) */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="photoUrl">
              Photo URL{" "}
              <span style={styles.optionalTag}>optional</span>
            </label>
            <input
              id="photoUrl"
              name="photoUrl"
              type="url"
              placeholder="https://..."
              value={form.photoUrl}
              onChange={handleChange}
              style={styles.input}
              onFocus={(e) =>
                (e.currentTarget.style.outline =
                  "2px solid rgba(0,81,63,0.4)")
              }
              onBlur={(e) => (e.currentTarget.style.outline = "none")}
            />
            <p style={styles.fieldHint}>
              Upload your photo somewhere (e.g. Imgur) and paste the link here.
            </p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <div style={styles.formFooter}>
            <button
              type="button"
              onClick={() => router.push("/")}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.submitBtn,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
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
  },
  gradientStrip: {
    height: "4px",
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
  },
  container: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "2.5rem 2rem 4rem",
  },
  headerRow: {
    marginBottom: "2rem",
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
  heroSection: {
    marginBottom: "2.5rem",
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
    display: "inline-block",
    marginBottom: "1rem",
  },
  heroTitle: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "2.25rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#191c1b",
    marginBottom: "0.75rem",
  },
  heroSubtitle: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.95rem",
    color: "#404943",
    lineHeight: 1.7,
    maxWidth: "520px",
  },
  form: {
    background: "#ffffff",
    borderRadius: "1.5rem",
    padding: "2.5rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.75rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  label: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "#191c1b",
    letterSpacing: "-0.01em",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  optionalTag: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.7rem",
    fontWeight: 500,
    color: "#bec9c3",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  },
  input: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.95rem",
    color: "#191c1b",
    background: "#f3f4f5",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.875rem 1rem",
    width: "100%",
    boxSizing: "border-box" as const,
    outline: "none",
    transition: "outline 0.15s ease",
  },
  textarea: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.95rem",
    color: "#191c1b",
    background: "#f3f4f5",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.875rem 1rem",
    width: "100%",
    boxSizing: "border-box" as const,
    outline: "none",
    resize: "vertical" as const,
    lineHeight: 1.6,
    transition: "outline 0.15s ease",
  },
  charCount: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.75rem",
    color: "#bec9c3",
    textAlign: "right" as const,
  },
  fieldHint: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.78rem",
    color: "#bec9c3",
    lineHeight: 1.5,
  },
  errorBox: {
    background: "#fff0f0",
    borderRadius: "0.75rem",
    padding: "1rem 1.25rem",
  },
  errorText: {
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.875rem",
    color: "#ba1a1a",
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    paddingTop: "0.5rem",
  },
  cancelBtn: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#404943",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.875rem 1.5rem",
    borderRadius: "0.75rem",
  },
  submitBtn: {
    fontFamily: "var(--font-manrope), sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #00513f 0%, #006b54 100%)",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.875rem 2rem",
    transition: "opacity 0.2s ease",
  },
};
