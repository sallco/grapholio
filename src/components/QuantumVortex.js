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

const GOLDEN = 2.399963229728653
const LAYERS = 8

export function createQuantumVortex(scene, {
  position = new THREE.Vector3(-220, 140, -380),
  count = 6000,
  radius = 45,
  flow = 0.9,
  vortex = 3.5,
  pulse = 1.5,
  brightness = 1.0,
  timeOffset = 0,
} = {}) {
  const geometry = new THREE.PlaneGeometry(1.4, 1.4)
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

  const dummy = new THREE.Object3D()
  const pColor = new THREE.Color()
  const target = new THREE.Vector3()

  const positions = Array.from({ length: count }, () =>
    new THREE.Vector3(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
    )
  )

  const precomp = Array.from({ length: count }, (_, i) => {
    const t = i / (count + 0.0001)
    const layer = Math.floor(t * LAYERS)
    return {
      t,
      layer,
      layerT: layer / (LAYERS + 0.0001),
      phi: Math.acos(1 - 2 * t),
      baseTheta: i * GOLDEN,
    }
  })

  function update(time) {
    const tt = (time + timeOffset) * 1.0
    material.uniforms.uTime.value = tt

    for (let i = 0; i < count; i++) {
      const { t, layerT, phi, baseTheta } = precomp[i]

      const theta = baseTheta + tt * flow
      const wave = Math.sin(theta * 2.0 + tt * pulse + layerT * 12.0)
      const breathing = 1.0 + 0.18 * Math.sin(tt * pulse + layerT * 8.0)
      const r = radius * breathing

      const sx = Math.sin(phi) * Math.cos(theta)
      const sy = Math.cos(phi)
      const sz = Math.sin(phi) * Math.sin(theta)

      const swirl = vortex * (0.15 + 0.85 * Math.abs(sy))

      target.set(
        (sx + Math.cos(theta * 3.0 + tt) * swirl * 0.08) * r,
        (sy + wave * 0.12) * r,
        (sz + Math.sin(theta * 3.0 + tt) * swirl * 0.08) * r,
      )

      const energy = 0.5 + 0.5 * wave
      const hue = ((0.55 + energy * 0.25 + layerT * 0.15 + tt * 0.02) % 1 + 1) % 1
      const saturation = Math.min(1.0, 0.8 + energy * 0.2)
      const lightness = Math.min(1.0, (0.25 + energy * 0.5 + (1.0 - Math.abs(sy)) * 0.15) * brightness)

      pColor.setHSL(hue, saturation, lightness)
      positions[i].lerp(target, 0.1)
      dummy.position.copy(positions[i])
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, pColor)
    }

    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor.needsUpdate = true

    group.rotation.y += 0.0004
  }

  function dispose() {
    geometry.dispose()
    material.dispose()
    scene.remove(group)
  }

  return { update, dispose }
}
