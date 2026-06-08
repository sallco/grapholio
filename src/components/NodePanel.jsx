import { useState, useEffect, useRef } from 'react'

const GROUP_COLORS = {
  1: '#60a5fa',
  2: '#818cf8',
  3: '#34d399',
  4: '#fb923c',
  5: '#f472b6',
  6: '#a78bfa',
  7: '#22d3ee',
}

function TechChip({ label, color }) {
  return (
    <span
      className="inline-block px-3 py-1.5 text-sm font-medium rounded tracking-wide"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  )
}

function LinkButton({ href, label, icon }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded transition-all duration-200"
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
      {icon}
      {label}
      <span className="opacity-50 text-[10px]">↗</span>
    </a>
  )
}

function BulletList({ items, color, marker = '›' }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 leading-snug">
          <span className="shrink-0 mt-0.5 text-base font-bold" style={{ color, opacity: 0.7 }}>
            {marker}
          </span>
          <span className="text-slate-300 text-base">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-base tracking-[0.2em] uppercase text-slate-500 mb-3 font-medium">
      {children}
    </p>
  )
}

export default function NodePanel({ node, pos, onClose, isClosing = false }) {
  const posRef = useRef({ x: pos.x, y: pos.y })
  const [position, setPosition] = useState({ x: pos.x, y: pos.y })
  const [dragging, setDragging] = useState(false)
  const [visualClosing, setVisualClosing] = useState(false)

  useEffect(() => {
    if (isClosing) {
      requestAnimationFrame(() => setVisualClosing(true))
    } else {
      setVisualClosing(false)
    }
  }, [isClosing])

  useEffect(() => {
    posRef.current = { x: pos.x, y: pos.y }
    setPosition({ x: pos.x, y: pos.y })
  }, [pos.x, pos.y])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const onMouseDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    setDragging(true)
    const startMouseX = e.clientX
    const startMouseY = e.clientY
    const startX = posRef.current.x
    const startY = posRef.current.y

    const onMove = (e) => {
      const nx = startX + (e.clientX - startMouseX)
      const ny = startY + (e.clientY - startMouseY)
      posRef.current = { x: nx, y: ny }
      setPosition({ x: nx, y: ny })
    }
    const onUp = () => {
      setDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  if (!node) return null

  const color = GROUP_COLORS[node.group] ?? '#60a5fa'
  const isProject = node.group === 5
  const isConcept = node.group === 6
  const hasLinks = node.links?.length > 0 || node.github || node.demo

  const groupLabel = isProject
    ? 'Proyecto'
    : node.group === 4
    ? 'Tecnología'
    : node.group === 3
    ? 'Perfil'
    : isConcept
    ? 'Área de Conocimiento'
    : 'Información'

  return (
    <div
      data-nodepanel
      className="holo-panel holo-scan absolute z-50"
      style={{
        color,
        left: position.x,
        top: position.y,
        width: '520px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: isClosing ? 'none' : 'holo-deploy 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards, flicker 6s 0.6s infinite',
        opacity: visualClosing ? 0 : 1,
        transform: visualClosing ? 'translateY(-10px) scale(0.96)' : 'none',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        cursor: dragging ? 'grabbing' : 'default',
      }}
    >
      {/* Gradient border wrapper + outer glow */}
      <div
        className="relative rounded-md p-px flex flex-col flex-1 min-h-0"
        style={{
          background: `linear-gradient(135deg, ${color}90, ${color}20, ${color}70)`,
          boxShadow: `0 0 18px ${color}50, 0 0 40px ${color}25, inset 0 0 12px ${color}15`,
        }}
      >
        {/* Corner brackets */}
        <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 rounded-tl-md pointer-events-none" style={{ borderColor: color }} />
        <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 rounded-tr-md pointer-events-none" style={{ borderColor: color }} />
        <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 rounded-bl-md pointer-events-none" style={{ borderColor: color }} />
        <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 rounded-br-md pointer-events-none" style={{ borderColor: color }} />

        {/* Inner panel */}
        <div
          className="relative rounded-md flex flex-col flex-1 min-h-0"
          style={{
            background: 'rgba(5,12,31,0.82)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Scanline texture */}
          <div
            className="absolute inset-0 pointer-events-none z-0 rounded-md"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.018) 3px,rgba(255,255,255,0.018) 4px)`,
            }}
          />

          {/* Deploy scanline */}
          <div
            className="absolute inset-x-0 h-px pointer-events-none z-20"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}dd, ${color}, ${color}dd, transparent)`,
              boxShadow: `0 0 10px 3px ${color}55`,
              animation: 'holo-scanline-sweep 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          />

          {/* Header — sticky drag handle */}
          <div
            className="relative z-10 px-10 pt-9 pb-5 shrink-0 select-none"
            onMouseDown={onMouseDown}
            style={{ cursor: dragging ? 'grabbing' : 'grab' }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-3 mb-2">
                  <p
                    className="text-base font-medium tracking-[0.22em] uppercase"
                    style={{ color, opacity: 0.6 }}
                  >
                    {groupLabel}
                  </p>
                  {node.status && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium tracking-wide"
                      style={{
                        color: node.status === 'En Desarrollo' ? '#fbbf24' : '#34d399',
                        background: node.status === 'En Desarrollo' ? '#fbbf2418' : '#34d39918',
                        border: `1px solid ${node.status === 'En Desarrollo' ? '#fbbf2450' : '#34d39950'}`,
                      }}
                    >
                      {node.status}
                    </span>
                  )}
                </div>
                {node.group !== 1 && (
                  <h2 className="text-3xl font-semibold leading-tight text-slate-100">
                    {node.name}
                  </h2>
                )}
              </div>
              <button
                onClick={onClose}
                onMouseDown={(e) => e.stopPropagation()}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-200 transition-colors text-base"
                style={{ border: '1px solid rgba(148,163,184,0.2)' }}
              >
                ✕
              </button>
            </div>
            <div
              className="mt-5 h-px"
              style={{ background: `linear-gradient(90deg, ${color}70, transparent)` }}
            />
          </div>

          {/* Scrollable content */}
          <div
            className="relative z-10 px-10 pb-9 overflow-y-auto flex-1 min-h-0"
            style={{ scrollbarWidth: 'thin', scrollbarColor: `${color}40 transparent` }}
          >
            {/* Tech logo — group 4 nodes */}
            {node.group === 4 && node.icon && (
              <div className="flex justify-center mb-6">
                <img
                  src={node.icon}
                  alt={node.name}
                  className="w-16 h-16 object-contain"
                  style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
                />
              </div>
            )}

            {/* Portrait + name row — root node */}
            {node.group === 1 && node.image && (
              <div className="flex items-center gap-6 mb-7">
                <div
                  className="shrink-0 w-28 h-28 rounded-full overflow-hidden"
                  style={{
                    border: `3px solid ${color}55`,
                    boxShadow: `0 0 28px ${color}40`,
                  }}
                >
                  <img src={node.image} alt={node.name} className="w-full h-full object-cover object-top" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-semibold text-slate-100 leading-tight mb-1">
                    {node.name}
                  </p>
                  <p className="text-sm text-slate-400">23 años</p>
                  <p className="text-sm mt-1" style={{ color, opacity: 0.7 }}>Desarrollador Full-Stack</p>
                </div>
              </div>
            )}

            {/* Screenshot — projects */}
            {isProject && node.image && (
              <div className="mb-7 rounded-lg overflow-hidden" style={{ border: `1px solid ${color}30`, background: 'rgba(0,0,0,0.3)' }}>
                <img src={node.image} alt={node.name} className="w-full object-contain" style={{ maxHeight: '280px' }} />
              </div>
            )}
            {isProject && !node.image && (
              <div
                className="mb-7 rounded-lg h-28 flex items-center justify-center"
                style={{ border: `1px dashed ${color}25`, background: `${color}05` }}
              >
                <span className="text-xs tracking-widest uppercase" style={{ color, opacity: 0.25 }}>
                  Sin captura
                </span>
              </div>
            )}

            {/* Description */}
            <p className="text-base text-slate-300 mb-7 leading-relaxed">
              {node.desc ?? 'Sin descripción disponible.'}
            </p>

            {/* Highlights */}
            {node.highlights?.length > 0 && (
              <div className="mb-7">
                <div className="mb-4 h-px" style={{ background: 'rgba(148,163,184,0.08)' }} />
                <SectionLabel>Lo que destaca</SectionLabel>
                <BulletList items={node.highlights} color={color} marker="›" />
              </div>
            )}

            {/* Learnings */}
            {node.learnings?.length > 0 && (
              <div className="mb-7">
                <div className="mb-4 h-px" style={{ background: 'rgba(148,163,184,0.08)' }} />
                <SectionLabel>Aprendizajes clave</SectionLabel>
                <BulletList items={node.learnings} color={color} marker="◆" />
              </div>
            )}

            {/* Tech stack */}
            {node.tech?.length > 0 && (
              <div className="mb-7">
                <div className="mb-4 h-px" style={{ background: 'rgba(148,163,184,0.08)' }} />
                <SectionLabel>Stack tecnológico</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {node.tech.map((t) => (
                    <TechChip key={t} label={t} color={color} />
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {hasLinks && (
              <>
                <div className="mb-5 h-px" style={{ background: 'rgba(148,163,184,0.08)' }} />
                <div className="flex gap-3 flex-wrap">
                  {node.links?.length > 0 ? node.links.map(({ label, url }) => (
                    <LinkButton key={label} href={url} label={label} icon={
                      url?.startsWith('mailto:') ? (
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      )
                    } />
                  )) : <>
                    <LinkButton href={node.github} label="GitHub" icon={
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    } />
                    <LinkButton href={node.demo} label="Demo en vivo" icon={
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      </svg>
                    } />
                  </>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
