/**
 * Side businesses — passive income with stress costs.
 * Each business is a one-time purchase that generates monthly revenue.
 */

export const BUSINESSES = [
  {
    id: 'lemonade',
    name: 'Lemonade Stand',
    description: 'Corner stand near the park. Steady foot traffic.',
    price: 200,
    monthlyIncome: 30,
    stressCost: 0,
    repRequired: 0,
    icon: '🍋',
  },
  {
    id: 'arcade',
    name: 'Arcade Cabinet Route',
    description: 'Place machines in bars and laundromats. Quarters add up.',
    price: 800,
    monthlyIncome: 80,
    stressCost: 1,
    repRequired: 0,
    icon: '🕹',
  },
  {
    id: 'vhsrental',
    name: 'VHS Rental Store',
    description: '"Be Kind, Rewind." Late fees are where the real money is.',
    price: 2500,
    monthlyIncome: 200,
    stressCost: 2,
    repRequired: 15,
    icon: '📼',
  },
  {
    id: 'nightclub',
    name: 'Nightclub',
    description: 'Neon lights, synth music, velvet ropes. Cover charge $10.',
    price: 10000,
    monthlyIncome: 600,
    stressCost: 4,
    repRequired: 50,
    icon: '🪩',
  },
];

export function totalBusinessIncome(ownedIds) {
  let total = 0;
  for (const id of ownedIds) {
    const biz = BUSINESSES.find(b => b.id === id);
    if (biz) total += biz.monthlyIncome;
  }
  return total;
}

export function totalBusinessStress(ownedIds) {
  let total = 0;
  for (const id of ownedIds) {
    const biz = BUSINESSES.find(b => b.id === id);
    if (biz) total += biz.stressCost;
  }
  return total;
}
