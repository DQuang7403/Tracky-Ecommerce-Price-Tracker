import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    image: {
      type: String,
      require: true,
    },
    href: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    available: {
      type: String,
    },
    discount: {
      type: Number,
    },
    unit: {
      type: String,
      require: true,
    },
    specialOffer: {
      type: String,
    },
    transportOffer: {
      type: String,
    },
    priceHistory: {
      type: [Number],
      default: [],
    },
    dateHistory: {
      type: [Date],
      default: [],
    },
    targetPrice: {
      type: Number,
      default: 0,
    },
    autoUpdateTargetPrice: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", ProductSchema);
