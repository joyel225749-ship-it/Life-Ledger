import mongoose from 'mongoose';

const repairLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  owner:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
  date:        { type: Date,   required: true },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  cost:        { type: Number, required: true, min: 0 },
  shop:        { type: String, trim: true, maxlength: 120 },
  notes:       { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true });

export default mongoose.model('RepairLog', repairLogSchema);
