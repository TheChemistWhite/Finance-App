import { useEffect, useState } from 'react'
import { isBiometricSupported, isRegistered, registerBiometric, loginWithBiometric } from '../services/auth.js'
import { FingerprintIcon, AlertIcon } from './icons.jsx'
import Logo from './Logo.jsx'

// Full-screen gate shown before any account data ever loads. There is no
// way around this screen other than a real biometric assertion verified by
// the backend (see server/src/webauthn.js) — no PIN fallback baked into
// the app itself, no "skip for now".
export default function LockScreen({ onUnlock }) {
  const [phase, setPhase] = useState('checking') // checking | unsupported | needs-setup | locked | busy | error
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supported = await isBiometricSupported()
      if (cancelled) return
      if (!supported) {
        setPhase('unsupported')
        return
      }
      try {
        const registered = await isRegistered()
        if (cancelled) return
        setPhase(registered ? 'locked' : 'needs-setup')
      } catch {
        setError('Impossibile contattare il server. Verifica che sia in esecuzione.')
        setPhase('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSetup() {
    setPhase('busy')
    setError('')
    try {
      await registerBiometric()
      await loginWithBiometric()
      onUnlock()
    } catch (err) {
      setError(err.message || 'Impostazione non riuscita. Riprova.')
      setPhase('needs-setup')
    }
  }

  async function handleUnlock() {
    setPhase('busy')
    setError('')
    try {
      await loginWithBiometric()
      onUnlock()
    } catch (err) {
      setError(err.message || 'Autenticazione non riuscita. Riprova.')
      setPhase('locked')
    }
  }

  const busy = phase === 'busy' || phase === 'checking'

  return (
    <div className="lock-scr">
      <div className="lock-glow" />
      <div className="lock-body">
        <Logo size={52} align="center" />

        <div className="lock-icon-ring">
          <FingerprintIcon width={40} height={40} />
        </div>

        {phase === 'unsupported' && (
          <>
            <div className="lock-title">Sblocco biometrico non disponibile</div>
            <div className="lock-sub">
              Questo dispositivo/browser non espone un'autenticazione biometrica (Face ID, Touch ID o
              impronta). Aprilo su un telefono o un browser con Windows Hello/Touch ID configurato.
            </div>
          </>
        )}

        {phase === 'needs-setup' && (
          <>
            <div className="lock-title">Configura l'accesso</div>
            <div className="lock-sub">Associa questo dispositivo con Face ID o l'impronta digitale per proteggere i tuoi dati finanziari.</div>
            <button className="lock-btn" onClick={handleSetup} disabled={busy}>
              {busy ? 'Attendi…' : 'Configura Face ID / Impronta'}
            </button>
          </>
        )}

        {(phase === 'locked' || phase === 'checking') && (
          <>
            <div className="lock-title">{phase === 'checking' ? 'Verifica…' : 'App bloccata'}</div>
            <div className="lock-sub">Sblocca con Face ID o l'impronta per continuare.</div>
            {phase === 'locked' && (
              <button className="lock-btn" onClick={handleUnlock} disabled={busy}>
                {busy ? 'Verifica…' : 'Sblocca'}
              </button>
            )}
          </>
        )}

        {phase === 'error' && (
          <>
            <div className="lock-title">Connessione non riuscita</div>
            <div className="lock-sub">{error}</div>
          </>
        )}

        {error && phase !== 'error' && (
          <div className="lock-error">
            <AlertIcon width={15} height={15} />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
