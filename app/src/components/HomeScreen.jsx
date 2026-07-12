import { useState } from 'react'
import { investments, perfSeries, eur } from '../data.js'
import AreaChart from './AreaChart.jsx'
import { ChevronDown, ChevronRight, EyeIcon, EyeOffIcon, CardsIcon } from './icons.jsx'

const RANGES = ['1W', '1M', '1Y']

export default function HomeScreen({
  banks,
  onOpenInvestments,
  onOpenBank,
  onGoConnectBanks,
  hidden,
  onToggleHidden,
}) {
  const [expanded, setExpanded] = useState(false)
  const [range, setRange] = useState('1W')

  // Always derived from however many accounts are actually connected right
  // now — never a fixed number baked into the app.
  const totalNetWorth = banks.reduce((s, b) => s + b.balance, 0) + investments.total
  const totalStr = eur(totalNetWorth, { cents: false })

  const handleCardClick = (id) => {
    // With only one bank there's nothing to fan out — go straight to its
    // detail page. With several, the first tap fans the stack out and only
    // a second tap (once expanded) opens a bank's detail page.
    if (banks.length > 1 && !expanded) {
      setExpanded(true)
    } else {
      onOpenBank(id)
    }
  }

  return (
    <div className="scr-body fade-in">
      <div className="eyebrow-row">
        <div className="eyebrow">
          Total balance · {banks.length} {banks.length === 1 ? 'bank' : 'banks'}
        </div>
        <button
          className="hide-toggle"
          onClick={onToggleHidden}
          aria-label={hidden ? 'Show amounts' : 'Hide amounts'}
        >
          {hidden ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
        </button>
      </div>
      <div className={`total num${hidden ? ' amount-hidden' : ''}`}>
        {totalStr.replace('€', '€')}
      </div>

      {banks.length === 0 ? (
        <button className="empty-banks" onClick={onGoConnectBanks}>
          <span className="empty-banks-ic">
            <CardsIcon width={22} height={22} />
          </span>
          <span className="empty-banks-title">Nessuna banca collegata</span>
          <span className="empty-banks-sub">Tocca per collegare il tuo primo conto</span>
        </button>
      ) : (
        <>
          {/* Stacked wallet cards */}
          <div className={`wallet${expanded ? ' expanded' : ''}`}>
            {banks.map((b) => (
              <div
                key={b.id}
                className="wc"
                style={{ background: b.gradient }}
                onClick={() => handleCardClick(b.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(b.id)}
              >
                <div className="wc-top">
                  <div>
                    <div className="wc-name">{b.name}</div>
                    <div className="wc-type">
                      {b.type} ·· {b.last4}
                    </div>
                  </div>
                  <span className="wc-chip">{b.type}</span>
                </div>
                <div className={`wc-bal num${hidden ? ' amount-hidden' : ''}`}>{eur(b.balance)}</div>
              </div>
            ))}
          </div>

          {banks.length > 1 && (
            <button className="wallet-toggle" onClick={() => setExpanded((e) => !e)}>
              {expanded ? 'Stack cards' : 'Fan out cards'}
              <ChevronDown
                style={{
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
          )}
        </>
      )}

      {/* Investments performance panel */}
      <div
        className="perf"
        onClick={onOpenInvestments}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpenInvestments()}
      >
        <div className="perf-head">
          <span className="perf-lbl">Investments</span>
          <span className="badge pos num">▲ +{investments.changePct}%</span>
        </div>
        <div className={`perf-val num${hidden ? ' amount-hidden' : ''}`}>{eur(investments.total)}</div>

        <AreaChart series={perfSeries[range]} height={64} keyId={range} showDot={false} />

        <div className="range" onClick={(e) => e.stopPropagation()}>
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

        <div className="section-hint">
          <span>See full breakdown</span>
          <ChevronRight />
        </div>
      </div>
    </div>
  )
}
