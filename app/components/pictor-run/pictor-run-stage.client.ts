import {
  AdditiveBlending,
  type AmbientLight,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DataTexture,
  type DirectionalLight,
  DodecahedronGeometry,
  DoubleSide,
  Euler,
  Fog,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  type Object3D,
  OctahedronGeometry,
  type PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  Quaternion,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  TorusGeometry,
  Vector3,
  type WebGLRenderer,
} from "three"
import { Reflector } from "three/examples/jsm/objects/Reflector.js"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import {
  inPictorRunStageOrder,
  PICTOR_RUN_STAGE_LENGTH,
  PICTOR_RUN_STAGES,
  toPictorRunStageFile,
} from "~/components/pictor-run/pictor-run-stages"

/**
 * 「ぴくたーちゃんラン」のステージ（空・山・丘・道ばたのもの・絵の並ぶ道・崖と水面）。
 * 形はすべてここで組み立てるので、読み込むファイルは増えない（額ぶちに飾る今日の作品の画像だけ別に読む）。
 * 走った距離に合わせて、草原 → さくら並木 → 海辺 → … とステージが移り変わる。
 * 道ばたのものは、画面の外で次のステージの形に入れ替えてから流れてくる
 */

type Track = <T extends { dispose: () => void }>(item: T) => T

export type PictorRunStage = {
  /** move = この 1 コマで道が流れた長さ、distance = 走った距離（m） */
  update: (move: number, dt: number, time: number, distance: number) => void
  /** 走った距離 distance のステージの景色に、すぐ切り替える（0 で最初に戻す） */
  warp: (distance: number) => void
  /** 額ぶちに飾る作品（読めたものから飾る。作者の名前の札も付ける） */
  setArtworks: (items: PictorRunStageArtwork[]) => void
  /** いまの雨の強さ（0〜1。雨音に使う） */
  rain: () => number
  /** 濡れた路面の映り込みを描くか（重い端末では、走っている途中でやめる） */
  setReflections: (on: boolean) => void
  dispose: () => void
}

/** 額ぶちに飾る作品 */
export type PictorRunStageArtwork = { id: string; url: string; author: string }

export type PictorRunStageOptions = {
  /** 額ぶちに作品を飾った（その回に出てきた作品を、あとで一覧にするため） */
  onArtworkShown?: (id: string) => void
  /** 軽量モード（置くものを減らし、舞うものを出さない） */
  lite: boolean
  /** 影を落とす */
  shadows: boolean
  /** かすみの濃さを、カメラの遠さに合わせる */
  camera: PerspectiveCamera
  /** 空の光を、ものに映す画像に焼くのに使う */
  renderer: WebGLRenderer
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

type V3 = [number, number, number]

const NO_ROTATION = new Quaternion()

const xf = (pos: V3, scale: number | V3 = 1, rotation?: V3) =>
  new Matrix4().compose(
    new Vector3(pos[0], pos[1], pos[2]),
    rotation
      ? new Quaternion().setFromEuler(
          new Euler(rotation[0], rotation[1], rotation[2]),
        )
      : NO_ROTATION,
    typeof scale === "number"
      ? new Vector3(scale, scale, scale)
      : new Vector3(scale[0], scale[1], scale[2]),
  )

/** 表面の手ざわり（模様の画像のどの色に入れてあるか） */
const WOOD = 0
const STONE = 1
const LEAF = 2
const PLASTER = 3

type PartShape = "flat" | "pole" | "cone" | "round" | "rock" | "gem"

const hsl = { h: 0, s: 0, l: 0 }

/** この色の部品は、夜に自分で光らせる（ネオンや溶岩。ステージの形を組み立てる間だけ入れる） */
let glowing: ReadonlySet<number> | null = null

/** 色と形から、木目・石・葉・ぬり壁のどれに見せるかを決める */
const surfaceOf = (color: Color, shape: PartShape) => {
  color.getHSL(hsl, SRGBColorSpace)
  const gray = hsl.s < 0.2 && hsl.l > 0.2 && hsl.l < 0.88
  if (shape === "rock") return hsl.s < 0.5 ? STONE : PLASTER
  if (shape === "gem") return PLASTER
  if (gray) return STONE
  const brown =
    hsl.h > 0.02 && hsl.h < 0.13 && hsl.s < 0.72 && hsl.l > 0.15 && hsl.l < 0.66
  if (brown && shape !== "round") return WOOD
  if (shape === "round") return LEAF
  if (shape === "cone" && hsl.h > 0.18 && hsl.h < 0.5) return LEAF
  return PLASTER
}

/** 色を頂点に塗った部品（あとで 1 つの形にまとめる） */
const part = (
  source: BufferGeometry,
  color: number,
  m: Matrix4,
  shape: PartShape = "flat",
) => {
  const geometry = source.index ? source.toNonIndexed() : source.clone()
  if (source.index) source.dispose()
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
  geometry.setAttribute(
    "surf",
    new BufferAttribute(new Float32Array(count).fill(surfaceOf(c, shape)), 1),
  )
  geometry.setAttribute(
    "glow",
    new BufferAttribute(
      new Float32Array(count).fill(glowing?.has(color) ? 1 : 0),
      1,
    ),
  )
  return geometry
}

/** 窓や電球など、夜に光る部品にする */
const lit = (geometry: BufferGeometry, power = 1) => {
  ;(geometry.getAttribute("glow").array as Float32Array).fill(power)
  return geometry
}

// ---- 模様のもと（くり返しても、つなぎ目が出ないノイズ） ------------------------
const FIELD = 256

/** なめらかなノイズ。cx・cy = 横・縦のます目の数 */
const tileNoise = (cx: number, cy: number, seed: number) => {
  const r = createRandom(seed)
  const grid = new Float32Array(cx * cy)
  for (let i = 0; i < grid.length; i++) grid[i] = r()
  const out = new Float32Array(FIELD * FIELD)
  for (let y = 0; y < FIELD; y++) {
    const fy = (y / FIELD) * cy
    const y0 = Math.floor(fy)
    const ty = fy - y0
    const sy = ty * ty * (3 - 2 * ty)
    const row0 = (y0 % cy) * cx
    const row1 = ((y0 + 1) % cy) * cx
    for (let x = 0; x < FIELD; x++) {
      const fx = (x / FIELD) * cx
      const x0 = Math.floor(fx)
      const tx = fx - x0
      const sx = tx * tx * (3 - 2 * tx)
      const a = x0 % cx
      const b = (x0 + 1) % cx
      const top = grid[row0 + a] + (grid[row0 + b] - grid[row0 + a]) * sx
      const bottom = grid[row1 + a] + (grid[row1 + b] - grid[row1 + a]) * sx
      out[y * FIELD + x] = top + (bottom - top) * sy
    }
  }
  return out
}

/** 細かさのちがうノイズを重ねたもの（0〜1、まん中は 0.5 あたり） */
const fbm = (cx: number, cy: number, octaves: number, seed: number) => {
  const out = new Float32Array(FIELD * FIELD)
  let power = 0.5
  let total = 0
  for (let o = 0; o < octaves; o++) {
    const layer = tileNoise(cx << o, cy << o, seed + o * 17)
    for (let i = 0; i < out.length; i++) out[i] += layer[i] * power
    total += power
    power *= 0.5
  }
  for (let i = 0; i < out.length; i++) out[i] /= total
  return out
}

/** 石の割れ目や葉のかたまりのもと。いちばん近い点・2 番めに近い点までの遠さ */
const cells = (count: number, seed: number) => {
  const r = createRandom(seed)
  const points = new Float32Array(count * count * 2)
  for (let i = 0; i < points.length; i++) points[i] = r()
  const near = new Float32Array(FIELD * FIELD)
  const edge = new Float32Array(FIELD * FIELD)
  for (let y = 0; y < FIELD; y++) {
    const py = (y / FIELD) * count
    const iy = Math.floor(py)
    for (let x = 0; x < FIELD; x++) {
      const px = (x / FIELD) * count
      const ix = Math.floor(px)
      let first = 9
      let second = 9
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const gx = (ix + dx + count) % count
          const gy = (iy + dy + count) % count
          const index = (gy * count + gx) * 2
          const ox = ix + dx + points[index] - px
          const oy = iy + dy + points[index + 1] - py
          const d = Math.sqrt(ox * ox + oy * oy)
          if (d < first) {
            second = first
            first = d
          } else if (d < second) {
            second = d
          }
        }
      }
      near[y * FIELD + x] = first
      edge[y * FIELD + x] = second - first
    }
  }
  return { near, edge }
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/**
 * 道ばたのものに貼る模様。1 枚の画像の 赤 = 木目、緑 = 石、青 = 葉、不透明度 = ぬり壁 に入れる。
 * 明るさ 0.5 が「そのままの色」で、それより明るい・暗いところが模様になる
 */
const createSurfaceTexture = () => {
  const data = new Uint8Array(FIELD * FIELD * 4)
  // 木目: たてに流れるすじと、ところどころの節
  const streak = fbm(20, 2, 3, 41)
  const wave = fbm(3, 3, 3, 43)
  // 石: 割れ目と、ざらつき
  const stone = cells(5, 47)
  const grit = fbm(12, 12, 4, 53)
  const blotch = fbm(3, 3, 3, 59)
  // 葉: 小さなかたまりが重なる
  const leafA = cells(9, 61)
  const leafB = cells(17, 67)
  // ぬり壁: 細かいむらと、雨だれのあと
  const fine = fbm(10, 10, 5, 71)
  const drip = fbm(14, 1, 3, 73)
  for (let i = 0; i < FIELD * FIELD; i++) {
    const x = (i % FIELD) / FIELD
    const ring = Math.sin((x * 9 + wave[i] * 2.4) * Math.PI * 2)
    const wood =
      0.5 + (streak[i] - 0.5) * 1.1 - Math.max(0, ring) ** 8 * 0.3 + 0.04
    const crack = 1 - clamp01(stone.edge[i] / 0.07)
    const rock =
      0.5 +
      (grit[i] - 0.5) * 0.9 +
      (blotch[i] - 0.5) * 0.5 -
      crack * crack * 0.42
    const leaf =
      0.5 +
      (0.42 - leafA.near[i]) * 0.75 +
      (0.4 - leafB.near[i]) * 0.5 -
      (1 - clamp01(leafA.edge[i] / 0.1)) * 0.16
    const plaster = 0.5 + (fine[i] - 0.5) * 0.8 + (drip[i] - 0.5) * 0.35
    data[i * 4] = clamp01(wood) * 255
    data[i * 4 + 1] = clamp01(rock) * 255
    data[i * 4 + 2] = clamp01(leaf) * 255
    data[i * 4 + 3] = clamp01(plaster) * 255
  }
  const texture = new DataTexture(data, FIELD, FIELD)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.generateMipmaps = true
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

/** 描いた絵の明るさに、ノイズでむらを付ける（repeat = 絵の中でノイズをくり返す回数） */
const shade = (
  ctx: CanvasRenderingContext2D,
  field: Float32Array,
  amount: number,
  repeat = 1,
) => {
  const { width, height } = ctx.canvas
  const image = ctx.getImageData(0, 0, width, height)
  const data = image.data
  for (let y = 0; y < height; y++) {
    const fy = Math.floor((y / height) * FIELD * repeat) % FIELD
    for (let x = 0; x < width; x++) {
      const fx = Math.floor((x / width) * FIELD * repeat) % FIELD
      const k = 1 + (field[fy * FIELD + fx] - 0.5) * 2 * amount
      const offset = (y * width + x) * 4
      data[offset] *= k
      data[offset + 1] *= k
      data[offset + 2] *= k
    }
  }
  ctx.putImageData(image, 0, 0)
}

/** 障害物などの絵に、ざらつきを付ける */
export function grainCanvas(
  ctx: CanvasRenderingContext2D,
  amount: number,
  seed: number,
) {
  shade(ctx, fbm(24, 24, 3, seed), amount)
  shade(ctx, fbm(3, 3, 3, seed + 5), amount * 0.6)
}

const join = (parts: BufferGeometry[]) => {
  const merged = mergeGeometries(parts)
  for (const item of parts) item.dispose()
  return merged
}

// ---- 部品 -------------------------------------------------------------------
const box = (color: number, size: V3, pos: V3, rotation?: V3) =>
  part(new BoxGeometry(size[0], size[1], size[2]), color, xf(pos, 1, rotation))

const cyl = (
  color: number,
  top: number,
  bottom: number,
  height: number,
  pos: V3,
  segments = 8,
  rotation?: V3,
) =>
  part(
    new CylinderGeometry(top, bottom, height, segments),
    color,
    xf(pos, 1, rotation),
    "pole",
  )

const cone = (
  color: number,
  radius: number,
  height: number,
  pos: V3,
  segments = 8,
  rotation?: V3,
) =>
  part(
    new ConeGeometry(radius, height, segments),
    color,
    xf(pos, 1, rotation),
    "cone",
  )

const ball = (
  color: number,
  pos: V3,
  scale: number | V3 = 1,
  segments = 10,
  rotation?: V3,
) =>
  part(
    new SphereGeometry(1, segments, Math.max(6, segments - 4)),
    color,
    xf(pos, scale, rotation),
    "round",
  )

/** 半球（底は開いている） */
const dome = (
  color: number,
  pos: V3,
  scale: number | V3 = 1,
  segments = 12,
  rotation?: V3,
) =>
  part(
    new SphereGeometry(1, segments, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    color,
    xf(pos, scale, rotation),
    "round",
  )

const gem = (color: number, pos: V3, scale: number | V3, rotation?: V3) =>
  part(new OctahedronGeometry(1), color, xf(pos, scale, rotation), "gem")

const lump = (color: number, pos: V3, scale: number | V3, rotation?: V3) =>
  part(new DodecahedronGeometry(1), color, xf(pos, scale, rotation), "rock")

const ring = (
  color: number,
  radius: number,
  tube: number,
  pos: V3,
  rotation?: V3,
  arc = Math.PI * 2,
  scale: number | V3 = 1,
) =>
  part(
    new TorusGeometry(radius, tube, 6, 16, arc),
    color,
    xf(pos, scale, rotation),
    "pole",
  )

/** 三角屋根（x 方向に長い。pos は底の中心） */
const prism = (
  color: number,
  width: number,
  height: number,
  length: number,
  pos: V3,
  rotY = 0,
) =>
  part(
    new CylinderGeometry(1, 1, length, 3, 1, false, Math.PI / 2),
    color,
    new Matrix4()
      .makeTranslation(pos[0], pos[1] + height / 3, pos[2])
      .multiply(new Matrix4().makeRotationY(rotY))
      .multiply(new Matrix4().makeRotationZ(Math.PI / 2))
      .multiply(new Matrix4().makeScale(height / 1.5, 1, width / 1.732)),
  )

/** base から斜めに伸びる棒。枝分かれに使えるよう、先の位置も返す */
const stick = (
  color: number,
  radius: number,
  base: V3,
  length: number,
  tiltZ: number,
  tiltX = 0,
  taper = 0.7,
): { geometry: BufferGeometry; tip: V3 } => {
  const dir: V3 = [
    -Math.sin(tiltZ),
    Math.cos(tiltZ) * Math.cos(tiltX),
    Math.cos(tiltZ) * Math.sin(tiltX),
  ]
  const at = (k: number): V3 => [
    base[0] + dir[0] * length * k,
    base[1] + dir[1] * length * k,
    base[2] + dir[2] * length * k,
  ]
  return {
    geometry: part(
      new CylinderGeometry(radius * taper, radius, length, 6),
      color,
      xf(at(0.5), 1, [tiltX, 0, tiltZ]),
      "pole",
    ),
    tip: at(1),
  }
}

// ---- いくつかのステージで色を変えて使う形 -------------------------------------
const roundTree = (trunk: number, a: number, b: number, c: number) => [
  cyl(trunk, 0.11, 0.17, 1.2, [0, 0.6, 0]),
  ball(a, [0, 1.75, 0], [0.82, 0.78, 0.82], 14),
  ball(b, [-0.5, 1.4, 0.1], 0.56, 12),
  ball(b, [0.52, 1.45, -0.05], 0.6, 12),
  ball(c, [0.1, 2.2, 0.05], 0.52, 12),
  ball(c, [-0.2, 1.6, 0.5], 0.45),
]

/** 枝ぶりのある、こんもりした木（さくら・もみじ） */
const fluffyTree = (trunk: number, a: number, b: number, c: number) => {
  const left = stick(trunk, 0.09, [0, 0.9, 0], 0.9, 0.75)
  const right = stick(trunk, 0.09, [0, 1.0, 0], 0.85, -0.7, 0.2)
  return [
    cyl(trunk, 0.12, 0.2, 1.4, [0, 0.7, 0]),
    left.geometry,
    right.geometry,
    ball(a, [0, 2.05, 0], [0.95, 0.72, 0.9], 14),
    ball(b, [left.tip[0] - 0.1, left.tip[1] + 0.15, 0.05], 0.6, 12),
    ball(b, [right.tip[0] + 0.1, right.tip[1] + 0.2, 0.1], 0.62, 12),
    ball(c, [0.25, 2.55, 0.1], 0.5, 12),
    ball(c, [-0.35, 2.4, -0.2], 0.46),
    ball(a, [0.1, 1.75, 0.6], 0.5),
    ball(c, [-0.75, 1.95, 0.3], 0.36),
    ball(a, [0.85, 2.05, -0.25], 0.38),
  ]
}

const pine = (
  trunk: number,
  a: number,
  b: number,
  c: number,
  snow?: number,
) => {
  const tiers: [number, number, number, number][] = [
    [a, 0.75, 1.1, 1.1],
    [b, 0.6, 1.0, 1.7],
    [c, 0.42, 0.9, 2.3],
  ]
  return [
    cyl(trunk, 0.1, 0.14, 0.7, [0, 0.35, 0]),
    ...tiers.flatMap(([color, radius, height, y]) => [
      cone(color, radius, height, [0, y, 0], 10),
      ...(snow === undefined
        ? []
        : [
            cone(
              snow,
              radius * 0.6,
              height * 0.52,
              [0, y + height * 0.255, 0],
              10,
            ),
          ]),
    ]),
  ]
}

const bush = (a: number, b: number, c: number) => [
  ball(a, [0, 0.28, 0], [0.45, 0.36, 0.4]),
  ball(b, [0.36, 0.22, 0.05], [0.34, 0.28, 0.32]),
  ball(c, [-0.34, 0.2, 0], [0.3, 0.26, 0.3]),
]

const flowers = (stem: number, petal: number, center: number) =>
  (
    [
      [0, 0, 0.34],
      [0.22, 0.1, 0.26],
      [-0.2, -0.06, 0.3],
      [0.08, -0.2, 0.22],
      [-0.1, 0.2, 0.38],
    ] as const
  ).flatMap(([x, z, h]) => [
    cyl(stem, 0.012, 0.012, h, [x, h / 2, z], 5),
    ball(petal, [x, h, z], [0.07, 0.05, 0.07], 8),
    ball(center, [x, h + 0.03, z], 0.03, 6),
  ])

const rocks = (a: number, b: number) => [
  lump(a, [0, 0.16, 0], [0.3, 0.21, 0.27]),
  lump(b, [0.32, 0.09, 0.08], 0.18),
]

const fence = (color: number, cap = color) => [
  box(color, [3.2, 0.07, 0.05], [0, 0.5, 0]),
  box(color, [3.2, 0.07, 0.05], [0, 0.25, 0]),
  ...[-1.4, -0.84, -0.28, 0.28, 0.84, 1.4].flatMap((x) => [
    box(color, [0.12, 0.66, 0.06], [x, 0.33, 0.03]),
    cone(cap, 0.085, 0.12, [x, 0.72, 0.03], 4, [0, Math.PI / 4, 0]),
  ]),
]

/** 街灯。明かりはどれも同じ位置（LAMP_BULB）に付ける */
const LAMP_BULB: V3 = [0.44, 2.04, 0]
const lampPost = (pole: number, shade: number, bulb: number, style = 0) => [
  cyl(pole, 0.05, 0.07, 2.3, [0, 1.15, 0]),
  cyl(pole, 0.12, 0.14, 0.12, [0, 0.06, 0]),
  box(pole, [0.5, 0.05, 0.05], [0.22, 2.25, 0]),
  ...(style === 0
    ? [
        cone(shade, 0.2, 0.16, [0.44, 2.2, 0]),
        lit(ball(bulb, LAMP_BULB, 0.13), 1.6),
      ]
    : style === 1
      ? // ちょうちん
        [
          cyl(pole, 0.07, 0.07, 0.05, [0.44, 2.2, 0]),
          cyl(pole, 0.07, 0.07, 0.05, [0.44, 1.82, 0]),
          lit(ball(shade, [0.44, 2.02, 0], [0.17, 0.2, 0.17]), 0.9),
          lit(ball(bulb, [0.44, 2.02, 0.12], [0.06, 0.1, 0.06], 6), 1.6),
        ]
      : // 結晶
        [lit(gem(bulb, [0.44, 2.02, 0], [0.13, 0.22, 0.13]), 1.6)]),
]

const stoneLantern = (stone: number, light: number) => [
  cyl(stone, 0.26, 0.3, 0.12, [0, 0.06, 0], 6),
  cyl(stone, 0.09, 0.11, 0.55, [0, 0.4, 0], 6),
  box(stone, [0.36, 0.06, 0.36], [0, 0.7, 0]),
  lit(box(light, [0.26, 0.24, 0.26], [0, 0.85, 0]), 1.4),
  cone(stone, 0.4, 0.26, [0, 1.1, 0], 4, [0, Math.PI / 4, 0]),
  ball(stone, [0, 1.27, 0], 0.07, 6),
]

const torii = (red: number, dark: number) => [
  cyl(red, 0.09, 0.11, 2.0, [-0.8, 1.0, 0]),
  cyl(red, 0.09, 0.11, 2.0, [0.8, 1.0, 0]),
  cyl(dark, 0.13, 0.13, 0.12, [-0.8, 0.06, 0]),
  cyl(dark, 0.13, 0.13, 0.12, [0.8, 0.06, 0]),
  box(red, [1.9, 0.12, 0.14], [0, 1.6, 0]),
  box(red, [2.3, 0.14, 0.2], [0, 2.02, 0]),
  box(dark, [2.5, 0.08, 0.26], [0, 2.13, 0]),
  box(red, [0.14, 0.3, 0.1], [0, 1.82, 0]),
]

const starfish = (color: number, pos: V3, size: number) => [
  ball(
    color,
    [pos[0], pos[1] + 0.03, pos[2]],
    [size * 0.4, 0.03, size * 0.4],
    8,
  ),
  ...[0, 1, 2, 3, 4].map((i) => {
    const a = (i * Math.PI * 2) / 5
    return ball(
      color,
      [
        pos[0] + Math.cos(a) * size * 0.6,
        pos[1] + 0.025,
        pos[2] - Math.sin(a) * size * 0.6,
      ],
      [size * 0.55, 0.025, size * 0.2],
      6,
      [0, a, 0],
    )
  }),
]

const mushroom = (
  stem: number,
  cap: number,
  dots: number,
  pos: V3,
  size: number,
  height: number,
) => {
  const top = pos[1] + height * size
  return [
    cyl(stem, 0.2 * size, 0.28 * size, height * size, [
      pos[0],
      pos[1] + (height * size) / 2,
      pos[2],
    ]),
    cyl(
      0xfff2dc,
      0.92 * size,
      0.92 * size,
      0.06 * size,
      [pos[0], top, pos[2]],
      12,
    ),
    dome(cap, [pos[0], top, pos[2]], [size, size * 0.72, size], 14),
    ...(
      [
        [0.25, 0.4],
        [0.9, 1.9],
        [0.95, 3.6],
        [0.85, 5.2],
        [0.5, 4.3],
        [0.55, 2.6],
      ] as const
    ).map(([theta, phi]) =>
      ball(
        dots,
        [
          pos[0] + Math.sin(theta) * Math.cos(phi) * size * 0.97,
          top + Math.cos(theta) * size * 0.7,
          pos[2] + Math.sin(theta) * Math.sin(phi) * size * 0.97,
        ],
        [0.13 * size, 0.08 * size, 0.13 * size],
        6,
      ),
    ),
  ]
}

/** 枯れ木（枝の先に付けるものを選べる） */
const bareTree = (wood: number, tip?: number) => {
  const trunk = stick(wood, 0.14, [0, 0, 0], 1.5, 0.08)
  const a = stick(wood, 0.08, trunk.tip, 0.9, 0.7)
  const b = stick(wood, 0.08, trunk.tip, 1.0, -0.55, 0.2)
  const c = stick(wood, 0.06, [0, 0.9, 0], 0.7, -0.95, -0.2)
  const d = stick(wood, 0.05, a.tip, 0.5, 0.2)
  const e = stick(wood, 0.05, b.tip, 0.5, -1.0)
  const sticks = [trunk, a, b, c, d, e]
  return [
    ...sticks.map((item) => item.geometry),
    ...(tip === undefined
      ? []
      : [a, b, c, d, e].map((item) => ball(tip, item.tip, 0.13, 6))),
  ]
}

/** 窓のならぶビル */
const building = (
  width: number,
  height: number,
  depth: number,
  wall: number,
  lights: number[],
  seed: number,
) => {
  const r = createRandom(seed)
  const parts = [box(wall, [width, height, depth], [0, height / 2, 0])]
  const cols = Math.max(2, Math.floor(width / 0.38))
  const rows = Math.floor((height - 0.5) / 0.5)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const on = r() < 0.62
      const pane = box(
        on ? lights[Math.floor(r() * lights.length)] : 0x1a2050,
        [0.2, 0.26, 0.04],
        [(col - (cols - 1) / 2) * 0.38, 0.6 + row * 0.5, depth / 2 + 0.01],
      )
      parts.push(on ? lit(pane, 0.7 + r() * 0.6) : pane)
    }
  }
  return parts
}

type ThemeProps = {
  /** 木など背の高いもの */
  tall: BufferGeometry[]
  /** 茂み・岩など */
  mid: BufferGeometry[]
  /** 花など小さいもの */
  small: BufferGeometry[]
  /** 道のすぐ奥に並ぶもの（さくなど） */
  feature: BufferGeometry[]
  /** 遠くの大きな建物 */
  far: BufferGeometry[]
  lamp: BufferGeometry
}

