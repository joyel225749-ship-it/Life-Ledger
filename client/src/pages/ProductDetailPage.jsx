import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, Pencil, Trash2, Plus, Receipt,
  Wrench, Wallet, CalendarClock, Tag, Store, Hash, StickyNote,
  ExternalLink, AlertTriangle,
} from 'lucide-react';
import { api } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const daysUntil = (date) =>
  date ? Math.ceil((new Date(date) - new Date()) / 86400000) : null;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]   = useState(null);
  const [repairs, setRepairs]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Repair form state
  const [repairForm, setRepairForm] = useState({ date: '', description: '', cost: '', shop: '', notes: '' });
  const [savingRepair, setSavingRepair] = useState(false);
  const [repairError, setRepairError]   = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [p, r] = await Promise.all([api.getProduct(id), api.getRepairs(id)]);
      setProduct(p);
      setRepairs(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.deleteProduct(id);
      navigate('/products', { replace: true });
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  }

  async function handleAddRepair(e) {
    e.preventDefault();
    setRepairError('');
    if (!repairForm.date || !repairForm.description.trim() || repairForm.cost === '') {
      setRepairError('Date, description, and cost are required.');
      return;
    }
    setSavingRepair(true);
    try {
      const log = await api.createRepair({ productId: id, ...repairForm, cost: Number(repairForm.cost) });
      setRepairs(prev => [log, ...prev]);
      setProduct(prev => ({ ...prev, repairCostTotal: (prev.repairCostTotal || 0) + Number(repairForm.cost) }));
      setRepairForm({ date: '', description: '', cost: '', shop: '', notes: '' });
      setShowRepairForm(false);
    } catch (err) {
      setRepairError(err.message);
    } finally {
      setSavingRepair(false);
    }
  }

  async function handleDeleteRepair(repairId, cost) {
    if (!window.confirm('Delete this repair record?')) return;
    try {
      await api.deleteRepair(repairId);
      setRepairs(prev => prev.filter(r => r._id !== repairId));
      setProduct(prev => ({ ...prev, repairCostTotal: Math.max(0, (prev.repairCostTotal || 0) - cost) }));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <LoadingSpinner message="Loading product passport…" />;
  if (error)   return <ErrorMessage message={error} onRetry={load} />;
  if (!product) return null;

  const warrantyDays   = daysUntil(product.warrantyEndDate);
  const returnDays     = daysUntil(product.returnDeadline);
  const totalCost      = (product.purchasePrice || 0) + (product.repairCostTotal || 0);
  const replacementEst = product.purchasePrice || 0;
  const repairRatio    = replacementEst > 0 ? ((product.repairCostTotal || 0) / replacementEst * 100).toFixed(1) : null;

  const warrantyClass =
    warrantyDays === null ? 'no-warranty' :
    warrantyDays < 0 ? 'expired' :
    warrantyDays <= 45 ? 'soon' : 'covered';

  const warrantyLabel =
    warrantyDays === null ? 'No warranty info' :
    warrantyDays < 0 ? `Expired ${Math.abs(warrantyDays)} days ago` :
    `${warrantyDays} days remaining`;

  return (
    <div className="content content-narrow">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to products
      </button>

      {/* Header */}
      <div className="passport-header">
        <div className="passport-avatar">{product.name?.slice(0, 1)?.toUpperCase()}</div>
        <div className="passport-title">
          <div className="eyebrow">{product.category}</div>
          <h1>{product.name}</h1>
          {product.brand && <p className="subtitle">{product.brand}</p>}
        </div>
        <div className="passport-actions">
          <button className="icon-btn-outline" title="Edit" onClick={() => navigate(`/products/${id}/edit`)}>
            <Pencil size={16} />
          </button>
          <button className="icon-btn-outline danger" title="Delete" disabled={deleting} onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="passport-grid">
        {/* Purchase info */}
        <section className="passport-card">
          <h2 className="passport-section-title"><Tag size={16} /> Purchase Info</h2>
          <dl className="info-list">
            <dt>Purchase date</dt><dd>{fmt(product.purchaseDate)}</dd>
            <dt>Purchase price</dt><dd>{money(product.purchasePrice)}</dd>
            {product.store && <><dt>Store</dt><dd>{product.store}</dd></>}
            {product.serialNumber && <><dt>Serial number</dt><dd><code>{product.serialNumber}</code></dd></>}
          </dl>
        </section>

        {/* Warranty */}
        <section className="passport-card">
          <h2 className="passport-section-title"><ShieldCheck size={16} /> Warranty &amp; Return</h2>
          <dl className="info-list">
            <dt>Warranty status</dt>
            <dd><span className={`status ${warrantyClass}`} style={{ position: 'static', fontSize: '11px' }}>{warrantyLabel}</span></dd>
            {product.warrantyEndDate && <><dt>Warranty ends</dt><dd>{fmt(product.warrantyEndDate)}</dd></>}
            {product.warrantyProvider && <><dt>Provider</dt><dd>{product.warrantyProvider}</dd></>}
            {product.returnDeadline && (
              <>
                <dt>Return deadline</dt>
                <dd className={returnDays !== null && returnDays <= 7 ? 'text-urgent' : ''}>
                  {fmt(product.returnDeadline)}
                  {returnDays !== null && returnDays >= 0 && ` (${returnDays} days left)`}
                  {returnDays !== null && returnDays < 0 && ' (passed)'}
                </dd>
              </>
            )}
          </dl>
        </section>

        {/* Cost of ownership */}
        <section className="passport-card">
          <h2 className="passport-section-title"><Wallet size={16} /> True Cost of Ownership</h2>
          <dl className="info-list">
            <dt>Purchase price</dt><dd>{money(product.purchasePrice)}</dd>
            <dt>Recorded repairs</dt><dd>{money(product.repairCostTotal)}</dd>
            <dt><strong>Total cost</strong></dt><dd><strong>{money(totalCost)}</strong></dd>
          </dl>
          {repairRatio !== null && (
            <div className="repair-ratio-bar">
              <div className="repair-ratio-fill" style={{ width: `${Math.min(100, Number(repairRatio))}%` }} />
            </div>
          )}
          {repairRatio !== null && (
            <p className="form-hint" style={{ marginTop: 8 }}>
              Repair costs are <strong>{repairRatio}%</strong> of the original purchase price.{' '}
              {Number(repairRatio) > 50 && (
                <span className="text-urgent">
                  <AlertTriangle size={12} style={{ display: 'inline' }} /> Consider whether replacement makes more sense.
                </span>
              )}
              <br /><em>Note: replacement cost estimates are not financial advice.</em>
            </p>
          )}
        </section>

        {/* Receipt */}
        <section className="passport-card">
          <h2 className="passport-section-title"><Receipt size={16} /> Documents</h2>
          {product.receiptPath ? (
            <a
              className="text-button"
              href={api.fileUrl(product.receiptPath)}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              View receipt <ExternalLink size={13} />
            </a>
          ) : (
            <p className="form-hint">No receipt uploaded. Edit this product to add one.</p>
          )}
          {product.photoPath && (
            <img
              src={api.fileUrl(product.photoPath)}
              alt={`Photo of ${product.name}`}
              className="product-photo-preview"
            />
          )}
        </section>
      </div>

      {/* Notes */}
      {product.notes && (
        <section className="passport-card" style={{ marginTop: 16 }}>
          <h2 className="passport-section-title"><StickyNote size={16} /> Notes</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: '#48495f', whiteSpace: 'pre-wrap' }}>{product.notes}</p>
        </section>
      )}

      {/* Repair history */}
      <section className="passport-card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="passport-section-title" style={{ margin: 0 }}><Wrench size={16} /> Repair History</h2>
          <button className="primary-button" style={{ padding: '8px 13px', fontSize: 11 }} onClick={() => setShowRepairForm(v => !v)}>
            <Plus size={15} /> {showRepairForm ? 'Cancel' : 'Log a repair'}
          </button>
        </div>

        {showRepairForm && (
          <form className="repair-form" onSubmit={handleAddRepair} noValidate>
            {repairError && <div className="form-error">{repairError}</div>}
            <div className="form-grid-2">
              <label>Date <span className="req">*</span><input required type="date" value={repairForm.date} onChange={e => setRepairForm(f => ({ ...f, date: e.target.value }))} /></label>
              <label>Cost (₹) <span className="req">*</span><input required type="number" min="0" value={repairForm.cost} onChange={e => setRepairForm(f => ({ ...f, cost: e.target.value }))} placeholder="0" /></label>
              <label style={{ gridColumn: '1 / -1' }}>Description <span className="req">*</span><input required value={repairForm.description} onChange={e => setRepairForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Screen replacement" /></label>
              <label>Shop / service center<input value={repairForm.shop} onChange={e => setRepairForm(f => ({ ...f, shop: e.target.value }))} placeholder="Optional" /></label>
              <label>Notes<input value={repairForm.notes} onChange={e => setRepairForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional" /></label>
            </div>
            <button className="primary-button" type="submit" disabled={savingRepair} style={{ marginTop: 10 }}>
              {savingRepair ? 'Saving…' : 'Save repair log'}
            </button>
          </form>
        )}

        {repairs.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 12 }}>No repair records yet. Log one above.</div>
        ) : (
          <div className="repair-list">
            {repairs.map(r => (
              <div className="repair-row" key={r._id}>
                <div className="repair-date">{fmt(r.date)}</div>
                <div className="repair-info">
                  <strong>{r.description}</strong>
                  {r.shop && <span> · {r.shop}</span>}
                  {r.notes && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9293a8' }}>{r.notes}</p>}
                </div>
                <div className="repair-cost">{money(r.cost)}</div>
                <button
                  className="icon-btn-outline danger"
                  style={{ padding: '5px 8px' }}
                  title="Delete repair"
                  onClick={() => handleDeleteRepair(r._id, r.cost)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
