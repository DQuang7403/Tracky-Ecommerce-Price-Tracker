import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
import proxyChain from "proxy-chain";
import {
  extractBodyContent,
  cleanBodyContent,
  splitDomContent,
} from "../preprocessor.js";
puppeteer.use(StealthPlugin());

let browser;
// const username = process.env.WEBSHARE_USERNAME;
// const password = process.env.WEBSHARE_PASSWORD;
// args: [`--proxy-server=${newProxyUrl}`],

async function autoScroll(page) {
  await page.evaluate(async () => {
    const limit = 1000;
    let totalHeight = 0;
    const distance = 200;
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

export async function scrapeSaleProductsFromBachHoaXanh() {
  try {
    // const oldProxyUrl = `http://${username}:${password}@p.webshare.io:80`;
    // const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
    browser = await puppeteer.launch({
      headless: true,
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(3 * 60 * 1000);

    //go to the website page
    await page.goto(`https://www.bachhoaxanh.com/`, {
      waitUntil: "networkidle2",
    });

    const selector = ".content-stretch";
    await page.waitForSelector(selector, { timeout: 3 * 60 * 1000 });

    const el = await page.$(selector);
    await autoScroll(page);

    const products = await el.evaluate(() => {
      return Array.from(document.querySelectorAll(".box_product")).map(
        (product) => {
          const titleElement = product.querySelector(".product_name");
          const linkElement = product.querySelector("a");
          const priceElement = product.querySelector(".product_price");
          const discountElement = product.querySelector(
            "div.absolute.right-6px.top-4px.rounded-4px > span",
          );
          const image = product.querySelectorAll("img");

          const specialOffer = product.querySelector(
            "div.line-clamp-1.text-10",
          );
          const priceAndUnit = priceElement.innerText;
          const priceMatch = priceAndUnit.match(/(\d+(?:\.\d+)?)/);
          const price = (ice = Math.round(parseFloat(priceMatch[1]) * 1000)); // convert to integer, removing decimal point
          const unitMatch = priceAndUnit.match(/\/([0-9]+(?:[a-zA-Z]+)?)/);
          const unit = unitMatch && unitMatch[1];

          return {
            name: titleElement ? titleElement.innerText : null,
            href: linkElement ? linkElement.href : null,
            price: price,

            discount: Number(
              discountElement &&
                discountElement.innerText
                  .replace("-", "")
                  .replace("%", "")
                  .trim(),
            ),
            specialOffer: specialOffer && specialOffer.innerText.trim(),
            image: image && image[0].src,
            unit: unit,
            site: "bachhoaxanh",
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
    // await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
  }
}
export async function scrapeProductsByNameFromBachHoaXanh(productName) {
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreDefaultArgs: ["--enable-automation"],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(2 * 60 * 1000);

    // Go to the website page
    await page.goto(`https://www.bachhoaxanh.com/`, {
      waitUntil: "networkidle2",
    });

    const selector = "div#input_open_search";
    // await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);

    // Type in the search box
    await page.type("input#txt_search_product", productName);
    await page.keyboard.press("Enter");

    // Auto scroll to load products
    await autoScroll(page);

    // Actual scraping products
    const products = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".box_product")).map(
        (product) => {
          const titleElement = product.querySelector(".product_name");
          const linkElement = product.querySelector("a");
          const priceElement = product.querySelector(".product_price");
          const discountElement = product.querySelector("span.ml-3px");
          const image = product.querySelector("img");
          const specialOffer = product.querySelector(
            "div.line-clamp-1.text-10",
          );

          // Price parsing with error handling
          const priceText = priceElement ? priceElement.innerText : null;
          const price = priceText ? parseInt(priceText.replace(".", "")) : null;

          return {
            name: titleElement ? titleElement.innerText : null,
            href: linkElement ? linkElement.href : null,
            price: price,
            discount: discountElement
              ? Number(discountElement.innerText.replace(/[-%]/g, "").trim()) // Remove "-" and "%" symbols
              : null,
            specialOffer: specialOffer ? specialOffer.innerText.trim() : null,
            image: image ? image.src : null,
            site: "bachhoaxanh",
          };
        },
      );
    });
    return products;
  } catch (error) {
    console.log("Scraping failed", error);
    return [];
  } finally {
    await browser.close();
  }
}

export async function scrapeSingleProductFromBachHoaXanh(productURL) {
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(2 * 60 * 1000);
    await page.goto(`${productURL}`, {
      waitUntil: "networkidle2",
    });

    const htmlContent = await page.content(); // Get the HTML of the page

    // Process the content
    const bodyContent = extractBodyContent(htmlContent);
    const cleanedContent = cleanBodyContent(bodyContent);
    const chunks = splitDomContent(cleanedContent);

    await autoScroll(page);

    const selector = "div.relative.mb-5";
    const el = await page.waitForSelector(selector, { timeout: 2 * 60 * 1000 });
    await autoScroll(page);

    const productDetails = await el.evaluate(() => {
      const name = document.querySelector("div>h1")?.innerText.trim() || null;
      let price, unit;
      const PRODUCT_PRICE_SELECTOR = [
        "div.flex > div.text-17",
        "div.mb-2.flex.items-center > div.text-20.font-bold.text-red-price",
        "div.min-h-36px > div.text-center.text-12.font-bold",
      ];
      for (const selector of PRODUCT_PRICE_SELECTOR) {
        const priceElement = document.querySelector(selector);
        if (!priceElement) continue;
        if (selector === PRODUCT_PRICE_SELECTOR[0]) {
          const priceAndUnit = priceElement.innerText;
          if (priceAndUnit.includes(" / ")) {
            const [priceStr, unitStr] = priceAndUnit.split(" / ");
            price = Math.round(parseFloat(priceStr) * 1000);
            unit = unitStr;
          } else {
            const numericString = priceAndUnit.replace(/[^\d]/g, "");
            price = parseInt(numericString, 10);
            unit = null;
          }
          break;
        } else if (
          selector === PRODUCT_PRICE_SELECTOR[1] ||
          selector === PRODUCT_PRICE_SELECTOR[2]
        ) {
          priceText = priceElement.innerText;
          const numericString = priceText.replace(/[^\d]/g, "");
          price = parseInt(numericString, 10);
          unit = null;
          break;
        } else {
          price = null;
          unit = null;
        }
      }

      const rows = document.querySelectorAll("table > tbody tr"); // Select all table rows
      const description = [];

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length === 2) {
          const key = cells[0].innerText.trim() || null;
          const value = cells[1].innerText.trim() || null;
          description.push(`${key}: ${value}`);
        }
      });
      const discountElement = document.querySelector("div.bg-red-discount");
      const discount =
        Number(discountElement?.innerText.replace(/%|-/g, "")) || null;
      const specialOfferElements = document.querySelector(
        "div.flex > span.text-13",
      );
      const specialOffer = specialOfferElements?.innerText.trim() || null;
      return {
        name,
        price,
        unit,
        description,
        discount,
        specialOffer,
        site: "bachhoaxanh",
      };
    });
    return { productDetails: productDetails, chunks: chunks };
  } catch (error) {
    console.error(error);
  } finally {
    await browser?.close();
  }
}

// scrapeProductsByNameFromBachHoaXanh("mi tom").then((products) => {
//   console.log(products);
// });
