import { body, validationResult } from "express-validator";
function validateProduct(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  next();
}
export const productValidator = [
  body("tittle").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("priceAmount").isNumeric().withMessage("Invalid price"),
  validateProduct
];
