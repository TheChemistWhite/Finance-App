import { useCallback, useEffect, useState } from 'react'
import StatusBar from './components/StatusBar.jsx'
import TabBar from './components/TabBar.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import InvestmentsScreen from './components/InvestmentsScreen.jsx'
import BankScreen from './components/BankScreen.jsx'
import SettingsScreen from './components/SettingsScreen.jsx'
import ConnectedBanksScreen from './components/ConnectedBanksScreen.jsx'
import LockScreen from './components/LockScreen.jsx'
import LoadingOverlay from './components/LoadingOverlay.jsx'
import { api } from './services/api.js'
import { logout as clearSession } from './services/auth.js'

// Duration of the exit animation played before a "back" action actually
// swaps the screen — keep in sync with the .screen-anim.leaving keyframes.
const EXIT_MS = 220
// Floor so the loading ring never just flashes on a very fast network.
const MIN_LOADING_MS = 650

// Maps a raw backend account (server/src/store.js `listPublicAccounts`)
// onto the shape the existing Home/Bank screens were built around.
function toWallet(a) {
  return {
    id: a.id,
    name: a.institutionName,
    type: a.type,
    last4: a.mask,
    currency: a.currency,
    balance: a.balance,
    gradient: a.gradient,
    accent: a.accentColor,
    changePct: a.changePct,
    series: a.series,
    rangeReturn: a.rangeReturn,
    categories: a.categories,
    transactions: a.transactions,
  }
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [hydrating, setHydrating] = useState(false)
  const [banks, setBanks] = useState([])

  const [tab, setTab] = useState('home')
  const [bankId, setBankId] = useState(null)
  const [showConnectedBanks, setShowConnectedBanks] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [hideAmounts, setHideAmounts] = useState(false)

  // The one and only refresh point: called right after unlocking, and again
  // after connecting/disconnecting a bank. Never on a timer, never in the
  // background — see server/src/routes/accounts.js `/refresh`.
  const hydrate = useCallback(async () => {
    setHydrating(true)
    const started = Date.now()
    try {
      const { accounts } = await api.refresh()
      setBanks(accounts.map(toWallet))
    } catch {
      // Keep whatever we already had rather than blanking the screen on a
      // transient network error; Settings > Connected Banks can retry.
    } finally {
      const elapsed = Date.now() - started
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed))
      }
      setHydrating(false)
    }
  }, [])

  useEffect(() => {
    if (unlocked) hydrate()
  }, [unlocked, hydrate])

  const goBack = (apply) => {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => {
      apply()
      setLeaving(false)
    }, EXIT_MS)
  }

  const handleTabChange = (id) => {
    setTab(id)
    setBankId(null)
    setShowConnectedBanks(false)
  }

  const toggleHideAmounts = () => setHideAmounts((v) => !v)

  function handleLogout() {
    clearSession()
    setUnlocked(false)
    setBanks([])
    setTab('home')
    setBankId(null)
    setShowConnectedBanks(false)
  }

  if (!unlocked) {
    return (
      <div className="phone">
        <div className="notch" />
        <div className="screen">
          <div className="app-scr">
            <LockScreen onUnlock={() => setUnlocked(true)} />
          </div>
        </div>
      </div>
    )
  }

  let screen
  if (tab === 'home') {
    const bank = bankId ? banks.find((b) => b.id === bankId) : null
    if (bank) {
      screen = (
        <BankScreen bank={bank} onBack={() => goBack(() => setBankId(null))} hidden={hideAmounts} />
      )
    } else {
      screen = (
        <HomeScreen
          banks={banks}
          onOpenInvestments={() => setTab('investments')}
          onOpenBank={setBankId}
          onGoConnectBanks={() => {
            setTab('settings')
            setShowConnectedBanks(true)
          }}
          hidden={hideAmounts}
          onToggleHidden={toggleHideAmounts}
        />
      )
    }
  } else if (tab === 'investments') {
    screen = (
      <InvestmentsScreen
        onBack={() => goBack(() => setTab('home'))}
        hidden={hideAmounts}
        onToggleHidden={toggleHideAmounts}
      />
    )
  } else if (showConnectedBanks) {
    screen = (
      <ConnectedBanksScreen
        banks={banks}
        onBack={() => goBack(() => setShowConnectedBanks(false))}
        onChanged={hydrate}
      />
    )
  } else {
    screen = (
      <SettingsScreen
        onBack={() => goBack(() => setTab('home'))}
        hidden={hideAmounts}
        onToggleHidden={toggleHideAmounts}
        bankCount={banks.length}
        onOpenConnectedBanks={() => setShowConnectedBanks(true)}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div className="phone">
      <div className="notch" />
      <div className="screen">
        <div className="app-scr">
          <div className="glow" />
          <StatusBar />
          <div className={`screen-anim${leaving ? ' leaving' : ''}`}>{screen}</div>
          <TabBar active={tab} onChange={handleTabChange} />
          {hydrating && <LoadingOverlay />}
        </div>
      </div>
    </div>
  )
}
