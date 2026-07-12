import { useState } from 'react'
import { eur } from '../data.js'
import { BackIcon, PlusIcon, TrashIcon } from './icons.jsx'
import ConnectBankModal from './ConnectBankModal.jsx'
import { api } from '../services/api.js'

// Lets you see and manage exactly which banks are connected. Disconnecting
// (e.g. you closed an account) or connecting a new one both go through the
// backend and then re-fetch the list — the app never keeps its own
// separate/stale count.
export default function ConnectedBanksScreen({ banks, onBack, onChanged }) {
  const [showModal, setShowModal] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [error, setError] = useState('')

  async function handleRemove(id) {
    setRemovingId(id)
    setError('')
    try {
      await api.removeAccount(id)
      onChanged()
    } catch (err) {
      setError(err.message || 'Rimozione non riuscita.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="scr-body fade-in">
      <div className="topbar">
        <button className="back" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <span className="topbar-title">Connected Banks</span>
      </div>

      {error && <div className="modal-error" style={{ marginTop: 12 }}>{error}</div>}

      {banks.length === 0 ? (
        <div className="cb-empty">Nessuna banca collegata ancora.</div>
      ) : (
        <div className="card set-card">
          {banks.map((b) => (
            <div className="set-row" key={b.id}>
              <span className="cb-dot" style={{ background: b.gradient }} />
              <span className="set-label">
                {b.name}
                <span className="set-label-sub">
                  {b.type} ·· {b.last4} · {eur(b.balance)}
                </span>
              </span>
              <button
                className="cb-remove"
                onClick={() => handleRemove(b.id)}
                disabled={removingId === b.id}
                aria-label={`Disconnect ${b.name}`}
              >
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button className="cb-add" onClick={() => setShowModal(true)}>
        <PlusIcon width={16} height={16} strokeWidth={2.2} />
        Connect a bank
      </button>

      {showModal && (
        <ConnectBankModal onClose={() => setShowModal(false)} onConnected={onChanged} />
      )}
    </div>
  )
}
