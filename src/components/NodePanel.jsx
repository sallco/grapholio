const GROUP_COLORS = {
  1: '#60a5fa',
  2: '#818cf8',
  3: '#34d399',
  4: '#fb923c',
  5: '#f472b6',
}

function Corner({ pos }) {
  const base = 'absolute w-3 h-3'
  const borders = {
    tl: 'top-0 left-0 border-t-2 border-l-2',
    tr: 'top-0 right-0 border-t-2 border-r-2',
    bl: 'bottom-0 left-0 border-b-2 border-l-2',
    br: 'bottom-0 right-0 border-b-2 border-r-2',
  }
  return <div className={`${base} ${borders[pos]}`} style={{ borderColor: 'currentColor' }} />
}

function TechChip({ label, color }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-xs font-medium rounded tracking-wide"
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
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all duration-200"
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

export default function NodePanel({ node, onClose }) {
  if (!node) return null

  const color = GROUP_COLORS[node.group] ?? '#60a5fa'
  const isProject = node.group === 5
  const hasLinks = node.github || node.demo

  return (
    <div
      className="holo-panel holo-scan absolute top-6 right-6 w-80 max-w-[calc(100vw-3rem)] z-50 overflow-hidden"
      style={{ color }}
    >
      {/* Outer border */}
      <div
        className="relative rounded-lg p-px"
        style={{ background: `linear-gradient(135deg, ${color}60, ${color}10, ${color}40)` }}
      >
        {/* Inner panel */}
        <div
          className="relative rounded-lg p-5 overflow-hidden"
          style={{ background: 'rgba(5,12,31,0.92)', backdropFilter: 'blur(12px)' }}
        >
          {/* Corner brackets */}
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />

          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-2">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase opacity-60 mb-1"
                 style={{ color }}>
                {isProject ? 'Proyecto' : node.group === 4 ? 'Tecnología' : node.group === 3 ? 'Perfil' : 'Nodo'}
              </p>
              <h2 className="text-base font-600 leading-tight text-slate-100">
                {node.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 transition-colors text-xs"
              style={{ border: '1px solid rgba(148,163,184,0.2)' }}
            >
              ✕
            </button>
          </div>

          {/* Divider */}
          <div className="mb-4 h-px" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />

          {/* Image placeholder — solo proyectos con imagen */}
          {isProject && node.image && (
            <div className="mb-4 rounded overflow-hidden" style={{ border: `1px solid ${color}30` }}>
              <img src={node.image} alt={node.name} className="w-full h-32 object-cover" />
            </div>
          )}

          {/* Image placeholder vacío cuando no hay imagen */}
          {isProject && !node.image && (
            <div
              className="mb-4 rounded h-28 flex items-center justify-center"
              style={{ border: `1px dashed ${color}30`, background: `${color}06` }}
            >
              <span className="text-xs opacity-30 tracking-widest uppercase">Sin captura</span>
            </div>
          )}

          {/* Descripción */}
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            {node.desc ?? 'Sin descripción disponible.'}
          </p>

          {/* Tech stack — solo proyectos */}
          {isProject && node.tech?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] tracking-[0.15em] uppercase opacity-50 mb-2 text-slate-400">
                Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {node.tech.map((t) => (
                  <TechChip key={t} label={t} color={color} />
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {hasLinks && (
            <>
              <div className="mb-3 h-px" style={{ background: 'rgba(148,163,184,0.1)' }} />
              <div className="flex gap-2 flex-wrap">
                <LinkButton
                  href={node.github}
                  label="GitHub"
                  icon={
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  }
                />
                <LinkButton href={node.demo} label="Demo" icon={
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  </svg>
                } />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
