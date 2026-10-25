import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, Trash2, Pencil, Filter } from 'lucide-react';
import { api } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ProductCard from '../components/ProductCard.jsx';

const CATEGORIES = ['All', 'Electronics', 'Appliances', 'Furniture', 'Clothing', 'Accessories', 'Sports', 'Automotive', 'Books', 'Other'];

export default function ProductsPage({ search }) {
  const navigate = useNavigate();
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [category, setCategory]   = useState('All');
  const [deleting, setDeleting]   = useState('');

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

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting('');
    }
  }

  const filtered = useMemo(() => {
    let list = products;
    if (category !== 'All') list = list.filter(p => p.category === category);
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        `${p.name} ${p.brand} ${p.category} ${p.serialNumber}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, category, search]);

  if (loading) return <LoadingSpinner message="Loading products…" />;
  if (error)   return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><Package size={14} /> YOUR DIGITAL PRODUCT PASSPORTS</div>
          <h1>My products</h1>
          <p className="subtitle">{products.length} product{products.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <button className="primary-button" onClick={() => navigate('/products/new')}>
          <Plus size={18} /> Add product
        </button>
      </div>

      {/* Category filter */}
      <div className="filter-bar">
        <Filter size={14} />
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`filter-chip${category === c ? ' active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {products.length === 0
            ? <>No products yet. <button className="text-button" onClick={() => navigate('/products/new')}>Add your first →</button></>
            : 'No products match your search or filter.'}
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p, i) => (
            <div key={p._id} className="product-card-wrap">
              <ProductCard product={p} index={i} />
              <div className="card-actions">
                <button
                  className="card-action-btn edit"
                  title="Edit"
                  onClick={e => { e.stopPropagation(); navigate(`/products/${p._id}/edit`); }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="card-action-btn del"
                  title="Delete"
                  disabled={deleting === p._id}
                  onClick={e => { e.stopPropagation(); handleDelete(p._id, p.name); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
