import { initStocks, initPortfolio, tickStocks } from './stockMarket'
import { rollHeadline, resetHeadlineHistory } from './newsHeadlines'
import { initProperties, tickProperties, totalMaintenance, totalPropertyHappiness } from './realEstate'
import { initCareer, getRank, isMaxRank, workHardAmount, workHardHealthCost } from './career'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const LIFESTYLE_TIERS = [
  { id: 'budget',   name: 'Budget',   rent: 50,  food: 30,  misc: 20,  healthDrain: 3 },
  { id: 'standard', name: 'Standard', rent: 120, food: 60,  misc: 40,  healthDrain: 1 },
  { id: 'upscale',  name: 'Upscale',  rent: 300, food: 120, misc: 80,  healthDrain: 0 },
  { id: 'luxury',   name: 'Luxury',   rent: 600, food: 250, misc: 200, healthDrain: -2 },
];

function getTier(tierId) {
  return LIFESTYLE_TIERS.find(t => t.id === tierId) || LIFESTYLE_TIERS[0];
}

function totalExpenses(tier) {
  return tier.rent + tier.food + tier.misc;
}

export const INITIAL_STATE = {
  playerName: '',
  year: 1980,
  month: 0,
  age: 18,
  cash: 500,
  health: 100,
  happiness: 75,
  gameStarted: false,
  gameOver: false,
  gameOverReason: '',
  lifestyleTier: 'budget',
  stocks: initStocks(),
  portfolio: initPortfolio(),
  log: [],
  monthsSinceEvent: 0,
  pendingEvent: null,
  // News system
  currentHeadline: null,    // { headline, sentiment }
  expenseMultiplier: 1.0,   // current multiplier on living costs
  expenseMultiplierExpiry: 0, // months remaining for expense effect
  headlineHistory: [],      // last 5 headlines for display
  // Real estate
  properties: initProperties(),
  // Career
  career: initCareer(),
  // Luxury / Reputation
  reputation: 0,
  luxuryItems: [], // array of item IDs owned
};

let logIdCounter = 0;

function addLog(log, monthName, year, text, type = 'info') {
  return [{ id: ++logIdCounter, monthName, year, text, type }, ...log].slice(0, 200);
}

