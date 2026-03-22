import { COMPANIES } from './stockMarket'

/**
 * Each event has:
 *   prompt  — the situation description
 *   choices — array of { label, effects: { cash, health, happiness }, logText }
 *   condition(state) — optional, only show if true
 */
const EVENT_POOL = [
  // ── Car / Transport ──
  {
    prompt: 'Your car broke down on the highway. Smoke everywhere.',
    choices: [
      { label: 'Pay $200 for repairs', effects: { cash: -200 }, logText: 'Paid $200 to fix the car.' },
      { label: 'Walk it off (-10% Health)', effects: { health: -10 }, logText: 'Walked home. Exhausting.' },
    ],
  },
  {
    prompt: 'A buddy is selling his old Camaro for $350. Sweet ride.',
    choices: [
      { label: 'Buy it ($350, +15 Happiness)', effects: { cash: -350, happiness: 15 }, logText: 'Bought a rad Camaro!' },
      { label: 'Pass on it', effects: {}, logText: 'Passed on the Camaro.' },
    ],
  },

  // ── Stock Tips ──
  {
    prompt: `A hot tip says ${COMPANIES[1].name} is about to boom. Invest now?`,
    choices: [
      { label: `Buy 5 shares of ${COMPANIES[1].ticker}`, effects: { buyStock: { companyId: COMPANIES[1].id, qty: 5 } }, logText: `Acted on a hot tip — bought 5 ${COMPANIES[1].ticker}.` },
      { label: 'Ignore the tip', effects: {}, logText: 'Ignored a stock tip.' },
    ],
    condition: (state) => state.cash >= state.stocks[COMPANIES[1].id].price * 5,
  },
  {
    prompt: `Insider whispers: ${COMPANIES[0].name} is developing something big.`,
    choices: [
      { label: `Buy 3 shares of ${COMPANIES[0].ticker}`, effects: { buyStock: { companyId: COMPANIES[0].id, qty: 3 } }, logText: `Bought 3 ${COMPANIES[0].ticker} on insider info.` },
      { label: 'Too risky for me', effects: { happiness: 5 }, logText: 'Played it safe. Peace of mind.' },
    ],
    condition: (state) => state.cash >= state.stocks[COMPANIES[0].id].price * 3,
  },

  // ── Birthday / Social ──
  {
    prompt: "It's your birthday! Throw a party?",
    choices: [
      { label: 'Party! ($100, +10 HP, +15 Happiness)', effects: { cash: -100, health: 10, happiness: 15 }, logText: 'Threw an awesome birthday bash!' },
      { label: 'Stay in (save money)', effects: { happiness: -5 }, logText: 'Spent birthday alone. Saved cash.' },
    ],
  },
  {
    prompt: 'Friends invite you to a concert downtown. Tickets are $60.',
    choices: [
      { label: 'Go! ($60, +12 Happiness)', effects: { cash: -60, happiness: 12 }, logText: 'Rocked out at a concert!' },
      { label: 'Skip it (-5 Happiness)', effects: { happiness: -5 }, logText: 'Skipped the concert. FOMO.' },
    ],
  },
  {
    prompt: 'Your old college buddy needs $150. Says he\'ll pay you back.',
    choices: [
      { label: 'Lend it ($150, +8 Happiness)', effects: { cash: -150, happiness: 8 }, logText: 'Lent $150 to a friend. Good karma.' },
      { label: 'Say no (-5 Happiness)', effects: { happiness: -5 }, logText: 'Turned down a friend. Awkward.' },
    ],
  },

  // ── Health ──
  {
    prompt: 'You\'ve been feeling run down. A gym membership costs $80.',
    choices: [
      { label: 'Join the gym ($80, +15 HP)', effects: { cash: -80, health: 15 }, logText: 'Joined the gym. Feeling pumped!' },
      { label: 'Tough it out (-5 HP)', effects: { health: -5 }, logText: 'Skipped the gym. Still tired.' },
    ],
  },
  {
    prompt: 'Food poisoning from a street taco! Doctor visit is $120.',
    choices: [
      { label: 'See the doctor ($120, +10 HP)', effects: { cash: -120, health: 10 }, logText: 'Went to the doctor. Recovering.' },
      { label: 'Ride it out (-15 HP)', effects: { health: -15 }, logText: 'Toughed out food poisoning. Brutal.' },
    ],
  },
  {
    prompt: 'A coworker offers you a "miracle vitamin" for $50.',
    choices: [
      { label: 'Buy it ($50, +5 HP, +5 Happiness)', effects: { cash: -50, health: 5, happiness: 5 }, logText: 'Bought miracle vitamins. Placebo or not, feeling great.' },
      { label: 'Hard pass', effects: {}, logText: 'Declined the miracle vitamins.' },
    ],
  },

  // ── Windfalls / Disasters ──
  {
    prompt: 'You found $100 bill on the sidewalk!',
    choices: [
      { label: 'Keep it (+$100)', effects: { cash: 100 }, logText: 'Found $100 on the ground! Lucky day.' },
      { label: 'Turn it in (+10 Happiness)', effects: { happiness: 10 }, logText: 'Turned in found money. Honest citizen.' },
    ],
  },
  {
    prompt: 'Your apartment got broken into! Lost some valuables.',
    choices: [
      { label: 'Install a lock ($150)', effects: { cash: -150, happiness: 5 }, logText: 'Installed new locks after break-in.' },
      { label: 'Just deal with it (-15 Happiness)', effects: { happiness: -15 }, logText: 'Break-in shook you up. No action taken.' },
    ],
  },
  {
    prompt: 'You won $200 in a local radio contest!',
    choices: [
      { label: 'Pocket the cash (+$200)', effects: { cash: 200 }, logText: 'Won $200 on the radio!' },
      { label: 'Celebrate! ($50, +20 Happiness)', effects: { cash: 150, happiness: 20 }, logText: 'Won $200 on radio and celebrated!' },
    ],
  },
  {
    prompt: 'The IRS wants $250 in back taxes. Pay up or risk audit.',
    choices: [
      { label: 'Pay ($250)', effects: { cash: -250 }, logText: 'Paid $250 in back taxes. Ouch.' },
      { label: 'Risk it (-20 Happiness)', effects: { happiness: -20 }, logText: 'Dodged the IRS. Living in fear.' },
    ],
  },

  // ── Lifestyle ──
  {
    prompt: 'A new arcade opened nearby. All-day pass is $30.',
    choices: [
      { label: 'Arcade day! ($30, +10 Happiness)', effects: { cash: -30, happiness: 10 }, logText: 'Spent the day at the arcade. High score!' },
      { label: 'Nah, save it', effects: {}, logText: 'Skipped the arcade.' },
    ],
  },
  {
    prompt: 'You spot a leather jacket at the mall. $180. Totally rad.',
    choices: [
      { label: 'Buy it ($180, +12 Happiness)', effects: { cash: -180, happiness: 12 }, logText: 'Bought a sick leather jacket!' },
      { label: 'Window shop only', effects: { happiness: -3 }, logText: 'Walked away from the jacket. Sad.' },
    ],
  },
  {
    prompt: 'Your neighbor needs help moving. No pay, but good vibes.',
    choices: [
      { label: 'Help out (-5 HP, +10 Happiness)', effects: { health: -5, happiness: 10 }, logText: 'Helped neighbor move. Good karma earned.' },
      { label: 'Too busy', effects: { happiness: -3 }, logText: 'Turned down the neighbor.' },
    ],
  },
  {
    prompt: 'Local charity raffle. Tickets are $25 each.',
    choices: [
      { label: 'Buy a ticket ($25, +5 Happiness)', effects: { cash: -25, happiness: 5 }, logText: 'Bought a raffle ticket. For a good cause!' },
      { label: 'Not today', effects: {}, logText: 'Skipped the charity raffle.' },
    ],
  },

  // ── Big decisions ──
  {
    prompt: 'A shady guy offers you a "guaranteed" investment scheme. $500 in, double or nothing.',
    choices: [
      { label: 'Go for it ($500, coin flip)', effects: { gamble: 500 }, logText: '' }, // logText set dynamically
      { label: 'Walk away (+5 Happiness)', effects: { happiness: 5 }, logText: 'Walked away from a scam. Smart.' },
    ],
    condition: (state) => state.cash >= 500,
  },
];

/**
 * Pick a random event that the player can actually encounter.
 */
export function rollRandomEvent(state) {
  const eligible = EVENT_POOL.filter(e => !e.condition || e.condition(state));
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}
