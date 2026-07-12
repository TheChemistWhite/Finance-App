import { useState } from 'react'
import { investments, holdings, perfSeries, rangeReturn, eur } from '../data.js'
import { shade } from '../utils.js'
import AreaChart from './AreaChart.jsx'
import DonutChart from './DonutChart.jsx'
import { BackIcon, EyeIcon, EyeOffIcon } from './icons.jsx'

const RANGES = ['1W', '1M', '1Y', 'ALL']

export default function InvestmentsScreen({ onBack, hidden, onToggleHidden }) {
  const [range, setRange] = useState('1Y')
  const total = holdings.reduce((s, h) => s + h.value, 0)

  return (
    <div className="scr-body fade-in">
      <div className="topbar">
        <button className="back" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <span className="topbar-title">Investments</span>
        <button
          className="hide-toggle"
          onClick={onToggleHidden}
          aria-label={hidden ? 'Show amounts' : 'Hide amounts'}
        >
          {hidden ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
        </button>
      </div>

      {/* Hero value + line chart */}
      <div className="inv-hero">
        <div className={`inv-total num${hidden ? ' amount-hidden' : ''}`}>{eur(investments.total)}</div>
        <div className="inv-sub">
          <span className="badge pos num">▲ +{investments.changePct}%</span>
          <span className="muted">all time</span>
        </div>
      </div>

      <AreaChart series={perfSeries[range]} height={140} keyId={range} />

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
        <span>{range} return</span>
        <span className="num pos" style={{ fontWeight: 700 }}>
          +{rangeReturn[range]}%
        </span>
      </div>

      {/* Allocation donut */}
      <div className="card">
        <div className="card-title">Allocation</div>
        <div className="alloc">
          <DonutChart data={holdings} />
          <div className="legend">
            {holdings.map((h) => (
              <div className="legend-row" key={h.id}>
                <span className="legend-dot" style={{ background: h.color }} />
                <div>
                  <div className="legend-name">{h.ticker}</div>
                  <div className={`legend-sub${hidden ? ' amount-hidden' : ''}`}>
                    {eur(h.value, { cents: false })}
                  </div>
                </div>
                <span className="legend-pct num">
                  {Math.round((h.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings list */}
      <div className="card">
        <div className="card-title">Holdings</div>
        {holdings.map((h) => (
          <div className="holding" key={h.id}>
            <span
              className="holding-ic"
              style={{ background: `linear-gradient(135deg, ${h.color}, ${shade(h.color)})` }}
            >
              {h.ticker.slice(0, 2)}
            </span>
            <div>
              <div className="holding-name">{h.name}</div>
              <div className="holding-sh">{h.shares}</div>
            </div>
            <div className="holding-val">
              <div className={`holding-bal num${hidden ? ' amount-hidden' : ''}`}>{eur(h.value)}</div>
              <div className={`holding-chg num ${h.changePct >= 0 ? 'pos' : 'neg'}`}>
                {h.changePct >= 0 ? '▲' : '▼'} {Math.abs(h.changePct)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
