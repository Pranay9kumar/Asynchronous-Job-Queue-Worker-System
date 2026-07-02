import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import QueueChart from '../components/QueueChart';

function Metrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/metrics');
        if (!cancelled) setData(response.data);
      } catch (err) {
        if (!cancelled) setError('Failed to load metrics.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMetrics();
    const timer = setInterval(loadMetrics, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const queue = data?.queueMetrics || {};
  const worker = data?.workerMetrics || {};
  const apiMetrics = data?.apiMetrics || {};
  const performance = data?.performanceMetrics || {};

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Metrics</p>
          <h1>Operational metrics</h1>
        </div>
      </div>

      {error ? <div className="alert-banner error">{error}</div> : null}
      {loading ? <div className="card empty-state">Loading metrics...</div> : null}

      <div className="grid metrics-grid">
        <div className="card metric-mini"><span>Jobs/min</span><strong>{Math.round((apiMetrics.requestsPerSecond || 0) * 60)}</strong></div>
        <div className="card metric-mini"><span>Failure Rate</span><strong>{apiMetrics.errorRate || 0}</strong></div>
        <div className="card metric-mini"><span>Avg Processing</span><strong>{performance.averageProcessingTimeMs || 0} ms</strong></div>
        <div className="card metric-mini"><span>Queue Length</span><strong>{(queue.waiting || 0) + (queue.active || 0)}</strong></div>
        <div className="card metric-mini"><span>Worker Utilization</span><strong>{worker.workerUtilization || 0}%</strong></div>
      </div>

      <div className="grid chart-grid">
        <QueueChart title="Queue Length" labels={['Waiting', 'Active', 'Completed', 'Failed', 'Delayed']} values={[queue.waiting || 0, queue.active || 0, queue.completed || 0, queue.failed || 0, queue.delayed || 0]} type="bar" color="#4fd1c5" />
        <QueueChart title="Average Processing Time" labels={['Average']} values={[performance.averageProcessingTimeMs || 0]} type="bar" color="#f59e0b" />
      </div>
    </div>
  );
}

export default Metrics;
