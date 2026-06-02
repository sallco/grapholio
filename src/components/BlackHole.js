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

export function createBlackHole(scene, {
  position = new THREE.Vector3(520, 60, -370),
  count = 5000,
  diskSize = 50,
  horizon = 8,
  mass = 2.5,
  tiltX = -0.6,
  tiltZ = 0.3,
  timeOffset = 0,
} = {}) {
  const geometry = new THREE.PlaneGeometry(0.8, 0.8)
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
  group.rotation.x = tiltX
  group.rotation.z = tiltZ
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

  // Precompute time-independent values
  const precomp = Array.from({ length: count }, (_, i) => {
    const idx = i / count
    return {
      idx,
      baseR: Math.pow(idx, 1.5) * diskSize,
      diskThickSeed: Math.sin(idx * 789.1),
      jetProb: Math.pow(Math.sin(idx * Math.PI * 89.0), 80.0),
      jetDir: Math.sign(Math.cos(idx * Math.PI * 173.0)) || 1,
      angleOffset: idx * 1234.56,
    }
  })

  function update(time) {
    const t = (time + timeOffset) * 1.1

    material.uniforms.uTime.value = t

    const infallSpeed = mass * 3.0
    const luminosity = 1.2

    for (let i = 0; i < count; i++) {
      const { idx, baseR, diskThickSeed, jetProb, jetDir, angleOffset } = precomp[i]

      let rOffset = (baseR - t * infallSpeed) % diskSize
      rOffset = (rOffset + diskSize) % diskSize
      const currentR = horizon + rOffset

      const distToHorizon = Math.max(0.01, currentR - horizon)
      const orbitalSpeed = (mass * 25.0) / (distToHorizon + 2.0)
      const angle = angleOffset + t * orbitalSpeed

      const jetHeight = jetProb * jetDir * (diskSize * 2.0) * Math.max(0.0, 1.0 - distToHorizon / diskSize)
      const diskThickness = diskThickSeed * (currentR * 0.03) * (1.0 - jetProb)
      const warpFactor = horizon / (distToHorizon + 0.1)
      const lensDistortion = Math.sin(t * 3.0 + idx * 50.0) * warpFactor * 1.5 * (1.0 - jetProb)

      target.set(
        Math.cos(angle) * currentR,
        diskThickness + jetHeight + lensDistortion,
        Math.sin(angle) * currentR,
      )

      const heat = Math.max(0.0, Math.min(1.0, 1.0 - distToHorizon / (diskSize * 0.7)))
      const hue = (0.05 + heat * 0.55 + jetProb * 0.4) % 1.0
      const saturation = Math.max(0.0, 1.0 - jetProb * 0.6)
      const doppler = (Math.sin(angle) * 0.5 + 0.5) * heat
      const lightness = Math.min(1.0, (0.05 + heat * 0.6 + doppler * 0.4) * luminosity + jetProb * 0.8)

      pColor.setHSL(hue, saturation, lightness)
      positions[i].lerp(target, 0.15)
      dummy.position.copy(positions[i])
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, pColor)
    }

    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor.needsUpdate = true

    // Slow axial precession
    group.rotation.y += 0.0003
  }

  function dispose() {
    geometry.dispose()
    material.dispose()
    scene.remove(group)
  }

  return { update, dispose }
}
