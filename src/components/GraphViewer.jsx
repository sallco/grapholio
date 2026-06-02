import { useRef, useEffect, useState, useCallback } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
import SpriteText from 'three-spritetext'
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
  const haloRings = useRef([])
  const rafRef = useRef(null)
  const highlightLinksRef = useRef(new Set())
  const highlightNodesRef = useRef(new Set())
  const [selectedNode, setSelectedNode] = useState(null)
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-120)
      graphRef.current.d3Force('link').distance(60)

      graphRef.current.cameraPosition({ z: 270 })

      const controls = graphRef.current.controls()
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.rotateSpeed = 0.6
      controls.zoomSpeed = 0.8
      controls.panSpeed = 0.8
    }
  }, [])

  useEffect(() => {
    const onResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Truco raycast para drag solo con clic izq — desactivado por preferencia de navegación
  // useEffect(() => {
  //   const noop = () => {}
  //   const disableRaycast = (e) => {
  //     if (e.button !== 2) return
  //     nodeMeshes.current.forEach((mesh) => { mesh.raycast = noop })
  //   }
  //   const restoreRaycast = (e) => {
  //     if (e.button !== 2) return
  //     nodeMeshes.current.forEach((mesh) => { mesh.raycast = THREE.Mesh.prototype.raycast })
  //   }
  //   window.addEventListener('mousedown', disableRaycast)
  //   window.addEventListener('mouseup', restoreRaycast)
  //   return () => {
  //     window.removeEventListener('mousedown', disableRaycast)
  //     window.removeEventListener('mouseup', restoreRaycast)
  //   }
  // }, [])

  // Halo animation loop
  useEffect(() => {
    const animate = () => {
      haloRings.current.forEach((ring, i) => {
        ring.rotation.z += i % 2 === 0 ? 0.005 : -0.003
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
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

    // Floating label above sphere
    const label = new SpriteText(node.name)
    label.color = GROUP_PALETTE[node.group]?.color ?? '#ffffff'
    label.textHeight = node.group === 1 ? 3.5 : node.group === 2 ? 2.8 : 2.2
    label.position.y = radius + 4
    label.fontFace = 'Space Grotesk, system-ui, sans-serif'
    label.backgroundColor = 'rgba(10,15,36,0.55)'
    label.padding = 1.5
    label.borderRadius = 3
    mesh.add(label)

    if (node.id === 'root') {
      // Outer ring
      const ring1 = new THREE.Mesh(
        new THREE.RingGeometry(radius * 1.7, radius * 2.0, 48),
        new THREE.MeshBasicMaterial({
          color: '#60a5fa',
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35,
        })
      )
      ring1.rotation.x = Math.PI * 0.35

      // Inner ring — different tilt, counter-rotates
      const ring2 = new THREE.Mesh(
        new THREE.RingGeometry(radius * 1.3, radius * 1.55, 48),
        new THREE.MeshBasicMaterial({
          color: '#93c5fd',
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.25,
        })
      )
      ring2.rotation.x = Math.PI * 0.6

      mesh.add(ring1)
      mesh.add(ring2)
      haloRings.current = [ring1, ring2]
    }

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
        nodeLabel=""
        nodeVal={(node) => node.val}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={(link) =>
          highlightLinksRef.current.has(link) ? '#93c5fd' : '#1e3a8a'
        }
        controlType="orbit"
        enableNodeDrag={false}
        showNavInfo={false}
        onNodeHover={updateHighlight}
        onNodeClick={(node) => {
          setSelectedNode(node)
          const camera = graphRef.current.camera()
          const vec = new THREE.Vector3(node.x ?? 0, node.y ?? 0, node.z ?? 0)
          vec.project(camera)
          const sw = dimensions.width
          const sh = dimensions.height
          const panelW = 416  // card width + margin
          const panelH = 480  // approximate max height
          const margin = 24
          let x = (vec.x + 1) / 2 * sw + margin
          let y = -(vec.y - 1) / 2 * sh - panelH / 2
          // Clamp to viewport
          x = Math.min(Math.max(x, margin), sw - panelW - margin)
          y = Math.min(Math.max(y, margin), sh - panelH - margin)
          setPanelPos({ x, y })
        }}
      />
      <NodePanel key={selectedNode?.id} node={selectedNode} pos={panelPos} onClose={() => setSelectedNode(null)} />
    </div>
  )
}
