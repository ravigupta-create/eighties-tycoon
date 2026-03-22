import { initStocks, initPortfolio, tickStocks } from './stockMarket'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const INITIAL_STATE = {
  playerName: '',
  year: 1980,
  month: 0,
  cash: 500,
  health: 100,
  gameStarted: false,
  stocks: initStocks(),
  portfolio: initPortfolio(),
};

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
      };

    case 'ADVANCE_MONTH': {
      const nextMonth = state.month + 1;
      const newStocks = tickStocks(state.stocks);
      if (nextMonth >= 12) {
        return { ...state, month: 0, year: state.year + 1, stocks: newStocks };
      }
      return { ...state, month: nextMonth, stocks: newStocks };
    }

    case 'UPDATE_CASH':
      return { ...state, cash: Math.max(0, state.cash + action.amount) };

    case 'UPDATE_HEALTH':
      return { ...state, health: Math.max(0, Math.min(100, state.health + action.amount)) };

    case 'BUY_STOCK': {
      const { companyId, qty } = action;
      const price = state.stocks[companyId].price;
      const cost = +(price * qty).toFixed(2);
      if (cost > state.cash) return state;
      return {
        ...state,
        cash: +(state.cash - cost).toFixed(2),
        portfolio: {
          ...state.portfolio,
          [companyId]: state.portfolio[companyId] + qty,
        },
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
        portfolio: {
          ...state.portfolio,
          [companyId]: owned - qty,
        },
      };
    }

    case 'RESET':
      return { ...INITIAL_STATE, stocks: initStocks(), portfolio: initPortfolio() };

    default:
      return state;
  }
}
