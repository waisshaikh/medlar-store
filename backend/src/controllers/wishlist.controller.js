import mongoose from "mongoose";
import Usermodel from "../models/user.model.js";

const respond = async (res, userId) => {
  const user = await Usermodel.findById(userId).populate({ path: "wishlist", match: { active: { $ne: false } } });
  return res.json({ success: true, wishlist: (user?.wishlist || []).filter(Boolean) });
};

export const getWishlist = async (req, res) => {
  try { return respond(res, req.user._id); }
  catch (error) { return res.status(500).json({ message: "Server error", error: error.message }); }
};

export const addToWishlist = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) return res.status(404).json({ message: "Product not found" });
    await Usermodel.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: req.params.productId } });
    return respond(res, req.user._id);
  } catch (error) { return res.status(500).json({ message: "Server error", error: error.message }); }
};

export const removeFromWishlist = async (req, res) => {
  try {
    await Usermodel.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } });
    return respond(res, req.user._id);
  } catch (error) { return res.status(500).json({ message: "Server error", error: error.message }); }
};
