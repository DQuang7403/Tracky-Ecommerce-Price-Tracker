import Product from "../models/Product.js";
import { createError } from "../middleware/createError.js";
import {
  scrapeSaleProductsFromWinmart,
  scrapeSingleProductFromWinmart,
  scrapeProductsByNameFromWinmart,
} from "../scraper/winmart.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { addOrUpdateCronJob } from "../feature/cronJob.js";
import { sendEmail } from "../feature/mail_sender.js";
import { getRedisItem } from "../feature/redis.js";
import {
  scrapeSaleProductsFromBachHoaXanh,
  scrapeSingleProductFromBachHoaXanh,
  scrapeProductsByNameFromBachHoaXanh,
} from "../scraper/bachhoaxanh.js";
import shuffleArray from "../feature/shuffleArray.js";

//@desc get product by id
//@route GET /api/product/id/:id
//@access Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(createError(404, "Product not found"));
    }
    res.status(200).json(product);
  } catch (error) {
    next(createError(error));
  }
};

//@desc get product by title
//@route GET /api/product/title/:id
//@access Public
export const getProductByTitle = async (req, res, next) => {
  try {
    const product = await Product.find({ name: req.body.name });
    if (!product) {
      return next(createError(404, "Product not found"));
    }
    res.status(200).json(product);
  } catch (error) {
    next(createError(error));
  }
};

//@desc get user tracked products
//@route GET /api/product/tracked
//@access Private
export const getTrackedProducts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const trackedProducts = await Product.find({
      _id: {
        $in: user.trackedProducts.map(
          (product) => new mongoose.Types.ObjectId(product.id),
        ),
      },
    });
    res.status(200).json(trackedProducts);
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
};

//@desc get offer products
//@route GET /api/product/offer
//@access Public
export const getOfferProduct = async (req, res, next) => {
  try {
    let products = [];
    products = await scrapeSaleProductsFromWinmart();
    products = products.concat(await scrapeSaleProductsFromBachHoaXanh());
    if (!products) {
      return res.status(500).json("Something went wrong");
    }
    res.status(200).json(shuffleArray(products));
  } catch (error) {
    next(createError(error));
  }
};

//@desc Add new tracked product
//@route POST /api/product/add
//@access Private
export const addTrackedProduct = async (req, res, next) => {
  try {
    const product = new Product({
      ...req.body,
      price: req.body.price,
      priceHistory: [req.body.price],
      dateHistory: [new Date()],
    });
    const newProduct = await product.save();
    const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $addToSet: {
          trackedProducts: {
            id: newProduct._id.toString(),
            name: newProduct.name,
            href: newProduct.href,
            site: newProduct.site,
          },
        },
      },
      { new: true },
    );
    await addOrUpdateCronJob(updateUser);
    return res.status(200).json({
      msg: "Product added successfully",
      id: product._id,
      name: product.name,
      product: product,
    });
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
};

//@desc Scrape given product
//@route PUT /api/product/tracked-product
//@access Private
export const updateTrackedProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const product = await Product.findOne({ href: req.body.href });
    if (!product) {
      return next(createError(404, "Product not found"));
    }
    let updatedProduct = null;
    if (product.site === "winmart") {
      updatedProduct = await scrapeSingleProductFromWinmart(req.body.href);
    } else if (product.site === "bachhoaxanh") {
      updatedProduct = await scrapeSingleProductFromBachHoaXanh(req.body.href);
    }
    if (!updatedProduct) {
      res.status(404).json({ error: "Product not found" });
    }
    const updatedProductWithPrice = await Product.findOneAndUpdate(
      { href: req.body.href },
      {
        $set: {
          ...updatedProduct.productDetails,
        },
        $push: {
          priceHistory: updatedProduct.productDetails.price,
          dateHistory: new Date(),
        },
      },
      { new: true },
    );
    if (
      updatedProductWithPrice.targetPrice >
        updatedProduct.productDetails.price &&
      updatedProductWithPrice.targetPrice !== 0 &&
      user.receiveGmail
    ) {
      console.log(`Sending email to ${user.email}`);
      await sendEmail(
        user.email,
        user.name,
        formatPrice,
        product.href,
        product.name,
      );
    }
    res.status(200).json(updatedProductWithPrice);
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
};

//@desc Remove tracked product
//@route DELETE /api/product/tracked-product/:id
//@access Private
export const removeTrackedProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return next(createError(404, "Product not found"));
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          trackedProducts: {
            id: req.params.id,
          },
        },
      },
      { new: true },
    );
    await addOrUpdateCronJob(user);
    return res
      .status(200)
      .json({ msg: "Product removed successfully", id: product._id });
  } catch (error) {
    console.log(error);
  }
};

//@desc Search product
//@route Get /api/product/search
//@access Public
export const searchProduct = async (req, res, next) => {
  try {
    const searchParam = req.body.search;
    let products = [];
    products = await scrapeProductsByNameFromBachHoaXanh(searchParam);
    products = products.concat(
      await scrapeProductsByNameFromWinmart(searchParam),
    );
    if (!products) {
      return res.status(500).json("Something went wrong");
    }
    res.status(200).json(shuffleArray(products));
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
};

//@desc Scrape product
//@route POST /api/product/scrape
//@access Public
export const scrapeProduct = async (req, res, next) => {
  try {
    let storedProduct = await Product.findOne({ href: req.body.href });
    let product = null;
    if (req.body.site === "winmart") {
      product = await scrapeSingleProductFromWinmart(req.body.href);
    } else if (req.body.site === "bachhoaxanh") {
      product = await scrapeSingleProductFromBachHoaXanh(req.body.href);
    }
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (storedProduct) {
      res.status(200).json({
        ...storedProduct._doc,
        ...product.productDetails,
        discount: !product.productDetails.discount
          ? null
          : storedProduct._doc.discount,
        productContext: product.chunks[0],
      });
    }
    res
      .status(200)
      .json({ ...product.productDetails, productContext: product.chunks[0] });
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
};

//@desc Update target price of the product
//@route PUT /api/product/target-price
//@access Private
export const updateTargetPrice = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const isTracked = user.trackedProducts.find(
      (product) => product.name === req.body.name,
    );
    if (!isTracked) {
      return next(createError(404, "You are not tracking this product"));
    }
    const updateFields = {};

    if (req.body.targetPrice !== undefined) {
      updateFields.targetPrice = req.body.targetPrice;
    }

    if (req.body.autoUpdateTargetPrice !== undefined) {
      updateFields.autoUpdateTargetPrice = req.body.autoUpdateTargetPrice;
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { name: req.body.name },
      {
        $set: updateFields,
      },
      { new: true },
    );

    return res.status(200).json(updatedProduct._doc);
  } catch (error) {
    console.log(error);
  }
};

//@desc Get initial sale products
//@route GET /api/product/sale-products
//@access Public
export const getInitialSaleProducts = async (req, res, next) => {
  try {
    const products = await getRedisItem("SALE_PRODUCTS");
    if (!products.found) {
      res.status(500).json("Something went wrong");
    }
    res.status(200).json(products.data);
  } catch (error) {
    console.log(error);
  }
};
