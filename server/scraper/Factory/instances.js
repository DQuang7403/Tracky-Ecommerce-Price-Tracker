import ScraperFactory from "./ScrapingFactory.js";

const factory = new ScraperFactory();
let WinmartScraperInstance = null
let BachhoaxanhScraperInstance = null

function getWinmartScraper() {
  if(!WinmartScraperInstance) {
    WinmartScraperInstance = factory.createScraper("winmart");
  }
  return WinmartScraperInstance;
}
function getBachhoaxanhScraper() {
  if(!BachhoaxanhScraperInstance) {
    BachhoaxanhScraperInstance = factory.createScraper("bachhoaxanh");
  }
  return BachhoaxanhScraperInstance;
}



export { getWinmartScraper, getBachhoaxanhScraper };