type PropKind = Exclude<keyof ThemeProps, "lamp">

type Theme = {
  sky: [number, number, number]
  sun: number
  sunLight: number
  sunPower: number
  ambient: number
  ambientPower: number
  far: number
  near: number
  cloud: number
  cloudAlpha: number
  stars: number
  lamp: number
  /** 太陽（月）の高さ 0〜1 */
  height: number
  ground: number
  hills: [number, number]
  path: number
  cliff: number
  water: number
  /** 舞うもの。fall が負なら上へのぼる。dot = 丸い光の粒 */
  particle: {
    color: number
    size: number
    fall: number
    drift: number
    dot: boolean
  }
  /** 建物など、向きをそろえて置く */
  aligned?: boolean
  build: () => ThemeProps
}

// ---- ステージごとの色と形 -----------------------------------------------------
const THEME_DEFS: Theme[] = [
  // はじまりの草原
  {
    sky: [0x4aa8ff, 0x9fd8ff, 0xe8f8ff],
    sun: 0xfff6c9,
    sunLight: 0xffffff,
    sunPower: 1.65,
    ambient: 0xffffff,
    ambientPower: 1.5,
    far: 0xa9cdf5,
    near: 0x86b7ec,
    cloud: 0xffffff,
    cloudAlpha: 1,
    stars: 0,
    lamp: 0,
    height: 0.6,
    ground: 0x8ed67c,
    hills: [0x9fdf8f, 0x74c98b],
    path: 0xf6ead2,
    cliff: 0xc98a56,
    water: 0x58b8f0,
    particle: { color: 0xffc4dc, size: 0.3, fall: 0.5, drift: 0.8, dot: false },
    build: () => ({
      tall: [
        join(roundTree(0x9a6a4a, 0x6fcf7a, 0x55bd6e, 0x8fe08a)),
        join(roundTree(0x9a6a4a, 0x7ad6a0, 0x5cc48d, 0xa1e8b6)),
        join(pine(0x8a5a40, 0x3fa66a, 0x4fb877, 0x63c888)),
        // りんごの木
        join([
          ...roundTree(0x9a6a4a, 0x5fc46c, 0x4cb262, 0x7ad880),
          ...(
            [
              [0.5, 1.8, 0.6],
              [-0.3, 1.5, 0.7],
              [0.1, 2.3, 0.5],
              [-0.7, 1.7, 0.3],
              [0.85, 1.5, 0.2],
            ] as V3[]
          ).map((pos) => ball(0xff5a5a, pos, 0.09, 6)),
        ]),
      ],
      mid: [
        join(bush(0x62c474, 0x79d486, 0x55b86a)),
        join(rocks(0xb9c0cf, 0xcdd3df)),
        // 干し草の束
        join([
          cyl(0xf0cf6a, 0.38, 0.38, 0.6, [0, 0.38, 0], 12, [0, 0, Math.PI / 2]),
          ring(0xc9a045, 0.38, 0.025, [-0.15, 0.38, 0], [0, Math.PI / 2, 0]),
          ring(0xc9a045, 0.38, 0.025, [0.15, 0.38, 0], [0, Math.PI / 2, 0]),
        ]),
      ],
      small: [0xffffff, 0xff8fb8, 0xffa64d, 0x8fd0ff].map((petal) =>
        join(flowers(0x4fae62, petal, 0xffe36b)),
      ),
      feature: [
        join(fence(0xffffff)),
        // ベンチ
        join([
          box(0xc98a56, [1.3, 0.07, 0.42], [0, 0.45, 0]),
          box(0xc98a56, [1.3, 0.12, 0.05], [0, 0.72, -0.2]),
          box(0xc98a56, [1.3, 0.12, 0.05], [0, 0.9, -0.22]),
          ...[-0.55, 0.55].flatMap((x) => [
            box(0x5a6aa8, [0.06, 0.45, 0.06], [x, 0.22, 0.16]),
            box(0x5a6aa8, [0.06, 0.98, 0.06], [x, 0.49, -0.2]),
          ]),
        ]),
      ],
      far: [
        // 風車
        join([
          cyl(0xfff7ea, 1.0, 1.5, 5, [0, 2.5, 0], 8),
          cone(0xe2604a, 1.3, 1.4, [0, 5.7, 0], 8),
          box(0x8a5a40, [0.7, 1.2, 0.1], [0, 0.6, 1.45]),
          box(0x9ad0f5, [0.45, 0.5, 0.1], [0, 3.2, 1.18]),
          ball(0x8a5a40, [0, 4.9, 1.2], 0.22, 8),
          ...[0, 1, 2, 3].flatMap((i) => {
            const a = 0.5 + (i * Math.PI) / 2
            return [
              box(
                0x8a5a40,
                [0.1, 3.3, 0.08],
                [-Math.sin(a) * 1.65, 4.9 + Math.cos(a) * 1.65, 1.25],
                [0, 0, a],
              ),
              box(
                0xfff2d0,
                [0.62, 2.3, 0.04],
                [
                  -Math.sin(a) * 2.0 + Math.cos(a) * 0.3,
                  4.9 + Math.cos(a) * 2.0 + Math.sin(a) * 0.3,
                  1.22,
                ],
                [0, 0, a],
              ),
            ]
          }),
        ]),
        // 赤い屋根の家
        join([
          box(0xfff3dc, [3.4, 2.3, 2.6], [0, 1.15, 0]),
          prism(0xe2604a, 3.2, 1.7, 3.9, [0, 2.3, 0]),
          box(0xc9553f, [0.5, 1.2, 0.5], [0.9, 3.4, -0.3]),
          box(0x8a5a40, [0.7, 1.3, 0.1], [-0.7, 0.65, 1.32]),
          box(0x9ad0f5, [0.8, 0.7, 0.1], [0.75, 1.3, 1.32]),
          box(0xffffff, [0.9, 0.08, 0.14], [0.75, 0.92, 1.34]),
          ...bush(0x62c474, 0x79d486, 0x55b86a).map((item) =>
            item.applyMatrix4(xf([1.6, 0, 1.7], 1.6)),
          ),
        ]),
      ],
      lamp: join(lampPost(0x2c3b82, 0x2c3b82, 0xfff1b0)),
    }),
  },
  // さくら並木
  {
    sky: [0x6fa6ff, 0xffc9d6, 0xfff1c9],
    sun: 0xffe08a,
    sunLight: 0xffe6c9,
    sunPower: 1.5,
    ambient: 0xfff0f2,
    ambientPower: 1.45,
    far: 0xc7b6ea,
    near: 0xa696dd,
    cloud: 0xffe9ee,
    cloudAlpha: 1,
    stars: 0,
    lamp: 0.35,
    height: 0.32,
    ground: 0xa8e09a,
    hills: [0xffc9dd, 0xf7a8c8],
    path: 0xfbeee6,
    cliff: 0xb98070,
    water: 0x7fd0f0,
    particle: {
      color: 0xffb0d0,
      size: 0.34,
      fall: 0.6,
      drift: 1.1,
      dot: false,
    },
    build: () => ({
      tall: [
        join(fluffyTree(0x6a4a44, 0xffb7d5, 0xff9cc4, 0xffd3e6)),
        join(fluffyTree(0x6a4a44, 0xffc9de, 0xffa8cc, 0xffe6f0)),
        join(roundTree(0x7a5a4a, 0xffb7d5, 0xff9cc4, 0xffd3e6)),
      ],
      mid: [
        join(bush(0x86d49a, 0xffb7d5, 0x6cc486)),
        join(stoneLantern(0xaab0c0, 0xfff1b0)),
        // 三色だんごの屋台
        join([
          box(0xb9855a, [0.9, 0.5, 0.5], [0, 0.25, 0]),
          box(0xe2604a, [1.1, 0.06, 0.7], [0, 1.25, 0], [0.15, 0, 0]),
          cyl(0xb9855a, 0.03, 0.03, 1.2, [-0.42, 0.6, -0.2], 5),
          cyl(0xb9855a, 0.03, 0.03, 1.2, [0.42, 0.6, -0.2], 5),
          ...[-0.2, 0.15].flatMap((x) => [
            cyl(0xe8d8b0, 0.012, 0.012, 0.42, [x, 0.7, 0.1], 5),
            ball(0xffa8cc, [x, 0.86, 0.1], 0.07, 6),
            ball(0xffffff, [x, 0.74, 0.1], 0.07, 6),
            ball(0x9fdc8a, [x, 0.62, 0.1], 0.07, 6),
          ]),
        ]),
      ],
      small: [
        join(flowers(0x4fae62, 0xffa8cc, 0xfff2a8)),
        join(flowers(0x4fae62, 0xffffff, 0xffc0d8)),
        // 花びらのたまり
        join(
          (
            [
              [0, 0, 0.22],
              [0.25, 0.1, 0.16],
              [-0.22, -0.08, 0.18],
            ] as const
          ).map(([x, z, s]) =>
            ball(0xffc4dc, [x, 0.02, z], [s, 0.025, s * 0.8], 8),
          ),
        ),
      ],
      feature: [
        join(fence(0xd9412f, 0x2c2c3a)),
        join(
          torii(0xe0483a, 0x2c2c3a).map((item) => item.scale(0.7, 0.7, 0.7)),
        ),
      ],
      far: [
        // 五重の塔
        join(
          [0, 1, 2, 3, 4]
            .flatMap((i) => {
              const w = 3.0 - i * 0.42
              const y = i * 1.55
              return [
                box(0xc9553f, [w, 1.0, w], [0, y + 0.5, 0]),
                box(0xfff3dc, [w * 0.5, 0.5, w + 0.04], [0, y + 0.5, 0]),
                cone(0x3a3f5a, w * 1.15, 0.7, [0, y + 1.3, 0], 4, [
                  0,
                  Math.PI / 4,
                  0,
                ]),
              ]
            })
            .concat([
              cyl(0xf2c14e, 0.05, 0.08, 1.6, [0, 8.6, 0], 6),
              ball(0xf2c14e, [0, 9.4, 0], 0.14, 6),
            ]),
        ),
        join(
          torii(0xe0483a, 0x2c2c3a).map((item) => item.scale(3.4, 3.4, 3.4)),
        ),
      ],
      lamp: join(lampPost(0x6a3a34, 0xff7a6a, 0xfff1b0, 1)),
    }),
  },
  // まぶしい海辺
  {
    sky: [0x1e9bff, 0x7fd4ff, 0xd9f7ff],
    sun: 0xffffe0,
    sunLight: 0xffffff,
    sunPower: 1.8,
    ambient: 0xffffff,
    ambientPower: 1.55,
    far: 0x9fdcf7,
    near: 0x6cc6f0,
    cloud: 0xffffff,
    cloudAlpha: 1,
    stars: 0,
    lamp: 0,
    height: 0.75,
    ground: 0xf3dfa2,
    hills: [0xf7e7b5, 0xe9cf8a],
    path: 0xe9cfa0,
    cliff: 0xd9b877,
    water: 0x2fc4e8,
    particle: {
      color: 0xffffff,
      size: 0.16,
      fall: 0.12,
      drift: 0.4,
      dot: true,
    },
    build: () => {
      const palm = (lean: number, leaf: number) => {
        const parts: BufferGeometry[] = []
        let base: V3 = [0, 0, 0]
        for (let i = 0; i < 5; i++) {
          const piece = stick(
            i % 2 === 0 ? 0xb98a5a : 0xa57848,
            0.15 - i * 0.012,
            base,
            0.62,
            lean * (0.1 + i * 0.09),
            0,
            0.9,
          )
          parts.push(piece.geometry)
          base = piece.tip
        }
        for (let i = 0; i < 7; i++) {
          const a = (i * Math.PI * 2) / 7
          parts.push(
            ball(
              i % 2 === 0 ? leaf : 0x3fa66a,
              [
                base[0] + Math.cos(a) * 0.72,
                base[1] - 0.12,
                base[2] - Math.sin(a) * 0.72,
              ],
              [0.85, 0.05, 0.22],
              8,
              [0, a, -0.38],
            ),
          )
        }
        parts.push(
          ball(
            0x7a5a3a,
            [base[0] + 0.1, base[1] - 0.12, base[2] + 0.1],
            0.11,
            6,
          ),
        )
        parts.push(
          ball(
            0x7a5a3a,
            [base[0] - 0.1, base[1] - 0.14, base[2] + 0.06],
            0.1,
            6,
          ),
        )
        return join(parts)
      }
      return {
        tall: [palm(1, 0x4fc46c), palm(-1, 0x5fd07a), palm(0.5, 0x4fc46c)],
        mid: [
          // パラソルとビーチボール
          join([
            cyl(0xffffff, 0.03, 0.03, 1.6, [0, 0.8, 0], 6, [0, 0, 0.12]),
            ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
              part(
                new ConeGeometry(
                  0.95,
                  0.4,
                  2,
                  1,
                  true,
                  (i * Math.PI) / 4,
                  Math.PI / 4,
                ),
                i % 2 === 0 ? 0xff6b6b : 0xffffff,
                xf([-0.1, 1.6, 0], 1, [0, 0, 0.12]),
              ),
            ),
            box(0x6fc8ff, [0.9, 0.03, 0.5], [0.3, 0.02, 0.5], [0, 0.4, 0]),
            ball(0xffffff, [-0.5, 0.2, 0.5], 0.2, 10),
            ring(0xff6b6b, 0.2, 0.03, [-0.5, 0.2, 0.5], [Math.PI / 2, 0, 0]),
            ring(0x4a9aff, 0.2, 0.03, [-0.5, 0.2, 0.5], [0, 0, 0]),
          ]),
          join(rocks(0xd8c8a8, 0xeadcc0)),
          // 砂のお城
          join([
            cyl(0xe6c888, 0.5, 0.58, 0.3, [0, 0.15, 0], 10),
            cyl(0xe0bf7c, 0.22, 0.25, 0.5, [0, 0.55, 0], 8),
            cone(0xd9b56c, 0.26, 0.28, [0, 0.94, 0], 8),
            ...[-0.36, 0.36].flatMap((x) => [
              cyl(0xe0bf7c, 0.13, 0.15, 0.4, [x, 0.5, 0.1], 8),
              cone(0xd9b56c, 0.16, 0.2, [x, 0.8, 0.1], 8),
            ]),
            cyl(0xffffff, 0.008, 0.008, 0.3, [0, 1.2, 0], 4),
            box(0xff6b6b, [0.16, 0.1, 0.01], [0.08, 1.3, 0]),
          ]),
        ],
        small: [
          join([
            ...starfish(0xff8a5a, [0, 0, 0], 0.22),
            ball(0xffd0e0, [0.3, 0.05, 0.1], [0.1, 0.06, 0.08], 8),
          ]),
          join([
            ...starfish(0xffc040, [0.1, 0, 0.1], 0.16),
            cone(0xfff0e0, 0.07, 0.2, [-0.25, 0.06, 0], 8, [0, 0, 1.3]),
            ball(0xffe0c8, [0.3, 0.04, -0.15], [0.09, 0.05, 0.07], 8),
          ]),
          join(flowers(0x4fae62, 0xff6b9a, 0xffe36b)),
        ],
        feature: [
          // サーフボード
          join([
            box(0xb98a5a, [1.5, 0.06, 0.06], [0, 0.9, -0.1]),
            cyl(0xb98a5a, 0.035, 0.04, 1.0, [-0.7, 0.5, -0.1], 6),
            cyl(0xb98a5a, 0.035, 0.04, 1.0, [0.7, 0.5, -0.1], 6),
            ...(
              [
                [-0.45, 0xff6b6b, 0xffffff],
                [0, 0x4ad0c0, 0xfff27a],
                [0.45, 0xffc040, 0xff6b9a],
              ] as const
            ).flatMap(([x, color, stripe]) => [
              ball(color, [x, 0.85, 0.02], [0.2, 0.85, 0.04], 10, [-0.1, 0, 0]),
              box(stripe, [0.05, 1.3, 0.03], [x, 0.85, 0.06], [-0.1, 0, 0]),
            ]),
          ]),
          // 浮き輪の立て札
          join([
            cyl(0xffffff, 0.04, 0.05, 1.5, [0, 0.75, 0], 6),
            ring(0xff5a5a, 0.26, 0.08, [0, 1.25, 0.06]),
            ...[0, 1, 2, 3].map((i) =>
              ring(
                0xffffff,
                0.26,
                0.083,
                [0, 1.25, 0.06],
                [0, 0, (i * Math.PI) / 2 + 0.5],
                0.5,
              ),
            ),
          ]),
        ],
        far: [
          // 灯台
          join([
            cyl(0xb9c0cf, 1.9, 2.1, 0.6, [0, 0.3, 0], 10),
            ...[0, 1, 2, 3, 4].map((i) =>
              cyl(
                i % 2 === 0 ? 0xffffff : 0xff5a5a,
                1.3 - i * 0.12,
                1.42 - i * 0.12,
                1.5,
                [0, 1.35 + i * 1.5, 0],
                10,
              ),
            ),
            cyl(0x3a4a7a, 1.15, 1.15, 0.16, [0, 8.2, 0], 10),
            cyl(0xfff1a0, 0.6, 0.6, 0.9, [0, 8.7, 0], 8),
            cone(0xff5a5a, 0.85, 0.8, [0, 9.55, 0], 8),
            ball(0xffffff, [0, 10.05, 0], 0.12, 6),
            box(0x3a4a7a, [0.5, 0.9, 0.1], [0, 1.05, 1.42]),
          ]),
          // 海の家
          join([
            ...[-1.3, 1.3].flatMap((x) =>
              [-0.9, 0.9].map((z) =>
                cyl(0xa57848, 0.09, 0.09, 1.2, [x, 0.6, z], 6),
              ),
            ),
            box(0xc99a68, [3.2, 0.14, 2.4], [0, 1.25, 0]),
            box(0xfff3dc, [2.6, 1.5, 1.8], [0, 2.05, -0.1]),
            box(0x6fc8ff, [0.9, 0.7, 0.1], [0.5, 2.2, 0.82]),
            box(0x8a5a40, [0.6, 1.1, 0.1], [-0.7, 1.87, 0.82]),
            cone(0xe8c070, 2.5, 1.5, [0, 3.55, -0.1], 4, [0, Math.PI / 4, 0]),
            box(0xff6b6b, [1.4, 0.4, 0.06], [0, 3.0, 0.95]),
          ]),
        ],
        lamp: join(lampPost(0xffffff, 0xff6b6b, 0xfff1b0)),
      }
    },
  },
  // 夕やけの砂漠
  {
    sky: [0x5a6fd6, 0xff9e8a, 0xffe0a3],
    sun: 0xffb347,
    sunLight: 0xffc38a,
    sunPower: 1.55,
    ambient: 0xffd9cf,
    ambientPower: 1.35,
    far: 0xc87a6a,
    near: 0xa85a58,
    cloud: 0xffd3c4,
    cloudAlpha: 0.9,
    stars: 0.15,
    lamp: 0.7,
    height: 0.26,
    ground: 0xe9b870,
    hills: [0xf0bd78, 0xd9955a],
    path: 0xf3d9a8,
    cliff: 0xb86a3c,
    water: 0xd9a05a,
    particle: { color: 0xffe0b0, size: 0.14, fall: 0.1, drift: 2.4, dot: true },
    build: () => {
      const saguaro = (flip: number) => {
        const armA = stick(
          0x4f9a5a,
          0.13,
          [flip * 0.2, 1.0, 0],
          0.45,
          -flip * 1.5,
          0,
          1,
        )
        const armB = stick(
          0x4f9a5a,
          0.12,
          [-flip * 0.2, 1.4, 0],
          0.4,
          flip * 1.5,
          0,
          1,
        )
        return join([
          cyl(0x4f9a5a, 0.22, 0.24, 2.4, [0, 1.2, 0], 8),
          ball(0x4f9a5a, [0, 2.4, 0], [0.22, 0.2, 0.22], 8),
          armA.geometry,
          cyl(0x4f9a5a, 0.13, 0.13, 0.8, [armA.tip[0], 1.4, 0], 8),
          ball(0x4f9a5a, [armA.tip[0], 1.8, 0], 0.13, 8),
          armB.geometry,
          cyl(0x4f9a5a, 0.12, 0.12, 0.6, [armB.tip[0], 1.7, 0], 8),
          ball(0x4f9a5a, [armB.tip[0], 2.0, 0], 0.12, 8),
          ball(0xff8fb8, [0, 2.6, 0], 0.07, 6),
        ])
      }
      const butte = (size: number) => [
        cyl(0xb8603c, 2.6 * size, 3.2 * size, 1.6, [0, 0.8, 0], 7),
        cyl(0xd07a48, 2.3 * size, 2.5 * size, 1.4, [0, 2.3, 0], 7),
        cyl(0xb8603c, 2.2 * size, 2.3 * size, 1.2, [0, 3.6, 0], 7),
        cyl(0xe0905a, 2.1 * size, 2.2 * size, 0.9, [0, 4.65, 0], 7),
      ]
      return {
        tall: [saguaro(1), saguaro(-1), join(bareTree(0x8a6a50))],
        mid: [
          // 玉サボテン
          join([
            ball(0x5aa866, [0, 0.3, 0], [0.32, 0.34, 0.32], 10),
            ball(0x5aa866, [0.36, 0.18, 0.1], [0.2, 0.22, 0.2], 8),
            ball(0xff8fb8, [0, 0.66, 0], 0.07, 6),
            ball(0xffe36b, [0.36, 0.42, 0.1], 0.05, 6),
          ]),
          join(rocks(0xc8703a, 0xe0905a)),
          // 重なった岩
          join([
            cyl(0xc8703a, 0.5, 0.6, 0.35, [0, 0.17, 0], 6),
            cyl(0xd9854a, 0.4, 0.48, 0.3, [0.05, 0.5, 0], 6),
            cyl(0xc8703a, 0.3, 0.36, 0.28, [0, 0.79, 0.03], 6),
            lump(0xe0905a, [0.02, 1.06, 0], [0.24, 0.16, 0.22]),
          ]),
        ],
        small: [
          join(flowers(0x8aa85a, 0xffe36b, 0xff8a3a)),
          // 牛の骨
          join([
            ball(0xfff5e0, [0, 0.1, 0], [0.12, 0.1, 0.16], 8),
            ball(0xfff5e0, [0, 0.07, 0.16], [0.07, 0.06, 0.1], 6),
            cone(0xfff5e0, 0.04, 0.26, [0.2, 0.16, -0.04], 6, [0, 0, -1.1]),
            cone(0xfff5e0, 0.04, 0.26, [-0.2, 0.16, -0.04], 6, [0, 0, 1.1]),
          ]),
          join([
            lump(0xd9a070, [0, 0.05, 0], [0.12, 0.07, 0.1]),
            lump(0xc8855a, [0.2, 0.04, 0.1], 0.07),
            lump(0xe0b080, [-0.15, 0.03, -0.1], 0.05),
          ]),
        ],
        feature: [
          join(fence(0xa57848)),
          // 車輪
          join([
            cyl(0xa57848, 0.05, 0.06, 1.1, [0.7, 0.55, 0], 6),
            ring(0x8a5a3a, 0.45, 0.05, [0, 0.5, 0.05], [-0.15, 0, 0]),
            ...[0, 1, 2, 3].map((i) =>
              box(
                0x8a5a3a,
                [0.05, 0.88, 0.04],
                [0, 0.5, 0.05],
                [-0.15, 0, (i * Math.PI) / 4],
              ),
            ),
            ball(0x6a4a30, [0, 0.5, 0.07], 0.08, 6),
          ]),
        ],
        far: [
          // ピラミッド
          join([
            cone(0xe8c070, 6.2, 7, [0, 3.5, 0], 4, [0, Math.PI / 4, 0]),
            cone(0xf2d488, 1.4, 1.6, [0, 6.25, 0], 4, [0, Math.PI / 4, 0]),
            cone(0xd9aa5a, 3.2, 3.6, [5.2, 1.8, 1.5], 4, [0, Math.PI / 4, 0]),
          ]),
          join([
            ...butte(1),
            ...butte(0.55).map((item) =>
              item.applyMatrix4(xf([4, 0, 0.5], [1, 0.7, 1])),
            ),
          ]),
        ],
        lamp: join(lampPost(0x8a5a3a, 0x8a5a3a, 0xffc060)),
      }
    },
  },
  // きのこの森
  {
    sky: [0x1f4f6a, 0x3f9a8f, 0xb6f0c8],
    sun: 0xeaffd0,
    sunLight: 0xcfffe6,
    sunPower: 1.3,
    ambient: 0xc8f2e4,
    ambientPower: 1.3,
    far: 0x2f7a78,
    near: 0x235f66,
    cloud: 0x9fe0d0,
    cloudAlpha: 0.7,
    stars: 0.25,
    lamp: 0.9,
    height: 0.5,
    ground: 0x4fb58a,
    hills: [0x3fa07e, 0x57c296],
    path: 0xd8e8c8,
    cliff: 0x6a5a4a,
    water: 0x2f9aa8,
    particle: {
      color: 0xeaff7a,
      size: 0.2,
      fall: -0.25,
      drift: 0.2,
      dot: true,
    },
    build: () => ({
      tall: [
        join(mushroom(0xfff2dc, 0xff5a5a, 0xffffff, [0, 0, 0], 1.0, 1.9)),
        join(mushroom(0xe8f0ff, 0x5a8aff, 0xbfe8ff, [0, 0, 0], 0.8, 2.5)),
        join([
          ...mushroom(0xfff2dc, 0xb06aff, 0xffe0ff, [0, 0, 0], 0.7, 1.6),
          ...mushroom(0xfff2dc, 0xd08aff, 0xffe0ff, [0.8, 0, 0.3], 0.45, 1.5),
          ...mushroom(0xfff2dc, 0x9a5aef, 0xffe0ff, [-0.6, 0, 0.4], 0.35, 1.4),
        ]),
        join(pine(0x5a4038, 0x1f7a6a, 0x2a8f78, 0x3aa888)),
      ],
      mid: [
        join([
          ...mushroom(0xfff2dc, 0xffa040, 0xffffff, [0, 0, 0], 0.3, 1.2),
          ...mushroom(0xfff2dc, 0xff7a5a, 0xffffff, [0.4, 0, 0.1], 0.22, 1.1),
          ...mushroom(0xfff2dc, 0xffc040, 0xffffff, [-0.3, 0, 0.2], 0.18, 1.0),
        ]),
        // シダ
        join(
          [0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i * Math.PI * 2) / 6
            return ball(
              i % 2 === 0 ? 0x3fb07a : 0x58c890,
              [Math.cos(a) * 0.3, 0.26, -Math.sin(a) * 0.3],
              [0.42, 0.04, 0.13],
              8,
              [0, a, 0.6],
            )
          }),
        ),
        // 切り株の家
        join([
          cyl(0x8a6a50, 0.42, 0.52, 0.7, [0, 0.35, 0], 10),
          cyl(0xe8cfa0, 0.4, 0.4, 0.04, [0, 0.71, 0], 10),
          box(0x5a4038, [0.22, 0.36, 0.06], [0, 0.18, 0.47]),
          ball(0xfff1a0, [0.26, 0.42, 0.4], 0.07, 6),
          ...mushroom(0xfff2dc, 0xff5a5a, 0xffffff, [0.2, 0.71, 0], 0.14, 1.0),
        ]),
      ],
      small: [
        // 光る芽
        join(
          (
            [
              [0, 0, 0.3],
              [0.2, 0.1, 0.2],
              [-0.18, 0.05, 0.25],
              [0.05, -0.2, 0.16],
            ] as const
          ).flatMap(([x, z, h]) => [
            cyl(0x6ad0a0, 0.012, 0.016, h, [x, h / 2, z], 5),
            ball(0xeaff7a, [x, h + 0.03, z], 0.05, 6),
          ]),
        ),
        join([
          ...mushroom(0xfff2dc, 0xff7ab0, 0xffffff, [0, 0, 0], 0.12, 1.3),
          ...mushroom(0xfff2dc, 0x7ad0ff, 0xffffff, [0.22, 0, 0.1], 0.09, 1.2),
        ]),
        join(flowers(0x3fa07e, 0xbfe8ff, 0xeaff7a)),
      ],
      feature: [
        // たおれた丸太
        join([
          cyl(0x8a6a50, 0.26, 0.28, 1.7, [0, 0.28, 0], 10, [0, 0, Math.PI / 2]),
          cyl(0xe8cfa0, 0.24, 0.24, 0.02, [0.86, 0.28, 0], 10, [
            0,
            0,
            Math.PI / 2,
          ]),
          cyl(0xe8cfa0, 0.22, 0.22, 0.02, [-0.86, 0.28, 0], 10, [
            0,
            0,
            Math.PI / 2,
          ]),
          ...mushroom(0xfff2dc, 0xff5a5a, 0xffffff, [0.3, 0.5, 0], 0.13, 1.0),
          ...mushroom(
            0xfff2dc,
            0xffa040,
            0xffffff,
            [-0.2, 0.52, 0.05],
            0.1,
            1.0,
          ),
          ball(0x58c890, [-0.6, 0.5, 0.1], [0.2, 0.08, 0.16], 8),
        ]),
        join(fence(0x8a6a50, 0xeaff7a)),
      ],
      far: [
        // きのこの家
        join([
          ...mushroom(0xfff2dc, 0xff5a5a, 0xffffff, [0, 0, 0], 3.4, 1.3),
          box(0x8a5a40, [1.0, 1.9, 0.2], [0, 0.95, 0.92]),
          ball(0xfff1a0, [0.3, 1.0, 1.02], 0.09, 6),
          cyl(
            0xfff1a0,
            0.42,
            0.42,
            0.14,
            [-0.75, 2.9, 0.62],
            10,
            [1.35, 0, 0.3],
          ),
          cyl(
            0xfff1a0,
            0.42,
            0.42,
            0.14,
            [0.75, 2.9, 0.62],
            10,
            [1.35, 0, -0.3],
          ),
          box(0xc9553f, [0.6, 1.6, 0.6], [1.7, 7.2, -0.5]),
        ]),
        join([
          ...mushroom(0xe8f0ff, 0x5a8aff, 0xbfe8ff, [0, 0, 0], 2.4, 2.4),
          ...mushroom(0xe8f0ff, 0x7aa8ff, 0xbfe8ff, [3.4, 0, 0.5], 1.5, 2.2),
        ]),
      ],
      lamp: join(lampPost(0x5a4038, 0x5a4038, 0xeaff7a, 2)),
    }),
  },
  // 雪の村
  {
    sky: [0x8fb8e8, 0xcfe4f7, 0xffffff],
    sun: 0xffffff,
    sunLight: 0xffffff,
    sunPower: 1.5,
    ambient: 0xeaf4ff,
    ambientPower: 1.5,
    far: 0xdbe9f7,
    near: 0xbcd3ec,
    cloud: 0xffffff,
    cloudAlpha: 1,
    stars: 0,
    lamp: 0.5,
    height: 0.4,
    ground: 0xf4f9ff,
    hills: [0xffffff, 0xe3eefb],
    path: 0xdfe8f2,
    cliff: 0x9fb4cc,
    water: 0xa8dcf5,
    particle: { color: 0xffffff, size: 0.2, fall: 0.9, drift: 0.5, dot: true },
    build: () => ({
      tall: [
        join(pine(0x8a5a40, 0x3f8f6a, 0x4a9f78, 0x58b088, 0xffffff)),
        join(pine(0x8a5a40, 0x2f7a66, 0x3a8a74, 0x489a84, 0xffffff)),
        join(bareTree(0x6a5048, 0xffffff)),
      ],
      mid: [
        // 雪だるま
        join([
          ball(0xffffff, [0, 0.32, 0], 0.34, 12),
          ball(0xffffff, [0, 0.8, 0], 0.25, 12),
          cone(0xff8a3a, 0.04, 0.2, [0, 0.8, 0.3], 6, [Math.PI / 2, 0, 0]),
          ball(0x2a2a3a, [-0.09, 0.88, 0.22], 0.03, 5),
          ball(0x2a2a3a, [0.09, 0.88, 0.22], 0.03, 5),
          ring(0xe2504a, 0.2, 0.05, [0, 0.62, 0], [Math.PI / 2, 0, 0]),
          box(0xe2504a, [0.08, 0.26, 0.04], [0.14, 0.5, 0.2]),
          cyl(0x2a2a3a, 0.2, 0.2, 0.03, [0, 1.02, 0], 10),
          cyl(0x2a2a3a, 0.13, 0.13, 0.2, [0, 1.13, 0], 10),
          ...[1, -1].map(
            (side) =>
              stick(0x6a5048, 0.02, [side * 0.28, 0.45, 0], 0.4, -side * 1.0)
                .geometry,
          ),
        ]),
        join(bush(0xffffff, 0xeaf4ff, 0xffffff)),
        // そり
        join([
          box(0xe2504a, [0.9, 0.05, 0.4], [0, 0.2, 0]),
          box(0x8a5a40, [1.0, 0.03, 0.04], [0, 0.04, 0.18]),
          box(0x8a5a40, [1.0, 0.03, 0.04], [0, 0.04, -0.18]),
          ...[-0.3, 0.3].flatMap((x) => [
            box(0x8a5a40, [0.04, 0.16, 0.04], [x, 0.12, 0.18]),
            box(0x8a5a40, [0.04, 0.16, 0.04], [x, 0.12, -0.18]),
          ]),
          box(0x4a9a5a, [0.3, 0.26, 0.26], [-0.1, 0.36, 0]),
          box(0xfff27a, [0.32, 0.05, 0.05], [-0.1, 0.36, 0.11]),
          box(0xfff27a, [0.05, 0.28, 0.05], [-0.1, 0.36, 0.11]),
        ]),
      ],
      small: [
        // 氷の結晶
        join([
          gem(0xbfe8ff, [0, 0.16, 0], [0.07, 0.18, 0.07]),
          gem(0xdff4ff, [0.14, 0.1, 0.05], [0.05, 0.12, 0.05], [0, 0, -0.4]),
          gem(0xa8dcf5, [-0.12, 0.09, -0.03], [0.045, 0.1, 0.045], [0, 0, 0.4]),
        ]),
        join([
          ball(0xffffff, [0, 0.04, 0], [0.2, 0.08, 0.16], 8),
          ball(0xffffff, [0.2, 0.03, 0.08], [0.12, 0.05, 0.1], 8),
        ]),
        // 赤い実
        join([
          ...bush(0x3f8f6a, 0x4a9f78, 0x2f7a66).map((item) =>
            item.scale(0.45, 0.45, 0.45),
          ),
          ball(0xe2504a, [0.05, 0.22, 0.14], 0.035, 5),
          ball(0xe2504a, [-0.1, 0.16, 0.12], 0.035, 5),
          ball(0xe2504a, [0.16, 0.14, 0.1], 0.035, 5),
          ball(0xffffff, [0, 0.27, 0], [0.14, 0.04, 0.12], 8),
        ]),
      ],
      feature: [
        join([
          ...fence(0x8a5a40),
          box(0xffffff, [3.2, 0.05, 0.09], [0, 0.56, 0]),
          ...[-1.4, -0.84, -0.28, 0.28, 0.84, 1.4].map((x) =>
            ball(0xffffff, [x, 0.78, 0.03], [0.08, 0.04, 0.06], 6),
          ),
        ]),
        // プレゼントの山
        join(
          (
            [
              [0, 0.2, 0, 0.4, 0xe2504a, 0xfff27a],
              [0.42, 0.14, 0.05, 0.28, 0x4a9a5a, 0xffffff],
              [0.12, 0.52, 0, 0.24, 0x4a8aff, 0xff8fb8],
            ] as const
          ).flatMap(([x, y, z, s, color, ribbon]) => [
            box(color, [s, s, s], [x, y, z]),
            box(ribbon, [s + 0.01, s + 0.01, s * 0.16], [x, y, z]),
            box(ribbon, [s * 0.16, s + 0.01, s + 0.01], [x, y, z]),
            ball(
              ribbon,
              [x, y + s / 2 + 0.03, z],
              [s * 0.2, 0.04, s * 0.12],
              6,
            ),
          ]),
        ),
      ],
      far: [
        // 丸太小屋
        join([
          box(0x8a5a40, [4.2, 2.3, 3.0], [0, 1.15, 0]),
          ...[0.45, 0.95, 1.45, 1.95].map((y) =>
            box(0x754a34, [4.24, 0.06, 3.04], [0, y, 0]),
          ),
          prism(0xffffff, 3.8, 1.9, 4.8, [0, 2.3, 0]),
          box(0x9a6a50, [0.55, 1.5, 0.55], [1.2, 3.6, -0.3]),
          box(0xffffff, [0.65, 0.12, 0.65], [1.2, 4.4, -0.3]),
          box(0x5a3a2a, [0.8, 1.5, 0.1], [-0.9, 0.75, 1.52]),
          box(0xfff1a0, [0.9, 0.8, 0.1], [0.9, 1.3, 1.52]),
          box(0x8a5a40, [0.06, 0.8, 0.12], [0.9, 1.3, 1.53]),
          box(0x8a5a40, [0.9, 0.06, 0.12], [0.9, 1.3, 1.53]),
          ball(0xdfe8f2, [1.3, 5.0, -0.3], 0.3, 8),
          ball(0xdfe8f2, [1.6, 5.6, -0.3], 0.4, 8),
        ]),
        // かまくら
        join([
          dome(0xffffff, [0, 0, 0], [2.6, 2.2, 2.4], 16),
          dome(0xeaf4ff, [0, 0, 2.2], [0.9, 1.0, 0.7], 12),
          box(0x3a4a6a, [0.9, 1.0, 0.1], [0, 0.5, 2.86]),
          box(0xffc060, [0.5, 0.4, 0.1], [0, 0.3, 2.88]),
          ...pine(0x8a5a40, 0x3f8f6a, 0x4a9f78, 0x58b088, 0xffffff).map(
            (item) => item.applyMatrix4(xf([3.4, 0, 0.8], 1.5)),
          ),
        ]),
      ],
      lamp: join([
        ...lampPost(0x3a4a6a, 0x3a4a6a, 0xfff1b0),
        ball(0xffffff, [0.44, 2.3, 0], [0.22, 0.06, 0.22], 8),
      ]),
    }),
  },
  // 夜のネオン街
  {
    sky: [0x0a0f33, 0x2a2670, 0x7a3f9a],
    sun: 0xf4f1ff,
    sunLight: 0xaebcff,
    sunPower: 1.05,
    ambient: 0xc0c8ff,
    ambientPower: 1.2,
    far: 0x1c2260,
    near: 0x141a4a,
    cloud: 0x4a4f9a,
    cloudAlpha: 0.7,
    stars: 0.8,
    lamp: 1,
    height: 0.66,
    ground: 0x4a5288,
    hills: [0x2c3466, 0x39407a],
    path: 0x9aa0c8,
    cliff: 0x2a2f55,
    water: 0x1f2f7a,
    particle: {
      color: 0x7af0ff,
      size: 0.14,
      fall: -0.15,
      drift: 0.3,
      dot: true,
    },
    aligned: true,
    build: () => ({
      tall: [
        join([
          ...building(1.5, 4.2, 1.2, 0x39407a, [0xfff1a0, 0x7af0ff], 71),
          box(0xff5ab0, [1.1, 0.4, 0.08], [0, 4.5, 0.4]),
          box(0x2a2f55, [0.06, 0.3, 0.06], [-0.4, 4.3, 0.4]),
          box(0x2a2f55, [0.06, 0.3, 0.06], [0.4, 4.3, 0.4]),
        ]),
        join([
          ...building(1.2, 3.2, 1.2, 0x4a4488, [0xfff1a0, 0xffb0e0], 72),
          box(0x5a6090, [0.5, 0.3, 0.5], [0.2, 3.35, 0]),
          cyl(0xd0d4e8, 0.02, 0.02, 0.9, [-0.3, 3.65, 0], 4),
          ball(0xff5a5a, [-0.3, 4.12, 0], 0.05, 5),
        ]),
        join([
          ...building(1.8, 2.6, 1.3, 0x2f3a70, [0x7af0ff, 0xfff1a0], 73),
          box(0x7af0ff, [0.1, 1.6, 0.08], [1.0, 1.6, 0.5]),
          box(0x1a2050, [0.34, 1.7, 0.06], [1.0, 1.6, 0.44]),
          box(0xffc040, [1.5, 0.1, 0.5], [0, 0.95, 0.85]),
        ]),
      ],
      mid: [
        // 自動販売機
        join([
          box(0xe2504a, [0.55, 1.0, 0.42], [0, 0.5, 0]),
          box(0xbff4ff, [0.43, 0.42, 0.02], [0, 0.68, 0.22]),
          box(0x2a2f55, [0.43, 0.14, 0.02], [0, 0.18, 0.22]),
          ...[-0.14, 0, 0.14].flatMap((x, i) => [
            cyl(
              [0xff8a3a, 0x4ad0c0, 0xfff27a][i],
              0.035,
              0.035,
              0.12,
              [x, 0.74, 0.23],
              6,
            ),
            cyl(
              [0x4a8aff, 0xff5ab0, 0x9fdc8a][i],
              0.035,
              0.035,
              0.12,
              [x, 0.58, 0.23],
              6,
            ),
          ]),
          box(0xffffff, [0.55, 0.06, 0.42], [0, 1.03, 0]),
        ]),
        // 止まっている車
        join([
          box(0x3a4a9a, [1.9, 0.32, 0.8], [0, 0.4, 0]),
          box(0x3a4a9a, [1.02, 0.3, 0.72], [-0.1, 0.7, 0]),
          box(0x1a2050, [0.94, 0.2, 0.74], [-0.1, 0.7, 0]),
          box(0x1a2050, [1.04, 0.2, 0.62], [-0.1, 0.7, 0]),
          box(0x2a3070, [1.94, 0.08, 0.84], [0, 0.27, 0]),
          ...[-0.6, 0.6].flatMap((x) =>
            [-0.37, 0.37].flatMap((z) => [
              cyl(0x1a1a2a, 0.17, 0.17, 0.12, [x, 0.17, z], 12, [
                Math.PI / 2,
                0,
                0,
              ]),
              cyl(0xd0d4e8, 0.08, 0.08, 0.13, [x, 0.17, z], 8, [
                Math.PI / 2,
                0,
                0,
              ]),
            ]),
          ),
          ...[-0.26, 0.26].flatMap((z) => [
            box(0xfff1a0, [0.04, 0.1, 0.18], [0.96, 0.44, z]),
            box(0xff5a5a, [0.04, 0.08, 0.18], [-0.96, 0.46, z]),
          ]),
        ]),
        // 消火栓とごみ箱
        join([
          cyl(0xe2504a, 0.1, 0.12, 0.4, [0, 0.2, 0], 8),
          ball(0xe2504a, [0, 0.42, 0], 0.1, 8),
          cyl(0xd0d4e8, 0.04, 0.04, 0.32, [0, 0.28, 0], 6, [0, 0, Math.PI / 2]),
          cyl(0x5a6090, 0.18, 0.15, 0.5, [0.5, 0.25, 0], 8),
          cyl(0x7a80b0, 0.19, 0.19, 0.04, [0.5, 0.52, 0], 8),
        ]),
      ],
      small: [
        // カラーコーン
        join([
          box(0xff8a3a, [0.24, 0.03, 0.24], [0, 0.015, 0]),
          cone(0xff8a3a, 0.09, 0.36, [0, 0.2, 0], 8),
          cyl(0xffffff, 0.052, 0.07, 0.07, [0, 0.19, 0], 8),
        ]),
        // 小さなネオン
        join([
          cyl(0x5a6090, 0.015, 0.02, 0.5, [0, 0.25, 0], 5),
          box(0xff5ab0, [0.3, 0.14, 0.03], [0, 0.56, 0]),
          box(0x7af0ff, [0.2, 0.03, 0.04], [0, 0.56, 0.01]),
        ]),
      ],
      feature: [
        join(fence(0xd0d4e8, 0x7af0ff)),
        // バス停
        join([
          cyl(0xd0d4e8, 0.03, 0.03, 1.7, [-0.8, 0.85, -0.2], 6),
          cyl(0xd0d4e8, 0.03, 0.03, 1.7, [0.8, 0.85, -0.2], 6),
          box(0x7af0ff, [1.9, 0.06, 0.7], [0, 1.72, 0]),
          box(0x39407a, [1.6, 0.9, 0.04], [0, 1.1, -0.22]),
          box(0xfff1a0, [0.6, 0.6, 0.03], [-0.4, 1.15, -0.19]),
          box(0xff5ab0, [0.6, 0.6, 0.03], [0.35, 1.15, -0.19]),
          box(0x7a80b0, [1.3, 0.06, 0.3], [0, 0.42, 0]),
          box(0x5a6090, [0.06, 0.42, 0.26], [-0.55, 0.21, 0]),
          box(0x5a6090, [0.06, 0.42, 0.26], [0.55, 0.21, 0]),
        ]),
      ],
      far: [
        // 高層ビル
        join([
          box(0x2a3070, [3.0, 13, 3.0], [0, 6.5, 0]),
          ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) =>
            box(
              i % 3 === 0 ? 0x7af0ff : 0xfff1a0,
              [2.6, 0.22, 0.06],
              [0, i * 1.1, 1.51],
            ),
          ),
          cyl(0xd0d4e8, 0.05, 0.08, 2.4, [0, 14.2, 0], 5),
          ball(0xff5a5a, [0, 15.5, 0], 0.14, 6),
          box(0x39407a, [2.4, 8, 2.4], [3.4, 4, 0.4]),
          ...[1, 2, 3, 4, 5, 6].map((i) =>
            box(
              i % 2 === 0 ? 0xff5ab0 : 0xfff1a0,
              [2.0, 0.2, 0.06],
              [3.4, i * 1.15, 1.61],
            ),
          ),
          box(0xff5ab0, [1.8, 0.6, 0.1], [3.4, 8.5, 1.2]),
        ]),
        // 電波塔
        join([
          ...[0, 1, 2, 3, 4, 5].map((i) =>
            cyl(
              i % 2 === 0 ? 0xff7a4a : 0xffffff,
              2.2 - (i + 1) * 0.34,
              2.2 - i * 0.34,
              2.0,
              [0, 1 + i * 2, 0],
              4,
              [0, Math.PI / 4, 0],
            ),
          ),
          box(0xfff1a0, [1.9, 0.6, 1.9], [0, 5.2, 0]),
          box(0xfff1a0, [1.0, 0.4, 1.0], [0, 9.2, 0]),
          cyl(0xffffff, 0.04, 0.12, 3.4, [0, 13.7, 0], 5),
          ball(0xff5a5a, [0, 15.5, 0], 0.14, 6),
        ]),
      ],
      lamp: join(lampPost(0x5a6090, 0x5a6090, 0x7af0ff)),
    }),
  },
  // おかしの国
  {
    sky: [0xff9fd0, 0xffd0e8, 0xfff4d6],
    sun: 0xffffff,
    sunLight: 0xfff4f8,
    sunPower: 1.6,
    ambient: 0xfff0f6,
    ambientPower: 1.5,
    far: 0xffb8e0,
    near: 0xd9a0f0,
    cloud: 0xffffff,
    cloudAlpha: 1,
    stars: 0,
    lamp: 0.2,
    height: 0.55,
    ground: 0xbdf0d0,
    hills: [0xffb3d1, 0xfff0a8],
    path: 0xfff3f8,
    cliff: 0x8a5a3c,
    water: 0xffa8d0,
    particle: { color: 0xffe0f0, size: 0.18, fall: 0.3, drift: 0.5, dot: true },
    build: () => {
      const lollipop = (candy: number, swirl: number, height: number) =>
        join([
          cyl(0xffffff, 0.04, 0.04, height, [0, height / 2, 0], 6),
          cyl(candy, 0.62, 0.62, 0.14, [0, height + 0.5, 0], 16, [
            Math.PI / 2,
            0,
            0,
          ]),
          ring(swirl, 0.42, 0.06, [0, height + 0.5, 0.06]),
          ring(swirl, 0.2, 0.06, [0, height + 0.5, 0.06]),
          ring(swirl, 0.42, 0.06, [0, height + 0.5, -0.06]),
          ring(swirl, 0.2, 0.06, [0, height + 0.5, -0.06]),
          ball(
            0xff5a8a,
            [-0.12, height * 0.6, 0.02],
            [0.1, 0.06, 0.03],
            6,
            [0, 0, 0.5],
          ),
          ball(
            0xff5a8a,
            [0.12, height * 0.6, 0.02],
            [0.1, 0.06, 0.03],
            6,
            [0, 0, -0.5],
          ),
        ])
      const cupcake = (wrapper: number, cream: number, top: number) => [
        cyl(wrapper, 0.32, 0.24, 0.3, [0, 0.15, 0], 10),
        ball(cream, [0, 0.36, 0], [0.34, 0.14, 0.34], 10),
        ball(cream, [0, 0.5, 0], [0.24, 0.12, 0.24], 10),
        ball(cream, [0, 0.62, 0], [0.14, 0.1, 0.14], 8),
        ball(top, [0, 0.74, 0], 0.07, 6),
      ]
      return {
        tall: [
          lollipop(0xff8fb8, 0xffffff, 1.7),
          lollipop(0x7ad0ff, 0xfff27a, 2.1),
          // ステッキのあめ
          join([
            ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
              cyl(
                i % 2 === 0 ? 0xff5a6a : 0xffffff,
                0.1,
                0.1,
                0.26,
                [0, 0.13 + i * 0.26, 0],
                8,
              ),
            ),
            ...[0, 1, 2, 3].map((i) =>
              ring(
                i % 2 === 0 ? 0xffffff : 0xff5a6a,
                0.3,
                0.1,
                [0.3, 2.08, 0],
                [0, 0, (i * Math.PI) / 4],
                Math.PI / 4 + 0.02,
              ),
            ),
          ]),
          // アイスクリームの木
          join([
            cone(0xe8b878, 0.42, 1.5, [0, 0.75, 0], 10, [Math.PI, 0, 0]),
            ring(0xd9a060, 0.36, 0.035, [0, 1.3, 0], [Math.PI / 2, 0, 0]),
            ball(0xffa8cc, [0, 1.7, 0], 0.46, 12),
            ball(0xa8f0d0, [0, 2.35, 0], 0.38, 12),
            ball(0xfff2d0, [0, 2.88, 0], 0.3, 12),
            ball(0xff5a6a, [0, 3.2, 0], 0.09, 6),
          ]),
        ],
        mid: [
          join(cupcake(0xffc0d8, 0xffffff, 0xff5a6a)),
          join(cupcake(0xa8dcff, 0xffd0e8, 0xfff27a)),
          // グミ
          join([
            dome(0xff7a8a, [0, 0, 0], [0.26, 0.34, 0.26], 10),
            dome(0x8ae08a, [0.42, 0, 0.1], [0.2, 0.26, 0.2], 10),
            dome(0xffd060, [-0.38, 0, 0.12], [0.18, 0.24, 0.18], 10),
          ]),
        ],
        small: [
          // つつみあめ
          join(
            (
              [
                [0, 0, 0xff7ab0],
                [0.3, 0.12, 0x7ad0ff],
              ] as const
            ).flatMap(([x, z, color]) => [
              ball(color, [x, 0.09, z], [0.11, 0.09, 0.09], 8),
              cone(color, 0.07, 0.12, [x + 0.16, 0.09, z], 6, [
                0,
                0,
                Math.PI / 2,
              ]),
              cone(color, 0.07, 0.12, [x - 0.16, 0.09, z], 6, [
                0,
                0,
                -Math.PI / 2,
              ]),
            ]),
          ),
          // マカロン
          join(
            (
              [
                [0, 0.08, 0, 0xffc0d8],
                [0.28, 0.08, 0.06, 0xc8f0b0],
                [0.12, 0.24, 0.02, 0xfff0a8],
              ] as const
            ).flatMap(([x, y, z, color]) => [
              ball(color, [x, y + 0.035, z], [0.13, 0.045, 0.13], 10),
              cyl(0xffffff, 0.12, 0.12, 0.03, [x, y, z], 10),
              ball(color, [x, y - 0.035, z], [0.13, 0.045, 0.13], 10),
            ]),
          ),
          join(flowers(0x8ae08a, 0xff8fb8, 0xffffff)),
        ],
        feature: [
          join(fence(0xe8b878, 0xff8fb8)),
          // ドーナツの門
          join([
            ring(0xe8b878, 0.72, 0.24, [0, 0.9, 0]),
            ring(
              0xff8fb8,
              0.72,
              0.25,
              [0, 0.9, 0.04],
              [0, 0, 0.3],
              Math.PI * 1.1,
            ),
            ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const a = 0.5 + i * 0.4
              return box(
                [0xffffff, 0x7ad0ff, 0xfff27a, 0x8ae08a][i % 4],
                [0.1, 0.03, 0.03],
                [Math.cos(a) * 0.74, 0.9 + Math.sin(a) * 0.74, 0.3],
                [0, 0, a * 3],
              )
            }),
          ]),
        ],
        far: [
          // ケーキのお城
          join([
            cyl(0xfff2d0, 3.4, 3.4, 2.2, [0, 1.1, 0], 16),
            cyl(0xffc0d8, 2.4, 2.4, 1.9, [0, 3.15, 0], 16),
            cyl(0xfff2d0, 1.5, 1.5, 1.6, [0, 4.9, 0], 16),
            ...[
              [3.4, 2.2],
              [2.4, 4.1],
              [1.5, 5.7],
            ].flatMap(([radius, y]) =>
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
                const a = (i * Math.PI * 2) / 10
                return ball(
                  0xffffff,
                  [Math.cos(a) * radius * 0.93, y, Math.sin(a) * radius * 0.93],
                  radius * 0.11,
                  8,
                )
              }),
            ),
            ...[0, 1, 2, 3, 4].flatMap((i) => {
              const a = (i * Math.PI * 2) / 5 + 0.3
              return [
                cyl(
                  0x7ad0ff,
                  0.07,
                  0.07,
                  0.8,
                  [Math.cos(a) * 0.9, 6.1, Math.sin(a) * 0.9],
                  6,
                ),
                cone(
                  0xffc040,
                  0.09,
                  0.26,
                  [Math.cos(a) * 0.9, 6.63, Math.sin(a) * 0.9],
                  6,
                ),
              ]
            }),
            ball(0xff5a6a, [0, 6.0, 0], 0.4, 10),
          ]),
          // おかしの家
          join([
            box(0xb9784a, [3.6, 2.4, 2.8], [0, 1.2, 0]),
            prism(0x8a5a3c, 3.4, 2.0, 4.2, [0, 2.4, 0]),
            prism(0xffffff, 3.5, 0.5, 4.3, [0, 3.95, 0]),
            box(0xff8fb8, [0.8, 1.5, 0.1], [0, 0.75, 1.42]),
            ball(0xfff27a, [0.25, 0.75, 1.5], 0.07, 6),
            ...[-1.2, 1.2].flatMap((x) => [
              cyl(0xffffff, 0.4, 0.4, 0.1, [x, 1.5, 1.42], 12, [
                Math.PI / 2,
                0,
                0,
              ]),
              cyl(0xa8dcff, 0.3, 0.3, 0.12, [x, 1.5, 1.43], 12, [
                Math.PI / 2,
                0,
                0,
              ]),
            ]),
            ...[-1.6, -0.8, 0, 0.8, 1.6].map((x, i) =>
              dome(
                [0xff7a8a, 0x8ae08a, 0xffd060, 0x7ad0ff, 0xff7a8a][i],
                [x, 2.4, 1.42],
                0.2,
                8,
              ),
            ),
          ]),
        ],
        lamp: join(lampPost(0xffffff, 0xff8fb8, 0xfff1b0, 1)),
      }
    },
  },
  // 紅葉の里
  {
    sky: [0x5f6fd0, 0xffa070, 0xffe6a8],
    sun: 0xffa040,
    sunLight: 0xffcf9a,
    sunPower: 1.55,
    ambient: 0xffe4d0,
    ambientPower: 1.4,
    far: 0xb86a70,
    near: 0x8f4f66,
    cloud: 0xffd0b0,
    cloudAlpha: 1,
    stars: 0.1,
    lamp: 0.8,
    height: 0.24,
    ground: 0xc8b45a,
    hills: [0xe8823a, 0xd95a3a],
    path: 0xeadfc8,
    cliff: 0x8a5a40,
    water: 0x4a8ac0,
    particle: {
      color: 0xff8a3a,
      size: 0.34,
      fall: 0.7,
      drift: 1.3,
      dot: false,
    },
    build: () => ({
      tall: [
        join(fluffyTree(0x5a3a30, 0xe8482a, 0xd03a2a, 0xff7a3a)),
        join(fluffyTree(0x5a3a30, 0xff9a2a, 0xf07a1a, 0xffc040)),
        join(roundTree(0x6a4a34, 0xffd040, 0xf0b820, 0xffe880)),
        join(pine(0x6a4a34, 0x4a7a4a, 0x5a8a54, 0x6a9a60)),
      ],
      mid: [
        join(bush(0xe8682a, 0xffa040, 0xd04a2a)),
        join(stoneLantern(0x9a9aa8, 0xffd080)),
        // おじぞうさま
        join([
          box(0x9a9aa8, [0.5, 0.12, 0.4], [0, 0.06, 0]),
          cyl(0xb0b0bc, 0.15, 0.2, 0.5, [0, 0.37, 0], 8),
          ball(0xb0b0bc, [0, 0.76, 0], 0.17, 10),
          ball(0xe2504a, [0, 0.55, 0.1], [0.17, 0.12, 0.08], 8),
          cyl(0xe2504a, 0.14, 0.17, 0.08, [0, 0.9, 0], 8),
        ]),
      ],
      small: [
        // すすき
        join(
          [-0.5, -0.2, 0.1, 0.4, 0.7].flatMap((tilt, i) => {
            const stem = stick(
              0xc8b070,
              0.012,
              [i * 0.03 - 0.06, 0, 0],
              0.6 + (i % 2) * 0.12,
              -tilt * 0.6,
              0,
              1,
            )
            return [
              stem.geometry,
              ball(0xfff0c8, stem.tip, [0.035, 0.12, 0.035], 6, [
                0,
                0,
                -tilt * 0.9,
              ]),
            ]
          }),
        ),
        // 落ち葉の山
        join([
          lump(0xe8682a, [0, 0.06, 0], [0.24, 0.08, 0.2]),
          lump(0xffb030, [0.18, 0.05, 0.1], [0.14, 0.06, 0.12]),
          lump(0xd03a2a, [-0.16, 0.05, 0.06], [0.12, 0.05, 0.1]),
        ]),
        // きのこ
        join([
          ...mushroom(0xfff2dc, 0xb9784a, 0xe8cfa0, [0, 0, 0], 0.12, 1.2),
          ...mushroom(0xfff2dc, 0xc98a56, 0xe8cfa0, [0.2, 0, 0.08], 0.09, 1.1),
        ]),
      ],
      feature: [
        // 竹垣
        join([
          ...[-1.35, -0.9, -0.45, 0, 0.45, 0.9, 1.35].map((x) =>
            cyl(0xb8b060, 0.05, 0.05, 0.8, [x, 0.4, 0], 6),
          ),
          cyl(0x6a5a34, 0.03, 0.03, 3.0, [0, 0.58, 0.05], 6, [
            0,
            0,
            Math.PI / 2,
          ]),
          cyl(0x6a5a34, 0.03, 0.03, 3.0, [0, 0.26, 0.05], 6, [
            0,
            0,
            Math.PI / 2,
          ]),
        ]),
        join(
          torii(0xe0483a, 0x2c2c3a).map((item) => item.scale(0.7, 0.7, 0.7)),
        ),
      ],
      far: [
        join(
          torii(0xe0483a, 0x2c2c3a).map((item) => item.scale(3.6, 3.6, 3.6)),
        ),
        // かやぶきの家
        join([
          box(0xf0e4c8, [4.4, 1.9, 3.0], [0, 0.95, 0]),
          box(0x6a4a34, [4.44, 0.14, 3.04], [0, 0.07, 0]),
          ...[-2.1, -0.7, 0.7, 2.1].map((x) =>
            box(0x6a4a34, [0.14, 1.9, 0.1], [x, 0.95, 1.5]),
          ),
          box(0x4a3424, [1.0, 1.4, 0.08], [0, 0.7, 1.5]),
          prism(0xb8904a, 4.6, 3.0, 5.2, [0, 1.9, 0]),
          prism(0x8a6a34, 1.2, 0.6, 5.4, [0, 4.5, 0]),
          ...fluffyTree(0x5a3a30, 0xe8482a, 0xd03a2a, 0xff7a3a).map((item) =>
            item.applyMatrix4(xf([3.8, 0, 0.8], 1.7)),
          ),
        ]),
      ],
      lamp: join(lampPost(0x4a3424, 0xfff0d0, 0xffd080, 1)),
    }),
  },
  // 海の底
  {
    sky: [0x0a3f8a, 0x1f7fc0, 0x6fd8e8],
    sun: 0xd0ffff,
    sunLight: 0xbfe8ff,
    sunPower: 1.35,
    ambient: 0xa8dcff,
    ambientPower: 1.4,
    far: 0x1a5fa0,
    near: 0x134a85,
    cloud: 0x6fd8e8,
    cloudAlpha: 0,
    stars: 0,
    lamp: 0.7,
    height: 0.9,
    ground: 0xe8dcae,
    hills: [0x2f8fb0, 0x3fa8b8],
    path: 0xf0e4bc,
    cliff: 0x6a7a9a,
    water: 0x0f3f80,
    particle: { color: 0xffffff, size: 0.2, fall: -0.9, drift: 0.2, dot: true },
    build: () => {
      const coral = (color: number, tip: number) => {
        const trunk = stick(color, 0.12, [0, 0, 0], 0.8, 0)
        const a = stick(color, 0.09, trunk.tip, 0.7, 0.7)
        const b = stick(color, 0.09, trunk.tip, 0.75, -0.6, 0.3)
        const c = stick(color, 0.08, [0, 0.5, 0], 0.6, -1.0, -0.3)
        const d = stick(color, 0.06, a.tip, 0.5, 0.1)
        const e = stick(color, 0.06, a.tip, 0.4, 1.2)
        const f = stick(color, 0.06, b.tip, 0.5, -0.1)
        const g = stick(color, 0.06, b.tip, 0.4, -1.2)
        const all = [trunk, a, b, c, d, e, f, g]
        return join([
          ...all.map((item) => item.geometry),
          ...[c, d, e, f, g].map((item) => ball(tip, item.tip, 0.1, 6)),
        ])
      }
      const kelp = (x: number, height: number, color: number) =>
        Array.from({ length: height }, (_, i) =>
          ball(
            color,
            [x + (i % 2 === 0 ? 0.08 : -0.08), 0.25 + i * 0.42, 0],
            [0.16, 0.28, 0.05],
            8,
            [0, 0, i % 2 === 0 ? -0.3 : 0.3],
          ),
        )
      return {
        tall: [
          coral(0xff7a9a, 0xffd0e0),
          coral(0xffa040, 0xfff0a0),
          join([
            ...kelp(0, 7, 0x3fb07a),
            ...kelp(0.4, 5, 0x58c890),
            ...kelp(-0.35, 4, 0x2f9a6a),
          ]),
          coral(0xb07aff, 0xe8d0ff),
        ],
        mid: [
          // 真珠の貝
          join([
            dome(0xffc0d8, [0, 0.12, 0], [0.4, 0.14, 0.34], 10, [
              Math.PI,
              0,
              0,
            ]),
            dome(
              0xffd8e8,
              [0, 0.14, -0.1],
              [0.4, 0.16, 0.34],
              10,
              [-0.7, 0, 0],
            ),
            ball(0xffffff, [0, 0.16, 0.04], 0.1, 8),
          ]),
          // いそぎんちゃく
          join([
            cyl(0xff8a7a, 0.2, 0.24, 0.3, [0, 0.15, 0], 8),
            ...[0, 1, 2, 3, 4, 5, 6, 7].flatMap((i) => {
              const a = (i * Math.PI * 2) / 8
              const arm = stick(
                0xffb0a0,
                0.035,
                [Math.cos(a) * 0.12, 0.3, Math.sin(a) * 0.12],
                0.36,
                -Math.cos(a) * 0.6,
                Math.sin(a) * 0.6,
                0.8,
              )
              return [arm.geometry, ball(0xfff0a0, arm.tip, 0.045, 5)]
            }),
          ]),
          join([
            lump(0x7a8ab0, [0, 0.18, 0], [0.34, 0.24, 0.3]),
            ball(0xff7ab0, [0.2, 0.36, 0.1], [0.16, 0.1, 0.14], 8),
            ...starfish(0xffa040, [-0.1, 0.4, 0.05], 0.12),
          ]),
        ],
        small: [
          join(starfish(0xff8a5a, [0, 0, 0], 0.2)),
          // 海草
          join(
            [-0.18, -0.06, 0.06, 0.18].map((x, i) =>
              ball(
                0x58c890,
                [x, 0.2 + (i % 2) * 0.05, 0],
                [0.04, 0.22 + (i % 2) * 0.06, 0.02],
                6,
                [0, 0, x * -1.5],
              ),
            ),
          ),
          join([
            cone(0xfff0e0, 0.08, 0.22, [0, 0.07, 0], 8, [0, 0, 1.3]),
            ball(0xffd0e0, [0.25, 0.05, 0.1], [0.1, 0.06, 0.08], 8),
            ball(0xbfe8ff, [-0.2, 0.3, 0], 0.05, 6),
            ball(0xbfe8ff, [-0.14, 0.44, 0.04], 0.035, 6),
          ]),
        ],
        feature: [
          // 宝箱
          join([
            box(0x9a6a3a, [0.8, 0.4, 0.5], [0, 0.2, 0]),
            cyl(0x9a6a3a, 0.25, 0.25, 0.8, [0, 0.42, -0.22], 8, [
              0,
              0,
              Math.PI / 2,
            ]).applyMatrix4(xf([0, 0.18, 0.16], 1, [-0.7, 0, 0])),
            box(0xf2c14e, [0.84, 0.06, 0.54], [0, 0.4, 0]),
            box(0xf2c14e, [0.08, 0.42, 0.54], [-0.3, 0.2, 0]),
            box(0xf2c14e, [0.08, 0.42, 0.54], [0.3, 0.2, 0]),
            ...(
              [
                [-0.15, 0.46, 0.05],
                [0.1, 0.48, 0],
                [0.2, 0.45, 0.1],
                [0, 0.5, 0.12],
              ] as V3[]
            ).map((pos) => ball(0xffd84a, pos, [0.08, 0.05, 0.08], 6)),
            gem(0xff5a8a, [-0.05, 0.56, 0.02], 0.07),
            ball(0xffd84a, [0.6, 0.03, 0.3], [0.08, 0.02, 0.08], 6),
          ]),
          // いかり
          join([
            cyl(0x7a80a0, 0.05, 0.05, 1.3, [0, 0.8, 0], 6, [0, 0, 0.25]),
            ring(0x7a80a0, 0.12, 0.035, [-0.2, 1.55, 0], [0, 0, 0.25]),
            box(0x7a80a0, [0.6, 0.07, 0.07], [-0.13, 1.25, 0], [0, 0, 0.25]),
            ring(
              0x7a80a0,
              0.42,
              0.05,
              [0.1, 0.55, 0],
              [0, 0, 0.25 + Math.PI],
              Math.PI,
            ),
            cone(0x7a80a0, 0.09, 0.2, [-0.3, 0.52, 0], 6, [0, 0, 0.5]),
            cone(0x7a80a0, 0.09, 0.2, [0.52, 0.72, 0], 6, [0, 0, -0.1]),
          ]),
        ],
        far: [
          // しずんだ神殿
          join([
            box(0xa8b8d0, [7, 0.4, 3.4], [0, 0.2, 0]),
            box(0xb8c8e0, [6.4, 0.4, 3.0], [0, 0.6, 0]),
            ...[-2.6, -1.3, 0, 1.3].map((x) =>
              cyl(0xd0dcf0, 0.3, 0.34, 4.2, [x, 2.9, 0.9], 10),
            ),
            cyl(0xd0dcf0, 0.3, 0.34, 2.2, [2.6, 1.9, 0.9], 10),
            cyl(0xd0dcf0, 0.3, 0.3, 1.8, [3.6, 0.7, 1.6], 10, [0.2, 0.4, 1.4]),
            box(0xb8c8e0, [5.2, 0.5, 1.2], [-0.8, 5.25, 0.9], [0, 0, 0.03]),
            prism(0xa8b8d0, 1.2, 1.3, 5.0, [-0.8, 5.5, 0.9]),
            ...kelp(-3.4, 6, 0x3fb07a),
            ...kelp(2.0, 4, 0x58c890),
          ]),
          // 潜水艦
          join([
            ball(0xffd040, [0, 6, 0], [3.0, 1.2, 1.2], 14),
            box(0xffd040, [1.2, 1.0, 0.8], [0.3, 7.3, 0]),
            cyl(0xd0d4e8, 0.07, 0.07, 1.0, [0.5, 8.2, 0], 6),
            box(0xd0d4e8, [0.4, 0.1, 0.1], [0.65, 8.7, 0]),
            ...[-1.2, 0, 1.2].flatMap((x) => [
              cyl(0xe8a020, 0.36, 0.36, 0.1, [x, 6.1, 1.15], 12, [
                Math.PI / 2,
                0,
                0,
              ]),
              cyl(0x9fe8ff, 0.26, 0.26, 0.12, [x, 6.1, 1.17], 12, [
                Math.PI / 2,
                0,
                0,
              ]),
            ]),
            box(0xe8a020, [0.1, 1.6, 0.3], [-3.1, 6, 0], [0.5, 0, 0]),
            box(0xe8a020, [0.1, 1.6, 0.3], [-3.1, 6, 0], [-0.9, 0, 0]),
            ball(0xbfe8ff, [3.6, 7.2, 0], 0.16, 6),
            ball(0xbfe8ff, [4.0, 8.0, 0.2], 0.24, 6),
            ball(0xbfe8ff, [3.8, 9.0, 0], 0.12, 6),
          ]),
        ],
        lamp: join(lampPost(0x7a80a0, 0x7a80a0, 0x9fffe8, 2)),
      }
    },
  },
  // 溶岩の火山
  {
    sky: [0x2a0a14, 0x8a2a1a, 0xffa040],
    sun: 0xff6030,
    sunLight: 0xffb090,
    sunPower: 1.4,
    ambient: 0xffc8b8,
    ambientPower: 1.25,
    far: 0x5a1a1a,
    near: 0x3a1010,
    cloud: 0x5a3030,
    cloudAlpha: 0.85,
    stars: 0.1,
    lamp: 1,
    height: 0.2,
    ground: 0x6a5656,
    hills: [0x4a3838, 0x6a4a40],
    path: 0xa89488,
    cliff: 0x3a2a2a,
    water: 0xff6a1a,
    particle: {
      color: 0xffa040,
      size: 0.16,
      fall: -0.7,
      drift: 0.6,
      dot: true,
    },
    build: () => {
      const spire = (a: number, b: number) =>
        join([
          gem(a, [0, 1.1, 0], [0.4, 1.5, 0.4]),
          gem(b, [0.42, 0.6, 0.1], [0.26, 0.9, 0.26], [0, 0, -0.35]),
          gem(a, [-0.4, 0.5, 0.05], [0.22, 0.7, 0.22], [0, 0, 0.4]),
          gem(0xff7a2a, [0.1, 0.16, 0.36], [0.08, 0.18, 0.08]),
        ])
      return {
        tall: [
          spire(0x3a2a4a, 0x4a3a5a),
          spire(0x4a3838, 0x5a4444),
          join(bareTree(0x2a2020, 0xff7a2a)),
        ],
        mid: [
          // 溶岩のしみた岩
          join([
            lump(0x4a3838, [0, 0.22, 0], [0.4, 0.3, 0.36]),
            lump(0x5a4444, [0.4, 0.14, 0.1], 0.22),
            lump(0xff7a2a, [0.08, 0.3, 0.24], [0.14, 0.1, 0.12]),
            lump(0xffb040, [-0.2, 0.2, 0.26], [0.08, 0.06, 0.08]),
          ]),
          // 噴気孔
          join([
            cyl(0x4a3838, 0.16, 0.42, 0.5, [0, 0.25, 0], 8),
            cyl(0xff7a2a, 0.14, 0.14, 0.02, [0, 0.51, 0], 8),
            ball(0x9a8888, [0.05, 0.8, 0], 0.16, 8),
            ball(0xb0a0a0, [-0.05, 1.15, 0.03], 0.22, 8),
            ball(0xc8b8b8, [0.08, 1.6, 0], 0.28, 8),
          ]),
        ],
        small: [
          join([
            gem(0xff7a2a, [0, 0.14, 0], [0.06, 0.16, 0.06]),
            gem(
              0xffb040,
              [0.13, 0.09, 0.04],
              [0.045, 0.1, 0.045],
              [0, 0, -0.4],
            ),
            gem(
              0xff5a2a,
              [-0.11, 0.08, -0.02],
              [0.04, 0.09, 0.04],
              [0, 0, 0.4],
            ),
          ]),
          // ほね
          join([
            ball(0xfff5e0, [0, 0.1, 0], [0.11, 0.1, 0.12], 8),
            ball(0x2a2020, [-0.04, 0.12, 0.1], 0.025, 5),
            ball(0x2a2020, [0.04, 0.12, 0.1], 0.025, 5),
            cyl(0xfff5e0, 0.02, 0.02, 0.4, [0.25, 0.03, 0.05], 5, [
              0,
              0.5,
              Math.PI / 2,
            ]),
            ball(0xfff5e0, [0.42, 0.03, -0.04], 0.035, 5),
            ball(0xfff5e0, [0.08, 0.03, 0.14], 0.035, 5),
          ]),
          join([
            lump(0x4a3838, [0, 0.05, 0], [0.12, 0.07, 0.1]),
            lump(0x5a4444, [0.2, 0.04, 0.1], 0.07),
          ]),
        ],
        feature: [
          // 石の柱とくさり
          join([
            ...[-1.4, 0, 1.4].flatMap((x) => [
              box(0x4a3838, [0.22, 0.8, 0.22], [x, 0.4, 0]),
              cone(0x5a4444, 0.18, 0.2, [x, 0.9, 0], 4, [0, Math.PI / 4, 0]),
            ]),
            ...[-0.7, 0.7].flatMap((x) => [
              ring(
                0x8a8a9a,
                0.72,
                0.03,
                [x, 0.98, 0],
                [0, 0, Math.PI + 0.25],
                Math.PI - 0.5,
              ),
            ]),
          ]),
          // 溶岩だまり
          join([
            cyl(0xff7a2a, 0.62, 0.62, 0.04, [0, 0.02, 0], 12),
            cyl(0xffc040, 0.3, 0.3, 0.05, [0.1, 0.02, 0.05], 10),
            ...[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const a = (i * Math.PI * 2) / 7
              return lump(
                i % 2 === 0 ? 0x4a3838 : 0x5a4444,
                [Math.cos(a) * 0.66, 0.06, Math.sin(a) * 0.66],
                [0.2, 0.1 + (i % 3) * 0.04, 0.18],
              )
            }),
          ]),
        ],
        far: [
          // 火山
          join([
            cyl(0x4a3030, 1.8, 6.5, 8.5, [0, 4.25, 0], 12),
            cyl(0xff7a2a, 1.7, 1.7, 0.2, [0, 8.5, 0], 12),
            cyl(0xffc040, 1.0, 1.0, 0.24, [0, 8.5, 0], 10),
            box(0xff7a2a, [0.5, 5.0, 0.2], [0.6, 6.1, 2.75], [-0.5, 0, -0.1]),
            box(0xff9a3a, [0.36, 3.6, 0.2], [-1.4, 6.6, 2.2], [-0.45, 0, 0.3]),
            box(0xff7a2a, [0.4, 3.0, 0.2], [2.4, 6.9, 1.7], [-0.4, 0, -0.5]),
            ball(0x6a5050, [0.3, 9.8, 0], 1.0, 8),
            ball(0x7a6060, [-0.5, 11.4, 0.2], 1.3, 8),
            ball(0x8a7070, [0.6, 13.2, 0], 1.6, 8),
          ]),
          // 黒いとりで
          join([
            cyl(0x3a2a34, 1.7, 2.0, 6.5, [0, 3.25, 0], 8),
            cyl(0x4a3a44, 2.1, 2.1, 0.5, [0, 6.7, 0], 8),
            ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const a = (i * Math.PI * 2) / 8
              return box(
                0x4a3a44,
                [0.6, 0.6, 0.6],
                [Math.cos(a) * 1.9, 7.2, Math.sin(a) * 1.9],
                [0, -a, 0],
              )
            }),
            box(0xff7a2a, [0.4, 0.8, 0.1], [0, 4.6, 1.85]),
            box(0xff7a2a, [0.4, 0.8, 0.1], [0.9, 2.6, 1.7], [0, 0.5, 0]),
            box(0x1a1014, [1.0, 1.6, 0.1], [0, 0.8, 2.0]),
            cone(0x3a2a34, 1.2, 2.2, [0, 8.2, 0], 8),
          ]),
        ],
        lamp: join(lampPost(0x2a2020, 0x2a2020, 0xff9a3a, 2)),
      }
    },
  },
  // 星の世界
  {
    sky: [0x05061a, 0x1a1245, 0x4a2a7a],
    sun: 0xfff0c0,
    sunLight: 0xd0d0ff,
    sunPower: 1.2,
    ambient: 0xc8c0ff,
    ambientPower: 1.25,
    far: 0x2a2060,
    near: 0x1a1548,
    cloud: 0x4a2a7a,
    cloudAlpha: 0,
    stars: 1,
    lamp: 1,
    height: 0.7,
    ground: 0x9a90c8,
    hills: [0xa8a0d8, 0x7a70a8],
    path: 0xc8c0e8,
    cliff: 0x4a4270,
    water: 0x0a0a2a,
    particle: {
      color: 0xffffff,
      size: 0.13,
      fall: 0.06,
      drift: 0.15,
      dot: true,
    },
    build: () => {
      const crystals = (a: number, b: number) =>
        join([
          gem(a, [0, 1.0, 0], [0.3, 1.3, 0.3]),
          gem(b, [0.4, 0.6, 0.1], [0.2, 0.8, 0.2], [0, 0, -0.4]),
          gem(b, [-0.36, 0.5, 0], [0.18, 0.65, 0.18], [0, 0, 0.45]),
          gem(a, [0.05, 0.3, 0.35], [0.12, 0.4, 0.12], [0.5, 0, 0]),
        ])
      const rocket = (body: number, accent: number) => [
        cyl(body, 0.28, 0.3, 1.3, [0, 1.05, 0], 10),
        cone(accent, 0.28, 0.6, [0, 2.0, 0], 10),
        cyl(0x5a6090, 0.2, 0.26, 0.2, [0, 0.3, 0], 10),
        cone(0xffc040, 0.16, 0.3, [0, 0.08, 0], 8, [Math.PI, 0, 0]),
        ball(0x7ad0ff, [0, 1.3, 0.27], 0.11, 8),
        ring(0xd0d4e8, 0.11, 0.025, [0, 1.3, 0.3]),
        ...[0, 1, 2].map((i) => {
          const a = (i * Math.PI * 2) / 3 + 0.5
          return box(
            accent,
            [0.42, 0.5, 0.05],
            [Math.cos(a) * 0.4, 0.55, -Math.sin(a) * 0.4],
            [0, a, 0],
          )
        }),
      ]
      return {
        tall: [
          crystals(0x7af0ff, 0xb08aff),
          crystals(0xff8ad8, 0x8a9aff),
          // アンテナ
          join([
            ...[0, 1, 2].map((i) => {
              const a = (i * Math.PI * 2) / 3
              return stick(
                0xd0d4e8,
                0.03,
                [Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4],
                1.6,
                Math.cos(a) * 0.25,
                -Math.sin(a) * 0.25,
                1,
              ).geometry
            }),
            cyl(0xd0d4e8, 0.05, 0.05, 0.6, [0, 1.8, 0], 6),
            dome(0xffffff, [0, 2.3, 0], [0.7, 0.3, 0.7], 12, [
              Math.PI + 0.5,
              0,
              0,
            ]),
            cyl(0xff8a3a, 0.02, 0.02, 0.5, [0, 2.45, 0.2], 5, [0.5, 0, 0]),
            ball(0xff5a5a, [0, 2.66, 0.32], 0.06, 6),
          ]),
          // ふしぎな木
          join([
            ...(() => {
              const trunk = stick(0x8a70c8, 0.1, [0, 0, 0], 1.2, 0.15)
              const a = stick(0x8a70c8, 0.06, trunk.tip, 0.8, 0.8)
              const b = stick(0x8a70c8, 0.06, trunk.tip, 0.9, -0.5, 0.3)
              const c = stick(0x8a70c8, 0.06, trunk.tip, 0.7, 0.1, -0.4)
              return [
                trunk.geometry,
                a.geometry,
                b.geometry,
                c.geometry,
                ball(0x7af0ff, a.tip, 0.28, 10),
                ball(0xff8ad8, b.tip, 0.34, 10),
                ball(0xfff27a, c.tip, 0.24, 10),
              ]
            })(),
          ]),
        ],
        mid: [
          // クレーター
          join([
            ring(
              0x8a80b8,
              0.42,
              0.12,
              [0, 0.03, 0],
              [Math.PI / 2, 0, 0],
              Math.PI * 2,
              [1, 1, 0.6],
            ),
            cyl(0x6a6098, 0.4, 0.4, 0.02, [0, 0.02, 0], 12),
            lump(0xb0a8e0, [0.5, 0.1, 0.2], 0.13),
          ]),
          // 探査車
          join([
            box(0xffffff, [0.7, 0.2, 0.44], [0, 0.34, 0]),
            ...[-0.25, 0, 0.25].flatMap((x) =>
              [-0.26, 0.26].map((z) =>
                cyl(0x3a3a5a, 0.12, 0.12, 0.08, [x, 0.12, z], 8, [
                  Math.PI / 2,
                  0,
                  0,
                ]),
              ),
            ),
            box(0x4a7aff, [0.6, 0.03, 0.5], [-0.05, 0.56, 0], [0, 0, 0.15]),
            cyl(0xd0d4e8, 0.02, 0.02, 0.5, [0.26, 0.66, 0.1], 5),
            box(0xffffff, [0.18, 0.12, 0.14], [0.26, 0.94, 0.1]),
            ball(0x3a3a5a, [0.34, 0.94, 0.1], 0.04, 6),
            cyl(0xf2c14e, 0.01, 0.01, 0.4, [-0.25, 0.62, -0.12], 4),
          ]),
          join(rocks(0x8a80b8, 0xb0a8e0)),
        ],
        small: [
          join([
            gem(0x7af0ff, [0, 0.14, 0], [0.06, 0.16, 0.06]),
            gem(
              0xb08aff,
              [0.13, 0.09, 0.04],
              [0.045, 0.1, 0.045],
              [0, 0, -0.4],
            ),
            gem(
              0xff8ad8,
              [-0.11, 0.08, -0.02],
              [0.04, 0.09, 0.04],
              [0, 0, 0.4],
            ),
          ]),
          // 旗
          join([
            cyl(0xd0d4e8, 0.012, 0.012, 0.7, [0, 0.35, 0], 5),
            box(0xff8a1f, [0.3, 0.2, 0.01], [0.16, 0.58, 0]),
            box(0x19b5d8, [0.3, 0.05, 0.012], [0.16, 0.58, 0]),
          ]),
          join([
            lump(0x8a80b8, [0, 0.05, 0], [0.12, 0.07, 0.1]),
            lump(0xb0a8e0, [0.2, 0.04, 0.1], 0.07),
            ball(0xfff27a, [-0.15, 0.1, 0.05], 0.04, 5),
          ]),
        ],
        feature: [
          // 太陽電池
          join([
            cyl(0xd0d4e8, 0.04, 0.05, 0.9, [0, 0.45, 0], 6),
            box(0x3a5ad0, [1.6, 0.04, 0.8], [0, 1.0, 0], [0.6, 0, 0]),
            ...[-0.4, 0, 0.4].map((x) =>
              box(0xd0d4e8, [0.03, 0.05, 0.82], [x, 1.0, 0], [0.6, 0, 0]),
            ),
            box(0xd0d4e8, [1.64, 0.05, 0.03], [0, 1.0, 0], [0.6, 0, 0]),
          ]),
          join(
            rocket(0xffffff, 0xff5a5a).map((item) =>
              item.scale(0.75, 0.75, 0.75),
            ),
          ),
        ],
        far: [
          // 発射台のロケット
          join([
            ...rocket(0xffffff, 0xff8a1f).map((item) =>
              item.scale(3.6, 3.6, 3.6),
            ),
            box(0x5a6090, [0.4, 8.5, 0.4], [-2.2, 4.25, -0.5]),
            ...[1.5, 3.5, 5.5, 7.5].map((y) =>
              box(0x7a80b0, [1.4, 0.14, 0.14], [-1.5, y, -0.5]),
            ),
            box(0x4a4270, [5.5, 0.4, 3.0], [-0.6, 0.2, 0]),
            ball(0xff5a5a, [-2.2, 8.7, -0.5], 0.16, 6),
          ]),
          // ドームの基地と輪のある星
          join([
            dome(0x9fd8ff, [0, 0, 0], [2.8, 2.4, 2.8], 16),
            cyl(0xd0d4e8, 2.95, 3.05, 0.5, [0, 0.25, 0], 16),
            ring(0xd0d4e8, 2.0, 0.07, [0, 1.6, 0], [Math.PI / 2, 0, 0]),
            dome(0xbfe8ff, [3.6, 0, 0.6], [1.4, 1.2, 1.4], 12),
            cyl(0xd0d4e8, 1.5, 1.55, 0.36, [3.6, 0.18, 0.6], 12),
            box(0xd0d4e8, [1.4, 0.7, 0.8], [1.9, 0.5, 0.9]),
            ball(0xffb070, [-3.5, 12, -2], 2.2, 14),
            ball(0xff8a4a, [-3.0, 12.6, -0.4], [1.0, 0.5, 0.6], 8),
            ring(
              0xffe0b0,
              3.3,
              0.28,
              [-3.5, 12, -2],
              [1.2, 0.3, 0],
              Math.PI * 2,
              [1, 1, 0.12],
            ),
          ]),
        ],
        lamp: join(lampPost(0xd0d4e8, 0xd0d4e8, 0x7af0ff, 2)),
      }
    },
  },
  // 空の美術館
  {
    sky: [0x6fb0ff, 0xffe0b0, 0xfff8e0],
    sun: 0xfff0a0,
    sunLight: 0xfff4d8,
    sunPower: 1.65,
    ambient: 0xfffaf0,
    ambientPower: 1.5,
    far: 0xffffff,
    near: 0xffe8d0,
    cloud: 0xffffff,
    cloudAlpha: 1,
    stars: 0.2,
    lamp: 0.5,
    height: 0.45,
    ground: 0xfffaf0,
    hills: [0xffffff, 0xffeccc],
    path: 0xffe9a8,
    cliff: 0xf0e0c8,
    water: 0xbfe4ff,
    particle: { color: 0xffe070, size: 0.16, fall: 0.2, drift: 0.3, dot: true },
    aligned: true,
    build: () => {
      const column = (height: number) => [
        box(0xf0ece4, [0.62, 0.14, 0.62], [0, 0.07, 0]),
        cyl(0xffffff, 0.2, 0.24, height, [0, 0.14 + height / 2, 0], 12),
        ...[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i * Math.PI) / 3
          return box(
            0xf0ece4,
            [0.04, height, 0.04],
            [Math.cos(a) * 0.22, 0.14 + height / 2, Math.sin(a) * 0.22],
          )
        }),
      ]
      const capital = (y: number) => [
        box(0xffffff, [0.6, 0.1, 0.6], [0, y + 0.13, 0]),
        cyl(0xf2c14e, 0.11, 0.11, 0.62, [-0.3, y + 0.04, 0], 8, [
          Math.PI / 2,
          0,
          0,
        ]),
        cyl(0xf2c14e, 0.11, 0.11, 0.62, [0.3, y + 0.04, 0], 8, [
          Math.PI / 2,
          0,
          0,
        ]),
      ]
      const emptyFrame = (w: number, h: number, t: number) => [
        box(0xf2c14e, [w + t, t, t], [0, h, 0]),
        box(0xf2c14e, [w + t, t, t], [0, 0, 0]),
        box(0xf2c14e, [t, h, t], [-w / 2, h / 2, 0]),
        box(0xf2c14e, [t, h, t], [w / 2, h / 2, 0]),
        ...(
          [
            [-w / 2, 0],
            [w / 2, 0],
            [-w / 2, h],
            [w / 2, h],
          ] as const
        ).map(([x, y]) => ball(0xffe9a8, [x, y, 0], t * 0.8, 8)),
      ]
      return {
        tall: [
          join([...column(2.4), ...capital(2.54)]),
          // 折れた柱
          join([
            ...column(1.3),
            cyl(
              0xffffff,
              0.2,
              0.22,
              0.7,
              [0.6, 0.22, 0.2],
              12,
              [0.2, 0.5, 1.45],
            ),
          ]),
          // 彫刻
          join([
            box(0xf0ece4, [0.7, 0.9, 0.7], [0, 0.45, 0]),
            box(0xffffff, [0.8, 0.08, 0.8], [0, 0.94, 0]),
            ring(0xf2c14e, 0.5, 0.1, [0, 1.6, 0], [0, 0.4, 0]),
            ring(0xffe9a8, 0.3, 0.07, [0, 1.6, 0], [0, -0.8, 0.5]),
            ball(0x7ad0ff, [0, 1.6, 0], 0.16, 10),
          ]),
          join(roundTree(0xf2c14e, 0xffffff, 0xffeccc, 0xffe9a8)),
        ],
        mid: [
          join(bush(0xffffff, 0xfff4e0, 0xffffff)),
          // つぼ
          join([
            cyl(0x4a7aff, 0.1, 0.13, 0.08, [0, 0.04, 0], 10),
            ball(0xffffff, [0, 0.36, 0], [0.26, 0.3, 0.26], 12),
            ring(0x4a7aff, 0.25, 0.03, [0, 0.4, 0], [Math.PI / 2, 0, 0]),
            ring(0x4a7aff, 0.2, 0.025, [0, 0.56, 0], [Math.PI / 2, 0, 0]),
            cyl(0xffffff, 0.12, 0.09, 0.2, [0, 0.72, 0], 10),
            ring(0xf2c14e, 0.12, 0.025, [0, 0.82, 0], [Math.PI / 2, 0, 0]),
          ]),
          // 台座の宝石
          join([
            box(0xf0ece4, [0.4, 0.5, 0.4], [0, 0.25, 0]),
            box(0xffffff, [0.48, 0.06, 0.48], [0, 0.53, 0]),
            gem(0x7af0ff, [0, 0.86, 0], [0.16, 0.24, 0.16]),
          ]),
        ],
        small: [
          // 金の星
          join(
            (
              [
                [0, 0.4, 0],
                [0.24, 0.26, 0.1],
                [-0.2, 0.3, 0.05],
              ] as V3[]
            ).flatMap((pos) => [
              cyl(
                0xffffff,
                0.008,
                0.008,
                pos[1],
                [pos[0], pos[1] / 2, pos[2]],
                4,
              ),
              gem(0xffd84a, pos, [0.07, 0.07, 0.03]),
              gem(0xffd84a, pos, [0.07, 0.07, 0.03], [0, 0, Math.PI / 4]),
            ]),
          ),
          join([
            ball(0xffffff, [0, 0.1, 0], [0.2, 0.12, 0.16], 8),
            ball(0xffffff, [0.2, 0.08, 0.05], [0.14, 0.09, 0.12], 8),
            ball(0xfff4e0, [-0.18, 0.07, 0], [0.12, 0.08, 0.1], 8),
          ]),
          join(flowers(0xf2c14e, 0xffffff, 0xffd84a)),
        ],
        feature: [
          // 赤いロープのしきり
          join([
            ...[-1.4, 0, 1.4].flatMap((x) => [
              cyl(0xf2c14e, 0.13, 0.15, 0.06, [x, 0.03, 0], 10),
              cyl(0xf2c14e, 0.03, 0.03, 0.85, [x, 0.45, 0], 6),
              ball(0xffe9a8, [x, 0.92, 0], 0.07, 8),
            ]),
            ring(
              0xc8303a,
              0.75,
              0.035,
              [-0.7, 1.05, 0],
              [0, 0, Math.PI + 0.36],
              Math.PI - 0.72,
            ),
            ring(
              0xc8303a,
              0.75,
              0.035,
              [0.7, 1.05, 0],
              [0, 0, Math.PI + 0.36],
              Math.PI - 0.72,
            ),
          ]),
          join(
            emptyFrame(1.2, 1.5, 0.12).map((item) =>
              item.translate(0, 0.06, 0),
            ),
          ),
        ],
        far: [
          // 神殿
          join([
            box(0xf0ece4, [8.4, 0.4, 4.0], [0, 0.2, 0]),
            box(0xffffff, [7.6, 0.4, 3.4], [0, 0.6, 0]),
            ...[-3.2, -1.92, -0.64, 0.64, 1.92, 3.2].flatMap((x) => [
              cyl(0xffffff, 0.3, 0.34, 4.4, [x, 3.0, 1.2], 10),
              box(0xf2c14e, [0.8, 0.16, 0.8], [x, 5.28, 1.2]),
            ]),
            box(0xfff4e0, [6.4, 4.4, 1.6], [0, 3.0, -0.4]),
            box(0xffffff, [7.6, 0.5, 3.0], [0, 5.6, 0.4]),
            prism(0xfff4e0, 3.0, 1.8, 7.6, [0, 5.85, 0.4]),
            ball(0xf2c14e, [0, 7.9, 0.4], 0.26, 8),
            box(0x8a6a50, [1.2, 2.6, 0.1], [0, 2.1, 0.42]),
          ]),
          // 空をのぞく大きな額ぶち
          join([
            ...emptyFrame(5.6, 7.0, 0.5).map((item) =>
              item.translate(0, 1.2, 0),
            ),
            box(0xf0ece4, [6.8, 0.5, 1.4], [0, 0.25, 0]),
            box(0xffffff, [6.2, 0.5, 1.0], [0, 0.75, 0]),
            ...bush(0xffffff, 0xfff4e0, 0xffffff).map((item) =>
              item.applyMatrix4(xf([-3.6, 0, 0.8], 2.6)),
            ),
            ...bush(0xffffff, 0xfff4e0, 0xffffff).map((item) =>
              item.applyMatrix4(xf([3.8, 0, 0.6], 2.2)),
            ),
          ]),
        ],
        lamp: join(lampPost(0xf2c14e, 0xffffff, 0xfff1b0, 1)),
      }
    },
  },
  // じゃがいも畑
  {
    sky: [0x4aa0f5, 0x9fd4ff, 0xeaf7ff],
    sun: 0xfff3c0,
    sunLight: 0xfffaf0,
    sunPower: 1.7,
    ambient: 0xffffff,
    ambientPower: 1.5,
    far: 0xb4d4f0,
    near: 0x8fc0e8,
    cloud: 0xffffff,
    cloudAlpha: 1,
    stars: 0,
    lamp: 0,
    height: 0.62,
    ground: 0x8a5a3c,
    hills: [0x8fd07a, 0x6fbf78],
    path: 0xead9b8,
    cliff: 0x7a4a30,
    water: 0x58b8f0,
    particle: {
      color: 0xffffff,
      size: 0.22,
      fall: 0.3,
      drift: 1.0,
      dot: false,
    },
    build: () => {
      /** じゃがいもの株（白い花つき） */
      const plant = () => [
        ...bush(0x3f9a52, 0x55b266, 0x358a48),
        ...(
          [
            [0.1, 0.62, 0.12],
            [-0.26, 0.44, 0.16],
            [0.38, 0.48, 0.1],
          ] as V3[]
        ).flatMap((pos) => [
          ball(0xffffff, pos, [0.07, 0.04, 0.07], 8),
          ball(0xffd84a, [pos[0], pos[1] + 0.03, pos[2]], 0.025, 6),
        ]),
      ]
      /** じゃがいもの山 */
      const potatoes = (x: number, y: number, z: number, scale = 1) =>
        (
          [
            [0, 0, 0, 0.13],
            [0.2, -0.01, 0.06, 0.11],
            [-0.18, -0.02, 0.04, 0.12],
            [0.06, 0.12, 0.02, 0.1],
            [-0.06, -0.02, 0.18, 0.1],
          ] as const
        ).map(([px, py, pz, size], index) =>
          lump(
            index % 2 === 0 ? 0xd9b46a : 0xc9a055,
            [x + px * scale, y + py * scale, z + pz * scale],
            [size * 1.25 * scale, size * scale, size * scale],
          ),
        )
      return {
        tall: [
          join(roundTree(0x8a5a40, 0x5fbf6a, 0x4cae60, 0x7ad680)),
          join(roundTree(0x8a5a40, 0x6fca78, 0x58b86a, 0x8fe090)),
        ],
        mid: [
          join(plant()),
          // 木箱いっぱいのじゃがいも
          join([
            box(0xb9855a, [0.8, 0.42, 0.56], [0, 0.21, 0]),
            box(0x9a6a44, [0.84, 0.06, 0.6], [0, 0.4, 0]),
            box(0x9a6a44, [0.84, 0.06, 0.6], [0, 0.12, 0]),
            ...potatoes(0, 0.5, 0, 1.25),
          ]),
          // 麻ぶくろ
          join([
            cyl(0xc9ae7a, 0.2, 0.3, 0.6, [0, 0.3, 0], 10),
            ring(0x8a6a40, 0.2, 0.02, [0, 0.58, 0], [Math.PI / 2, 0, 0]),
            ...potatoes(0, 0.66, 0, 0.9),
            ...potatoes(0.45, 0.1, 0.2, 0.9),
          ]),
        ],
        small: [
          join(plant().map((item) => item.applyMatrix4(xf([0, 0, 0], 0.62)))),
          join(potatoes(0, 0.1, 0, 1)),
          join(flowers(0x4fae62, 0xffffff, 0xffd84a)),
        ],
        feature: [
          join(fence(0xb9855a, 0x9a6a44)),
          // かかし
          join([
            cyl(0x9a6a44, 0.04, 0.04, 1.7, [0, 0.85, 0], 6),
            box(0x9a6a44, [1.2, 0.07, 0.07], [0, 1.2, 0]),
            box(0x4f8fd8, [0.5, 0.56, 0.2], [0, 1.02, 0]),
            ball(0xf0d9a8, [0, 1.52, 0], 0.17, 10),
            cone(0xd9b25a, 0.3, 0.26, [0, 1.76, 0], 10),
            cyl(0xd9b25a, 0.36, 0.36, 0.03, [0, 1.65, 0], 12),
          ]),
          // 「じゃがいも」の立て札
          join([
            cyl(0x9a6a44, 0.035, 0.035, 0.7, [0, 0.35, 0], 6),
            box(0xfff3dc, [0.7, 0.36, 0.05], [0, 0.78, 0]),
            lump(0xd9b46a, [0, 0.78, 0.04], [0.17, 0.12, 0.03]),
          ]),
        ],
        far: [
          // 納屋
          join([
            box(0xb5523c, [3.6, 2.4, 2.8], [0, 1.2, 0]),
            prism(0x7a3a2a, 3.9, 1.6, 3.1, [0, 2.4, 0]),
            box(0xfff3dc, [1.1, 1.5, 0.1], [0, 0.75, 1.42]),
          ]),
        ],
        lamp: join(lampPost(0x7a5a3a, 0x7a5a3a, 0xfff1b0)),
      }
    },
  },
  // Aipictors デジタルワールド
  {
    sky: [0x050a2e, 0x10206a, 0x2a5ad0],
    sun: 0xcfe8ff,
    sunLight: 0xa8c8ff,
    sunPower: 1.1,
    ambient: 0xc0d4ff,
    ambientPower: 1.3,
    far: 0x14267a,
    near: 0x0e1a58,
    cloud: 0x3a5ac8,
    cloudAlpha: 0.5,
    stars: 0.6,
    lamp: 1,
    height: 0.7,
    ground: 0x16246e,
    hills: [0x1a2c80, 0x22389a],
    path: 0x8fa8e8,
    cliff: 0x101a55,
    water: 0x1f3fa0,
    particle: {
      color: 0x7ae0ff,
      size: 0.13,
      fall: -0.25,
      drift: 0.2,
      dot: true,
    },
    aligned: true,
    build: () => {
      const ORANGE = 0xff8a1f
      const BLUE = 0x4d8dff
      const TEAL = 0x2fe0c8
      const PINK = 0xff6fa8
      /** 作品のカード（光る絵と、下にいいねの印） */
      const card = (
        x: number,
        y: number,
        w: number,
        h: number,
        color: number,
        z = 0,
      ) => [
        box(0x1a2a6a, [w + 0.08, h + 0.08, 0.05], [x, y, z]),
        lit(box(color, [w, h, 0.04], [x, y, z + 0.02]), 1),
        lit(
          box(
            0xffffff,
            [w * 0.5, 0.04, 0.04],
            [x - w * 0.2, y - h / 2 - 0.09, z + 0.02],
          ),
          0.8,
        ),
        lit(
          ball(PINK, [x + w * 0.38, y - h / 2 - 0.09, z + 0.03], 0.045, 8),
          1.2,
        ),
      ]
      return {
        tall: [
          join(building(1.4, 4.6, 1.2, 0x18267a, [BLUE, TEAL, 0xffffff], 151)),
          join(building(1.1, 3.4, 1.0, 0x1c2c88, [ORANGE, BLUE], 152)),
        ],
        mid: [
          // 宙に浮かぶ作品のカード
          join([
            ...card(0, 1.0, 0.7, 0.5, BLUE),
            lit(cyl(TEAL, 0.02, 0.02, 0.7, [0, 0.35, 0], 6), 0.6),
            lit(ring(TEAL, 0.22, 0.02, [0, 0.03, 0], [Math.PI / 2, 0, 0]), 1),
          ]),
          join([
            ...card(0, 0.9, 0.5, 0.66, ORANGE),
            lit(cyl(BLUE, 0.02, 0.02, 0.56, [0, 0.28, 0], 6), 0.6),
            lit(ring(BLUE, 0.22, 0.02, [0, 0.03, 0], [Math.PI / 2, 0, 0]), 1),
          ]),
          // データのかたまり
          join([
            lit(box(TEAL, [0.34, 0.34, 0.34], [0, 0.3, 0], [0.5, 0.6, 0]), 0.9),
            lit(
              box(BLUE, [0.2, 0.2, 0.2], [0.34, 0.62, 0.05], [0.3, 0.2, 0.4]),
              0.9,
            ),
            lit(
              box(ORANGE, [0.14, 0.14, 0.14], [-0.3, 0.7, 0], [0.2, 0.7, 0.1]),
              1,
            ),
          ]),
        ],
        small: [
          join([lit(gem(TEAL, [0, 0.22, 0], [0.12, 0.2, 0.12]), 1.1)]),
          join([lit(gem(ORANGE, [0, 0.2, 0], [0.1, 0.18, 0.1]), 1.1)]),
          join([
            lit(ball(PINK, [0, 0.3, 0], 0.08, 8), 1.2),
            lit(ball(PINK, [0.11, 0.33, 0], 0.06, 8), 1.2),
            lit(ball(PINK, [-0.11, 0.33, 0], 0.06, 8), 1.2),
          ]),
        ],
        feature: [
          // ブラウザの窓（作品の一覧）
          join([
            box(0x101c58, [2.3, 1.5, 0.06], [0, 1.15, 0]),
            lit(box(0xffffff, [2.3, 0.14, 0.07], [0, 1.83, 0]), 0.7),
            lit(ball(ORANGE, [-1.02, 1.83, 0.04], 0.04, 8), 1.2),
            lit(ball(TEAL, [-0.9, 1.83, 0.04], 0.04, 8), 1.2),
            ...[BLUE, ORANGE, TEAL, PINK, TEAL, BLUE].flatMap(
              (color, index) => [
                lit(
                  box(
                    color,
                    [0.62, 0.5, 0.04],
                    [
                      (index % 3) * 0.72 - 0.72,
                      1.4 - Math.floor(index / 3) * 0.62,
                      0.04,
                    ],
                  ),
                  0.9,
                ),
              ],
            ),
            cyl(0x2a3a8a, 0.04, 0.04, 0.4, [-0.9, 0.2, 0], 6),
            cyl(0x2a3a8a, 0.04, 0.04, 0.4, [0.9, 0.2, 0], 6),
          ]),
          // 「投稿」のゲート
          join([
            lit(box(BLUE, [0.08, 1.9, 0.08], [-0.7, 0.95, 0]), 0.9),
            lit(box(BLUE, [0.08, 1.9, 0.08], [0.7, 0.95, 0]), 0.9),
            lit(box(ORANGE, [1.6, 0.3, 0.1], [0, 2.0, 0]), 1),
            lit(cone(0xffffff, 0.1, 0.16, [0, 2.02, 0.07], 3), 1.2),
          ]),
        ],
        far: [
          join(building(2.6, 7.5, 2.2, 0x14226e, [BLUE, TEAL, ORANGE], 153)),
          join(building(2.0, 5.5, 1.8, 0x182a80, [0xffffff, BLUE], 154)),
        ],
        lamp: join(lampPost(0x2a3a9a, 0x2a3a9a, 0x9fe8ff)),
      }
    },
  },
]

