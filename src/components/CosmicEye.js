import * as THREE from 'three'

const PHI_C = (1 + Math.sqrt(5)) / 2
const ICO_VERTS = [
  [-1, PHI_C, 0], [1, PHI_C, 0], [-1, -PHI_C, 0], [1, -PHI_C, 0],
  [0, -1, PHI_C], [0, 1, PHI_C], [0, -1, -PHI_C], [0, 1, -PHI_C],
  [PHI_C, 0, -1], [PHI_C, 0, 1], [-PHI_C, 0, -1], [-PHI_C, 0, 1],
].map(([x, y, z]) => {
  const m = Math.sqrt(x * x + y * y + z * z)
  return [x / m, y / m, z / m]
})

export function createCosmicEye(scene, {
  position = new THREE.Vector3(-450, 120, -350),
  count = 8000,
  scale = 28,
  rotate = true,
} = {}) {
  const S = scale

  const geometry = new THREE.TetrahedronGeometry(0.25)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  })

  const mesh = new THREE.InstancedMesh(geometry, material, count)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

  const group = new THREE.Group()
  group.position.copy(position)
  group.add(mesh)
  scene.add(group)

  const dummy = new THREE.Object3D()
  const pColor = new THREE.Color()
  const target = new THREE.Vector3()

  // Particles start scattered — lerp to target each frame, creating "forming" entrance
  const positions = Array.from({ length: count }, () =>
    new THREE.Vector3(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 80,
    )
  )

  // Precompute per-particle fibonacci sphere coords (expensive, done once)
  const precomp = Array.from({ length: count }, (_, i) => {
    const phi = Math.acos(1 - 2 * (i + 0.5) / count)
    const theta = Math.PI * (3 - Math.sqrt(5)) * i
    return {
      ratio: i / count,
      cx0: Math.sin(phi) * Math.cos(theta),
      cy0: Math.sin(phi) * Math.sin(theta),
      cz0: Math.cos(phi),
    }
  })

  function update(time) {
    const t = time * 0.5

    for (let i = 0; i < count; i++) {
      const { ratio, cx0, cy0, cz0 } = precomp[i]
      let cx = cx0, cy = cy0, cz = cz0
      let rad, hue, sat, light

      if (ratio < 0.1) {
        // Core — cyan
        rad = S * 0.1
        hue = 0.55; sat = 0.9; light = 0.6
      } else if (ratio < 0.3) {
        // Icosahedral capsid — blue
        const vIdx = Math.floor((ratio - 0.1) / 0.2 * 12) % 12
        const [vx, vy, vz] = ICO_VERTS[vIdx]
        const blend = 0.35
        cx = cx * (1 - blend) + vx * blend
        cy = cy * (1 - blend) + vy * blend
        cz = cz * (1 - blend) + vz * blend
        const inv = 1 / Math.max(Math.sqrt(cx * cx + cy * cy + cz * cz), 0.001)
        cx *= inv; cy *= inv; cz *= inv
        rad = S * 0.25 * (1 + Math.sin(i * 0.3 + t * 2.5) * 0.18)
        hue = 0.58 + Math.sin(i * 0.4 + t) * 0.04
        sat = 0.85 + Math.cos(i * 0.3 + t) * 0.15
        light = 0.35 + Math.sin(i * 0.5 + t * 1.5) * 0.2
      } else if (ratio < 0.38) {
        // Lipid envelope — teal
        rad = S * 0.42 * (1 + Math.sin(i * 0.15 + t * 1.2) * 0.06)
        hue = 0.52; sat = 0.5
        light = 0.65 + Math.sin(i * 0.2 + t * 0.8) * 0.15
      } else if (ratio < 0.65) {
        // E proteins — purple/magenta spikes
        rad = S * 0.58 * (1 + Math.sin(i * 0.5 + t * 3) * 0.3 + Math.sin(i * 2.5 + t * 4) * 0.042)
        hue = 0.75 + Math.sin(i * 0.6 + t * 2) * 0.06
        sat = 0.9 + Math.cos(i * 0.4 + t) * 0.1
        light = 0.5 + Math.sin(i * 0.5 + t * 1.5) * 0.15
      } else if (ratio < 0.85) {
        // M proteins — violet surface
        rad = S * 0.68 * (1 + Math.sin(i * 0.4 + t * 3.2) * 0.25 + Math.cos(i * 3 + t * 5) * 0.03)
        hue = 0.7 + Math.cos(i * 0.5 + t * 2.5) * 0.05
        sat = 0.85
        light = 0.55 + Math.sin(i * 0.4 + t * 1.8) * 0.18
      } else {
        // Glycoprotein outer spikes — pink/rose
        rad = S * 0.78 * (1 + Math.sin(i * 0.35 + t * 3.8) * 0.45 + Math.cos(i * 3.5 + t * 5.5) * 0.054)
        hue = 0.85 + Math.cos(i * 0.5 + t * 2.8) * 0.05
        sat = 0.8
        light = 0.6 + Math.sin(i * 0.4 + t * 2) * 0.2
      }

      // Slow breathing pulse
      rad *= 1 + Math.sin(t * 2) * 0.012

      // Y-axis rotation (optional)
      const cosA = rotate ? Math.cos(t * 0.35) : 1
      const sinA = rotate ? Math.sin(t * 0.35) : 0

      target.set(
        (cx * cosA - cz * sinA) * rad,
        cy * rad,
        (cx * sinA + cz * cosA) * rad,
      )

      pColor.setHSL(hue, sat, light)
      positions[i].lerp(target, 0.1)
      dummy.position.copy(positions[i])
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, pColor)
    }

    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor.needsUpdate = true
  }

  function dispose() {
    geometry.dispose()
    material.dispose()
    scene.remove(group)
  }

  return { update, dispose }
}
