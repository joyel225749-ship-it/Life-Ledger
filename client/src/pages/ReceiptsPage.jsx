import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceiptText, ExternalLink } from 'lucide-react';
import { api } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function ReceiptsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const all = await api.getProducts();
      setProducts(all.filter(p => p.receiptPath || p.photoPath));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner message="Loading receipts…" />;
  if (error)   return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><ReceiptText size={14} /> DIGITAL RECEIPT VAULT</div>
          <h1>Receipts &amp; documents</h1>
          <p className="subtitle">{products.length} product{products.length !== 1 ? 's' : ''} with documents</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          No receipts uploaded yet. Upload receipts when adding or editing a product.
        </div>
      ) : (
        <div className="receipts-grid">
          {products.map(p => (
            <div className="receipt-card" key={p._id} onClick={() => navigate(`/products/${p._id}`)} style={{ cursor: 'pointer' }}>
              <div className="receipt-icon-wrap">
                {p.photoPath
                  ? <img src={api.fileUrl(p.photoPath)} alt={p.name} className="receipt-thumb" />
                  : <ReceiptText size={28} />
                }
              </div>
              <div className="receipt-info">
                <strong>{p.name}</strong>
                <span>{p.brand || p.category}</span>
              </div>
              <div className="receipt-links">
                {p.receiptPath && (
                  <a href={api.fileUrl(p.receiptPath)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-button" style={{ fontSize: 11 }}>
                    Receipt <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
