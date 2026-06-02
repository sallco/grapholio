import { useRef, useEffect, useState, useCallback } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
import graphData from '../data.json'
import NodePanel from './NodePanel'

const GROUP_PALETTE = {
  1: { color: '#60a5fa' },
  2: { color: '#818cf8' },
  3: { color: '#34d399' },
  4: { color: '#fb923c' },
  5: { color: '#f472b6' },
}

const NODE_ID_MAP = Object.fromEntries(graphData.nodes.map((n) => [n.id, n]))

export default function GraphViewer() {
  const graphRef = useRef()
  const nodeMeshes = useRef(new Map())
  // Refs for highlight sets — stable callbacks read from these without causing re-renders
  const highlightLinksRef = useRef(new Set())
  const highlightNodesRef = useRef(new Set())
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

  const nodeThreeObject = useCallback((node) => {
    const palette = GROUP_PALETTE[node.group] ?? GROUP_PALETTE[1]
    const radius = Math.cbrt(node.val) * 2
    const geometry = new THREE.SphereGeometry(radius, 8, 8)
    const material = new THREE.MeshBasicMaterial({
      color: palette.color,
      wireframe: true,
    })
    const mesh = new THREE.Mesh(geometry, material)
    nodeMeshes.current.set(node.id, mesh)
    return mesh
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

    highlightNodesRef.current = nodes
    highlightLinksRef.current = links

    // Mutate MeshBasicMaterial.color directly — no emissive on this material type
    nodeMeshes.current.forEach((mesh, id) => {
      const palette = GROUP_PALETTE[NODE_ID_MAP[id]?.group] ?? GROUP_PALETTE[1]
      if (!node) {
        mesh.material.color.set(palette.color)
      } else if (id === node.id) {
        mesh.material.color.set('#ffffff')
      } else if (nodes.has(id)) {
        mesh.material.color.set(palette.color)
      } else {
        mesh.material.color.set('#0d1b2e')
      }
    })
  }, [])

  // Stable callbacks — read from refs, never change reference → ForceGraph never re-inits nodes
  const linkColor = useCallback(
    (link) => (highlightLinksRef.current.has(link) ? '#93c5fd' : 'rgba(99,130,235,0.45)'),
    []
  )

  const linkWidth = useCallback(
    (link) => (highlightLinksRef.current.has(link) ? 2 : 0.8),
    []
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
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkColor={linkColor}
        linkWidth={linkWidth}
        showNavInfo={false}
        onNodeHover={updateHighlight}
        onNodeClick={(node) => setSelectedNode(node)}
      />
      <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  )
}