export function getMonthName(monthIndex) {
  return MONTHS[monthIndex];
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function checkGameOver(state) {
  if (state.health <= 0) {
    return { ...state, gameOver: true, gameOverReason: 'Your health gave out. The 80s were too much for you.' };
  }
  if (state.happiness <= 0) {
    return { ...state, gameOver: true, gameOverReason: 'Crushed by despair. The neon lights faded to black.' };
  }
  return state;
}

export function gameReducer(state, action) {
  if (state.gameOver && action.type !== 'RESET') return state;

  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        playerName: action.name,
        gameStarted: true,
        log: addLog([], MONTHS[0], 1980, `${action.name} begins their journey with $500 in pocket.`, 'success'),
      };

    case 'ADVANCE_MONTH': {
      if (state.pendingEvent) return state;

      const nextMonthIdx = state.month + 1;
      const rollover = nextMonthIdx >= 12;
      const newMonth = rollover ? 0 : nextMonthIdx;
      const newYear = rollover ? state.year + 1 : state.year;
      const monthName = MONTHS[newMonth];

      // Age up in January
      let newAge = state.age;
      if (newMonth === 0 && newYear > 1980) {
        newAge = state.age + 1;
      }

      // ── Roll news headline ──
      const news = rollHeadline();

      // ── Tick stocks with news effects ──
      const { stocks: newStocks, events: marketEvents } = tickStocks(state.stocks, news.stockEffects);

      // ── Expense multiplier management ──
      let expMult = state.expenseMultiplier;
      let expExpiry = state.expenseMultiplierExpiry;

      // Decrement existing effect
      if (expExpiry > 0) {
        expExpiry -= 1;
        if (expExpiry <= 0) {
          expMult = 1.0; // effect expired
          expExpiry = 0;
        }
      }

      // Apply new headline expense effect (overwrites if stronger or new)
      if (news.expenseEffect) {
        expMult = news.expenseEffect.multiplier;
        expExpiry = news.expenseEffect.duration;
      }

      // ── Tick property values ──
      const newProperties = tickProperties(state.properties);
      const propMaintenance = totalMaintenance(newProperties);
      const propHappiness = totalPropertyHappiness(newProperties);

      // ── Deduct living expenses (with multiplier) + property maintenance ──
      const tier = getTier(state.lifestyleTier);
      const baseExpenses = totalExpenses(tier);
      const livingExpenses = Math.round(baseExpenses * expMult);
      const expenses = livingExpenses + propMaintenance;
      const canAfford = state.cash >= expenses;
      const actualExpenses = canAfford ? expenses : state.cash;
      let newCash = +(state.cash - actualExpenses).toFixed(2);

      // ── Career salary ──
      const rank = getRank(state.career.rankIndex);
      newCash = +(newCash + rank.salary).toFixed(2);

      // Health effects from lifestyle + career stress
      let healthDelta = -tier.healthDrain;
      if (!canAfford) healthDelta = -8;
      healthDelta += news.healthEffect;
      healthDelta -= rank.stressDrain; // career stress
      let newHealth = clamp(state.health + healthDelta, 0, 100);

      // Happiness drift
      let happinessDelta = 0;
      if (state.lifestyleTier === 'budget') happinessDelta = -2;
      else if (state.lifestyleTier === 'standard') happinessDelta = 0;
      else if (state.lifestyleTier === 'upscale') happinessDelta = 1;
      else if (state.lifestyleTier === 'luxury') happinessDelta = 3;
      if (!canAfford) happinessDelta -= 5;
      happinessDelta += news.happinessEffect;
      happinessDelta += propHappiness; // property happiness bonus
      let newHappiness = clamp(state.happiness + happinessDelta, 0, 100);

      // ── Build log entries ──
      let newLog = state.log;

      // News headline log
      const newsLogType = news.sentiment === 'positive' ? 'success' : news.sentiment === 'negative' ? 'danger' : 'info';
      newLog = addLog(newLog, monthName, newYear, `NEWS: ${news.headline}`, newsLogType);

      // Expense effect log
      if (news.expenseEffect) {
        const pct = Math.round((news.expenseEffect.multiplier - 1) * 100);
        const dir = pct > 0 ? 'up' : 'down';
        newLog = addLog(newLog, monthName, newYear,
          `Living costs ${dir} ${Math.abs(pct)}% for ${news.expenseEffect.duration} months.`,
          pct > 0 ? 'danger' : 'success');
      }

      // Expense log
      const livingLabel = expMult !== 1.0
        ? `$${livingExpenses} (${expMult > 1 ? '+' : ''}${Math.round((expMult - 1) * 100)}%)`
        : `$${livingExpenses}`;
      const totalLabel = propMaintenance > 0
        ? `${livingLabel} + $${propMaintenance} property`
        : livingLabel;

      if (canAfford) {
        newLog = addLog(newLog, monthName, newYear,
          `You paid ${totalLabel} in expenses (${tier.name}).`, 'info');
      } else {
        newLog = addLog(newLog, monthName, newYear,
          `Can't cover $${expenses} expenses! Paid $${actualExpenses}. Health and mood suffer.`, 'danger');
      }

      // Salary log
      newLog = addLog(newLog, monthName, newYear,
        `Salary: +$${rank.salary} (${rank.name})`, 'success');

      newLog = addLog(newLog, monthName, newYear,
        `Rent: $${tier.rent} | Food: $${tier.food} | Misc: $${tier.misc}${propMaintenance > 0 ? ` | Property: $${propMaintenance}` : ''}`, 'dim');

      for (const evt of marketEvents) {
        newLog = addLog(newLog, monthName, newYear, evt.text, evt.type);
      }

      if (newAge !== state.age) {
        newLog = addLog(newLog, monthName, newYear, `Happy Birthday! You turned ${newAge}.`, 'success');
      }

      if (newHealth <= 20 && newHealth > 0) {
        newLog = addLog(newLog, monthName, newYear, `Health critical at ${newHealth}%! Consider resting.`, 'danger');
      }
      if (newHappiness <= 20 && newHappiness > 0) {
        newLog = addLog(newLog, monthName, newYear, `Happiness dropping (${newHappiness}%). Do something fun!`, 'danger');
      }
      if (newCash <= 0) {
        newLog = addLog(newLog, monthName, newYear, `You're broke! Find work fast.`, 'danger');
      }

      // Random event every 3 months
      const newMonthsSince = state.monthsSinceEvent + 1;
      let pendingEvent = null;
      let monthsSinceEvent = newMonthsSince;
      if (newMonthsSince >= 3) {
        pendingEvent = '__ROLL__';
        monthsSinceEvent = 0;
      }

      // Headline history (keep last 5)
      const headlineHistory = [
        { headline: news.headline, sentiment: news.sentiment, monthName, year: newYear },
        ...state.headlineHistory,
      ].slice(0, 5);

      const next = {
        ...state,
        month: newMonth,
        year: newYear,
        age: newAge,
        cash: newCash,
        health: newHealth,
        happiness: newHappiness,
        stocks: newStocks,
        log: newLog,
        monthsSinceEvent: monthsSinceEvent,
        pendingEvent,
        currentHeadline: { headline: news.headline, sentiment: news.sentiment },
        expenseMultiplier: expMult,
        expenseMultiplierExpiry: expExpiry,
        headlineHistory,
        properties: newProperties,
      };

      return checkGameOver(next);
    }

    case 'SET_PENDING_EVENT':
      return { ...state, pendingEvent: action.event };

    case 'RESOLVE_EVENT': {
      const { choice } = action;
      const monthName = MONTHS[state.month];
      let newCash = state.cash;
      let newHealth = state.health;
      let newHappiness = state.happiness;
      let newPortfolio = { ...state.portfolio };
      let newLog = state.log;

      const fx = choice.effects;

      if (fx.gamble) {
        const won = Math.random() < 0.4;
        if (won) {
          newCash = +(newCash + fx.gamble).toFixed(2);
          newHappiness = clamp(newHappiness + 20, 0, 100);
          newLog = addLog(newLog, monthName, state.year, `Gambled $${fx.gamble} and WON! Doubled your money!`, 'success');
        } else {
          newCash = +(newCash - fx.gamble).toFixed(2);
          newHappiness = clamp(newHappiness - 10, 0, 100);
          newLog = addLog(newLog, monthName, state.year, `Gambled $${fx.gamble} and LOST it all! Scammed!`, 'danger');
        }
      } else {
        if (fx.cash) newCash = +(newCash + fx.cash).toFixed(2);
        if (fx.health) newHealth = clamp(newHealth + fx.health, 0, 100);
        if (fx.happiness) newHappiness = clamp(newHappiness + fx.happiness, 0, 100);

        if (fx.buyStock) {
          const { companyId, qty } = fx.buyStock;
          const cost = +(state.stocks[companyId].price * qty).toFixed(2);
          if (cost <= newCash) {
            newCash = +(newCash - cost).toFixed(2);
            newPortfolio = { ...newPortfolio, [companyId]: newPortfolio[companyId] + qty };
          }
        }

        if (choice.logText) {
          const logType = (fx.happiness && fx.happiness > 0) || (fx.health && fx.health > 0) || (fx.cash && fx.cash > 0)
            ? 'success'
            : (fx.health && fx.health < 0) || (fx.happiness && fx.happiness < 0) || (fx.cash && fx.cash < 0)
              ? 'danger'
              : 'info';
          newLog = addLog(newLog, monthName, state.year, choice.logText, logType);
        }
      }

      newCash = Math.max(0, newCash);

      const next = {
        ...state,
        cash: newCash,
        health: newHealth,
        happiness: newHappiness,
        portfolio: newPortfolio,
        log: newLog,
        pendingEvent: null,
      };

      return checkGameOver(next);
    }

    case 'SET_LIFESTYLE':
      return { ...state, lifestyleTier: action.tierId };

    case 'UPDATE_CASH': {
      const newCash = Math.max(0, +(state.cash + action.amount).toFixed(2));
      const monthName = MONTHS[state.month];
      let newLog = state.log;
      if (action.amount > 0) {
        newLog = addLog(newLog, monthName, state.year, `Earned $${action.amount} from working.`, 'success');
      }
      return { ...state, cash: newCash, log: newLog };
    }

    case 'UPDATE_HEALTH': {
      const newHealth = clamp(state.health + action.amount, 0, 100);
      return checkGameOver({ ...state, health: newHealth });
    }

    case 'UPDATE_HAPPINESS': {
      const newHappiness = clamp(state.happiness + action.amount, 0, 100);
      return checkGameOver({ ...state, happiness: newHappiness });
    }

    case 'BUY_STOCK': {
      const { companyId, qty } = action;
      const price = state.stocks[companyId].price;
      const cost = +(price * qty).toFixed(2);
      if (cost > state.cash) return state;
      return {
        ...state,
        cash: +(state.cash - cost).toFixed(2),
        portfolio: { ...state.portfolio, [companyId]: state.portfolio[companyId] + qty },
      };
    }

    case 'SELL_STOCK': {
      const { companyId, qty } = action;
      const owned = state.portfolio[companyId];
      if (qty > owned) return state;
      const price = state.stocks[companyId].price;
      const revenue = +(price * qty).toFixed(2);
      return {
        ...state,
        cash: +(state.cash + revenue).toFixed(2),
        portfolio: { ...state.portfolio, [companyId]: owned - qty },
      };
    }

    case 'WORK_HARD': {
      const monthName = MONTHS[state.month];
      const currentRank = getRank(state.career.rankIndex);
      const hpCost = workHardHealthCost(state.career.rankIndex);
      const meterGain = workHardAmount(state.career.rankIndex);

      let newHealth = clamp(state.health - hpCost, 0, 100);
      let newMeter = state.career.promotionMeter + meterGain;
      let newRankIdx = state.career.rankIndex;
      let newLog = state.log;

      // Check for promotion
      if (!isMaxRank(newRankIdx) && currentRank.promoThreshold && newMeter >= currentRank.promoThreshold) {
        newRankIdx += 1;
        newMeter = 0;
        const newRank = getRank(newRankIdx);
        newLog = addLog(newLog, monthName, state.year,
          `PROMOTED to ${newRank.name}! Salary: $${newRank.salary}/mo.`, 'success');
      } else {
        newLog = addLog(newLog, monthName, state.year,
          `Worked hard. (-${hpCost}% HP, +${meterGain} promotion progress)`, 'info');
      }

      const next = {
        ...state,
        health: newHealth,
        career: { rankIndex: newRankIdx, promotionMeter: newMeter },
        log: newLog,
      };
      return checkGameOver(next);
    }

    case 'BUY_PROPERTY': {
      const { propertyId, price } = action;
      if (price > state.cash) return state;
      const monthName = MONTHS[state.month];
      const newProp = {
        propertyId,
        purchasePrice: price,
        currentValue: price,
        monthsOwned: 0,
      };
      return {
        ...state,
        cash: +(state.cash - price).toFixed(2),
        properties: [...state.properties, newProp],
        log: addLog(state.log, monthName, state.year, `Bought property for $${price.toLocaleString()}!`, 'success'),
      };
    }

    case 'SELL_PROPERTY': {
      const { index } = action;
      const prop = state.properties[index];
      if (!prop) return state;
      const monthName = MONTHS[state.month];
      const salePrice = prop.currentValue;
      const profit = +(salePrice - prop.purchasePrice).toFixed(2);
      const profitText = profit >= 0
        ? `Sold property for $${salePrice.toLocaleString()} (+$${profit.toLocaleString()} profit)!`
        : `Sold property for $${salePrice.toLocaleString()} (-$${Math.abs(profit).toLocaleString()} loss).`;
      const logType = profit >= 0 ? 'success' : 'danger';
      return {
        ...state,
        cash: +(state.cash + salePrice).toFixed(2),
        properties: state.properties.filter((_, i) => i !== index),
        log: addLog(state.log, monthName, state.year, profitText, logType),
      };
    }

    case 'BUY_LUXURY': {
      const { itemId, price, reputation: repGain, happiness: happGain } = action;
      if (price > state.cash) return state;
      if (state.luxuryItems.includes(itemId)) return state; // already owned
      const monthName = MONTHS[state.month];
      return {
        ...state,
        cash: +(state.cash - price).toFixed(2),
        reputation: state.reputation + repGain,
        happiness: clamp(state.happiness + happGain, 0, 100),
        luxuryItems: [...state.luxuryItems, itemId],
        log: addLog(state.log, monthName, state.year,
          `Bought luxury item! +${repGain} REP, +${happGain} JOY.`, 'success'),
      };
    }

    case 'LOAD_SAVE': {
      const saved = action.state;
      if (saved.log && saved.log.length > 0) {
        logIdCounter = Math.max(...saved.log.map(e => e.id), logIdCounter);
      }
      return { ...saved, pendingEvent: null };
    }

    case 'RESET':
      logIdCounter = 0;
      resetHeadlineHistory();
      return { ...INITIAL_STATE, stocks: initStocks(), portfolio: initPortfolio(), properties: initProperties(), career: initCareer(), log: [] };

    default:
      return state;
  }
}
