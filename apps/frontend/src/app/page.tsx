"use client";

import { useAuth } from "@/lib/useAuth";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth({ redirect: false });
  const router = useRouter();

  return (
    <div className="home-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Manrope:wght@700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .home-page {
          min-height: 100vh;
          background: #fafbfc;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        /* ── Navbar ──────────────────────────── */
        .hp-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 40px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(16px) saturate(180%);
          border-bottom: 1px solid rgba(0,0,0,0.04);
          transition: background 0.3s;
        }

        .hp-nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .hp-nav-logo-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #00a67e, #00513f);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 900;
          font-size: 13px;
          font-family: 'Manrope', sans-serif;
        }

        .hp-nav-logo-text {
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 20px;
          color: #00513f;
          letter-spacing: -0.03em;
        }

        .hp-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hp-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: #404943;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.15s;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'Inter', sans-serif;
        }

        .hp-nav-link:hover { background: rgba(0,81,63,0.06); color: #00513f; }

        .hp-nav-btn {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          background: #00513f;
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Inter', sans-serif;
        }

        .hp-nav-btn:hover { background: #006b54; }

        .hp-nav-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #00513f;
          background: #cce8de;
          padding: 4px 10px;
          border-radius: 20px;
        }

        /* ── Hero ────────────────────────────── */
        .hp-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 140px 24px 100px;
          overflow: hidden;
        }

        .hp-hero::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 900px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0,166,126,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .hp-hero::after {
          content: '';
          position: absolute;
          bottom: -100px;
          right: -200px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0,81,63,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .hp-hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px 6px 8px;
          background: #fff;
          border: 1px solid rgba(0,81,63,0.12);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          color: #00513f;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          animation: fadeInUp 0.6s ease both;
        }

        .hp-hero-pill-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00a67e;
          box-shadow: 0 0 0 3px rgba(0,166,126,0.2);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(0,166,126,0.2); }
          50% { box-shadow: 0 0 0 8px rgba(0,166,126,0.05); }
        }

        .hp-hero-title {
          font-family: 'Manrope', sans-serif;
          font-weight: 900;
          font-size: clamp(40px, 6vw, 72px);
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: #0a1a14;
          max-width: 720px;
          margin-bottom: 20px;
          animation: fadeInUp 0.6s ease 0.1s both;
        }

        .hp-hero-title span {
          background: linear-gradient(135deg, #00a67e, #00513f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hp-hero-desc {
          font-size: 18px;
          line-height: 1.7;
          color: #5f6b65;
          max-width: 520px;
          margin-bottom: 44px;
          animation: fadeInUp 0.6s ease 0.2s both;
        }

        .hp-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          background: linear-gradient(135deg, #00a67e, #00513f);
          color: #fff;
          font-family: 'Manrope', sans-serif;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.01em;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow:
            0 4px 14px rgba(0,81,63,0.25),
            0 1px 3px rgba(0,81,63,0.1);
          animation: fadeInUp 0.6s ease 0.3s both;
          position: relative;
          z-index: 1;
        }

        .hp-hero-cta:hover {
          transform: translateY(-2px);
          box-shadow:
            0 8px 28px rgba(0,81,63,0.3),
            0 2px 6px rgba(0,81,63,0.15);
        }

        .hp-hero-cta:active {
          transform: translateY(0);
        }

        .hp-hero-cta svg { flex-shrink: 0; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Features ────────────────────────── */
        .hp-features {
          padding: 80px 40px 100px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .hp-features-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #00a67e;
          text-align: center;
          margin-bottom: 12px;
        }

        .hp-features-heading {
          font-family: 'Manrope', sans-serif;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0a1a14;
          text-align: center;
          margin-bottom: 56px;
        }

        .hp-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .hp-feature-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px 28px;
          border: 1px solid rgba(0,0,0,0.04);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .hp-feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          border-radius: 20px 20px 0 0;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .hp-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.06);
          border-color: transparent;
        }

        .hp-feature-card:hover::before { opacity: 1; }

        .hp-feature-card:nth-child(1)::before { background: linear-gradient(90deg, #00a67e, #00d4a0); }
        .hp-feature-card:nth-child(2)::before { background: linear-gradient(90deg, #6366f1, #818cf8); }
        .hp-feature-card:nth-child(3)::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

        .hp-feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 22px;
        }

        .hp-feature-card:nth-child(1) .hp-feature-icon { background: rgba(0,166,126,0.1); }
        .hp-feature-card:nth-child(2) .hp-feature-icon { background: rgba(99,102,241,0.1); }
        .hp-feature-card:nth-child(3) .hp-feature-icon { background: rgba(245,158,11,0.1); }

        .hp-dispatcher-card {
          background: linear-gradient(135deg, #ffffff 0%, #f9f7ff 100%);
          border: 1px solid rgba(99, 102, 241, 0.1) !important;
        }

        .hp-dispatcher-card:hover {
          background: linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%);
          border-color: rgba(99, 102, 241, 0.2) !important;
        }

        .hp-dispatcher-card .hp-feature-icon {
          background: rgba(99, 102, 241, 0.1);
        }

        .hp-dispatcher-go {
          display: inline-block;
          margin-top: 16px;
          font-size: 13px;
          font-weight: 700;
          color: #6366f1;
        }

        .hp-feature-card h3 {
          font-family: 'Manrope', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #0a1a14;
          margin-bottom: 10px;
        }

        .hp-feature-card p {
          font-size: 14px;
          line-height: 1.7;
          color: #5f6b65;
        }

        /* ── Footer ──────────────────────────── */
        .hp-footer {
          padding: 32px 40px;
          border-top: 1px solid rgba(0,0,0,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }

        .hp-footer p {
          font-size: 13px;
          color: #a1a9a5;
        }

        .hp-footer a {
          font-size: 13px;
          color: #5f6b65;
          text-decoration: none;
        }

        .hp-footer a:hover { color: #00513f; }

        /* ── Responsive ──────────────────────── */
        @media (max-width: 768px) {
          .hp-nav { padding: 12px 20px; }
          .hp-nav-link { display: none; }
          .hp-hero { padding: 120px 20px 80px; }
          .hp-features { padding: 60px 20px 80px; }
          .hp-features-grid { grid-template-columns: 1fr; }
          .hp-footer { flex-direction: column; gap: 16px; text-align: center; }
        }
      `}</style>

      {/* ── Navbar ──────────────────────────── */}
      <nav className="hp-nav">
        <Link href="/" className="hp-nav-logo">
          <div className="hp-nav-logo-icon">EC</div>
          <span className="hp-nav-logo-text">EcoCheck</span>
        </Link>
        <div className="hp-nav-right">
          {loading ? null : user ? (
            <>
              {(user.role === "ADMIN" || user.role === "DISPATCHER") && (
                <button
                  className="hp-nav-link"
                  onClick={() => router.push(user.role === "ADMIN" ? "/admin" : "/dispatcher")}
                >
                  {user.role === "ADMIN" ? "Admin Panel" : "Dispatcher"}
                </button>
              )}
              <button className="hp-nav-link" onClick={() => router.push("/reports")}>
                My Reports
              </button>
              <span className="hp-nav-badge">{user.role}</span>
              <button className="hp-nav-link" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <button className="hp-nav-link" onClick={() => router.push("/login")}>
                Sign in
              </button>
              <button className="hp-nav-btn" onClick={() => router.push("/register")}>
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────── */}
      <section className="hp-hero">
        <div className="hp-hero-pill">
          <span className="hp-hero-pill-dot" />
          Environmental reporting platform
        </div>

        <h1 className="hp-hero-title">
          Report issues.<br />
          <span>Protect your city.</span>
        </h1>

        <p className="hp-hero-desc">
          Spot pollution, illegal dumping, or infrastructure issues?
          Report them in seconds — our AI classifies and routes every
          issue to the right team instantly.
        </p>

        <button
          className="hp-hero-cta"
          onClick={() => router.push(user ? "/reports/new" : "/login")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Report an Issue
        </button>
      </section>

      {/* ── Features ────────────────────────── */}
      <section className="hp-features">
        <p className="hp-features-label">How it works</p>
        <h2 className="hp-features-heading">From report to resolution</h2>

        <div className="hp-features-grid">
          <div className="hp-feature-card">
            <div className="hp-feature-icon">🤖</div>
            <h3>AI Triage</h3>
            <p>
              Our Gemini-powered AI auto-classifies each report by category
              and urgency, so critical issues surface first.
            </p>
          </div>
          <div className="hp-feature-card">
            <div className="hp-feature-icon">⚡</div>
            <h3>Fast Resolution</h3>
            <p>
              Dispatchers see a prioritized queue and can assign the right
              team. You get updates as your report progresses.
            </p>
          </div>
          {user && (user.role === "DISPATCHER" || user.role === "ADMIN") ? (
            <div
              className="hp-feature-card hp-dispatcher-card"
              onClick={() => router.push("/dispatcher")}
              style={{ cursor: "pointer" }}
            >
              <div className="hp-feature-icon">🎯</div>
              <h3>Dispatcher Queue</h3>
              <p>
                View, filter, and manage all incoming reports sorted by
                AI urgency. Assign teams and track resolution.
              </p>
              <span className="hp-dispatcher-go">
                Open Queue →
              </span>
            </div>
          ) : (
            <div className="hp-feature-card">
              <div className="hp-feature-icon">🌱</div>
              <h3>Community Impact</h3>
              <p>
                Every report matters. Together we&apos;re building a cleaner,
                healthier city — one signal at a time.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ──────────────────────────── */}
      <footer className="hp-footer">
        <p>© 2026 EcoCheck · Hukulberi Team</p>
        <a href="https://github.com/TUES-2026-PBL-11-klas/Hukulberi-Fin-Eco-Check" target="_blank" rel="noopener">GitHub</a>
      </footer>
    </div>
  );
}
