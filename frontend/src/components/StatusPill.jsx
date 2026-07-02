import React from 'react';

function StatusPill({ value }) {
  const className = `pill ${String(value || '').toLowerCase().replace(/\s+/g, '-')}`;
  return <span className={className}>{value}</span>;
}

export default StatusPill;
