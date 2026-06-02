import { useRef, useEffect, useState, useCallback } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
import graphData from '../data.json'
import NodePanel from './NodePanel'

const GROUP_PALETTE = {
  1: { color: '#60a5fa', emissive: '#1e3a8a' },
  2: { color: '#818cf8', emissive: '#312e81' },
  3: { color: '#34d399', emissive: '#064e3b' },
  4: { color: '#fb923c', emissive: '#7c2d12' },
  5: { color: '#f472b6', emissive: '#831843' },
}

const NODE_ID_MAP = Object.fromEntries(graphData.nodes.map((n) => [n.id, n]))

export default function GraphViewer() {
  const graphRef = useRef()
  const nodeMeshes = useRef(new Map())
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

  const nodeThreeObject = useCallback((node) => {
    const palette = GROUP_PALETTE[node.group] ?? GROUP_PALETTE[1]
    const radius = Math.cbrt(node.val) * 2
    const geometry = new THREE.SphereGeometry(radius, 16, 16)
    const material = new THREE.MeshPhongMaterial({
      color: palette.color,
      emissive: palette.emissive,
      shininess: 90,
      specular: '#ffffff',
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

    // Mutate materials directly — no Three.js re-render needed
    nodeMeshes.current.forEach((mesh, id) => {
      const palette = GROUP_PALETTE[NODE_ID_MAP[id]?.group] ?? GROUP_PALETTE[1]
      if (!node) {
        mesh.material.color.set(palette.color)
        mesh.material.emissive.set(palette.emissive)
        mesh.material.opacity = 1
      } else if (id === node.id) {
        mesh.material.color.set('#ffffff')
        mesh.material.emissive.set(palette.color)
      } else if (nodes.has(id)) {
        mesh.material.color.set(palette.color)
        mesh.material.emissive.set(palette.emissive)
        mesh.material.opacity = 1
      } else {
        mesh.material.color.set('#0d1526')
        mesh.material.emissive.set('#000000')
      }
    })

    setHoverNode(node || null)
    setHighlightNodes(nodes)
    setHighlightLinks(links)
  }, [])

  const linkColor = useCallback(
    (link) => (highlightLinks.has(link) ? '#93c5fd' : 'rgba(99,130,235,0.45)'),
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
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkColor={linkColor}
        linkWidth={(link) => (highlightLinks.has(link) ? 2 : 0.8)}
        showNavInfo={false}
        onNodeHover={updateHighlight}
        onNodeClick={(node) => setSelectedNode(node)}
      />
      <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  )
}
