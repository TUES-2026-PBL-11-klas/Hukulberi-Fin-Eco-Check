"use client";

import { useEffect, useState } from "react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: string;
  newValue: string;
  userId: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const res = await fetch(`${API_BASE}/admin/activity`, {
        headers: { "x-user-role": "admin" },
      });
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch activity logs", err);
    } finally {
      setLoading(false);
    }
  }

  function formatAction(log: AuditLog) {
    switch (log.action) {
      case "FLAG_TOGGLED":
        try {
          const newVal = JSON.parse(log.newValue);
          return (
            <>
              Feature flag <strong>{log.entityId}</strong> was turned{" "}
              <span style={{ color: newVal.enabled ? "#22c55e" : "#ef4444" }}>
                {newVal.enabled ? "ON" : "OFF"}
              </span>
            </>
          );
        } catch {
          return `Feature flag ${log.entityId} was updated`;
        }
      case "CONFIG_UPDATED":
        return (
          <>
            Configuration <strong>{log.entityId}</strong> was updated
          </>
        );
      case "CONFIG_CREATED":
        return (
          <>
            New configuration <strong>{log.entityId}</strong> was created
          </>
        );
      case "CONFIG_DELETED":
        return (
          <>
            Configuration <strong>{log.entityId}</strong> was removed
          </>
        );
      default:
        return `${log.action} on ${log.entity} (${log.entityId})`;
    }
  }

  return (
    <div className="activity-page">
      <style>{`
        .activity-page h1 {
          font-size: 28px;
          font-weight: 700;
          color: #fafafa;
          margin: 0 0 4px 0;
        }

        .activity-subtitle {
          font-size: 14px;
          color: #71717a;
          margin: 0 0 32px 0;
        }

        .activity-empty {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 64px 32px;
          text-align: center;
        }

        .activity-empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .activity-empty h2 {
          font-size: 18px;
          font-weight: 600;
          color: #a1a1aa;
          margin: 0 0 8px 0;
        }

        .activity-empty p {
          font-size: 14px;
          color: #52525b;
          margin: 0;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .timeline-container {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
        }

        .timeline-item {
          display: flex;
          gap: 20px;
          padding-bottom: 24px;
          position: relative;
        }

        .timeline-dot-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 20px;
          flex-shrink: 0;
        }

        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3f3f46;
          border: 2px solid #18181b;
          z-index: 1;
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          background: #27272a;
          margin-top: -4px;
          margin-bottom: -15px;
        }

        .timeline-content {
          flex: 1;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 16px;
          margin-top: -6px;
        }

        .timeline-content p {
          font-size: 14px;
          color: #e4e4e7;
          margin: 0 0 6px 0;
          line-height: 1.5;
        }

        .timeline-content span {
          font-size: 12px;
          color: #71717a;
          display: block;
        }

        .user-tag {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          color: #a1a1aa;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .timeline-item {
          animation: fadeIn 0.4s ease forwards;
        }
      `}</style>

      <h1>Activity Log</h1>
      <p className="activity-subtitle">
        Track configuration changes and system events
      </p>

      {loading ? (
        <div className="activity-empty">
          <p>Loading activities...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="activity-empty">
          <div className="activity-empty-icon">📋</div>
          <h2>No Activity Yet</h2>
          <p>
            Changes to feature flags, settings, and system configuration will
            appear here.
          </p>
        </div>
      ) : (
        <div className="timeline-container">
          {logs.map((log, i) => (
            <div key={log.id} className="timeline-item">
              <div className="timeline-dot-col">
                <div
                  className="timeline-dot"
                  style={{
                    backgroundColor: log.action.includes("FLAG")
                      ? "#f59e0b"
                      : "#6366f1",
                  }}
                />
                {i < logs.length - 1 && <div className="timeline-line" />}
              </div>
              <div className="timeline-content">
                <p>{formatAction(log)}</p>
                <span>
                  By <span className="user-tag">{log.userId}</span> •{" "}
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
