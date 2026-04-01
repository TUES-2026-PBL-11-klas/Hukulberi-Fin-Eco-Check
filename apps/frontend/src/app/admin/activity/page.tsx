"use client";

export default function ActivityPage() {
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

        .timeline-preview {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .timeline-item {
          display: flex;
          gap: 16px;
          padding: 16px 0;
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
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #27272a;
          border: 2px solid #3f3f46;
          flex-shrink: 0;
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          background: #27272a;
          margin-top: 4px;
        }

        .timeline-content {
          flex: 1;
        }

        .timeline-content p {
          font-size: 13px;
          color: #3f3f46;
          margin: 0 0 4px 0;
        }

        .timeline-content span {
          font-size: 11px;
          color: #27272a;
        }
      `}</style>

      <h1>Activity Log</h1>
      <p className="activity-subtitle">
        Track configuration changes and system events
      </p>

      <div className="activity-empty">
        <div className="activity-empty-icon">📋</div>
        <h2>No Activity Yet</h2>
        <p>
          Activity logs will appear here as team members make changes to feature
          flags, settings, and system configuration. This feature will be fully
          connected once the platform is live.
        </p>
      </div>

      <div className="timeline-preview">
        {[
          "System initialized",
          "Default feature flags seeded",
          "Config entries created",
          "Waiting for activity...",
        ].map((text, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-dot-col">
              <div className="timeline-dot" />
              {i < 3 && <div className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <p>{text}</p>
              <span>—</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
