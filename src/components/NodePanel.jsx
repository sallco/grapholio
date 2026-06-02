const GROUP_COLORS = {
  1: '#60a5fa',
  2: '#818cf8',
  3: '#34d399',
  4: '#fb923c',
  5: '#f472b6',
}

function TechChip({ label, color }) {
  return (
    <span
      className="inline-block px-2.5 py-1 text-xs font-medium rounded tracking-wide"
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
      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded transition-all duration-200"
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

export default function NodePanel({ node, pos, onClose }) {
  if (!node) return null

  const color = GROUP_COLORS[node.group] ?? '#60a5fa'
  const isProject = node.group === 5
  const hasLinks = node.github || node.demo

  return (
    <div
      className="holo-panel absolute z-50 transition-all duration-300"
      style={{ color, left: pos.x, top: pos.y, width: '400px' }}
    >
      {/* Gradient border wrapper */}
      <div
        className="relative rounded-md p-px"
        style={{ background: `linear-gradient(135deg, ${color}70, ${color}15, ${color}50)` }}
      >
        {/* Corner brackets — live on the border, not inside content */}
        <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 rounded-tl-md pointer-events-none" style={{ borderColor: color }} />
        <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 rounded-tr-md pointer-events-none" style={{ borderColor: color }} />
        <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 rounded-bl-md pointer-events-none" style={{ borderColor: color }} />
        <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 rounded-br-md pointer-events-none" style={{ borderColor: color }} />

        {/* Inner panel */}
        <div
          className="relative rounded-md overflow-hidden"
          style={{ background: 'rgba(5,12,31,0.93)', backdropFilter: 'blur(14px)' }}
        >
          {/* Scan line animation */}
          <div
            className="holo-scan absolute inset-0 pointer-events-none z-10"
            style={{ color }}
          />

          <div className="px-10 py-9">
            {/* Header */}
            <div className="flex justify-between items-start mb-7">
              <div className="flex-1 pr-6">
                <p
                  className="text-xs font-medium tracking-[0.22em] uppercase mb-2"
                  style={{ color, opacity: 0.6 }}
                >
                  {isProject ? 'Proyecto' : node.group === 4 ? 'Tecnología' : node.group === 3 ? 'Perfil' : 'Información'}
                </p>
                <h2 className="text-xl font-semibold leading-tight text-slate-100">
                  {node.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-200 transition-colors text-sm"
                style={{ border: '1px solid rgba(148,163,184,0.2)' }}
              >
                ✕
              </button>
            </div>

            {/* Divider */}
            <div
              className="mb-6 h-px"
              style={{ background: `linear-gradient(90deg, ${color}70, transparent)` }}
            />

            {/* Image — proyectos */}
            {isProject && node.image && (
              <div className="mb-6 rounded-lg overflow-hidden" style={{ border: `1px solid ${color}30` }}>
                <img src={node.image} alt={node.name} className="w-full h-36 object-cover" />
              </div>
            )}
            {isProject && !node.image && (
              <div
                className="mb-6 rounded-lg h-32 flex items-center justify-center"
                style={{ border: `1px dashed ${color}25`, background: `${color}05` }}
              >
                <span className="text-[11px] tracking-widest uppercase" style={{ color, opacity: 0.25 }}>
                  Sin captura
                </span>
              </div>
            )}

            {/* Descripción */}
            <p className="text-sm text-slate-400 mb-7 leading-snug">
              {node.desc ?? 'Sin descripción disponible.'}
            </p>

            {/* Tech stack */}
            {isProject && node.tech?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs tracking-[0.18em] uppercase text-slate-500 mb-3">
                  Stack
                </p>
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
                <div className="mb-5 h-px" style={{ background: 'rgba(148,163,184,0.1)' }} />
                <div className="flex gap-2.5 flex-wrap">
                  <LinkButton
                    href={node.github}
                    label="GitHub"
                    icon={
                      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    }
                  />
                  <LinkButton
                    href={node.demo}
                    label="Demo"
                    icon={
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      </svg>
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
