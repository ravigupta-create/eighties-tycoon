import { useReducer, useState, useRef, useEffect } from 'react'
import { INITIAL_STATE, gameReducer, getMonthName, LIFESTYLE_TIERS } from './gameState'
import { COMPANIES, portfolioValue } from './stockMarket'
import { rollRandomEvent } from './randomEvents'
import './App.css'

/* ── Name Entry Screen ── */
function NameEntry({ onStart }) {
  const [name, setName] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) onStart(name.trim())
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-crt-bg p-4">
      <div className="crt-screen bg-crt-dark border-2 border-crt-border rounded-lg p-8 max-w-md w-full shadow-[0_0_30px_rgba(51,255,51,0.1)]">
        <h1 className="text-phosphor text-3xl font-bold text-center mb-2 text-glow tracking-wider">
          EIGHTIES TYCOON
        </h1>
        <p className="text-phosphor-dim text-center mb-8 text-sm">══════════════════════════</p>
        <p className="text-phosphor text-center mb-6">{'>'} ENTER YOUR NAME TO BEGIN_</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            maxLength={20} autoFocus
            className="bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-lg px-4 py-2 rounded outline-none focus:border-phosphor focus:shadow-[0_0_10px_rgba(51,255,51,0.2)] placeholder:text-phosphor-dim"
            placeholder="PLAYER NAME"
          />
          <button type="submit" disabled={!name.trim()}
            className="bg-crt-bg border border-phosphor text-phosphor font-[family-name:var(--font-crt)] text-lg px-4 py-2 rounded cursor-pointer hover:bg-phosphor hover:text-crt-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >[ START GAME ]</button>
        </form>
        <p className="text-phosphor-dim text-xs text-center mt-8">© 1980 TYCOON SYSTEMS INC.</p>
      </div>
    </div>
  )
}

/* ── Game Over Screen ── */
function GameOverScreen({ state, dispatch }) {
  const totalValue = portfolioValue(state.portfolio, state.stocks)
  const netWorth = +(state.cash + totalValue).toFixed(2)
  const yearsPlayed = state.year - 1980
  const monthsPlayed = yearsPlayed * 12 + state.month

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-crt-bg p-4">
      <div className="crt-screen bg-crt-dark border-2 border-crt-border rounded-lg p-8 max-w-lg w-full shadow-[0_0_40px_rgba(255,51,51,0.2)]">
        <h1 className="text-danger text-3xl font-bold text-center mb-2 tracking-wider" style={{ textShadow: '0 0 10px rgba(255,51,51,0.5)' }}>
          GAME OVER
        </h1>
        <p className="text-phosphor-dim text-center mb-6 text-sm">══════════════════════════</p>

        <p className="text-danger text-center mb-6 text-sm">{state.gameOverReason}</p>

        <div className="border border-crt-border rounded p-4 mb-6">
          <p className="text-phosphor-dim text-xs mb-3">═══ FINAL REPORT ═══</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p className="text-phosphor"><span className="text-phosphor-dim">NAME: </span>{state.playerName.toUpperCase()}</p>
            <p className="text-amber"><span className="text-amber-dim">AGE: </span>{state.age}</p>
            <p className="text-amber"><span className="text-amber-dim">DATE: </span>{getMonthName(state.month)} {state.year}</p>
            <p className="text-phosphor"><span className="text-phosphor-dim">SURVIVED: </span>{monthsPlayed} months</p>
          </div>

          <div className="border-t border-crt-border mt-4 pt-4">
            <p className="text-phosphor-dim text-xs mb-2">═══ FINANCES ═══</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-phosphor"><span className="text-phosphor-dim">CASH: </span>${state.cash.toLocaleString()}</p>
              <p className="text-amber"><span className="text-amber-dim">STOCKS: </span>${totalValue.toLocaleString()}</p>
            </div>
            <div className="mt-3 text-center">
              <p className="text-phosphor-dim text-xs">FINAL NET WORTH</p>
              <p className="text-phosphor text-2xl font-bold text-glow">${netWorth.toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t border-crt-border mt-4 pt-4">
            <p className="text-phosphor-dim text-xs mb-2">═══ VITAL STATS ═══</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className={state.health <= 0 ? 'text-danger' : 'text-phosphor'}>
                <span className="text-phosphor-dim">HEALTH: </span>{state.health}%
                {state.health <= 0 && ' ✗'}
              </p>
              <p className={state.happiness <= 0 ? 'text-danger' : 'text-phosphor'}>
                <span className="text-phosphor-dim">HAPPINESS: </span>{state.happiness}%
                {state.happiness <= 0 && ' ✗'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="w-full bg-crt-bg border-2 border-phosphor text-phosphor font-[family-name:var(--font-crt)] text-lg px-4 py-3 rounded cursor-pointer hover:bg-phosphor hover:text-crt-bg transition-all font-bold tracking-wider"
        >[ TRY AGAIN ]</button>
        <p className="text-phosphor-dim text-xs text-center mt-4">INSERT COIN TO CONTINUE</p>
      </div>
    </div>
  )
}

/* ── Event Pop-up Modal ── */
function EventModal({ event, dispatch }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="crt-screen bg-crt-dark border-2 border-amber rounded-lg p-6 max-w-md w-full shadow-[0_0_40px_rgba(255,176,0,0.2)]">
        <p className="text-amber text-sm font-bold tracking-wider mb-1">╔══ RANDOM EVENT ══╗</p>
        <p className="text-phosphor-dim text-xs mb-4">Something happened...</p>

        <p className="text-phosphor text-sm mb-6 leading-relaxed">{'>'} {event.prompt}</p>

        <div className="flex flex-col gap-2">
          {event.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => dispatch({ type: 'RESOLVE_EVENT', choice })}
              className="bg-crt-bg border border-amber-dim text-amber font-[family-name:var(--font-crt)] text-sm px-4 py-3 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_10px_rgba(255,176,0,0.2)] hover:text-phosphor transition-all text-left"
            >
              [{String.fromCharCode(65 + i)}] {choice.label}
            </button>
          ))}
        </div>

        <p className="text-amber-dim text-xs text-center mt-4">Choose wisely...</p>
      </div>
    </div>
  )
}

