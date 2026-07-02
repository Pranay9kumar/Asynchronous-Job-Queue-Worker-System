import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';

function Jobs() {
  const [type, setType] = useState('email');
  const [payloadText, setPayloadText] = useState('{\n  "to": "test@example.com"\n}');
  const [jobId, setJobId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchJob, setSearchJob] = useState(null);
  const { toast, showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchId) {
      setSearchJob(null);
      setSearchError('');
    }
  }, [searchId]);

  async function submitJob(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = JSON.parse(payloadText);
      const response = await api.post('/jobs', {
        type,
        payload,
        idempotencyKey: `job-${type}-${payload.to?.replace(/[^a-zA-Z0-9]/g, '') || 'payload'}`
      });

      setJobId(response.data.jobId || response.data.job?.jobId || '');
      showToast('Job submitted successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit job', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function searchJobById(event) {
    event.preventDefault();
    setSearchError('');
    setSearchJob(null);

    try {
      const response = await api.get(`/jobs/${searchId}`);
      setSearchJob(response.data);
    } catch (error) {
      setSearchError('Job not found');
    }
  }

  return (
    <div className="page-stack">
      <Toast toast={toast} />
      <div className="page-heading">
        <div>
          <p className="eyebrow">Jobs</p>
          <h1>Submit and inspect jobs</h1>
          <p className="muted">Create a job, then search its full lifecycle by Job ID.</p>
        </div>
      </div>

      <div className="grid two-col-grid">
        <form className="card form-card" onSubmit={submitJob}>
          <div className="card-header"><h3>Job Submission</h3></div>
          <label>
            Job Type
            <input value={type} onChange={(event) => setType(event.target.value)} placeholder="email" />
          </label>
          <label>
            Payload
            <textarea value={payloadText} onChange={(event) => setPayloadText(event.target.value)} rows={10} />
          </label>
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Job'}
          </button>
          {jobId ? (
            <div className="success-box">
              <strong>Generated Job ID</strong>
              <code>{jobId}</code>
              <button type="button" className="link-btn" onClick={() => navigate(`/jobs/${jobId}`)}>
                Open job details
              </button>
            </div>
          ) : null}
        </form>

        <div className="card form-card">
          <div className="card-header"><h3>Search Job Details</h3></div>
          <form onSubmit={searchJobById} className="stack">
            <label>
              Job ID
              <input value={searchId} onChange={(event) => setSearchId(event.target.value)} placeholder="Paste a job id" />
            </label>
            <button className="primary-btn" type="submit">Search</button>
          </form>
          {searchError ? <div className="alert-banner error">{searchError}</div> : null}
          {searchJob ? (
            <div className="detail-list">
              <div><span>Status</span><strong>{searchJob.status}</strong></div>
              <div><span>Retry Count</span><strong>{searchJob.retryCount}</strong></div>
              <div><span>Failure Reason</span><strong>{searchJob.failureReason || '-'}</strong></div>
              <div><span>Created At</span><strong>{searchJob.createdAt ? new Date(searchJob.createdAt).toLocaleString() : '-'}</strong></div>
              <Link className="link-btn" to={`/jobs/${searchJob.jobId}`}>View full timeline</Link>
            </div>
          ) : (
            <div className="empty-state">Search for a job to view its lifecycle timeline.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Jobs;
