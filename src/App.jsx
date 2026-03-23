import { useReducer, useState, useRef, useEffect, useCallback } from 'react'
import { INITIAL_STATE, gameReducer, getMonthName, LIFESTYLE_TIERS } from './gameState'
import { COMPANIES, portfolioValue } from './stockMarket'
import { PROPERTIES, totalPropertyValue, totalMaintenance, totalPropertyHappiness } from './realEstate'
import { CAREER_RANKS, getRank, isMaxRank, workHardAmount, workHardHealthCost } from './career'
import { LUXURY_ITEMS, getReputationTier, getNextReputationTier } from './luxuryShop'
import { rollRandomEvent } from './randomEvents'
import { saveGame, loadGame, deleteSave, hasSave, saveSettings, loadSettings } from './saveLoad'
import {
  sfxClick, sfxNextMonth, sfxCashIn, sfxCashOut, sfxBuy, sfxSell,
  sfxEvent, sfxChoice, sfxWarning, sfxGameOver, sfxStart, sfxSave,
  sfxReset, sfxTab, sfxWork, sfxCrash, sfxBoom, sfxBirthday,
  sfxNewsTicker,
  setMuted, isMuted, setVolume, getVolume,
} from './sounds'
import { lazy, Suspense } from 'react'
import './App.css'

const World3D = lazy(() => import('./world/World3D'))

const AUTOSAVE_INTERVAL = 3 * 60 * 1000; // 3 minutes

/* ── Save Indicator ── */
function SaveIndicator({ visible }) {
  if (!visible) return null;
  return (
    <div className="fixed top-4 right-4 z-40 text-phosphor-dim text-xs font-[family-name:var(--font-crt)] flex items-center gap-2 bg-crt-dark border border-crt-border rounded px-3 py-1.5 shadow-[0_0_10px_rgba(51,255,51,0.1)] animate-pulse">
      <span className="inline-block w-2 h-2 rounded-full bg-phosphor" />
      SAVING...
    </div>
  );
}

/* ── Confirm Modal ── */
function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="crt-screen bg-crt-dark border-2 border-danger rounded-lg p-6 max-w-sm w-full shadow-[0_0_30px_rgba(255,51,51,0.2)]">
        <p className="text-danger text-sm font-bold tracking-wider mb-2">{title}</p>
        <p className="text-phosphor text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={() => { sfxClick(); onConfirm(); }}
            className="flex-1 bg-crt-bg border border-danger text-danger font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:bg-danger hover:text-crt-bg transition-all"
          >[ YES ]</button>
          <button onClick={() => { sfxClick(); onCancel(); }}
            className="flex-1 bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-phosphor transition-all"
          >[ NO ]</button>
        </div>
      </div>
    </div>
  );
}

/* ── Settings Menu ── */
function SettingsMenu({ onClose, onNewLife, soundMuted, onToggleMute, soundVolume, onVolumeChange }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="crt-screen bg-crt-dark border-2 border-phosphor rounded-lg p-6 max-w-sm w-full shadow-[0_0_30px_rgba(51,255,51,0.15)]">
        <p className="text-phosphor text-sm font-bold tracking-wider mb-1">╔══ SETTINGS ══╗</p>
        <p className="text-phosphor-dim text-xs mb-5">System Configuration</p>

        {/* Sound */}
        <div className="border border-crt-border rounded p-3 mb-3">
          <p className="text-phosphor-dim text-xs mb-2">═══ AUDIO ═══</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-phosphor text-sm">SOUND FX</span>
            <button onClick={() => { sfxClick(); onToggleMute(); }}
              className={`font-[family-name:var(--font-crt)] text-xs px-3 py-1 rounded border cursor-pointer transition-all ${
                soundMuted
                  ? 'border-danger text-danger hover:bg-danger hover:text-crt-bg'
                  : 'border-phosphor text-phosphor hover:bg-phosphor hover:text-crt-bg'
              }`}
            >{soundMuted ? '[ MUTED ]' : '[ ON ]'}</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-phosphor-dim text-xs">VOL:</span>
            <input type="range" min="0" max="100" value={Math.round(soundVolume * 100)}
              onChange={(e) => onVolumeChange(parseInt(e.target.value) / 100)}
              className="flex-1 accent-[#33ff33] h-1"
            />
            <span className="text-phosphor text-xs w-8 text-right">{Math.round(soundVolume * 100)}%</span>
          </div>
        </div>

        {/* Save Info */}
        <div className="border border-crt-border rounded p-3 mb-3">
          <p className="text-phosphor-dim text-xs mb-2">═══ SAVE DATA ═══</p>
          <p className="text-phosphor text-xs">
            Auto-save: <span className="text-amber">Every 3 min + each month</span>
          </p>
          <p className="text-phosphor-dim text-xs mt-1">
            Save stored in browser localStorage
          </p>
        </div>

        {/* New Life */}
        <button onClick={() => { sfxClick(); onNewLife(); }}
          className="w-full bg-crt-bg border border-danger text-danger font-[family-name:var(--font-crt)] text-sm px-3 py-2.5 rounded cursor-pointer hover:bg-danger hover:text-crt-bg transition-all mb-3"
        >{'>'} NEW LIFE (Reset to 1980)</button>

        {/* Close */}
        <button onClick={() => { sfxClick(); onClose(); }}
          className="w-full bg-crt-bg border border-phosphor text-phosphor font-[family-name:var(--font-crt)] text-sm px-3 py-2.5 rounded cursor-pointer hover:bg-phosphor hover:text-crt-bg transition-all"
        >[ CLOSE ]</button>
      </div>
    </div>
  );
}

