import Usermodel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res, message) {
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
  return res.status(201).json({
    message, success: true, token,
    user: { id: user._id, email: user.email, contact: user.contact, fullname: user.fullname, role: user.role }
  });
}

export const regiterController = async (req, res) => {
  const { email, contact, password, fullname } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    const isUserExiste = await Usermodel.findOne({ $or: [{ contact }, { email }] });
    if (isUserExiste) return res.status(400).json({ message: "User Already Exists With this Email or Contact" });
    const role = config.SELLER_EMAILS.includes(normalizedEmail) ? "seller" : "buyer";
    const user = await Usermodel.create({ email: normalizedEmail, contact, password, fullname, role });
    await sendTokenResponse(user, res, "User registered successfully");
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;
  const user = await Usermodel.findOne({ email: email?.trim().toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid email or password" });
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });
  await sendTokenResponse(user, res, "Login successfully");
};

export const meController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    return res.status(200).json({ success: true, user: { id: user._id, email: user.email, contact: user.contact, fullname: user.fullname, role: user.role } });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const googleAuthController = async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
    return res.redirect(`${config.FRONTEND_ORIGIN}/?token=${token}`);
  } catch (error) {
    return res.redirect(`${config.FRONTEND_ORIGIN}/register?error=google_failed`);
  }
};

export const logoutController = async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
};
