import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

function Field({ label, color, multiline, ...props }) {
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <label className="block">
      <span className="block text-xs tracking-[0.18em] uppercase mb-2" style={{ color, opacity: 0.6 }}>
        {label}
      </span>
      <Tag
        {...props}
        style={{
          width: '100%',
          padding: '0.65rem 0.9rem',
          fontSize: '0.9rem',
          color: '#e2e8f0',
          background: 'rgba(148,163,184,0.06)',
          border: '1px solid rgba(148,163,184,0.25)',
          borderRadius: '0.375rem',
          outline: 'none',
          transition: 'border-color 0.2s ease, background 0.2s ease',
          ...(multiline && { resize: 'none' }),
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = `${color}90`
          e.currentTarget.style.background = 'rgba(148,163,184,0.1)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(148,163,184,0.25)'
          e.currentTarget.style.background = 'rgba(148,163,184,0.06)'
        }}
      />
    </label>
  )
}

export default function EmailComposeCard({ open, onClose, color = '#60a5fa' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open && !closing) return null

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
      setStatus('idle')
      setName('')
      setEmail('')
      setMessage('')
      setHoneypot('')
    }, 280)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (honeypot) {
      setStatus('success')
      return
    }
    setStatus('sending')
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        from_name: name,
        reply_to: email,
        message,
      }, PUBLIC_KEY)
      setStatus('success')
    } catch (err) {
      console.error('EmailJS error:', err)
      setStatus('error')
    }
  }

  return createPortal(
    <div
      data-nodepanel
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'rgba(5,12,31,0.6)',
        backdropFilter: 'blur(4px)',
        opacity: closing ? 0 : 1,
        transition: 'opacity 0.28s ease',
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        className="holo-panel holo-scan relative"
        style={{
          color,
          width: '440px',
          maxWidth: '90vw',
          animation: closing ? 'none' : 'holo-deploy 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, flicker 6s 0.6s infinite',
          opacity: closing ? 0 : 1,
          transform: closing ? 'translateY(-10px) scale(0.96)' : 'none',
          transition: 'opacity 0.28s ease, transform 0.28s ease',
        }}
      >
        <div
          className="relative rounded-md p-px"
          style={{
            background: `linear-gradient(135deg, ${color}90, ${color}20, ${color}70)`,
            boxShadow: `0 0 18px ${color}50, 0 0 40px ${color}25, inset 0 0 12px ${color}15`,
          }}
        >
          <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 rounded-tl-md pointer-events-none" style={{ borderColor: color }} />
          <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 rounded-tr-md pointer-events-none" style={{ borderColor: color }} />
          <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 rounded-bl-md pointer-events-none" style={{ borderColor: color }} />
          <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 rounded-br-md pointer-events-none" style={{ borderColor: color }} />

          <div className="relative rounded-md" style={{ background: 'rgba(5,12,31,0.86)', backdropFilter: 'blur(16px)' }}>
            <div
              className="absolute inset-0 pointer-events-none z-0 rounded-md"
              style={{ backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.018) 3px,rgba(255,255,255,0.018) 4px)` }}
            />
            <div
              className="absolute inset-x-0 h-px pointer-events-none z-20"
              style={{
                background: `linear-gradient(90deg, transparent, ${color}dd, ${color}, ${color}dd, transparent)`,
                boxShadow: `0 0 10px 3px ${color}55`,
                animation: closing ? 'none' : 'holo-scanline-sweep 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            />

            <div className="relative z-10 px-8 pt-7 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-base font-medium tracking-[0.22em] uppercase" style={{ color, opacity: 0.6 }}>
                    Transmisión
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-100 mt-1">Enviar mensaje</h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-200 transition-colors text-base"
                  style={{ border: '1px solid rgba(148,163,184,0.2)' }}
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 h-px" style={{ background: `linear-gradient(90deg, ${color}70, transparent)` }} />
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 px-8 pb-8 space-y-4">
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, opacity: 0 }}
              />

              <Field
                label="Nombre" color={color} type="text" required
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
              <Field
                label="Tu correo" color={color} type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
              />
              <Field
                label="Mensaje" color={color} multiline rows={4} required
                value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntame sobre tu proyecto u oportunidad…"
              />

              <button
                type="submit"
                disabled={status === 'sending' || status === 'success'}
                className="w-full py-3 rounded text-sm font-semibold tracking-wide uppercase transition-all duration-200 disabled:cursor-not-allowed"
                style={{
                  color: status === 'success' ? '#34d399' : '#0a0f24',
                  background: status === 'success' ? '#34d39920' : status === 'sending' ? `${color}80` : color,
                  border: status === 'success' ? '1px solid #34d39960' : 'none',
                  opacity: status === 'sending' ? 0.7 : 1,
                }}
              >
                {status === 'idle' && 'Enviar transmisión'}
                {status === 'sending' && 'Enviando…'}
                {status === 'success' && '✓ Mensaje enviado'}
                {status === 'error' && 'Error — reintentar'}
              </button>

              {status === 'error' && (
                <p className="text-xs text-center" style={{ color: '#f87171' }}>
                  No se pudo enviar. Intentá de nuevo o escribime directo a dcalderon918@gmail.com
                </p>
              )}
              {status === 'success' && (
                <p className="text-xs text-center text-slate-400">
                  Gracias por escribir — te responderé pronto.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
