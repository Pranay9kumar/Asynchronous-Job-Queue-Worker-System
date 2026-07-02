import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import Card from '../components/Card';
import QueueChart from '../components/QueueChart';
import StatusPill from '../components/StatusPill';

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/metrics');
        if (!cancelled) setData(response.data);
      } catch (err) {
        if (!cancelled) setError('Failed to load dashboard metrics.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    const timer = setInterval(loadDashboard, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const queueMetrics = data?.queueMetrics || {};
  const workerMetrics = data?.workerMetrics || {};
  const apiMetrics = data?.apiMetrics || {};
  const performanceMetrics = data?.performanceMetrics || {};
  const health = data?.health?.status || 'UNKNOWN';
  const alerts = data?.alerts || {};

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Queue dashboard</h1>
          <p className="muted">Real-time visibility into queue health, workers, API load, and processing speed.</p>
        </div>
        <StatusPill value={health} />
      </div>

      {error ? <div className="alert-banner error">{error}</div> : null}

      <div className="grid metrics-grid">
        <Card title="Waiting Jobs" value={loading ? '...' : queueMetrics.waiting || 0} subtext="Jobs waiting in queue" tone="accent" />
        <Card title="Active Jobs" value={loading ? '...' : queueMetrics.active || 0} subtext="Currently processing" tone="accent" />
        <Card title="Completed Jobs" value={loading ? '...' : queueMetrics.completed || 0} subtext="Successfully finished" />
        <Card title="Failed Jobs" value={loading ? '...' : queueMetrics.failed || 0} subtext="Failed after retries" tone="danger" />
        <Card title="DLQ Jobs" value={loading ? '...' : alerts.totalAlerts || 0} subtext="Dead-letter and alert count" tone="warning" />
        <Card title="Worker Utilization" value={loading ? '...' : `${workerMetrics.workerUtilization || 0}%`} subtext="Busy worker share" tone="accent" />
      </div>

      <div className="grid chart-grid">
        <QueueChart title="Queue Length" labels={['Waiting', 'Active', 'Completed', 'Failed', 'Delayed']} values={[queueMetrics.waiting || 0, queueMetrics.active || 0, queueMetrics.completed || 0, queueMetrics.failed || 0, queueMetrics.delayed || 0]} type="bar" color="#4fd1c5" />
        <QueueChart title="Processing Rate" labels={['Requests/min']} values={[Math.round((apiMetrics.requestsPerSecond || 0) * 60)]} type="bar" color="#f59e0b" />
      </div>

      <div className="grid two-col-grid">
        <div className="card info-card">
          <div className="card-header"><h3>System Snapshot</h3></div>
          <ul className="list">
            <li><span>Health</span><strong>{health}</strong></li>
            <li><span>Active Workers</span><strong>{workerMetrics.activeWorkers || 0}</strong></li>
            <li><span>Idle Workers</span><strong>{workerMetrics.idleWorkers || 0}</strong></li>
            <li><span>Average Processing Time</span><strong>{performanceMetrics.averageProcessingTimeMs || 0} ms</strong></li>
            <li><span>Average Response Time</span><strong>{apiMetrics.averageResponseTimeMs || 0} ms</strong></li>
            <li><span>Error Rate</span><strong>{apiMetrics.errorRate || 0}</strong></li>
          </ul>
        </div>

        <div className="card info-card">
          <div className="card-header"><h3>What to Watch</h3></div>
          <div className="stack">
            <div className="status-note">High waiting jobs usually mean worker capacity is too low or downstream processing is slow.</div>
            <div className="status-note">A rising failure rate usually means retries are being exhausted or payloads are invalid.</div>
            <div className="status-note">Low active workers with growing queue length usually means worker processes are offline or saturated.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
