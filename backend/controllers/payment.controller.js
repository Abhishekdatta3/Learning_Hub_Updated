// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const Transaction = require('../models/Transaction');

// const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

// const createOrder = async (req, res) => {
//   try {
//     const { sessionId, teacherId, amount } = req.body;
//     const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: 'order_' + Date.now() });
//     await Transaction.create({ student: req.user._id, teacher: teacherId, session: sessionId, amount, razorpayOrderId: order.id, status: 'pending' });
//     res.json({ orderId: order.id, amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID });
//   } catch (err) { res.status(500).json({ message: err.message }); }
// };

// const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//     const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
//     if (expected !== razorpay_signature) return res.status(400).json({ message: 'Payment verification failed' });
//     await Transaction.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { razorpayPaymentId: razorpay_payment_id, status: 'paid' });
//     res.json({ message: 'Payment verified' });
//   } catch (err) { res.status(500).json({ message: err.message }); }
// };

// module.exports = { createOrder, verifyPayment };

// Razorpay temporarily disabled


