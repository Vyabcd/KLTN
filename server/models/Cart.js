import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  cartItem: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariation",
      },
      quantiy: Number,
      default: [],
    },
  ],
});

export default mongoose.model("Cart", cartSchema);
