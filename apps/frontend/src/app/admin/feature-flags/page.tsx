"use client";

import { useState, useEffect } from "react";

interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const defaultFlags: FeatureFlag[] = [
  { id: "1", key: "eco-scoring", enabled: true, description: "Enable the eco scoring engine for signals", updatedAt: new Date().toISOString() },
  { id: "2", key: "ai-classification", enabled: true, description: "Enable AI-based signal classification via Gemini", updatedAt: new Date().toISOString() },
  { id: "3", key: "reports", enabled: false, description: "Enable the reports & exports module", updatedAt: new Date().toISOString() },
  { id: "4", key: "notifications", enabled: false, description: "Enable push / email notifications", updatedAt: new Date().toISOString() },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(defaultFlags);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchFlags();
  }, []);

  async function fetchFlags() {
    try {
      const res = await fetch(`${API_BASE}/admin/feature-flags`, {
        headers: { "x-user-role": "admin" },
      });
      if (res.ok) setFlags(await res.json());
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }

  async function toggleFlag(key: string, current: boolean) {
    setToggling(key);
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
          prev.map((f) =>
            f.key === key ? { ...f, enabled: !current, updatedAt: new Date().toISOString() } : f
          )
        );
      }
    } catch {
      // toggle locally anyway for demo
      setFlags((prev) =>
        prev.map((f) =>
          f.key === key ? { ...f, enabled: !current, updatedAt: new Date().toISOString() } : f
        )
      );
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="ff-page">
      <style>{`
        .ff-page h1 {
          font-size: 28px;
          font-weight: 700;
          color: #fafafa;
          margin: 0 0 4px 0;
        }

        .ff-subtitle {
          font-size: 14px;
          color: #71717a;
          margin: 0 0 32px 0;
        }

        .ff-count {
          font-size: 13px;
          color: #52525b;
          margin: 0 0 20px 0;
          display: flex;
          gap: 16px;
        }

        .ff-count span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ff-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .ff-dot.green { background: #22c55e; }
        .ff-dot.red { background: #ef4444; }

        .ff-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ff-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          transition: all 0.15s ease;
        }

        .ff-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .ff-item-left {
          flex: 1;
        }

        .ff-item-key {
          font-size: 15px;
          font-weight: 600;
          color: #fafafa;
          margin: 0 0 4px 0;
          font-family: 'Inter', monospace;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ff-status-badge {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .ff-status-badge.on {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .ff-status-badge.off {
          background: rgba(113, 113, 122, 0.15);
          color: #71717a;
        }

        .ff-item-desc {
          font-size: 13px;
          color: #71717a;
          margin: 0 0 6px 0;
        }

        .ff-item-time {
          font-size: 11px;
          color: #3f3f46;
          margin: 0;
        }

        /* Toggle */
        .toggle-switch {
          position: relative;
          width: 48px;
          height: 26px;
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
          height: 20px;
          width: 20px;
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
          transform: translateX(22px);
          background: #22c55e;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
        }

        .toggle-switch.toggling .toggle-slider::before {
          opacity: 0.5;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .skeleton {
          background: linear-gradient(90deg, #18181b 25%, #27272a 50%, #18181b 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
          height: 90px;
        }
      `}</style>

      <h1>Feature Flags</h1>
      <p className="ff-subtitle">
        Control which features are active across the EcoCheck platform
      </p>

      <div className="ff-count">
        <span>
          <span className="ff-dot green" />
          {flags.filter((f) => f.enabled).length} enabled
        </span>
        <span>
          <span className="ff-dot red" />
          {flags.filter((f) => !f.enabled).length} disabled
        </span>
      </div>

      {loading ? (
        <div className="ff-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      ) : (
        <div className="ff-list">
          {flags.map((flag) => (
            <div key={flag.key} className="ff-item">
              <div className="ff-item-left">
                <h3 className="ff-item-key">
                  {flag.key}
                  <span
                    className={`ff-status-badge ${flag.enabled ? "on" : "off"}`}
                  >
                    {flag.enabled ? "ON" : "OFF"}
                  </span>
                </h3>
                <p className="ff-item-desc">{flag.description}</p>
                <p className="ff-item-time">
                  Last updated: {new Date(flag.updatedAt).toLocaleString()}
                </p>
              </div>
              <label
                className={`toggle-switch ${toggling === flag.key ? "toggling" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={flag.enabled}
                  onChange={() => toggleFlag(flag.key, flag.enabled)}
                  disabled={toggling === flag.key}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
