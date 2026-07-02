import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="page-stack center-page">
      <div className="card empty-state">
        <h1>404</h1>
        <p>Page not found.</p>
        <Link className="primary-btn" to="/">Go back to dashboard</Link>
      </div>
    </div>
  );
}

export default NotFound;
