import { initStocks, initPortfolio, tickStocks } from './stockMarket'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const LIFESTYLE_TIERS = [
  { id: 'budget',   name: 'Budget',   rent: 50,  food: 30,  misc: 20,  healthDrain: 3 },
  { id: 'standard', name: 'Standard', rent: 120, food: 60,  misc: 40,  healthDrain: 1 },
  { id: 'upscale',  name: 'Upscale',  rent: 300, food: 120, misc: 80,  healthDrain: 0 },
  { id: 'luxury',   name: 'Luxury',   rent: 600, food: 250, misc: 200, healthDrain: -2 }, // negative = heals
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
  gameStarted: false,
  lifestyleTier: 'budget',
  stocks: initStocks(),
  portfolio: initPortfolio(),
  log: [], // { id, monthName, year, text, type }
};

let logIdCounter = 0;

function addLog(log, monthName, year, text, type = 'info') {
  return [{ id: ++logIdCounter, monthName, year, text, type }, ...log].slice(0, 200);
}

export function getMonthName(monthIndex) {
  return MONTHS[monthIndex];
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        playerName: action.name,
        gameStarted: true,
        log: addLog([], MONTHS[0], 1980, `${action.name} begins their journey with $500 in pocket.`, 'success'),
      };

    case 'ADVANCE_MONTH': {
      // 1. Advance calendar
      const prevMonth = state.month;
      const nextMonthIdx = prevMonth + 1;
      const rollover = nextMonthIdx >= 12;
      const newMonth = rollover ? 0 : nextMonthIdx;
      const newYear = rollover ? state.year + 1 : state.year;
      const monthName = MONTHS[newMonth];

      // 2. Age up in January (except the very first January 1980)
      let newAge = state.age;
      if (newMonth === 0 && (newYear > 1980)) {
        newAge = state.age + 1;
      }

      // 3. Tick stocks
      const { stocks: newStocks, events: marketEvents } = tickStocks(state.stocks);

      // 4. Deduct living expenses
      const tier = getTier(state.lifestyleTier);
      const expenses = totalExpenses(tier);
      const canAfford = state.cash >= expenses;
      const actualExpenses = canAfford ? expenses : state.cash;
      let newCash = +(state.cash - actualExpenses).toFixed(2);

      // 5. Health effects
      let healthDelta = -tier.healthDrain; // healthDrain positive = lose health, so negate for "change"
      // Actually: healthDrain is how much health you LOSE, negative healthDrain means you gain
      // So: health change = -healthDrain
      if (!canAfford) {
        healthDelta = -8; // can't pay bills = big health hit
      }
      const newHealth = Math.max(0, Math.min(100, state.health + healthDelta));

      // 6. Build log entries
      let newLog = state.log;

      // Expense log
      if (canAfford) {
        newLog = addLog(newLog, monthName, newYear,
          `You paid $${expenses} in living expenses (${tier.name}).`, 'info');
      } else {
        newLog = addLog(newLog, monthName, newYear,
          `Can't cover $${expenses} expenses! Paid $${actualExpenses}. Health suffers.`, 'danger');
      }

      // Rent detail
      newLog = addLog(newLog, monthName, newYear,
        `Rent: $${tier.rent} | Food: $${tier.food} | Misc: $${tier.misc}`, 'dim');

      // Market events
      for (const evt of marketEvents) {
        newLog = addLog(newLog, monthName, newYear, evt.text, evt.type);
      }

      // Birthday
      if (newAge !== state.age) {
        newLog = addLog(newLog, monthName, newYear,
          `Happy Birthday! You turned ${newAge}.`, 'success');
      }

      // Health warnings
      if (newHealth <= 20 && newHealth > 0) {
        newLog = addLog(newLog, monthName, newYear,
          `Health critical at ${newHealth}%! Consider resting.`, 'danger');
      }

      // Broke warning
      if (newCash <= 0) {
        newLog = addLog(newLog, monthName, newYear,
          `You're broke! Find work fast.`, 'danger');
      }

      return {
        ...state,
        month: newMonth,
        year: newYear,
        age: newAge,
        cash: newCash,
        health: newHealth,
        stocks: newStocks,
        log: newLog,
      };
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
      const newHealth = Math.max(0, Math.min(100, state.health + action.amount));
      return { ...state, health: newHealth };
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

    case 'RESET':
      logIdCounter = 0;
      return { ...INITIAL_STATE, stocks: initStocks(), portfolio: initPortfolio(), log: [] };

    default:
      return state;
  }
}