/* ── Name Entry Screen ── */
function NameEntry({ onStart, onLoad, savedName, savedState }) {
  const [name, setName] = useState('')
  const [showWarning, setShowWarning] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    if (savedName) {
      sfxClick()
      setShowWarning(true)
    } else {
      sfxStart()
      onStart(name.trim())
    }
  }

  const confirmNewGame = () => {
    setShowWarning(false)
    sfxStart()
    onStart(name.trim())
  }

  const savedInfo = savedState ? {
    date: `${getMonthName(savedState.month)} ${savedState.year}`,
    age: savedState.age,
    cash: savedState.cash,
  } : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-crt-bg p-4">
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="crt-screen bg-crt-dark border-2 border-danger rounded-lg p-6 max-w-sm w-full shadow-[0_0_30px_rgba(255,51,51,0.2)]">
            <p className="text-danger text-sm font-bold tracking-wider mb-2">╔══ WARNING ══╗</p>
            <p className="text-phosphor text-sm mb-3">Starting a new game will <span className="text-danger">permanently erase</span> your existing save:</p>
            <div className="border border-crt-border rounded p-3 mb-4 text-xs">
              <p className="text-amber"><span className="text-amber-dim">PLAYER: </span>{savedName.toUpperCase()}</p>
              {savedInfo && <>
                <p className="text-amber"><span className="text-amber-dim">DATE: </span>{savedInfo.date}</p>
                <p className="text-amber"><span className="text-amber-dim">AGE: </span>{savedInfo.age}</p>
                <p className="text-phosphor"><span className="text-phosphor-dim">CASH: </span>${savedInfo.cash.toLocaleString()}</p>
              </>}
            </div>
            <p className="text-phosphor-dim text-xs mb-4">This cannot be undone. Are you sure?</p>
            <div className="flex gap-3">
              <button onClick={confirmNewGame}
                className="flex-1 bg-crt-bg border border-danger text-danger font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:bg-danger hover:text-crt-bg transition-all"
              >[ ERASE & START NEW ]</button>
              <button onClick={() => { sfxClick(); setShowWarning(false); }}
                className="flex-1 bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-phosphor transition-all"
              >[ CANCEL ]</button>
            </div>
          </div>
        </div>
      )}

      <div className="crt-screen bg-crt-dark border-2 border-crt-border rounded-lg p-8 max-w-md w-full shadow-[0_0_30px_rgba(51,255,51,0.1)]">
        <h1 className="text-phosphor text-3xl font-bold text-center mb-2 text-glow tracking-wider">
          EIGHTIES TYCOON
        </h1>
        <p className="text-phosphor-dim text-center mb-8 text-sm">══════════════════════════</p>

        {savedName && (
          <button onClick={() => { sfxStart(); onLoad(); }}
            className="w-full bg-crt-bg border-2 border-amber text-amber font-[family-name:var(--font-crt)] text-base px-4 py-3 rounded cursor-pointer hover:bg-amber hover:text-crt-bg transition-all mb-4 font-bold tracking-wider"
          >{'>'} CONTINUE AS {savedName.toUpperCase()}</button>
        )}

        <p className="text-phosphor text-center mb-4 text-sm">
          {savedName ? 'Or start a new life:' : '> ENTER YOUR NAME TO BEGIN_'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            maxLength={20} autoFocus={!savedName}
            className="bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-lg px-4 py-2 rounded outline-none focus:border-phosphor focus:shadow-[0_0_10px_rgba(51,255,51,0.2)] placeholder:text-phosphor-dim"
            placeholder="PLAYER NAME"
          />
          <button type="submit" disabled={!name.trim()}
            className="bg-crt-bg border border-phosphor text-phosphor font-[family-name:var(--font-crt)] text-lg px-4 py-2 rounded cursor-pointer hover:bg-phosphor hover:text-crt-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >[ NEW GAME ]</button>
        </form>
        <p className="text-phosphor-dim text-xs text-center mt-8">© 1980 TYCOON SYSTEMS INC.</p>
      </div>
    </div>
  )
}