type Air = {
  /** かすみが掛かり始める遠さと、すっかりかすむ遠さ */
  fog: [number, number]
  /** もやの濃さ */
  mist: number
  /** 光のすじの強さ */
  shafts: number
  flyer: "bird" | "fish" | "meteor" | "none"
  flyerColor: number
}

/** ステージごとの空気（THEMES と同じ並び） */
const AIR_DEFS: Air[] = [
  {
    fog: [16, 75],
    mist: 0.14,
    shafts: 0.14,
    flyer: "bird",
    flyerColor: 0x4a5a8a,
  },
  {
    fog: [14, 60],
    mist: 0.3,
    shafts: 0.24,
    flyer: "bird",
    flyerColor: 0x9a6a8a,
  },
  {
    fog: [18, 80],
    mist: 0.12,
    shafts: 0.1,
    flyer: "bird",
    flyerColor: 0xffffff,
  },
  {
    fog: [13, 55],
    mist: 0.32,
    shafts: 0.26,
    flyer: "bird",
    flyerColor: 0x5a2a2a,
  },
  {
    fog: [11, 40],
    mist: 0.5,
    shafts: 0.42,
    flyer: "none",
    flyerColor: 0xffffff,
  },
  {
    fog: [12, 46],
    mist: 0.45,
    shafts: 0.1,
    flyer: "none",
    flyerColor: 0xffffff,
  },
  { fog: [13, 50], mist: 0.36, shafts: 0, flyer: "none", flyerColor: 0xffffff },
  {
    fog: [15, 65],
    mist: 0.22,
    shafts: 0.16,
    flyer: "bird",
    flyerColor: 0xff8fb8,
  },
  {
    fog: [13, 52],
    mist: 0.34,
    shafts: 0.34,
    flyer: "bird",
    flyerColor: 0x3a2020,
  },
  {
    fog: [10, 34],
    mist: 0.45,
    shafts: 0.5,
    flyer: "fish",
    flyerColor: 0xffa040,
  },
  {
    fog: [11, 40],
    mist: 0.5,
    shafts: 0.12,
    flyer: "none",
    flyerColor: 0xffffff,
  },
  {
    fog: [16, 80],
    mist: 0.12,
    shafts: 0,
    flyer: "meteor",
    flyerColor: 0xffffff,
  },
  {
    fog: [13, 55],
    mist: 0.4,
    shafts: 0.36,
    flyer: "bird",
    flyerColor: 0xf2c14e,
  },
  // じゃがいも畑
  {
    fog: [16, 75],
    mist: 0.16,
    shafts: 0.16,
    flyer: "bird",
    flyerColor: 0x5a4a3a,
  },
  // Aipictors デジタルワールド
  {
    fog: [14, 55],
    mist: 0.3,
    shafts: 0,
    flyer: "meteor",
    flyerColor: 0x9fe8ff,
  },
]

