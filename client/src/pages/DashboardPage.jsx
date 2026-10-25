import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, Clock3, Package, ArrowUpRight, Sparkles, Plus, Dot } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import StatCard from '../components/StatCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const daysUntil = (date) =>
  date ? Math.ceil((new Date(date) - new Date()) / 86400000) : null;

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const d = await api.getDashboard();
      setData(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <LoadingSpinner message="Loading your dashboard…" />;
  if (error)   return <ErrorMessage message={error} onRetry={load} />;

  const { stats, recentProducts, upcomingDeadlines } = data;
  const totalCost = (stats.totalPurchaseCost || 0) + (stats.totalRepairCost || 0);

  return (
    <div className="content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL PRODUCT ASSISTANT</div>
          <h1>{greeting}, {firstName}.</h1>
          <p className="subtitle">Keep every receipt, warranty, and repair in one calm, organized place.</p>
        </div>
        <button className="primary-button" onClick={() => navigate('/products/new')}>
          <Plus size={18} /> Add product
        </button>
      </div>

      <section className="stats-grid">
        <StatCard
          label="Total ownership cost"
          value={money(totalCost)}
          foot="Purchase + recorded repairs"
          iconClass="violet"
          icon={Wallet}
        />
        <StatCard
          label="Active warranties"
          value={stats.activeWarranties}
          subValue={` / ${stats.totalProducts}`}
          foot={<><span className="dot green-dot" /> Products still covered</>}
          iconClass="green"
          icon={ShieldCheck}
        />
        <StatCard
          label="Deadlines to watch"
          value={stats.expiringWarranties45}
          subValue=" upcoming"
          foot="Warranties expiring within 45 days"
          iconClass="amber"
          icon={Clock3}
        />
        <StatCard
          label="Products tracked"
          value={stats.totalProducts}
          foot="Across your collection"
          iconClass="blue"
          icon={Package}
        />
      </section>

      {/* Upcoming deadlines */}
      <section className="deadline-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">DON'T MISS A WINDOW</div>
            <h2>Coming up next</h2>
          </div>
          <Link to="/deadlines" className="text-button">
            View deadlines <ArrowUpRight size={15} />
          </Link>
        </div>

        {upcomingDeadlines.length === 0 ? (
          <div className="empty-state">
            🎉 No upcoming deadlines within the next 45 days. You're all caught up!
          </div>
        ) : (
          <div className="deadline-list">
            {upcomingDeadlines.map(p => {
              const wd = daysUntil(p.warrantyEndDate);
              const rd = daysUntil(p.returnDeadline);
              const days = wd !== null && wd >= 0 ? wd : rd;
              const isReturn = (wd === null || wd < 0) && rd !== null;
              return (
                <div className="deadline-row" key={p._id} onClick={() => navigate(`/products/${p._id}`)} style={{ cursor: 'pointer' }}>
                  <div className="mini-product mint">
                    <p>{p.name?.slice(0, 1)?.toUpperCase()}</p>
                  </div>
                  <div className="deadline-info">
                    <strong>{p.name}</strong>
                    <span>
                      {isReturn ? 'Return deadline' : 'Warranty ends'}{' '}
                      {new Date(isReturn ? p.returnDeadline : p.warrantyEndDate)
                        .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="deadline-right">
                    <strong>{Math.max(0, days ?? 0)} days left</strong>
                    <span className={`deadline-pill ${days <= 7 ? 'urgent' : ''}`}>
                      {days <= 7 ? '⚠️ Urgent' : 'Review coverage'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent products */}
      <section className="products-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">YOUR DIGITAL PRODUCT PASSPORTS</div>
            <h2>Recently added products</h2>
          </div>
          <Link to="/products" className="text-button">
            All products <ArrowUpRight size={15} />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="empty-state">
            No products yet.{' '}
            <button className="text-button" onClick={() => navigate('/products/new')}>Add your first one →</button>
          </div>
        ) : (
          <div className="product-grid">
            {recentProducts.map((p, i) => {
              const d = daysUntil(p.warrantyEndDate);
              const statusClass = d === null ? 'no-warranty' : d < 0 ? 'expired' : d <= 45 ? 'soon' : 'covered';
              const statusLabel = d === null ? 'No warranty' : d < 0 ? 'Warranty expired' : d <= 45 ? 'Expiring soon' : 'Under warranty';
              const colors = ['lavender', 'mint', 'peach', 'sky', 'rose'];
              const color = colors[i % colors.length];
              return (
                <article
                  className="product-card"
                  key={p._id}
                  onClick={() => navigate(`/products/${p._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`product-art ${color}`}>
                    <div className="product-symbol"><Package size={31} /></div>
                    <span className={`status ${statusClass}`}>{statusLabel}</span>
                  </div>
                  <div className="product-details">
                    <div className="product-brand">{p.brand || 'Personal item'}</div>
                    <h3 title={p.name}>{p.name}</h3>
                    <div className="product-meta">
                      <span>Purchase price</span>
                      <strong>{money(p.purchasePrice)}</strong>
                    </div>
                    <div className="product-meta">
                      <span>Total cost</span>
                      <strong>{money((p.purchasePrice || 0) + (p.repairCostTotal || 0))}</strong>
                    </div>
                    <div className="product-footer">
                      <span><ShieldCheck size={15} />
                        {d === null ? 'No warranty' : d < 0 ? 'Coverage ended' : `${d} days left`}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer>LifeLedger <span>·</span> Care for what you own.</footer>
    </div>
  );
}