/* ── Game Over Screen ── */
function GameOverScreen({ state, dispatch, onNewLife }) {
  const totalValue = portfolioValue(state.portfolio, state.stocks)
  const propValue = totalPropertyValue(state.properties || [])
  const netWorth = +(state.cash + totalValue + propValue).toFixed(2)
  const yearsPlayed = state.year - 1980
  const monthsPlayed = yearsPlayed * 12 + state.month

  useEffect(() => { sfxGameOver(); }, []);

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
              <p className="text-amber"><span className="text-amber-dim">PROPERTY: </span>${propValue.toLocaleString()}</p>
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
                <span className="text-phosphor-dim">HEALTH: </span>{state.health}%{state.health <= 0 && ' ✗'}
              </p>
              <p className={state.happiness <= 0 ? 'text-danger' : 'text-phosphor'}>
                <span className="text-phosphor-dim">HAPPINESS: </span>{state.happiness}%{state.happiness <= 0 && ' ✗'}
              </p>
              <p className="text-amber">
                <span className="text-amber-dim">CAREER: </span>{getRank(state.career?.rankIndex || 0).name}
              </p>
              <p className="text-amber">
                <span className="text-amber-dim">REP: </span>{state.reputation || 0} ({getReputationTier(state.reputation || 0).label})
              </p>
            </div>
          </div>
        </div>

        <button onClick={() => { sfxReset(); onNewLife(); }}
          className="w-full bg-crt-bg border-2 border-phosphor text-phosphor font-[family-name:var(--font-crt)] text-lg px-4 py-3 rounded cursor-pointer hover:bg-phosphor hover:text-crt-bg transition-all font-bold tracking-wider"
        >[ TRY AGAIN ]</button>
        <p className="text-phosphor-dim text-xs text-center mt-4">INSERT COIN TO CONTINUE</p>
      </div>
    </div>
  )
}

