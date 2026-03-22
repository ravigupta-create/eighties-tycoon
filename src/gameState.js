const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const INITIAL_STATE = {
  playerName: '',
  year: 1980,
  month: 0, // index into MONTHS
  cash: 500,
  health: 100,
  gameStarted: false,
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
      if (nextMonth >= 12) {
        return { ...state, month: 0, year: state.year + 1 };
      }
      return { ...state, month: nextMonth };
    }

    case 'UPDATE_CASH':
      return { ...state, cash: Math.max(0, state.cash + action.amount) };

    case 'UPDATE_HEALTH':
      return { ...state, health: Math.max(0, Math.min(100, state.health + action.amount)) };

    case 'RESET':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}
