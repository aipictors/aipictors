import {
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from "three"

/**
 * ガチャ演出の背景の飾り（ネオンの光の線・シャボン玉・紙吹雪・雲）。
 * 明るい空の上で見えるよう、足し算ではなく色を塗って重ねる
 */

/** 空を横切るネオンの光の線 */
export function createNeonLines() {
  const group = new Group()
  const materials: ShaderMaterial[] = []
  const lines: [number, number, number, number, string][] = [
    // y, z, 傾き, 太さ, 色
    [3.4, -8, 0.3, 0.2, "#ff5fb8"],
    [2.9, -8.5, -0.24, 0.18, "#22ccff"],
    [4.4, -9, -0.1, 0.14, "#ff5fb8"],
    [2.0, -7.5, 0.13, 0.14, "#22ccff"],
    [5.2, -9.5, 0.2, 0.12, "#9a6bff"],
    [1.3, -7, -0.32, 0.12, "#ff7ac8"],
    [3.9, -8.2, 0.04, 0.1, "#55e6ff"],
  ]
  lines.forEach(([y, z, tilt, width, color], i) => {
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(color) },
        uShift: { value: i * 1.7 },
        uIntensity: { value: 1 },
      },
      vertexShader:
        /* glsl */ "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader: /* glsl */ `
        uniform float uTime;uniform vec3 uColor;uniform float uShift;uniform float uIntensity;varying vec2 vUv;
        void main(){
          float v=abs(vUv.y-0.5)*2.0;
          float core=smoothstep(0.3,0.0,v);
          float glow=pow(1.0-v,2.5);
          float ends=smoothstep(0.0,0.15,vUv.x)*smoothstep(1.0,0.85,vUv.x);
          float pulse=0.75+0.25*sin(vUv.x*30.0-uTime*4.0+uShift);
          vec3 col=mix(uColor,vec3(1.25),core*0.85);
          gl_FragColor=vec4(col,min(1.0,core+glow*0.8)*ends*pulse*uIntensity);
        }`,
    })
    const mesh = new Mesh(new PlaneGeometry(28, width), material)
    mesh.position.set(0, y, z)
    mesh.rotation.z = tilt
    group.add(mesh)
    materials.push(material)
  })
  return {
    group,
    update(t: number, intensity: number) {
      for (const m of materials) {
        m.uniforms.uTime.value = t
        m.uniforms.uIntensity.value = intensity
      }
    },
  }
}

const drawIcon = (glyph: string, color: string) => {
  const canvas = document.createElement("canvas")
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  ctx.font = "bold 92px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.lineJoin = "round"
  ctx.lineWidth = 14
  ctx.strokeStyle = color
  ctx.strokeText(glyph, 64, 68)
  ctx.fillStyle = "#ffffff"
  ctx.fillText(glyph, 64, 68)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

type Bubble = {
  object: Group
  base: Vector3
  bob: number
  speed: number
}

/** 中に音符や星が入ったシャボン玉 */
export function createBubbles() {
  const group = new Group()
  const bubbles: Bubble[] = []
  const geometry = new SphereGeometry(1, 32, 20)
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN;varying vec3 vV;
      void main(){
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;varying vec3 vN;varying vec3 vV;
      vec3 hue(float h){return clamp(abs(mod(h*6.0+vec3(0,4,2),6.0)-3.0)-1.0,0.0,1.0);}
      void main(){
        float f=1.0-abs(dot(vN,vV));
        float rim=pow(f,2.2);
        vec3 film=mix(vec3(0.55,0.95,1.0),hue(f*0.9+uTime*0.08),0.35);
        float spec=pow(max(dot(vN,normalize(vec3(-0.45,0.6,0.65))),0.0),60.0);
        vec3 col=film*(0.8+rim*0.5)+vec3(spec*1.4);
        gl_FragColor=vec4(col,0.1+rim*0.7+spec);
      }`,
  })
  const icons: [string, string][] = [
    ["♪", "#21b8e8"],
    ["♫", "#21b8e8"],
    ["✦", "#ff5fb8"],
    ["♥", "#ff6fa8"],
    ["★", "#ffb820"],
    ["♪", "#9a72ff"],
  ]
  const iconMaterials = icons.map(
    ([glyph, color]) =>
      new SpriteMaterial({
        map: drawIcon(glyph, color),
        transparent: true,
        depthWrite: false,
      }),
  )
  // 立ち位置の前と額縁の前はあけておく
  const spots: [number, number, number, number][] = [
    [-2.6, 1.9, -1.8, 0.34],
    [2.5, 2.2, -1.6, 0.3],
    [-1.7, 0.7, -0.4, 0.26],
    [1.9, 0.9, -0.3, 0.28],
    [-3.4, 0.4, -2.8, 0.36],
    [3.3, 0.6, -2.6, 0.34],
    [-1.2, 3.1, -2.4, 0.22],
    [1.4, 3.3, -2.2, 0.24],
    [-2.3, 2.9, -3.6, 0.3],
    [2.4, 1.4, -3.8, 0.32],
    [-0.9, 1.4, 0.2, 0.16],
    [1.0, 1.9, 0.1, 0.15],
    [-3.6, 2.6, -4.2, 0.4],
    [3.7, 3.0, -4.4, 0.42],
  ]
  spots.forEach(([x, y, z, r], i) => {
    const object = new Group()
    const shell = new Mesh(geometry, material)
    shell.scale.setScalar(r)
    const icon = new Sprite(iconMaterials[i % iconMaterials.length])
    icon.scale.setScalar(r * 1.1)
    object.add(shell, icon)
    group.add(object)
    bubbles.push({
      object,
      base: new Vector3(x, y, z),
      bob: i * 1.3,
      speed: 0.6 + (i % 4) * 0.15,
    })
  })
  return {
    group,
    update(t: number) {
      material.uniforms.uTime.value = t
      for (const b of bubbles) {
        b.object.position.set(
          b.base.x + Math.sin(t * 0.3 * b.speed + b.bob) * 0.12,
          b.base.y + Math.sin(t * b.speed + b.bob) * 0.12,
          b.base.z,
        )
      }
    },
  }
}

