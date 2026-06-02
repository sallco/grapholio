import { useRef, useEffect, useState, useCallback } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
import SpriteText from 'three-spritetext'
import graphData from '../data.json'
import NodePanel from './NodePanel'
import { createCosmicEye } from './CosmicEye'
import { createBlackHole } from './BlackHole'
import { createBlackHoleTON618 } from './BlackHoleTON618'
import { createQuantumVortex } from './QuantumVortex'
import { createNeutronStar } from './NeutronStar'

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
  const selectedNodeIdRef = useRef(null)
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

      // Star field — two layers for depth
      const scene = graphRef.current.scene()
      const addStars = (count, spread, size, opacity) => {
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count * 3; i++) {
          positions[i] = (Math.random() - 0.5) * spread
        }
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const mat = new THREE.PointsMaterial({
          color: '#ffffff',
          size,
          transparent: true,
          opacity,
          sizeAttenuation: true,
        })
        scene.add(new THREE.Points(geo, mat))
      }

      addStars(1800, 4000, 1.2, 0.55)  // far — many, small, dim
      addStars(700,  1800, 2.0, 0.85)  // near — fewer, bigger, bright

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

  // Halo + ambient effects loop
  useEffect(() => {
    if (!graphRef.current) return
    const scene = graphRef.current.scene()

    const eye = createCosmicEye(scene)

    const bh1 = createBlackHole(scene, {
      position: new THREE.Vector3(320, 40, -250),
      count: 9000,
      diskSize: 80,
      tiltX: -0.6,
      tiltZ: 0.3,
      timeOffset: 0,
    })
    const bh2 = createBlackHole(scene, {
      position: new THREE.Vector3(-300, -40, 280),
      count: 9000,
      diskSize: 80,
      tiltX: 0.8,
      tiltZ: -0.5,
      timeOffset: 12.5,
    })

    const ton618_a = createBlackHoleTON618(scene, {
      position: new THREE.Vector3(420, -80, -260),
      diskSpread: 110, count: 7000,
      tilt: 0.4, timeOffset: 0,
    })
    const ton618_b = createBlackHoleTON618(scene, {
      position: new THREE.Vector3(-500, 110, -200),
      diskSpread: 100, count: 7000,
      tilt: 0.7, timeOffset: 5,
    })
    const ton618_c = createBlackHoleTON618(scene, {
      position: new THREE.Vector3(160, -170, 470),
      diskSpread: 110, count: 7000,
      tilt: 0.3, timeOffset: 9,
    })
    const ton618_d = createBlackHoleTON618(scene, {
      position: new THREE.Vector3(-320, 130, 430),
      diskSpread: 95, count: 7000,
      tilt: 1.0, timeOffset: 14,
    })

    const ns1 = createNeutronStar(scene, {
      position: new THREE.Vector3(350, 190, -320),
      timeOffset: 0,
    })
    const ns2 = createNeutronStar(scene, {
      position: new THREE.Vector3(-430, -170, 240),
      scale: 40,
      timeOffset: 8,
    })
    const ns3 = createNeutronStar(scene, {
      position: new THREE.Vector3(60, 290, -490),
      scale: 38,
      timeOffset: 16,
    })

    const vortex = createQuantumVortex(scene, {
      position: new THREE.Vector3(-220, 140, -380),
      count: 1800,
      radius: 75,
      flow: 0.12,
      vortex: 0.6,
      pulse: 0.4,
      brightness: 0.45,
      timeOffset: 4,
    })

    // Twinkling groups — 3 layers with offset phases
    const twinklers = Array.from({ length: 3 }, (_, i) => {
      const count = 180
      const pos = new Float32Array(count * 3)
      for (let j = 0; j < count * 3; j++) pos[j] = (Math.random() - 0.5) * 3500
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const mat = new THREE.PointsMaterial({
        color: '#ddeeff',
        size: 1.6 + i * 0.4,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
      })
      const pts = new THREE.Points(geo, mat)
      scene.add(pts)
      return { pts, geo, mat, phase: (i * Math.PI * 2) / 3, speed: 0.35 + i * 0.2 }
    })

    // Shooting stars
    const shooters = []
    let nextSpawn = Date.now() + 1500 + Math.random() * 2000

    const spawnShooter = () => {
      // Spawn on a plane near the scene center, guaranteed to cross camera view
      const side = Math.random() < 0.5 ? -1 : 1
      const sx = side * (350 + Math.random() * 150)
      const sy = (Math.random() - 0.5) * 300
      const sz = (Math.random() - 0.5) * 200

      // Direction: mostly horizontal, slight arc, always crosses center area
      const angle = (Math.random() - 0.5) * 0.4  // slight vertical drift
      const dir = new THREE.Vector3(-side, Math.sin(angle), (Math.random() - 0.5) * 0.3).normalize()

      const trailLen = 120 + Math.random() * 180
      const speed = 600 + Math.random() * 400

      const makeStrand = (offset) => {
        const pos = new Float32Array(6)
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        const mat = new THREE.LineBasicMaterial({
          color: '#e8f4ff',
          transparent: true,
          opacity: 0,
          depthWrite: false,
        })
        const line = new THREE.Line(geo, mat)
        scene.add(line)
        return { line, geo, mat, offset }
      }

      const strands = [makeStrand(0), makeStrand(2), makeStrand(-2)]
      const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize()
      shooters.push({ strands, start: new THREE.Vector3(sx, sy, sz), dir, perp, trailLen, speed, born: Date.now() })
    }

    let lastT = Date.now()
    let ambientRaf

    const animate = () => {
      const now = Date.now()
      lastT = now

      // Cosmic entities
      eye.update(now / 1000)
      bh1.update(now / 1000)
      bh2.update(now / 1000)
      ton618_a.update(now / 1000)
      ton618_b.update(now / 1000)
      ton618_c.update(now / 1000)
      ton618_d.update(now / 1000)
      ns1.update(now / 1000)
      ns2.update(now / 1000)
      ns3.update(now / 1000)
      vortex.update(now / 1000)

      // Halo rings
      haloRings.current.forEach((ring, i) => {
        ring.rotation.z += i % 2 === 0 ? 0.005 : -0.003
      })

      // Selected node — color oscillation + self-rotation
      const selId = selectedNodeIdRef.current
      nodeMeshes.current.forEach((mesh, id) => {
        if (id === selId) {
          mesh.rotation.y += 0.018
          mesh.rotation.x += 0.006
          const palette = GROUP_PALETTE[NODE_ID_MAP[id]?.group] ?? GROUP_PALETTE[1]
          const t = 0.5 + 0.5 * Math.sin(now * 0.003)
          const c = new THREE.Color(palette.color)
          c.lerp(new THREE.Color('#ffffff'), t * 0.65)
          mesh.material.color.copy(c)
        } else if (mesh.rotation.y !== 0) {
          mesh.rotation.set(0, 0, 0)
        }
      })

      // Twinkling
      twinklers.forEach(({ mat, phase, speed }) => {
        mat.opacity = 0.2 + 0.5 * (0.5 + 0.5 * Math.sin(now * 0.001 * speed + phase))
      })

      // Spawn shooting star
      if (now >= nextSpawn && shooters.length < 3) {
        spawnShooter()
        nextSpawn = now + 3000 + Math.random() * 5000
      }

      // Update shooting stars
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i]
        const elapsed = (now - s.born) / 1000
        const headD = elapsed * s.speed
        const tailD = Math.max(0, headD - s.trailLen)
        const maxD = s.trailLen * 3.5

        let opacity
        if (headD < s.trailLen) {
          opacity = headD / s.trailLen
        } else if (headD > maxD * 0.75) {
          opacity = 1 - (headD - maxD * 0.75) / (maxD * 0.25)
        } else {
          opacity = 1
        }

        s.strands.forEach(({ line, geo, mat, offset }) => {
          const off = s.perp.clone().multiplyScalar(offset)
          const head = s.start.clone().addScaledVector(s.dir, headD).add(off)
          const tail = s.start.clone().addScaledVector(s.dir, tailD).add(off)
          const p = geo.attributes.position
          p.setXYZ(0, tail.x, tail.y, tail.z)
          p.setXYZ(1, head.x, head.y, head.z)
          p.needsUpdate = true
          // Center strand fully opaque, side strands dimmer
          mat.opacity = Math.max(0, opacity * (offset === 0 ? 1 : 0.45))
        })

        if (headD > maxD) {
          s.strands.forEach(({ line, geo, mat }) => { scene.remove(line); geo.dispose(); mat.dispose() })
          shooters.splice(i, 1)
        }
      }

      ambientRaf = requestAnimationFrame(animate)
    }

    ambientRaf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(ambientRaf)
      eye.dispose()
      bh1.dispose()
      bh2.dispose()
      ton618_a.dispose()
      ton618_b.dispose()
      ton618_c.dispose()
      ton618_d.dispose()
      ns1.dispose()
      ns2.dispose()
      ns3.dispose()
      vortex.dispose()
      twinklers.forEach(({ pts, geo, mat }) => { scene.remove(pts); geo.dispose(); mat.dispose() })
      shooters.forEach(({ strands }) => strands.forEach(({ line, geo, mat }) => { scene.remove(line); geo.dispose(); mat.dispose() }))
    }
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
      const isSelected = id === selectedNodeIdRef.current
      if (isSelected) return  // RAF loop handles selected node color
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
          selectedNodeIdRef.current = node.id
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
      <NodePanel key={selectedNode?.id} node={selectedNode} pos={panelPos} onClose={() => {
        selectedNodeIdRef.current = null
        const mesh = nodeMeshes.current.get(selectedNode?.id)
        if (mesh) {
          mesh.rotation.set(0, 0, 0)
          const palette = GROUP_PALETTE[NODE_ID_MAP[selectedNode?.id]?.group] ?? GROUP_PALETTE[1]
          mesh.material.color.set(palette.color)
        }
        setSelectedNode(null)
      }} />
    </div>
  )
}
