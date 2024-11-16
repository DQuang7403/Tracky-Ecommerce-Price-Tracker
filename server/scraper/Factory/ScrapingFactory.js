
class Scraper {
  constructor() {
    if (new.target === Scraper) {
      throw new Error("Cannot instantiate abstract class");
    }
  }
  scrape() {
    throw new Error("Method not implemented");
  }

  setStrategy(strategy) {
    throw new Error("Method not implemented");
  }
}

// Define the concrete scraper classes
class WinmartFactoryScraping extends Scraper {
  strategy = null;
  constructor(strategy) {
    super();
    this.strategy = strategy;
  }

  async scrape() {
    const results = await this.strategy.startScrape("winmart");
    return results
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
}

class BachhoaxanhFactoryScraping extends Scraper {
  strategy = null;
  constructor(strategy) {
    super();
    this.strategy = strategy;
  }

  async scrape() {
    const results = await this.strategy.startScrape("bachhoaxanh");
    return results
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
}

// Define the factory class
export default class ScraperFactory {
  createScraper(website) {
    switch (website) {
      case "winmart":
        return new WinmartFactoryScraping();
      case "bachhoaxanh":
        return new BachhoaxanhFactoryScraping();
      default:
        throw new Error("Invalid website");
    }
  }
}

