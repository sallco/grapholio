import { useEffect, useRef } from 'react'

const GROUP_COLORS = {
  3: '#34d399',
  4: '#fb923c',
  5: '#f472b6',
}

export default function SidebarMenu({ isOpen, onToggle, onClose, nodes, onSelectNode }) {
  const menuRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (!isOpen) return
      if (menuRef.current?.contains(e.target)) return
      if (e.target.closest('[data-nodepanel]')) return
      onClose()
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  const profileNodes = nodes.filter(n => n.group === 3 || n.id === 'root')
  const projectNodes = nodes.filter(n => n.group === 5)
  const techNodes = nodes.filter(n => n.group === 4)

  return (
    <div ref={menuRef} className="flex flex-col gap-4 pointer-events-auto w-full flex-1 min-h-0 transition-all duration-300">
      <button
        onClick={onToggle}
        className="shrink-0 flex items-center justify-center gap-3 px-5 py-3.5 rounded-md text-sm font-medium tracking-widest uppercase transition-all duration-200"
        style={{
          background: isOpen ? 'rgba(96, 165, 250, 0.15)' : 'rgba(10, 15, 36, 0.85)',
          border: `1px solid ${isOpen ? 'rgba(96, 165, 250, 0.5)' : 'rgba(96, 165, 250, 0.25)'}`,
          color: isOpen ? '#e2e8f0' : '#94a3b8',
          backdropFilter: 'blur(8px)',
          boxShadow: isOpen ? '0 0 16px rgba(96, 165, 250, 0.2)' : 'none',
        }}
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Explorar Menú
      </button>

      {isOpen && (
        <div
          className="flex-1 min-h-0 relative rounded-md p-px flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #60a5fa80, #60a5fa15, #60a5fa50)',
            boxShadow: '0 0 15px #60a5fa20',
            animation: 'holo-deploy 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 rounded-tl-md pointer-events-none" style={{ borderColor: '#60a5fa' }} />
          <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 rounded-tr-md pointer-events-none" style={{ borderColor: '#60a5fa' }} />
          <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 rounded-bl-md pointer-events-none" style={{ borderColor: '#60a5fa' }} />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 rounded-br-md pointer-events-none" style={{ borderColor: '#60a5fa' }} />

          <div
            className="flex-1 min-h-0 rounded-md overflow-y-auto px-7 py-7"
            style={{
              background: 'rgba(5,12,31,0.88)',
              backdropFilter: 'blur(16px)',
              scrollbarWidth: 'thin',
              scrollbarColor: '#60a5fa40 transparent',
            }}
          >
            <NavSection title="Información Personal" nodes={profileNodes} color={GROUP_COLORS[3]} onSelect={onSelectNode} />
            <NavSection title="Proyectos" nodes={projectNodes} color={GROUP_COLORS[5]} onSelect={onSelectNode} />
            <NavSection title="Tecnologías" nodes={techNodes} color={GROUP_COLORS[4]} onSelect={onSelectNode} />
          </div>
        </div>
      )}
    </div>
  )
}

function NavSection({ title, nodes, color, onSelect }) {
  if (!nodes || nodes.length === 0) return null
  return (
    <div className="mb-7 last:mb-0">
      <h3 className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color, opacity: 0.85 }}>
        {title}
      </h3>
      <ul className="space-y-1.5">
        {nodes.map(node => (
          <li key={node.id}>
            <button
              onClick={() => onSelect(node)}
              className="w-full text-left px-3 py-2.5 rounded text-sm text-slate-300 hover:text-white transition-all block truncate"
              style={{ borderLeft: `2px solid transparent` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${color}15`
                e.currentTarget.style.borderLeftColor = color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderLeftColor = 'transparent'
              }}
            >
              {node.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}