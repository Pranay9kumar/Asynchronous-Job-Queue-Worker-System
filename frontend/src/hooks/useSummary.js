import { useEffect, useState } from 'react';
import api from '../lib/api';

const initialSummary = {
  health: 'Loading',
  queueStatus: 'OK',
  activeWorkers: 0,
  alertCount: 0
};

export default function useSummary() {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [healthRes, metricsRes, alertsRes] = await Promise.all([
          api.get('/health'),
          api.get('/metrics'),
          api.get('/admin/alerts')
        ]);

        if (!cancelled) {
          setSummary({
            health: healthRes.data?.status || 'UNKNOWN',
            queueStatus: metricsRes.data?.health?.status || 'OK',
            activeWorkers: metricsRes.data?.workerMetrics?.activeWorkers || 0,
            alertCount: alertsRes.data?.pagination?.total || 0
          });
        }
      } catch (error) {
        if (!cancelled) {
          setSummary(initialSummary);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    const timer = setInterval(load, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { summary, loading };
}