/** ひらひら落ちる紙吹雪 */
export function createConfetti(count = 220) {
  const mesh = new InstancedMesh(
    new PlaneGeometry(0.05, 0.03),
    new MeshBasicMaterial({ side: DoubleSide }),
    count,
  )
  const colors = ["#ff5fb8", "#3fd8ff", "#ffd23f", "#b48cff", "#ffffff"]
  const state = Array.from({ length: count }, (_, i) => {
    mesh.setColorAt(i, new Color(colors[i % colors.length]))
    return {
      p: new Vector3(
        (Math.random() - 0.5) * 9,
        Math.random() * 6 - 0.5,
        -Math.random() * 6 + 1.2,
      ),
      fall: 0.25 + Math.random() * 0.3,
      spin: new Vector3(
        Math.random() * 4,
        Math.random() * 4,
        Math.random() * 4,
      ),
      sway: Math.random() * 6,
    }
  })
  const dummy = new Object3D()
  return {
    mesh,
    update(t: number, dt: number) {
      state.forEach((c, i) => {
        c.p.y -= c.fall * dt
        if (c.p.y < -0.6) c.p.y += 6.2
        dummy.position.set(
          c.p.x + Math.sin(t * 1.3 + c.sway) * 0.15,
          c.p.y,
          c.p.z,
        )
        dummy.rotation.set(t * c.spin.x, t * c.spin.y, t * c.spin.z)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    },
  }
}

const drawCloud = () => {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  const puffs: [number, number, number][] = [
    [70, 82, 40],
    [120, 64, 52],
    [176, 78, 42],
    [210, 92, 28],
    [44, 98, 26],
    [128, 96, 40],
  ]
  for (const [x, y, r] of puffs) {
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r)
    g.addColorStop(0, "rgba(255,255,255,1)")
    g.addColorStop(0.7, "rgba(255,255,255,0.9)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/** ステージのうしろに浮かぶ雲 */
export function createClouds() {
  const group = new Group()
  const material = new SpriteMaterial({
    map: drawCloud(),
    transparent: true,
    depthWrite: false,
    color: new Color("#ffffff"),
  })
  const spots: [number, number, number, number][] = [
    [-6.5, -0.4, -10, 6],
    [-2.5, -0.9, -11, 5],
    [2.8, -0.7, -10.5, 6.5],
    [7, -0.2, -11, 5.5],
    [-9, 0.6, -13, 7],
    [9.5, 0.9, -13.5, 7],
    [0, -1.2, -12.5, 8],
  ]
  const sprites = spots.map(([x, y, z, s]) => {
    const sprite = new Sprite(material)
    sprite.position.set(x, y, z)
    sprite.scale.set(s, s / 2, 1)
    group.add(sprite)
    return sprite
  })
  return {
    group,
    material,
    update(t: number) {
      sprites.forEach((sprite, i) => {
        sprite.position.x = spots[i][0] + Math.sin(t * 0.05 + i) * 0.3
      })
    },
  }
}
