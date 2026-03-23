import { portfolioValue } from './stockMarket';
import { totalPropertyValue } from './realEstate';

/**
 * Achievement definitions.
 * check(state) returns true when the achievement is earned.
 */
export const ACHIEVEMENTS = [
  // ── Wealth ──
  { id: 'net1k',     name: 'First Thousand',     desc: 'Reach $1,000 net worth',             icon: '💰', category: 'Wealth',    check: (s) => netWorth(s) >= 1000 },
  { id: 'net10k',    name: 'Five Figures',        desc: 'Reach $10,000 net worth',            icon: '💰', category: 'Wealth',    check: (s) => netWorth(s) >= 10000 },
  { id: 'net50k',    name: 'Halfway There',       desc: 'Reach $50,000 net worth',            icon: '💰', category: 'Wealth',    check: (s) => netWorth(s) >= 50000 },
  { id: 'net100k',   name: 'Six Figures',         desc: 'Reach $100,000 net worth',           icon: '🏆', category: 'Wealth',    check: (s) => netWorth(s) >= 100000 },
  { id: 'net500k',   name: 'Half a Million',      desc: 'Reach $500,000 net worth',           icon: '🏆', category: 'Wealth',    check: (s) => netWorth(s) >= 500000 },
  { id: 'net1m',     name: 'Millionaire',         desc: 'Reach $1,000,000 net worth',         icon: '👑', category: 'Wealth',    check: (s) => netWorth(s) >= 1000000 },

  // ── Career ──
  { id: 'promo1',    name: 'Moving Up',           desc: 'Get your first promotion',           icon: '📈', category: 'Career',    check: (s) => (s.career?.rankIndex || 0) >= 1 },
  { id: 'manager',   name: 'Corner Office',       desc: 'Reach Manager rank',                 icon: '📈', category: 'Career',    check: (s) => (s.career?.rankIndex || 0) >= 3 },
  { id: 'vp',        name: 'Vice President',      desc: 'Reach VP rank',                      icon: '📈', category: 'Career',    check: (s) => (s.career?.rankIndex || 0) >= 5 },
  { id: 'ceo',       name: 'Top of the World',    desc: 'Reach CEO rank',                     icon: '👑', category: 'Career',    check: (s) => (s.career?.rankIndex || 0) >= 6 },

  // ── Real Estate ──
  { id: 'prop1',     name: 'Homeowner',           desc: 'Buy your first property',            icon: '🏠', category: 'Property',  check: (s) => (s.properties?.length || 0) >= 1 },
  { id: 'prop3',     name: 'Real Estate Mogul',   desc: 'Own 3+ properties',                  icon: '🏠', category: 'Property',  check: (s) => (s.properties?.length || 0) >= 3 },
  { id: 'prop5',     name: 'Land Baron',          desc: 'Own 5+ properties',                  icon: '🏠', category: 'Property',  check: (s) => (s.properties?.length || 0) >= 5 },

  // ── Luxury / Reputation ──
  { id: 'lux1',      name: 'Status Symbol',       desc: 'Buy your first luxury item',         icon: '✨', category: 'Luxury',    check: (s) => (s.luxuryItems?.length || 0) >= 1 },
  { id: 'luxall',    name: 'I Have Everything',   desc: 'Own all 8 luxury items',             icon: '👑', category: 'Luxury',    check: (s) => (s.luxuryItems?.length || 0) >= 8 },
  { id: 'rep25',     name: 'Rising Star',         desc: 'Reach 25 reputation',                icon: '⭐', category: 'Luxury',    check: (s) => (s.reputation || 0) >= 25 },
  { id: 'rep100',    name: 'Power Player',        desc: 'Reach 100 reputation',               icon: '⭐', category: 'Luxury',    check: (s) => (s.reputation || 0) >= 100 },
  { id: 'rep150',    name: 'Living Legend',        desc: 'Reach 150 reputation',               icon: '👑', category: 'Luxury',    check: (s) => (s.reputation || 0) >= 150 },

  // ── Survival ──
  { id: 'year1',     name: 'Survivor',            desc: 'Survive 1 year',                     icon: '📅', category: 'Survival',  check: (s) => s.year >= 1981 },
  { id: 'year5',     name: 'Half Decade',         desc: 'Survive 5 years',                    icon: '📅', category: 'Survival',  check: (s) => s.year >= 1985 },
  { id: 'year10',    name: 'Decade Survivor',     desc: 'Reach 1990',                         icon: '📅', category: 'Survival',  check: (s) => s.year >= 1990 },
  { id: 'age30',     name: 'Dirty Thirty',        desc: 'Turn 30 years old',                  icon: '🎂', category: 'Survival',  check: (s) => s.age >= 30 },

  // ── Market ──
  { id: 'stocks10',  name: 'Day Trader',          desc: 'Own 10+ total shares',               icon: '📊', category: 'Market',    check: (s) => totalShares(s) >= 10 },
  { id: 'stocks50',  name: 'Portfolio King',       desc: 'Own 50+ total shares',               icon: '📊', category: 'Market',    check: (s) => totalShares(s) >= 50 },
  { id: 'allstocks', name: 'Diversified',          desc: 'Own shares in all 6 companies',      icon: '📊', category: 'Market',    check: (s) => allCompaniesOwned(s) },

  // ── Businesses ──
  { id: 'biz1',      name: 'Entrepreneur',         desc: 'Start your first side business',     icon: '🏪', category: 'Business',  check: (s) => (s.businesses?.length || 0) >= 1 },
  { id: 'bizall',    name: 'Empire Builder',        desc: 'Own all side businesses',            icon: '🏪', category: 'Business',  check: (s) => (s.businesses?.length || 0) >= 4 },

  // ── Special ──
  { id: 'bounce',    name: 'Comeback Kid',         desc: 'Have <$10 then reach $5,000',        icon: '🔥', category: 'Special',   check: (s) => s.wasBroke && s.cash >= 5000 },
  { id: 'fullhealth',name: 'Peak Condition',       desc: 'Reach 100% health and happiness',    icon: '💪', category: 'Special',   check: (s) => s.health >= 100 && s.happiness >= 100 },
];

function netWorth(s) {
  const stockVal = portfolioValue(s.portfolio || {}, s.stocks || {});
  const propVal = totalPropertyValue(s.properties || []);
  return s.cash + stockVal + propVal;
}

function totalShares(s) {
  if (!s.portfolio) return 0;
  return Object.values(s.portfolio).reduce((sum, n) => sum + n, 0);
}

function allCompaniesOwned(s) {
  if (!s.portfolio) return false;
  return Object.values(s.portfolio).every(n => n > 0);
}

/**
 * Check all achievements against current state.
 * Returns array of newly unlocked achievement IDs.
 */
export function checkAchievements(state) {
  const unlocked = state.achievements || [];
  const newlyUnlocked = [];

  for (const ach of ACHIEVEMENTS) {
    if (unlocked.includes(ach.id)) continue;
    try {
      if (ach.check(state)) newlyUnlocked.push(ach.id);
    } catch { /* skip broken checks */ }
  }

  return newlyUnlocked;
}
