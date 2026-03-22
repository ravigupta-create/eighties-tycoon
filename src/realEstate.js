/**
 * Real Estate system.
 * Properties appreciate over time, cost monthly maintenance,
 * and boost monthly happiness.
 */

export const PROPERTIES = [
  {
    id: 'studio',
    name: 'Studio Apartment',
    description: 'Cozy downtown studio. Small but yours.',
    basePrice: 800,
    maintenance: 30,
    happinessBonus: 3,
    appreciationRate: 0.003,  // ~0.3% per month (~3.7% yearly)
    icon: '▪',
  },
  {
    id: 'suburban',
    name: 'Suburban House',
    description: 'White picket fence, two-car garage. The American dream.',
    basePrice: 3500,
    maintenance: 80,
    happinessBonus: 7,
    appreciationRate: 0.005,  // ~0.5% per month (~6.2% yearly)
    icon: '▣',
  },
  {
    id: 'penthouse',
    name: 'Penthouse Suite',
    description: 'Top floor. City views. Pure luxury.',
    basePrice: 12000,
    maintenance: 200,
    happinessBonus: 15,
    appreciationRate: 0.008,  // ~0.8% per month (~10% yearly)
    icon: '▲',
  },
];

/**
 * Initialize empty property holdings.
 * Each owned property: { propertyId, purchasePrice, currentValue, monthsOwned }
 */
export function initProperties() {
  return []; // array of owned property instances
}

/**
 * Tick property values for one month.
 * Each property appreciates with slight randomness.
 * Returns new properties array.
 */
export function tickProperties(ownedProperties) {
  return ownedProperties.map((prop) => {
    const def = PROPERTIES.find(p => p.id === prop.propertyId);
    if (!def) return prop;

    // Appreciation: base rate ± small random variance
    const variance = (Math.random() - 0.4) * 0.004; // slight upward bias
    const rate = def.appreciationRate + variance;
    const newValue = Math.max(
      def.basePrice * 0.5,  // floor at 50% of base price
      +(prop.currentValue * (1 + rate)).toFixed(2)
    );

    return {
      ...prop,
      currentValue: newValue,
      monthsOwned: prop.monthsOwned + 1,
    };
  });
}

/**
 * Calculate total monthly maintenance cost.
 */
export function totalMaintenance(ownedProperties) {
  let total = 0;
  for (const prop of ownedProperties) {
    const def = PROPERTIES.find(p => p.id === prop.propertyId);
    if (def) total += def.maintenance;
  }
  return total;
}

/**
 * Calculate total happiness bonus from properties.
 */
export function totalPropertyHappiness(ownedProperties) {
  let total = 0;
  for (const prop of ownedProperties) {
    const def = PROPERTIES.find(p => p.id === prop.propertyId);
    if (def) total += def.happinessBonus;
  }
  return total;
}

/**
 * Calculate total current value of all properties.
 */
export function totalPropertyValue(ownedProperties) {
  let total = 0;
  for (const prop of ownedProperties) {
    total += prop.currentValue;
  }
  return +total.toFixed(2);
}
