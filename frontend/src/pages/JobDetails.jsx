import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api';

function JobDetails() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/jobs/${jobId}`);
        if (!cancelled) setJob(response.data);
      } catch (err) {
        if (!cancelled) setError('Job not found or unavailable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadJob();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const timeline = [
    { key: 'createdAt', label: 'WAITING' },
    { key: 'startedAt', label: 'ACTIVE' },
    { key: 'failedAt', label: job?.status === 'FAILED' ? 'FAILED' : 'RETRY' },
    { key: 'completedAt', label: 'COMPLETED' }
  ];

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Job Details</p>
          <h1>Job {jobId}</h1>
          <p className="muted">Timeline, timestamps, and final execution state.</p>
        </div>
        <Link className="secondary-btn" to="/jobs">Back to jobs</Link>
      </div>

      {loading ? <div className="card empty-state">Loading job details...</div> : null}
      {error ? <div className="alert-banner error">{error}</div> : null}

      {job ? (
        <div className="grid two-col-grid">
          <div className="card info-card">
            <div className="card-header"><h3>Lifecycle Timeline</h3></div>
            <div className="timeline">
              {timeline.map((step) => (
                <div key={step.label} className={`timeline-step ${job[step.key] ? 'active' : ''}`}>
                  <div className="timeline-dot" />
                  <div>
                    <strong>{step.label}</strong>
                    <span>{job[step.key] ? new Date(job[step.key]).toLocaleString() : 'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card info-card">
            <div className="card-header"><h3>Job Snapshot</h3></div>
            <ul className="list">
              <li><span>Status</span><strong>{job.status}</strong></li>
              <li><span>Execution Status</span><strong>{job.executionStatus}</strong></li>
              <li><span>Retry Count</span><strong>{job.retryCount}</strong></li>
              <li><span>Max Retries</span><strong>{job.maxRetries}</strong></li>
              <li><span>Worker ID</span><strong>{job.workerId || '-'}</strong></li>
              <li><span>Failure Reason</span><strong>{job.failureReason || '-'}</strong></li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default JobDetails;
