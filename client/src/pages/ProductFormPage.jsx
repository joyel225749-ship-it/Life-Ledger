import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowLeft, Upload } from 'lucide-react';
import { api } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const CATEGORIES = ['Electronics', 'Appliances', 'Furniture', 'Clothing', 'Accessories', 'Sports', 'Automotive', 'Books', 'Other'];

const EMPTY = {
  name: '', brand: '', category: 'Electronics', serialNumber: '',
  purchaseDate: '', purchasePrice: '', store: '',
  returnDeadline: '', warrantyEndDate: '', warrantyProvider: '', notes: '',
};

export default function ProductFormPage() {
  const { id } = useParams();          // present when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  // Receipt & photo upload state
  const [receiptFile, setReceiptFile]   = useState(null);
  const [photoFile, setPhotoFile]       = useState(null);
  const [uploadingR, setUploadingR]     = useState(false);
  const [uploadingP, setUploadingP]     = useState(false);
  const [savedReceiptName, setSavedReceiptName] = useState('');
  const [savedPhotoName, setSavedPhotoName]     = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.getProduct(id)
      .then(p => {
        setForm({
          name:            p.name             || '',
          brand:           p.brand            || '',
          category:        p.category         || 'Electronics',
          serialNumber:    p.serialNumber     || '',
          purchaseDate:    p.purchaseDate     ? p.purchaseDate.slice(0, 10) : '',
          purchasePrice:   p.purchasePrice    ?? '',
          store:           p.store            || '',
          returnDeadline:  p.returnDeadline   ? p.returnDeadline.slice(0, 10) : '',
          warrantyEndDate: p.warrantyEndDate  ? p.warrantyEndDate.slice(0, 10) : '',
          warrantyProvider:p.warrantyProvider || '',
          notes:           p.notes           || '',
        });
        setSavedReceiptName(p.receiptPath || '');
        setSavedPhotoName(p.photoPath || '');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleUpload(file, type) {
    const fd = new FormData();
    fd.append(type, file);
    if (type === 'receipt') {
      setUploadingR(true);
      try {
        const res = await api.uploadReceipt(fd);
        setSavedReceiptName(res.fileName);
      } catch (err) {
        alert('Receipt upload failed: ' + err.message);
      } finally { setUploadingR(false); }
    } else {
      setUploadingP(true);
      try {
        const res = await api.uploadPhoto(fd);
        setSavedPhotoName(res.fileName);
      } catch (err) {
        alert('Photo upload failed: ' + err.message);
      } finally { setUploadingP(false); }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    if (!form.purchaseDate)  { setError('Purchase date is required.'); return; }
    if (form.purchasePrice === '' || isNaN(Number(form.purchasePrice))) { setError('Purchase price must be a number.'); return; }

    const payload = {
      ...form,
      purchasePrice: Number(form.purchasePrice),
      receiptPath:   savedReceiptName || undefined,
      photoPath:     savedPhotoName   || undefined,
    };
    // Strip empty optional strings to avoid overwriting with ''
    ['brand','serialNumber','store','returnDeadline','warrantyEndDate','warrantyProvider','notes'].forEach(k => {
      if (!payload[k]) delete payload[k];
    });

    setSaving(true);
    try {
      if (isEdit) {
        await api.updateProduct(id, payload);
        navigate(`/products/${id}`);
      } else {
        const p = await api.createProduct(payload);
        navigate(`/products/${p._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading product…" />;

  return (
    <div className="content content-narrow">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="welcome-row">
        <div>
          <div className="eyebrow">PRODUCT PASSPORT</div>
          <h1>{isEdit ? 'Edit product' : 'Add a product'}</h1>
        </div>
      </div>

      {error && <div className="form-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form" noValidate>
        <div className="form-section">
          <h3 className="form-section-title">Basic information</h3>
          <div className="form-grid-2">
            <label>
              Product name <span className="req">*</span>
              <input required value={form.name} onChange={set('name')} placeholder="e.g. Wireless Earbuds" />
            </label>
            <label>
              Brand
              <input value={form.brand} onChange={set('brand')} placeholder="e.g. Sony" />
            </label>
            <label>
              Category
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Serial number
              <input value={form.serialNumber} onChange={set('serialNumber')} placeholder="Optional" />
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Purchase details</h3>
          <div className="form-grid-2">
            <label>
              Purchase date <span className="req">*</span>
              <input required type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
            </label>
            <label>
              Purchase price (₹) <span className="req">*</span>
              <input required type="number" min="0" step="0.01" value={form.purchasePrice} onChange={set('purchasePrice')} placeholder="0.00" />
            </label>
            <label>
              Store / seller
              <input value={form.store} onChange={set('store')} placeholder="e.g. Amazon India" />
            </label>
            <label>
              Return deadline
              <input type="date" value={form.returnDeadline} onChange={set('returnDeadline')} />
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Warranty</h3>
          <div className="form-grid-2">
            <label>
              Warranty end date
              <input type="date" value={form.warrantyEndDate} onChange={set('warrantyEndDate')} />
            </label>
            <label>
              Warranty provider
              <input value={form.warrantyProvider} onChange={set('warrantyProvider')} placeholder="e.g. Manufacturer" />
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Documents</h3>
          <div className="form-grid-2">
            <div className="upload-field">
              <label className="upload-label">
                Receipt (PDF / image)
                <div className="upload-box">
                  <Upload size={18} />
                  <span>{savedReceiptName ? `✅ ${savedReceiptName}` : 'Click to choose file'}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="upload-input"
                    onChange={e => {
                      if (e.target.files[0]) {
                        setReceiptFile(e.target.files[0]);
                        handleUpload(e.target.files[0], 'receipt');
                      }
                    }}
                  />
                </div>
              </label>
              {uploadingR && <p className="form-hint">Uploading…</p>}
            </div>

            <div className="upload-field">
              <label className="upload-label">
                Product photo
                <div className="upload-box">
                  <Upload size={18} />
                  <span>{savedPhotoName ? `✅ ${savedPhotoName}` : 'Click to choose file'}</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="upload-input"
                    onChange={e => {
                      if (e.target.files[0]) {
                        setPhotoFile(e.target.files[0]);
                        handleUpload(e.target.files[0], 'photo');
                      }
                    }}
                  />
                </div>
              </label>
              {uploadingP && <p className="form-hint">Uploading…</p>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <label>
            Notes
            <textarea rows={3} value={form.notes} onChange={set('notes')} placeholder="Optional notes about this product" />
          </label>
        </div>

        <button className="primary-button full-button" type="submit" disabled={saving || uploadingR || uploadingP}>
          <Plus size={17} /> {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to my products'}
        </button>
      </form>
    </div>
  );
}
