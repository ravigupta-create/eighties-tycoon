export const COMPANIES = [
  { id: 'comcom',  name: 'Commodore Computing', ticker: 'CMDC', sector: 'Tech',           basePrice: 24 },
  { id: 'vhsmax',  name: 'VHS-Max',             ticker: 'VHSM', sector: 'Entertainment',  basePrice: 15 },
  { id: 'aerodyn', name: 'Aero-Dynamics',        ticker: 'AERO', sector: 'Aerospace',      basePrice: 42 },
  { id: 'neonola', name: 'Neon-Cola',            ticker: 'NCLA', sector: 'Consumer Goods',  basePrice: 8  },
  { id: 'synwav',  name: 'SynthWave Records',    ticker: 'SYNW', sector: 'Music',           basePrice: 12 },
];

export function initStocks() {
  const stocks = {};
  for (const co of COMPANIES) {
    stocks[co.id] = {
      price: co.basePrice,
      history: [co.basePrice],
      trend: 0,       // -1 bear, 0 neutral, +1 bull — shifts randomly
    };
  }
  return stocks;
}

export function initPortfolio() {
  const portfolio = {};
  for (const co of COMPANIES) {
    portfolio[co.id] = 0;
  }
  return portfolio;
}

// Seeded-ish randomness so results feel organic but are deterministic per call
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Simulate one month of price movement for every stock.
 * Returns new stocks object (immutable update).
 */
export function tickStocks(stocks) {
  const next = {};

  for (const co of COMPANIES) {
    const prev = stocks[co.id];
    const price = prev.price;

    // Possibly shift trend
    let trend = prev.trend;
    if (Math.random() < 0.25) {
      trend = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
    }

    // Base volatility: ±15 %
    const volatility = randomBetween(-0.15, 0.15);

    // Trend bias: adds up to ±8 %
    const trendBias = trend * randomBetween(0.02, 0.08);

    // Rare event: 8 % chance of a ±20-40 % shock
    let shock = 0;
    if (Math.random() < 0.08) {
      shock = (Math.random() < 0.5 ? 1 : -1) * randomBetween(0.20, 0.40);
    }

    // Mean reversion: gentle pull toward base price
    const reversion = (co.basePrice - price) / co.basePrice * 0.05;

    const change = volatility + trendBias + shock + reversion;
    const newPrice = Math.max(1, +(price * (1 + change)).toFixed(2));

    const history = [...prev.history, newPrice].slice(-12); // keep last 12 months

    next[co.id] = { price: newPrice, history, trend };
  }

  return next;
}

/**
 * Calculate total portfolio value at current prices.
 */
export function portfolioValue(portfolio, stocks) {
  let total = 0;
  for (const co of COMPANIES) {
    total += portfolio[co.id] * stocks[co.id].price;
  }
  return +total.toFixed(2);
}