/** ステージごとの雨の強さと、地面の濡れぐあい（THEMES と同じ並び） */
const WEATHER_DEFS: { rain: number; wet: number }[] = [
  { rain: 0, wet: 0 },
  { rain: 0, wet: 0 },
  { rain: 0, wet: 0 },
  { rain: 0, wet: 0 },
  { rain: 0.7, wet: 0.85 },
  { rain: 0, wet: 0 },
  { rain: 1, wet: 1 },
  { rain: 0, wet: 0 },
  { rain: 0.35, wet: 0.7 },
  { rain: 0, wet: 0 },
  { rain: 0, wet: 0 },
  { rain: 0, wet: 0 },
  { rain: 0, wet: 0 },
  { rain: 0, wet: 0 },
  { rain: 0, wet: 0.5 },
]

/** 夜に自分で光らせる色（ステージの番号ごと） */
const GLOW_DEFS: Record<number, ReadonlySet<number>> = {
  6: new Set([
    0xff5ab0, 0x7af0ff, 0xfff1a0, 0xff5a5a, 0xffb0e0, 0xbff4ff, 0xffc040,
  ]),
  10: new Set([0xff7a2a, 0xffb040, 0xff5a2a, 0xff6a1a]),
  14: new Set([0xff8a1f, 0x4d8dff, 0x2fe0c8, 0xff6fa8, 0xffffff, 0x9fe8ff]),
}

