"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
  },
  {
    label: "Feature Flags",
    href: "/admin/feature-flags",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
  },
  {
    label: "Activity",
    href: "/admin/activity",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #09090b;
          font-family: 'Inter', sans-serif;
          color: #fafafa;
        }

        /* ── Sidebar ─────────────────────────── */
        .admin-sidebar {
          width: 260px;
          background: linear-gradient(180deg, #0f0f13 0%, #111117 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 40;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-sidebar-logo {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-sidebar-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          color: #fff;
          flex-shrink: 0;
        }

        .admin-sidebar-logo-text {
          display: flex;
          flex-direction: column;
        }

        .admin-sidebar-logo-text h2 {
          font-size: 16px;
          font-weight: 700;
          color: #fafafa;
          margin: 0;
          line-height: 1.2;
        }

        .admin-sidebar-logo-text span {
          font-size: 11px;
          color: #71717a;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-sidebar-nav {
          padding: 12px 8px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #a1a1aa;
          text-decoration: none;
          transition: all 0.15s ease;
          position: relative;
        }

        .admin-nav-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #fafafa;
        }

        .admin-nav-item.active {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .admin-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: #22c55e;
          border-radius: 0 4px 4px 0;
        }

        .admin-sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .admin-sidebar-footer p {
          font-size: 11px;
          color: #52525b;
          margin: 0;
        }

        /* ── Main Content ────────────────────── */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
        }

        .admin-topbar {
          height: 64px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: rgba(9, 9, 11, 0.8);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .admin-topbar-title {
          font-size: 14px;
          font-weight: 500;
          color: #a1a1aa;
        }

        .admin-topbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-topbar-badge {
          padding: 4px 10px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #22c55e;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
        }

        .admin-content {
          padding: 32px;
        }

        /* ── Mobile ───────────────────────────── */
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: #fafafa;
          cursor: pointer;
          padding: 8px;
        }

        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .admin-main {
            margin-left: 0;
          }

          .mobile-toggle {
            display: flex;
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 35;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
          }

          .sidebar-overlay.visible {
            opacity: 1;
            pointer-events: all;
          }
        }
      `}</style>

      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">EC</div>
          <div className="admin-sidebar-logo-text">
            <h2>EcoCheck</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <p>EcoCheck v1.0.0</p>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="admin-topbar-title">
              Admin Console
            </span>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-topbar-badge">Admin</span>
            <div className="admin-avatar">A</div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
