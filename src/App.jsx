import { useReducer, useState } from 'react'
import { INITIAL_STATE, gameReducer, getMonthName } from './gameState'
import './App.css'

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
        <p className="text-phosphor-dim text-center mb-8 text-sm">
          ══════════════════════════
        </p>
        <p className="text-phosphor text-center mb-6">
          {'>'} ENTER YOUR NAME TO BEGIN_
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
            className="bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-lg px-4 py-2 rounded outline-none focus:border-phosphor focus:shadow-[0_0_10px_rgba(51,255,51,0.2)] placeholder:text-phosphor-dim"
            placeholder="PLAYER NAME"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="bg-crt-bg border border-phosphor text-phosphor font-[family-name:var(--font-crt)] text-lg px-4 py-2 rounded cursor-pointer hover:bg-phosphor hover:text-crt-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            [ START GAME ]
          </button>
        </form>
        <p className="text-phosphor-dim text-xs text-center mt-8">
          © 1980 TYCOON SYSTEMS INC.
        </p>
      </div>
    </div>
  )
}

function StatBar({ label, value, max, color = 'phosphor' }) {
  const pct = Math.round((value / max) * 100)
  const barColor = color === 'amber' ? 'bg-amber' : color === 'danger' ? 'bg-danger' : 'bg-phosphor'
  const textColor = color === 'amber' ? 'text-amber' : color === 'danger' ? 'text-danger' : 'text-phosphor'

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className={textColor}>{label}</span>
        <span className={textColor}>{value}{max === 100 ? '%' : ''}</span>
      </div>
      <div className="w-full bg-crt-bg rounded h-3 border border-crt-border overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%`, boxShadow: `0 0 6px currentColor` }}
        />
      </div>
    </div>
  )
}

function GameScreen({ state, dispatch }) {
  const healthColor = state.health > 60 ? 'phosphor' : state.health > 30 ? 'amber' : 'danger'

  return (
    <div className="min-h-screen bg-crt-bg p-4 flex flex-col items-center">
      <div className="crt-screen bg-crt-dark border-2 border-crt-border rounded-lg w-full max-w-2xl shadow-[0_0_30px_rgba(51,255,51,0.1)]">
        {/* Header */}
        <div className="border-b border-crt-border p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-phosphor text-xl font-bold text-glow tracking-wider">
              EIGHTIES TYCOON
            </h1>
            <span className="text-phosphor-dim text-sm">
              v1.0
            </span>
          </div>
        </div>

        {/* Status Panel */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Player Info */}
          <div className="border border-crt-border rounded p-4">
            <p className="text-phosphor-dim text-xs mb-3">═══ PLAYER STATUS ═══</p>
            <p className="text-phosphor mb-2">
              <span className="text-phosphor-dim">NAME: </span>
              {state.playerName.toUpperCase()}
            </p>
            <p className="text-amber mb-2">
              <span className="text-amber-dim">DATE: </span>
              {getMonthName(state.month)} {state.year}
            </p>
            <p className="text-phosphor mb-4">
              <span className="text-phosphor-dim">CASH: </span>
              <span className="text-glow">${state.cash.toLocaleString()}</span>
            </p>
            <StatBar label="HEALTH" value={state.health} max={100} color={healthColor} />
          </div>

          {/* Right: Actions */}
          <div className="border border-crt-border rounded p-4">
            <p className="text-phosphor-dim text-xs mb-3">═══ ACTIONS ═══</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => dispatch({ type: 'ADVANCE_MONTH' })}
                className="bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-phosphor hover:shadow-[0_0_8px_rgba(51,255,51,0.2)] transition-all text-left"
              >
                {'>'} ADVANCE MONTH
              </button>
              <button
                onClick={() => dispatch({ type: 'UPDATE_CASH', amount: 50 })}
                className="bg-crt-bg border border-phosphor-dim text-phosphor font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-phosphor hover:shadow-[0_0_8px_rgba(51,255,51,0.2)] transition-all text-left"
              >
                {'>'} WORK (+$50)
              </button>
              <button
                onClick={() => {
                  dispatch({ type: 'UPDATE_CASH', amount: -20 })
                  dispatch({ type: 'UPDATE_HEALTH', amount: 10 })
                }}
                className="bg-crt-bg border border-phosphor-dim text-amber font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-amber hover:shadow-[0_0_8px_rgba(255,176,0,0.2)] transition-all text-left"
              >
                {'>'} REST (-$20, +10% HP)
              </button>
              <button
                onClick={() => dispatch({ type: 'UPDATE_HEALTH', amount: -5 })}
                className="bg-crt-bg border border-phosphor-dim text-danger font-[family-name:var(--font-crt)] text-sm px-3 py-2 rounded cursor-pointer hover:border-danger hover:shadow-[0_0_8px_rgba(255,51,51,0.2)] transition-all text-left"
              >
                {'>'} HUSTLE (-5% HP)
              </button>
            </div>
          </div>
        </div>

        {/* Terminal Log */}
        <div className="border-t border-crt-border p-4">
          <p className="text-phosphor-dim text-xs mb-2">═══ SYSTEM LOG ═══</p>
          <p className="text-phosphor text-sm">
            {'>'} Welcome to {getMonthName(state.month)} {state.year}, {state.playerName}.
          </p>
          <p className="text-phosphor text-sm">
            {'>'} You have ${state.cash.toLocaleString()} and {state.health}% health.
          </p>
          <p className="text-phosphor-dim text-sm animate-pulse">
            {'>'} Awaiting command_
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)

  if (!state.gameStarted) {
    return <NameEntry onStart={(name) => dispatch({ type: 'START_GAME', name })} />
  }

  return <GameScreen state={state} dispatch={dispatch} />
}

export default App
