import { setTimeout } from "node:timers/promises";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
import proxyChain from "proxy-chain";

puppeteer.use(StealthPlugin());

let browser;
const username = process.env.WEBSHARE_USERNAME;
const password = process.env.WEBSHARE_PASSWORD;
// args: [`--proxy-server=${newProxyUrl}`],

// const puppeteerConfig = {
//   headless: true,
//   executablePath:
//     process.env.NODE_ENV === "production"
//       ? process.env.PUPPETEER_EXECUTABLE_PATH
//       : executablePath(),
//   userDataDir: "C:/Users/ADMIN/AppData/Local/Google/Chrome/User Data/Default",
//   args: ["--no-sandbox", "--disable-setuid-sandbox"],
// };
async function autoScroll(page) {
  await page.evaluate(async () => {
    let limit = 2000;
    let totalHeight = 0;
    let distance = 100;
    await new Promise((resolve, reject) => {
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || totalHeight >= limit) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
}

export async function scrapeSaleProducts() {
  try {
    // const oldProxyUrl = `http://${username}:${password}@p.webshare.io:80`;
    // const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
    browser = await puppeteer.launch({
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      userDataDir:
        "C:/Users/ADMIN/AppData/Local/Google/Chrome/User Data/Default",
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(3 * 60 * 1000);

    //go to the website page
    await page.goto(`https://winmart.vn/`, {
      waitUntil: "domcontentloaded",
    });

    const selector = ".product-carousel-v2__SliderSection-sc-1hy54ys-4";
    await page.waitForSelector(selector);

    const el = await page.$(selector);
    await autoScroll(page);

    const products = await el.evaluate(() => {
      return Array.from(
        document.querySelectorAll(".product-card__Card-sc-1q72qgw-0"),
      ).map((product) => {
        const titleElement = product.querySelector(
          "h6.product-card__Title-sc-1q72qgw-6",
        );
        const linkElement = product.querySelector("a");
        const priceElement = product.querySelector(
          ".product-card__Price-sc-1q72qgw-9",
        );
        const discountElement = product.querySelector(
          ".product-card__Discount-sc-1q72qgw-4.gAYIMJ",
        );
        const imageElements = product.querySelectorAll("img");
        const specialOffer = product.querySelector(
          ".product-card__Zb01Text-sc-1q72qgw-8.dpMwoq .fs11",
        );
        let imageUrl = null;
        imageElements.forEach((img) => {
          if (img.src.startsWith("http")) {
            imageUrl = img.src;
          }
        });
        const unitDivs = Array.from(product.querySelectorAll("div"));
        let unit = null;
        unit = unitDivs
          .filter((div) => div.innerText.includes("ĐVT: "))
          .map((div) => div.innerText.trim().replace("ĐVT: ", "").trim())
          .pop();

        return {
          name: titleElement ? titleElement.innerText : null,
          href: linkElement ? linkElement.href : null,
          price: priceElement ? priceElement.innerText.trim() : null,
          discount:
            discountElement &&
            discountElement.innerText.replace("-", "").replace("%", "").trim(),
          specialOffer: specialOffer && specialOffer.innerText.trim(),
          image: imageUrl,
          unit: unit,
        };
      });
    });

    return products;
  } catch (error) {
    console.log("Scraping failed", error);
    return null;
  } finally {
    await browser?.close();
    // await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
  }
}
export async function scrapeProductsByName(productName) {
  try {
    browser = await puppeteer.launch({
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(2 * 60 * 1000);
    //go to the website page
    await page.goto(`https://winmart.vn/`, {
      waitUntil: "domcontentloaded",
    });

    const selector = ".search-boxstyle__StyledInput-sc-1p7r5j6-1";
    await page.waitForSelector(selector);
    await page.click(selector);
    //go to page box
    await page.type(".search-boxstyle__StyledInput-sc-1p7r5j6-1", productName);
    await page.keyboard.press("Enter");

    //auto scroll to load products
    await autoScroll(page);
    //actual scraping products
    const products = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".product-card")).map(
        (product) => {
          const titleElement = product.querySelector(
            "div.product-card-two__Title-sc-1lvbgq2-6",
          );
          const linkElement = product.querySelector("a");
          const priceElement = product.querySelector(
            ".product-card-two__Price-sc-1lvbgq2-9",
          );
          const discountElement = product.querySelector(
            ".product-card-two__Discount-sc-1lvbgq2-4.csmOzF",
          );
          const imageElements = product.querySelectorAll("img");

          let imageUrl = null;

          imageElements.forEach((img) => {
            if (img.src.startsWith("http")) {
              imageUrl = img.src;
            }
          });
          const unitDivs = Array.from(product.querySelectorAll("div"));
          let unit = null;
          unit = unitDivs
            .filter((div) => div.innerText.includes("ĐVT: "))
            .map((div) => div.innerText.trim().replace("ĐVT: ", "").trim())
            .pop();
          return {
            name: titleElement ? titleElement.innerText : null,
            href: linkElement ? linkElement.href : null,
            price: priceElement ? priceElement.innerText.trim() : null,
            discount:
              discountElement &&
              discountElement.innerText
                .replace("-", "")
                .replace("%", "")
                .trim(),
            image: imageUrl,
            unit: unit,
          };
        },
      );
    });
    return products;
  } catch (error) {
    console.log("Scraping failed", error);
    return null;
  } finally {
    await browser?.close();
  }
}
export async function scrapeSingleProduct(productURL) {
  try {
    browser = await puppeteer.launch({
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(2 * 60 * 1000);
    await page.goto(`${productURL}`, {
      waitUntil: "domcontentloaded",
    });

    const selector = ".product-detailsstyle__ProductInfo-sc-127s7qc-4.kxyanY";
    const el = await page.waitForSelector(selector);

    const productDetails = await el.evaluate(() => {
      const name =
        document
          .querySelector("h1.product-detailsstyle__ProductTitle-sc-127s7qc-8")
          ?.innerText.trim() || null;
      const price =
        document
          .querySelector(".product-detailsstyle__ProductPrice-sc-127s7qc-22")
          ?.innerText.trim() || null;
      const transportOffer =
        document
          .querySelector(
            ".product-detailsstyle__ProductFlex-sc-127s7qc-11.dOBwmc.boder-bottom-product .fs-12",
          )
          ?.innerText.trim()
          .replace(/\n/g, " ") || null;
      const available =
        document
          .querySelector(
            ".product-detailsstyle__ProductFlex-sc-127s7qc-11 .fs-14",
          )
          ?.innerText.trim() || null;
      const specialOffer =
        document
          .querySelector(".product-detailsstyle__Zb01Text-sc-127s7qc-43")
          ?.innerText.trim() || null;
      let detailsNodes = document.querySelectorAll(
        ".product-detailsstyle__ProductInfoDetail-sc-127s7qc-15 p",
      );
      if (detailsNodes.length === 0 || detailsNodes.length === 1) {
        detailsNodes = document.querySelectorAll(
          ".product-detailsstyle__ProductInfoDetail-sc-127s7qc-15 li",
        );
      }
      const detailsArray = Array.from(detailsNodes);
      const description = detailsArray
        .map((p) => p.innerText)
        .filter((text) => text.trim() !== "");
      return {
        name,
        price,
        transportOffer,
        available,
        specialOffer,
        description,
        discount: !!document.querySelector("line-throught"),
      };
    });

    return productDetails;
  } catch (error) {
    console.error(error);
  } finally {
    await browser?.close();
  }
}
//.bg-product-white > div.product-detailsstyle__ProductInfoDetail-sc-127s7qc-15

//Check detection of the scraping script
const testBot = async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto("https://bot.sannysoft.com/", {
      waitUntil: "domcontentloaded",
    });
    await page.screenshot({ path: "example.png" });
    await browser.close();
  } catch (error) {
    console.log(error);
  }
};
