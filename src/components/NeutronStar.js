import * as THREE from 'three'

const VERT = `
  varying vec2 vUv;
  varying vec3 vColor;
  void main() {
    vUv = uv;
    vColor = instanceColor;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const FRAG = `
  varying vec2 vUv;
  varying vec3 vColor;
  uniform float uTime;
  void main() {
    float dist = distance(vUv, vec2(0.5));
    float ring = smoothstep(0.4, 0.45, dist) - smoothstep(0.45, 0.5, dist);
    float core = 1.0 - smoothstep(0.0, 0.1, dist);
    float alpha = core + ring * (0.5 + 0.5 * sin(uTime * 3.0));
    if (alpha < 0.05) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`

const DISK_END = 0.72
const JET_END  = 0.90

export function createNeutronStar(scene, {
  position   = new THREE.Vector3(350, 190, -320),
  count      = 5000,
  scale      = 45,
  vortex     = 1.6,
  jetPower   = 1.4,
  chaos      = 0.55,
  timeOffset = 0,
} = {}) {
  const geometry = new THREE.PlaneGeometry(1.3, 1.3)
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.InstancedMesh(geometry, material, count)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

  const group = new THREE.Group()
  group.position.copy(position)
  group.add(mesh)
  scene.add(group)

  const dummy   = new THREE.Object3D()
  const pColor  = new THREE.Color()
  const target  = new THREE.Vector3()

  const positions = Array.from({ length: count }, () =>
    new THREE.Vector3(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
    )
  )

  // Precompute zone + time-invariant values per particle
  const diskEndIdx  = Math.floor(count * DISK_END)
  const jetEndIdx   = Math.floor(count * JET_END)
  const coronaTotal = count - jetEndIdx

  const precomp = Array.from({ length: count }, (_, i) => {
    const t = i / count
    if (t < DISK_END) {
      return { zone: 0, dt: t / DISK_END }
    } else if (t < JET_END) {
      const jt   = (t - DISK_END) / (JET_END - DISK_END)
      const side = (i & 1) === 0 ? 1.0 : -1.0
      return { zone: 1, jt, side }
    } else {
      const cIdx   = i - jetEndIdx
      const cosArg = Math.max(-1, Math.min(1, 1 - 2 * (cIdx + 0.5) / coronaTotal))
      const theta  = Math.acos(cosArg)
      const phi2   = 2.39996 * cIdx
      return { zone: 2, theta, phi2 }
    }
  })

  function update(time) {
    const t = (time + timeOffset) * 1.1
    material.uniforms.uTime.value = t

    const tiltA = t * 0.04
    const cosA  = Math.cos(tiltA)
    const sinA  = Math.sin(tiltA)

    for (let i = 0; i < count; i++) {
      const p = precomp[i]
      let px, py, pz, hue, sat, lit

      if (p.zone === 0) {
        // Accretion disk — tight multi-arm spiral, vertically warped
        const { dt } = p
        const angle  = dt * Math.PI * 14 + t * vortex * (1 - dt * 0.6)
        const r      = 0.12 + dt * 0.88
        const diskH  = (0.03 + dt * 0.07) * Math.sin(angle * 4 + t * 1.5 + dt * 6)
        const ripple = chaos * 0.10 * Math.sin(angle * 6.7 - t * 2.9) * Math.cos(dt * 9 + t * 0.7)
        px = Math.cos(angle) * (r + ripple)
        py = Math.sin(angle) * (r + ripple)
        pz = diskH
        // Inner = bright white, outer = celeste
        hue = 0.55 + dt * 0.05
        sat = 0.25 + dt * 0.45
        lit = 0.88 - dt * 0.38 + 0.14 * Math.abs(Math.sin(angle * 2 + t))

      } else if (p.zone === 1) {
        // Polar jets — counter-rotating helices
        const { jt, side } = p
        const jAngle = jt * Math.PI * 6 + t * 2.2
        const jR     = 0.04 + jt * 0.08 * Math.sin(jt * Math.PI)
        const tx     = chaos * 0.035 * Math.sin(jt * 15 + t * 4.3)
        const ty     = chaos * 0.035 * Math.cos(jt * 13 - t * 3.8)
        px = jR * Math.cos(jAngle) + tx
        py = jR * Math.sin(jAngle) + ty
        pz = side * (0.08 + jt * jetPower * 0.9)
        // Bright white → celeste fade at tip
        hue = 0.57 + 0.04 * Math.sin(jt * Math.PI * 3 + t * 1.5)
        sat = 0.20 + 0.40 * (1 - jt)
        lit = 0.90 + 0.10 * (1 - jt)

      } else {
        // Magnetic corona — fibonacci sphere, crackling
        const { theta, phi2 } = p
        const cr  = 0.90 + 0.18 * Math.sin(phi2 * 3 + t * 0.7)
        const cw  = chaos * 0.08 * Math.sin(theta * 5 + t * 1.1) * Math.cos(phi2 * 4 - t * 0.6)
        const crf = cr + cw
        px = Math.sin(theta) * Math.cos(phi2) * crf
        py = Math.sin(theta) * Math.sin(phi2) * crf
        pz = Math.cos(theta) * crf
        // Soft blue-white corona
        hue = 0.58 + 0.07 * Math.sin(theta * 4 + phi2 * 0.5 + t * 0.4)
        sat = 0.30 + 0.30 * Math.abs(Math.sin(phi2 * 2 + t * 0.3))
        lit = 0.40 + 0.28 * Math.abs(Math.sin(theta * 5 + phi2 + t * 0.6))
      }

      // Slow Y-axis precession — reveals 3D geometry over time
      target.set(
        (px * cosA - pz * sinA) * scale,
        py * scale,
        (px * sinA + pz * cosA) * scale,
      )

      pColor.setHSL(
        ((hue % 1) + 1) % 1,
        Math.min(1, Math.max(0, sat)),
        Math.min(0.9, Math.max(0.05, lit)),
      )

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
