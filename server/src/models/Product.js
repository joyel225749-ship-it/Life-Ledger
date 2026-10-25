import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, default: 'Other', trim: true },
  brand: { type: String, trim: true, maxlength: 100 },
  serialNumber: { type: String, trim: true, maxlength: 120 },
  purchaseDate: { type: Date, required: true },
  purchasePrice: { type: Number, required: true, min: 0 },
  store: { type: String, trim: true, maxlength: 120 },
  returnDeadline: Date,
  warrantyEndDate: Date,
  warrantyProvider: String,
  notes: { type: String, maxlength: 3000 },
  receiptPath: String,
  photoPath: String,
  repairCostTotal: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
