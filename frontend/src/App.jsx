import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Dlq from './pages/Dlq';
import Workers from './pages/Workers';
import Metrics from './pages/Metrics';
import Alerts from './pages/Alerts';
import NotFound from './pages/NotFound';
import HealthBadge from './components/HealthBadge';
import useSummary from './hooks/useSummary';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/workers', label: 'Workers' },
  { to: '/dlq', label: 'DLQ' },
  { to: '/metrics', label: 'Metrics' },
  { to: '/alerts', label: 'Alerts' }
];

function App() {
  const { summary, loading } = useSummary();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Q</div>
          <div>
            <h1>QueueOps</h1>
            <p>Production job dashboard</p>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <h3>System Health</h3>
          <HealthBadge status={loading ? 'Loading' : summary.health} />
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Queue Operations</p>
            <h2>Monitor jobs, workers, alerts, and performance</h2>
          </div>
          <div className="topbar-stats">
            <div>
              <span>Active Workers</span>
              <strong>{loading ? '...' : summary.activeWorkers}</strong>
            </div>
            <div>
              <span>Queue Status</span>
              <strong>{loading ? '...' : summary.queueStatus}</strong>
            </div>
            <div>
              <span>Notifications</span>
              <strong>{loading ? '...' : summary.alertCount}</strong>
            </div>
          </div>
        </header>

        <main className="page-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/dlq" element={<Dlq />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
