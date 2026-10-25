import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, AlertTriangle } from 'lucide-react';
import { api } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const daysUntil = (date) =>
  date ? Math.ceil((new Date(date) - new Date()) / 86400000) : null;

export default function DeadlinesPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('all'); // all | urgent | warranty | returns

  async function load() {
    setLoading(true);
    setError('');
    try {
      setProducts(await api.getProducts());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner message="Loading deadlines…" />;
  if (error)   return <ErrorMessage message={error} onRetry={load} />;

  // Build deadline rows
  const rows = [];
  products.forEach(p => {
    const wd = daysUntil(p.warrantyEndDate);
    const rd = daysUntil(p.returnDeadline);
    if (p.warrantyEndDate && wd !== null) {
      rows.push({ product: p, type: 'warranty', days: wd, date: p.warrantyEndDate });
    }
    if (p.returnDeadline && rd !== null) {
      rows.push({ product: p, type: 'return', days: rd, date: p.returnDeadline });
    }
  });

  // Sort by days ascending (most urgent first)
  rows.sort((a, b) => a.days - b.days);

  const filtered = rows.filter(r => {
    if (filter === 'urgent') return r.days >= 0 && r.days <= 14;
    if (filter === 'warranty') return r.type === 'warranty';
    if (filter === 'returns') return r.type === 'return';
    return true;
  });

  const urgentCount = rows.filter(r => r.days >= 0 && r.days <= 14).length;

  return (
    <div className="content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><CalendarClock size={14} /> DEADLINE TRACKER</div>
          <h1>Deadlines</h1>
          <p className="subtitle">{urgentCount} urgent deadline{urgentCount !== 1 ? 's' : ''} within the next 14 days</p>
        </div>
      </div>

      <div className="filter-bar">
        {[['all', 'All deadlines'], ['urgent', '⚠️ Urgent (≤14 days)'], ['warranty', 'Warranties'], ['returns', 'Returns']].map(([v, l]) => (
          <button key={v} className={`filter-chip${filter === v ? ' active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {rows.length === 0
            ? 'No deadlines to track. Add warranty and return dates when adding products.'
            : 'No deadlines match this filter.'}
        </div>
      ) : (
        <section className="deadline-panel">
          <div className="deadline-list">
            {filtered.map((r, i) => {
              const isPast   = r.days < 0;
              const isUrgent = !isPast && r.days <= 14;
              const isSoon   = !isPast && r.days <= 45;
              return (
                <div
                  key={`${r.product._id}-${r.type}`}
                  className={`deadline-row${isUrgent ? ' urgent-row' : ''}`}
                  onClick={() => navigate(`/products/${r.product._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`mini-product ${r.type === 'warranty' ? 'mint' : 'peach'}`}>
                    <p>{r.product.name?.slice(0, 1)?.toUpperCase()}</p>
                  </div>
                  <div className="deadline-info">
                    <strong>{r.product.name}</strong>
                    <span>
                      {r.type === 'warranty' ? 'Warranty' : 'Return deadline'} — {fmt(r.date)}
                      {r.product.brand && ` · ${r.product.brand}`}
                    </span>
                  </div>
                  <div className="deadline-right">
                    {isPast ? (
                      <strong style={{ color: '#ca6d69' }}>{Math.abs(r.days)} days ago</strong>
                    ) : (
                      <strong style={{ color: isUrgent ? '#ca6d69' : isSoon ? '#d38c48' : '#55a06a' }}>
                        {r.days} days left
                      </strong>
                    )}
                    <span className={`deadline-pill ${isPast ? 'expired-pill' : isUrgent ? 'urgent' : ''}`}>
                      {isPast ? 'Expired' : isUrgent ? '⚠️ Act now' : isSoon ? 'Review coverage' : 'On track'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
