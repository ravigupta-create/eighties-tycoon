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
      { label: 'Go for it ($500, coin flip)', effects: { gamble: 500 }, logText: '' },
      { label: 'Walk away (+5 Happiness)', effects: { happiness: 5 }, logText: 'Walked away from a scam. Smart.' },
    ],
    condition: (state) => state.cash >= 500,
  },

  // ── Career Events ──
  {
    prompt: 'Your boss offers to mentor you over weekends. Extra work but faster promotion.',
    choices: [
      { label: 'Accept (-8 HP, +15 Happiness)', effects: { health: -8, happiness: 15 }, logText: 'Mentorship accepted. Learning a lot!' },
      { label: 'Too busy', effects: {}, logText: 'Turned down the mentorship.' },
    ],
  },
  {
    prompt: 'Office politics! A coworker is trying to undermine you.',
    choices: [
      { label: 'Confront them (-5 Happiness)', effects: { happiness: -5 }, logText: 'Confronted a backstabbing coworker.' },
      { label: 'Take the high road (+3 Happiness)', effects: { happiness: 3 }, logText: 'Rose above the office drama.' },
    ],
  },
  {
    prompt: 'The company is offering overtime this month. Double pay but brutal hours.',
    choices: [
      { label: 'Take it (+$150, -12 HP)', effects: { cash: 150, health: -12 }, logText: 'Worked overtime. Exhausted but richer.' },
      { label: 'Pass', effects: {}, logText: 'Skipped overtime. Work-life balance.' },
    ],
  },

  // ── High Net Worth ──
  {
    prompt: 'A magazine wants to interview you about your success story. $500 appearance fee.',
    choices: [
      { label: 'Do the interview (+$500, +10 Happiness)', effects: { cash: 500, happiness: 10 }, logText: 'Featured in Success Magazine!' },
      { label: 'Stay low-key', effects: {}, logText: 'Declined the interview.' },
    ],
    condition: (state) => (state.reputation || 0) >= 25,
  },
  {
    prompt: 'Charity gala invitation. $300 entry but great networking.',
    choices: [
      { label: 'Attend (-$300, +8 Happiness)', effects: { cash: -300, happiness: 8 }, logText: 'Attended the charity gala. Met interesting people.' },
      { label: 'Skip it', effects: { happiness: -2 }, logText: 'Skipped the gala.' },
    ],
    condition: (state) => state.cash >= 300,
  },
  {
    prompt: 'A hostile investor wants to buy your shares at a premium. Sell everything for 20% above market?',
    choices: [
      { label: 'Intriguing... but no', effects: { happiness: 3 }, logText: 'Held firm against a hostile buyer.' },
      { label: 'No way', effects: {}, logText: 'Rejected the hostile offer.' },
    ],
    condition: (state) => Object.values(state.portfolio || {}).reduce((s, n) => s + n, 0) > 20,
  },

  // ── Property Events ──
  {
    prompt: 'Your tenant flooded the bathroom. Repair costs $100.',
    choices: [
      { label: 'Pay for repairs (-$100)', effects: { cash: -100 }, logText: 'Fixed the flood damage.' },
      { label: 'Ignore it (-8 Happiness)', effects: { happiness: -8 }, logText: 'Ignored the tenant problem. Guilt.' },
    ],
    condition: (state) => (state.properties?.length || 0) >= 1,
  },
  {
    prompt: 'A neighbor complains about noise from your property. Soundproofing costs $200.',
    choices: [
      { label: 'Soundproof it (-$200, +5 Happiness)', effects: { cash: -200, happiness: 5 }, logText: 'Soundproofed the property. Peace restored.' },
      { label: 'Tell them to deal with it (-5 Happiness)', effects: { happiness: -5 }, logText: 'Ignored the noise complaint.' },
    ],
    condition: (state) => (state.properties?.length || 0) >= 1,
  },

  // ── Decade Events ──
  {
    prompt: 'The 80s are in full swing! Neon everywhere. A roller skating party tonight!',
    choices: [
      { label: 'Roller party! (-$40, +15 Happiness, -3 HP)', effects: { cash: -40, happiness: 15, health: -3 }, logText: 'Roller skating party was RADICAL!' },
      { label: 'Not my scene', effects: {}, logText: 'Skipped the roller party.' },
    ],
  },
  {
    prompt: 'A new Atari game just dropped. Everyone at the office is talking about it.',
    choices: [
      { label: 'Buy it (-$60, +8 Happiness)', effects: { cash: -60, happiness: 8 }, logText: 'Bought the new Atari game. High score!' },
      { label: 'Games are for kids', effects: { happiness: -2 }, logText: 'Skipped the Atari game.' },
    ],
  },
  {
    prompt: 'Your Walkman broke! Replace it for $50 or go without music.',
    choices: [
      { label: 'Replace it (-$50, +5 Happiness)', effects: { cash: -50, happiness: 5 }, logText: 'Got a new Walkman. Music is life.' },
      { label: 'Silence is golden', effects: { happiness: -5 }, logText: 'No more Walkman. The silence is deafening.' },
    ],
    condition: (state) => (state.luxuryItems || []).includes('walkman'),
  },
  {
    prompt: 'Someone keyed your sports car! Paint repair is $400.',
    choices: [
      { label: 'Fix it (-$400)', effects: { cash: -400 }, logText: 'Fixed the keyed paint on the Ferrari.' },
      { label: 'Live with it (-10 Happiness)', effects: { happiness: -10 }, logText: 'The scratch on the Ferrari haunts you.' },
    ],
    condition: (state) => (state.luxuryItems || []).includes('sportscar'),
  },

  // ── Business Events ──
  {
    prompt: 'A supplier offers you a bulk deal. Save $100 on business costs this month.',
    choices: [
      { label: 'Take the deal (+$100)', effects: { cash: 100 }, logText: 'Scored a great supplier deal!' },
      { label: 'Seems fishy', effects: {}, logText: 'Passed on the supplier deal.' },
    ],
    condition: (state) => (state.businesses?.length || 0) >= 1,
  },
  {
    prompt: 'Your business got a shoutout on local TV! Expect extra revenue.',
    choices: [
      { label: 'Celebrate! (+$200, +10 Happiness)', effects: { cash: 200, happiness: 10 }, logText: 'Business featured on TV! Revenue boost!' },
      { label: 'Stay humble', effects: { cash: 100 }, logText: 'TV mention brought in some extra cash.' },
    ],
    condition: (state) => (state.businesses?.length || 0) >= 1,
  },

  // ── Health / Lifestyle ──
  {
    prompt: 'Free flu shots at the clinic today.',
    choices: [
      { label: 'Get the shot (+5 HP)', effects: { health: 5 }, logText: 'Got a flu shot. Prevention is key.' },
      { label: 'Needles? No thanks', effects: {}, logText: 'Skipped the flu shot.' },
    ],
  },
  {
    prompt: 'Your friends are doing a weekend hike. Fresh air and exercise.',
    choices: [
      { label: 'Join them (+8 HP, +6 Happiness)', effects: { health: 8, happiness: 6 }, logText: 'Great hike with friends! Feeling refreshed.' },
      { label: 'Too tired', effects: { happiness: -2 }, logText: 'Skipped the hike.' },
    ],
  },
  {
    prompt: 'A local diner has an all-you-can-eat special for $15.',
    choices: [
      { label: 'Eat up! (-$15, +5 Happiness, -2 HP)', effects: { cash: -15, happiness: 5, health: -2 }, logText: 'Stuffed yourself at the diner. No regrets.' },
      { label: 'Pass', effects: {}, logText: 'Skipped the all-you-can-eat.' },
    ],
  },
  {
    prompt: 'A stray cat has been hanging around your door. Adopt it?',
    choices: [
      { label: 'Adopt! (-$30/initial, +10 Happiness)', effects: { cash: -30, happiness: 10 }, logText: 'Adopted a stray cat. Purring companion.' },
      { label: 'Shoo it away', effects: {}, logText: 'Shooed the cat away.' },
    ],
  },
  {
    prompt: 'Insomnia is killing you. Sleeping pills cost $40.',
    choices: [
      { label: 'Buy pills (-$40, +8 HP)', effects: { cash: -40, health: 8 }, logText: 'Finally got some sleep. Feeling rested.' },
      { label: 'Tough it out (-5 HP)', effects: { health: -5 }, logText: 'Another sleepless night.' },
    ],
  },
  {
    prompt: 'A motivational speaker is in town. Tickets $75.',
    choices: [
      { label: 'Go! (-$75, +12 Happiness)', effects: { cash: -75, happiness: 12 }, logText: 'Inspirational speech! Feeling motivated.' },
      { label: 'Self-help is a scam', effects: {}, logText: 'Skipped the motivational speaker.' },
    ],
  },

  // ── Windfalls ──
  {
    prompt: 'You found a $20 bill in your old jacket pocket!',
    choices: [
      { label: 'Score! (+$20)', effects: { cash: 20 }, logText: 'Found $20 in an old jacket!' },
      { label: 'Donate it (+5 Happiness)', effects: { happiness: 5 }, logText: 'Donated the found $20.' },
    ],
  },
  {
    prompt: 'Tax refund! The government owes you $180.',
    choices: [
      { label: 'Save it (+$180)', effects: { cash: 180 }, logText: 'Got a $180 tax refund!' },
      { label: 'Splurge (+$180, -$100, +8 Happiness)', effects: { cash: 80, happiness: 8 }, logText: 'Tax refund! Treated yourself.' },
    ],
  },
  {
    prompt: 'Your old college roommate repaid a forgotten $75 debt!',
    choices: [
      { label: 'Take it (+$75)', effects: { cash: 75 }, logText: 'Old debt repaid! +$75.' },
      { label: 'Tell them to keep it (+8 Happiness)', effects: { happiness: 8 }, logText: 'Forgave the old debt. Good vibes.' },
    ],
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
