import express from "express";
import {
  getOfferProduct,
  getProductById,
  getProductByTitle,
  addTrackedProduct,
  updateTrackedProduct,
  removeTrackedProduct,
  searchProduct,
  scrapeProduct,
  getTrackedProducts,
  updateTargetPrice,
  getInitialSaleProducts,
} from "../controllers/products.js";
const router = express.Router();
import { authVerify } from "../middleware/authVerify.js";

//get product
router.get("/id/:id", getProductById);
router.get("/title", getProductByTitle);
router.get("/offer", getOfferProduct);
router.post("/scrape", scrapeProduct);
router.post("/search", searchProduct);
router.get("/today-sale", getInitialSaleProducts);

//get tracked products
router.get("/tracked", authVerify, getTrackedProducts);

//add new tracked product
router.post("/add", authVerify, addTrackedProduct);

//update price of the product
router.put("/tracked-product", authVerify, updateTrackedProduct);

//remove tracked product
router.delete("/tracked-product/:id", authVerify, removeTrackedProduct);

//update target price of the product
router.put("/target-price", authVerify, updateTargetPrice);

export default router;
