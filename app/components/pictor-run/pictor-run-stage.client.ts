import {
  AdditiveBlending,
  type AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  type DirectionalLight,
  DodecahedronGeometry,
  DoubleSide,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  type Object3D,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RepeatWrapping,
  type Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  type Texture,
} from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

/**
 * 「ぴくたーちゃんラン」のステージ（空・山・丘・並木・絵の並ぶ道・崖と水面）。
 * 形はすべてここで組み立てるので、読み込むファイルは増えない。
 * 走った距離に合わせて、昼 → 夕方 → 夜 → 朝 と移り変わる
 */

type Track = <T extends { dispose: () => void }>(item: T) => T

export type PictorRunStage = {
  /** move = この 1 コマで道が流れた長さ、distance = 走った距離（m） */
  update: (move: number, dt: number, time: number, distance: number) => void
}

export function canvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (ctx) draw(ctx)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/** いつも同じ並びになる乱数（ステージの配置を毎回そろえる） */
const createRandom = (seed: number) => {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

const matrix = (
  x: number,
  y: number,
  z: number,
  sx = 1,
  sy = sx,
  sz = sx,
  rotZ = 0,
  rotY = 0,
) => {
  const m = new Matrix4().makeTranslation(x, y, z)
  if (rotY !== 0) m.multiply(new Matrix4().makeRotationY(rotY))
  if (rotZ !== 0) m.multiply(new Matrix4().makeRotationZ(rotZ))
  return m.multiply(new Matrix4().makeScale(sx, sy, sz))
}

/** 色を頂点に塗った部品（あとで 1 つの形にまとめる） */
const part = (source: BufferGeometry, color: number, m: Matrix4) => {
  const geometry = source.index ? source.toNonIndexed() : source.clone()
  geometry.applyMatrix4(m)
  geometry.deleteAttribute("uv")
  const c = new Color(color)
  const count = geometry.getAttribute("position").count
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3))
  return geometry
}

const join = (parts: BufferGeometry[]) => {
  const merged = mergeGeometries(parts)
  for (const item of parts) item.dispose()
  return merged
}

type Palette = {
  skyTop: number
  skyMid: number
  skyBottom: number
  sun: number
  sunLight: number
  sunPower: number
  ambient: number
  ambientPower: number
  far: number
  near: number
  cloud: number
  stars: number
  lamp: number
  /** 太陽（月）の高さ 0〜1 */
  height: number
}

const PALETTES: Palette[] = [
  // 昼
  {
    skyTop: 0x4aa8ff,
    skyMid: 0x9fd8ff,
    skyBottom: 0xe8f8ff,
    sun: 0xfff6c9,
    sunLight: 0xffffff,
    sunPower: 1.65,
    ambient: 0xffffff,
    ambientPower: 1.5,
    far: 0xa9cdf5,
    near: 0x86b7ec,
    cloud: 0xffffff,
    stars: 0,
    lamp: 0,
    height: 0.6,
  },
  // 夕方
  {
    skyTop: 0x5a6fd6,
    skyMid: 0xff9e8a,
    skyBottom: 0xffe0a3,
    sun: 0xffb347,
    sunLight: 0xffc38a,
    sunPower: 1.5,
    ambient: 0xffd9cf,
    ambientPower: 1.35,
    far: 0xc89ad1,
    near: 0x9a78c4,
    cloud: 0xffd3c4,
    stars: 0.15,
    lamp: 0.7,
    height: 0.28,
  },
  // 夜
  {
    skyTop: 0x0d1440,
    skyMid: 0x25347e,
    skyBottom: 0x5a5fb5,
    sun: 0xf4f1ff,
    sunLight: 0xaebcff,
    sunPower: 1.05,
    ambient: 0xb9c4ff,
    ambientPower: 1.15,
    far: 0x303c86,
    near: 0x232b68,
    cloud: 0x7c86cf,
    stars: 1,
    lamp: 1,
    height: 0.62,
  },
  // 朝
  {
    skyTop: 0x6fa6ff,
    skyMid: 0xffc9d6,
    skyBottom: 0xfff1c9,
    sun: 0xffe08a,
    sunLight: 0xffe6c9,
    sunPower: 1.5,
    ambient: 0xfff0f2,
    ambientPower: 1.4,
    far: 0xc7b6ea,
    near: 0xa696dd,
    cloud: 0xffe9ee,
    stars: 0,
    lamp: 0.2,
    height: 0.3,
  },
]

/** 1 つの時間帯の長さ（m）。そのうち後ろの 3 割で次の時間帯へ移る */
const PHASE_LENGTH = 140

/** ステージがくり返す長さ */
const SPAN = 72

