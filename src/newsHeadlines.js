/**
 * News headline system.
 * Each headline has:
 *   headline   — the ticker text
 *   sentiment  — 'positive' | 'negative' | 'neutral'
 *   stockEffects — { companyId: priceMultiplier } (e.g. 0.7 = -30%)
 *   expenseEffect — { multiplier, duration } (multiplier on living costs, duration in months)
 *   happinessEffect — direct happiness change
 *   healthEffect — direct health change
 *   weight — relative probability (default 1)
 */

const HEADLINES = [
  // ═══ NEGATIVE — Economy / Energy ═══
  {
    headline: 'OIL CRISIS IN THE MIDDLE EAST — Gas prices skyrocket nationwide',
    sentiment: 'negative',
    stockEffects: { glopet: 0.70 },
    expenseEffect: { multiplier: 1.20, duration: 12 },
    happinessEffect: -5,
  },
  {
    headline: 'FEDERAL RESERVE HIKES INTEREST RATES TO 15% — Recession fears mount',
    sentiment: 'negative',
    stockEffects: { comcom: 0.85, aerodyn: 0.85, neonola: 0.90 },
    expenseEffect: { multiplier: 1.10, duration: 6 },
    happinessEffect: -3,
  },
  {
    headline: 'WALL STREET PANIC — Black Monday sends markets tumbling',
    sentiment: 'negative',
    stockEffects: { comcom: 0.75, vhsmax: 0.80, aerodyn: 0.75, neonola: 0.85, synwav: 0.80, glopet: 0.80 },
    happinessEffect: -8,
    weight: 0.5,
  },
  {
    headline: 'AIRLINE DISASTER — Major crash grounds Aero-Dynamics fleet',
    sentiment: 'negative',
    stockEffects: { aerodyn: 0.60 },
    happinessEffect: -4,
  },
  {
    headline: 'VHS FORMAT WAR HEATS UP — Betamax loyalists flood market with cheap tapes',
    sentiment: 'negative',
    stockEffects: { vhsmax: 0.75 },
  },
  {
    headline: 'CONTAMINATION SCARE — Neon-Cola recalls millions of bottles',
    sentiment: 'negative',
    stockEffects: { neonola: 0.65 },
    healthEffect: -5,
  },
  {
    headline: 'PIRACY EPIDEMIC — Record labels report massive losses',
    sentiment: 'negative',
    stockEffects: { synwav: 0.70 },
  },
  {
    headline: 'OIL SPILL IN THE GULF — Global Petro faces billions in cleanup costs',
    sentiment: 'negative',
    stockEffects: { glopet: 0.65 },
    happinessEffect: -3,
  },
  {
    headline: 'INFLATION HITS 12% — Cost of living soars across America',
    sentiment: 'negative',
    expenseEffect: { multiplier: 1.15, duration: 8 },
    happinessEffect: -4,
  },
  {
    headline: 'COMPUTER CHIP SHORTAGE — Tech sector stalls',
    sentiment: 'negative',
    stockEffects: { comcom: 0.78 },
  },

  // ═══ POSITIVE — Economy / Innovation ═══
  {
    headline: 'REAGAN SIGNS MASSIVE TAX CUT — Markets soar on supply-side optimism',
    sentiment: 'positive',
    stockEffects: { comcom: 1.20, aerodyn: 1.15, neonola: 1.10, glopet: 1.10 },
    expenseEffect: { multiplier: 0.90, duration: 6 },
    happinessEffect: 5,
  },
  {
    headline: 'PERSONAL COMPUTER REVOLUTION — Home computing sales explode',
    sentiment: 'positive',
    stockEffects: { comcom: 1.40 },
    happinessEffect: 5,
  },
  {
    headline: 'VHS WINS THE FORMAT WAR — VHS-Max dominates home video',
    sentiment: 'positive',
    stockEffects: { vhsmax: 1.35 },
    happinessEffect: 3,
  },
  {
    headline: 'NASA SPACE SHUTTLE SUCCESS — Aero-Dynamics lands defense contracts',
    sentiment: 'positive',
    stockEffects: { aerodyn: 1.30 },
    happinessEffect: 8,
  },
  {
    headline: 'NEON-COLA LAUNCHES "NEW NEON" — Massive ad campaign drives sales',
    sentiment: 'positive',
    stockEffects: { neonola: 1.30 },
    happinessEffect: 3,
  },
  {
    headline: 'MTV LAUNCHES — Music industry booms! SynthWave Records signs mega deals',
    sentiment: 'positive',
    stockEffects: { synwav: 1.40, vhsmax: 1.10 },
    happinessEffect: 10,
  },
  {
    headline: 'OIL PRICES PLUNGE — OPEC fails to control supply',
    sentiment: 'positive',
    stockEffects: { glopet: 1.25, aerodyn: 1.10 },
    expenseEffect: { multiplier: 0.85, duration: 6 },
    happinessEffect: 4,
  },
  {
    headline: 'BULL MARKET RALLY — Dow hits all-time highs',
    sentiment: 'positive',
    stockEffects: { comcom: 1.15, vhsmax: 1.12, aerodyn: 1.18, neonola: 1.10, synwav: 1.12, glopet: 1.15 },
    happinessEffect: 6,
    weight: 0.5,
  },
  {
    headline: 'BABY BOOM DRIVES CONSUMER SPENDING — Retailers rejoice',
    sentiment: 'positive',
    stockEffects: { neonola: 1.20, vhsmax: 1.15 },
    happinessEffect: 3,
  },
  {
    headline: 'GOVERNMENT ANNOUNCES INFRASTRUCTURE STIMULUS — Jobs boom expected',
    sentiment: 'positive',
    expenseEffect: { multiplier: 0.92, duration: 4 },
    happinessEffect: 5,
    healthEffect: 3,
  },

  // ═══ NEUTRAL — Interesting but minor impact ═══
  {
    headline: 'COLD WAR TENSIONS RISE — Defense stocks see mixed activity',
    sentiment: 'neutral',
    stockEffects: { aerodyn: 1.12, neonola: 0.95 },
    happinessEffect: -2,
  },
  {
    headline: 'NEW WAVE MUSIC SWEEPS THE NATION — Synthesizers sell out everywhere',
    sentiment: 'neutral',
    stockEffects: { synwav: 1.15 },
    happinessEffect: 5,
  },
  {
    headline: 'JAPAN ENTERS US AUTO MARKET — American consumers get more choices',
    sentiment: 'neutral',
    expenseEffect: { multiplier: 0.95, duration: 4 },
  },
  {
    headline: 'CABLE TV EXPLOSION — 50 channels and nothing on',
    sentiment: 'neutral',
    stockEffects: { vhsmax: 1.08, synwav: 1.05 },
    happinessEffect: 3,
  },
  {
    headline: 'YUPPIE CULTURE ON THE RISE — "Greed is good" becomes the motto',
    sentiment: 'neutral',
    stockEffects: { neonola: 1.08 },
    happinessEffect: 2,
  },
  {
    headline: 'BREAKDANCING CRAZE HITS MAINSTREAM — Youth culture shifts',
    sentiment: 'neutral',
    stockEffects: { synwav: 1.10 },
    happinessEffect: 6,
  },
  {
    headline: 'CHERNOBYL DISASTER SHOCKS THE WORLD — Energy debate intensifies',
    sentiment: 'neutral',
    stockEffects: { glopet: 1.10, aerodyn: 0.95 },
    happinessEffect: -5,
    healthEffect: -3,
    weight: 0.5,
  },
  {
    headline: 'AEROBICS CRAZE SWEEPS AMERICA — Jane Fonda VHS tapes sell millions',
    sentiment: 'neutral',
    stockEffects: { vhsmax: 1.10 },
    happinessEffect: 4,
    healthEffect: 5,
  },
  {
    headline: 'STABLE QUARTER — Markets trade sideways as investors wait',
    sentiment: 'neutral',
    weight: 2,
  },
  {
    headline: 'HOLIDAY SHOPPING SEASON BREAKS RECORDS — Retail booms',
    sentiment: 'positive',
    stockEffects: { neonola: 1.12, vhsmax: 1.08, synwav: 1.05 },
    happinessEffect: 4,
  },
];

// Track recent headlines to avoid repeats
let recentHeadlineIdxs = [];

/**
 * Roll a random headline. Weighted selection, avoids recent repeats.
 * Returns { headline, sentiment, stockEffects, expenseEffect, happinessEffect, healthEffect }
 */
export function rollHeadline() {
  // Build weighted pool excluding recent headlines
  const pool = [];
  HEADLINES.forEach((h, idx) => {
    if (recentHeadlineIdxs.includes(idx)) return;
    const w = h.weight || 1;
    for (let i = 0; i < w * 10; i++) pool.push(idx);
  });

  // If pool is empty (all used recently), reset
  if (pool.length === 0) {
    recentHeadlineIdxs = [];
    return rollHeadline();
  }

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  recentHeadlineIdxs.push(chosen);
  if (recentHeadlineIdxs.length > 8) recentHeadlineIdxs.shift();

  const h = HEADLINES[chosen];
  return {
    headline: h.headline,
    sentiment: h.sentiment,
    stockEffects: h.stockEffects || {},
    expenseEffect: h.expenseEffect || null,
    happinessEffect: h.happinessEffect || 0,
    healthEffect: h.healthEffect || 0,
  };
}

export function resetHeadlineHistory() {
  recentHeadlineIdxs = [];
}