/* ── Stat Bar ── */
function StatBar({ label, value, max, color = 'phosphor' }) {
  const pct = Math.round((value / max) * 100)
  const barColor = color === 'amber' ? 'bg-amber' : color === 'danger' ? 'bg-danger' : color === 'cyan' ? 'bg-[#00ffff]' : 'bg-phosphor'
  const textColor = color === 'amber' ? 'text-amber' : color === 'danger' ? 'text-danger' : color === 'cyan' ? 'text-[#00ffff]' : 'text-phosphor'

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className={textColor}>{label}</span>
        <span className={textColor}>{value}{max === 100 ? '%' : ''}</span>
      </div>
      <div className="w-full bg-crt-bg rounded h-3 border border-crt-border overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%`, boxShadow: '0 0 6px currentColor' }}
        />
      </div>
    </div>
  )
}

/* ── Sparkline ── */
function Sparkline({ history }) {
  if (history.length < 2) return null
  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1
  const w = 80; const h = 20
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  const up = history[history.length - 1] >= history[0]
  return (
    <svg width={w} height={h} className="inline-block align-middle">
      <polyline points={points} fill="none" stroke={up ? '#33ff33' : '#ff3333'} strokeWidth="1.5" />
    </svg>
  )
}

/* ── Stock Row ── */
function StockRow({ company, stockData, owned, cash, dispatch }) {
  const [qty, setQty] = useState(1)
  const prev = stockData.history.length >= 2 ? stockData.history[stockData.history.length - 2] : stockData.price
  const change = stockData.price - prev
  const changePct = ((change / prev) * 100).toFixed(1)
  const up = change >= 0
  const maxBuy = Math.floor(cash / stockData.price)

  return (
    <div className="border border-crt-border rounded p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-amber font-bold text-sm">{company.ticker}</span>
          <span className="text-phosphor-dim text-xs hidden sm:inline">{company.name}</span>
        </div>
        <Sparkline history={stockData.history} />
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-phosphor text-lg">${stockData.price.toFixed(2)}</span>
        <span className={`text-sm ${up ? 'text-phosphor' : 'text-danger'}`}>
          {up ? '▲' : '▼'} ${Math.abs(change).toFixed(2)} ({up ? '+' : ''}{changePct}%)
        </span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-phosphor-dim text-xs">
          TREND: {stockData.trend === 1 ? '↑ BULL' : stockData.trend === -1 ? '↓ BEAR' : '— NEUTRAL'}
        </span>
        <span className="text-phosphor-dim text-xs">
          OWNED: <span className="text-phosphor">{owned}</span>
          {owned > 0 && <span className="text-amber ml-1">(${(owned * stockData.price).toFixed(2)})</span>}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-phosphor-dim text-xs">QTY:</label>
        <input type="number" min={1} max={999} value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="bg-crt-bg border border-crt-border text-phosphor font-[family-name:var(--font-crt)] text-xs w-14 px-2 py-1 rounded outline-none focus:border-phosphor"
        />
        <button disabled={qty > maxBuy}
          onClick={() => dispatch({ type: 'BUY_STOCK', companyId: company.id, qty })}
          className="bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-xs px-3 py-1 rounded cursor-pointer hover:border-phosphor hover:shadow-[0_0_6px_rgba(51,255,51,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >BUY (${(stockData.price * qty).toFixed(2)})</button>
        <button disabled={qty > owned}
          onClick={() => dispatch({ type: 'SELL_STOCK', companyId: company.id, qty })}
          className="bg-crt-bg border border-amber-dim text-amber font-[family-name:var(--font-crt)] text-xs px-3 py-1 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_6px_rgba(255,176,0,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >SELL</button>
      </div>
    </div>
  )
}