// ここまでの表は、作った順（PICTOR_RUN_STAGES の id の順）。ここで、走る順に並べ替える
const THEMES = inPictorRunStageOrder(THEME_DEFS)
const AIR = inPictorRunStageOrder(AIR_DEFS)
const WEATHER = inPictorRunStageOrder(WEATHER_DEFS)
const GLOW: Record<number, ReadonlySet<number>> = Object.fromEntries(
  PICTOR_RUN_STAGES.flatMap((stage, index) =>
    GLOW_DEFS[stage.id - 1] ? [[index, GLOW_DEFS[stage.id - 1]]] : [],
  ),
)

/** ステージの終わりのこの長さ（m）で、空や地面の色を次のステージへ移す */
const BLEND_LENGTH = 14

/** 道ばたのものは、この長さ（m）だけ先に次のステージの形へ入れ替える（画面の外から流れてくる分） */
const PROP_LEAD = 20

/** 道ばたのものがくり返す長さ */
const SPAN = 72

/** 額ぶちの形（横長・正方形・縦長） */
const FRAME_SIZES: [number, number][] = [
  [1.36, 1.04],
  [1.14, 1.14],
  [1.0, 1.32],
]

type Scroller = {
  object: Object3D
  speed: number
  span: number
  min: number
  onWrap?: () => void
}

