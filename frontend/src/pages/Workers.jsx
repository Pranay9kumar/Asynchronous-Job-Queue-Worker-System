import React, { useEffect, useState } from 'react';
import api from '../lib/api';

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadWorkers() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/workers');
        if (!cancelled) setWorkers(response.data.workers || []);
      } catch (err) {
        if (!cancelled) setError('Failed to load workers.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWorkers();
    const timer = setInterval(loadWorkers, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workers</p>
          <h1>Worker fleet</h1>
        </div>
      </div>

      {error ? <div className="alert-banner error">{error}</div> : null}
      {loading ? <div className="card empty-state">Loading workers...</div> : null}

      <div className="grid worker-grid">
        {!loading && workers.length === 0 ? <div className="card empty-state">No workers registered yet.</div> : null}
        {workers.map((worker) => (
          <div key={worker.workerId} className="card worker-card">
            <div className="worker-top">
              <h3>{worker.workerId}</h3>
              <span className={`pill ${String(worker.status || '').toLowerCase()}`}>{worker.status}</span>
            </div>
            <div className="worker-stats">
              <div><span>Jobs Processed</span><strong>{worker.jobsProcessed}</strong></div>
              <div><span>Current Job</span><strong>{worker.currentJobId || 'Idle'}</strong></div>
              <div><span>Last Heartbeat</span><strong>{worker.lastHeartbeatAt ? new Date(worker.lastHeartbeatAt).toLocaleString() : '-'}</strong></div>
              <div><span>Concurrency</span><strong>{worker.concurrency}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workers;