/* ── Portfolio Tab ── */
function PortfolioPanel({ state, dispatch }) {
  const totalValue = portfolioValue(state.portfolio, state.stocks)
  const netWorth = +(state.cash + totalValue).toFixed(2)

  return (
    <div>
      <div className="border border-crt-border rounded p-3 mb-3 flex flex-wrap gap-4 justify-between text-sm">
        <span className="text-phosphor"><span className="text-phosphor-dim">CASH: </span>${state.cash.toLocaleString()}</span>
        <span className="text-amber"><span className="text-amber-dim">HOLDINGS: </span>${totalValue.toLocaleString()}</span>
        <span className="text-phosphor text-glow"><span className="text-phosphor-dim">NET WORTH: </span>${netWorth.toLocaleString()}</span>
      </div>
      {COMPANIES.map((co) => (
        <StockRow key={co.id} company={co} stockData={state.stocks[co.id]}
          owned={state.portfolio[co.id]} cash={state.cash} dispatch={dispatch} />
      ))}
    </div>
  )
}

/* ── Lifestyle Selector ── */
function LifestyleSelector({ current, cash, dispatch }) {
  return (
    <div className="border border-crt-border rounded p-3 mb-3">
      <p className="text-phosphor-dim text-xs mb-2">═══ LIFESTYLE TIER ═══</p>
      <div className="grid grid-cols-2 gap-2">
        {LIFESTYLE_TIERS.map((tier) => {
          const total = tier.rent + tier.food + tier.misc;
          const active = current === tier.id;
          const tooExpensive = cash < total && !active;
          return (
            <button key={tier.id}
              onClick={() => dispatch({ type: 'SET_LIFESTYLE', tierId: tier.id })}
              disabled={tooExpensive}
              className={`font-[family-name:var(--font-crt)] text-xs px-2 py-2 rounded border transition-all cursor-pointer text-left
                ${active
                  ? 'border-phosphor text-phosphor bg-crt-bg shadow-[0_0_8px_rgba(51,255,51,0.15)]'
                  : tooExpensive
                    ? 'border-crt-border text-phosphor-dim opacity-40 cursor-not-allowed'
                    : 'border-crt-border text-phosphor-dim bg-crt-bg hover:border-phosphor-dim hover:text-phosphor'}`}
            >
              <span className="block font-bold">{tier.name.toUpperCase()}</span>
              <span className="block text-[10px] mt-0.5">
                ${total}/mo
                {tier.healthDrain > 0 && <span className="text-danger ml-1">-{tier.healthDrain}HP</span>}
                {tier.healthDrain < 0 && <span className="text-phosphor ml-1">+{Math.abs(tier.healthDrain)}HP</span>}
                {tier.healthDrain === 0 && <span className="text-amber ml-1">±0HP</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  )
}

/* ── Status Tab ── */
function StatusPanel({ state, dispatch }) {
  const healthColor = state.health > 60 ? 'phosphor' : state.health > 30 ? 'amber' : 'danger'
  const happyColor = state.happiness > 60 ? 'cyan' : state.happiness > 30 ? 'amber' : 'danger'
  const tier = LIFESTYLE_TIERS.find(t => t.id === state.lifestyleTier) || LIFESTYLE_TIERS[0];
  const totalExp = tier.rent + tier.food + tier.misc;

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-crt-border rounded p-4">
        <p className="text-phosphor-dim text-xs mb-3">═══ PLAYER STATUS ═══</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
          <p className="text-phosphor"><span className="text-phosphor-dim">NAME: </span>{state.playerName.toUpperCase()}</p>
          <p className="text-amber"><span className="text-amber-dim">AGE: </span>{state.age}</p>
          <p className="text-amber"><span className="text-amber-dim">DATE: </span>{getMonthName(state.month)} {state.year}</p>
          <p className="text-phosphor"><span className="text-phosphor-dim">CASH: </span><span className="text-glow">${state.cash.toLocaleString()}</span></p>
        </div>
        <StatBar label="HEALTH" value={state.health} max={100} color={healthColor} />
        <StatBar label="HAPPINESS" value={state.happiness} max={100} color={happyColor} />
        <p className="text-phosphor-dim text-xs mt-2">
          LIFESTYLE: <span className="text-amber">{tier.name.toUpperCase()}</span>
          <span className="text-phosphor-dim"> — ${totalExp}/mo</span>
        </p>
      </div>

      <LifestyleSelector current={state.lifestyleTier} cash={state.cash} dispatch={dispatch} />

      <div className="border border-crt-border rounded p-4">
        <p className="text-phosphor-dim text-xs mb-3">═══ ACTIONS ═══</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => dispatch({ type: 'UPDATE_CASH', amount: 50 })}
            className="bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-phosphor hover:shadow-[0_0_8px_rgba(51,255,51,0.2)] transition-all text-left"
          >{'>'} WORK (+$50)</button>
          <button onClick={() => { dispatch({ type: 'UPDATE_CASH', amount: -20 }); dispatch({ type: 'UPDATE_HEALTH', amount: 10 }) }}
            className="bg-crt-bg border border-phosphor-dim text-amber font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_8px_rgba(255,176,0,0.2)] transition-all text-left"
          >{'>'} REST (-$20, +10% HP)</button>
          <button onClick={() => { dispatch({ type: 'UPDATE_CASH', amount: -30 }); dispatch({ type: 'UPDATE_HAPPINESS', amount: 12 }) }}
            className="bg-crt-bg border border-phosphor-dim text-[#00ffff] font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-[#00ffff] hover:shadow-[0_0_8px_rgba(0,255,255,0.2)] transition-all text-left"
          >{'>'} HANG OUT (-$30, +12% JOY)</button>
          <button onClick={() => dispatch({ type: 'UPDATE_HEALTH', amount: -5 })}
            className="bg-crt-bg border border-phosphor-dim text-danger font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-danger hover:shadow-[0_0_8px_rgba(255,51,51,0.2)] transition-all text-left"
          >{'>'} HUSTLE (-5% HP)</button>
        </div>
      </div>
    </div>
  )
}

/* ── Life Log Sidebar ── */
function LifeLog({ log }) {
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0 }, [log.length]);

  const colorFor = (type) => {
    switch (type) {
      case 'success': return 'text-phosphor';
      case 'danger':  return 'text-danger';
      case 'dim':     return 'text-phosphor-dim';
      default:        return 'text-amber';
    }
  };

  return (
    <div className="crt-screen bg-crt-dark border-2 border-crt-border rounded-lg shadow-[0_0_20px_rgba(51,255,51,0.07)] flex flex-col h-full">
      <div className="border-b border-crt-border p-3">
        <p className="text-phosphor text-sm font-bold tracking-wider">LIFE LOG</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 min-h-0 log-scroll">
        {log.length === 0 ? (
          <p className="text-phosphor-dim text-xs animate-pulse">{'>'} Awaiting first month...</p>
        ) : (
          log.map((entry) => (
            <div key={entry.id} className="mb-1.5">
              <span className="text-phosphor-dim text-[10px]">{entry.monthName.slice(0, 3)} {entry.year}</span>
              <p className={`text-xs leading-tight ${colorFor(entry.type)}`}>{'>'} {entry.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ── Game Screen ── */
function GameScreen({ state, dispatch }) {
  const [tab, setTab] = useState('status')
  const totalValue = portfolioValue(state.portfolio, state.stocks)
  const netWorth = +(state.cash + totalValue).toFixed(2)

  // Handle the __ROLL__ sentinel — roll event outside reducer to keep it pure
  useEffect(() => {
    if (state.pendingEvent === '__ROLL__') {
      const event = rollRandomEvent(state);
      dispatch({ type: 'SET_PENDING_EVENT', event });
    }
  }, [state.pendingEvent]);

  const showEvent = state.pendingEvent && state.pendingEvent !== '__ROLL__';

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)}
      className={`font-[family-name:var(--font-crt)] text-sm px-4 py-2 cursor-pointer transition-all border-b-2 ${
        tab === id
          ? 'text-phosphor border-phosphor'
          : 'text-phosphor-dim border-transparent hover:text-phosphor hover:border-phosphor-dim'
      }`}
    >{label}</button>
  )

  return (
    <div className="min-h-screen bg-crt-bg p-4">
      {/* Event Modal */}
      {showEvent && <EventModal event={state.pendingEvent} dispatch={dispatch} />}

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4">
        {/* Main Panel */}
        <div className="flex-1 min-w-0">
          <div className="crt-screen bg-crt-dark border-2 border-crt-border rounded-lg shadow-[0_0_30px_rgba(51,255,51,0.1)]">
            {/* Header */}
            <div className="border-b border-crt-border p-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h1 className="text-phosphor text-xl font-bold text-glow tracking-wider">EIGHTIES TYCOON</h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-amber">{getMonthName(state.month)} {state.year}</span>
                  <span className="text-phosphor-dim">AGE {state.age}</span>
                  <span className="text-phosphor">${netWorth.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Next Month Button */}
            <div className="p-3 border-b border-crt-border bg-crt-bg">
              <button
                onClick={() => dispatch({ type: 'ADVANCE_MONTH' })}
                disabled={!!state.pendingEvent}
                className="w-full bg-crt-bg border-2 border-phosphor text-phosphor font-[family-name:var(--font-crt)] text-base px-4 py-3 rounded cursor-pointer hover:bg-phosphor hover:text-crt-bg transition-all text-glow font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
              >{'>>>'} NEXT MONTH {'>>>'}</button>
            </div>

            {/* Compact vital bars in header area */}
            <div className="px-4 pt-3 pb-1 grid grid-cols-2 gap-3">
              <StatBar label="HEALTH" value={state.health} max={100}
                color={state.health > 60 ? 'phosphor' : state.health > 30 ? 'amber' : 'danger'} />
              <StatBar label="HAPPINESS" value={state.happiness} max={100}
                color={state.happiness > 60 ? 'cyan' : state.happiness > 30 ? 'amber' : 'danger'} />
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-crt-border bg-crt-bg">
              {tabBtn('status', '[ STATUS ]')}
              {tabBtn('portfolio', '[ PORTFOLIO ]')}
            </div>

            {/* Tab content */}
            <div className="p-4">
              {tab === 'status' && <StatusPanel state={state} dispatch={dispatch} />}
              {tab === 'portfolio' && <PortfolioPanel state={state} dispatch={dispatch} />}
            </div>
          </div>
        </div>

        {/* Life Log Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="lg:sticky lg:top-4 h-[calc(100vh-2rem)]">
            <LifeLog log={state.log} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── App Root ── */
function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)

  if (!state.gameStarted) {
    return <NameEntry onStart={(name) => dispatch({ type: 'START_GAME', name })} />
  }

  if (state.gameOver) {
    return <GameOverScreen state={state} dispatch={dispatch} />
  }

  return <GameScreen state={state} dispatch={dispatch} />
}

export default App