type Scroller = { object: Object3D; speed: number; span: number; min: number }

export function createPictorRunStage(
  scene: Scene,
  track: Track,
  gradientMap: Texture,
  lights: { ambient: AmbientLight; sun: DirectionalLight },
): PictorRunStage {
  const random = createRandom(404)
  const scrollers: Scroller[] = []
  const scroll = (object: Object3D, speed: number, span: number, min = -20) => {
    scene.add(object)
    scrollers.push({ object, speed, span, min })
  }

  const toonVertex = track(
    new MeshToonMaterial({ vertexColors: true, gradientMap }),
  )
  const toonMap = (map: Texture) =>
    track(new MeshToonMaterial({ map, gradientMap }))

  // ---- 空 ---------------------------------------------------------------------
  const skyGeometry = track(new PlaneGeometry(520, 190, 1, 2))
  skyGeometry.setAttribute(
    "color",
    new BufferAttribute(new Float32Array(6 * 3), 3),
  )
  const sky = new Mesh(
    skyGeometry,
    track(new MeshBasicMaterial({ vertexColors: true, depthWrite: false })),
  )
  sky.position.set(10, 38, -95)
  sky.renderOrder = -10
  scene.add(sky)

  const glowTexture = track(
    canvasTexture(128, 128, (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62)
      g.addColorStop(0, "rgba(255,255,255,1)")
      g.addColorStop(0.25, "rgba(255,255,255,0.55)")
      g.addColorStop(1, "rgba(255,255,255,0)")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 128, 128)
    }),
  )
  const sunMaterial = track(new MeshBasicMaterial({ color: 0xffffff }))
  const sunGlowMaterial = track(
    new MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0.7,
    }),
  )
  const sunDisc = new Group()
  sunDisc.add(new Mesh(track(new CircleGeometry(3.4, 40)), sunMaterial))
  const sunGlow = new Mesh(track(new PlaneGeometry(26, 26)), sunGlowMaterial)
  sunGlow.position.z = -0.1
  sunDisc.add(sunGlow)
  scene.add(sunDisc)

  // 星
  const starCount = 220
  const starPositions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = -120 + random() * 260
    starPositions[i * 3 + 1] = 8 + random() * 70
    starPositions[i * 3 + 2] = -90
  }
  const starGeometry = track(new BufferGeometry())
  starGeometry.setAttribute("position", new BufferAttribute(starPositions, 3))
  const starMaterial = track(
    new PointsMaterial({
      color: 0xffffff,
      size: 2.2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  )
  scene.add(new Points(starGeometry, starMaterial))

  // ---- 遠くの山なみ（2 枚重ね） ---------------------------------------------
  const ridge = (width: number, base: number, peaks: number, seed: number) => {
    const r = createRandom(seed)
    const shape = new Shape()
    shape.moveTo(0, -30)
    const heights: number[] = []
    for (let i = 0; i < peaks; i++) heights.push(base * (0.45 + r() * 0.75))
    for (let i = 0; i <= peaks * 2; i++) {
      const x = (width * i) / (peaks * 2)
      // 両端の高さをそろえて、並べたときに段差が出ないようにする
      const peak = heights[Math.floor(i / 2) % peaks]
      const valley = base * 0.28
      shape.lineTo(x, i % 2 === 1 ? peak : valley)
    }
    shape.lineTo(width, -30)
    return track(new ShapeGeometry(shape))
  }
  const farMaterial = track(new MeshBasicMaterial({ color: 0xa9cdf5 }))
  const nearMaterial = track(new MeshBasicMaterial({ color: 0x86b7ec }))
  for (const [material, z, base, speed, seed] of [
    [farMaterial, -78, 30, 0.012, 11],
    [nearMaterial, -58, 17, 0.03, 23],
  ] as const) {
    const width = 150
    const geometry = ridge(width, base, 7, seed)
    for (let i = 0; i < 3; i++) {
      const mesh = new Mesh(geometry, material)
      mesh.position.set(-150 + i * width, -4, z)
      scroll(mesh, speed, width * 3, -260)
    }
  }

  // ---- 雲 ---------------------------------------------------------------------
  const cloudMaterial = track(new MeshBasicMaterial({ color: 0xffffff }))
  const cloudGeometry = track(
    join(
      [
        [0, 0, 1],
        [1.0, 0.1, 0.78],
        [-1.0, 0.0, 0.72],
        [0.35, 0.5, 0.74],
        [-0.45, 0.4, 0.6],
        [1.8, -0.1, 0.5],
        [-1.8, -0.12, 0.46],
      ].map(([x, y, s]) =>
        part(
          new SphereGeometry(1, 16, 12),
          0xffffff,
          matrix(x, y, 0, s, s * 0.7, s * 0.6),
        ),
      ),
    ),
  )
  for (let i = 0; i < 9; i++) {
    const cloud = new Mesh(cloudGeometry, cloudMaterial)
    const depth = -30 - random() * 22
    cloud.position.set(-40 + i * 16 + random() * 6, 9 + random() * 13, depth)
    cloud.scale.setScalar(1.8 + random() * 2.2)
    scroll(cloud, 0.03 + random() * 0.03, 9 * 16, -70)
  }

  // ---- 空に浮かぶ大きな額ぶち（Aipictors らしさ） -----------------------------
  const paintings = [
    // 夕焼けの海
    (ctx: CanvasRenderingContext2D) => {
      const g = ctx.createLinearGradient(0, 0, 0, 128)
      g.addColorStop(0, "#ff7eb3")
      g.addColorStop(0.55, "#ffd86f")
      g.addColorStop(0.56, "#4a7bd6")
      g.addColorStop(1, "#243b8f")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 160, 128)
      ctx.fillStyle = "#fff4c2"
      ctx.beginPath()
      ctx.arc(80, 70, 22, Math.PI, 0)
      ctx.fill()
    },
    // 山と月
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#2b2f77"
      ctx.fillRect(0, 0, 160, 128)
      ctx.fillStyle = "#fdf3c8"
      ctx.beginPath()
      ctx.arc(118, 34, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "#6d7be0"
      ctx.beginPath()
      ctx.moveTo(0, 128)
      ctx.lineTo(50, 44)
      ctx.lineTo(96, 128)
      ctx.fill()
      ctx.fillStyle = "#19b5d8"
      ctx.beginPath()
      ctx.moveTo(56, 128)
      ctx.lineTo(112, 66)
      ctx.lineTo(160, 128)
      ctx.fill()
    },
    // ぴくたーちゃんの色のしま模様
    (ctx: CanvasRenderingContext2D) => {
      const colors = ["#1d2f8f", "#ff8a1f", "#19b5d8", "#ffffff", "#ff8a1f"]
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = colors[i % colors.length]
        ctx.beginPath()
        ctx.moveTo(i * 26 - 60, 0)
        ctx.lineTo(i * 26 - 34, 0)
        ctx.lineTo(i * 26 - 94, 128)
        ctx.lineTo(i * 26 - 120, 128)
        ctx.fill()
      }
    },
    // 花畑
    (ctx: CanvasRenderingContext2D) => {
      const g = ctx.createLinearGradient(0, 0, 0, 128)
      g.addColorStop(0, "#8fd3ff")
      g.addColorStop(0.5, "#d9f4ff")
      g.addColorStop(0.51, "#8fdc8a")
      g.addColorStop(1, "#4fb96a")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 160, 128)
      const r = createRandom(7)
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = ["#ff7eb3", "#fff27a", "#ffffff", "#ffa64d"][i % 4]
        ctx.beginPath()
        ctx.arc(r() * 160, 70 + r() * 56, 2 + r() * 3, 0, Math.PI * 2)
        ctx.fill()
      }
    },
  ]
  const paintingMaterials = paintings.map((draw) =>
    toonMap(track(canvasTexture(160, 128, draw))),
  )
  const frameGeometry = track(
    join([
      part(new BoxGeometry(1.36, 0.1, 0.1), 0xf2c14e, matrix(0, 0.53, 0)),
      part(new BoxGeometry(1.36, 0.1, 0.1), 0xf2c14e, matrix(0, -0.53, 0)),
      part(new BoxGeometry(0.1, 1.16, 0.1), 0xf2c14e, matrix(-0.63, 0, 0)),
      part(new BoxGeometry(0.1, 1.16, 0.1), 0xf2c14e, matrix(0.63, 0, 0)),
    ]),
  )
  const paintingGeometry = track(new PlaneGeometry(1.2, 0.98))
  const makeFramed = (index: number) => {
    const framed = new Group()
    framed.add(new Mesh(frameGeometry, toonVertex))
    framed.add(new Mesh(paintingGeometry, paintingMaterials[index % 4]))
    return framed
  }
  const floaters: { object: Object3D; base: number; phase: number }[] = []
  for (let i = 0; i < 5; i++) {
    const framed = makeFramed(i)
    const size = 2.6 + random() * 2.4
    framed.scale.setScalar(size)
    framed.rotation.set(0, 0.25 - random() * 0.5, (random() - 0.5) * 0.3)
    const base = 6.5 + random() * 5
    framed.position.set(-20 + i * 19 + random() * 6, base, -20 - random() * 9)
    scroll(framed, 0.5, 5 * 19, -45)
    floaters.push({ object: framed, base, phase: random() * 6 })
  }

  // ---- 丘 ---------------------------------------------------------------------
  const hillGeometry = track(new SphereGeometry(1, 40, 20))
  const hillMaterials = [0x9fdf8f, 0x86d49a, 0xb7e9a2, 0x74c98b].map((color) =>
    track(new MeshToonMaterial({ color, gradientMap })),
  )
  for (let i = 0; i < 10; i++) {
    const hill = new Mesh(hillGeometry, hillMaterials[i % 4])
    const size = 3.2 + random() * 3.4
    hill.scale.set(size * (1.5 + random() * 0.6), size, size)
    hill.position.set(-24 + i * 8.5, -1.5, -11 - random() * 6)
    scroll(hill, 1, 10 * 8.5, -32)
  }

  // ---- 道・草地・崖・水面 -----------------------------------------------------
  const pathTexture = track(
    canvasTexture(256, 256, (ctx) => {
      ctx.fillStyle = "#f6ead2"
      ctx.fillRect(0, 0, 256, 256)
      const r = createRandom(31)
      const tones = ["#fbf1dd", "#f1e0c2", "#f7e6c8", "#ecd9b8", "#fdf5e6"]
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const offset = row % 2 === 0 ? 0 : 32
          ctx.fillStyle = tones[Math.floor(r() * tones.length)]
          const x = col * 64 + offset
          ctx.beginPath()
          ctx.roundRect(x + 3, row * 64 + 3, 58, 58, 9)
          ctx.fill()
          if (x + 64 > 256) {
            ctx.beginPath()
            ctx.roundRect(x - 256 + 3, row * 64 + 3, 58, 58, 9)
            ctx.fill()
          }
        }
      }
    }),
  )
  pathTexture.wrapS = RepeatWrapping
  pathTexture.wrapT = RepeatWrapping
  const PATH_TILE = 2.4
  pathTexture.repeat.set(90 / PATH_TILE, 1)
  const path = new Mesh(track(new PlaneGeometry(90, 2.4)), toonMap(pathTexture))
  path.rotation.x = -Math.PI / 2
  path.position.set(14, 0.004, 0)
  scene.add(path)

  const curbGeometry = track(new BoxGeometry(90, 0.1, 0.16))
  const curbMaterial = track(
    new MeshToonMaterial({ color: 0xffffff, gradientMap }),
  )
  for (const z of [-1.28, 1.28]) {
    const curb = new Mesh(curbGeometry, curbMaterial)
    curb.position.set(14, 0.02, z)
    scene.add(curb)
  }

  const grassTexture = track(
    canvasTexture(256, 256, (ctx) => {
      ctx.fillStyle = "#8ed67c"
      ctx.fillRect(0, 0, 256, 256)
      const r = createRandom(5)
      for (let i = 0; i < 420; i++) {
        ctx.fillStyle = ["#a4e390", "#7fcb6f", "#9bdc86", "#b6ec9f"][i % 4]
        const x = r() * 256
        const y = r() * 256
        ctx.beginPath()
        ctx.ellipse(x, y, 2 + r() * 5, 1.5 + r() * 2.5, r() * 3, 0, Math.PI * 2)
        ctx.fill()
      }
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = ["#ffffff", "#fff27a", "#ffb3d1"][i % 3]
        ctx.beginPath()
        ctx.arc(10 + r() * 236, 10 + r() * 236, 2.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }),
  )
  grassTexture.wrapS = RepeatWrapping
  grassTexture.wrapT = RepeatWrapping
  const GRASS_TILE = 4
  const grassMaterial = toonMap(grassTexture)
  grassTexture.repeat.set(90 / GRASS_TILE, 12.5)
  const backGrass = new Mesh(track(new PlaneGeometry(90, 50)), grassMaterial)
  backGrass.rotation.x = -Math.PI / 2
  backGrass.position.set(14, 0, -26.3)
  scene.add(backGrass)
  const frontGrassGeometry = track(new PlaneGeometry(90, 1.3))
  // 手前の細い草地は、模様がつぶれないように貼る範囲を狭める
  const frontUv = frontGrassGeometry.getAttribute("uv") as BufferAttribute
  for (let i = 0; i < frontUv.count; i++) {
    frontUv.setY(i, (frontUv.getY(i) * 1.3) / 50)
  }
  const frontGrass = new Mesh(frontGrassGeometry, grassMaterial)
  frontGrass.rotation.x = -Math.PI / 2
  frontGrass.position.set(14, 0, 1.95)
  scene.add(frontGrass)

  const cliffTexture = track(
    canvasTexture(256, 256, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256)
      g.addColorStop(0, "#c98a56")
      g.addColorStop(0.5, "#a96b45")
      g.addColorStop(1, "#7c4a36")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 256, 256)
      const r = createRandom(17)
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = ["#d9a273", "#8f5a3c", "#b98058"][i % 3]
        ctx.beginPath()
        ctx.ellipse(
          r() * 256,
          50 + r() * 200,
          6 + r() * 14,
          4 + r() * 7,
          0,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }
      // 上のふちから垂れる草
      ctx.fillStyle = "#7fcb6f"
      ctx.fillRect(0, 0, 256, 16)
      for (let i = 0; i < 8; i++) {
        ctx.beginPath()
        ctx.arc(16 + i * 32, 16, 16, 0, Math.PI)
        ctx.fill()
      }
      ctx.fillStyle = "#9bdc86"
      for (let i = 0; i < 8; i++) {
        ctx.beginPath()
        ctx.arc(32 + i * 32, 8, 10, 0, Math.PI)
        ctx.fill()
      }
    }),
  )
  cliffTexture.wrapS = RepeatWrapping
  const CLIFF_TILE = 3.2
  cliffTexture.repeat.set(90 / CLIFF_TILE, 1)
  const cliff = new Mesh(
    track(new PlaneGeometry(90, 3.2)),
    toonMap(cliffTexture),
  )
  cliff.position.set(14, -1.6, 2.6)
  scene.add(cliff)

  const waterTexture = track(
    canvasTexture(256, 256, (ctx) => {
      ctx.fillStyle = "#58b8f0"
      ctx.fillRect(0, 0, 256, 256)
      ctx.strokeStyle = "rgba(255,255,255,0.75)"
      ctx.lineWidth = 5
      ctx.lineCap = "round"
      const r = createRandom(3)
      for (let i = 0; i < 16; i++) {
        const x = 20 + r() * 216
        const y = 20 + r() * 216
        ctx.beginPath()
        ctx.arc(x, y, 14, Math.PI * 1.15, Math.PI * 1.85)
        ctx.stroke()
      }
    }),
  )
  waterTexture.wrapS = RepeatWrapping
  waterTexture.wrapT = RepeatWrapping
  waterTexture.repeat.set(20, 9)
  const water = new Mesh(
    track(new PlaneGeometry(160, 70)),
    toonMap(waterTexture),
  )
  water.rotation.x = -Math.PI / 2
  water.position.set(14, -3.2, 37.4)
  scene.add(water)
  // ---- 道ばたのもの -----------------------------------------------------------
  const sphere = (segments = 12) =>
    new SphereGeometry(1, segments, Math.max(6, segments - 4))
  const roundTree = (leafA: number, leafB: number, leafC: number) =>
    track(
      join([
        part(
          new CylinderGeometry(0.11, 0.17, 1.2, 8),
          0x9a6a4a,
          matrix(0, 0.6, 0),
        ),
        part(sphere(14), leafA, matrix(0, 1.75, 0, 0.82, 0.78, 0.82)),
        part(sphere(12), leafB, matrix(-0.5, 1.4, 0.1, 0.56)),
        part(sphere(12), leafB, matrix(0.52, 1.45, -0.05, 0.6)),
        part(sphere(12), leafC, matrix(0.1, 2.2, 0.05, 0.52)),
        part(sphere(10), leafC, matrix(-0.2, 1.6, 0.5, 0.45)),
      ]),
    )
  const treeGeometries = [
    roundTree(0x6fcf7a, 0x55bd6e, 0x8fe08a),
    roundTree(0xffb7d5, 0xff9cc4, 0xffd3e6),
    roundTree(0x7ad6a0, 0x5cc48d, 0xa1e8b6),
    track(
      join([
        part(
          new CylinderGeometry(0.1, 0.14, 0.7, 8),
          0x8a5a40,
          matrix(0, 0.35, 0),
        ),
        part(new ConeGeometry(0.75, 1.1, 10), 0x3fa66a, matrix(0, 1.1, 0)),
        part(new ConeGeometry(0.6, 1.0, 10), 0x4fb877, matrix(0, 1.7, 0)),
        part(new ConeGeometry(0.42, 0.9, 10), 0x63c888, matrix(0, 2.3, 0)),
      ]),
    ),
  ]
  const bushGeometry = track(
    join([
      part(sphere(10), 0x62c474, matrix(0, 0.28, 0, 0.45, 0.36, 0.4)),
      part(sphere(10), 0x79d486, matrix(0.36, 0.22, 0.05, 0.34, 0.28, 0.32)),
      part(sphere(10), 0x55b86a, matrix(-0.34, 0.2, 0, 0.3, 0.26, 0.3)),
    ]),
  )
  const flowerGeometry = (petal: number) =>
    track(
      join(
        [
          [0, 0, 0.34],
          [0.22, 0.1, 0.26],
          [-0.2, -0.06, 0.3],
          [0.08, -0.2, 0.22],
          [-0.1, 0.2, 0.38],
        ].flatMap(([x, z, h]) => [
          part(
            new CylinderGeometry(0.012, 0.012, h, 5),
            0x4fae62,
            matrix(x, h / 2, z),
          ),
          part(sphere(8), petal, matrix(x, h, z, 0.07, 0.05, 0.07)),
          part(sphere(6), 0xffe36b, matrix(x, h + 0.03, z, 0.03)),
        ]),
      ),
    )
  const flowerGeometries = [0xffffff, 0xff8fb8, 0xffa64d, 0x8fd0ff].map(
    flowerGeometry,
  )
  const fenceGeometry = track(
    join([
      part(new BoxGeometry(3.2, 0.07, 0.05), 0xffffff, matrix(0, 0.5, 0)),
      part(new BoxGeometry(3.2, 0.07, 0.05), 0xffffff, matrix(0, 0.25, 0)),
      ...[-1.4, -0.84, -0.28, 0.28, 0.84, 1.4].flatMap((x) => [
        part(
          new BoxGeometry(0.12, 0.66, 0.06),
          0xffffff,
          matrix(x, 0.33, 0.03),
        ),
        part(
          new ConeGeometry(0.085, 0.12, 4),
          0xffffff,
          matrix(x, 0.72, 0.03, 1, 1, 0.5, 0, Math.PI / 4),
        ),
      ]),
    ]),
  )
  const rockGeometry = track(
    join([
      part(
        new DodecahedronGeometry(0.3),
        0xb9c0cf,
        matrix(0, 0.16, 0, 1, 0.7, 0.9),
      ),
      part(new DodecahedronGeometry(0.18), 0xcdd3df, matrix(0.32, 0.09, 0.08)),
    ]),
  )
  const lampGeometry = track(
    join([
      part(
        new CylinderGeometry(0.05, 0.07, 2.3, 8),
        0x2c3b82,
        matrix(0, 1.15, 0),
      ),
      part(
        new CylinderGeometry(0.12, 0.14, 0.12, 8),
        0x2c3b82,
        matrix(0, 0.06, 0),
      ),
      part(new BoxGeometry(0.5, 0.05, 0.05), 0x2c3b82, matrix(0.22, 2.25, 0)),
      part(new ConeGeometry(0.2, 0.16, 8), 0x2c3b82, matrix(0.44, 2.2, 0)),
      part(sphere(10), 0xfff1b0, matrix(0.44, 2.04, 0, 0.13)),
    ]),
  )
  const easelGeometry = track(
    join([
      part(
        new BoxGeometry(0.05, 1.5, 0.05),
        0xb9855a,
        matrix(-0.32, 0.72, 0, 1, 1, 1, -0.16),
      ),
      part(
        new BoxGeometry(0.05, 1.5, 0.05),
        0xb9855a,
        matrix(0.32, 0.72, 0, 1, 1, 1, 0.16),
      ),
      part(
        new BoxGeometry(0.05, 1.4, 0.05),
        0xa57550,
        matrix(0, 0.68, -0.3, 1, 1, 1, 0, 0),
      ),
      part(new BoxGeometry(0.9, 0.05, 0.1), 0xb9855a, matrix(0, 0.62, 0.05)),
      part(new BoxGeometry(0.92, 0.72, 0.04), 0xffffff, matrix(0, 1.0, 0.03)),
    ]),
  )
  const easelPaintingGeometry = track(new PlaneGeometry(0.82, 0.62))
  const signTexture = (text: string, color: string) =>
    toonMap(
      track(
        canvasTexture(160, 80, (ctx) => {
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.roundRect(0, 0, 160, 80, 14)
          ctx.fill()
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 6
          ctx.beginPath()
          ctx.roundRect(7, 7, 146, 66, 10)
          ctx.stroke()
          ctx.fillStyle = "#ffffff"
          ctx.font = "900 34px system-ui, sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(text, 80, 42)
        }),
      ),
    )
  const signMaterials = [
    signTexture("404 →", "#ff8f6b"),
    signTexture("Aipictors", "#2d6cdf"),
    signTexture("GO! GO!", "#19b5a8"),
  ]
  const signPoleGeometry = track(
    join([
      part(
        new CylinderGeometry(0.045, 0.055, 1.25, 8),
        0xb9855a,
        matrix(0, 0.62, 0),
      ),
      part(new BoxGeometry(1.06, 0.56, 0.05), 0xfff7e6, matrix(0, 1.3, 0)),
    ]),
  )
  const signBoardGeometry = track(new PlaneGeometry(1.0, 0.5))

  const lampGlowMaterial = track(
    new MeshBasicMaterial({
      map: glowTexture,
      color: 0xffe9a3,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0,
    }),
  )
  const lampGlowGeometry = track(new PlaneGeometry(2.4, 2.4))

  const prop = (
    geometry: BufferGeometry,
    x: number,
    z: number,
    scale = 1,
    rotY = 0,
  ) => {
    const mesh = new Mesh(geometry, toonVertex)
    mesh.position.set(x, 0, z)
    mesh.scale.setScalar(scale)
    mesh.rotation.y = rotY
    scroll(mesh, 1, SPAN)
    return mesh
  }

  // 並木（奥の草地）
  for (let i = 0; i < 22; i++) {
    const x = -18 + (i * SPAN) / 22 + random() * 1.6
    const z = -3.0 - random() * 5.2
    prop(
      treeGeometries[Math.floor(random() * 4)],
      x,
      z,
      0.85 + random() * 0.7,
      random() * 6,
    )
  }
  for (let i = 0; i < 16; i++) {
    prop(
      bushGeometry,
      -18 + (i * SPAN) / 16 + random() * 2,
      -1.9 - random() * 4,
      0.8 + random() * 0.8,
      random() * 6,
    )
  }
  for (let i = 0; i < 26; i++) {
    const front = i % 3 === 0
    prop(
      flowerGeometries[i % 4],
      -18 + (i * SPAN) / 26 + random() * 1.5,
      front ? 1.75 + random() * 0.6 : -1.6 - random() * 2.6,
      front ? 0.45 + random() * 0.2 : 0.55 + random() * 0.4,
      random() * 6,
    )
  }
  for (let i = 0; i < 9; i++) {
    prop(
      rockGeometry,
      -18 + (i * SPAN) / 9 + random() * 4,
      -1.9 - random() * 3.4,
      0.7 + random() * 0.8,
      random() * 6,
    )
  }
  // さく（道の奥側に、ところどころ）
  for (let i = 0; i < 8; i++) {
    if (i % 4 === 3) continue
    prop(fenceGeometry, -18 + i * 9 + 1.6, -1.62)
  }
  // 街灯
  for (let i = 0; i < 4; i++) {
    const lamp = new Group()
    lamp.add(new Mesh(lampGeometry, toonVertex))
    const glow = new Mesh(lampGlowGeometry, lampGlowMaterial)
    glow.position.set(0.44, 2.04, 0.1)
    lamp.add(glow)
    lamp.position.set(-14 + i * 18, 0, -1.9)
    scroll(lamp, 1, SPAN)
  }
  // イーゼルに立てかけた絵
  for (let i = 0; i < 5; i++) {
    const easel = new Group()
    easel.add(new Mesh(easelGeometry, toonVertex))
    const painting = new Mesh(
      easelPaintingGeometry,
      paintingMaterials[(i + 1) % 4],
    )
    painting.position.set(0, 1.0, 0.055)
    easel.add(painting)
    easel.position.set(-9 + i * 14.4 + random() * 3, 0, -2.2 - random() * 0.8)
    easel.rotation.y = 0.2 + random() * 0.4
    easel.rotation.x = -0.08
    easel.scale.setScalar(1.15)
    scroll(easel, 1, SPAN)
  }
  // 立て札
  for (let i = 0; i < 3; i++) {
    const sign = new Group()
    sign.add(new Mesh(signPoleGeometry, toonVertex))
    const board = new Mesh(signBoardGeometry, signMaterials[i])
    board.position.set(0, 1.3, 0.03)
    sign.add(board)
    sign.position.set(-4 + i * 24, 0, -2.0)
    sign.rotation.y = 0.18
    scroll(sign, 1, SPAN)
  }

  // ---- 舞う花びら -------------------------------------------------------------
  const petalCount = 70
  const petalPositions = new Float32Array(petalCount * 3)
  const petalSeeds: number[] = []
  for (let i = 0; i < petalCount; i++) {
    petalPositions[i * 3] = -8 + random() * 34
    petalPositions[i * 3 + 1] = random() * 7
    petalPositions[i * 3 + 2] = -5 + random() * 7.5
    petalSeeds.push(random() * 10)
  }
  const petalGeometry = track(new BufferGeometry())
  petalGeometry.setAttribute("position", new BufferAttribute(petalPositions, 3))
  const petalMaterial = track(
    new PointsMaterial({
      map: track(
        canvasTexture(32, 32, (ctx) => {
          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.ellipse(16, 16, 13, 7, 0.6, 0, Math.PI * 2)
          ctx.fill()
        }),
      ),
      color: 0xffc4dc,
      size: 0.3,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
      side: DoubleSide,
    }),
  )
  const petals = new Points(petalGeometry, petalMaterial)
  petals.frustumCulled = false
  scene.add(petals)

  // ---- 時間帯 -----------------------------------------------------------------
  const colorA = new Color()
  const colorB = new Color()
  const lerpColor = (a: number, b: number, t: number) =>
    colorA.set(a).lerp(colorB.set(b), t)
  const skyColors = skyGeometry.getAttribute("color") as BufferAttribute
  const setRow = (row: number, color: Color) => {
    skyColors.setXYZ(row * 2, color.r, color.g, color.b)
    skyColors.setXYZ(row * 2 + 1, color.r, color.g, color.b)
  }

  const applyPalette = (distance: number) => {
    const position = distance / PHASE_LENGTH
    const index = Math.floor(position) % PALETTES.length
    const within = position - Math.floor(position)
    const raw = Math.max(0, (within - 0.7) / 0.3)
    const t = raw * raw * (3 - 2 * raw)
    const a = PALETTES[index]
    const b = PALETTES[(index + 1) % PALETTES.length]
    const mix = (x: number, y: number) => x + (y - x) * t

    setRow(0, lerpColor(a.skyTop, b.skyTop, t))
    setRow(1, lerpColor(a.skyMid, b.skyMid, t))
    setRow(2, lerpColor(a.skyBottom, b.skyBottom, t))
    skyColors.needsUpdate = true

    lights.sun.color.copy(lerpColor(a.sunLight, b.sunLight, t))
    lights.sun.intensity = mix(a.sunPower, b.sunPower)
    lights.ambient.color.copy(lerpColor(a.ambient, b.ambient, t))
    lights.ambient.intensity = mix(a.ambientPower, b.ambientPower)
    farMaterial.color.copy(lerpColor(a.far, b.far, t))
    nearMaterial.color.copy(lerpColor(a.near, b.near, t))
    cloudMaterial.color.copy(lerpColor(a.cloud, b.cloud, t))
    starMaterial.opacity = mix(a.stars, b.stars)
    lampGlowMaterial.opacity = mix(a.lamp, b.lamp) * 0.55
    // 沈んで、次の太陽（月）が昇る
    const height =
      t < 0.5
        ? a.height + (-0.3 - a.height) * (t * 2)
        : -0.3 + (b.height + 0.3) * (t * 2 - 1)
    sunDisc.position.set(34 - index * 4 - t * 4, 6 + height * 30, -88)
    sunMaterial.color.set(t >= 0.5 ? b.sun : a.sun)
    sunGlowMaterial.color.copy(sunMaterial.color)
  }
  applyPalette(0)

  return {
    update: (move, dt, time, distance) => {
      for (const item of scrollers) {
        item.object.position.x -= move * item.speed
        if (item.object.position.x < item.min)
          item.object.position.x += item.span
      }
      pathTexture.offset.x = (pathTexture.offset.x + move / PATH_TILE) % 1
      grassTexture.offset.x = (grassTexture.offset.x + move / GRASS_TILE) % 1
      cliffTexture.offset.x = (cliffTexture.offset.x + move / CLIFF_TILE) % 1
      waterTexture.offset.x = (waterTexture.offset.x + move / 8 + dt * 0.02) % 1
      waterTexture.offset.y = (waterTexture.offset.y + dt * 0.03) % 1

      for (const item of floaters) {
        item.object.position.y =
          item.base + Math.sin(time * 0.7 + item.phase) * 0.35
      }

      const positions = petalGeometry.getAttribute(
        "position",
      ) as BufferAttribute
      for (let i = 0; i < petalCount; i++) {
        let x = positions.getX(i) - move - dt * (0.5 + (petalSeeds[i] % 1))
        let y = positions.getY(i) - dt * (0.35 + (petalSeeds[i] % 0.5))
        if (x < -9) x += 34
        if (y < 0) y += 7
        positions.setXYZ(
          i,
          x,
          y,
          positions.getZ(i) + Math.sin(time * 1.5 + petalSeeds[i]) * dt * 0.3,
        )
      }
      positions.needsUpdate = true

      applyPalette(distance)
    },
  }
}
