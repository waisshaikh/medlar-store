import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  contact: { type: String, default: "" },
  password: { type: String },
  fullname: { type: String, required: true },
  googleId: { type: String, default: null },
  role: { type: String, enum: ["buyer","seller"], default: "buyer" },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
}, { timestamps: true });
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};
const Usermodel = mongoose.model("user", userSchema);
export default Usermodel;
