import { useEffect, useRef, useState } from 'react'

export default function WelcomeCard({ onDismiss }) {
  const [phase, setPhase] = useState('hidden') // hidden → visible → fading
  const cardRef = useRef()

  useEffect(() => {
    const t = setTimeout(() => setPhase('visible'), 200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'visible') return
      if (cardRef.current?.contains(e.target)) return
      setPhase('fading')
      setTimeout(onDismiss, 600)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [phase, onDismiss])

  const opacity = phase === 'visible' ? 1 : 0
  const translateY = phase === 'fading' ? -12 : 0

  return (
    <div
      ref={cardRef}
      className="relative z-40 pointer-events-auto w-full shrink-0"
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {/* Gradient border + glow */}
      <div
        className="relative rounded-md p-px"
        style={{
          background: 'linear-gradient(135deg, #60a5fa90, #60a5fa20, #60a5fa70)',
          boxShadow: '0 0 18px #60a5fa40, 0 0 40px #60a5fa18',
        }}
      >
        {/* Corner brackets */}
        {['-top-px -left-px rounded-tl-md border-t-2 border-l-2',
          '-top-px -right-px rounded-tr-md border-t-2 border-r-2',
          '-bottom-px -left-px rounded-bl-md border-b-2 border-l-2',
          '-bottom-px -right-px rounded-br-md border-b-2 border-r-2',
        ].map((cls, i) => (
          <div key={i} className={`absolute w-4 h-4 pointer-events-none ${cls}`} style={{ borderColor: '#60a5fa' }} />
        ))}

        {/* Inner panel */}
        <div
          className="rounded-md px-8 py-14"
          style={{
            background: 'rgba(5,12,31,0.82)',
            backdropFilter: 'blur(16px)',
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.015) 3px,rgba(255,255,255,0.015) 4px)',
          }}
        >
          <p className="text-sm font-medium tracking-[0.28em] uppercase mb-4" style={{ color: '#60a5fa', opacity: 0.55 }}>
            Portfolio Interactivo
          </p>
          <h1 className="text-3xl font-semibold text-slate-100 leading-tight mb-2">
            Diego Calderón
          </h1>
          <p className="text-base text-slate-400 mb-6">
            Desarrollador Full-Stack · UVG Guatemala
          </p>
          <div className="h-px mb-5" style={{ background: 'linear-gradient(90deg, #60a5fa60, transparent)' }} />
          <p className="text-base text-slate-300 leading-relaxed mb-10">
            Este grafo representa mi perfil técnico — proyectos, tecnologías y habilidades como nodos interconectados.
          </p>
          <p className="text-sm text-slate-500 tracking-wide">
            Haz clic en cualquier parte para explorar →
          </p>
        </div>
      </div>
    </div>
  )
}
