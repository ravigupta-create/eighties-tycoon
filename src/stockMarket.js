export const COMPANIES = [
  { id: 'neonola', name: 'Neon-Cola',            ticker: 'NCLA', sector: 'Consumer Goods',  basePrice: 8,  repRequired: 0  },
  { id: 'synwav',  name: 'SynthWave Records',    ticker: 'SYNW', sector: 'Music',           basePrice: 12, repRequired: 0  },
  { id: 'comcom',  name: 'Commodore Computing', ticker: 'CMDC', sector: 'Tech',           basePrice: 24, repRequired: 0  },
  { id: 'glopet',  name: 'Global Petro',         ticker: 'GPET', sector: 'Energy',          basePrice: 35, repRequired: 10 },
  { id: 'vhsmax',  name: 'VHS-Max',             ticker: 'VHSM', sector: 'Entertainment',  basePrice: 15, repRequired: 25 },
  { id: 'aerodyn', name: 'Aero-Dynamics',        ticker: 'AERO', sector: 'Aerospace',      basePrice: 42, repRequired: 50 },
];

export function initStocks() {
  const stocks = {};
  for (const co of COMPANIES) {
    stocks[co.id] = {
      price: co.basePrice,
      history: [co.basePrice],
      trend: 0,
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

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Simulate one month of price movement for every stock.
 * newsStockEffects: optional { companyId: multiplier } from news headlines
 * Returns { stocks, events }
 */
export function tickStocks(stocks, newsStockEffects = {}) {
  const next = {};
  const events = [];

  for (const co of COMPANIES) {
    const prev = stocks[co.id];
    let price = prev.price;

    // Apply news headline effect FIRST (direct price shock)
    if (newsStockEffects[co.id]) {
      const newsMult = newsStockEffects[co.id];
      price = Math.max(1, +(price * newsMult).toFixed(2));
      const pctChange = Math.round((newsMult - 1) * 100);
      if (pctChange < -10) {
        events.push({ type: 'danger', text: `NEWS IMPACT: ${co.ticker} drops ${Math.abs(pctChange)}%!` });
      } else if (pctChange > 10) {
        events.push({ type: 'success', text: `NEWS IMPACT: ${co.ticker} jumps +${pctChange}%!` });
      }
    }

    let trend = prev.trend;
    if (Math.random() < 0.25) {
      trend = Math.floor(Math.random() * 3) - 1;
    }

    const volatility = randomBetween(-0.15, 0.15);
    const trendBias = trend * randomBetween(0.02, 0.08);

    let shock = 0;
    let shockType = null;
    if (Math.random() < 0.08) {
      const direction = Math.random() < 0.5 ? 1 : -1;
      shock = direction * randomBetween(0.20, 0.40);
      shockType = direction > 0 ? 'boom' : 'crash';
    }

    const reversion = (co.basePrice - price) / co.basePrice * 0.05;
    const change = volatility + trendBias + shock + reversion;
    const newPrice = Math.max(1, +(price * (1 + change)).toFixed(2));
    const history = [...prev.history, newPrice].slice(-12);

    next[co.id] = { price: newPrice, history, trend };

    if (shockType === 'crash') {
      events.push({ type: 'danger', text: `Market Crash! ${co.ticker} plunges ${Math.abs(Math.round(change * 100))}%!` });
    } else if (shockType === 'boom') {
      events.push({ type: 'success', text: `${co.ticker} surges ${Math.round(change * 100)}%! Bull run!` });
    }
  }

  return { stocks: next, events };
}

export function portfolioValue(portfolio, stocks) {
  let total = 0;
  for (const co of COMPANIES) {
    total += portfolio[co.id] * stocks[co.id].price;
  }
  return +total.toFixed(2);
}
