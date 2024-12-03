import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
export function extractBodyContent(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const bodyContent = $("body").html();
  return bodyContent ? bodyContent : "";
}
let browser;
// Function to clean body content
export function cleanBodyContent(bodyContent) {
  const $ = cheerio.load(bodyContent);

  $("script, style, noscript").remove();

  // Get the text content and clean it up
  let cleanedContent = $.text();
  cleanedContent = cleanedContent
    .split("\n")
    .map((line) => line.trim()) // Trim each line
    .filter((line) => line.length > 0) // Remove empty lines
    .join("-");
  return cleanedContent;
}

export function splitDomContent(domContent, maxLength = 6000) {
  let result = [];
  for (let i = 0; i < domContent.length; i += maxLength) {
    result.push(domContent.substring(i, i + maxLength));
  }
  return result;
}

export async function scrapeContent(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Set to true if you want to run it headless
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    // Increase the navigation timeout
    page.setDefaultNavigationTimeout(3 * 60 * 1000);

    await page.goto(url, {
      waitUntil: "networkidle0",
    });

    const htmlContent = await page.content(); // Get the HTML content of the page

    // Process the content using your utility functions
    const bodyContent = extractBodyContent(htmlContent);
    const cleanedContent = cleanBodyContent(bodyContent);
    const chunks = splitDomContent(cleanedContent);

    // Return the processed chunks
    return chunks;
  } catch (error) {
    console.error("Error occurred while scraping:", error);
    return null; // Return null in case of an error
  } finally {
    if (browser) {
      await browser.close(); // Close the browser after scraping
    }
  }
}
