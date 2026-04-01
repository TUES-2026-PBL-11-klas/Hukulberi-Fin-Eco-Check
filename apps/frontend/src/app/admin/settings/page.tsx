"use client";

import { useState, useEffect } from "react";

interface ConfigEntry {
  id: string;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const defaultConfigs: ConfigEntry[] = [
  { id: "1", key: "app.name", value: "EcoCheck", description: "Application display name", updatedAt: new Date().toISOString() },
  { id: "2", key: "app.maxSignalsPerUser", value: "50", description: "Maximum signals a single user can submit per day", updatedAt: new Date().toISOString() },
  { id: "3", key: "app.supportEmail", value: "support@ecocheck.local", description: "Support contact email address", updatedAt: new Date().toISOString() },
  { id: "4", key: "ai.confidenceThreshold", value: "0.75", description: "Minimum confidence for AI classification", updatedAt: new Date().toISOString() },
];

export default function SettingsPage() {
  const [configs, setConfigs] = useState<ConfigEntry[]>(defaultConfigs);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function fetchConfigs() {
    try {
      const res = await fetch(`${API_BASE}/admin/config`, {
        headers: { "x-user-role": "admin" },
      });
      if (res.ok) setConfigs(await res.json());
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }

  function startEdit(key: string, currentValue: string) {
    setEditing(key);
    setEditValue(currentValue);
  }

  function cancelEdit() {
    setEditing(null);
    setEditValue("");
  }

  async function saveEdit(key: string) {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/config/${key}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
        body: JSON.stringify({ value: editValue }),
      });
      if (res.ok) {
        setConfigs((prev) =>
          prev.map((c) =>
            c.key === key
              ? { ...c, value: editValue, updatedAt: new Date().toISOString() }
              : c
          )
        );
        setToast(`✅ Updated "${key}" successfully`);
      }
    } catch {
      // Update locally for demo
      setConfigs((prev) =>
        prev.map((c) =>
          c.key === key
            ? { ...c, value: editValue, updatedAt: new Date().toISOString() }
            : c
        )
      );
      setToast(`✅ Updated "${key}" (local only)`);
    } finally {
      setSaving(false);
      setEditing(null);
      setEditValue("");
    }
  }

  return (
    <div className="settings-page">
      <style>{`
        .settings-page h1 {
          font-size: 28px;
          font-weight: 700;
          color: #fafafa;
          margin: 0 0 4px 0;
        }

        .settings-subtitle {
          font-size: 14px;
          color: #71717a;
          margin: 0 0 32px 0;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .config-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 20px 24px;
          transition: all 0.15s ease;
        }

        .config-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .config-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .config-key {
          font-size: 14px;
          font-weight: 600;
          color: #a78bfa;
          margin: 0;
          font-family: 'Inter', monospace;
        }

        .config-edit-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #a1a1aa;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'Inter', sans-serif;
        }

        .config-edit-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fafafa;
        }

        .config-desc {
          font-size: 12px;
          color: #52525b;
          margin: 0 0 12px 0;
        }

        .config-value-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .config-value {
          font-size: 15px;
          font-weight: 500;
          color: #fafafa;
          margin: 0;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          flex: 1;
        }

        .config-time {
          font-size: 11px;
          color: #3f3f46;
          margin: 8px 0 0 0;
        }

        /* ── Edit Mode ────────────────────────── */
        .config-edit-form {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .config-edit-input {
          flex: 1;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 8px;
          color: #fafafa;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .config-edit-input:focus {
          border-color: rgba(167, 139, 250, 0.6);
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
        }

        .btn-save {
          padding: 8px 16px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
          font-family: 'Inter', sans-serif;
        }

        .btn-save:hover { opacity: 0.9; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-cancel {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #a1a1aa;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Inter', sans-serif;
        }

        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fafafa;
        }

        /* ── Toast ─────────────────────────────── */
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 20px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 10px;
          color: #22c55e;
          font-size: 13px;
          font-weight: 500;
          z-index: 100;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          height: 130px;
        }
      `}</style>

      <h1>Settings</h1>
      <p className="settings-subtitle">
        Manage application configuration values
      </p>

      {loading ? (
        <div className="settings-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      ) : (
        <div className="settings-list">
          {configs.map((cfg) => (
            <div key={cfg.key} className="config-item">
              <div className="config-header">
                <h3 className="config-key">{cfg.key}</h3>
                {editing !== cfg.key && (
                  <button
                    className="config-edit-btn"
                    onClick={() => startEdit(cfg.key, cfg.value)}
                  >
                    Edit
                  </button>
                )}
              </div>
              <p className="config-desc">{cfg.description}</p>

              {editing === cfg.key ? (
                <div className="config-edit-form">
                  <input
                    className="config-edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(cfg.key);
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                  <button
                    className="btn-save"
                    onClick={() => saveEdit(cfg.key)}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn-cancel" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="config-value-display">
                  <p className="config-value">{cfg.value}</p>
                </div>
              )}

              <p className="config-time">
                Updated: {new Date(cfg.updatedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
