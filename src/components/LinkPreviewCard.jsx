import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function LinkPreviewCard({ open, onClose, color = '#60a5fa', title, embedUrl, originalUrl, linkLabel = 'Abrir página completa' }) {
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
    setTimeout(() => { setClosing(false); onClose() }, 280)
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
          width: '420px',
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

            <div className="relative z-10 px-7 pt-6 pb-4">
              <div className="flex justify-between items-center">
                <p className="text-base font-medium tracking-[0.22em] uppercase" style={{ color, opacity: 0.6 }}>
                  Vista previa
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-200 transition-colors text-base"
                  style={{ border: '1px solid rgba(148,163,184,0.2)' }}
                >
                  ✕
                </button>
              </div>
              <h2 className="text-xl font-semibold text-slate-100 mt-1">{title}</h2>
              <div className="mt-4 h-px" style={{ background: `linear-gradient(90deg, ${color}70, transparent)` }} />
            </div>

            <div className="relative z-10 px-7 pb-7">
              <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${color}30`, background: 'rgba(0,0,0,0.3)' }}>
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="352"
                  style={{ border: 0, display: 'block' }}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={title}
                />
              </div>

              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded transition-all duration-200"
                style={{
                  border: '1px solid rgba(148,163,184,0.25)',
                  color: '#94a3b8',
                  background: 'rgba(148,163,184,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148,163,184,0.5)'
                  e.currentTarget.style.color = '#e2e8f0'
                  e.currentTarget.style.background = 'rgba(148,163,184,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148,163,184,0.25)'
                  e.currentTarget.style.color = '#94a3b8'
                  e.currentTarget.style.background = 'rgba(148,163,184,0.06)'
                }}
              >
                {linkLabel}
                <span className="opacity-50 text-[10px]">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
