import { body, validationResult } from "express-validator";
function validateRegiter(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}
export const registerValidationUser = [
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid Email"),
  body("contact").notEmpty().withMessage("Contact is required").matches(/^\d{10}$/).withMessage("Contact must be 10 digits"),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be 6+ characters"),
  body("fullname").notEmpty().withMessage("Full name is required").isLength({ min: 3 }).withMessage("Full name must be 3+ characters"),
  body("isSeller").optional().isBoolean().withMessage("isSeller must be boolean"),
  validateRegiter
];
export const loginValidation = [
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid Email"),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be 6+ characters"),
  validateRegiter
];
