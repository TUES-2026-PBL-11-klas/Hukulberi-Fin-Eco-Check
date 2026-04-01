"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalConfigs: number;
  totalFlags: number;
  enabledFlags: number;
  disabledFlags: number;
  serverTime: string;
}

interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const headers = { "x-user-role": "admin" };
      const [statsRes, flagsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers }),
        fetch(`${API_BASE}/admin/feature-flags`, { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (flagsRes.ok) setFlags(await flagsRes.json());
    } catch {
      // API not available — show defaults
    } finally {
      setLoading(false);
    }
  }

  async function toggleFlag(key: string, current: boolean) {
    try {
      const res = await fetch(`${API_BASE}/admin/feature-flags/${key}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
        body: JSON.stringify({ enabled: !current }),
      });
      if (res.ok) {
        setFlags((prev) =>
          prev.map((f) => (f.key === key ? { ...f, enabled: !current } : f))
        );
      }
    } catch {
      // handle error silently
    }
  }

  const statCards = [
    {
      label: "Config Entries",
      value: stats?.totalConfigs ?? "—",
      icon: "⚙️",
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.1)",
      borderColor: "rgba(99, 102, 241, 0.2)",
    },
    {
      label: "Total Flags",
      value: stats?.totalFlags ?? "—",
      icon: "🚩",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
      borderColor: "rgba(245, 158, 11, 0.2)",
    },
    {
      label: "Enabled Flags",
      value: stats?.enabledFlags ?? "—",
      icon: "✅",
      color: "#22c55e",
      bgColor: "rgba(34, 197, 94, 0.1)",
      borderColor: "rgba(34, 197, 94, 0.2)",
    },
    {
      label: "Disabled Flags",
      value: stats?.disabledFlags ?? "—",
      icon: "⏸️",
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
      borderColor: "rgba(239, 68, 68, 0.2)",
    },
  ];

  return (
    <div className="dashboard">
      <style>{`
        .dashboard h1 {
          font-size: 28px;
          font-weight: 700;
          color: #fafafa;
          margin: 0 0 4px 0;
        }

        .dashboard-subtitle {
          font-size: 14px;
          color: #71717a;
          margin: 0 0 32px 0;
        }

        /* ── Stats Grid ───────────────────────── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }

        .stat-card {
          padding: 24px;
          border-radius: 16px;
          border: 1px solid;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .stat-card-icon {
          font-size: 28px;
          margin-bottom: 16px;
        }

        .stat-card-value {
          font-size: 36px;
          font-weight: 800;
          margin: 0;
          line-height: 1;
        }

        .stat-card-label {
          font-size: 13px;
          font-weight: 500;
          color: #a1a1aa;
          margin: 6px 0 0 0;
        }

        .stat-card::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, currentColor 0%, transparent 70%);
          opacity: 0.03;
          pointer-events: none;
        }

        /* ── Sections ─────────────────────────── */
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #fafafa;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title span {
          font-size: 20px;
        }

        /* ── Feature Flag Cards ───────────────── */
        .flags-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
          margin-bottom: 40px;
        }

        .flag-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .flag-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .flag-info h3 {
          font-size: 14px;
          font-weight: 600;
          color: #fafafa;
          margin: 0 0 4px 0;
          font-family: 'Inter', monospace;
        }

        .flag-info p {
          font-size: 12px;
          color: #71717a;
          margin: 0;
          line-height: 1.5;
        }

        /* ── Toggle Switch ────────────────────── */
        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: #27272a;
          border-radius: 24px;
          transition: background 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: #71717a;
          border-radius: 50%;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toggle-switch input:checked + .toggle-slider {
          background: rgba(34, 197, 94, 0.3);
        }

        .toggle-switch input:checked + .toggle-slider::before {
          transform: translateX(20px);
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
        }

        /* ── Activity placeholder ─────────────── */
        .activity-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 32px;
          text-align: center;
        }

        .activity-card p {
          color: #52525b;
          font-size: 14px;
          margin: 0;
        }

        .activity-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        /* ── Loading skeleton ─────────────────── */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .skeleton {
          background: linear-gradient(90deg, #18181b 25%, #27272a 50%, #18181b 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        .skeleton-card {
          height: 120px;
          border-radius: 16px;
        }

        .skeleton-flag {
          height: 80px;
          border-radius: 12px;
        }
      `}</style>

      <h1>Dashboard</h1>
      <p className="dashboard-subtitle">
        Overview of your EcoCheck platform configuration
      </p>

      {/* Stats */}
      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="stat-card"
              style={{
                background: card.bgColor,
                borderColor: card.borderColor,
                color: card.color,
              }}
            >
              <div className="stat-card-icon">{card.icon}</div>
              <p className="stat-card-value" style={{ color: card.color }}>
                {card.value}
              </p>
              <p className="stat-card-label">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Feature Flags */}
      <h2 className="section-title">
        <span>🚩</span> Feature Flags
      </h2>
      {loading ? (
        <div className="flags-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-flag" />
          ))}
        </div>
      ) : flags.length > 0 ? (
        <div className="flags-grid">
          {flags.map((flag) => (
            <div key={flag.key} className="flag-card">
              <div className="flag-info">
                <h3>{flag.key}</h3>
                <p>{flag.description}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={flag.enabled}
                  onChange={() => toggleFlag(flag.key, flag.enabled)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <div className="flags-grid">
          {[
            { key: "eco-scoring", description: "Enable the eco scoring engine", enabled: true },
            { key: "ai-classification", description: "AI-based signal classification", enabled: true },
            { key: "reports", description: "Reports & exports module", enabled: false },
            { key: "notifications", description: "Push / email notifications", enabled: false },
          ].map((flag) => (
            <div key={flag.key} className="flag-card">
              <div className="flag-info">
                <h3>{flag.key}</h3>
                <p>{flag.description}</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked={flag.enabled} />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Activity */}
      <h2 className="section-title">
        <span>📋</span> Recent Activity
      </h2>
      <div className="activity-card">
        <div className="activity-icon">🕐</div>
        <p>Activity log will appear here once the system is connected.</p>
      </div>
    </div>
  );
}