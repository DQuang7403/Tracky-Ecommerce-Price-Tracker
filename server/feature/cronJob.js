import User from "../models/User.js";
import Product from "../models/Product.js";
import cron from "node-cron";
import { scrapeSingleProduct } from "../scraper/winmart.js";
import { convertPriceStringToFloat } from "../controllers/products.js";
import { deleteRedisItem, getRedisItem, setRedisItem } from "./redis.js";
import { sendEmail } from "../feature/mail_sender.js";
async function scheduleUserCronJob(user) {
  const userID = `user:${user._id}`;
  const res = await getRedisItem(userID);
  if (res.found) {
    console.log("Scheduling user cron job for " + user.email);
    return cron.schedule(res.data.cronJobCode, async () => {
      await updateProducts(user);
    });
  } else {
    console.log("User not found");
  }
}
export function deleteUserCronJob(user) {
  const userID = `user:${user._id}`;
  const res = getRedisItem(userID);
  if (res.found) {
    deleteRedisItem(userID);
  } else {
    console.log("User not found");
  }
}

export async function addOrUpdateCronJob(user) {
  const userID = `user:${user._id}`;
  const res = await getRedisItem(userID);
  if (res.found) {
    if (res.data.trackedProducts.length !== user.trackedProducts.length) {
      console.log(`Update cron job for ${user.email}`);
      await deleteRedisItem(userID);
    }
  }
  await setRedisItem(userID, {
    _id: user._id,
    email: user.email,
    receiveGmail: user.receiveGmail,
    trackedProducts: user.trackedProducts,
    cronJobCode: user.autoUpdateConfig.cronJobCode,
  });
  await scheduleUserCronJob(user);
}

export async function initializeCronJobs() {
  const users = await User.find({
    trackedProducts: { $exists: true, $not: { $size: 0 } },
  });
  users.forEach((user) => {
    addOrUpdateCronJob(user);
  });
}

const updateProducts = async (user) => {
  if (!user) return;
  if (user.trackedProducts.length === 0) return;
  for (const product of user.trackedProducts) {
    const DBProduct = await Product.findOne({
      href: product.href,
      autoUpdateTargetPrice: true,
    });
    if (!DBProduct) continue;
    if (DBProduct.autoUpdateTargetPrice === false) continue;

    const updatedProduct = await scrapeSingleProduct(product.href);
    const formatPrice = convertPriceStringToFloat(updatedProduct.price);
    const updatedProductWithPrice = await Product.findOneAndUpdate(
      { href: product.href },
      {
        $set: { ...updatedProduct, price: formatPrice },
        $push: {
          priceHistory: formatPrice,
          dateHistory: new Date(),
        },
      },
      { new: true },
    );
    if (
      updatedProductWithPrice.targetPrice > formatPrice &&
      updatedProductWithPrice.targetPrice !== 0 &&
      user.receiveGmail
    ) {
      await sendEmail(
        user.email,
        user.name,
        formatPrice,
        product.href,
        product.name,
      );
    }
  }
};