/* ── Event Pop-up Modal ── */
function EventModal({ event, dispatch }) {
  useEffect(() => { sfxEvent(); }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="crt-screen bg-crt-dark border-2 border-amber rounded-lg p-6 max-w-md w-full shadow-[0_0_40px_rgba(255,176,0,0.2)]">
        <p className="text-amber text-sm font-bold tracking-wider mb-1">╔══ RANDOM EVENT ══╗</p>
        <p className="text-phosphor-dim text-xs mb-4">Something happened...</p>
        <p className="text-phosphor text-sm mb-6 leading-relaxed">{'>'} {event.prompt}</p>
        <div className="flex flex-col gap-2">
          {event.choices.map((choice, i) => (
            <button key={i}
              onClick={() => { sfxChoice(); dispatch({ type: 'RESOLVE_EVENT', choice }); }}
              className="bg-crt-bg border border-amber-dim text-amber font-[family-name:var(--font-crt)] text-sm px-4 py-3 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_10px_rgba(255,176,0,0.2)] hover:text-phosphor transition-all text-left"
            >[{String.fromCharCode(65 + i)}] {choice.label}</button>
          ))}
        </div>
        <p className="text-amber-dim text-xs text-center mt-4">Choose wisely...</p>
      </div>
    </div>
  );
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
        <div className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%`, boxShadow: '0 0 6px currentColor' }} />
      </div>
    </div>
  )
}

/* ── Sparkline ── */
function Sparkline({ history }) {
  if (history.length < 2) return null
  const min = Math.min(...history); const max = Math.max(...history)
  const range = max - min || 1; const w = 80; const h = 20
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
          onClick={() => { sfxBuy(); dispatch({ type: 'BUY_STOCK', companyId: company.id, qty }); }}
          className="bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-xs px-3 py-1 rounded cursor-pointer hover:border-phosphor hover:shadow-[0_0_6px_rgba(51,255,51,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >BUY (${(stockData.price * qty).toFixed(2)})</button>
        <button disabled={qty > owned}
          onClick={() => { sfxSell(); dispatch({ type: 'SELL_STOCK', companyId: company.id, qty }); }}
          className="bg-crt-bg border border-amber-dim text-amber font-[family-name:var(--font-crt)] text-xs px-3 py-1 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_6px_rgba(255,176,0,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >SELL</button>
      </div>
    </div>
  )
}

/* ── Portfolio Tab ── */
function PortfolioPanel({ state, dispatch }) {
  const totalValue = portfolioValue(state.portfolio, state.stocks)
  const propValue = totalPropertyValue(state.properties || [])
  const netWorth = +(state.cash + totalValue + propValue).toFixed(2)
  const rep = state.reputation || 0;

  return (
    <div>
      <div className="border border-crt-border rounded p-3 mb-3 flex flex-wrap gap-4 justify-between text-sm">
        <span className="text-phosphor"><span className="text-phosphor-dim">CASH: </span>${state.cash.toLocaleString()}</span>
        <span className="text-amber"><span className="text-amber-dim">HOLDINGS: </span>${totalValue.toLocaleString()}</span>
        <span className="text-phosphor text-glow"><span className="text-phosphor-dim">NET WORTH: </span>${netWorth.toLocaleString()}</span>
      </div>
      {COMPANIES.map((co) => {
        const locked = (co.repRequired || 0) > rep;
        if (locked) {
          return (
            <div key={co.id} className="border border-crt-border rounded p-3 mb-2 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-phosphor-dim font-bold text-sm">🔒 {co.ticker}</span>
                  <span className="text-phosphor-dim text-xs">{co.name}</span>
                </div>
                <span className="text-amber-dim text-xs">REQ: {co.repRequired} REP</span>
              </div>
              <p className="text-phosphor-dim text-xs mt-1">Build reputation in the Luxury Shop to unlock.</p>
            </div>
          );
        }
        return (
          <StockRow key={co.id} company={co} stockData={state.stocks[co.id]}
            owned={state.portfolio[co.id]} cash={state.cash} dispatch={dispatch} />
        );
      })}
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
              onClick={() => { sfxClick(); dispatch({ type: 'SET_LIFESTYLE', tierId: tier.id }); }}
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

  const career = state.career || { rankIndex: 0, promotionMeter: 0 };
  const rank = getRank(career.rankIndex);
  const maxRank = isMaxRank(career.rankIndex);
  const promoProgress = maxRank ? 100 : Math.min(100, Math.round((career.promotionMeter / rank.promoThreshold) * 100));
  const hpCost = workHardHealthCost(career.rankIndex);
  const meterGain = workHardAmount(career.rankIndex);

  return (
    <div className="flex flex-col gap-4">
      {/* Player Info */}
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
          {state.expenseMultiplier !== 1.0 && state.expenseMultiplierExpiry > 0 && (
            <span className={state.expenseMultiplier > 1 ? 'text-danger' : 'text-phosphor'}>
              {' '}({state.expenseMultiplier > 1 ? '+' : ''}{Math.round((state.expenseMultiplier - 1) * 100)}% for {state.expenseMultiplierExpiry}mo)
            </span>
          )}
        </p>
      </div>

      {/* Career Panel */}
      <div className="border border-crt-border rounded p-4">
        <p className="text-phosphor-dim text-xs mb-3">═══ CAREER ═══</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-amber text-sm font-bold">{rank.icon} {rank.name.toUpperCase()}</span>
          <span className="text-phosphor text-sm">${rank.salary}/mo</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <span className="text-phosphor-dim">STRESS: <span className="text-danger">-{rank.stressDrain} HP/mo</span></span>
          <span className="text-phosphor-dim">RANK: <span className="text-phosphor">{career.rankIndex + 1}/{CAREER_RANKS.length}</span></span>
        </div>

        {/* Promotion Meter */}
        {!maxRank ? (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-amber">PROMOTION</span>
              <span className="text-amber">{career.promotionMeter}/{rank.promoThreshold}</span>
            </div>
            <div className="w-full bg-crt-bg rounded h-3 border border-crt-border overflow-hidden">
              <div className="h-full bg-amber transition-all duration-500"
                style={{ width: `${promoProgress}%`, boxShadow: '0 0 6px #ffb000' }} />
            </div>
            <p className="text-phosphor-dim text-[10px] mt-1">
              Next: <span className="text-phosphor">{getRank(career.rankIndex + 1).name}</span>
              <span className="text-phosphor-dim"> — ${getRank(career.rankIndex + 1).salary}/mo</span>
            </p>
          </div>
        ) : (
          <p className="text-phosphor text-xs mb-3 text-glow">★ MAX RANK ACHIEVED ★</p>
        )}

        {/* Work Hard Button */}
        <button
          onClick={() => { sfxWork(); dispatch({ type: 'WORK_HARD' }); }}
          disabled={maxRank}
          className="w-full bg-crt-bg border border-amber-dim text-amber font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_8px_rgba(255,176,0,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >{'>'} WORK HARD (-{hpCost}% HP, +{meterGain} promo){maxRank ? ' [MAXED]' : ''}</button>
      </div>

      <LifestyleSelector current={state.lifestyleTier} cash={state.cash} dispatch={dispatch} />

      {/* Actions */}
      <div className="border border-crt-border rounded p-4">
        <p className="text-phosphor-dim text-xs mb-3">═══ ACTIONS ═══</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => { sfxClick(); sfxCashOut(); dispatch({ type: 'UPDATE_CASH', amount: -20 }); dispatch({ type: 'UPDATE_HEALTH', amount: 10 }); }}
            className="bg-crt-bg border border-phosphor-dim text-amber font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_8px_rgba(255,176,0,0.2)] transition-all text-left"
          >{'>'} REST (-$20, +10% HP)</button>
          <button onClick={() => { sfxClick(); sfxCashOut(); dispatch({ type: 'UPDATE_CASH', amount: -30 }); dispatch({ type: 'UPDATE_HAPPINESS', amount: 12 }); }}
            className="bg-crt-bg border border-phosphor-dim text-[#00ffff] font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-[#00ffff] hover:shadow-[0_0_8px_rgba(0,255,255,0.2)] transition-all text-left"
          >{'>'} HANG OUT (-$30, +12% JOY)</button>
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

/* ── Real Estate Panel ── */
function RealEstatePanel({ state, dispatch }) {
  const propValue = totalPropertyValue(state.properties);
  const monthlyMaint = totalMaintenance(state.properties);
  const monthlyJoy = totalPropertyHappiness(state.properties);

  // Count how many of each type the player owns
  const ownedCounts = {};
  for (const p of state.properties) {
    ownedCounts[p.propertyId] = (ownedCounts[p.propertyId] || 0) + 1;
  }

  return (
    <div>
      {/* Summary */}
      <div className="border border-crt-border rounded p-3 mb-3 flex flex-wrap gap-4 justify-between text-sm">
        <span className="text-phosphor">
          <span className="text-phosphor-dim">PROPERTIES: </span>{state.properties.length}
        </span>
        <span className="text-amber">
          <span className="text-amber-dim">TOTAL VALUE: </span>${propValue.toLocaleString()}
        </span>
        <span className="text-[#00ffff]">
          <span className="text-phosphor-dim">JOY: </span>+{monthlyJoy}/mo
        </span>
        <span className="text-danger">
          <span className="text-phosphor-dim">MAINT: </span>-${monthlyMaint}/mo
        </span>
      </div>

      {/* Properties for sale */}
      <div className="border border-crt-border rounded p-3 mb-3">
        <p className="text-phosphor-dim text-xs mb-3">═══ PROPERTIES FOR SALE ═══</p>
        <div className="flex flex-col gap-2">
          {PROPERTIES.map((prop) => {
            const rep = state.reputation || 0;
            const locked = (prop.repRequired || 0) > rep;
            const canBuy = state.cash >= prop.basePrice && !locked;

            if (locked) {
              return (
                <div key={prop.id} className="border border-crt-border rounded p-3 opacity-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-phosphor-dim font-bold text-sm">🔒 {prop.name.toUpperCase()}</span>
                    <span className="text-amber-dim text-xs">REQ: {prop.repRequired} REP</span>
                  </div>
                  <p className="text-phosphor-dim text-xs">Build reputation in the Luxury Shop to unlock.</p>
                </div>
              );
            }

            return (
              <div key={prop.id} className="border border-crt-border rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-amber font-bold text-sm">{prop.icon} {prop.name.toUpperCase()}</span>
                  <span className="text-phosphor text-sm">${prop.basePrice.toLocaleString()}</span>
                </div>
                <p className="text-phosphor-dim text-xs mb-2">{prop.description}</p>
                <div className="flex items-center justify-between mb-2 text-[10px]">
                  <span className="text-[#00ffff]">+{prop.happinessBonus} JOY/mo</span>
                  <span className="text-danger">-${prop.maintenance} MAINT/mo</span>
                  <span className="text-phosphor-dim">~{(prop.appreciationRate * 100).toFixed(1)}%/mo growth</span>
                </div>
                <button
                  disabled={!canBuy}
                  onClick={() => { sfxBuy(); dispatch({ type: 'BUY_PROPERTY', propertyId: prop.id, price: prop.basePrice }); }}
                  className="w-full bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-xs px-3 py-1.5 rounded cursor-pointer hover:border-phosphor hover:shadow-[0_0_6px_rgba(51,255,51,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  BUY FOR ${prop.basePrice.toLocaleString()}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Owned properties */}
      {state.properties.length > 0 && (
        <div className="border border-crt-border rounded p-3">
          <p className="text-phosphor-dim text-xs mb-3">═══ YOUR PROPERTIES ═══</p>
          <div className="flex flex-col gap-2">
            {state.properties.map((prop, idx) => {
              const def = PROPERTIES.find(p => p.id === prop.propertyId);
              if (!def) return null;
              const profit = +(prop.currentValue - prop.purchasePrice).toFixed(2);
              const profitPct = ((profit / prop.purchasePrice) * 100).toFixed(1);
              const isUp = profit >= 0;

              return (
                <div key={idx} className="border border-crt-border rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-amber font-bold text-sm">{def.icon} {def.name.toUpperCase()}</span>
                    <span className="text-phosphor text-sm">${prop.currentValue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="text-phosphor-dim">
                      Bought: ${prop.purchasePrice.toLocaleString()} ({prop.monthsOwned}mo ago)
                    </span>
                    <span className={isUp ? 'text-phosphor' : 'text-danger'}>
                      {isUp ? '▲' : '▼'} ${Math.abs(profit).toLocaleString()} ({isUp ? '+' : ''}{profitPct}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2 text-[10px]">
                    <span className="text-[#00ffff]">+{def.happinessBonus} JOY/mo</span>
                    <span className="text-danger">-${def.maintenance} MAINT/mo</span>
                  </div>
                  <button
                    onClick={() => { sfxSell(); dispatch({ type: 'SELL_PROPERTY', index: idx }); }}
                    className="w-full bg-crt-bg border border-amber-dim text-amber font-[family-name:var(--font-crt)] text-xs px-3 py-1.5 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_6px_rgba(255,176,0,0.2)] transition-all"
                  >
                    SELL FOR ${prop.currentValue.toLocaleString()}
                    {isUp ? ` (+$${profit.toLocaleString()})` : ` (-$${Math.abs(profit).toLocaleString()})`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Luxury Shop Panel ── */
function LuxuryShopPanel({ state, dispatch }) {
  const rep = state.reputation || 0;
  const owned = state.luxuryItems || [];
  const tier = getReputationTier(rep);
  const nextTier = getNextReputationTier(rep);

  // Group items by tier
  const tiers = [1, 2, 3];
  const tierLabels = { 1: 'STARTER FLEX', 2: 'MID-LEVEL STATUS', 3: 'HIGH ROLLER' };

  return (
    <div>
      {/* Reputation Summary */}
      <div className="border border-crt-border rounded p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-phosphor-dim text-xs">═══ REPUTATION ═══</span>
          <span className={`text-${tier.color} text-sm font-bold`}>{tier.label.toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-phosphor text-lg">{rep} REP</span>
          {nextTier && (
            <span className="text-phosphor-dim text-xs">
              Next: <span className={`text-${nextTier.color}`}>{nextTier.label}</span> at {nextTier.minRep}
            </span>
          )}
        </div>
        {nextTier && (
          <div className="w-full bg-crt-bg rounded h-2 border border-crt-border overflow-hidden">
            <div className="h-full bg-amber transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((rep / nextTier.minRep) * 100))}%`,
                boxShadow: '0 0 4px #ffb000',
              }} />
          </div>
        )}
        <p className="text-phosphor-dim text-[10px] mt-2">
          ITEMS OWNED: <span className="text-phosphor">{owned.length}/{LUXURY_ITEMS.length}</span>
          {' | '}REP unlocks better stocks, properties, and investments.
        </p>
      </div>

      {/* Shop Items by Tier */}
      {tiers.map((t) => {
        const items = LUXURY_ITEMS.filter(i => i.tier === t);
        return (
          <div key={t} className="border border-crt-border rounded p-3 mb-3">
            <p className="text-amber-dim text-xs mb-2">═══ {tierLabels[t]} ═══</p>
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const isOwned = owned.includes(item.id);
                const canAfford = state.cash >= item.price;

                return (
                  <div key={item.id} className={`border rounded p-3 ${isOwned ? 'border-phosphor bg-crt-bg/50' : 'border-crt-border'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-sm ${isOwned ? 'text-phosphor' : 'text-amber'}`}>
                        {item.icon} {item.name.toUpperCase()}
                      </span>
                      {isOwned ? (
                        <span className="text-phosphor text-xs font-bold">✓ OWNED</span>
                      ) : (
                        <span className="text-phosphor text-sm">${item.price.toLocaleString()}</span>
                      )}
                    </div>
                    <p className="text-phosphor-dim text-xs mb-2">{item.description}</p>
                    <div className="flex items-center justify-between mb-2 text-[10px]">
                      <span className="text-amber">+{item.reputation} REP</span>
                      <span className="text-[#00ffff]">+{item.happiness} JOY</span>
                      <span className="text-phosphor-dim">PERMANENT</span>
                    </div>
                    {!isOwned && (
                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          sfxCashOut();
                          sfxBuy();
                          dispatch({
                            type: 'BUY_LUXURY',
                            itemId: item.id,
                            price: item.price,
                            reputation: item.reputation,
                            happiness: item.happiness,
                          });
                        }}
                        className="w-full bg-crt-bg border border-amber-dim text-amber font-[family-name:var(--font-crt)] text-xs px-3 py-1.5 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_6px_rgba(255,176,0,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        BUY FOR ${item.price.toLocaleString()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── News Ticker ── */
function NewsTicker({ headline, sentiment, expenseMultiplier, expenseMultiplierExpiry }) {
  const borderColor = sentiment === 'positive' ? 'border-phosphor' : sentiment === 'negative' ? 'border-danger' : 'border-amber';
  const textColor = sentiment === 'positive' ? 'text-phosphor' : sentiment === 'negative' ? 'text-danger' : 'text-amber';
  const glowColor = sentiment === 'positive' ? 'rgba(51,255,51,0.15)' : sentiment === 'negative' ? 'rgba(255,51,51,0.15)' : 'rgba(255,176,0,0.15)';
  const label = sentiment === 'positive' ? 'GOOD NEWS' : sentiment === 'negative' ? 'BREAKING' : 'NEWS FLASH';

  return (
    <div className={`bg-crt-dark border ${borderColor} rounded-lg overflow-hidden shadow-[0_0_15px_${glowColor}] mb-4`}>
      <div className="flex items-center">
        {/* Label badge */}
        <div className={`px-3 py-2 ${sentiment === 'positive' ? 'bg-phosphor/10' : sentiment === 'negative' ? 'bg-danger/10' : 'bg-amber/10'} border-r ${borderColor} flex-shrink-0`}>
          <span className={`${textColor} text-[10px] font-bold tracking-widest`}>{label}</span>
        </div>
        {/* Scrolling headline */}
        <div className="flex-1 overflow-hidden py-2 px-2">
          <p className={`${textColor} text-xs font-bold whitespace-nowrap ticker-scroll`}>
            ★ {headline} ★
            {expenseMultiplier !== 1.0 && expenseMultiplierExpiry > 0 && (
              <span className="text-amber-dim ml-6">
                | COST OF LIVING: {expenseMultiplier > 1 ? '+' : ''}{Math.round((expenseMultiplier - 1) * 100)}% ({expenseMultiplierExpiry}mo remaining)
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Game Screen ── */
function GameScreen({ state, dispatch, onNewLife }) {
  const [tab, setTab] = useState('status')
  const [viewMode, setViewMode] = useState('crt') // 'crt' | 'world'
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [soundMuted, setSoundMuted] = useState(isMuted())
  const [soundVolume, setSoundVolume] = useState(getVolume())
  const totalValue = portfolioValue(state.portfolio, state.stocks)
  const propValue = totalPropertyValue(state.properties || [])
  const netWorth = +(state.cash + totalValue + propValue).toFixed(2)

  // Sound-trigger on log events (market crashes, booms, birthdays)
  const prevLogLen = useRef(state.log.length);
  useEffect(() => {
    if (state.log.length > prevLogLen.current) {
      const newEntries = state.log.slice(0, state.log.length - prevLogLen.current);
      for (const entry of newEntries) {
        if (entry.text.includes('Market Crash')) sfxCrash();
        else if (entry.text.includes('surges') && entry.text.includes('Bull run')) sfxBoom();
        else if (entry.text.includes('Happy Birthday')) sfxBirthday();
        else if (entry.text.includes('Health critical') || entry.text.includes('Happiness dropping')) sfxWarning();
      }
    }
    prevLogLen.current = state.log.length;
  }, [state.log.length]);

  // News ticker sound on headline change
  const prevHeadline = useRef(state.currentHeadline?.headline);
  useEffect(() => {
    if (state.currentHeadline && state.currentHeadline.headline !== prevHeadline.current) {
      sfxNewsTicker(state.currentHeadline.sentiment);
      prevHeadline.current = state.currentHeadline.headline;
    }
  }, [state.currentHeadline]);

  // Handle __ROLL__ sentinel
  useEffect(() => {
    if (state.pendingEvent === '__ROLL__') {
      const event = rollRandomEvent(state);
      dispatch({ type: 'SET_PENDING_EVENT', event });
    }
  }, [state.pendingEvent]);

  // Autosave every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.gameStarted && !state.gameOver && !state.pendingEvent) {
        doSave();
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [state]);

  const doSave = useCallback(() => {
    saveGame(state);
    sfxSave();
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }, [state]);

  const handleNextMonth = () => {
    sfxNextMonth();
    dispatch({ type: 'ADVANCE_MONTH' });
    // Save after advancing (use setTimeout so state has updated)
    setTimeout(() => {
      // We can't read the next state here, but the autosave + next render will catch it.
      // Instead, save current state — it's close enough. The real save happens on next autosave tick.
    }, 100);
  };

  // Save on every ADVANCE_MONTH (via effect on month change)
  const prevMonth = useRef(state.month);
  const prevYear = useRef(state.year);
  useEffect(() => {
    if (state.month !== prevMonth.current || state.year !== prevYear.current) {
      prevMonth.current = state.month;
      prevYear.current = state.year;
      if (state.gameStarted && !state.gameOver) {
        saveGame(state);
        sfxSave();
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
      }
    }
  }, [state.month, state.year]);

  const handleToggleMute = () => {
    const newMuted = !soundMuted;
    setSoundMuted(newMuted);
    setMuted(newMuted);
    saveSettings({ muted: newMuted, volume: soundVolume });
  };

  const handleVolumeChange = (val) => {
    setSoundVolume(val);
    setVolume(val);
    saveSettings({ muted: soundMuted, volume: val });
  };

  const handleNewLife = () => {
    setShowSettings(false);
    setShowConfirm(true);
  };

  const confirmNewLife = () => {
    setShowConfirm(false);
    onNewLife();
  };

  const showEvent = state.pendingEvent && state.pendingEvent !== '__ROLL__';

  const tabBtn = (id, label) => (
    <button onClick={() => { sfxTab(); setTab(id); }}
      className={`font-[family-name:var(--font-crt)] text-sm px-4 py-2 cursor-pointer transition-all border-b-2 ${
        tab === id
          ? 'text-phosphor border-phosphor'
          : 'text-phosphor-dim border-transparent hover:text-phosphor hover:border-phosphor-dim'
      }`}
    >{label}</button>
  )

  // 3D World mode
  if (viewMode === 'world') {
    return (
      <Suspense fallback={
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-phosphor font-[family-name:var(--font-crt)] text-xl animate-pulse text-glow">
            LOADING CITY...
          </div>
        </div>
      }>
        <World3D state={state} dispatch={dispatch} onExit={() => setViewMode('crt')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-crt-bg p-4">
      <SaveIndicator visible={saving} />
      {showEvent && <EventModal event={state.pendingEvent} dispatch={dispatch} />}
      {showSettings && (
        <SettingsMenu
          onClose={() => setShowSettings(false)}
          onNewLife={handleNewLife}
          soundMuted={soundMuted}
          onToggleMute={handleToggleMute}
          soundVolume={soundVolume}
          onVolumeChange={handleVolumeChange}
        />
      )}
      {showConfirm && (
        <ConfirmModal
          title="╔══ NEW LIFE ══╗"
          message="Erase all progress and start over from 1980? This cannot be undone."
          onConfirm={confirmNewLife}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* News Ticker */}
        {state.currentHeadline && (
          <NewsTicker
            headline={state.currentHeadline.headline}
            sentiment={state.currentHeadline.sentiment}
            expenseMultiplier={state.expenseMultiplier}
            expenseMultiplierExpiry={state.expenseMultiplierExpiry}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="crt-screen bg-crt-dark border-2 border-crt-border rounded-lg shadow-[0_0_30px_rgba(51,255,51,0.1)]">
            {/* Header */}
            <div className="border-b border-crt-border p-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h1 className="text-phosphor text-xl font-bold text-glow tracking-wider">EIGHTIES TYCOON</h1>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-amber">{getMonthName(state.month)} {state.year}</span>
                  <span className="text-phosphor-dim">AGE {state.age}</span>
                  <span className="text-amber-dim">{state.reputation || 0} REP</span>
                  <span className="text-phosphor">${netWorth.toLocaleString()}</span>
                  <button onClick={() => { sfxClick(); setViewMode('world'); }}
                    className="bg-crt-bg border border-amber-dim text-amber font-[family-name:var(--font-crt)] text-[10px] px-2 py-1 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_6px_rgba(255,176,0,0.2)] transition-all"
                  >3D CITY</button>
                  <button onClick={() => { sfxClick(); setShowSettings(true); }}
                    className="text-phosphor-dim hover:text-phosphor transition-colors cursor-pointer text-lg leading-none" title="Settings"
                  >⚙</button>
                </div>
              </div>
            </div>

            {/* Next Month Button */}
            <div className="p-3 border-b border-crt-border bg-crt-bg">
              <button onClick={handleNextMonth}
                disabled={!!state.pendingEvent}
                className="w-full bg-crt-bg border-2 border-phosphor text-phosphor font-[family-name:var(--font-crt)] text-base px-4 py-3 rounded cursor-pointer hover:bg-phosphor hover:text-crt-bg transition-all text-glow font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
              >{'>>>'} NEXT MONTH {'>>>'}</button>
            </div>

            {/* Vital bars */}
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
              {tabBtn('realestate', '[ REAL ESTATE ]')}
              {tabBtn('luxury', '[ LUXURY ]')}
            </div>

            <div className="p-4">
              {tab === 'status' && <StatusPanel state={state} dispatch={dispatch} />}
              {tab === 'portfolio' && <PortfolioPanel state={state} dispatch={dispatch} />}
              {tab === 'realestate' && <RealEstatePanel state={state} dispatch={dispatch} />}
              {tab === 'luxury' && <LuxuryShopPanel state={state} dispatch={dispatch} />}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="lg:sticky lg:top-4 h-[calc(100vh-2rem)]">
            <LifeLog log={state.log} />
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

/* ── App Root ── */
function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)
  const [initialized, setInitialized] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings();
    if (settings) {
      if (settings.muted !== undefined) setMuted(settings.muted);
      if (settings.volume !== undefined) setVolume(settings.volume);
    }
    setInitialized(true);
  }, []);

  const savedState = loadGame();
  const savedName = savedState?.playerName || null;

  const handleLoad = () => {
    const save = loadGame();
    if (save) {
      dispatch({ type: 'LOAD_SAVE', state: save });
    }
  };

  const handleNewLife = () => {
    sfxReset();
    deleteSave();
    dispatch({ type: 'RESET' });
  };

  if (!initialized) return null;

  if (!state.gameStarted) {
    return (
      <NameEntry
        onStart={(name) => { deleteSave(); dispatch({ type: 'START_GAME', name }); }}
        onLoad={handleLoad}
        savedName={savedName}
        savedState={savedState}
      />
    );
  }

  if (state.gameOver) {
    return <GameOverScreen state={state} dispatch={dispatch} onNewLife={handleNewLife} />
  }

  return <GameScreen state={state} dispatch={dispatch} onNewLife={handleNewLife} />
}

export default App
