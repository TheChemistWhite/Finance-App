import { useState } from 'react'
import {
  BackIcon,
  ChevronRight,
  MoonIcon,
  BellIcon,
  EyeOffIcon,
  EyeIcon,
  LockIcon,
  CardsIcon,
  GlobeIcon,
  LogOutIcon,
} from './icons.jsx'

function Toggle({ on, onToggle }) {
  return (
    <button
      className={`switch${on ? ' on' : ''}`}
      onClick={onToggle}
      role="switch"
      aria-checked={on}
    >
      <span className="knob" />
    </button>
  )
}

function ToggleRow({ Icon, iconBg, label, on, onToggle }) {
  return (
    <div className="set-row">
      <span className="set-ic" style={{ background: iconBg }}>
        <Icon width={16} height={16} />
      </span>
      <span className="set-label">{label}</span>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

function NavRow({ Icon, iconBg, label, sub, onClick }) {
  return (
    <div
      className="set-row set-row-nav"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <span className="set-ic" style={{ background: iconBg }}>
        <Icon width={16} height={16} />
      </span>
      <span className="set-label">
        {label}
        {sub && <span className="set-label-sub">{sub}</span>}
      </span>
      <ChevronRight className="set-chev" />
    </div>
  )
}

export default function SettingsScreen({ onBack, hidden, onToggleHidden, bankCount, onOpenConnectedBanks, onLogout }) {
  const [nightMode, setNightMode] = useState(true)
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="scr-body fade-in">
      <div className="topbar">
        <button className="back" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <span className="topbar-title">Settings</span>
      </div>

      {/* Preferences */}
      <div className="card set-card">
        <ToggleRow
          Icon={MoonIcon}
          iconBg="linear-gradient(135deg,#8b5cf6,#5b21b6)"
          label="Night Mode"
          on={nightMode}
          onToggle={() => setNightMode((v) => !v)}
        />
        <ToggleRow
          Icon={BellIcon}
          iconBg="linear-gradient(135deg,#22d3ee,#0e7490)"
          label="Notifications"
          on={notifications}
          onToggle={() => setNotifications((v) => !v)}
        />
        <ToggleRow
          Icon={hidden ? EyeOffIcon : EyeIcon}
          iconBg="linear-gradient(135deg,#fbbf24,#b45309)"
          label="Hide Balances"
          on={hidden}
          onToggle={onToggleHidden}
        />
      </div>

      {/* Account */}
      <div className="card set-card">
        <NavRow
          Icon={LockIcon}
          iconBg="linear-gradient(135deg,#fb7185,#9f1239)"
          label="Security & Privacy"
        />
        <NavRow
          Icon={CardsIcon}
          iconBg="linear-gradient(135deg,#818cf8,#4338ca)"
          label="Connected Banks"
          sub={`${bankCount} ${bankCount === 1 ? 'bank' : 'banks'}`}
          onClick={onOpenConnectedBanks}
        />
        <NavRow
          Icon={GlobeIcon}
          iconBg="linear-gradient(135deg,#34d399,#047857)"
          label="Currency & Region"
        />
      </div>

      <button className="set-logout" onClick={onLogout}>
        <LogOutIcon width={16} height={16} />
        Log Out
      </button>
    </div>
  )
}
