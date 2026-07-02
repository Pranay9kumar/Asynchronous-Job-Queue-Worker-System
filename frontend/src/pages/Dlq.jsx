import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';

function Dlq() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast, showToast } = useToast();

  async function loadDlq() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/dlq');
      setItems(response.data.jobs || []);
    } catch (err) {
      setError('Failed to load DLQ items.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDlq();
  }, []);

  async function retryItem(jobId) {
    try {
      await api.post(`/dlq/${jobId}/retry`);
      showToast('DLQ job re-queued', 'success');
      loadDlq();
    } catch (err) {
      showToast('Retry failed', 'error');
    }
  }

  async function deleteItem(jobId) {
    try {
      await api.delete(`/dlq/${jobId}`);
      showToast('DLQ job deleted', 'success');
      loadDlq();
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  }

  return (
    <div className="page-stack">
      <Toast toast={toast} />
      <div className="page-heading">
        <div>
          <p className="eyebrow">Dead Letter Queue</p>
          <h1>Failed jobs needing attention</h1>
        </div>
      </div>

      {error ? <div className="alert-banner error">{error}</div> : null}

      <div className="card table-card">
        {loading ? <div className="empty-state">Loading DLQ entries...</div> : null}
        {!loading && items.length === 0 ? <div className="empty-state">No dead-letter jobs right now.</div> : null}
        {!loading && items.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Failure Reason</th>
                <th>Retry Count</th>
                <th>Failed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.jobId}>
                  <td>{item.jobId}</td>
                  <td>{item.failureReason || '-'}</td>
                  <td>{item.retryCount}</td>
                  <td>{item.failedAt ? new Date(item.failedAt).toLocaleString() : '-'}</td>
                  <td className="actions-cell">
                    <button className="secondary-btn" onClick={() => retryItem(item.jobId)}>Retry</button>
                    <button className="danger-btn" onClick={() => deleteItem(item.jobId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}

export default Dlq;
