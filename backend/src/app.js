import express from "express";
import morgan from "morgan";
import cookieparser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import authRouter from "./router/auth.router.js";
import productRouter from "./router/product.routes.js";
import cartRouter from "./router/cart.routes.js";
import paymentRouter from "./router/payment.routes.js";
import categoryRouter from "./router/category.routes.js";
import sellerRouter from "./router/seller.routes.js";
import wishlistRouter from "./router/wishlist.routes.js";
import { config } from "./config/config.js";
import Usermodel from "./models/user.model.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [config.FRONTEND_ORIGIN, config.BACKEND_ORIGIN];
const allowAllOrigins = process.env.CORS_ORIGINS === "*";
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowAllOrigins) return callback(null, true);
    if (origin.startsWith("http://localhost:")) return callback(null, true);
    if (origin.endsWith(".vercel.app") || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(morgan("dev"));
// rawBody is kept for Razorpay webhook signature verification
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(passport.initialize());

if (config.Client_ID && config.Client_secret) {
  passport.use(new GoogleStrategy(
    { clientID: config.Client_ID, clientSecret: config.Client_secret, callbackURL: `${config.BACKEND_ORIGIN}/api/auth/google/callback` },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const role = config.SELLER_EMAILS.includes(email) ? "seller" : "buyer";
        let user = await Usermodel.findOne({ googleId: profile.id });
        if (!user) {
          user = await Usermodel.findOne({ email });
          if (user) { user.googleId = profile.id; await user.save(); }
          else { user = await Usermodel.create({ googleId: profile.id, email, fullname: profile.displayName, contact: "", role }); }
        }
        return done(null, user);
      } catch (err) { return done(err, null); }
    }
  ));
}

app.get("/", (req, res) => res.status(200).json({ message: "Medlar API running" }));
app.get("/api/config", (req, res) => res.json({ razorpayKeyId: config.RAZORPAY_KEY_ID, googleEnabled: Boolean(config.Client_ID && config.Client_secret) }));
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/wishlist", wishlistRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE" ? "Maximum 7 images allowed per upload" : err.code === "LIMIT_FILE_SIZE" ? "Each image must be under 5MB" : err.message;
    return res.status(400).json({ message });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ message: err.message || "Server error" });
});

export default app;
