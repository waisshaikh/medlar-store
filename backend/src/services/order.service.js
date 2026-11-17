import paymentModel from "../models/payment.model.js";
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";

const restock = (items) => Promise.all(items.map((item) =>
  productModel.updateOne({ _id: item.productId, "variants._id": item.variantId }, { $inc: { "variants.$.stock": item.quantity } })
));

export const restockOrderItems = (items) => restock(items.filter((item) => item.variantId));

// Idempotently marks a payment as paid, deducting variant stock atomically.
export async function finalizePaidOrder(payment, { paymentId, signature }) {
  if (payment.status === "paid") return { status: "already_paid", payment };

  const adjusted = [];
  for (const item of payment.orderitems) {
    if (!item.variantId) continue;
    const result = await productModel.updateOne(
      { _id: item.productId, variants: { $elemMatch: { _id: item.variantId, stock: { $gte: item.quantity } } } },
      { $inc: { "variants.$.stock": -item.quantity } }
    );
    if (!result.modifiedCount) {
      await restock(adjusted);
      await paymentModel.updateOne(
        { _id: payment._id, status: { $ne: "paid" } },
        { $set: { status: "failed", failureReason: `Out of stock: ${item.tittle}${item.variantName ? ` (${item.variantName})` : ""} — refund required`, "razorpay.paymentId": paymentId } }
      );
      return { status: "out_of_stock" };
    }
    adjusted.push(item);
  }

  const update = { status: "paid", paidAt: new Date(), failureReason: null, "razorpay.paymentId": paymentId };
  if (signature) update["razorpay.signature"] = signature;
  const confirmed = await paymentModel.findOneAndUpdate({ _id: payment._id, status: { $ne: "paid" } }, { $set: update }, { new: true });
  if (!confirmed) {
    await restock(adjusted);
    return { status: "already_paid", payment: await paymentModel.findById(payment._id) };
  }
  await cartModel.updateOne({ user: payment.user }, { $set: { items: [] } });
  return { status: "paid", payment: confirmed };
}
