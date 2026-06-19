import { useState } from 'react'
import { contactAPI } from '../../api'
import { useFetch } from '../../hooks/useFetch'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { Mail, MailOpen, RefreshCw, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminContacts() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const params = { page, ...(filter !== '' ? { is_read: filter } : {}) }
  const { data, loading, refetch } = useFetch(
    () => contactAPI.adminGetAll(params),
    [page, filter]
  )
  const contacts = data?.contacts || []
  const pagination = data?.pagination

  const handleMarkRead = async (id) => {
    try {
      await contactAPI.adminMarkRead(id)
      toast.success('Marked as read')
      refetch()
      if (selected?.id === id) setSelected(s => ({ ...s, is_read: true }))
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-600 font-display">Contact Messages</h1>
          <p className="text-surface-500 text-sm mt-0.5">Customer inquiries and feedback</p>
        </div>
        <button onClick={refetch} className="btn-secondary text-sm py-2 px-3">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[['', 'All'], ['false', 'Unread'], ['true', 'Read']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setFilter(val); setPage(1) }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === val
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-surface-200 text-surface-600 hover:border-brand-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : (
        <>
          {contacts.length === 0 ? (
            <div className="card text-center py-16 text-surface-400">
              <Mail size={40} className="mx-auto mb-3 opacity-40" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`card cursor-pointer hover:shadow-md transition-all border-l-4 p-4 ${
                    c.is_read ? 'border-l-surface-300' : 'border-l-brand-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        c.is_read ? 'bg-surface-100' : 'bg-brand-50'
                      }`}>
                        {c.is_read
                          ? <MailOpen size={14} className="text-surface-400" />
                          : <Mail size={14} className="text-brand-600" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-sm ${c.is_read ? 'text-surface-700' : 'text-surface-900'}`}>
                            {c.name}
                          </p>
                          {!c.is_read && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
                        </div>
                        <p className="text-xs text-surface-500">{c.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-surface-700">{c.subject}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{formatDateTime(c.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-surface-500 mt-2 line-clamp-1 pl-11">{c.message}</p>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button disabled={!pagination.has_prev} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40">← Prev</button>
              <span className="px-4 py-1.5 text-sm text-surface-500 font-medium">{pagination.current_page} / {pagination.pages}</span>
              <button disabled={!pagination.has_next} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Message Detail">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['From', selected.name],
                ['Email', selected.email],
                ['Phone', selected.phone || '—'],
                ['Received', formatDateTime(selected.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface-50 rounded-xl p-3">
                  <p className="text-xs text-surface-400 uppercase font-semibold">{k}</p>
                  <p className="font-semibold text-surface-900 text-sm mt-0.5 break-all">{v}</p>
                </div>
              ))}
            </div>

            <div className="bg-surface-50 rounded-xl p-3">
              <p className="text-xs text-surface-400 uppercase font-semibold mb-1">Subject</p>
              <p className="font-semibold text-surface-900">{selected.subject}</p>
            </div>

            <div className="bg-surface-50 rounded-xl p-4">
              <p className="text-xs text-surface-400 uppercase font-semibold mb-2">Message</p>
              <p className="text-sm text-surface-800 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>

            <div className="flex gap-3">
              {!selected.is_read && (
                <button
                  onClick={() => handleMarkRead(selected.id)}
                  className="btn-primary flex-1 justify-center"
                >
                  <MailOpen size={15} /> Mark as Read
                </button>
              )}
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                className="btn-secondary flex-1 justify-center"
              >
                <Mail size={15} /> Reply by Email
              </a>
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3">
                  <Phone size={15} />
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
