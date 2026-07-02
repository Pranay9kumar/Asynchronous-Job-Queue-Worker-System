import React, { useEffect, useState } from 'react';
import api from '../lib/api';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/admin/alerts');
        if (!cancelled) setAlerts(response.data.alerts || []);
      } catch (err) {
        if (!cancelled) setError('Failed to load alerts.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAlerts();
    const timer = setInterval(loadAlerts, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Alerts</p>
          <h1>Operational alerts</h1>
        </div>
      </div>

      {error ? <div className="alert-banner error">{error}</div> : null}
      {loading ? <div className="card empty-state">Loading alerts...</div> : null}
      {!loading && alerts.length === 0 ? <div className="card empty-state">No active alerts.</div> : null}

      <div className="grid alert-grid">
        {alerts.map((alert) => (
          <div key={alert._id} className="card alert-card">
            <div className="alert-head">
              <h3>{alert.type}</h3>
              <span className={`pill ${String(alert.severity || '').toLowerCase()}`}>{alert.severity}</span>
            </div>
            <p>{alert.message}</p>
            <small>{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : ''}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;
