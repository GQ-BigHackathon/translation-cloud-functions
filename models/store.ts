import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    hostname: { type: String, required: true },
    hash: { type: String, required: true },
    status: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const Store = mongoose.model('Store', storeSchema);

export default Store;
