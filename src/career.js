/**
 * Career ladder system.
 * Each rank has a salary, stress drain, and promotion threshold.
 * "Work Hard" fills a promotion meter; when full, player promotes.
 */

export const CAREER_RANKS = [
  { id: 'clerk',       name: 'Junior Clerk',       salary: 60,   stressDrain: 1,  promoThreshold: 100, icon: '◦' },
  { id: 'senior',      name: 'Senior Clerk',       salary: 90,   stressDrain: 2,  promoThreshold: 150, icon: '◦' },
  { id: 'supervisor',  name: 'Supervisor',          salary: 140,  stressDrain: 3,  promoThreshold: 200, icon: '◈' },
  { id: 'manager',     name: 'Manager',             salary: 220,  stressDrain: 4,  promoThreshold: 280, icon: '◈' },
  { id: 'director',    name: 'Director',            salary: 350,  stressDrain: 5,  promoThreshold: 400, icon: '◆' },
  { id: 'vp',          name: 'Vice President',      salary: 550,  stressDrain: 7,  promoThreshold: 550, icon: '◆' },
  { id: 'ceo',         name: 'CEO',                 salary: 900,  stressDrain: 10, promoThreshold: null, icon: '★' }, // no further promo
];

export function initCareer() {
  return {
    rankIndex: 0,
    promotionMeter: 0,
  };
}

export function getRank(rankIndex) {
  return CAREER_RANKS[Math.min(rankIndex, CAREER_RANKS.length - 1)];
}

export function isMaxRank(rankIndex) {
  return rankIndex >= CAREER_RANKS.length - 1;
}

/**
 * How much "Work Hard" fills the meter.
 * Higher ranks require more effort per click, but it's still worthwhile.
 */
export function workHardAmount(rankIndex) {
  // Base 15, decreases slightly at higher ranks (harder to climb)
  return Math.max(8, 15 - rankIndex);
}

/**
 * Health cost of "Work Hard" — scales with rank.
 */
export function workHardHealthCost(rankIndex) {
  return 5 + rankIndex; // 5 at clerk, 11 at CEO
}
