import { useState } from 'react'
import { contactAPI } from '../api'
import { getErrorMessage } from '../utils/helpers'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'

const SUBJECTS = [
  'General Inquiry', 'Service Information', 'Pricing', 'Complaint',
  'Feedback', 'Technical Issue', 'Booking Help', 'Other'
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await contactAPI.submit(form)
      setSent(true)
      toast.success('Message sent! We\'ll reply soon.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface-900 to-brand-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-3">Get in Touch</h1>
          <p className="text-surface-300 text-lg">We're here to help — reach out anytime</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card">
              <h2 className="font-bold text-surface-900 mb-5 text-lg font-display">Contact Information</h2>
              <ul className="space-y-4">
                {[
                  { icon: MapPin, label: 'Address', value: '123 Main Road, Near Bus Stand, Patna, Bihar 800001', href: null },
                  { icon: Phone, label: 'Phone', value: '+91 99999 99999', href: 'tel:+919999999999' },
                  { icon: Mail, label: 'Email', value: 'info@netzone.in', href: 'mailto:info@netzone.in' },
                  { icon: Clock, label: 'Hours', value: 'Mon–Sat 8AM–10PM\nSunday 9AM–8PM', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={15} className="text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm text-surface-800 hover:text-brand-600 transition-colors font-medium">{value}</a>
                      ) : (
                        <p className="text-sm text-surface-800 font-medium whitespace-pre-line">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* WhatsApp CTA */}
            <div className="card bg-green-50 border-green-200">
              <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <MessageSquare size={16} /> Quick Chat on WhatsApp
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Need immediate help? Chat with us directly on WhatsApp for fastest response.
              </p>
              <a
                href="https://wa.me/919999999999?text=Hi%Shaurya%eServices%2C%20I%20need%20assistance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Start WhatsApp Chat
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="card text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-surface-900 font-display mb-2">Message Received!</h3>
                <p className="text-surface-500 mb-6">We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                  className="btn-secondary"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="card">
                <h2 className="font-bold text-surface-900 mb-6 text-lg font-display">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Rahul Kumar"
                        required
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Phone <span className="text-surface-400 font-normal">(optional)</span></label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 99999 99999"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Subject</label>
                      <select name="subject" value={form.subject} onChange={handleChange} required className="input">
                        <option value="">Select subject…</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your inquiry in detail…"
                      rows={5}
                      required
                      className="input resize-none"
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                    {loading ? <><LoadingSpinner size="sm" /> Sending…</> : <><Send size={15} /> Send Message</>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
