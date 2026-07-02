import React from 'react';

function Card({ title, value, subtext, tone = '' }) {
  return (
    <div className={`card metric-card ${tone}`}>
      <p>{title}</p>
      <h3>{value}</h3>
      {subtext ? <span>{subtext}</span> : null}
    </div>
  );
}

export default Card;
