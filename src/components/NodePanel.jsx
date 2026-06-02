export default function NodePanel({ node, onClose }) {
  if (!node) return null

  return (
    <div className="absolute top-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-[#0f172a]/90 border border-blue-900/40 text-slate-200 p-6 rounded-xl backdrop-blur-md z-50 shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-blue-400 tracking-wide">
          {node.name}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors text-sm p-1 leading-none"
        >
          ✕
        </button>
      </div>
      <div className="border-t border-blue-900/30 pt-3">
        <p className="text-sm text-slate-300 leading-relaxed">
          {node.desc || 'Rama del grafo. Selecciona subnodos para mayor detalle.'}
        </p>
      </div>
    </div>
  )
}
