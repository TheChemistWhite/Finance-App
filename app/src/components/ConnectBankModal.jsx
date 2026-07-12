import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { CloseIcon, SpinnerIcon } from './icons.jsx'

// Mock "Link" flow: with a real provider (Plaid/TrueLayer/Tink) this modal
// would instead be their own hosted, secure UI — the user types their bank
// credentials directly into the provider's page/SDK, never into this app,
// and we only ever get back a short-lived public token to exchange.
export default function ConnectBankModal({ onClose, onConnected }) {
  const [institutions, setInstitutions] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [connectingId, setConnectingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .listInstitutions()
      .then(({ institutions }) => {
        if (!cancelled) setInstitutions(institutions)
      })
      .catch(() => {
        if (!cancelled) setError('Impossibile caricare le banche disponibili.')
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handlePick(inst) {
    setConnectingId(inst.institutionId)
    setError('')
    try {
      await api.createLinkToken()
      await api.exchangeToken({
        publicToken: `mock-public-${Date.now()}`,
        institutionId: inst.institutionId,
      })
      onConnected()
      onClose()
    } catch (err) {
      setError(err.message || 'Connessione non riuscita.')
      setConnectingId(null)
    }
  }

  return (
    <div className="modal-scrim" onClick={onClose} role="presentation">
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">Collega una banca</span>
          <button className="modal-close" onClick={onClose} aria-label="Chiudi">
            <CloseIcon width={16} height={16} />
          </button>
        </div>

        <div className="modal-note">
          Demo con dati simulati. Con un provider reale collegato (Plaid/TrueLayer/Tink) qui
          si apre la loro schermata sicura: l'app non vede né conserva mai le tue credenziali
          bancarie.
        </div>

        {loadingList && <div className="modal-loading">Caricamento…</div>}
        {error && <div className="modal-error">{error}</div>}

        <div className="modal-list">
          {institutions.map((inst) => (
            <button
              key={inst.institutionId}
              className="modal-inst-row"
              onClick={() => handlePick(inst)}
              disabled={connectingId !== null}
            >
              <span className="modal-inst-ic" style={{ background: inst.gradient }} />
              <span className="modal-inst-text">
                <span className="modal-inst-name">{inst.name}</span>
                <span className="modal-inst-type">{inst.type}</span>
              </span>
              {connectingId === inst.institutionId && (
                <SpinnerIcon width={16} height={16} className="spin" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
