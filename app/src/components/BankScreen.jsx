import { useState } from 'react'
import { eur } from '../data.js'
import { shade } from '../utils.js'
import AreaChart from './AreaChart.jsx'
import DonutChart from './DonutChart.jsx'
import { BackIcon } from './icons.jsx'

const RANGES = ['1W', '1M', '1Y', 'ALL']

export default function BankScreen({ bank, onBack, hidden }) {
  const [range, setRange] = useState('1Y')
  const total = bank.categories.reduce((s, c) => s + c.value, 0)
  const heroUp = bank.changePct >= 0
  const rangeUp = bank.rangeReturn[range] >= 0

  return (
    <div className="scr-body fade-in">
      <div className="topbar">
        <button className="back" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <span className="topbar-title">{bank.name}</span>
      </div>

      {/* Hero balance + line chart */}
      <div className="inv-hero">
        <div className={`inv-total num${hidden ? ' amount-hidden' : ''}`}>{eur(bank.balance)}</div>
        <div className="inv-sub">
          <span className={`badge ${heroUp ? 'pos' : 'neg'} num`}>
            {heroUp ? '▲' : '▼'} {Math.abs(bank.changePct)}%
          </span>
          <span className="muted">
            {bank.type} ·· {bank.last4}
          </span>
        </div>
      </div>

      <AreaChart series={bank.series[range]} height={140} keyId={range} stroke={bank.accent} />

      <div className="range" style={{ marginTop: 14 }}>
        {RANGES.map((r) => (
          <button
            key={r}
            className={`range-btn${range === r ? ' on' : ''}`}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="section-hint" style={{ marginTop: 8 }}>
        <span>{range} change</span>
        <span className={`num ${rangeUp ? 'pos' : 'neg'}`} style={{ fontWeight: 700 }}>
          {rangeUp ? '+' : ''}
          {bank.rangeReturn[range]}%
        </span>
      </div>

      {/* Spending breakdown donut */}
      <div className="card">
        <div className="card-title">Spending by Category</div>
        <div className="alloc">
          <DonutChart data={bank.categories} label="SPENDING" centerValue={bank.categories.length} />
          <div className="legend">
            {bank.categories.map((c) => (
              <div className="legend-row" key={c.id}>
                <span className="legend-dot" style={{ background: c.color }} />
                <div>
                  <div className="legend-name">{c.name}</div>
                  <div className={`legend-sub${hidden ? ' amount-hidden' : ''}`}>
                    {eur(c.value, { cents: false })}
                  </div>
                </div>
                <span className="legend-pct num">
                  {Math.round((c.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="card-title">Recent Transactions</div>
        {bank.transactions.map((t) => (
          <div className="holding" key={t.id}>
            <span
              className="holding-ic"
              style={{ background: `linear-gradient(135deg, ${t.color}, ${shade(t.color)})` }}
            >
              {t.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <div className="holding-name">{t.name}</div>
              <div className="holding-sh">{t.date}</div>
            </div>
            <div className="holding-val">
              <div
                className={`holding-bal num${t.amount >= 0 ? ' pos' : ''}${hidden ? ' amount-hidden' : ''}`}
              >
                {t.amount >= 0 ? '+' : ''}
                {eur(t.amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
