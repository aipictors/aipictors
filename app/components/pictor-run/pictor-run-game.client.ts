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
  Color,
  CylinderGeometry,
  DataTexture,
  DirectionalLight,
  DoubleSide,
  Group,
  LoopOnce,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  type Object3D,
  OctahedronGeometry,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  RedFormat,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SkinnedMesh,
  SphereGeometry,
  type Texture,
  Vector3,
  WebGLRenderer,
} from "three"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import {
  createPictorRunAudio,
  type PictorRunSound,
  type PictorRunSoundName,
} from "~/components/pictor-run/pictor-run-audio.client"
import {
  canvasTexture,
  createPictorRunStage,
  grainCanvas,
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
}

export type PictorRunOptions = {
  /** 軽量モード（影なし・粗めの解像度・置くものを減らす） */
  lite: boolean
  sound: PictorRunSound
}

export type PictorRunGame = {
  /** 背景の額ぶちに飾る作品の画像 */
  setArtworks: (urls: string[]) => void
  /** 音量・ミュートを変える */
  setSound: (sound: PictorRunSound) => void
  /** 画面のボタンなどから効果音を鳴らす */
  playSound: (name: PictorRunSoundName) => void
  /** 最初から走り直す */
  restart: () => void
  /** 一時停止（止めている間も画面は描く） */
  setPaused: (paused: boolean) => void
  dispose: () => void
}

type State = "ready" | "running" | "over"

