import User from "../models/User.js";
import Product from "../models/Product.js";
import cron from "node-cron";
import { scrapeSingleProductFromWinmart } from "../scraper/winmart.js";
import { scrapeSingleProductFromBachHoaXanh } from "../scraper/bachhoaxanh.js";
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

    let updatedProduct = null;
    if (product.site === "winmart") {
      updatedProduct = await scrapeSingleProductFromWinmart(product.href);
    } else if (product.site === "bachhoaxanh") {
      updatedProduct = await scrapeSingleProductFromBachHoaXanh(product.href);
    }
    const updatedProductWithPrice = await Product.findOneAndUpdate(
      { href: product.href },
      {
        $set: { ...updatedProduct.productDetails },
        $push: {
          priceHistory: updatedProduct.productDetails.price,
          dateHistory: new Date(),
        },
      },
      { new: true },
    );
    if (
      updatedProductWithPrice.targetPrice > updatedProduct.productDetails.price &&
      updatedProductWithPrice.targetPrice !== 0 &&
      user.receiveGmail
    ) {
      await sendEmail(
        user.email,
        user.name,
        updatedProduct.price,
        product.href,
        product.name,
      );
    }
  }
};
