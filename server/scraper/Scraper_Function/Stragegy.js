import {
  scrapeProductsByNameFromWinmart,
  scrapeSaleProductsFromWinmart,
  scrapeSingleProductFromWinmart,
} from "./winmart.js";
import {
  scrapeProductsByNameFromBachHoaXanh,
  scrapeSaleProductsFromBachHoaXanh,
  scrapeSingleProductFromBachHoaXanh,
} from "./bachhoaxanh.js";

//Concrete Strategy From Winmart
export class ScrapeSingleProduct {
  url = null;
  constructor(url) {
    this.url = url;
  }
  async startScrape(website) {
    switch (website) {
      case "winmart":
        return await scrapeSingleProductFromWinmart(this.url);
      case "bachhoaxanh":
        return await scrapeSingleProductFromBachHoaXanh(this.url);
      default:
        throw new Error("Invalid website");
    }
  }
}
//Concrete Strategy From Winmart
export class ScrapeSaleProduct {
  async startScrape(website) {
    switch (website) {
      case "winmart":
        return await scrapeSaleProductsFromWinmart();
      case "bachhoaxanh":
        return await scrapeSaleProductsFromBachHoaXanh();
      default:
        throw new Error("Invalid website");
    }
  }
}
export class ScrapeProductByName {
  name = null;
  constructor(name) {
    this.name = name;
  }
  
  async startScrape(website) {
    switch (website) {
      case "winmart":
        return await scrapeProductsByNameFromWinmart(this.name);
      case "bachhoaxanh":
        return await scrapeProductsByNameFromBachHoaXanh(this.name);
      default:
        throw new Error("Invalid website");
    }
  }
}
