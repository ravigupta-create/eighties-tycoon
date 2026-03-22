/**
 * Luxury Shop — 80s status symbols.
 * Each item gives a permanent reputation boost and happiness.
 * Higher reputation unlocks better stocks and properties.
 */

export const LUXURY_ITEMS = [
  // ── Tier 1: Starter Flex ──
  {
    id: 'walkman',
    name: 'Sony Walkman',
    description: 'Portable cassette player. Music on the go. Totally tubular.',
    price: 150,
    reputation: 5,
    happiness: 5,
    icon: '♪',
    tier: 1,
  },
  {
    id: 'raybans',
    name: 'Ray-Ban Aviators',
    description: 'The shades that say "I\'ve arrived." Top Gun approved.',
    price: 200,
    reputation: 5,
    happiness: 3,
    icon: '◔',
    tier: 1,
  },
  {
    id: 'membersjacket',
    name: 'Members Only Jacket',
    description: 'The jacket that opens every door in town.',
    price: 350,
    reputation: 8,
    happiness: 5,
    icon: '⬡',
    tier: 1,
  },

  // ── Tier 2: Mid-Level Status ──
  {
    id: 'brickphone',
    name: '"Brick" Cell Phone',
    description: 'Motorola DynaTAC. 2 lbs of pure prestige. "Gordon Gekko called."',
    price: 1200,
    reputation: 15,
    happiness: 8,
    icon: '▯',
    tier: 2,
  },
  {
    id: 'designersuit',
    name: 'Armani Power Suit',
    description: 'Double-breasted, shoulder pads, the works. Boardroom domination.',
    price: 2000,
    reputation: 20,
    happiness: 10,
    icon: '♦',
    tier: 2,
  },
  {
    id: 'rolex',
    name: 'Rolex Submariner',
    description: 'Gold bezel, oyster bracelet. Time is money — literally.',
    price: 3500,
    reputation: 25,
    happiness: 12,
    icon: '⊙',
    tier: 2,
  },

  // ── Tier 3: High Roller ──
  {
    id: 'sportscar',
    name: 'Red Italian Sports Car',
    description: 'Ferrari Testarossa. Miami Vice vibes. 0-60 in 5.2 seconds.',
    price: 15000,
    reputation: 50,
    happiness: 25,
    icon: '◄',
    tier: 3,
  },
  {
    id: 'yacht',
    name: 'Luxury Yacht',
    description: '60-foot cruiser. Dock it at the marina. Ultimate power move.',
    price: 40000,
    reputation: 80,
    happiness: 30,
    icon: '⛵',
    tier: 3,
  },
];

/**
 * Reputation tier thresholds — what opens up at each level.
 */
export const REPUTATION_TIERS = [
  { minRep: 0,   label: 'Nobody',        color: 'phosphor-dim' },
  { minRep: 10,  label: 'Known Face',    color: 'phosphor' },
  { minRep: 25,  label: 'Rising Star',   color: 'amber' },
  { minRep: 50,  label: 'Big Shot',      color: 'amber' },
  { minRep: 100, label: 'Power Player',  color: 'danger' },
  { minRep: 150, label: 'Legend',         color: 'danger' },
];

export function getReputationTier(rep) {
  let tier = REPUTATION_TIERS[0];
  for (const t of REPUTATION_TIERS) {
    if (rep >= t.minRep) tier = t;
  }
  return tier;
}

export function getNextReputationTier(rep) {
  for (const t of REPUTATION_TIERS) {
    if (rep < t.minRep) return t;
  }
  return null; // maxed
}
