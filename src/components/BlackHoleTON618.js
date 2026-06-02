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

export function createBlackHoleTON618(scene, {
  position = new THREE.Vector3(420, -80, -260),
  count = 6000,
  eventHorizon = 14,
  diskSpread = 90,
  mass = 5,
  tilt = 0.4,
  timeOffset = 0,
} = {}) {
  const geometry = new THREE.PlaneGeometry(1.5, 1.5)
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
  group.rotation.x = tilt   // tilts disk for 3D perspective (rotation in YZ = viewTilt)
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
    const ratio = i / count
    return {
      ratio,
      radius: eventHorizon + Math.pow(ratio, 1.8) * diskSpread,
      noiseSeed: Math.sin(i * 512.4),
      angleBase: i * 13.7,
    }
  })

  function update(time) {
    const t = (time + timeOffset) * 1.1
    material.uniforms.uTime.value = t

    for (let i = 0; i < count; i++) {
      const { ratio, radius, noiseSeed, angleBase } = precomp[i]

      const orbitalSpeed = (mass * 15) / Math.sqrt(radius)
      const angle = angleBase - t * orbitalSpeed
      const noiseY = noiseSeed * (radius * 0.05) * Math.cos(t * 0.5 + i)

      target.set(
        Math.cos(angle) * radius,
        noiseY,
        Math.sin(angle) * radius,
      )

      // TON 618: hot white core → deep orange outer ring
      const temp = Math.max(0, 1 - Math.pow(ratio, 0.5))
      const hue = 0.04 + (1 - temp) * 0.07      // orange-red → orange
      const lightness = Math.min(1.0, 0.08 + temp * temp * 1.5)

      pColor.setHSL(hue, 1.0, lightness)
      positions[i].lerp(target, 0.1)
      dummy.position.copy(positions[i])
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, pColor)
    }

    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor.needsUpdate = true

    group.rotation.y += 0.0002
  }

  function dispose() {
    geometry.dispose()
    material.dispose()
    scene.remove(group)
  }

  return { update, dispose }
}
