import { HomeIcon, ChartIcon, SettingsIcon } from './icons.jsx'

const tabs = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'investments', label: 'Invest', Icon: ChartIcon },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
]

export default function TabBar({ active, onChange }) {
  return (
    <div className="navwrap">
      <nav className="tabbar">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`tab${active === id ? ' on' : ''}`}
            onClick={() => onChange(id)}
            aria-label={label}
          >
            <Icon />
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
