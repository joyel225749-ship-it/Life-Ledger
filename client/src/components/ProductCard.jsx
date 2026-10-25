import { ShieldCheck, Package, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const daysUntil = (date) =>
  date ? Math.ceil((new Date(date) - new Date()) / 86400000) : null;

const WARRANTY_COLORS = ['lavender', 'mint', 'peach', 'sky', 'rose'];

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate();
  const color = WARRANTY_COLORS[index % WARRANTY_COLORS.length];
  const d = daysUntil(product.warrantyEndDate);

  const statusLabel = d === null ? 'No warranty' : d < 0 ? 'Warranty expired' : d <= 45 ? 'Expiring soon' : 'Under warranty';
  const statusClass = d === null ? 'no-warranty' : d < 0 ? 'expired' : d <= 45 ? 'soon' : 'covered';

  return (
    <article className="product-card" onClick={() => navigate(`/products/${product._id}`)}>
      <div className={`product-art ${color}`}>
        <div className="product-symbol"><Package size={31} /></div>
        <span className={`status ${statusClass}`}>{statusLabel}</span>
      </div>
      <div className="product-details">
        <div className="product-brand">{product.brand || 'Personal item'}</div>
        <h3 title={product.name}>{product.name}</h3>
        <div className="product-meta">
          <span>Purchased</span>
          <strong>
            {product.purchaseDate
              ? new Date(product.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </strong>
        </div>
        <div className="product-meta">
          <span>Purchase price</span>
          <strong>{money(product.purchasePrice)}</strong>
        </div>
        <div className="product-footer">
          <span>
            <ShieldCheck size={15} />
            {d === null ? 'No warranty info' : d < 0 ? 'Coverage ended' : `${d} days of coverage`}
          </span>
          <button
            aria-label={`View ${product.name}`}
            onClick={e => { e.stopPropagation(); navigate(`/products/${product._id}`); }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
