import {
  AmbientLight,
  type AnimationAction,
  AnimationClip,
  AnimationMixer,
  BackSide,
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  type CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HalfFloatType,
  LoopOnce,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  NeutralToneMapping,
  type Object3D,
  OctahedronGeometry,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Quaternion,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SkinnedMesh,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js"
import {
  createPictorRunAudio,
  type PictorRunSound,
  type PictorRunSoundName,
} from "~/components/pictor-run/pictor-run-audio.client"
import {
  canvasTexture,
  createPictorRunStage,
  grainCanvas,
  type PictorRunStageArtwork,
} from "~/components/pictor-run/pictor-run-stage.client"
import { toPictorRunStage } from "~/components/pictor-run/pictor-run-stages"

/**
 * 404 ページの隠しゲーム「ぴくたーちゃんラン」の本体。
 * three.js ごと、遊ぶときにだけ読み込む（.client なのでサーバー側の束には入らない）
 */

export type PictorRunCallbacks = {
  /** 走り始めた */
  onStart: () => void
  /** 得点が変わった（distance = 走った距離 m） */
  onScore: (score: number, coins: number, distance: number) => void
  /** ステージが変わった（0 始まりの通し番号） */
  onStage: (stage: number) => void
  /** ぶつかって終わった（durationMs = 走っていた時間） */
  onGameOver: (score: number, coins: number, durationMs: number) => void
  /** 持っているアイテムが変わった */
  onItems: (items: PictorRunItems) => void
  /** ハート（残りの回数）が変わった */
  onHearts: (hearts: number) => void
  /** 額ぶちに作品を飾った */
  onArtwork: (id: string) => void
  /** ロビーで、看板の近くに来た・離れた */
  onLobbyNear: (action: PictorRunLobbyAction | null) => void
  /** ロビーで動いた（x・z = 広場の中の位置、y = 跳んでいる高さ、f = 向いている角度） */
  onLobbyMove: (x: number, z: number, y: number, f: number) => void
}

/** ロビーの看板でできること */
export type PictorRunLobbyAction = "start" | "ranking" | "chat"

/** ロビーに出すほかの人（playing = いま走っている人。薄い姿でうしろに立つ） */
export type PictorRunPeer = {
  key: number
  name: string
  iconUrl: string | null
  playing: boolean
  x: number
  z: number
  y: number
  /** 向いている角度 */
  f: number
}

/** 持っているアイテム（magnet・star は残りの秒数） */
export type PictorRunItems = { guard: boolean; magnet: number; star: number }

/** 今週の記録の看板（distance = その人が走れた距離 m） */
export type PictorRunMarker = {
  name: string
  iconUrl: string | null
  distance: number
  rank: number
  isMe: boolean
}

export type PictorRunOptions = {
  /** 軽量モード（影なし・粗めの解像度・置くものを減らす） */
  lite: boolean
  sound: PictorRunSound
}

export type PictorRunGame = {
  /** 背景の額ぶちに飾る作品 */
  setArtworks: (items: PictorRunStageArtwork[]) => void
  /** 音量・ミュートを変える */
  setSound: (sound: PictorRunSound) => void
  /** 今週の記録の看板を立てる */
  setMarkers: (markers: PictorRunMarker[]) => void
  /** 画面のボタンなどから効果音を鳴らす */
  playSound: (name: PictorRunSoundName) => void
  /** 最初から走り直す */
  restart: () => void
  /** ロビー（休憩場）に入る */
  enterLobby: () => void
  /** ロビーで、画面のスティックから動かす（x = 右が正、z = 手前が正。-1〜1） */
  setLobbyInput: (x: number, z: number) => void
  /** ロビーで、画面のボタンから跳ぶ */
  jump: () => void
  /** ロビーにいる人・いま走っている人 */
  setPeers: (peers: PictorRunPeer[]) => void
  /** 一時停止（止めている間も画面は描く） */
  setPaused: (paused: boolean) => void
  dispose: () => void
}

type State = "ready" | "running" | "over" | "lobby"

type ObstacleKind = "block" | "tower" | "card" | "bug"

type ItemKind = "guard" | "magnet" | "star" | "heart"

/** ハートの数（ぶつかるたびに 1 つ減り、なくなると終わり） */
export const PICTOR_RUN_MAX_HEARTS = 3

type Obstacle = {
  kind: ObstacleKind
  object: Object3D
  active: boolean
  x: number
  /** 当たり判定（x は中心からの半分の幅、y は下と上） */
  halfWidth: number
  bottom: number
  top: number
  wings: Object3D[]
}

type Coin = { mesh: Mesh; active: boolean; x: number; y: number }

type Pop = { mesh: Mesh; life: number }

const MODEL_SCALE = 1.75
const GRAVITY = 44
const JUMP_VELOCITY = 14
const DOUBLE_JUMP_VELOCITY = 12
/** 走る速さ（ずっと同じ。進んでも速くしない） */
const RUN_SPEED = 8
/** この距離（m）まで、障害物の出方が少しずつ手ごわくなる */
const HARDEST_DISTANCE = 250
const SPAWN_X = 22
const DESPAWN_X = -12

/** モデルに入っている動き */
const CLIP_NAMES = ["idle", "run", "jump", "fall"] as const

type ClipName = (typeof CLIP_NAMES)[number]

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const damp = (from: number, to: number, rate: number, dt: number) =>
  from + (to - from) * (1 - Math.exp(-rate * dt))

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function createPictorRunGame(
  canvas: HTMLCanvasElement,
  modelUrl: string,
  callbacks: PictorRunCallbacks,
  options: PictorRunOptions,
): Promise<PictorRunGame> {
  const { lite } = options
  const audio = createPictorRunAudio(options.sound, { lite })
  const renderer = new WebGLRenderer({
    canvas,
    // 輪郭のなめらか化は、仕上げの処理の中でまとめて行う（画面そのものに掛けると二重になって重い）
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  })
  let pixelRatio = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 2)
  renderer.setPixelRatio(pixelRatio)
  /** 影を落とす（重い端末では、走っている途中でやめることがある） */
  let shadows = !lite
  renderer.shadowMap.enabled = shadows
  renderer.shadowMap.type = PCFSoftShadowMap
  // 明るすぎるところを自然に丸める（色みは変えない）
  if (!lite) renderer.toneMapping = NeutralToneMapping

  const scene = new Scene()
  const camera = new PerspectiveCamera(34, 1, 0.1, 260)

  const ambient = new AmbientLight(0xffffff, 1.5)
  scene.add(ambient)
  const sun = new DirectionalLight(0xffffff, 1.65)
  // 光の向きは (-3, 7, 6) のまま、道のあたりを影の範囲の中心にする
  sun.target.position.set(6, 0, -2)
  sun.position.set(6 - 9, 21, -2 + 18)
  scene.add(sun, sun.target)
  if (shadows) {
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -17
    sun.shadow.camera.right = 17
    sun.shadow.camera.top = 12
    sun.shadow.camera.bottom = -12
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 60
    sun.shadow.bias = -0.0006
    sun.shadow.normalBias = 0.03
    sun.shadow.intensity = 0.9
  }

  let disposed = false
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item)
    return item
  }

  /** 光の当たり方を計算する素材（軽量モードは、計算の軽いもの） */
  const solid = (
    params: {
      color?: number
      map?: Texture | null
      transparent?: boolean
      depthWrite?: boolean
    },
    roughness = 0.7,
    metalness = 0,
  ) =>
    track(
      lite
        ? new MeshLambertMaterial(params)
        : new MeshStandardMaterial({ ...params, roughness, metalness }),
    )

  // ---- ぴくたーちゃん -------------------------------------------------------
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  const gltf = await loader.loadAsync(modelUrl)
  const model = gltf.scene
  // 書き出しに混ざっている目印の球は使わない
  model.getObjectByName("Icosphere")?.removeFromParent()

  const skinned: SkinnedMesh[] = []
  model.traverse((object) => {
    if (object instanceof SkinnedMesh) skinned.push(object)
  })
  /** 表情（まばたきなど）を持つ顔のメッシュ */
  let face: SkinnedMesh | null = null
  for (const mesh of skinned) {
    const source = mesh.material as MeshBasicMaterial
    const isFace = mesh.morphTargetDictionary !== undefined
    const material = solid(
      { map: source.map, transparent: isFace, depthWrite: !isFace },
      0.78,
    )
    if (source.map) track(source.map)
    source.dispose()
    mesh.material = material
    mesh.frustumCulled = false
    track(mesh.geometry)
    mesh.castShadow = shadows && !isFace
    if (isFace) {
      face = mesh
      mesh.renderOrder = 1
    }
  }

  /** 表情は 0 か 1 で切り替える（途中の値は目のくぼみが透けて見える） */
  const setExpression = (name: string, on: boolean) => {
    const index = face?.morphTargetDictionary?.[name]
    if (face?.morphTargetInfluences && index !== undefined) {
      face.morphTargetInfluences[index] = on ? 1 : 0
    }
  }

  const mixer = new AnimationMixer(model)
  const actions = {} as Record<ClipName, AnimationAction>
  for (const name of CLIP_NAMES) {
    const clip = AnimationClip.findByName(gltf.animations, name)
    if (!clip) throw new Error(`animation not found: ${name}`)
    actions[name] = mixer.clipAction(clip)
  }
  actions.fall.setLoop(LoopOnce, 1)
  actions.fall.clampWhenFinished = true
  // 跳んでいる間の姿勢は、上がり下がりに合わせてこちらでコマを選ぶ
  actions.jump.paused = true
  const hip = model.getObjectByName("Hip")
  const head = model.getObjectByName("Head")
  if (!hip || !head) throw new Error("bone not found")

  // 立ち姿で大きさを測って、身長 1・足元 0・正面が手前（+Z）にそろえる
  actions.idle.play()
  mixer.update(0)
  model.updateMatrixWorld(true)
  const bounds = new Box3().setFromObject(model, true)
  const fitScale = 1 / (bounds.max.y - bounds.min.y)
  const fit = new Group()
  fit.rotation.y = -Math.PI / 2
  fit.scale.setScalar(fitScale)
  fit.position.y = -0.5 - bounds.min.y * fitScale
  fit.add(model)
  fit.updateMatrixWorld(true)
  const point = new Vector3()
  const hipHome = fit.worldToLocal(hip.getWorldPosition(point)).clone()

  /** 位置と、転んだときの回転 */
  const player = new Group()
  /** 走る向き（少しだけ手前を向かせて顔を見せる） */
  const facing = new Group()
  /** 2 段ジャンプの宙返り（腰のあたりを中心に回す） */
  const flip = new Group()
  flip.position.y = 0.5
  flip.add(fit)
  facing.add(flip)
  facing.rotation.y = 0.92
  facing.scale.setScalar(MODEL_SCALE)
  player.add(facing)
  scene.add(player)

  const shadow = new Mesh(
    track(new PlaneGeometry(1.5, 1)),
    track(
      new MeshBasicMaterial({
        map: track(
          canvasTexture(64, 64, (ctx) => {
            const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
            g.addColorStop(0, "rgba(30,40,90,0.45)")
            g.addColorStop(1, "rgba(30,40,90,0)")
            ctx.fillStyle = g
            ctx.fillRect(0, 0, 64, 64)
          }),
        ),
        transparent: true,
        depthWrite: false,
      }),
    ),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.02
  // 影を落としている間は、足元の丸い影は出さない
  shadow.visible = !shadows
  scene.add(shadow)

  // 転んだときに頭の上を回る星
  const stars = new Group()
  const starGeometry = track(new OctahedronGeometry(0.11))
  const starMaterial = track(new MeshBasicMaterial({ color: 0xffd23f }))
  for (let i = 0; i < 3; i++) stars.add(new Mesh(starGeometry, starMaterial))
  stars.visible = false
  scene.add(stars)

  const stage = createPictorRunStage(
    scene,
    track,
    { ambient, sun },
    {
      lite,
      shadows,
      camera,
      renderer,
      onArtworkShown: (id) => callbacks.onArtwork(id),
    },
  )

  // ---- エフェクト（土けむり・きらめき・紙ふぶき） ------------------------------
  const FX_MAX = lite ? 90 : 260
  const fxPositions = new Float32Array(FX_MAX * 3)
  const fxColors = new Float32Array(FX_MAX * 3)
  const fxSizes = new Float32Array(FX_MAX)
  const fxAlphas = new Float32Array(FX_MAX)
  /** 1 つぶごとに: 速さ x・y・z、残りの時間、もとの時間、落ちる強さ、大きさ */
  const fxState = new Float32Array(FX_MAX * 7)
  const fxGeometry = track(new BufferGeometry())
  fxGeometry.setAttribute("position", new BufferAttribute(fxPositions, 3))
  fxGeometry.setAttribute("aColor", new BufferAttribute(fxColors, 3))
  fxGeometry.setAttribute("aSize", new BufferAttribute(fxSizes, 1))
  fxGeometry.setAttribute("aAlpha", new BufferAttribute(fxAlphas, 1))
  const fxMaterial = track(
    new ShaderMaterial({
      uniforms: { uScale: { value: 1 } },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aAlpha;
        uniform float uScale;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = aColor;
          vAlpha = aAlpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uScale / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float alpha = smoothstep(0.5, 0.22, length(gl_PointCoord - 0.5)) * vAlpha;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vColor, alpha);
          #include <colorspace_fragment>
        }`,
      transparent: true,
      depthWrite: false,
    }),
  )
  const fxPoints = new Points(fxGeometry, fxMaterial)
  fxPoints.frustumCulled = false
  fxPoints.renderOrder = 5
  scene.add(fxPoints)
  let fxNext = 0
  const fxColor = new Color()
  const emit = (
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    life: number,
    size: number,
    color: number,
    gravity: number,
  ) => {
    const i = fxNext
    fxNext = (fxNext + 1) % FX_MAX
    fxPositions[i * 3] = x
    fxPositions[i * 3 + 1] = y
    fxPositions[i * 3 + 2] = z
    fxColor.set(color)
    fxColors[i * 3] = fxColor.r
    fxColors[i * 3 + 1] = fxColor.g
    fxColors[i * 3 + 2] = fxColor.b
    fxState[i * 7] = vx
    fxState[i * 7 + 1] = vy
    fxState[i * 7 + 2] = vz
    fxState[i * 7 + 3] = life
    fxState[i * 7 + 4] = life
    fxState[i * 7 + 5] = gravity
    fxState[i * 7 + 6] = size
  }
  /** 軽量モードでは、つぶの数を半分にする */
  const amount = (count: number) => (lite ? Math.ceil(count / 2) : count)
  const dust = (x: number, count: number, power: number, size = 1) => {
    for (let i = 0; i < amount(count); i++) {
      emit(
        x + (Math.random() - 0.5) * 0.4,
        0.08,
        0.3 + (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 2.4 * power - 1,
        0.4 + Math.random() * 1.3 * power,
        0,
        (0.3 + Math.random() * 0.22) * (size < 1 ? 0.7 : 1),
        (0.24 + Math.random() * 0.2) * size,
        0xfff6e6,
        1.5,
      )
    }
  }
  const sparkle = (x: number, y: number, color: number, count: number) => {
    for (let i = 0; i < amount(count); i++) {
      const angle = Math.random() * Math.PI * 2
      const power = 1.8 + Math.random() * 3.4
      emit(
        x,
        y,
        0.35,
        Math.cos(angle) * power,
        Math.sin(angle) * power + 1,
        (Math.random() - 0.5) * 2,
        0.32 + Math.random() * 0.3,
        0.13 + Math.random() * 0.13,
        color,
        6,
      )
    }
  }
  const CONFETTI = [0xff8a1f, 0x19b5d8, 0xffd84a, 0xff7ab0, 0xffffff, 0x8ae08a]
  const confetti = () => {
    for (let i = 0; i < amount(48); i++) {
      emit(
        -3 + Math.random() * 15,
        4.6 + Math.random() * 2.8,
        -1 + Math.random() * 2.2,
        (Math.random() - 0.5) * 2.4,
        -0.6 - Math.random() * 1.8,
        0,
        1.5 + Math.random() * 1.1,
        0.15 + Math.random() * 0.11,
        CONFETTI[i % CONFETTI.length],
        2.2,
      )
    }
  }
  const updateFx = (dt: number, move: number) => {
    for (let i = 0; i < FX_MAX; i++) {
      let life = fxState[i * 7 + 3]
      if (life <= 0) continue
      life -= dt
      fxState[i * 7 + 3] = life
      if (life <= 0) {
        fxAlphas[i] = 0
        fxSizes[i] = 0
        continue
      }
      fxState[i * 7 + 1] -= fxState[i * 7 + 5] * dt
      fxPositions[i * 3] += fxState[i * 7] * dt - move
      fxPositions[i * 3 + 1] += fxState[i * 7 + 1] * dt
      fxPositions[i * 3 + 2] += fxState[i * 7 + 2] * dt
      const k = life / fxState[i * 7 + 4]
      fxAlphas[i] = Math.min(1, k * 2.2) * 0.85
      fxSizes[i] = fxState[i * 7 + 6] * (0.55 + 0.45 * k)
    }
    fxGeometry.attributes.position.needsUpdate = true
    fxGeometry.attributes.aColor.needsUpdate = true
    fxGeometry.attributes.aSize.needsUpdate = true
    fxGeometry.attributes.aAlpha.needsUpdate = true
  }
  const clearFx = () => {
    for (let i = 0; i < FX_MAX; i++) {
      fxState[i * 7 + 3] = 0
      fxAlphas[i] = 0
      fxSizes[i] = 0
    }
  }

  // ---- 障害物・コイン -------------------------------------------------------
  const blockTexture = track(
    canvasTexture(128, 128, (ctx) => {
      ctx.fillStyle = "#ff8f6b"
      ctx.fillRect(0, 0, 128, 128)
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 8
      roundRect(ctx, 8, 8, 112, 112, 16)
      ctx.stroke()
      ctx.fillStyle = "#ffffff"
      ctx.font = "900 46px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("404", 64, 68)
      grainCanvas(ctx, 0.14, 201)
    }),
  )
  const cardTexture = track(
    canvasTexture(128, 160, (ctx) => {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, 128, 160)
      ctx.strokeStyle = "#9aa7c7"
      ctx.lineWidth = 8
      ctx.strokeRect(4, 4, 120, 152)
      // 読み込めなかった画像のしるし
      ctx.fillStyle = "#c9d3ea"
      ctx.beginPath()
      ctx.moveTo(20, 124)
      ctx.lineTo(52, 76)
      ctx.lineTo(72, 104)
      ctx.lineTo(86, 88)
      ctx.lineTo(108, 124)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.arc(88, 50, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "#ff6b81"
      ctx.lineWidth = 9
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(26, 30)
      ctx.lineTo(58, 62)
      ctx.moveTo(58, 30)
      ctx.lineTo(26, 62)
      ctx.stroke()
      grainCanvas(ctx, 0.1, 211)
    }),
  )
  const blockGeometry = track(new BoxGeometry(0.95, 0.95, 0.95))
  const blockMaterial = solid({ color: 0xffffff, map: blockTexture }, 0.6)
  const cardGeometry = track(new BoxGeometry(1.0, 1.25, 0.14))
  const cardMaterial = solid({ color: 0xffffff, map: cardTexture }, 0.5)
  const bugBodyGeometry = track(new SphereGeometry(0.34, 16, 12))
  const bugBodyMaterial = solid({ color: 0x9b6bff }, 0.35)
  const bugEyeGeometry = track(new SphereGeometry(0.09, 10, 8))
  const bugEyeMaterial = track(new MeshBasicMaterial({ color: 0xffffff }))
  const bugPupilMaterial = track(new MeshBasicMaterial({ color: 0x2a1a55 }))
  const bugWingGeometry = track(new PlaneGeometry(0.5, 0.3))
  const bugWingMaterial = track(
    new MeshBasicMaterial({
      color: 0xe6dcff,
      transparent: true,
      opacity: 0.85,
      side: DoubleSide,
    }),
  )

  const makeObstacle = (kind: ObstacleKind): Obstacle => {
    const object = new Group()
    const wings: Object3D[] = []
    let halfWidth = 0.4
    let bottom = 0
    let top = 0.9
    if (kind === "block" || kind === "tower") {
      const count = kind === "tower" ? 2 : 1
      for (let i = 0; i < count; i++) {
        const block = new Mesh(blockGeometry, blockMaterial)
        block.castShadow = shadows
        block.position.y = 0.475 + i * 0.95
        block.rotation.y = i * 0.2
        object.add(block)
      }
      top = 0.95 * count
      halfWidth = 0.42
    } else if (kind === "card") {
      const card = new Mesh(cardGeometry, cardMaterial)
      card.castShadow = shadows
      card.position.y = 0.66
      card.rotation.set(-0.08, -0.35, 0.06)
      object.add(card)
      top = 1.2
      halfWidth = 0.36
    } else {
      const body = new Mesh(bugBodyGeometry, bugBodyMaterial)
      body.castShadow = shadows
      body.scale.set(1.15, 0.9, 0.9)
      object.add(body)
      for (const z of [0.16, -0.16]) {
        const eye = new Mesh(bugEyeGeometry, bugEyeMaterial)
        eye.position.set(-0.28, 0.08, z + 0.1)
        const pupil = new Mesh(bugEyeGeometry, bugPupilMaterial)
        pupil.scale.setScalar(0.5)
        pupil.position.set(-0.35, 0.08, z + 0.12)
        object.add(eye, pupil)
      }
      for (const side of [1, -1]) {
        const pivot = new Group()
        const wing = new Mesh(bugWingGeometry, bugWingMaterial)
        wing.position.set(0.1, 0.16, 0)
        wing.rotation.x = -Math.PI / 2
        wing.position.z = side * 0.26
        pivot.position.y = 0.2
        pivot.add(wing)
        object.add(pivot)
        wings.push(pivot)
      }
      bottom = 1.9
      top = 2.55
      halfWidth = 0.34
    }
    object.visible = false
    scene.add(object)
    return { kind, object, active: false, x: 0, halfWidth, bottom, top, wings }
  }

  const obstacles: Obstacle[] = []
  const takeObstacle = (kind: ObstacleKind): Obstacle => {
    let obstacle = obstacles.find((item) => !item.active && item.kind === kind)
    if (!obstacle) {
      obstacle = makeObstacle(kind)
      obstacles.push(obstacle)
    }
    obstacle.active = true
    obstacle.object.visible = true
    return obstacle
  }

  const coinGeometry = track(new CylinderGeometry(0.27, 0.27, 0.07, 20))
  coinGeometry.rotateX(Math.PI / 2)
  // コインは金属。空やまわりが映り込む
  const coinMaterial = solid({ color: 0xffc93c }, 0.3, lite ? 0 : 0.75)
  // 暗いステージでも見つけやすいように、少しだけ自分でも光らせる
  coinMaterial.emissive.set(0x6a4400)
  const coins: Coin[] = []
  const takeCoin = (): Coin => {
    let coin = coins.find((item) => !item.active)
    if (!coin) {
      coin = {
        mesh: new Mesh(coinGeometry, coinMaterial),
        active: false,
        x: 0,
        y: 0,
      }
      scene.add(coin.mesh)
      coins.push(coin)
    }
    coin.active = true
    coin.mesh.visible = true
    return coin
  }

  const popGeometry = track(new RingGeometry(0.2, 0.3, 20))
  const pops: Pop[] = []
  const pop = (x: number, y: number) => {
    let item = pops.find((p) => p.life <= 0)
    if (!item) {
      const material = track(
        new MeshBasicMaterial({ color: 0xfff2a8, transparent: true }),
      )
      item = { mesh: new Mesh(popGeometry, material), life: 0 }
      scene.add(item.mesh)
      pops.push(item)
    }
    item.life = 1
    item.mesh.position.set(x, y, 0.3)
    item.mesh.visible = true
  }

  // ---- 進行 -------------------------------------------------------------------
  let state: State = "ready"
  let speed = 0
  let distance = 0
  let coinCount = 0
  let lastScore = -1
  let lastStage = 0
  let debugNoHit = false
  /** 宙にいた（着地の土けむりと音を出すため） */
  let airborne = false
  /** 跳ぶときにのびて、着地でつぶれる */
  let stretch = 0
  let untilStep = 0
  let coinCombo = 0
  let lastCoinTime = -10
  /** ぶつかった瞬間に画面をゆらす強さ・一瞬止める時間 */
  let shake = 0
  let freeze = 0
  let untilSpawn = 0
  let y = 0
  let velocity = 0
  let jumpsLeft = 2
  let flipTime = -1
  let overTime = 0
  let runTime = 0
  let paused = false
  /** ぶつかった障害物（はじき飛ばして、転んだ姿が隠れないようにする） */
  let hitObstacle: Obstacle | null = null
  let time = 0
  let currentClip: ClipName = "idle"
  let untilBlink = 2
  /** 縦長の画面は先が見えにくいので、その分ゆっくり走る */
  let pace = 1

  // ---- コインを取ったときの「+1」 ---------------------------------------------
  const plusTexture = track(
    canvasTexture(128, 64, (ctx) => {
      ctx.font = "900 46px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.lineJoin = "round"
      ctx.strokeStyle = "#7a4a00"
      ctx.lineWidth = 9
      ctx.strokeText("+1", 64, 34)
      ctx.fillStyle = "#ffe35a"
      ctx.fillText("+1", 64, 34)
    }),
  )
  const pluses: { sprite: Sprite; life: number }[] = []
  const plus = (x: number, height: number) => {
    let item = pluses.find((p) => p.life <= 0)
    if (!item) {
      const sprite = new Sprite(
        track(
          new SpriteMaterial({
            map: plusTexture,
            transparent: true,
            depthTest: false,
            fog: false,
          }),
        ),
      )
      sprite.scale.set(0.95, 0.475, 1)
      sprite.renderOrder = 20
      scene.add(sprite)
      item = { sprite, life: 0 }
      pluses.push(item)
    }
    item.life = 1
    item.sprite.position.set(x, height + 0.35, 0.5)
    item.sprite.visible = true
  }

  // ---- アイテム（ガード・マグネット・スター） ------------------------------------
  const ITEM_LOOK: Record<ItemKind, { color: number; icon: string }> = {
    guard: { color: 0x4aa8ff, icon: "🛡️" },
    magnet: { color: 0xff5a6a, icon: "🧲" },
    star: { color: 0xffd23f, icon: "⭐" },
    heart: { color: 0xff5a8a, icon: "❤️" },
  }
  const ITEM_KINDS: ItemKind[] = ["guard", "magnet", "star", "heart"]
  let hearts = PICTOR_RUN_MAX_HEARTS
  const bubbleGeometry = track(new SphereGeometry(1, 24, 16))
  const makeItem = (kind: ItemKind) => {
    const look = ITEM_LOOK[kind]
    const group = new Group()
    const bubble = new Mesh(
      bubbleGeometry,
      track(
        new MeshBasicMaterial({
          color: look.color,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        }),
      ),
    )
    bubble.scale.setScalar(0.46)
    const icon = new Sprite(
      track(
        new SpriteMaterial({
          map: track(
            canvasTexture(96, 96, (ctx) => {
              ctx.font = "64px system-ui, sans-serif"
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillText(look.icon, 48, 52)
            }),
          ),
          transparent: true,
          fog: false,
        }),
      ),
    )
    icon.scale.setScalar(0.62)
    icon.renderOrder = 6
    group.add(bubble, icon)
    group.visible = false
    scene.add(group)
    return group
  }
  const itemObjects = {
    guard: makeItem("guard"),
    magnet: makeItem("magnet"),
    star: makeItem("star"),
    heart: makeItem("heart"),
  }
  /** 道に出ているアイテム（一度に 1 つだけ） */
  const fieldItem: { kind: ItemKind; x: number; active: boolean } = {
    kind: "guard",
    x: 0,
    active: false,
  }
  const ITEM_HEIGHT = 1.85
  /** 次のアイテムが出るまでの、障害物の回数 */
  let untilItem = 5
  let guard = false
  let magnetTime = 0
  let starTime = 0
  /** ガードが割れた直後など、少しの間だけぶつからない */
  let safeTime = 0
  let itemsKey = ""
  const emitItems = () => {
    const items: PictorRunItems = {
      guard,
      magnet: Math.ceil(magnetTime),
      star: Math.ceil(starTime),
    }
    const key = `${items.guard}:${items.magnet}:${items.star}`
    if (key === itemsKey) return
    itemsKey = key
    callbacks.onItems(items)
  }
  // ぴくたーちゃんを包む、ガード・スターの光のまく
  const shieldMaterial = track(
    new MeshBasicMaterial({
      color: 0x7ac8ff,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    }),
  )
  const shield = new Mesh(bubbleGeometry, shieldMaterial)
  shield.position.y = 0.85
  shield.visible = false
  player.add(shield)
  const placeItem = (x: number) => {
    // 持っているものは出さない
    const kinds = ITEM_KINDS.filter(
      (kind) =>
        !(kind === "guard" && guard) &&
        !(kind === "magnet" && magnetTime > 0) &&
        !(kind === "star" && starTime > 0) &&
        !(kind === "heart" && hearts >= PICTOR_RUN_MAX_HEARTS),
    )
    // ハートが減っているときは、回復が出やすい
    if (hearts < PICTOR_RUN_MAX_HEARTS) kinds.push("heart")
    fieldItem.kind = kinds[Math.floor(Math.random() * kinds.length)] ?? "guard"
    fieldItem.x = x
    fieldItem.active = true
    for (const kind of ITEM_KINDS) {
      itemObjects[kind].visible = kind === fieldItem.kind
    }
  }
  const takeItem = () => {
    fieldItem.active = false
    itemObjects[fieldItem.kind].visible = false
    if (fieldItem.kind === "guard") guard = true
    else if (fieldItem.kind === "magnet") magnetTime = 8
    else if (fieldItem.kind === "star") starTime = 6
    else {
      hearts = Math.min(PICTOR_RUN_MAX_HEARTS, hearts + 1)
      callbacks.onHearts(hearts)
    }
    audio.play("item")
    sparkle(0, y + 1, ITEM_LOOK[fieldItem.kind].color, 18)
    emitItems()
  }
  const clearItems = () => {
    fieldItem.active = false
    for (const kind of ITEM_KINDS) itemObjects[kind].visible = false
    untilItem = 5
    hearts = PICTOR_RUN_MAX_HEARTS
    callbacks.onHearts(hearts)
    facing.visible = true
    guard = false
    magnetTime = 0
    starTime = 0
    safeTime = 0
    shield.visible = false
    emitItems()
  }

  // ---- 今週の記録の看板（その人が走れた地点に立つ） -------------------------------
  const signPoleGeometry = track(new CylinderGeometry(0.05, 0.06, 2.4, 8))
  const signPoleMaterial = solid({ color: 0x9a6a4a }, 0.8)
  const signBoardGeometry = track(new PlaneGeometry(2.4, 1.2))
  type Sign = {
    group: Group
    texture: CanvasTexture
    marker: PictorRunMarker | null
    passed: boolean
  }
  const signs: Sign[] = []
  for (let i = 0; i < 4; i++) {
    const texture = track(canvasTexture(340, 170, () => {}))
    const group = new Group()
    const pole = new Mesh(signPoleGeometry, signPoleMaterial)
    pole.position.y = 1.2
    pole.castShadow = shadows
    const board = new Mesh(
      signBoardGeometry,
      track(
        new MeshBasicMaterial({
          map: texture,
          transparent: true,
          fog: false,
          toneMapped: false,
        }),
      ),
    )
    board.position.set(0, 2.9, 0.05)
    group.add(pole, board)
    group.position.z = -1.48
    group.rotation.y = 0.12
    group.visible = false
    scene.add(group)
    signs.push({ group, texture, marker: null, passed: false })
  }
  const drawSign = (sign: Sign, marker: PictorRunMarker) => {
    const canvas = sign.texture.image as HTMLCanvasElement
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const accent = marker.isMe
      ? "#2d6cdf"
      : marker.rank === 1
        ? "#e0a800"
        : marker.rank === 2
          ? "#8e9aab"
          : marker.rank === 3
            ? "#c0763a"
            : "#5a6a8a"
    const paint = (icon: HTMLImageElement | null) => {
      ctx.clearRect(0, 0, 340, 170)
      ctx.fillStyle = accent
      roundRect(ctx, 2, 2, 336, 166, 26)
      ctx.fill()
      ctx.fillStyle = "#fffdf6"
      roundRect(ctx, 10, 10, 320, 150, 20)
      ctx.fill()
      // アイコン
      ctx.save()
      ctx.beginPath()
      ctx.arc(72, 85, 52, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fillStyle = "#d8dfec"
      ctx.fill()
      if (icon) {
        ctx.clip()
        const size = Math.min(icon.naturalWidth, icon.naturalHeight)
        ctx.drawImage(
          icon,
          (icon.naturalWidth - size) / 2,
          (icon.naturalHeight - size) / 2,
          size,
          size,
          20,
          33,
          104,
          104,
        )
      }
      ctx.restore()
      ctx.strokeStyle = accent
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.arc(72, 85, 52, 0, Math.PI * 2)
      ctx.stroke()
      // 順位・名前・距離
      ctx.textBaseline = "middle"
      ctx.textAlign = "left"
      ctx.fillStyle = accent
      ctx.font = "900 28px system-ui, sans-serif"
      ctx.fillText(
        marker.isMe ? `YOU ・ ${marker.rank}位` : `今週 ${marker.rank}位`,
        138,
        38,
      )
      ctx.fillStyle = "#2a3350"
      ctx.font = "800 27px system-ui, sans-serif"
      let name = marker.name
      while (name.length > 1 && ctx.measureText(name).width > 180) {
        name = `${name.slice(0, -2)}…`
      }
      ctx.fillText(name, 138, 78)
      ctx.font = "900 44px system-ui, sans-serif"
      ctx.fillText(`${Math.floor(marker.distance)} m`, 138, 124)
      sign.texture.needsUpdate = true
    }
    paint(null)
    if (!marker.iconUrl) return
    // 別のドメインの画像は、許可（CORS）の付いたものだけ絵に貼れる。読めなければ丸だけにする
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      if (!disposed && sign.marker === marker) paint(image)
    }
    image.src = marker.iconUrl
  }
  let markers: PictorRunMarker[] = []
  let nextMarker = 0
  const resetSigns = () => {
    for (const sign of signs) {
      sign.marker = null
      sign.group.visible = false
    }
    // 走り始めのすぐ近くには立てない
    nextMarker = markers.findIndex((marker) => marker.distance > distance + 4)
    if (nextMarker < 0) nextMarker = markers.length
  }
  const updateSigns = () => {
    while (
      nextMarker < markers.length &&
      (markers[nextMarker].distance - distance) * 2 < 34
    ) {
      const sign = signs.find((item) => item.marker === null)
      if (!sign) break
      sign.marker = markers[nextMarker]
      sign.passed = false
      sign.group.visible = true
      drawSign(sign, sign.marker)
      nextMarker += 1
    }
    for (const sign of signs) {
      if (!sign.marker) continue
      const x = (sign.marker.distance - distance) * 2
      sign.group.position.x = x
      if (!sign.passed && x < 0 && state === "running") {
        // 追いぬいた
        sign.passed = true
        sparkle(0, 2.9, 0xffd84a, 12)
        audio.play("pass")
      }
      if (x < DESPAWN_X - 2) {
        sign.marker = null
        sign.group.visible = false
      }
    }
  }

  // ---- ロビー（休憩場）。丸い広場を、好きな向きに歩ける -----------------------------
  /** 広場の半径 */
  const LOBBY_RADIUS = 13
  /** まん中の噴水の半径（ぶつかる大きさ） */
  const LOBBY_FOUNTAIN = 2.3
  /** ロビーは、走る道とは別の場面として持つ */
  const lobbyScene = new Scene()
  let activeScene: Scene = scene
  const lobbyPosition = { x: 0.8, z: 8 }
  const lobbyVelocity = { x: 0, z: 0 }
  /** 歩く速さ（動きの切り替えに使う） */
  let lobbySpeed = 0
  /** 向いている方向（0 = 手前。右回りが正） */
  let lobbyYaw = 0
  /** 画面のスティックからの入力（-1〜1） */
  const lobbyStick = { x: 0, z: 0 }
  const lobbyKeys = { left: false, right: false, up: false, down: false }
  let lobbyNear: PictorRunLobbyAction | null = null
  const lobbySent = { x: 0, z: 0, y: 0, f: 0 }
  const lobbyAmbient = new AmbientLight(0xfff2f6, lite ? 1.7 : 0.3)
  const lobbySun = new DirectionalLight(0xffead6, lite ? 1.3 : 1.5)
  lobbyScene.environmentIntensity = 0.55
  lobbySun.position.set(-9, 18, 11)
  if (shadows) {
    lobbySun.castShadow = true
    lobbySun.shadow.mapSize.set(2048, 2048)
    lobbySun.shadow.camera.left = -17
    lobbySun.shadow.camera.right = 17
    lobbySun.shadow.camera.top = 17
    lobbySun.shadow.camera.bottom = -17
    lobbySun.shadow.camera.near = 1
    lobbySun.shadow.camera.far = 60
    lobbySun.shadow.bias = -0.0006
    lobbySun.shadow.normalBias = 0.03
    lobbySun.shadow.intensity = 0.8
  }
  lobbyScene.add(lobbyAmbient, lobbySun, lobbySun.target)

  // まわりの草地と、石をしいた丸い広場
  const lobbyGrass = solid({ color: 0xb7d68a }, 0.95)
  const lobbyField = new Mesh(track(new CircleGeometry(36, 48)), lobbyGrass)
  lobbyField.rotation.x = -Math.PI / 2
  lobbyField.position.y = -0.02
  lobbyField.receiveShadow = shadows
  lobbyScene.add(lobbyField)
  const plazaTexture = track(
    canvasTexture(1024, 1024, (ctx) => {
      ctx.fillStyle = "#9a9388"
      ctx.fillRect(0, 0, 1024, 1024)
      ctx.translate(512, 512)
      // 輪になった石だたみ（輪ごとに石の数を変える）
      for (let ring = 12; ring >= 1; ring--) {
        const outer = ring * 42
        const inner = outer - 42
        const count = Math.max(6, Math.round(ring * 5.5))
        for (let i = 0; i < count; i++) {
          const a0 = ((i + (ring % 2) * 0.5) / count) * Math.PI * 2
          const a1 = a0 + (Math.PI * 2) / count
          const tone = 176 + Math.floor(Math.random() * 30)
          ctx.fillStyle =
            ring % 4 === 0
              ? `rgb(${tone - 6},${tone - 22},${tone - 34})`
              : `rgb(${tone},${tone - 5},${tone - 14})`
          ctx.beginPath()
          ctx.arc(0, 0, outer - 2, a0 + 0.012, a1 - 0.012)
          ctx.arc(0, 0, inner + 2, a1 - 0.012, a0 + 0.012, true)
          ctx.closePath()
          ctx.fill()
        }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      grainCanvas(ctx, 0.1, 301)
    }),
  )
  const plaza = new Mesh(
    track(new CircleGeometry(LOBBY_RADIUS, 72)),
    solid({ color: 0xffffff, map: plazaTexture }, 0.8),
  )
  plaza.rotation.x = -Math.PI / 2
  plaza.receiveShadow = shadows
  lobbyScene.add(plaza)
  const stoneMaterial = solid({ color: 0xd9d2c4 }, 0.85)
  const rim = new Mesh(
    track(new TorusGeometry(LOBBY_RADIUS, 0.18, 8, 72)),
    stoneMaterial,
  )
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.06
  lobbyScene.add(rim)

  // まん中の噴水
  const waterMaterial = solid({ color: 0x7fd0f0 }, 0.15)
  const fountain = new Group()
  const basin = new Mesh(
    track(new CylinderGeometry(2.1, 2.25, 0.5, 32)),
    stoneMaterial,
  )
  basin.position.y = 0.25
  const pool = new Mesh(
    track(new CylinderGeometry(1.85, 1.85, 0.06, 32)),
    waterMaterial,
  )
  pool.position.y = 0.5
  const pillar = new Mesh(
    track(new CylinderGeometry(0.22, 0.34, 1.5, 12)),
    stoneMaterial,
  )
  pillar.position.y = 1.2
  const bowl = new Mesh(
    track(new CylinderGeometry(0.85, 0.3, 0.3, 20)),
    stoneMaterial,
  )
  bowl.position.y = 2.05
  const spout = new Mesh(track(new SphereGeometry(0.3, 16, 12)), waterMaterial)
  spout.position.y = 2.35
  fountain.add(basin, pool, pillar, bowl, spout)
  for (const part of fountain.children) {
    ;(part as Mesh).castShadow = shadows
    ;(part as Mesh).receiveShadow = shadows
  }
  lobbyScene.add(fountain)

  // 広場のふちのベンチと街灯、外がわの桜の木
  const benchMaterial = solid({ color: 0xb9855a }, 0.8)
  const benchSeat = track(new BoxGeometry(1.7, 0.1, 0.5))
  const benchLeg = track(new BoxGeometry(0.1, 0.42, 0.44))
  const lampPole = track(new CylinderGeometry(0.06, 0.09, 2.7, 8))
  const lampBulb = track(new SphereGeometry(0.2, 12, 10))
  const lampMaterial = solid({ color: 0x3a4a8a }, 0.6)
  const bulbMaterial = track(new MeshBasicMaterial({ color: 0xfff1b8 }))
  const trunkGeometry = track(new CylinderGeometry(0.2, 0.32, 2.2, 8))
  const crownGeometry = track(new SphereGeometry(1, 14, 10))
  const trunkMaterial = solid({ color: 0x7a5340 }, 0.9)
  const crownMaterials = [0xffc2d9, 0xffaecb, 0xffd3e2].map((color) =>
    solid({ color }, 0.9),
  )
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + 0.26
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    if (i % 2 === 0) {
      const bench = new Group()
      const seat = new Mesh(benchSeat, benchMaterial)
      seat.position.y = 0.46
      seat.castShadow = shadows
      bench.add(seat)
      for (const side of [-0.7, 0.7]) {
        const leg = new Mesh(benchLeg, benchMaterial)
        leg.position.set(side, 0.21, 0)
        bench.add(leg)
      }
      bench.position.set(
        sin * (LOBBY_RADIUS - 1.1),
        0,
        cos * (LOBBY_RADIUS - 1.1),
      )
      bench.rotation.y = angle
      lobbyScene.add(bench)
    } else {
      const lamp = new Group()
      const pole = new Mesh(lampPole, lampMaterial)
      pole.position.y = 1.35
      pole.castShadow = shadows
      const bulb = new Mesh(lampBulb, bulbMaterial)
      bulb.position.y = 2.8
      lamp.add(pole, bulb)
      lamp.position.set(
        sin * (LOBBY_RADIUS - 0.5),
        0,
        cos * (LOBBY_RADIUS - 0.5),
      )
      lobbyScene.add(lamp)
    }
    // 桜の木（広場の外。手前がわはカメラをふさぐので植えない）
    if (cos > 0.3) continue
    const tree = new Group()
    const trunk = new Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 1.1
    trunk.castShadow = shadows
    tree.add(trunk)
    for (const [x, height, z, size] of [
      [0, 3.1, 0, 1.5],
      [0.9, 2.6, 0.3, 1.05],
      [-0.8, 2.7, -0.3, 1.1],
      [0.1, 3.7, -0.5, 0.95],
    ]) {
      const crown = new Mesh(
        crownGeometry,
        crownMaterials[(i + Math.round(x * 2 + 2)) % 3],
      )
      crown.position.set(x, height, z)
      crown.scale.setScalar(size)
      crown.castShadow = shadows
      tree.add(crown)
    }
    const far = LOBBY_RADIUS + 2.6 + (i % 3) * 1.5
    tree.position.set(sin * far, 0, cos * far)
    tree.scale.setScalar(1 + (i % 4) * 0.12)
    lobbyScene.add(tree)
  }

  // ぐるりと囲む景色（さくら並木の背景画を、まわりに 4 枚ぶん巻く。ロビーに入ったときに読む）
  const lobbySkyMaterial = track(
    new MeshBasicMaterial({ color: 0xf6c9d8, side: BackSide, fog: false }),
  )
  const lobbySky = new Mesh(
    track(new CylinderGeometry(34, 34, 30, 48, 1, true)),
    lobbySkyMaterial,
  )
  lobbySky.position.y = 30 / 2 - 4.6
  lobbyScene.add(lobbySky)
  // 空（巻いた絵の上をふさぐ）
  const lobbyCap = new Mesh(
    track(new CircleGeometry(34, 32)),
    track(new MeshBasicMaterial({ color: 0xcdb7f0, fog: false })),
  )
  lobbyCap.rotation.x = Math.PI / 2
  lobbyCap.position.y = 30 - 4.6
  lobbyScene.add(lobbyCap)
  let lobbySkyLoaded = false
  const loadLobbySky = () => {
    if (lobbySkyLoaded) return
    lobbySkyLoaded = true
    new TextureLoader().load(
      `/images/pictor-chan/run/bg/stage-02${lite ? "-s" : ""}.webp`,
      (texture) => {
        if (disposed) {
          texture.dispose()
          return
        }
        track(texture)
        texture.colorSpace = SRGBColorSpace
        texture.wrapS = MirroredRepeatWrapping
        texture.repeat.set(4, 1)
        lobbySkyMaterial.map = texture
        lobbySkyMaterial.color.set(0xffffff)
        lobbySkyMaterial.needsUpdate = true
        // 絵の地面と空の色を、草地と空のふたに使う
        const canvas = document.createElement("canvas")
        canvas.width = 16
        canvas.height = 16
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(texture.image as CanvasImageSource, 0, 0, 16, 16)
        const pick = (row: number) => {
          const data = ctx.getImageData(0, row, 16, 1).data
          let r = 0
          let g = 0
          let b = 0
          for (let i = 0; i < 16; i++) {
            r += data[i * 4]
            g += data[i * 4 + 1]
            b += data[i * 4 + 2]
          }
          return new Color().setRGB(
            r / 16 / 255,
            g / 16 / 255,
            b / 16 / 255,
            SRGBColorSpace,
          )
        }
        lobbyGrass.color.copy(pick(13))
        ;(lobbyCap.material as MeshBasicMaterial).color.copy(pick(0))
      },
    )
  }

  const LOBBY_SIGNS: {
    action: PictorRunLobbyAction | null
    x: number
    z: number
    icon: string
    title: string
    sub: string
    color: string
  }[] = [
    {
      action: "start",
      x: 0,
      z: -11.2,
      icon: "🏃",
      title: "もういちど走る",
      sub: "ここからスタート",
      color: "#ff8a1f",
    },
    {
      action: "ranking",
      x: -9.3,
      z: -6.3,
      icon: "🏆",
      title: "ランキング",
      sub: "今週の記録を見る",
      color: "#e0a800",
    },
    {
      action: "chat",
      x: 9.3,
      z: -6.3,
      icon: "💬",
      title: "チャット",
      sub: "みんなと話す",
      color: "#2d6cdf",
    },
  ]
  for (const item of LOBBY_SIGNS) {
    const texture = track(
      canvasTexture(340, 170, (ctx) => {
        ctx.fillStyle = item.color
        roundRect(ctx, 2, 2, 336, 166, 26)
        ctx.fill()
        ctx.fillStyle = "#fffdf6"
        roundRect(ctx, 10, 10, 320, 150, 20)
        ctx.fill()
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"
        ctx.font = "76px system-ui, sans-serif"
        ctx.fillText(item.icon, 68, 90)
        ctx.textAlign = "left"
        ctx.fillStyle = "#1c2340"
        ctx.font = "900 32px system-ui, sans-serif"
        ctx.fillText(item.title, 126, 66, 196)
        ctx.fillStyle = "#3a4468"
        ctx.font = "700 22px system-ui, sans-serif"
        ctx.fillText(item.sub, 126, 110, 196)
      }),
    )
    const sign = new Group()
    const pole = new Mesh(signPoleGeometry, signPoleMaterial)
    pole.position.y = 1.2
    pole.castShadow = shadows
    const board = new Mesh(
      signBoardGeometry,
      track(
        new MeshBasicMaterial({
          map: texture,
          transparent: true,
          fog: false,
        }),
      ),
    )
    board.position.set(0, 2.9, 0.05)
    sign.add(pole, board)
    sign.position.set(item.x, 0, item.z)
    // 広場のまん中のほうへ少し向ける
    sign.rotation.y = Math.atan2(-item.x, 14)
    // 広い広場なので、遠くからでも読める大きさにする
    sign.scale.setScalar(1.5)
    lobbyScene.add(sign)
  }

  // ロビーにいるほかの人・いま走っている人（走っている人は薄い姿で、うしろに立つ）
  const MAX_AVATARS = 10
  type Avatar = {
    root: Group
    turn: Group
    fit: Group
    model: Object3D
    hip: Object3D | null
    mixer: AnimationMixer
    actions: Record<"idle" | "run" | "jump", AnimationAction>
    clip: "idle" | "run" | "jump"
    materials: Material[]
    label: Sprite
    labelTexture: CanvasTexture
    labelKey: string
    /** つながっている相手の番号（空きは null） */
    peer: number | null
    ghost: boolean
    x: number
    y: number
    z: number
    targetX: number
    targetY: number
    targetZ: number
    f: number
  }
  const avatars: Avatar[] = []
  let peerList: PictorRunPeer[] = []
  const makeAvatar = (): Avatar => {
    const copy = cloneSkinned(model)
    const materials: Material[] = []
    copy.traverse((object) => {
      if (!(object instanceof SkinnedMesh)) return
      // 薄さを人ごとに変えられるように、素材は 1 人ずつ持つ
      const material = track((object.material as Material).clone())
      object.material = material
      object.castShadow = false
      object.frustumCulled = false
      materials.push(material)
    })
    const avatarFit = new Group()
    avatarFit.rotation.copy(fit.rotation)
    avatarFit.scale.copy(fit.scale)
    avatarFit.position.copy(fit.position)
    avatarFit.add(copy)
    const lift = new Group()
    lift.position.y = 0.5
    lift.add(avatarFit)
    const turn = new Group()
    turn.scale.setScalar(MODEL_SCALE * 0.94)
    turn.add(lift)
    const labelTexture = track(canvasTexture(288, 72, () => {}))
    const label = new Sprite(
      track(
        new SpriteMaterial({
          map: labelTexture,
          transparent: true,
          depthTest: false,
          fog: false,
        }),
      ),
    )
    label.scale.set(1.9, 0.475, 1)
    label.position.y = 2.15
    label.renderOrder = 15
    const root = new Group()
    root.add(turn, label)
    root.visible = false
    lobbyScene.add(root)
    const avatarMixer = new AnimationMixer(copy)
    const clip = (name: ClipName) => {
      const found = AnimationClip.findByName(gltf.animations, name)
      if (!found) throw new Error(`animation not found: ${name}`)
      return avatarMixer.clipAction(found)
    }
    const avatarActions = {
      idle: clip("idle"),
      run: clip("run"),
      jump: clip("jump"),
    }
    avatarActions.jump.paused = true
    avatarActions.idle.play()
    return {
      root,
      turn,
      fit: avatarFit,
      model: copy,
      hip: copy.getObjectByName("Hip") ?? null,
      mixer: avatarMixer,
      actions: avatarActions,
      clip: "idle",
      materials,
      label,
      labelTexture,
      labelKey: "",
      peer: null,
      ghost: false,
      x: 0,
      y: 0,
      z: 0,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      f: 0,
    }
  }
  const drawLabel = (avatar: Avatar, peer: PictorRunPeer) => {
    const key = `${peer.name}|${peer.iconUrl}|${peer.playing}`
    if (key === avatar.labelKey) return
    avatar.labelKey = key
    const canvas = avatar.labelTexture.image as HTMLCanvasElement
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const paint = (icon: HTMLImageElement | null) => {
      ctx.clearRect(0, 0, 288, 72)
      ctx.font = "800 26px system-ui, sans-serif"
      let name = peer.name
      while (name.length > 1 && ctx.measureText(name).width > 170) {
        name = `${name.slice(0, -2)}…`
      }
      const text = peer.playing ? `${name} 🏃` : name
      const width = Math.min(280, ctx.measureText(text).width + 84)
      const left = (288 - width) / 2
      ctx.fillStyle = peer.playing
        ? "rgba(40,48,80,0.55)"
        : "rgba(24,30,64,0.82)"
      roundRect(ctx, left, 8, width, 56, 28)
      ctx.fill()
      ctx.save()
      ctx.beginPath()
      ctx.arc(left + 30, 36, 22, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fillStyle = "#c7d2ee"
      ctx.fill()
      if (icon) {
        ctx.clip()
        const size = Math.min(icon.naturalWidth, icon.naturalHeight)
        ctx.drawImage(
          icon,
          (icon.naturalWidth - size) / 2,
          (icon.naturalHeight - size) / 2,
          size,
          size,
          left + 8,
          14,
          44,
          44,
        )
      }
      ctx.restore()
      ctx.fillStyle = "#ffffff"
      ctx.textBaseline = "middle"
      ctx.textAlign = "left"
      ctx.fillText(text, left + 60, 38)
      avatar.labelTexture.needsUpdate = true
    }
    paint(null)
    if (!peer.iconUrl) return
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      if (!disposed && avatar.labelKey === key) paint(image)
    }
    image.src = peer.iconUrl
  }
  /** 角度を、近い回り方で近づける */
  const dampAngle = (from: number, to: number, rate: number, dt: number) => {
    const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
    return from + delta * Math.min(1, rate * dt)
  }
  /** いる人に、ぴくたーちゃんを割り当てる（多いときは、ロビーにいる人を先に） */
  const assignAvatars = () => {
    const shown =
      state === "lobby"
        ? [...peerList]
            .sort((a, b) => Number(a.playing) - Number(b.playing))
            .slice(0, MAX_AVATARS)
        : []
    for (const avatar of avatars) {
      if (avatar.peer !== null && !shown.some((p) => p.key === avatar.peer)) {
        avatar.peer = null
        avatar.root.visible = false
      }
    }
    for (const peer of shown) {
      let avatar = avatars.find((item) => item.peer === peer.key)
      const isNew = !avatar
      if (!avatar) {
        avatar = avatars.find((item) => item.peer === null)
        if (!avatar) {
          avatar = makeAvatar()
          avatars.push(avatar)
        }
        avatar.peer = peer.key
        avatar.root.visible = true
      }
      if (peer.playing) {
        // 走っている人は、広場のふちの決まった場所に薄く立たせる（まん中を向く）
        const angle = ((peer.key % 360) / 360) * Math.PI * 2
        avatar.targetX = Math.sin(angle) * (LOBBY_RADIUS - 2.4)
        avatar.targetZ = Math.cos(angle) * (LOBBY_RADIUS - 2.4)
        avatar.targetY = 0
        avatar.f = angle + Math.PI
      } else {
        const far = Math.hypot(peer.x, peer.z)
        const limit = far > LOBBY_RADIUS ? LOBBY_RADIUS / far : 1
        avatar.targetX = peer.x * limit
        avatar.targetZ = peer.z * limit
        avatar.targetY = clamp(peer.y, 0, 6)
        avatar.f = peer.f
      }
      if (isNew || avatar.ghost !== peer.playing) {
        avatar.ghost = peer.playing
        avatar.x = avatar.targetX
        avatar.z = avatar.targetZ
        avatar.y = avatar.targetY
        avatar.turn.rotation.y = avatar.f
        for (const material of avatar.materials) {
          material.transparent = true
          material.opacity = peer.playing ? 0.38 : 1
          material.depthWrite = true
        }
      }
      drawLabel(avatar, peer)
    }
  }
  const updateAvatars = (dt: number) => {
    for (const avatar of avatars) {
      if (avatar.peer === null) continue
      const beforeX = avatar.x
      const beforeZ = avatar.z
      avatar.x = damp(avatar.x, avatar.targetX, 12, dt)
      avatar.z = damp(avatar.z, avatar.targetZ, 12, dt)
      avatar.y = damp(avatar.y, avatar.targetY, 16, dt)
      const moving =
        Math.hypot(avatar.x - beforeX, avatar.z - beforeZ) /
          Math.max(dt, 0.001) >
        0.5
      const next = avatar.y > 0.08 ? "jump" : moving ? "run" : "idle"
      if (next !== avatar.clip) {
        const action = avatar.actions[next]
        action.reset()
        if (next === "jump") {
          action.paused = true
          action.time = 0.63
        }
        action.crossFadeFrom(avatar.actions[avatar.clip], 0.12, false)
        action.play()
        avatar.clip = next
      }
      avatar.mixer.update(dt)
      avatar.root.position.set(avatar.x, avatar.y, avatar.z)
      avatar.turn.rotation.y = dampAngle(
        avatar.turn.rotation.y,
        avatar.f,
        9,
        dt,
      )
      if (avatar.hip) {
        // 動きごとに立ち位置がずれているので、腰の位置（水平）をそろえる
        avatar.model.position.x = 0
        avatar.model.position.z = 0
        avatar.model.updateMatrixWorld(true)
        avatar.fit.worldToLocal(avatar.hip.getWorldPosition(point))
        avatar.model.position.x = hipHome.x - point.x
        avatar.model.position.z = hipHome.z - point.z
      }
    }
  }
  const updateLobby = (dt: number) => {
    let inputX =
      (lobbyKeys.right ? 1 : 0) - (lobbyKeys.left ? 1 : 0) + lobbyStick.x
    let inputZ =
      (lobbyKeys.down ? 1 : 0) - (lobbyKeys.up ? 1 : 0) + lobbyStick.z
    const strength = Math.hypot(inputX, inputZ)
    if (strength > 1) {
      inputX /= strength
      inputZ /= strength
    }
    lobbyVelocity.x = damp(lobbyVelocity.x, inputX * 5.6, 12, dt)
    lobbyVelocity.z = damp(lobbyVelocity.z, inputZ * 5.6, 12, dt)
    lobbySpeed = Math.hypot(lobbyVelocity.x, lobbyVelocity.z)
    lobbyPosition.x += lobbyVelocity.x * dt
    lobbyPosition.z += lobbyVelocity.z * dt
    // 広場の外へは出られない。噴水にも入れない
    const far = Math.hypot(lobbyPosition.x, lobbyPosition.z)
    const limit = LOBBY_RADIUS - 0.8
    if (far > limit) {
      lobbyPosition.x *= limit / far
      lobbyPosition.z *= limit / far
    } else if (far < LOBBY_FOUNTAIN + 0.5 && far > 0.001) {
      lobbyPosition.x *= (LOBBY_FOUNTAIN + 0.5) / far
      lobbyPosition.z *= (LOBBY_FOUNTAIN + 0.5) / far
    }
    if (lobbySpeed > 0.6)
      lobbyYaw = Math.atan2(lobbyVelocity.x, lobbyVelocity.z)
    velocity -= GRAVITY * dt
    y += velocity * dt
    if (y <= 0) {
      y = 0
      velocity = 0
      jumpsLeft = 2
      if (airborne) {
        stretch = -0.22
        audio.play("land")
      }
    }
    airborne = y > 0.02
    if (flipTime >= 0) {
      flipTime += dt / 0.42
      if (flipTime >= 1) flipTime = -1
    }
    // 近くの看板（押すと、走り始める・ランキングやチャットを開く）
    let near: PictorRunLobbyAction | null = null
    for (const item of LOBBY_SIGNS) {
      if (
        item.action &&
        Math.hypot(item.x - lobbyPosition.x, item.z - lobbyPosition.z) < 3.4
      ) {
        near = item.action
      }
    }
    if (near !== lobbyNear) {
      lobbyNear = near
      callbacks.onLobbyNear(near)
    }
    // 動いたときだけ、ほかの人へ位置を知らせる
    if (
      Math.abs(lobbyPosition.x - lobbySent.x) > 0.04 ||
      Math.abs(lobbyPosition.z - lobbySent.z) > 0.04 ||
      Math.abs(y - lobbySent.y) > 0.04 ||
      Math.abs(lobbyYaw - lobbySent.f) > 0.1
    ) {
      lobbySent.x = lobbyPosition.x
      lobbySent.z = lobbyPosition.z
      lobbySent.y = y
      lobbySent.f = lobbyYaw
      callbacks.onLobbyMove(lobbyPosition.x, lobbyPosition.z, y, lobbyYaw)
    }
    updateAvatars(dt)
  }
  /** 走る道の場面に戻す */
  const leaveLobbyScene = () => {
    if (activeScene === lobbyScene) {
      activeScene = scene
      scene.add(player, fxPoints, shadow)
      shadow.position.z = 0
    }
    lobbySpeed = 0
    lobbyVelocity.x = 0
    lobbyVelocity.z = 0
    lobbyStick.x = 0
    lobbyStick.z = 0
    lobbyKeys.left = false
    lobbyKeys.right = false
    lobbyKeys.up = false
    lobbyKeys.down = false
    if (lobbyNear !== null) {
      lobbyNear = null
      callbacks.onLobbyNear(null)
    }
    for (const avatar of avatars) {
      avatar.peer = null
      avatar.root.visible = false
    }
  }

  const score = () => Math.floor(distance) + coinCount * 10

  const reset = () => {
    for (const obstacle of obstacles) {
      obstacle.active = false
      obstacle.object.visible = false
    }
    for (const coin of coins) {
      coin.active = false
      coin.mesh.visible = false
    }
    leaveLobbyScene()
    state = "ready"
    runTime = 0
    paused = false
    hitObstacle = null
    speed = 0
    distance = 0
    coinCount = 0
    lastScore = -1
    lastStage = 0
    stage.warp(0)
    audio.setSong(0)
    clearFx()
    airborne = false
    stretch = 0
    shake = 0
    freeze = 0
    coinCombo = 0
    untilSpawn = 14
    clearItems()
    resetSigns()
    for (const item of pluses) {
      item.life = 0
      item.sprite.visible = false
    }
    y = 0
    velocity = 0
    jumpsLeft = 2
    flipTime = -1
    overTime = 0
    stars.visible = false
    player.position.set(0, 0, 0)
    flip.rotation.x = 0
  }

  const addCoins = (x: number, count: number, height: number, arc: number) => {
    for (let i = 0; i < count; i++) {
      const coin = takeCoin()
      const t = count === 1 ? 0.5 : i / (count - 1)
      coin.x = x + (t - 0.5) * (count - 1) * 0.95
      coin.y = height + Math.sin(t * Math.PI) * arc
    }
  }

  const spawn = () => {
    const level = clamp(distance / HARDEST_DISTANCE, 0, 1)
    const x = SPAWN_X * pace
    untilItem -= 1
    if (untilItem <= 0 && !fieldItem.active) {
      // アイテムだけを置く（跳べば届く高さ）
      untilItem = 8 + Math.floor(Math.random() * 6)
      placeItem(x)
      untilSpawn = 8
      return
    }
    const roll = Math.random()
    if (roll < 0.16) {
      addCoins(x, 5, 0.9, 0)
    } else if (roll < 0.46) {
      takeObstacle("block").x = x
      if (Math.random() < 0.7) addCoins(x, 3, 1.9, 0.7)
    } else if (roll < 0.66) {
      takeObstacle("card").x = x
      if (Math.random() < 0.6) addCoins(x, 3, 2.1, 0.7)
    } else if (roll < 0.8 - level * 0.05) {
      takeObstacle("bug").x = x
      addCoins(x, 3, 0.8, 0)
    } else if (roll < 0.9 && level > 0.15) {
      takeObstacle("tower").x = x
      addCoins(x, 3, 3.0, 0.5)
    } else if (level > 0.3) {
      // 2 つ続けて
      takeObstacle("block").x = x
      takeObstacle("card").x = x + 1.5 + speed * 0.28
    } else {
      takeObstacle("block").x = x
    }
    const gap = speed * (0.95 + Math.random() * 0.75 - level * 0.15)
    untilSpawn = Math.max(6.5, gap) + (roll >= 0.9 && level > 0.3 ? 4 : 0)
  }

  const press = () => {
    audio.unlock()
    if (state === "ready") {
      state = "running"
      speed = RUN_SPEED * pace
      audio.play("start")
      dust(-0.2, 8, 1.2)
      callbacks.onStart()
      return
    }
    if ((state !== "running" && state !== "lobby") || jumpsLeft <= 0) return
    // 土けむりやきらめきは、走る道の上でだけ出す
    const onPath = state === "running"
    if (jumpsLeft === 2 && y <= 0.001) {
      velocity = JUMP_VELOCITY
      stretch = 0.2
      audio.play("jump")
      if (onPath) dust(-0.1, 6, 1)
    } else {
      velocity = DOUBLE_JUMP_VELOCITY
      flipTime = 0
      jumpsLeft = 1
      stretch = 0.16
      audio.play("double")
      if (onPath) sparkle(0, y + 0.5, 0x7ad0ff, 10)
    }
    jumpsLeft -= 1
  }

  const release = () => {
    // 早く離すと低く跳ぶ
    if ((state === "running" || state === "lobby") && velocity > 6) velocity = 6
  }

  const play = (name: ClipName, fade: number) => {
    if (currentClip === name) return
    const next = actions[name]
    next.reset()
    if (name === "jump") next.paused = true
    next.crossFadeFrom(actions[currentClip], fade, false)
    next.play()
    currentClip = name
  }

  const animate = (dt: number) => {
    // 表情: 転んだら「> <」、宙返り中はにっこり、ふだんはときどきまばたき
    untilBlink -= dt
    if (untilBlink < -0.12) untilBlink = 1.8 + Math.random() * 3.2
    const isOver = state === "over"
    const isFlipping = flipTime >= 0
    setExpression("Fun", isOver)
    setExpression("Joy", !isOver && isFlipping)
    setExpression("Blink", !isOver && !isFlipping && untilBlink < 0)

    if (state === "ready") {
      play("idle", 0.2)
    } else if (state === "over") {
      play("fall", 0.1)
    } else if (y > 0.02) {
      play("jump", 0.08)
      // 踏み切り 0.3 秒 → いちばん高いところ 0.63 秒 → 着地の手前 0.85 秒
      actions.jump.time =
        velocity > 0
          ? 0.63 - 0.33 * clamp(velocity / JUMP_VELOCITY, 0, 1)
          : 0.63 + 0.22 * clamp(-velocity / 16, 0, 1)
    } else if (state === "lobby" && lobbySpeed < 0.6) {
      play("idle", 0.15)
    } else {
      play("run", 0.1)
      actions.run.timeScale =
        0.75 + (state === "lobby" ? lobbySpeed : speed) * 0.055
    }
    mixer.update(dt)

    // 動きごとに立ち位置がずれているので、腰の位置（水平）をそろえる
    model.position.x = 0
    model.position.z = 0
    model.updateMatrixWorld(true)
    fit.worldToLocal(hip.getWorldPosition(point))
    model.position.x = hipHome.x - point.x
    model.position.z = hipHome.z - point.z
  }

  const update = (dt: number) => {
    time += dt

    if (state === "running") {
      runTime += dt
      speed = RUN_SPEED * pace
      distance += speed * dt * 0.5

      velocity -= GRAVITY * dt
      y += velocity * dt
      if (y <= 0) {
        y = 0
        velocity = 0
        jumpsLeft = 2
        if (airborne) {
          stretch = -0.22
          audio.play("land")
          dust(0, 7, 1)
        }
      }
      airborne = y > 0.02
      // 走っている間の足元の土けむり
      untilStep -= dt * (speed / RUN_SPEED)
      if (!airborne && untilStep <= 0 && !lite) {
        untilStep = 0.16
        dust(-0.25, 1, 0.5, 0.5)
      }
      if (flipTime >= 0 && !lite) {
        // 宙返りの光のあと
        emit(
          (Math.random() - 0.5) * 0.5,
          y + 0.5 + Math.random() * 0.8,
          0.2,
          -1.5,
          (Math.random() - 0.5) * 1.5,
          0,
          0.4,
          0.17,
          Math.random() < 0.5 ? 0x19b5d8 : 0xff8a1f,
          0,
        )
      }
      if (flipTime >= 0) {
        flipTime += dt / 0.42
        if (flipTime >= 1) flipTime = -1
      }

      untilSpawn -= speed * dt
      if (untilSpawn <= 0) spawn()
    } else if (state === "lobby") {
      updateLobby(dt)
    } else if (state === "over") {
      overTime += dt
      speed = damp(speed, 0, 30, dt)
      velocity -= GRAVITY * dt
      y = Math.max(0, y + velocity * dt)
      if (y === 0 && velocity < -4) velocity = -velocity * 0.3
    }

    const move = speed * dt
    for (const obstacle of obstacles) {
      if (!obstacle.active) continue
      obstacle.x -= move
      const hover =
        obstacle.kind === "bug"
          ? 2.22 + Math.sin(time * 5 + obstacle.x) * 0.1
          : 0
      obstacle.object.position.set(obstacle.x, hover, 0)
      for (let i = 0; i < obstacle.wings.length; i++) {
        obstacle.wings[i].rotation.x =
          (i === 0 ? 1 : -1) * (0.2 + Math.sin(time * 38) * 0.6)
      }
      if (obstacle === hitObstacle) {
        const push = Math.min(1, overTime / 0.5)
        obstacle.x += (1 - push) * dt * 9
        obstacle.object.position.y += Math.sin(push * Math.PI) * 0.5
        obstacle.object.rotation.z = -push * 0.35
      } else {
        obstacle.object.rotation.z = 0
      }
      if (obstacle.x < DESPAWN_X) {
        obstacle.active = false
        obstacle.object.visible = false
        continue
      }
      if (state !== "running") continue
      if (debugNoHit) continue
      const hitX = Math.abs(obstacle.x) < obstacle.halfWidth + 0.26
      const hitY = y + 0.08 < obstacle.top && y + 1.3 > obstacle.bottom
      if (hitX && hitY && (guard || starTime > 0 || safeTime > 0)) {
        // 守られている間は、障害物のほうがはじける
        if (starTime <= 0 && safeTime <= 0) {
          guard = false
          safeTime = 1.2
          shake = 0.45
          navigator.vibrate?.(30)
          emitItems()
        }
        obstacle.active = false
        obstacle.object.visible = false
        sparkle(obstacle.x, (obstacle.bottom + obstacle.top) / 2, 0xffffff, 14)
        sparkle(obstacle.x, (obstacle.bottom + obstacle.top) / 2, 0x7ac8ff, 10)
        audio.play("guard")
        continue
      }
      if (hitX && hitY && hearts > 1) {
        // ハートが 1 つ減る。少しの間はぶつからない
        hearts -= 1
        callbacks.onHearts(hearts)
        safeTime = 1.6
        shake = 0.8
        freeze = 0.06
        obstacle.active = false
        obstacle.object.visible = false
        sparkle(obstacle.x, (obstacle.bottom + obstacle.top) / 2, 0xffffff, 14)
        sparkle(0, y + 0.9, 0xff5a8a, 10)
        audio.play("hurt")
        navigator.vibrate?.(40)
        continue
      }
      if (hitX && hitY) {
        hearts = 0
        callbacks.onHearts(0)
        state = "over"
        hitObstacle = obstacle
        overTime = 0
        velocity = 7
        flipTime = -1
        stars.visible = true
        shake = 1
        freeze = 0.09
        sparkle(obstacle.x * 0.5, y + 0.9, 0xffffff, 16)
        sparkle(obstacle.x * 0.5, y + 0.9, 0xffd84a, 8)
        audio.stop()
        audio.play("hit")
        navigator.vibrate?.(60)
        callbacks.onGameOver(score(), coinCount, Math.round(runTime * 1000))
      }
    }

    if (state === "running") {
      magnetTime = Math.max(0, magnetTime - dt)
      starTime = Math.max(0, starTime - dt)
      safeTime = Math.max(0, safeTime - dt)
      emitItems()
      if (starTime > 0 && !lite && Math.random() < dt * 14) {
        sparkle(-0.2, y + 0.3 + Math.random() * 1.2, 0xffd23f, 1)
      }
    }
    // ぶつかった直後は、点滅して知らせる
    facing.visible =
      state !== "running" || safeTime <= 0 || Math.sin(time * 42) > -0.2
    shield.visible = state === "running" && (guard || starTime > 0)
    if (shield.visible) {
      shieldMaterial.color.set(starTime > 0 ? 0xffd23f : 0x7ac8ff)
      // スターは切れる前に点滅する
      shieldMaterial.opacity =
        starTime > 0 && starTime < 1.5 && Math.sin(time * 30) > 0 ? 0.08 : 0.24
      shield.scale.setScalar(0.98 + Math.sin(time * 6) * 0.03)
    }

    if (fieldItem.active) {
      fieldItem.x -= move
      const object = itemObjects[fieldItem.kind]
      const height = ITEM_HEIGHT + Math.sin(time * 3) * 0.12
      object.position.set(fieldItem.x, height, 0)
      object.children[0].scale.setScalar(0.46 + Math.sin(time * 5) * 0.03)
      if (fieldItem.x < DESPAWN_X) {
        fieldItem.active = false
        object.visible = false
      } else if (
        state === "running" &&
        Math.abs(fieldItem.x) < 0.7 &&
        Math.abs(height - (y + 0.75)) < 1.05
      ) {
        takeItem()
      }
    }

    for (const coin of coins) {
      if (!coin.active) continue
      coin.x -= move
      if (magnetTime > 0 && state === "running" && coin.x < 7) {
        // マグネット: 近くのコインが寄ってくる
        const dx = -coin.x
        const dy = y + 0.75 - coin.y
        const far = Math.hypot(dx, dy)
        if (far > 0.01) {
          const pull = Math.min(far, dt * 15)
          coin.x += (dx / far) * pull
          coin.y += (dy / far) * pull
        }
      }
      coin.mesh.position.set(
        coin.x,
        coin.y + Math.sin(time * 4 + coin.x) * 0.06,
        0,
      )
      coin.mesh.rotation.y = time * 4 + coin.x
      if (coin.x < DESPAWN_X) {
        coin.active = false
        coin.mesh.visible = false
        continue
      }
      if (
        state === "running" &&
        Math.abs(coin.x) < 0.6 &&
        Math.abs(coin.y - (y + 0.75)) < 0.95
      ) {
        coin.active = false
        coin.mesh.visible = false
        coinCount += 1
        pop(coin.x, coin.y)
        plus(coin.x, coin.y)
        // 続けて取るほど、音が高くなる
        coinCombo = time - lastCoinTime < 0.7 ? coinCombo + 1 : 0
        lastCoinTime = time
        audio.play("coin", coinCombo)
        sparkle(coin.x, coin.y, 0xffd84a, 6)
      }
    }

    for (const item of pops) {
      if (item.life <= 0) continue
      item.life -= dt * 4
      const k = 1 - Math.max(0, item.life)
      item.mesh.scale.setScalar(1 + k * 1.6)
      item.mesh.position.x -= move
      ;(item.mesh.material as MeshBasicMaterial).opacity = Math.max(
        0,
        item.life,
      )
      if (item.life <= 0) item.mesh.visible = false
    }

    for (const item of pluses) {
      if (item.life <= 0) continue
      item.life -= dt * 1.5
      item.sprite.position.y += dt * 1.4
      item.sprite.position.x -= move * 0.4
      item.sprite.material.opacity = Math.min(1, Math.max(0, item.life) * 2.2)
      if (item.life <= 0) item.sprite.visible = false
    }
    if (state !== "lobby") updateSigns()

    // ロビーにいる間は、走る道の場面は描かないので動かさない
    if (state !== "lobby") stage.update(move, dt, time, distance)
    updateFx(dt, move)

    // ぴくたーちゃん
    player.position.y = y
    if (state === "lobby") {
      player.position.x = lobbyPosition.x
      player.position.z = lobbyPosition.z
    }
    if (state === "over") {
      const fall = Math.min(1, overTime / 0.45)
      player.position.x = -fall * 0.15
      head.getWorldPosition(stars.position)
      stars.position.y += 0.55
      for (let i = 0; i < stars.children.length; i++) {
        const a = time * 5 + (i * Math.PI * 2) / 3
        stars.children[i].position.set(
          Math.cos(a) * 0.42,
          Math.sin(a) * 0.14,
          Math.sin(a) * 0.42,
        )
        stars.children[i].rotation.y = a
      }
    }
    flip.rotation.x = flipTime >= 0 ? flipTime * Math.PI * 2 : 0
    stretch = damp(stretch, 0, 11, dt)
    facing.scale.set(
      MODEL_SCALE * (1 - stretch * 0.5),
      MODEL_SCALE * (1 + stretch),
      MODEL_SCALE * (1 - stretch * 0.5),
    )
    // 走る前はこちらを向いて待つ
    facing.rotation.y =
      state === "lobby"
        ? dampAngle(facing.rotation.y, lobbyYaw, 10, dt)
        : damp(facing.rotation.y, state === "ready" ? 0.3 : 0.92, 7, dt)
    shadow.position.x = player.position.x
    shadow.position.z = player.position.z
    const shadowScale = clamp(1 - y * 0.16, 0.4, 1)
    shadow.scale.setScalar(shadowScale)

    animate(dt)

    if (state === "running" || state === "over") {
      const value = score()
      if (value !== lastScore) {
        lastScore = value
        callbacks.onScore(value, coinCount, distance)
      }
      const stageNow = toPictorRunStage(distance)
      if (stageNow !== lastStage) {
        lastStage = stageNow
        audio.setSong(stageNow)
        audio.play("stage")
        confetti()
        callbacks.onStage(stageNow)
      }
    }
  }

  // ---- 画面 -------------------------------------------------------------------
  // 仕上げ: 強い光のにじみ・画面のふちの暗さ・フィルムのざらつき（軽量モードでは掛けない）
  const film = lite
    ? null
    : new ShaderPass({
        name: "PictorRunFilm",
        uniforms: {
          tDiffuse: { value: null },
          uTime: { value: 0 },
          uPixel: { value: new Vector2(1, 1) },
          uSmooth: { value: 1 },
        },
        vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
        fragmentShader: `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform vec2 uPixel;
uniform float uSmooth;
varying vec2 vUv;
// 輪郭のぎざぎざを、まわりの色を見てならす（FXAA）
vec3 smoothEdge() {
  vec3 m = texture2D( tDiffuse, vUv ).rgb;
  if ( uSmooth < 0.5 ) return m;
  vec3 luma = vec3( 0.299, 0.587, 0.114 );
  float nw = dot( texture2D( tDiffuse, vUv + vec2( -1.0, -1.0 ) * uPixel ).rgb, luma );
  float ne = dot( texture2D( tDiffuse, vUv + vec2( 1.0, -1.0 ) * uPixel ).rgb, luma );
  float sw = dot( texture2D( tDiffuse, vUv + vec2( -1.0, 1.0 ) * uPixel ).rgb, luma );
  float se = dot( texture2D( tDiffuse, vUv + vec2( 1.0, 1.0 ) * uPixel ).rgb, luma );
  float mid = dot( m, luma );
  float low = min( mid, min( min( nw, ne ), min( sw, se ) ) );
  float high = max( mid, max( max( nw, ne ), max( sw, se ) ) );
  vec2 dir = vec2( -( ( nw + ne ) - ( sw + se ) ), ( nw + sw ) - ( ne + se ) );
  float reduce = max( ( nw + ne + sw + se ) * 0.03125, 0.0078125 );
  dir = clamp( dir / ( min( abs( dir.x ), abs( dir.y ) ) + reduce ), -8.0, 8.0 ) * uPixel;
  vec3 a = 0.5 * ( texture2D( tDiffuse, vUv + dir * ( 1.0 / 3.0 - 0.5 ) ).rgb + texture2D( tDiffuse, vUv + dir * ( 2.0 / 3.0 - 0.5 ) ).rgb );
  vec3 b = a * 0.5 + 0.25 * ( texture2D( tDiffuse, vUv - dir * 0.5 ).rgb + texture2D( tDiffuse, vUv + dir * 0.5 ).rgb );
  float lumaB = dot( b, luma );
  return ( lumaB < low || lumaB > high ) ? a : b;
}
void main() {
  vec3 color = smoothEdge();
  vec2 q = vUv - 0.5;
  color *= mix( 0.7, 1.0, smoothstep( 0.82, 0.3, length( q * vec2( 1.0, 0.9 ) ) ) );
  // 暗いところを少し締める
  color = mix( color, color * color * ( 3.0 - 2.0 * color ), 0.22 );
  float grain = fract( sin( dot( gl_FragCoord.xy + uTime * 61.0, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
  color += ( grain - 0.5 ) * 0.028;
  gl_FragColor = vec4( color, 1.0 );
}`,
      })
  const composer = film
    ? new EffectComposer(
        renderer,
        // ここで多重サンプリング（MSAA）をすると、細かい画面では 1 コマの半分以上の時間を使うので、しない
        track(new WebGLRenderTarget(2, 2, { type: HalfFloatType })),
      )
    : null
  const renderPass = new RenderPass(scene, camera)
  const bloom = new UnrealBloomPass(new Vector2(2, 2), 0.3, 0.6, 0.92)
  /** 仕上げを掛ける（重い端末では、走っている途中でやめる） */
  let post = composer !== null
  if (composer && film) {
    composer.addPass(renderPass)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
    composer.addPass(film)
    track(composer)
  }

  const cameraHome = new Vector3()
  const cameraHomeTurn = new Quaternion()
  const lobbyEye = new Vector3()
  const lobbyLook = new Vector3()
  const resize = () => {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    renderer.setSize(width, height, false)
    composer?.setPixelRatio(pixelRatio)
    composer?.setSize(width, height)
    if (composer && film) {
      // 光のにじみはぼかすものなので、半分の細かさで足りる
      bloom.setSize((width * pixelRatio) / 2, (height * pixelRatio) / 2)
      film.uniforms.uPixel.value.set(
        1 / (width * pixelRatio),
        1 / (height * pixelRatio),
      )
      // 細かい画面（Retina など）は、ならさなくてもぎざぎざが目立たない
      film.uniforms.uSmooth.value = pixelRatio < 1.75 ? 1 : 0
    }
    const aspect = width / height
    camera.aspect = aspect
    // 障害物が見えてから跳ぶまでの間が取れるように、縦長の画面ではカメラを引く
    const wide = aspect > 1
    const lookX = wide ? 3.6 : 1.9
    const tan = Math.tan((camera.fov * Math.PI) / 360)
    const depth = Math.max(9.2, (wide ? 12.5 : 6.4) / (2 * tan * aspect))
    pace = wide ? 1 : 0.74
    camera.position.set(lookX - 1.2, (wide ? 2.5 : 4.2) + depth * 0.05, depth)
    camera.lookAt(lookX, wide ? 1.95 : 3.5, 0)
    camera.updateProjectionMatrix()
    cameraHome.copy(camera.position)
    cameraHomeTurn.copy(camera.quaternion)
    // つぶの大きさを、画面の高さに合わせる
    fxMaterial.uniforms.uScale.value =
      (height * renderer.getPixelRatio()) / (2 * tan)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  // 重い端末では、走っている途中で仕上げと映り込みをやめ、画面を粗くし、それでも重ければ影をやめる
  let slowFrames = 0
  let slowTime = 0
  const watchSpeed = (elapsed: number) => {
    if (elapsed > 0.25) return
    slowFrames += 1
    slowTime += elapsed
    if (slowFrames < 90) return
    const average = slowTime / slowFrames
    slowFrames = 0
    slowTime = 0
    if (average < 1 / 42) return
    if (post) {
      post = false
      stage.setReflections(false)
    } else if (pixelRatio > 1.25) {
      pixelRatio = 1.25
      renderer.setPixelRatio(pixelRatio)
      resize()
    } else if (shadows) {
      shadows = false
      sun.castShadow = false
      shadow.visible = true
    } else if (pixelRatio > 1) {
      pixelRatio = 1
      renderer.setPixelRatio(pixelRatio)
      resize()
    }
  }

  let frame = 0
  let last = performance.now()
  const loop = (now: number) => {
    if (disposed) return
    frame = requestAnimationFrame(loop)
    const elapsed = (now - last) / 1000
    // 別のタブから戻ったときに一気に進めない
    const dt = Math.min(0.034, elapsed)
    last = now
    if (document.hidden) return
    if (state === "running" && !paused) watchSpeed(elapsed)
    if (!paused) {
      // ぶつかった瞬間は、ほんの一瞬だけ止める
      if (freeze > 0) freeze -= dt
      else update(dt)
      if (state !== "over") audio.tick()
      audio.setRain(state === "over" || state === "lobby" ? 0 : stage.rain())
    }
    if (state === "lobby") {
      // ロビーでは、ななめ上からぴくたーちゃんを追う（縦長の画面では、少し引く）
      const wide = camera.aspect > 1
      lobbyEye.set(
        lobbyPosition.x * 0.85,
        wide ? 4.4 : 7.4,
        lobbyPosition.z + (wide ? 10.5 : 17),
      )
      camera.position.lerp(lobbyEye, Math.min(1, dt * 5))
      // 少し上まで見せて、まわりの景色が入るようにする
      lobbyLook.set(
        camera.position.x,
        wide ? 2.3 : 2.8,
        camera.position.z - (wide ? 11 : 17),
      )
      camera.lookAt(lobbyLook)
    } else {
      camera.position.copy(cameraHome)
      camera.quaternion.copy(cameraHomeTurn)
    }
    if (shake > 0) {
      shake = Math.max(0, shake - dt * 2.6)
      camera.position.x += (Math.random() - 0.5) * shake * 0.5
      camera.position.y += (Math.random() - 0.5) * shake * 0.4
    }
    if (composer && film && post) {
      film.uniforms.uTime.value = now / 1000
      renderPass.scene = activeScene
      composer.render(dt)
    } else {
      renderer.render(activeScene, camera)
    }
  }

  const isJumpKey = (event: KeyboardEvent) =>
    event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW"
  /** チャットの入力中はキーをゲームに使わない */
  const isTyping = (event: KeyboardEvent) => {
    const target = event.target
    return (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT")
    )
  }
  const toLobbyKey = (event: KeyboardEvent) =>
    event.code === "ArrowLeft" || event.code === "KeyA"
      ? "left"
      : event.code === "ArrowRight" || event.code === "KeyD"
        ? "right"
        : event.code === "ArrowUp" || event.code === "KeyW"
          ? "up"
          : event.code === "ArrowDown" || event.code === "KeyS"
            ? "down"
            : null
  const onKeyDown = (event: KeyboardEvent) => {
    if (state === "lobby") {
      // ロビーでは、W・↑ は「奥へ歩く」。跳ぶのはスペースだけ
      if (isTyping(event) || paused) return
      const key = toLobbyKey(event)
      if (key) {
        event.preventDefault()
        lobbyKeys[key] = true
      } else if (event.code === "Space") {
        event.preventDefault()
        if (!event.repeat) press()
      }
      return
    }
    if (!isJumpKey(event) || isTyping(event) || paused) return
    event.preventDefault()
    if (!event.repeat) press()
  }
  const onKeyUp = (event: KeyboardEvent) => {
    const key = toLobbyKey(event)
    if (key) lobbyKeys[key] = false
    if (isJumpKey(event)) release()
  }
  const onPointerDown = (event: PointerEvent) => {
    event.preventDefault()
    if (paused) return
    press()
  }
  window.addEventListener("keydown", onKeyDown)
  window.addEventListener("keyup", onKeyUp)
  canvas.addEventListener("pointerdown", onPointerDown)
  window.addEventListener("pointerup", release)
  window.addEventListener("pointercancel", release)

  reset()
  frame = requestAnimationFrame(loop)

  if (import.meta.env.DEV) {
    // 開発中に、好きなステージをぶつからずに見るための入口
    Object.assign(window, {
      __pictorRunDebug: {
        warp: (value: number) => {
          distance = value
          debugNoHit = true
          stage.warp(value)
          resetSigns()
        },
        give: (kind: ItemKind) => {
          fieldItem.kind = kind
          takeItem()
        },
        setHits: (on: boolean) => {
          debugNoHit = !on
        },
      },
    })
  }

  return {
    setArtworks: (items) => stage.setArtworks(items),
    setMarkers: (next) => {
      markers = [...next].sort((a, b) => a.distance - b.distance)
      if (state === "ready") resetSigns()
    },
    setSound: (sound) => {
      audio.unlock()
      audio.set(sound)
    },
    playSound: (name) => audio.play(name),
    restart: reset,
    enterLobby: () => {
      reset()
      state = "lobby"
      lobbyPosition.x = 0.8
      lobbyPosition.z = 8
      lobbyYaw = Math.PI
      lobbySent.x = 0.8
      lobbySent.z = 8
      lobbySent.y = 0
      loadLobbySky()
      // ぴくたーちゃんと足元の影を、ロビーの場面へ移す
      activeScene = lobbyScene
      lobbyScene.environment = scene.environment
      lobbyScene.add(player, fxPoints, shadow)
      clearFx()
      audio.setSong(1)
      assignAvatars()
    },
    setLobbyInput: (x, z) => {
      lobbyStick.x = clamp(x, -1, 1)
      lobbyStick.z = clamp(z, -1, 1)
    },
    jump: () => {
      if (state === "lobby" && !paused) press()
    },
    setPeers: (peers) => {
      peerList = peers
      assignAvatars()
    },
    setPaused: (value) => {
      paused = value
    },
    dispose: () => {
      disposed = true
      stage.dispose()
      audio.dispose()
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      canvas.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointerup", release)
      window.removeEventListener("pointercancel", release)
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return
        ;(object.geometry as BufferGeometry).dispose()
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material]
        for (const material of materials as Material[]) material.dispose()
      })
      for (const item of disposables) item.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
