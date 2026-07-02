import React from 'react';

function HealthBadge({ status }) {
  const className = `health-badge ${String(status || '').toLowerCase()}`;
  return <span className={className}>{status}</span>;
}

export default HealthBadge;
