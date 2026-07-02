import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function QueueChart({ title, labels, values, type = 'line', color = '#4fd1c5' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: title,
            data: values,
            borderColor: color,
            backgroundColor: `${color}33`,
            borderWidth: 2,
            fill: type === 'line',
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [labels, values, type, color, title]);

  return (
    <div className="card chart-card">
      <div className="card-header"><h3>{title}</h3></div>
      <div className="chart-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default QueueChart;
