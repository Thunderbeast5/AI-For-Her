import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: {
      type: [orderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    owners: {
      type: [String],
      default: [],
      index: true,
    },
    // Optional: store a simple order number
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', orderSchema);
