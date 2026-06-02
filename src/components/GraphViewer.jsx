import { useRef, useEffect, useState, useCallback } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import graphData from '../data.json'
import NodePanel from './NodePanel'

export default function GraphViewer() {
  const graphRef = useRef()
  const [hoverNode, setHoverNode] = useState(null)
  const [highlightNodes, setHighlightNodes] = useState(new Set())
  const [highlightLinks, setHighlightLinks] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState(null)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-120)
      graphRef.current.d3Force('link').distance(60)
    }
  }, [])

  useEffect(() => {
    const onResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const updateHighlight = useCallback((node) => {
    const nodes = new Set()
    const links = new Set()

    if (node) {
      nodes.add(node.id)
      graphData.links.forEach((link) => {
        const srcId = typeof link.source === 'object' ? link.source.id : link.source
        const tgtId = typeof link.target === 'object' ? link.target.id : link.target
        if (srcId === node.id || tgtId === node.id) {
          links.add(link)
          nodes.add(srcId)
          nodes.add(tgtId)
        }
      })
    }

    setHoverNode(node || null)
    setHighlightNodes(nodes)
    setHighlightLinks(links)
  }, [])

  const nodeColor = useCallback(
    (node) => {
      if (!highlightNodes.size) return '#1e3a8a'
      if (node === hoverNode) return '#60a5fa'
      if (highlightNodes.has(node.id)) return '#3b82f6'
      return '#0f1f4a'
    },
    [hoverNode, highlightNodes]
  )

  const linkColor = useCallback(
    (link) => (highlightLinks.has(link) ? '#60a5fa' : 'rgba(37,99,235,0.15)'),
    [highlightLinks]
  )

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#0a0f24"
        nodeLabel="name"
        nodeVal={(node) => node.val}
        nodeColor={nodeColor}
        linkColor={linkColor}
        showNavInfo={false}
        onNodeHover={updateHighlight}
        onNodeClick={(node) => setSelectedNode(node)}
      />
      <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  )
}
