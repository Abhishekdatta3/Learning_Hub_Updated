const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  student:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session:           { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  amount:            { type: Number, required: true },
  currency:          { type: String, default: 'INR' },
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
  status:            { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
}, { timestamps: true });
module.exports = mongoose.model('Transaction', transactionSchema);