type Slot = { mesh: Mesh; kind: PropKind; theme: number }

type Art = {
  material: MeshBasicMaterial
  shape: number
  /** 作品の番号（最初から入っている絵にはない） */
  id?: string
  /** 作者の名前の札 */
  plate?: MeshBasicMaterial
}

/** 光の当たり方を計算する素材（軽量モードは、計算の軽いもの） */
type Solid = MeshStandardMaterial | MeshLambertMaterial

type Framed = { group: Group; frame: Mesh; painting: Mesh; plate: Mesh }

export function createPictorRunStage(
  scene: Scene,
  track: Track,
  lights: { ambient: AmbientLight; sun: DirectionalLight },
  options: PictorRunStageOptions,
): PictorRunStage {
  if (THEME_DEFS.length !== PICTOR_RUN_STAGES.length) {
    throw new Error("stage count mismatch")
  }
  const { lite, shadows, camera, renderer } = options
  const random = createRandom(404)
  const scrollers: Scroller[] = []
  const scroll = (
    object: Object3D,
    speed: number,
    span: number,
    min = -20,
    onWrap?: () => void,
  ) => {
    scene.add(object)
    scrollers.push({ object, speed, span, min, onWrap })
  }
  let disposed = false
  /** 遠くの山・雲・丘（背景画がおおっている間は描かない） */
  const farScenery: Object3D[] = []

  // ---- 素材 -----------------------------------------------------------------
  /** 濡れぐあい（0〜1）と、夜に光るものの明るさ。どの素材も同じ値を見る */
  const wetUniform = { value: 0 }
  const glowUniform = { value: 0 }
  const solid = (
    params: {
      color?: number
      map?: Texture
      vertexColors?: boolean
      fog?: boolean
      alphaTest?: number
      transparent?: boolean
    },
    roughness = 0.85,
  ): Solid =>
    track(
      lite
        ? new MeshLambertMaterial(params)
        : new MeshStandardMaterial({ ...params, roughness, metalness: 0 }),
    )

  // 表面の模様（木目・石・葉・ぬり壁）。軽量モードでは貼らない
  const surfaceTexture = lite ? null : track(createSurfaceTexture())
  /**
   * 素材に、濡れたときのつや・夜の明かり・表面の模様を足す。
   * kind = "part" は部品ごとの模様、数字は全体をその模様に、"none" は模様なし（絵を貼ってある素材）。
   * 模様は形の向きに合わせて 3 方向から貼り、でこぼこにも見せる。
   * ground = 地面に近いところを少し暗くして、置いてある感じを出す
   */
  const surfaced = <T extends Solid>(
    material: T,
    look: {
      kind?: number | "part" | "none"
      ground?: boolean
      gain?: number
      scale?: number
    },
  ): T => {
    if (!surfaceTexture) return material
    const { kind = "part", ground = false, gain = 1, scale = 1 } = look
    const byPart = kind === "part"
    const textured = kind !== "none"
    material.customProgramCacheKey = () =>
      `surf:${kind}:${ground}:${gain}:${scale}`
    material.onBeforeCompile = (shader) => {
      shader.uniforms.surfMap = { value: surfaceTexture }
      shader.uniforms.uWet = wetUniform
      shader.uniforms.uGlow = glowUniform
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
${byPart ? "attribute float surf;\nattribute float glow;" : ""}
varying vec3 vSurfPos;
varying vec3 vSurfNormal;
varying float vSurf;
varying float vGlow;`,
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
vSurfPos = position * vec3( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ), length( modelMatrix[ 2 ].xyz ) );
vSurfNormal = normal;
vSurf = ${byPart ? "surf" : textured ? (kind as number).toFixed(1) : "0.0"};
vGlow = ${byPart ? "glow" : "0.0"};`,
        )
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
uniform sampler2D surfMap;
uniform float uWet;
uniform float uGlow;
varying vec3 vSurfPos;
varying vec3 vSurfNormal;
varying float vSurf;
varying float vGlow;
float surfHeight = 0.0;
float surfRough = -1.0;`,
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
${
  textured
    ? `{
  vec3 sw = abs( vSurfNormal );
  sw = sw * sw * sw * sw;
  sw /= sw.x + sw.y + sw.z;
  float sid = floor( vSurf + 0.5 );
  // 木目・石・葉・ぬり壁で、模様の大きさ・濃さ・でこぼこの深さ・つやを変える
  vec4 look = sid < 0.5 ? vec4( 1.1, 0.5, 0.03, 0.74 ) : sid < 1.5 ? vec4( 0.55, 0.5, 0.05, 0.9 ) : sid < 2.5 ? vec4( 0.75, 0.55, 0.06, 0.8 ) : vec4( 0.4, 0.3, 0.012, 0.62 );
  vec3 sp = vSurfPos * look.x * ${scale.toFixed(3)};
  vec4 st = texture2D( surfMap, sp.zy ) * sw.x + texture2D( surfMap, sp.xz ) * sw.y + texture2D( surfMap, sp.xy ) * sw.z;
  float sh = sid < 0.5 ? st.r : sid < 1.5 ? st.g : sid < 2.5 ? st.b : st.a;
  diffuseColor.rgb *= 1.0 + ( sh - 0.5 ) * 2.0 * look.y * ${gain.toFixed(3)};
  surfHeight = sh * look.z * ${gain.toFixed(3)};
  surfRough = clamp( look.w + ( 0.5 - sh ) * 0.25, 0.2, 1.0 );
  ${ground ? "diffuseColor.rgb *= mix( 0.66, 1.0, smoothstep( 0.0, 0.6, vSurfPos.y ) );" : ""}
}`
    : ""
}
// 濡れると、色が濃くなる
diffuseColor.rgb *= mix( 1.0, 0.7, uWet );`,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>
if ( surfRough > 0.0 ) roughnessFactor = surfRough;
// 濡れると、つやが出る
roughnessFactor *= mix( 1.0, 0.4, uWet );`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
totalEmissiveRadiance += diffuseColor.rgb * vGlow * uGlow;`,
        )
      if (!textured) return
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
{
  vec3 sx = dFdx( - vViewPosition );
  vec3 sy = dFdy( - vViewPosition );
  vec2 dh = vec2( dFdx( surfHeight ) / max( length( sx ), 0.00001 ), dFdy( surfHeight ) / max( length( sy ), 0.00001 ) );
  sx = normalize( sx );
  sy = normalize( sy );
  vec3 r1 = cross( sy, normal );
  vec3 r2 = cross( normal, sx );
  float det = dot( sx, r1 ) * faceDirection;
  normal = normalize( abs( det ) * normal - sign( det ) * ( dh.x * r1 + dh.y * r2 ) );
}`,
      )
    }
    return material
  }

  /** 道ばたのもの */
  const toonVertex = surfaced(solid({ vertexColors: true }), { ground: true })
  /** 額ぶち（地面から離れているので、足もとの暗さは付けない） */
  const toonVertexFrame = surfaced(solid({ vertexColors: true }), {})
  /** 空に浮かぶ額ぶち用（遠くても、かすみで白っぽくしない） */
  const toonVertexClear = surfaced(solid({ vertexColors: true, fog: false }), {
    scale: 0.4,
  })
  /** 絵を貼った素材（地面や立て札） */
  const toonMap = (map: Texture, roughness = 0.85) =>
    surfaced(solid({ map, color: 0xffffff }, roughness), { kind: "none" })
  const cast = <T extends Mesh>(mesh: T): T => {
    mesh.castShadow = shadows
    return mesh
  }

  // ---- ステージの形（使うときに初めて組み立てる） ------------------------------
  const builtProps: (ThemeProps | undefined)[] = []
  const propsOf = (index: number): ThemeProps => {
    let props = builtProps[index]
    if (!props) {
      glowing = GLOW[index] ?? null
      props = THEMES[index].build()
      glowing = null
      for (const kind of ["tall", "mid", "small", "feature", "far"] as const) {
        for (const geometry of props[kind]) track(geometry)
      }
      track(props.lamp)
      builtProps[index] = props
    }
    return props
  }

  // ---- 空 ---------------------------------------------------------------------
  const skyGeometry = track(new PlaneGeometry(520, 190, 1, 2))
  skyGeometry.setAttribute(
    "color",
    new BufferAttribute(new Float32Array(6 * 3), 3),
  )
  const sky = new Mesh(
    skyGeometry,
    track(
      new MeshBasicMaterial({
        vertexColors: true,
        depthWrite: false,
        fog: false,
      }),
    ),
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
  const sunMaterial = track(
    new MeshBasicMaterial({ color: 0xffffff, fog: false }),
  )
  const sunGlowMaterial = track(
    new MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0.7,
      fog: false,
    }),
  )
  const sunDisc = new Group()
  sunDisc.add(new Mesh(track(new CircleGeometry(3.4, 40)), sunMaterial))
  const sunGlow = new Mesh(track(new PlaneGeometry(26, 26)), sunGlowMaterial)
  sunGlow.position.z = -0.1
  sunDisc.add(sunGlow)
  // 空いっぱいに広がる、うすい光のにじみ
  const haloMaterial = track(
    new MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0.2,
      fog: false,
    }),
  )
  const halo = new Mesh(track(new PlaneGeometry(96, 96)), haloMaterial)
  halo.position.z = -0.2
  sunDisc.add(halo)
  scene.add(sunDisc)
  farScenery.push(sunDisc)

  // 星
  const starCount = lite ? 110 : 220
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
      fog: false,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  )
  const starPoints = new Points(starGeometry, starMaterial)
  scene.add(starPoints)
  farScenery.push(starPoints)

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
  // 山はだ: 尾根と谷の明暗。ふもとは空気でかすんで明るい
  const ridgeTexture = track(
    canvasTexture(FIELD, FIELD, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, FIELD)
      g.addColorStop(0, "#d2d2d2")
      g.addColorStop(0.55, "#e6e6e6")
      g.addColorStop(1, "#ffffff")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, FIELD, FIELD)
      shade(ctx, fbm(9, 3, 4, 111), 0.34)
      shade(ctx, fbm(3, 2, 3, 113), 0.2)
    }),
  )
  ridgeTexture.wrapS = RepeatWrapping
  // 山の形は幅 150・高さ 0〜40 くらいで作ってある
  ridgeTexture.repeat.set(4 / 150, 1 / 42)
  const farMaterial = track(
    new MeshBasicMaterial({ color: 0xa9cdf5, fog: false, map: ridgeTexture }),
  )
  const nearMaterial = track(
    new MeshBasicMaterial({ color: 0x86b7ec, fog: false, map: ridgeTexture }),
  )
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
      farScenery.push(mesh)
    }
  }

  // ---- 雲 ---------------------------------------------------------------------
  // 雲は日の当たる側が明るく、下が少し暗い
  const cloudMaterial = solid(
    { color: 0xffffff, transparent: true, fog: false },
    1,
  )
  const cloudGeometry = track(
    join(
      (
        [
          [0, 0, 1],
          [1.0, 0.1, 0.78],
          [-1.0, 0.0, 0.72],
          [0.35, 0.5, 0.74],
          [-0.45, 0.4, 0.6],
          [1.8, -0.1, 0.5],
          [-1.8, -0.12, 0.46],
        ] as const
      ).map(([x, y, s]) =>
        ball(0xffffff, [x, y, 0], [s, s * 0.7, s * 0.6], lite ? 10 : 16),
      ),
    ),
  )
  const cloudCount = lite ? 5 : 9
  const cloudGap = 144 / cloudCount
  for (let i = 0; i < cloudCount; i++) {
    const cloud = new Mesh(cloudGeometry, cloudMaterial)
    const depth = -30 - random() * 22
    cloud.position.set(
      -40 + i * cloudGap + random() * 6,
      9 + random() * 13,
      depth,
    )
    cloud.scale.setScalar(1.8 + random() * 2.2)
    scroll(cloud, 0.03 + random() * 0.03, 144, -70)
    farScenery.push(cloud)
  }

  // ---- 額ぶちと絵（今日の作品が読めるまでは、こちらで描いた絵を飾る） ----------
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
  let arts: Art[] = paintings.map((draw) => ({
    material: track(
      new MeshBasicMaterial({
        map: track(canvasTexture(160, 128, draw)),
        fog: false,
      }),
    ),
    shape: 0,
  }))
  let nextArt = 0

  // 金のふち・内側の細いふち・角のかざり・裏板
  const frameGeometries = FRAME_SIZES.map(([w, h]) =>
    track(
      join([
        box(0xf2c14e, [w + 0.12, 0.12, 0.1], [0, h / 2, 0]),
        box(0xf2c14e, [w + 0.12, 0.12, 0.1], [0, -h / 2, 0]),
        box(0xf2c14e, [0.12, h - 0.12, 0.1], [-w / 2, 0, 0]),
        box(0xf2c14e, [0.12, h - 0.12, 0.1], [w / 2, 0, 0]),
        box(0xfff0b8, [w - 0.1, 0.035, 0.13], [0, h / 2 - 0.075, 0]),
        box(0xfff0b8, [w - 0.1, 0.035, 0.13], [0, -h / 2 + 0.075, 0]),
        box(0xfff0b8, [0.035, h - 0.14, 0.13], [-w / 2 + 0.075, 0, 0]),
        box(0xfff0b8, [0.035, h - 0.14, 0.13], [w / 2 - 0.075, 0, 0]),
        ...(
          [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ] as const
        ).map(([sx, sy]) =>
          ball(0xffd84a, [(sx * w) / 2, (sy * h) / 2, 0.04], 0.085, 8),
        ),
        ball(0xffd84a, [0, h / 2 + 0.07, 0.02], [0.14, 0.08, 0.06], 8),
        box(0x8a6a50, [w, h, 0.03], [0, 0, -0.04]),
      ]),
    ),
  )
  const paintingGeometry = track(new PlaneGeometry(1, 1))
  const framedList: Framed[] = []
  const setArt = (framed: Framed, art: Art) => {
    const [w, h] = FRAME_SIZES[art.shape]
    framed.frame.geometry = frameGeometries[art.shape]
    framed.painting.material = art.material
    framed.painting.scale.set(w - 0.12, h - 0.12, 1)
    framed.plate.visible = art.plate !== undefined
    if (art.plate) {
      framed.plate.material = art.plate
      framed.plate.position.y = -h / 2 - 0.25
    }
  }
  const hangNext = (framed: Framed) => {
    const art = arts[nextArt % arts.length]
    setArt(framed, art)
    nextArt += 1
    if (art.id) options.onArtworkShown?.(art.id)
  }
  const plateGeometry = track(new PlaneGeometry(1.5, 0.273))
  /** 作者の名前の札（額ぶちの下に付ける） */
  const makePlate = (author: string) =>
    track(
      new MeshBasicMaterial({
        map: track(
          canvasTexture(264, 48, (ctx) => {
            ctx.font = "800 26px system-ui, sans-serif"
            let name = author
            while (name.length > 1 && ctx.measureText(name).width > 220) {
              name = `${name.slice(0, -2)}…`
            }
            const width = Math.min(260, ctx.measureText(name).width + 36)
            ctx.fillStyle = "rgba(20,26,60,0.86)"
            ctx.beginPath()
            ctx.roundRect((264 - width) / 2, 2, width, 44, 22)
            ctx.fill()
            ctx.fillStyle = "#ffffff"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(name, 132, 26)
          }),
        ),
        transparent: true,
        fog: false,
      }),
    )
  const makeFramed = (): Framed => {
    const group = new Group()
    const frame = cast(new Mesh(frameGeometries[0], toonVertexFrame))
    const painting = new Mesh(paintingGeometry, arts[0].material)
    painting.position.z = 0.012
    const plate = new Mesh(plateGeometry, arts[0].material)
    plate.position.z = 0.03
    plate.visible = false
    group.add(frame, painting, plate)
    const framed = { group, frame, painting, plate }
    hangNext(framed)
    framedList.push(framed)
    return framed
  }

  // 空に浮かぶ大きな額ぶち
  const floaters: { object: Object3D; base: number; phase: number }[] = []
  const floaterCount = lite ? 3 : 5
  const floaterGap = 95 / floaterCount
  for (let i = 0; i < floaterCount; i++) {
    const framed = makeFramed()
    framed.frame.castShadow = false
    framed.frame.material = toonVertexClear
    // 背景画より手前に浮かべる
    const size = 1.5 + random() * 1.2
    framed.group.scale.setScalar(size)
    framed.group.rotation.set(0, 0.25 - random() * 0.5, (random() - 0.5) * 0.3)
    const base = 4.5 + random() * 2.2
    framed.group.position.set(
      -20 + i * floaterGap + random() * 6,
      base,
      -5.5 - random() * 3,
    )
    scroll(framed.group, 0.5, 95, -45, () => hangNext(framed))
    floaters.push({ object: framed.group, base, phase: random() * 6 })
  }

  // ---- 丘 ---------------------------------------------------------------------
  const hillGeometry = track(
    lite ? new SphereGeometry(1, 20, 10) : new SphereGeometry(1, 40, 20),
  )
  const hillMaterials = [0, 1].map(() =>
    surfaced(solid({ color: 0xffffff }, 0.95), {
      kind: LEAF,
      gain: 0.5,
      scale: 0.5,
    }),
  )
  for (let i = 0; i < 10; i++) {
    const hill = new Mesh(hillGeometry, hillMaterials[i % 2])
    const size = 3.2 + random() * 3.4
    // 手前の木が丘にうまらないよう、奥行きはうすくする
    hill.scale.set(size * (1.5 + random() * 0.6), size, size * 0.45)
    hill.position.set(-24 + i * 8.5, -1.5, -13 - random() * 5)
    hill.receiveShadow = shadows
    scroll(hill, 1, 10 * 8.5, -32)
    farScenery.push(hill)
  }

  // ---- 道・地面・崖・水面（模様は白黒で描いて、ステージの色を掛ける） ----------
  const mottle = fbm(4, 4, 4, 81)
  const speckle = fbm(28, 28, 3, 83)
  /** でこぼこに見せる（軽量モードでは使わない） */
  const bumpy = <T extends Solid>(material: T, depth: number): T => {
    if (lite) return material
    material.bumpMap = material.map
    material.bumpScale = depth
    return material
  }
  // 石だたみ: 石ごとに色がちがい、目地はくぼんで暗い。欠けやひびも入れる
  const pathTexture = track(
    canvasTexture(512, 512, (ctx) => {
      ctx.fillStyle = "#8f8f8f"
      ctx.fillRect(0, 0, 512, 512)
      const stone = (
        x: number,
        y: number,
        w: number,
        h: number,
        seed: number,
      ) => {
        const r = createRandom(seed)
        const tone = 212 + Math.floor(r() * 40)
        const radius = 9 + r() * 9
        // 目地に落ちる影
        ctx.fillStyle = "rgba(60,60,60,0.5)"
        ctx.beginPath()
        ctx.roundRect(x + 5, y + 6, w - 7, h - 7, radius)
        ctx.fill()
        ctx.fillStyle = `rgb(${tone},${tone},${tone})`
        ctx.beginPath()
        ctx.roundRect(x + 4, y + 4, w - 9, h - 9, radius)
        ctx.fill()
        // 上のふちは明るく
        ctx.strokeStyle = "rgba(255,255,255,0.55)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(x + 6, y + 6, w - 13, h - 13, radius)
        ctx.stroke()
        if (r() < 0.35) {
          // ひび
          ctx.strokeStyle = "rgba(70,70,70,0.55)"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          let cx = x + 14 + r() * (w - 28)
          let cy = y + 8
          ctx.moveTo(cx, cy)
          while (cy < y + h - 14) {
            cx = Math.min(x + w - 12, Math.max(x + 10, cx + (r() - 0.5) * 16))
            cy += 6 + r() * 10
            ctx.lineTo(cx, cy)
          }
          ctx.stroke()
        }
      }
      for (let row = 0; row < 4; row++) {
        // 段ごとに石の幅を変える（左右でつながるよう、はみ出す石は反対側にも描く）
        const widths =
          row % 2 === 0 ? [150, 106, 128, 128] : [118, 140, 96, 158]
        let x = row % 2 === 0 ? 0 : -60
        for (const [index, w] of widths.entries()) {
          const seed = 31 + row * 10 + index
          stone(x, row * 128, w, 128, seed)
          if (x < 0) stone(x + 512, row * 128, w, 128, seed)
          x += w
        }
      }
      shade(ctx, mottle, 0.16, 2)
      shade(ctx, speckle, 0.14, 2)
    }),
  )
  pathTexture.wrapS = RepeatWrapping
  pathTexture.wrapT = RepeatWrapping
  const PATH_TILE = 2.4
  pathTexture.repeat.set(90 / PATH_TILE, 1)
  const pathMaterial = bumpy(toonMap(pathTexture), 1.2)
  const path = new Mesh(track(new PlaneGeometry(90, 2.4)), pathMaterial)
  path.rotation.x = -Math.PI / 2
  path.position.set(14, 0.004, 0)
  path.receiveShadow = shadows
  scene.add(path)

  const curbGeometry = track(new BoxGeometry(90, 0.1, 0.16))
  const curbMaterial = surfaced(solid({ color: 0xffffff }), { kind: STONE })
  for (const z of [-1.28, 1.28]) {
    const curb = new Mesh(curbGeometry, curbMaterial)
    curb.position.set(14, 0.02, z)
    curb.receiveShadow = shadows
    scene.add(curb)
  }

  // 地面: 色むら・小石・短い草や砂のすじ（草原でも砂でも雪でも使えるよう、白黒で描く）
  const groundTexture = track(
    canvasTexture(512, 512, (ctx) => {
      ctx.fillStyle = "#e2e2e2"
      ctx.fillRect(0, 0, 512, 512)
      const r = createRandom(5)
      ctx.lineCap = "round"
      for (let i = 0; i < 3600; i++) {
        const x = r() * 512
        const y = r() * 512
        const length = 4 + r() * 9
        const lean = (r() - 0.5) * 5
        ctx.strokeStyle =
          i % 3 === 0 ? "rgba(255,255,255,0.6)" : "rgba(95,95,95,0.42)"
        ctx.lineWidth = 1 + r() * 1.2
        // はしをまたぐ分は、反対側にも描く
        for (const dx of [0, -512, 512]) {
          for (const dy of [0, 512]) {
            ctx.beginPath()
            ctx.moveTo(x + dx, y + dy)
            ctx.lineTo(x + dx + lean, y + dy - length)
            ctx.stroke()
          }
        }
      }
      for (let i = 0; i < 90; i++) {
        const x = 8 + r() * 496
        const y = 8 + r() * 496
        const size = 1.5 + r() * 3
        ctx.fillStyle = "rgba(90,90,90,0.4)"
        ctx.beginPath()
        ctx.ellipse(x + 1, y + 1.5, size, size * 0.7, r() * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "rgba(250,250,250,0.9)"
        ctx.beginPath()
        ctx.ellipse(x, y, size, size * 0.7, r() * 3, 0, Math.PI * 2)
        ctx.fill()
      }
      shade(ctx, mottle, 0.42)
      shade(ctx, speckle, 0.16, 2)
    }),
  )
  groundTexture.wrapS = RepeatWrapping
  groundTexture.wrapT = RepeatWrapping
  const GROUND_TILE = 4
  const groundMaterial = bumpy(toonMap(groundTexture), 0.9)
  groundTexture.repeat.set(90 / GROUND_TILE, 12.5)
  const backGround: Mesh = new Mesh(
    track(new PlaneGeometry(90, 50)),
    groundMaterial,
  )
  backGround.rotation.x = -Math.PI / 2
  backGround.position.set(14, 0, -26.3)
  backGround.receiveShadow = shadows
  scene.add(backGround)
  const frontGroundGeometry = track(new PlaneGeometry(90, 1.3))
  // 手前の細い地面は、模様がつぶれないように貼る範囲を狭める
  const frontUv = frontGroundGeometry.getAttribute("uv") as BufferAttribute
  for (let i = 0; i < frontUv.count; i++) {
    frontUv.setY(i, (frontUv.getY(i) * 1.3) / 50)
  }
  const frontGround = new Mesh(frontGroundGeometry, groundMaterial)
  frontGround.rotation.x = -Math.PI / 2
  frontGround.position.set(14, 0, 1.95)
  frontGround.receiveShadow = shadows
  scene.add(frontGround)

  // 崖: 横に重なる地層と、たてのひび
  const cliffTexture = track(
    canvasTexture(512, 512, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 512)
      g.addColorStop(0, "#f4f4f4")
      g.addColorStop(0.5, "#cfcfcf")
      g.addColorStop(1, "#8e8e8e")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 512, 512)
      const r = createRandom(17)
      // 地層（左右でつながるよう、波は画像の幅でちょうど一回りさせる）
      for (let i = 0; i < 15; i++) {
        const y = 40 + i * 32 + r() * 14
        const a = 3 + r() * 6
        const k = 1 + Math.floor(r() * 3)
        const phase = r() * 6
        const thick = 6 + r() * 16
        ctx.fillStyle =
          i % 2 === 0 ? "rgba(0,0,0,0.13)" : "rgba(255,255,255,0.2)"
        ctx.beginPath()
        for (let x = 0; x <= 512; x += 8) {
          ctx.lineTo(x, y + Math.sin((x / 512) * Math.PI * 2 * k + phase) * a)
        }
        for (let x = 512; x >= 0; x -= 8) {
          ctx.lineTo(
            x,
            y + thick + Math.sin((x / 512) * Math.PI * 2 * k + phase + 1) * a,
          )
        }
        ctx.fill()
      }
      ctx.lineCap = "round"
      for (let i = 0; i < 26; i++) {
        let x = 12 + r() * 488
        let y = 30 + r() * 380
        ctx.strokeStyle = "rgba(40,40,40,0.4)"
        ctx.lineWidth = 1 + r() * 1.6
        ctx.beginPath()
        ctx.moveTo(x, y)
        const steps = 3 + Math.floor(r() * 5)
        for (let n = 0; n < steps; n++) {
          x = Math.min(506, Math.max(6, x + (r() - 0.5) * 18))
          y += 8 + r() * 16
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      shade(ctx, mottle, 0.3)
      shade(ctx, speckle, 0.2, 2)
    }),
  )
  cliffTexture.wrapS = RepeatWrapping
  const CLIFF_TILE = 3.2
  cliffTexture.repeat.set(90 / CLIFF_TILE, 1)
  const cliffMaterial = bumpy(toonMap(cliffTexture), 1.6)
  const cliff = new Mesh(track(new PlaneGeometry(90, 3.2)), cliffMaterial)
  cliff.position.set(14, -1.6, 2.6)
  scene.add(cliff)

  // 崖の上のふちから垂れる地面
  const edgeTexture = track(
    canvasTexture(256, 64, (ctx) => {
      // ふぞろいに垂れる草や土
      const r = createRandom(29)
      ctx.fillStyle = "#e2e2e2"
      ctx.fillRect(0, 0, 256, 12)
      for (let i = 0; i < 70; i++) {
        const x = r() * 256
        const width = 3 + r() * 9
        const length = 8 + r() * r() * 44
        const tone = 200 + Math.floor(r() * 55)
        ctx.fillStyle = `rgb(${tone},${tone},${tone})`
        for (const dx of [0, -256, 256]) {
          ctx.beginPath()
          ctx.moveTo(x + dx - width / 2, 10)
          ctx.quadraticCurveTo(
            x + dx + (r() - 0.5) * 2,
            10 + length * 1.1,
            x + dx + width / 2,
            10,
          )
          ctx.fill()
        }
      }
    }),
  )
  edgeTexture.wrapS = RepeatWrapping
  edgeTexture.repeat.set(90 / CLIFF_TILE, 1)
  const edgeMaterial = surfaced(
    solid({ map: edgeTexture, color: 0xffffff, alphaTest: 0.5 }),
    { kind: "none" },
  )
  const edge = new Mesh(track(new PlaneGeometry(90, 0.8)), edgeMaterial)
  edge.position.set(14, -0.4, 2.61)
  scene.add(edge)

  // 水面: ゆれる光のあみ目
  const waterTexture = track(
    canvasTexture(FIELD, FIELD, (ctx) => {
      const a = fbm(4, 4, 3, 91)
      const b = fbm(6, 6, 3, 97)
      const image = ctx.createImageData(FIELD, FIELD)
      for (let i = 0; i < FIELD * FIELD; i++) {
        const net =
          (1 - Math.abs(a[i] - 0.5) * 2) * (1 - Math.abs(b[i] - 0.5) * 2)
        const value = 196 + (a[i] - 0.5) * 50 + clamp01(net * 1.25) ** 10 * 110
        image.data[i * 4] = value
        image.data[i * 4 + 1] = value
        image.data[i * 4 + 2] = value
        image.data[i * 4 + 3] = 255
      }
      ctx.putImageData(image, 0, 0)
    }),
  )
  waterTexture.wrapS = RepeatWrapping
  waterTexture.wrapT = RepeatWrapping
  waterTexture.repeat.set(14, 6)
  // 水面は空を映す
  const waterMaterial = bumpy(toonMap(waterTexture, 0.14), 0.6)
  const water = new Mesh(track(new PlaneGeometry(160, 70)), waterMaterial)
  water.rotation.x = -Math.PI / 2
  water.position.set(14, -3.2, 37.4)
  scene.add(water)

  // ---- 空の光（ものに映る空。ステージの色が変わるたびに焼き直す） ----------------
  const skyLight = {
    top: { value: new Color() },
    mid: { value: new Color() },
    low: { value: new Color() },
    ground: { value: new Color() },
    sunColor: { value: new Color() },
    sunDir: { value: new Vector3(0, 1, 0) },
  }
  const pmrem = lite ? null : new PMREMGenerator(renderer)
  const skyScene = new Scene()
  skyScene.add(
    new Mesh(
      track(new SphereGeometry(20, 24, 12)),
      track(
        new ShaderMaterial({
          side: BackSide,
          uniforms: skyLight,
          vertexShader: `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
          fragmentShader: `
uniform vec3 top;
uniform vec3 mid;
uniform vec3 low;
uniform vec3 ground;
uniform vec3 sunColor;
uniform vec3 sunDir;
varying vec3 vDir;
void main() {
  vec3 dir = normalize( vDir );
  vec3 color = mix( low, mid, smoothstep( 0.0, 0.3, dir.y ) );
  color = mix( color, top, smoothstep( 0.3, 1.0, dir.y ) );
  color = mix( color, ground * 0.6, smoothstep( 0.0, -0.25, dir.y ) );
  float facing = max( dot( dir, sunDir ), 0.0 );
  color += sunColor * ( pow( facing, 180.0 ) * 9.0 + pow( facing, 8.0 ) * 0.35 );
  gl_FragColor = vec4( color, 1.0 );
}`,
        }),
      ),
    ),
  )
  let skyBaked: { texture: Texture; dispose: () => void } | null = null
  let skyKey = ""
  const bakeSky = (key: string) => {
    if (!pmrem || key === skyKey) return
    skyKey = key
    const next = pmrem.fromScene(skyScene, 0, 0.1, 50)
    scene.environment = next.texture
    skyBaked?.dispose()
    skyBaked = next
  }
  track({
    dispose: () => {
      skyBaked?.dispose()
      pmrem?.dispose()
    },
  })
  scene.environmentIntensity = 0.8
  const sunDirection = new Vector3()

  // ---- 雨と、濡れた路面の映り込み ----------------------------------------------
  let rainLevel = 0
  /** 走って流れた道の長さ（水たまりを道といっしょに流す） */
  let shifted = 0
  let reflections = !lite
  let puddles: Reflector | null = null
  let rainMaterial: ShaderMaterial | null = null
  if (!lite) {
    // 赤 = 水たまりのできる場所、緑と青 = 水面のゆらぎ
    const pools = fbm(3, 3, 3, 101)
    const waveA = fbm(18, 18, 2, 103)
    const waveB = fbm(18, 18, 2, 107)
    const maskData = new Uint8Array(FIELD * FIELD * 4)
    for (let i = 0; i < FIELD * FIELD; i++) {
      maskData[i * 4] = pools[i] * 255
      maskData[i * 4 + 1] = waveA[i] * 255
      maskData[i * 4 + 2] = waveB[i] * 255
      maskData[i * 4 + 3] = 255
    }
    const maskTexture = track(new DataTexture(maskData, FIELD, FIELD))
    maskTexture.wrapS = RepeatWrapping
    maskTexture.wrapT = RepeatWrapping
    maskTexture.magFilter = LinearFilter
    maskTexture.minFilter = LinearFilter
    maskTexture.needsUpdate = true

    // 道と手前・奥の地面にうすく重ねて、景色を鏡のように映す
    puddles = new Reflector(track(new PlaneGeometry(90, 9)), {
      textureWidth: 960,
      textureHeight: 540,
      clipBias: 0.003,
      multisample: 0,
      shader: {
        name: "PictorRunPuddles",
        uniforms: {
          color: { value: null },
          tDiffuse: { value: null },
          textureMatrix: { value: null },
          tMask: { value: null },
          uWet: { value: 0 },
          uRain: { value: 0 },
          uTime: { value: 0 },
          uShift: { value: 0 },
        },
        vertexShader: `
uniform mat4 textureMatrix;
varying vec4 vMirror;
varying vec3 vWorld;
void main() {
  vMirror = textureMatrix * vec4( position, 1.0 );
  vec4 world = modelMatrix * vec4( position, 1.0 );
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,
        fragmentShader: `
uniform sampler2D tDiffuse;
uniform sampler2D tMask;
uniform float uWet;
uniform float uRain;
uniform float uTime;
uniform float uShift;
varying vec4 vMirror;
varying vec3 vWorld;
void main() {
  vec2 p = vec2( vWorld.x + uShift, vWorld.z );
  float onPath = 1.0 - smoothstep( 1.15, 1.3, abs( vWorld.z ) );
  float puddle = smoothstep( 0.6 - uWet * 0.2, 0.74 - uWet * 0.2, texture2D( tMask, p * 0.11 ).r ) * mix( 0.55, 1.0, onPath );
  vec2 wobble = texture2D( tMask, p * 0.22 + vec2( uTime * 0.02, uTime * 0.012 ) ).gb - 0.5;
  // 雨つぶの波紋
  vec2 grid = p * 2.6;
  vec2 cell = floor( grid );
  vec2 local = fract( grid ) - 0.5;
  float seed = fract( sin( dot( cell, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
  float phase = fract( uTime * ( 0.9 + seed * 0.6 ) + seed * 7.0 );
  float ring = smoothstep( 0.05, 0.0, abs( length( local ) - phase * 0.42 ) ) * ( 1.0 - phase ) * uRain;
  vec2 bend = wobble * ( 0.008 + 0.014 * ( 1.0 - puddle ) ) + normalize( local + 0.0001 ) * ring * 0.04;
  vec3 view = normalize( cameraPosition - vWorld );
  // 浅い角度で見るほど、よく映る
  float fresnel = mix( 0.3, 1.0, pow( 1.0 - clamp( view.y, 0.0, 1.0 ), 3.0 ) );
  vec4 uv = vMirror;
  uv.xy += bend * uv.w;
  vec3 mirror = texture2DProj( tDiffuse, uv ).rgb;
  float alpha = uWet * fresnel * mix( mix( 0.06, 0.42, onPath ), 0.92, puddle );
  gl_FragColor = vec4( mirror + ring * 0.12, alpha );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,
      },
    })
    const puddleMaterial = puddles.material as ShaderMaterial
    puddleMaterial.uniforms.tMask.value = maskTexture
    puddleMaterial.transparent = true
    puddleMaterial.depthWrite = false
    track(puddleMaterial)
    track(puddles.getRenderTarget())
    puddles.rotation.x = -Math.PI / 2
    puddles.position.set(14, 0.012, -1.9)
    puddles.visible = false
    scene.add(puddles)

    // 雨すじ（位置は画面を描くときに計算するので、数が多くても軽い）
    const streaks = 900
    const rainPositions = new Float32Array(streaks * 6)
    const rainEnds = new Float32Array(streaks * 2)
    const rainSeeds = new Float32Array(streaks * 2)
    for (let i = 0; i < streaks; i++) {
      const x = -12 + random() * 42
      const y = random() * 13
      const z = -9 + random() * 16
      const seed = random()
      for (let end = 0; end < 2; end++) {
        rainPositions.set([x, y, z], (i * 2 + end) * 3)
        rainEnds[i * 2 + end] = end
        rainSeeds[i * 2 + end] = seed
      }
    }
    const rainGeometry = track(new BufferGeometry())
    rainGeometry.setAttribute("position", new BufferAttribute(rainPositions, 3))
    rainGeometry.setAttribute("aEnd", new BufferAttribute(rainEnds, 1))
    rainGeometry.setAttribute("aSeed", new BufferAttribute(rainSeeds, 1))
    rainMaterial = track(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uRain: { value: 0 } },
        vertexShader: `
attribute float aEnd;
attribute float aSeed;
uniform float uTime;
uniform float uRain;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.y = mod( position.y - uTime * ( 15.0 + aSeed * 9.0 ), 13.0 );
  p.y += ( 0.35 + aSeed * 0.4 ) * aEnd;
  // 風で少しななめに降る
  p.x += ( p.y - 6.0 ) * 0.2;
  // 弱い雨では、すじの数を減らす
  vAlpha = step( aSeed, uRain ) * ( 0.25 + aSeed * 0.3 ) * ( 0.4 + 0.6 * aEnd );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
}`,
        fragmentShader: `
varying float vAlpha;
void main() {
  gl_FragColor = vec4( 0.82, 0.88, 1.0, vAlpha );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,
      }),
    )
    const rain = new LineSegments(rainGeometry, rainMaterial)
    rain.frustumCulled = false
    rain.renderOrder = 5
    scene.add(rain)
  }

  // ---- 描き込んだ背景画（ステージごとに 1 枚。奥でゆっくり流し、手前の道やものは立体のまま重ねる） ----
  const BACKDROP_Z = -9.2
  /** 絵の下のはし。絵の手前の暗い地面は地面の下に沈めて、明るい地面のところで立体の地面とつなぐ */
  const BACKDROP_BOTTOM = -1.7
  const BACKDROP_WIDTH = 76
  /** 道が流れる速さに対する、背景画の流れる速さ */
  const BACKDROP_SPEED = 0.22
  type Backdrop = {
    state: "none" | "loading" | "ready" | "failed"
    texture: Texture | null
    /** 絵のいちばん下（地面）の色。立体の地面をこの色にして、絵とつなげる */
    ground: Color | null
  }
  const backdrops: Backdrop[] = THEMES.map(() => ({
    state: "none",
    texture: null,
    ground: null,
  }))
  const backdropLoader = new TextureLoader()
  const loadBackdrop = (index: number) => {
    const item = backdrops[index]
    if (item.state !== "none") return
    item.state = "loading"
    const name = toPictorRunStageFile(PICTOR_RUN_STAGES[index])
    backdropLoader.load(
      `/images/pictor-chan/run/bg/stage-${name}${lite ? "-s" : ""}.webp`,
      (texture) => {
        if (disposed || item.state !== "loading") {
          texture.dispose()
          return
        }
        texture.colorSpace = SRGBColorSpace
        texture.wrapS = MirroredRepeatWrapping
        // 絵の地面の色をならして、立体の地面の色にする
        const canvas = document.createElement("canvas")
        canvas.width = 32
        canvas.height = 16
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(texture.image as CanvasImageSource, 0, 0, 32, 16)
          // 立体の地面とつながる高さ（下から 2 割弱）の色を取る
          const data = ctx.getImageData(0, 13, 32, 1).data
          let r = 0
          let g = 0
          let b = 0
          for (let i = 0; i < 32; i++) {
            r += data[i * 4]
            g += data[i * 4 + 1]
            b += data[i * 4 + 2]
          }
          item.ground = new Color().setRGB(
            r / 32 / 255,
            g / 32 / 255,
            b / 32 / 255,
            SRGBColorSpace,
          )
        }
        item.texture = texture
        item.state = "ready"
        // 背の高い木や遠くの建物は、絵に任せる
        for (const slot of slots) hideForBackdrop(slot)
      },
      undefined,
      () => {
        // 読めなければ、これまでの立体だけの景色で遊べる
        item.state = "failed"
      },
    )
  }
  /** いまのステージと次のステージの絵だけを持つ */
  const keepBackdrops = (index: number, next: number) => {
    for (let i = 0; i < backdrops.length; i++) {
      const item = backdrops[i]
      if (i === index || i === next || item.state === "none") continue
      if (item.state === "failed") continue
      item.texture?.dispose()
      item.texture = null
      item.state = "none"
    }
  }
  track({
    dispose: () => {
      for (const item of backdrops) item.texture?.dispose()
    },
  })
  const backdropGeometry = track(new PlaneGeometry(1, 1))
  const backdropPlanes = [0, 1].map((order) => {
    const material = track(
      new MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        fog: false,
      }),
    )
    const mesh = new Mesh(backdropGeometry, material)
    mesh.renderOrder = -6 + order
    mesh.visible = false
    scene.add(mesh)
    return { mesh, material }
  })
  /** 絵のある地面（光の当たり方に左右されない色にして、絵の地面とつなげる） */
  const paintedGroundMaterial = track(
    new MeshBasicMaterial({ map: groundTexture, fog: false }),
  )
  const backdropView = new Vector3()
  let backdropScroll = 0
  /** 次のコマで、絵のまん中が画面のまん中に来るように合わせる（走り始め） */
  let backdropAlign = true
  /** いま、絵が景色をすっかりおおっている */
  let backdropCovers = false
  const updateBackdrop = (move: number, index: number, t: number) => {
    const next = (index + 1) % THEMES.length
    loadBackdrop(index)
    loadBackdrop(next)
    keepBackdrops(index, next)
    // 画面に見えている高さに合わせて、絵の大きさを決める（縦長の画面では空まで見せる）
    const depth = camera.position.z - BACKDROP_Z
    camera.getWorldDirection(backdropView)
    const reach = depth / Math.max(0.2, -backdropView.z)
    const top =
      camera.position.y +
      backdropView.y * reach +
      reach * Math.tan((camera.fov * Math.PI) / 360) * 1.06
    const visible = Math.max(6, top - BACKDROP_BOTTOM)
    const imageHeight = Math.max(visible, 9.8)
    const imageWidth = imageHeight * 2
    if (backdropAlign) {
      // 絵は左右を折り返してつないでいるので、つなぎ目が走り始めの画面に来ないようにする
      backdropAlign = false
      const center = camera.position.x + 1.2
      backdropScroll =
        (((0.5 - (center - (14 - BACKDROP_WIDTH / 2)) / imageWidth) % 2) + 2) %
        2
    }
    backdropScroll = (backdropScroll + (move * BACKDROP_SPEED) / imageWidth) % 2
    const a = backdrops[index]
    const b = backdrops[next]
    const order = [a, b]
    for (let i = 0; i < 2; i++) {
      const plane = backdropPlanes[i]
      const item = order[i]
      const shown = item.texture !== null && (i === 0 || t > 0.001)
      plane.mesh.visible = shown
      if (!shown || !item.texture) continue
      if (plane.material.map !== item.texture) {
        plane.material.map = item.texture
        plane.material.needsUpdate = true
      }
      item.texture.repeat.set(
        BACKDROP_WIDTH / imageWidth,
        visible / imageHeight,
      )
      item.texture.offset.set(backdropScroll, 0)
      plane.mesh.scale.set(BACKDROP_WIDTH, visible, 1)
      plane.mesh.position.set(14, BACKDROP_BOTTOM + visible / 2, BACKDROP_Z)
      // 次のステージの絵は、色が移るのに合わせて上から重ねていく
      plane.material.opacity = i === 0 ? (b.texture ? 1 : 1 - t) : t
      // すっかり見えている絵は、うしろのもの（太陽の光など）をかくす
      plane.material.depthWrite = plane.material.opacity >= 1
    }
    backdropCovers = a.texture !== null && (b.texture !== null || t <= 0.001)
    for (const object of farScenery) object.visible = !backdropCovers
    const painted = t < 0.5 ? a.texture !== null : b.texture !== null
    backGround.material = painted ? paintedGroundMaterial : groundMaterial
  }

  // ---- 道ばたのもの（ステージごとに形を入れ替える） ----------------------------
  /** いま置いていくものが、どのステージのものか */
  let propTheme = 0
  const slots: Slot[] = []
  /** 背景画のあるステージでは、背の高い木と遠くの建物を置かない（絵に描いてある） */
  const hideForBackdrop = (slot: Slot) => {
    if (slot.kind !== "tall" && slot.kind !== "far") return
    slot.mesh.visible = backdrops[slot.theme].state === "failed"
  }
  const dress = (slot: Slot) => {
    slot.theme = propTheme
    hideForBackdrop(slot)
    const list = propsOf(propTheme)[slot.kind]
    slot.mesh.geometry = list[Math.floor(random() * list.length) % list.length]
    if (slot.kind === "tall" || slot.kind === "mid") {
      slot.mesh.rotation.y = THEMES[propTheme].aligned
        ? (random() - 0.5) * 0.3
        : random() * 6
    }
  }
  const addSlot = (
    kind: PropKind,
    x: number,
    z: number,
    scale: number,
    span = SPAN,
    min = -20,
  ) => {
    const mesh = new Mesh(propsOf(0)[kind][0], toonVertex)
    if (kind !== "small" && kind !== "far") cast(mesh)
    mesh.position.set(x, 0, z)
    mesh.scale.setScalar(scale)
    const slot = { mesh, kind, theme: 0 }
    dress(slot)
    slots.push(slot)
    scroll(mesh, 1, span, min, () => dress(slot))
  }

  const tallCount = lite ? 12 : 22
  for (let i = 0; i < tallCount; i++) {
    addSlot(
      "tall",
      -18 + (i * SPAN) / tallCount + random() * 1.6,
      -3.0 - random() * 5.2,
      0.85 + random() * 0.7,
    )
  }
  const midCount = lite ? 8 : 18
  for (let i = 0; i < midCount; i++) {
    addSlot(
      "mid",
      -18 + (i * SPAN) / midCount + random() * 2,
      -1.9 - random() * 4,
      0.8 + random() * 0.8,
    )
  }
  const smallCount = lite ? 9 : 24
  for (let i = 0; i < smallCount; i++) {
    const front = i % 3 === 0
    addSlot(
      "small",
      -18 + (i * SPAN) / smallCount + random() * 1.5,
      front ? 1.75 + random() * 0.6 : -1.6 - random() * 2.6,
      front ? 0.45 + random() * 0.2 : 0.55 + random() * 0.4,
    )
  }
  // 道のすぐ奥に、ところどころ
  const featureCount = lite ? 4 : 6
  for (let i = 0; i < featureCount; i++) {
    addSlot("feature", -18 + (i * SPAN) / featureCount + 1.6, -1.62, 1)
  }
  // 遠くの大きな建物
  const farCount = lite ? 3 : 4
  for (let i = 0; i < farCount; i++) {
    addSlot(
      "far",
      // 最初の画面で、題名のうしろに大きな建物が来ないようにずらす
      -12 + (i * 84) / farCount + random() * 6,
      -9.2 - random() * 0.8,
      0.95 + random() * 0.3,
      84,
      -32,
    )
  }

  // 街灯（明かりは夜に近いステージほど強く光る）
  const lampGlowMaterial = track(
    new MeshBasicMaterial({
      map: glowTexture,
      color: 0xffe9a3,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0,
      fog: false,
    }),
  )
  const lampGlowGeometry = track(new PlaneGeometry(2.4, 2.4))
  const lampMeshes: Mesh[] = []
  const lampLights: PointLight[] = []
  const lampCount = lite ? 3 : 4
  for (let i = 0; i < lampCount; i++) {
    const lamp = new Group()
    const post = cast(new Mesh(propsOf(0).lamp, toonVertex))
    lampMeshes.push(post)
    lamp.add(post)
    const glow = new Mesh(lampGlowGeometry, lampGlowMaterial)
    glow.position.set(LAMP_BULB[0], LAMP_BULB[1], 0.1)
    lamp.add(glow)
    if (!lite) {
      // 夜は、まわりの地面やものを照らす
      const light = new PointLight(0xffe2a0, 0, 9, 2)
      light.position.set(LAMP_BULB[0], LAMP_BULB[1] - 0.15, 0.35)
      lamp.add(light)
      lampLights.push(light)
    }
    lamp.position.set(-14 + (i * SPAN) / lampCount, 0, -1.9)
    scroll(lamp, 1, SPAN, -20, () => {
      post.geometry = propsOf(propTheme).lamp
    })
  }

  // イーゼルに立てかけた絵
  const easelGeometry = track(
    join([
      box(0xb9855a, [0.05, 1.7, 0.05], [-0.36, 0.82, 0], [0, 0, -0.16]),
      box(0xb9855a, [0.05, 1.7, 0.05], [0.36, 0.82, 0], [0, 0, 0.16]),
      box(0xa57550, [0.05, 1.6, 0.05], [0, 0.76, -0.34], [0.36, 0, 0]),
      box(0xb9855a, [1.0, 0.06, 0.14], [0, 0.56, 0.06]),
      box(0xa57550, [0.5, 0.04, 0.04], [0, 1.2, -0.02]),
    ]),
  )
  const easelCount = lite ? 3 : 5
  for (let i = 0; i < easelCount; i++) {
    const easel = new Group()
    easel.add(cast(new Mesh(easelGeometry, toonVertex)))
    const framed = makeFramed()
    framed.group.scale.setScalar(0.72)
    framed.group.position.set(0, 1.06, 0.1)
    easel.add(framed.group)
    easel.position.set(
      -9 + (i * SPAN) / easelCount + random() * 3,
      0,
      -2.2 - random() * 0.8,
    )
    easel.rotation.y = 0.2 + random() * 0.4
    easel.rotation.x = -0.08
    easel.scale.setScalar(1.15)
    scroll(easel, 1, SPAN, -20, () => hangNext(framed))
  }

  // 立て札
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
      cyl(0xb9855a, 0.045, 0.055, 1.25, [0, 0.62, 0]),
      box(0xfff7e6, [1.06, 0.56, 0.05], [0, 1.3, 0]),
    ]),
  )
  const signBoardGeometry = track(new PlaneGeometry(1.0, 0.5))
  for (let i = 0; i < 3; i++) {
    const sign = new Group()
    sign.add(cast(new Mesh(signPoleGeometry, toonVertex)))
    const board = new Mesh(signBoardGeometry, signMaterials[i])
    board.position.set(0, 1.3, 0.03)
    sign.add(board)
    sign.position.set(-4 + i * 24, 0, -2.0)
    sign.rotation.y = 0.18
    scroll(sign, 1, SPAN)
  }

  // ---- 舞うもの（花びら・雪・ほたる・あわ…） ----------------------------------
  const particleCount = lite ? 0 : 70
  const particlePositions = new Float32Array(particleCount * 3)
  const particleSeeds: number[] = []
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = -8 + random() * 34
    particlePositions[i * 3 + 1] = random() * 7
    particlePositions[i * 3 + 2] = -5 + random() * 7.5
    particleSeeds.push(random() * 10)
  }
  const particleGeometry = track(new BufferGeometry())
  particleGeometry.setAttribute(
    "position",
    new BufferAttribute(particlePositions, 3),
  )
  const petalTexture = track(
    canvasTexture(32, 32, (ctx) => {
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.ellipse(16, 16, 13, 7, 0.6, 0, Math.PI * 2)
      ctx.fill()
    }),
  )
  const particleMaterial = track(
    new PointsMaterial({
      map: petalTexture,
      color: 0xffc4dc,
      size: 0.3,
      fog: false,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
      side: DoubleSide,
    }),
  )
  if (particleCount > 0) {
    const particles = new Points(particleGeometry, particleMaterial)
    particles.frustumCulled = false
    scene.add(particles)
  }
  let particle = THEMES[0].particle
  const applyParticle = () => {
    particle = THEMES[propTheme].particle
    particleMaterial.map = particle.dot ? glowTexture : petalTexture
    particleMaterial.color.set(particle.color)
    particleMaterial.size = particle.dot ? particle.size * 1.8 : particle.size
    particleMaterial.needsUpdate = true
  }

  // ---- 空気（かすみ・もや・光のすじ・空を横切るもの） ---------------------------
  const fog = new Fog(0xffffff, 16, 75)
  scene.fog = fog

  // 奥の景色のすそをぼかす、もや
  const mistTexture = track(
    canvasTexture(512, 128, (ctx) => {
      const image = ctx.createImageData(512, 128)
      for (let x = 0; x < 512; x++) {
        const a = (x / 512) * Math.PI * 2
        const top =
          34 +
          20 * Math.sin(a * 2) +
          11 * Math.sin(a * 5 + 1) +
          6 * Math.sin(a * 11 + 2)
        for (let y = 0; y < 128; y++) {
          const raw = Math.min(1, Math.max(0, ((y - top) / (128 - top)) * 1.5))
          const offset = (y * 512 + x) * 4
          image.data[offset] = 255
          image.data[offset + 1] = 255
          image.data[offset + 2] = 255
          image.data[offset + 3] = raw * raw * (3 - 2 * raw) * 255
        }
      }
      ctx.putImageData(image, 0, 0)
    }),
  )
  mistTexture.wrapS = RepeatWrapping
  mistTexture.repeat.set(2, 1)
  const mistMaterial = track(
    new MeshBasicMaterial({
      map: mistTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      fog: false,
    }),
  )
  for (const [z, y, height] of (lite
    ? [[-8.7, 1.5, 5.2]]
    : [
        [-8.7, 1.5, 5.2],
        [-21, 3.4, 9],
      ]) as V3[]) {
    const mist = new Mesh(track(new PlaneGeometry(140, height)), mistMaterial)
    mist.position.set(14, y, z)
    scene.add(mist)
  }

  // 木の間からさす光のすじ
  const shaftMaterial = track(
    new MeshBasicMaterial({
      map: track(
        canvasTexture(64, 256, (ctx) => {
          const down = ctx.createLinearGradient(0, 0, 0, 256)
          down.addColorStop(0, "rgba(255,255,255,0.95)")
          down.addColorStop(1, "rgba(255,255,255,0)")
          ctx.fillStyle = down
          ctx.fillRect(0, 0, 64, 256)
          // 左右のはしをやわらかく消す
          const side = ctx.createLinearGradient(0, 0, 64, 0)
          side.addColorStop(0, "rgba(0,0,0,1)")
          side.addColorStop(0.5, "rgba(0,0,0,0)")
          side.addColorStop(1, "rgba(0,0,0,1)")
          ctx.globalCompositeOperation = "destination-out"
          ctx.fillStyle = side
          ctx.fillRect(0, 0, 64, 256)
        }),
      ),
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0,
      fog: false,
    }),
  )
  let shaftPower = 0
  if (!lite) {
    const shaftGeometry = track(new PlaneGeometry(1, 1))
    for (let i = 0; i < 4; i++) {
      const shaft = new Mesh(shaftGeometry, shaftMaterial)
      shaft.scale.set(2.4 + random() * 3, 15, 1)
      shaft.position.set(-22 + i * 22 + random() * 8, 6.4, -4.5 - random() * 5)
      shaft.rotation.z = -0.42
      scroll(shaft, 0.75, 88, -32)
    }
  }

  // 空を横切るもの（鳥・魚・流れ星）
  const birdShape = new Shape()
  birdShape.moveTo(-1, 0.45)
  birdShape.lineTo(0, 0)
  birdShape.lineTo(1, 0.45)
  birdShape.lineTo(1, 0.3)
  birdShape.lineTo(0, -0.16)
  birdShape.lineTo(-1, 0.3)
  const fishShape = new Shape()
  fishShape.moveTo(-0.6, 0)
  fishShape.quadraticCurveTo(-0.2, 0.36, 0.35, 0.05)
  fishShape.lineTo(0.7, 0.3)
  fishShape.lineTo(0.7, -0.3)
  fishShape.lineTo(0.35, -0.05)
  fishShape.quadraticCurveTo(-0.2, -0.36, -0.6, 0)
  const flyerGeometries = {
    bird: track(new ShapeGeometry(birdShape)),
    fish: track(new ShapeGeometry(fishShape)),
    meteor: track(new PlaneGeometry(1, 1)),
  }
  const flyerMaterial = track(
    new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide, fog: false }),
  )
  const meteorMaterial = track(
    new MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: false,
    }),
  )
  type Flyer = {
    mesh: Mesh
    kind: Air["flyer"]
    base: number
    size: number
    speed: number
    phase: number
  }
  const flyers: Flyer[] = []
  const dressFlyer = (flyer: Flyer) => {
    const air = AIR[propTheme]
    flyer.kind = air.flyer
    flyer.mesh.visible = air.flyer !== "none"
    if (air.flyer === "none") return
    flyer.mesh.geometry = flyerGeometries[air.flyer]
    flyer.mesh.material =
      air.flyer === "meteor" ? meteorMaterial : flyerMaterial
    flyer.mesh.rotation.set(0, 0, air.flyer === "meteor" ? 0.45 : 0)
    if (air.flyer === "fish") {
      flyer.base = 2.5 + random() * 6
      flyer.size = 0.5 + random() * 0.5
      flyer.mesh.position.z = -4 - random() * 4.5
      flyer.speed = 1 + random() * 1.5
    } else if (air.flyer === "meteor") {
      flyer.base = 7 + random() * 4
      flyer.size = 1
      flyer.mesh.position.z = -8.6
      flyer.speed = 16 + random() * 10
      flyer.mesh.position.y = flyer.base
    } else {
      flyer.base = 4.6 + random() * 3
      flyer.size = 0.2 + random() * 0.22
      flyer.mesh.position.z = -5 - random() * 3.5
      flyer.speed = 2 + random() * 2
    }
    flyer.mesh.scale.set(
      air.flyer === "meteor" ? 9 : flyer.size,
      air.flyer === "meteor" ? 0.4 : flyer.size,
      1,
    )
  }
  for (let i = 0; i < (lite ? 0 : 5); i++) {
    const mesh = new Mesh(flyerGeometries.bird, flyerMaterial)
    mesh.position.x = -30 + i * 19 + random() * 8
    scene.add(mesh)
    const flyer: Flyer = {
      mesh,
      kind: "bird",
      base: 10,
      size: 0.6,
      speed: 3,
      phase: random() * 6,
    }
    flyers.push(flyer)
  }

  // ---- ステージの色 -----------------------------------------------------------
  const colorA = new Color()
  const colorB = new Color()
  const lerpColor = (a: number, b: number, t: number) =>
    colorA.set(a).lerp(colorB.set(b), t)
  const skyColors = skyGeometry.getAttribute("color") as BufferAttribute
  const setRow = (row: number, color: Color) => {
    skyColors.setXYZ(row * 2, color.r, color.g, color.b)
    skyColors.setXYZ(row * 2 + 1, color.r, color.g, color.b)
  }

  const groundFrom = new Color()
  const groundTo = new Color()
  /** この 1 コマで道が流れた長さ（背景画を流すのに使う） */
  let backdropMove = 0
  const applyPalette = (distance: number) => {
    const position = distance / PICTOR_RUN_STAGE_LENGTH
    const index = Math.floor(position) % THEMES.length
    const within = (position - Math.floor(position)) * PICTOR_RUN_STAGE_LENGTH
    const raw = Math.max(
      0,
      (within - (PICTOR_RUN_STAGE_LENGTH - BLEND_LENGTH)) / BLEND_LENGTH,
    )
    const t = raw * raw * (3 - 2 * raw)
    const a = THEMES[index]
    const b = THEMES[(index + 1) % THEMES.length]
    const mix = (x: number, y: number) => x + (y - x) * t

    setRow(0, lerpColor(a.sky[0], b.sky[0], t))
    setRow(1, lerpColor(a.sky[1], b.sky[1], t))
    setRow(2, lerpColor(a.sky[2], b.sky[2], t))
    skyColors.needsUpdate = true

    lights.sun.color.copy(lerpColor(a.sunLight, b.sunLight, t))
    lights.ambient.color.copy(lerpColor(a.ambient, b.ambient, t))
    // 太陽（月）の高さに合わせて、光のさす角度を変える（低いほど影が長い）
    const elevation =
      ((20 + 40 * Math.min(1, Math.max(0, mix(a.height, b.height)))) *
        Math.PI) /
      180
    sunDirection.set(
      -Math.sin(0.46) * Math.cos(elevation),
      Math.sin(elevation),
      Math.cos(0.46) * Math.cos(elevation),
    )
    lights.sun.position
      .copy(lights.sun.target.position)
      .addScaledVector(sunDirection, 28)
    const lampPower = mix(a.lamp, b.lamp)
    const weatherA = WEATHER[index]
    const weatherB = WEATHER[(index + 1) % WEATHER.length]
    rainLevel = mix(weatherA.rain, weatherB.rain)
    wetUniform.value = lite ? 0 : mix(weatherA.wet, weatherB.wet)
    glowUniform.value = lampPower * 2.4
    for (const light of lampLights) light.intensity = lampPower * 12
    if (pmrem) {
      // 空からの光は、焼いた空の画像が受け持つ
      lights.sun.intensity = mix(a.sunPower, b.sunPower) * 1.5
      lights.ambient.intensity =
        mix(a.ambientPower, b.ambientPower) * (0.22 + lampPower * 0.6)
      skyLight.top.value.copy(lerpColor(a.sky[0], b.sky[0], t))
      skyLight.mid.value.copy(lerpColor(a.sky[1], b.sky[1], t))
      skyLight.low.value.copy(lerpColor(a.sky[2], b.sky[2], t))
      skyLight.ground.value.copy(lerpColor(a.ground, b.ground, t))
      skyLight.sunColor.value
        .copy(lights.sun.color)
        .multiplyScalar(lights.sun.intensity * 0.5)
      skyLight.sunDir.value.copy(sunDirection)
      bakeSky(`${index}:${Math.round(t * 5)}`)
    } else {
      lights.sun.intensity = mix(a.sunPower, b.sunPower)
      lights.ambient.intensity = mix(a.ambientPower, b.ambientPower)
    }
    farMaterial.color.copy(lerpColor(a.far, b.far, t))
    nearMaterial.color.copy(lerpColor(a.near, b.near, t))
    cloudMaterial.color.copy(lerpColor(a.cloud, b.cloud, t))
    cloudMaterial.emissive.copy(cloudMaterial.color).multiplyScalar(0.35)
    cloudMaterial.opacity = mix(a.cloudAlpha, b.cloudAlpha)
    starMaterial.opacity = mix(a.stars, b.stars)
    lampGlowMaterial.opacity = lampPower * 0.55
    updateBackdrop(backdropMove, index, t)
    backdropMove = 0
    // 背景画があるステージは、絵の地面の色に合わせる
    const groundA = backdrops[index].ground
    const groundB = backdrops[(index + 1) % THEMES.length].ground
    groundFrom.set(a.ground)
    if (groundA) groundFrom.copy(groundA)
    groundTo.set(b.ground)
    if (groundB) groundTo.copy(groundB)
    groundMaterial.color.copy(groundFrom).lerp(groundTo, t)
    // 模様（白黒）を掛けても絵と同じ明るさになるよう、少し明るくしておく
    paintedGroundMaterial.color.copy(groundMaterial.color).multiplyScalar(1.12)
    edgeMaterial.color.copy(groundMaterial.color)
    hillMaterials[0].color.copy(lerpColor(a.hills[0], b.hills[0], t))
    hillMaterials[1].color.copy(lerpColor(a.hills[1], b.hills[1], t))
    pathMaterial.color.copy(lerpColor(a.path, b.path, t))
    cliffMaterial.color.copy(lerpColor(a.cliff, b.cliff, t))
    waterMaterial.color.copy(lerpColor(a.water, b.water, t))
    const airA = AIR[index]
    const airB = AIR[(index + 1) % AIR.length]
    fog.color.copy(lerpColor(a.sky[2], b.sky[2], t))
    fog.color.lerp(lerpColor(a.sky[1], b.sky[1], t), 0.35)
    // 縦長の画面はカメラを引くので、その分かすみも遠くから掛ける
    const pull = Math.max(0, camera.position.z - 11.5)
    fog.near = mix(airA.fog[0], airB.fog[0]) + pull
    fog.far = mix(airA.fog[1], airB.fog[1]) + pull
    mistMaterial.color.copy(fog.color)
    mistMaterial.opacity = mix(airA.mist, airB.mist)
    shaftMaterial.color.copy(lerpColor(a.sun, b.sun, t))
    shaftPower = mix(airA.shafts, airB.shafts) * 0.5
    flyerMaterial.color.copy(lerpColor(airA.flyerColor, airB.flyerColor, t))
    haloMaterial.color.copy(lerpColor(a.sun, b.sun, t))
    // 沈んで、次の太陽（月）が昇る
    const height =
      t < 0.5
        ? a.height + (-0.3 - a.height) * (t * 2)
        : -0.3 + (b.height + 0.3) * (t * 2 - 1)
    sunDisc.position.set(34 - (index % 4) * 4 - t * 4, 6 + height * 30, -88)
    sunMaterial.color.set(t >= 0.5 ? b.sun : a.sun)
    sunGlowMaterial.color.copy(sunMaterial.color)
  }
  applyPalette(0)

  const warp = (distance: number) => {
    backdropAlign = true
    propTheme = Math.floor(distance / PICTOR_RUN_STAGE_LENGTH) % THEMES.length
    for (const slot of slots) dress(slot)
    for (const lamp of lampMeshes) lamp.geometry = propsOf(propTheme).lamp
    for (const flyer of flyers) dressFlyer(flyer)
    applyParticle()
    applyPalette(distance)
  }

  /** いま飾っている、読み込んだ作品（掛け替えるときに片づける） */
  let hung: Art[] = []
  const setArtworks = (items: PictorRunStageArtwork[]) => {
    if (items.length === 0) return
    const loader = new TextureLoader()
    loader.setCrossOrigin("anonymous")
    const loaded: Art[] = []
    let pending = items.length
    const settle = () => {
      pending -= 1
      if (pending > 0 || loaded.length === 0 || disposed) return
      // 読めた作品をまとめて飾る（途中で何度も掛け替えない）
      for (const art of hung) {
        art.material.map?.dispose()
        art.material.dispose()
        art.plate?.map?.dispose()
        art.plate?.dispose()
      }
      hung = loaded
      arts = loaded
      nextArt = 0
      for (const framed of framedList) hangNext(framed)
    }
    for (const item of items) {
      loader.load(
        item.url,
        (texture) => {
          if (disposed) {
            texture.dispose()
            return
          }
          track(texture)
          texture.colorSpace = SRGBColorSpace
          const image = texture.image as { width: number; height: number }
          const aspect = image.width / Math.max(1, image.height)
          const shape = aspect > 1.15 ? 0 : aspect < 0.87 ? 2 : 1
          // 額ぶちの形に合わせて、はみ出す分を切る
          const [w, h] = FRAME_SIZES[shape]
          const frameAspect = (w - 0.12) / (h - 0.12)
          if (aspect > frameAspect) {
            texture.repeat.set(frameAspect / aspect, 1)
            texture.offset.set((1 - frameAspect / aspect) / 2, 0)
          } else {
            texture.repeat.set(1, aspect / frameAspect)
            // 縦長の絵は、顔が入りやすい上寄りを見せる
            texture.offset.set(0, (1 - aspect / frameAspect) * 0.7)
          }
          // 夜のステージでも絵がよく見えるように、光の当たり方に左右されない素材にする
          loaded.push({
            material: track(
              new MeshBasicMaterial({ map: texture, fog: false }),
            ),
            shape,
            id: item.id,
            plate: item.author ? makePlate(item.author) : undefined,
          })
          settle()
        },
        undefined,
        settle,
      )
    }
  }

  return {
    update: (move, dt, time, distance) => {
      const nextTheme =
        Math.floor((distance + PROP_LEAD) / PICTOR_RUN_STAGE_LENGTH) %
        THEMES.length
      if (nextTheme !== propTheme) {
        propTheme = nextTheme
        applyParticle()
      }

      for (const item of scrollers) {
        item.object.position.x -= move * item.speed
        if (item.object.position.x < item.min) {
          item.object.position.x += item.span
          item.onWrap?.()
        }
      }
      pathTexture.offset.x = (pathTexture.offset.x + move / PATH_TILE) % 1
      groundTexture.offset.x = (groundTexture.offset.x + move / GROUND_TILE) % 1
      cliffTexture.offset.x = (cliffTexture.offset.x + move / CLIFF_TILE) % 1
      edgeTexture.offset.x = cliffTexture.offset.x
      waterTexture.offset.x = (waterTexture.offset.x + move / 8 + dt * 0.02) % 1
      waterTexture.offset.y = (waterTexture.offset.y + dt * 0.03) % 1

      shifted = (shifted + move) % 1000
      backdropMove = move
      if (puddles && rainMaterial) {
        const wet = wetUniform.value
        puddles.visible = reflections && wet > 0.02
        const uniforms = (puddles.material as ShaderMaterial).uniforms
        uniforms.uWet.value = wet
        uniforms.uRain.value = rainLevel
        uniforms.uTime.value = time
        uniforms.uShift.value = shifted
        rainMaterial.uniforms.uTime.value = time
        rainMaterial.uniforms.uRain.value = rainLevel
      }

      mistTexture.offset.x = (mistTexture.offset.x + move / 90 + dt * 0.006) % 1
      shaftMaterial.opacity = shaftPower * (0.78 + Math.sin(time * 0.7) * 0.22)
      for (const flyer of flyers) {
        if (flyer.kind === "none") {
          // 何も飛ばないステージを抜けたら、また飛ばす
          if (AIR[propTheme].flyer !== "none") dressFlyer(flyer)
          continue
        }
        const mesh = flyer.mesh
        mesh.position.x -= move * 0.25 + dt * flyer.speed
        if (flyer.kind === "meteor") {
          mesh.position.y -= dt * flyer.speed * 0.48
        } else {
          mesh.position.y =
            flyer.base + Math.sin(time * 0.9 + flyer.phase) * 0.6
          if (flyer.kind === "bird") {
            mesh.scale.y = flyer.size * Math.cos(time * 7 + flyer.phase)
          } else {
            mesh.rotation.y = Math.sin(time * 6 + flyer.phase) * 0.45
          }
        }
        if (mesh.position.x < -45 || mesh.position.y < -2) {
          mesh.position.x = 45 + random() * 30
          dressFlyer(flyer)
        }
      }

      for (const item of floaters) {
        item.object.position.y =
          item.base + Math.sin(time * 0.7 + item.phase) * 0.35
      }

      if (particleCount > 0) {
        const positions = particleGeometry.getAttribute(
          "position",
        ) as BufferAttribute
        for (let i = 0; i < particleCount; i++) {
          const seed = particleSeeds[i]
          let x =
            positions.getX(i) - move - dt * particle.drift * (0.5 + (seed % 1))
          let y = positions.getY(i) - dt * particle.fall * (0.7 + (seed % 0.6))
          if (x < -9) x += 34
          if (y < 0) y += 7
          if (y > 7) y -= 7
          positions.setXYZ(
            i,
            x,
            y,
            positions.getZ(i) + Math.sin(time * 1.5 + seed) * dt * 0.3,
          )
        }
        positions.needsUpdate = true
      }

      applyPalette(distance)
    },
    warp,
    setArtworks,
    rain: () => rainLevel,
    setReflections: (on) => {
      reflections = on
    },
    dispose: () => {
      disposed = true
    },
  }
}
