import Product from "../models/Product.js";
import { createError } from "../middleware/createError.js";
import {
  scrapeSaleProductsFromWinmart,
  scrapeProductsByNameFromWinmart,
} from "../scraper/Scraper_Function/winmart.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { addOrUpdateCronJob } from "../feature/cronJob.js";
import { sendEmail } from "../feature/mail_sender.js";
import { getRedisItem } from "../feature/redis.js";
import { scrapeSaleProductsFromBachHoaXanh } from "../scraper/Scraper_Function/bachhoaxanh.js";
import shuffleArray from "../feature/shuffleArray.js";
import {
  getBachhoaxanhScraper,
  getWinmartScraper,
} from "../scraper/Factory/instances.js";
import {
  ScrapeSingleProduct,
  ScrapeProductByName,
} from "../scraper/Scraper_Function/Stragegy.js";

const winmartScraper = getWinmartScraper();
const bachhoaxanhScraper = getBachhoaxanhScraper();

//@desc get product by id
//@route GET /api/product/id/:id
//@access Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(createError(404, "Product not found"));
    }
    return res.status(200).json(product);
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
    return res.status(200).json(product);
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
    return res.status(200).json(trackedProducts);
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
};
/**
 * @desc get offer products
 * @route GET /api/product/offer
 * @access Public
 */

export const getOfferProduct = async (req, res, next) => {
  try {
    let products = [];
    console.time("Scraping time");
    products = await scrapeSaleProductsFromWinmart();
    products = products.concat(await scrapeSaleProductsFromBachHoaXanh());
    console.timeEnd("Scraping time");
    if (!products) {
      return res.status(500).json("Something went wrong");
    }
    return res.status(200).json(shuffleArray(products));
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
      await winmartScraper.setStrategy(new ScrapeSingleProduct(req.body.href));
      updatedProduct = await winmartScraper.scrape();
    } else if (product.site === "bachhoaxanh") {
      await bachhoaxanhScraper.setStrategy(
        new ScrapeSingleProduct(req.body.href),
      );
      updatedProduct = await bachhoaxanhScraper.scrape();
    }
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
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
        updatedProduct.productDetails.price,
        product.href,
        product.name,
      );
    }
    return res.status(200).json(updatedProductWithPrice);
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
    await bachhoaxanhScraper.setStrategy(new ScrapeProductByName(searchParam));
    products = [...products, ...(await bachhoaxanhScraper.scrape())];

    await winmartScraper.setStrategy(new ScrapeProductByName(searchParam));
    products = [...products, ...(await winmartScraper.scrape())];

    
    if (!products) {
      return res.status(500).json("Something went wrong");
    }
    return res.status(200).json(shuffleArray(products));
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
      await winmartScraper.setStrategy(new ScrapeSingleProduct(req.body.href));
      product = await winmartScraper.scrape();
    } else if (req.body.site === "bachhoaxanh") {
      await bachhoaxanhScraper.setStrategy(
        new ScrapeSingleProduct(req.body.href),
      );
      product = await bachhoaxanhScraper.scrape();
    }

    // Check if the product was found during scraping
    if (!product || !product.productDetails) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (storedProduct) {
      return res.status(200).json({
        ...storedProduct._doc,
        ...product.productDetails,
        discount: product.productDetails.discount
          ? storedProduct._doc.discount
          : null,
        productContext: product.chunks[0],
      });
    }

    return res.status(200).json({
      ...product.productDetails,
      productContext: product.chunks[0],
    });
  } catch (error) {
    console.log("Error in scrapeProduct function:", error);
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
      return res.status(500).json("Something went wrong");
    }
    return res.status(200).json(products.data);
  } catch (error) {
    console.log(error);
  }
};