type ObstacleKind = "block" | "tower" | "card" | "bug"

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
const START_SPEED = 7
const MAX_SPEED = 13.5
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
    antialias: !lite,
    alpha: true,
    powerPreference: "high-performance",
  })
  let pixelRatio = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 2)
  renderer.setPixelRatio(pixelRatio)
  /** 影を落とす（重い端末では、走っている途中でやめることがある） */
  let shadows = !lite
  renderer.shadowMap.enabled = shadows
  renderer.shadowMap.type = PCFSoftShadowMap

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
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -17
    sun.shadow.camera.right = 17
    sun.shadow.camera.top = 12
    sun.shadow.camera.bottom = -12
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 60
    sun.shadow.bias = -0.0006
    sun.shadow.normalBias = 0.03
    sun.shadow.intensity = 0.6
  }

  // アニメ調の 3 段階の陰
  const gradientMap = new DataTexture(
    new Uint8Array([165, 225, 255]),
    3,
    1,
    RedFormat,
  )
  gradientMap.minFilter = NearestFilter
  gradientMap.magFilter = NearestFilter
  gradientMap.needsUpdate = true

  const disposables: { dispose: () => void }[] = [gradientMap]
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item)
    return item
  }

  const toon = (color: number, map?: Texture) =>
    track(
      map
        ? new MeshToonMaterial({ color, gradientMap, map })
        : new MeshToonMaterial({ color, gradientMap }),
    )

  // ---- ぴくたーちゃん -------------------------------------------------------
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  const gltf = await loader.loadAsync(modelUrl)
  const model = gltf.scene
  // 書き出しに混ざっている目印の球は使わない
  model.getObjectByName("Icosphere")?.removeFromParent()

  const outlineMaterial = track(
    new MeshBasicMaterial({ color: 0x1a1f4d, side: BackSide }),
  )
  // 法線の向きに少しふくらませた裏面を描いて、ふちどりにする
  outlineMaterial.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "vec3 transformed = position + normalize( normal ) * 0.0042;",
    )
  }

  const skinned: SkinnedMesh[] = []
  model.traverse((object) => {
    if (object instanceof SkinnedMesh) skinned.push(object)
  })
  /** 表情（まばたきなど）を持つ顔のメッシュ */
  let face: SkinnedMesh | null = null
  for (const mesh of skinned) {
    const source = mesh.material as MeshBasicMaterial
    const isFace = mesh.morphTargetDictionary !== undefined
    const material = track(
      new MeshToonMaterial({
        gradientMap,
        map: source.map,
        transparent: isFace,
        depthWrite: !isFace,
      }),
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
      continue
    }

    const outline = new SkinnedMesh(mesh.geometry, outlineMaterial)
    outline.bind(mesh.skeleton, mesh.bindMatrix)
    outline.frustumCulled = false
    mesh.parent?.add(outline)
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
    gradientMap,
    { ambient, sun },
    { lite, shadows, camera },
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
  const blockMaterial = toon(0xffffff, blockTexture)
  const cardGeometry = track(new BoxGeometry(1.0, 1.25, 0.14))
  const cardMaterial = toon(0xffffff, cardTexture)
  const bugBodyGeometry = track(new SphereGeometry(0.34, 16, 12))
  const bugBodyMaterial = toon(0x9b6bff)
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
  const coinMaterial = toon(0xffc93c)
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
    const level = clamp(
      (speed / pace - START_SPEED) / (MAX_SPEED - START_SPEED),
      0,
      1,
    )
    const roll = Math.random()
    const x = SPAWN_X * pace
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
      speed = START_SPEED * pace
      audio.play("start")
      dust(-0.2, 8, 1.2)
      callbacks.onStart()
      return
    }
    if (state !== "running" || jumpsLeft <= 0) return
    if (jumpsLeft === 2 && y <= 0.001) {
      velocity = JUMP_VELOCITY
      stretch = 0.2
      audio.play("jump")
      dust(-0.1, 6, 1)
    } else {
      velocity = DOUBLE_JUMP_VELOCITY
      flipTime = 0
      jumpsLeft = 1
      stretch = 0.16
      audio.play("double")
      sparkle(0, y + 0.5, 0x7ad0ff, 10)
    }
    jumpsLeft -= 1
  }

  const release = () => {
    // 早く離すと低く跳ぶ
    if (state === "running" && velocity > 6) velocity = 6
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
    } else {
      play("run", 0.1)
      actions.run.timeScale = 0.75 + speed * 0.055
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
      speed = Math.min(MAX_SPEED * pace, speed + dt * 0.14 * pace)
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
      untilStep -= dt * (speed / START_SPEED)
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
      if (hitX && hitY) {
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

    for (const coin of coins) {
      if (!coin.active) continue
      coin.x -= move
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

    stage.update(move, dt, time, distance)
    updateFx(dt, move)

    // ぴくたーちゃん
    player.position.y = y
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
    facing.rotation.y = damp(
      facing.rotation.y,
      state === "ready" ? 0.3 : 0.92,
      7,
      dt,
    )
    shadow.position.x = player.position.x
    const shadowScale = clamp(1 - y * 0.16, 0.4, 1)
    shadow.scale.setScalar(shadowScale)

    animate(dt)

    if (state !== "ready") {
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
  const cameraHome = new Vector3()
  const resize = () => {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    renderer.setSize(width, height, false)
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
    // つぶの大きさを、画面の高さに合わせる
    fxMaterial.uniforms.uScale.value =
      (height * renderer.getPixelRatio()) / (2 * tan)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  // 重い端末では、走っている途中で画面を粗くし、それでも重ければ影をやめる
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
    if (pixelRatio > 1.25) {
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
  let disposed = false
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
    }
    camera.position.copy(cameraHome)
    if (shake > 0) {
      shake = Math.max(0, shake - dt * 2.6)
      camera.position.x += (Math.random() - 0.5) * shake * 0.5
      camera.position.y += (Math.random() - 0.5) * shake * 0.4
    }
    renderer.render(scene, camera)
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
  const onKeyDown = (event: KeyboardEvent) => {
    if (!isJumpKey(event) || isTyping(event) || paused) return
    event.preventDefault()
    if (!event.repeat) press()
  }
  const onKeyUp = (event: KeyboardEvent) => {
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
        },
      },
    })
  }

  return {
    setArtworks: (urls) => stage.setArtworks(urls),
    setSound: (sound) => {
      audio.unlock()
      audio.set(sound)
    },
    playSound: (name) => audio.play(name),
    restart: reset,
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
