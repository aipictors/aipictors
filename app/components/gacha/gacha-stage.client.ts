import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AnimationClip,
  AnimationMixer,
  type Bone,
  Box3,
  Color,
  DirectionalLight,
  Group,
  HalfFloatType,
  HemisphereLight,
  type Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Quaternion,
  Scene,
  ShaderMaterial,
  SkinnedMesh,
  SRGBColorSpace,
  type Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import {
  type GachaDirection,
  type GachaHint,
  type GachaItem,
  gachaRarityRank,
  hintOf,
  revealPauseOf,
} from "~/components/gacha/gacha-direction"
import {
  CARD_ASPECT,
  createBrush,
  createEasel,
  createFloatingProps,
  createMagicCircles,
  createOrb,
  createPillar,
  createPlatform,
  createShockwave,
  createSky,
  drawCardBack,
  drawCardFront,
  HINT_COLORS,
  Sparks,
  skyTones,
} from "~/components/gacha/gacha-stage-parts.client"
import {
  createBubbles,
  createClouds,
  createConfetti,
  createNeonLines,
} from "~/components/gacha/gacha-stage-scenery.client"

/**
 * ガチャ演出の舞台（three.js）。景品とレア度を渡すだけで動くので、どのガチャにも使える。
 *
 * 流れ: 登場 → 筆に光を集める（色で予告）→ キャンバスへ放つ → 絵の具がはじける
 *       →（昇格）→（確定カットイン）→ 光の柱 → カードをめくる
 * 時間 t だけで見た目が決まるように作っている（step で 1 コマずつ進めて動画にも書き出せる）
 */

export type GachaStageOptions = {
  canvas: HTMLCanvasElement
  modelUrl: string
  items: readonly GachaItem[]
  direction: GachaDirection
  /** true のときは自分で step を呼ぶ（動画の書き出し用） */
  manual?: boolean
  pixelRatio?: number
  onComplete?: () => void
  /** ぴくたーちゃんのモデルを読み込んだ割合（0〜1） */
  onProgress?: (ratio: number) => void
}

export type GachaStage = {
  /** 演出を飛ばしてカードの場面へ（カードの場面なら全部めくる） */
  skip: () => void
  /** 画面を押したとき: 待ちの場面なら先へ進める */
  tap: () => void
  step: (dt: number) => void
  readonly time: number
  readonly duration: number
  dispose: () => void
}

type PhaseName =
  | "intro"
  | "charge"
  | "flick"
  | "splash"
  | "promote"
  | "cutIn"
  | "finale"
  | "reveal"
type Segment = { name: PhaseName; start: number; end: number }

const smooth = (x: number) => {
  const k = MathUtils.clamp(x, 0, 1)
  return k * k * (3 - 2 * k)
}
const easeOutBack = (x: number) => {
  const k = MathUtils.clamp(x, 0, 1) - 1
  return 1 + 2.4 * k * k * k + 1.4 * k * k
}
/** 行き過ぎを小さくした easeOutBack（カードがふわっと止まる） */
const easeOutSoft = (x: number) => {
  const k = MathUtils.clamp(x, 0, 1) - 1
  return 1 + 1.6 * k * k * k + 0.6 * k * k
}
const easeOutCubic = (x: number) => 1 - (1 - MathUtils.clamp(x, 0, 1)) ** 3
const RAINBOW = [
  "#ff5e7e",
  "#ffb347",
  "#ffe66b",
  "#6ff0a8",
  "#5ec8ff",
  "#8a7bff",
  "#ff8fe0",
].map((c) => new Color(c))
const WHITE = new Color("#fff")
const randomRainbow = () => RAINBOW[Math.floor(Math.random() * RAINBOW.length)]

const loadImage = (url: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    if (!url) return resolve(null)
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })

export async function createGachaStage(
  options: GachaStageOptions,
): Promise<GachaStage> {
  const { canvas, items, direction } = options
  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    preserveDrawingBuffer: options.manual === true,
    powerPreference: "high-performance",
  })
  renderer.setPixelRatio(
    options.pixelRatio ?? Math.min(window.devicePixelRatio || 1, 1.75),
  )
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  const scene = new Scene()
  const camera = new PerspectiveCamera(36, 1, 0.05, 120)
  const hud = new Scene()
  const hudCamera = new OrthographicCamera(-1, 1, 1, -1, -10, 10)

  /* ---- 舞台 ---- */
  const sky = createSky()
  scene.add(sky.mesh)
  const tone = { low: new Color(), high: new Color(), nebula: new Color() }
  const toneTarget = skyTones("base")
  ;[tone.low, tone.high, tone.nebula].forEach((c, i) => c.copy(toneTarget[i]))

  scene.add(new HemisphereLight("#ffffff", "#c4cfff", 1.6))
  const key = new DirectionalLight("#fff4e6", 2.2)
  key.position.set(2, 4, 3)
  scene.add(key)
  const orbLight = new PointLight("#ffffff", 0, 6, 1.6)
  scene.add(orbLight)

  const platform = createPlatform()
  scene.add(platform.group)
  const circles = createMagicCircles()
  scene.add(circles.outer, circles.inner)
  const outerMat = circles.outer.material as ShaderMaterial
  const innerMat = circles.inner.material as ShaderMaterial

  const props = createFloatingProps()
  scene.add(props.group)

  const clouds = createClouds()
  scene.add(clouds.group)
  const neon = createNeonLines()
  scene.add(neon.group)
  const bubbles = createBubbles()
  scene.add(bubbles.group)
  const confetti = createConfetti()
  scene.add(confetti.mesh)

  const easel = createEasel()
  easel.group.position.set(0, 1.5, -0.85)
  scene.add(easel.group)

  const pillar = createPillar(0.55, 9)
  pillar.mesh.position.z = -0.85
  scene.add(pillar.mesh)
  const shock = createShockwave()
  scene.add(shock.mesh)
  const orb = createOrb()
  scene.add(orb.mesh)
  const sparks = new Sparks(1400)
  scene.add(sparks.points)

  /* ---- ぴくたーちゃん ---- */
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  const [gltf, images] = await Promise.all([
    loader.loadAsync(options.modelUrl, (event) => {
      if (event.total > 0) options.onProgress?.(event.loaded / event.total)
    }),
    Promise.all(items.map((item) => loadImage(item.imageUrl))),
  ])
  const model = gltf.scene
  model.getObjectByName("Icosphere")?.removeFromParent()
  let face: SkinnedMesh | null = null
  model.traverse((object) => {
    if (!(object instanceof SkinnedMesh)) return
    object.frustumCulled = false
    const source = object.material as MeshBasicMaterial
    const isFace = object.morphTargetDictionary !== undefined
    object.material = new MeshBasicMaterial({
      map: source.map,
      transparent: isFace,
      depthWrite: !isFace,
      toneMapped: false,
      color: new Color(0.94, 0.94, 0.94),
    })
    source.dispose()
    if (isFace) {
      face = object
      object.renderOrder = 1
    }
  })
  const expressions = [
    "Blink",
    "Joy",
    "Fun",
    "Sorrow",
    "Surprised",
    "MouthClosed",
    "MouthOpen",
  ]
  const setFace = (
    eyes: "open" | "Blink" | "Joy" | "Fun",
    mouth: "none" | "Surprised" | "MouthOpen" | "MouthClosed",
  ) => {
    const target = face as SkinnedMesh | null
    if (!target?.morphTargetInfluences || !target.morphTargetDictionary) return
    for (const name of expressions) {
      const index = target.morphTargetDictionary[name]
      if (index === undefined) continue
      target.morphTargetInfluences[index] =
        name === eyes || name === mouth ? 1 : 0
    }
  }
  // 表情の板は途中の値だと頭の中を通るので混ぜられない。
  // 目が変わるときは一瞬まばたきを挟んで、切り替わりをなめらかに見せる
  type Eyes = "open" | "Blink" | "Joy" | "Fun"
  let wantEyes: Eyes = "open"
  let eyeSwap = 0
  const faceTo = (
    eyes: Eyes,
    mouth: "none" | "Surprised" | "MouthOpen" | "MouthClosed",
    dt: number,
  ) => {
    if (eyes !== wantEyes) {
      if (eyes !== "Blink" && wantEyes !== "Blink") eyeSwap = 0.075
      wantEyes = eyes
    }
    eyeSwap = Math.max(0, eyeSwap - dt)
    setFace(eyeSwap > 0 ? "Blink" : eyes, mouth)
  }

  const mixer = new AnimationMixer(model)
  const clip = (name: string) => {
    const found = AnimationClip.findByName(gltf.animations, name)
    if (!found) throw new Error(`animation not found: ${name}`)
    return mixer.clipAction(found)
  }
  const idle = clip("idle")
  // 待機は少しゆったり（跳ねる動きは使わない）
  idle.timeScale = 0.85
  idle.play()
  mixer.update(0)
  model.updateMatrixWorld(true)
  const bounds = new Box3().setFromObject(model, true)
  // 頭身が高いモデルなので、少し大きめに立たせる
  const fitScale = 1.25 / (bounds.max.y - bounds.min.y)
  const fit = new Group()
  fit.rotation.y = -Math.PI / 2
  fit.scale.setScalar(fitScale)
  fit.position.y = 0.06 - bounds.min.y * fitScale
  fit.add(model)
  const actor = new Group()
  actor.add(fit)
  scene.add(actor)

  const bone = (name: string) => model.getObjectByName(name) as Bone | undefined
  const bones = {
    spine: bone("Spine02"),
    waist: bone("Waist"),
    head: bone("Head"),
    neck: bone("NeckTwist01"),
    rUpper: bone("R_Upperarm"),
    rFore: bone("R_Forearm"),
    rHand: bone("R_Hand"),
    lUpper: bone("L_Upperarm"),
    lFore: bone("L_Forearm"),
    lHand: bone("L_Hand"),
  }
  const parentQ = new Quaternion()
  const addQ = new Quaternion()
  const axisX = new Vector3(1, 0, 0)
  const axisY = new Vector3(0, 1, 0)
  const axisZ = new Vector3(0, 0, 1)
  /** 骨をワールドの軸で回す（骨ごとに向きがばらばらなので、ワールドの軸で考える） */
  const rotateWorld = (
    target: Object3D | undefined,
    axis: Vector3,
    angle: number,
  ) => {
    if (!target?.parent || angle === 0) return
    target.parent.getWorldQuaternion(parentQ)
    addQ.setFromAxisAngle(axis, angle)
    const local = parentQ.clone().invert().multiply(addQ).multiply(parentQ)
    target.quaternion.premultiply(local)
    target.updateMatrixWorld(true)
  }
  const worldPos = (target: Object3D | undefined, out = new Vector3()) =>
    target ? target.getWorldPosition(out) : out.set(0, 0, 0)
  // 腕を横に上げる向き（右腕は画面の左にある）
  actor.updateMatrixWorld(true)
  const rSide = Math.sign(worldPos(bones.rUpper).x) || -1
  const lSide = -rSide

  /** 指（中指の骨はない）。待機アニメは指を動かさないので、毎コマ元に戻してから曲げる */
  const handOf = (s: "R" | "L") => ({
    hand: bone(`${s}_Hand`),
    fingers: ["Index", "Ring", "Pinky"].map((f) =>
      [1, 2, 3].map((j) => bone(`${s}_${f}${j}`)),
    ),
    thumb: [1, 2, 3].map((j) => bone(`${s}_Thumb${j}`)),
    mirror: s === "R" ? 1 : -1,
  })
  const hands = [handOf("R"), handOf("L")]
  const fingerRest = hands.flatMap((h) =>
    [...h.fingers.flat(), ...h.thumb].flatMap((b) =>
      b ? [{ bone: b, rest: b.quaternion.clone() }] : [],
    ),
  )
  const fa = new Vector3()
  const fb = new Vector3()
  const across = new Vector3()
  const palm = new Vector3()
  const curlAxis = new Vector3()
  const wristQ = new Quaternion()
  /** 元の手首は甲の側へ反っているので、前腕のまっすぐ先へ向け直す */
  const straightenWrist = (
    fore: Object3D | undefined,
    h: (typeof hands)[number],
  ) => {
    const ring = h.fingers[1][0]
    if (!fore || !h.hand || !ring) return
    const foreDir = worldPos(h.hand, fa).sub(worldPos(fore, fb)).normalize()
    const handDir = worldPos(ring, across).sub(worldPos(h.hand, fb)).normalize()
    wristQ.setFromUnitVectors(handDir, foreDir)
    const angle = 2 * Math.acos(Math.min(1, Math.abs(wristQ.w)))
    if (angle < 1e-4) return
    curlAxis.set(wristQ.x, wristQ.y, wristQ.z).normalize()
    if (wristQ.w < 0) curlAxis.negate()
    rotateWorld(h.hand, curlAxis, angle * 0.85)
  }
  /** 指を曲げる（0 = 少し開いた手、1 = にぎりこぶし） */
  const curlHand = (h: (typeof hands)[number], grip: number) => {
    const [index, , pinky] = h.fingers
    if (!h.hand || !index[0] || !pinky[0]) return
    across
      .subVectors(worldPos(pinky[0], fa), worldPos(index[0], fb))
      .normalize()
    const amount = grip * 1.4
    for (const chain of h.fingers) {
      chain.forEach((b, j) => {
        const from = chain[Math.min(j, 1)]
        const to = chain[Math.min(j + 1, 2)]
        if (!b || !from || !to) return
        const dir = worldPos(to, fa).sub(worldPos(from, fb)).normalize()
        curlAxis.copy(across).addScaledVector(dir, -across.dot(dir)).normalize()
        rotateWorld(b, curlAxis, -h.mirror * amount * (j === 0 ? 0.9 : 1.1))
      })
    }
    // 親指は手のひらの方へ倒す
    palm
      .subVectors(worldPos(index[0], fa), worldPos(h.hand, fb))
      .normalize()
      .cross(across)
      .normalize()
    h.thumb.forEach((b, j) => {
      const from = h.thumb[Math.min(j, 1)]
      const to = h.thumb[Math.min(j + 1, 2)]
      if (!b || !from || !to) return
      const dir = worldPos(to, fa).sub(worldPos(from, fb)).normalize()
      curlAxis.crossVectors(dir, palm).normalize()
      rotateWorld(b, curlAxis, -h.mirror * grip * 0.7 * (j === 0 ? 0.6 : 1))
    })
  }

  /** ばねで追いかける姿勢のつまみ（ぬるっと動かす） */
  const poseKeys = [
    "rSide",
    "rFwd",
    "rElbow",
    "rBend",
    "rGrip",
    "lSide",
    "lFwd",
    "lElbow",
    "lBend",
    "lTwist",
    "lGrip",
    "headUp",
    "headRoll",
    "headYaw",
    "lean",
    "twist",
    "swirl",
    "wave",
  ] as const
  type PoseKey = (typeof poseKeys)[number]
  type Pose = Record<PoseKey, number>
  const zeroPose = (): Pose =>
    Object.fromEntries(poseKeys.map((k) => [k, 0])) as Pose
  const pose = zeroPose()
  const poseVel = zeroPose()

  const brush = createBrush(HINT_COLORS[direction.hint])
  brush.group.scale.setScalar(0.85)
  scene.add(brush.group)

  /* ---- カード ---- */
  // カードの後ろを暗くして、カードを目立たせる
  const backdropMat = new MeshBasicMaterial({
    color: "#05020c",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    toneMapped: false,
  })
  const backdrop = new Mesh(new PlaneGeometry(20, 20), backdropMat)
  backdrop.position.set(0, 0.95, 1.1)
  scene.add(backdrop)
  const cardBackTextures = items.map((item) => drawCardBack(item.rarity))
  const cardFrontTextures = items.map((item, i) =>
    drawCardFront(item, images[i]),
  )
  const cards = items.map((item, i) => {
    const group = new Group()
    const front = new Mesh(
      new PlaneGeometry(CARD_ASPECT, 1),
      new MeshBasicMaterial({
        map: cardFrontTextures[i],
        transparent: true,
        toneMapped: false,
      }),
    )
    const back = new Mesh(
      new PlaneGeometry(CARD_ASPECT, 1),
      new MeshBasicMaterial({
        map: cardBackTextures[i],
        transparent: true,
        toneMapped: false,
      }),
    )
    back.rotation.y = Math.PI
    front.position.z = 0.002
    back.position.z = -0.002
    const aura = createOrb()
    // 後光はカードと一緒に回すと裏返したときに手前へ来るので、カードの外に置いて毎コマ後ろへ付ける
    aura.material.uniforms.uCore.value = 0.25
    aura.mesh.visible = false
    scene.add(aura.mesh)
    aura.material.uniforms.uColor.value.copy(HINT_COLORS[hintOf(item.rarity)])
    aura.material.uniforms.uRainbow.value = item.rarity === "UR" ? 1 : 0
    group.add(front, back)
    group.visible = false
    scene.add(group)
    return { group, aura, item, home: new Vector3(), size: 1 }
  })

  /* ---- 画面に重ねるもの（カットイン・閃光） ---- */
  const quad = (material: Material) => {
    const mesh = new Mesh(new PlaneGeometry(2, 2), material)
    hud.add(mesh)
    return mesh
  }
  const blackMat = new MeshBasicMaterial({
    color: "#000",
    transparent: true,
    opacity: 0,
    depthTest: false,
    toneMapped: false,
  })
  const black = quad(blackMat)
  // 確定の瞬間は文字を出さず、画面のふちを景品の色の光でふちどる（UR は虹、SSR は金）
  const glowMat = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uShow: { value: 0 },
      uRainbow: { value: 0 },
      uColor: { value: new Color() },
      uAspect: { value: 1 },
    },
    vertexShader:
      /* glsl */ "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",
    fragmentShader: /* glsl */ `
      uniform float uTime;uniform float uShow;uniform float uRainbow;uniform vec3 uColor;uniform float uAspect;varying vec2 vUv;
      vec3 hue(float h){return clamp(abs(mod(h*6.0+vec3(0,4,2),6.0)-3.0)-1.0,0.0,1.0);}
      void main(){
        if(uShow<0.001){discard;}
        vec2 p=vUv-0.5;p.x*=uAspect;
        float e=min(min(vUv.x,1.0-vUv.x)*uAspect,min(vUv.y,1.0-vUv.y));
        float glow=exp(-e/0.09)*0.9+exp(-e/0.025)*0.35;
        float ang=atan(p.y,p.x);
        vec3 rb=mix(hue(ang/6.2831-uTime*0.06),vec3(1.0),0.3);
        vec3 col=mix(uColor,rb,uRainbow);
        // ふちをゆっくり回る光
        float sweep=0.75+0.25*sin(ang*2.0-uTime*1.2);
        gl_FragColor=vec4(col,clamp(glow*sweep,0.0,1.0)*uShow*0.85);
      }`,
  })
  const glowEdge = quad(glowMat)
  glowEdge.renderOrder = 2
  const flashMat = new MeshBasicMaterial({
    color: "#fff",
    transparent: true,
    opacity: 0,
    depthTest: false,
    blending: AdditiveBlending,
    toneMapped: false,
  })
  const flash = quad(flashMat)
  flash.renderOrder = 4

  /* ---- 描画の流れ ---- */
  const composer = new EffectComposer(renderer)
  composer.renderTarget1.texture.type = HalfFloatType
  composer.renderTarget2.texture.type = HalfFloatType
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new Vector2(256, 256), 0.9, 0.55, 1.0)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  /* ---- 段取り ---- */
  const topRank = gachaRarityRank(direction.top)
  const segments: Segment[] = []
  let cursor = 0
  const push = (name: PhaseName, length: number) => {
    segments.push({ name, start: cursor, end: cursor + length })
    cursor += length
  }
  push("intro", 1.5)
  push("charge", 2.0)
  push("flick", 0.5)
  push("splash", 1.1)
  if (direction.promoteTo) push("promote", 1.4)
  if (direction.cutIn) push("cutIn", 2.4)
  push("finale", topRank >= 3 ? 1.5 : topRank >= 2 ? 0.9 : 0.5)
  const revealStart = cursor
  // カードは 1 枚ずつ飛んできて並び、低いレア度からめくる。SSR 以上は最後に、ためてからめくる
  const CARD_ENTER_GAP = 0.08
  const CARD_ENTER_TIME = 0.6
  const enterAt = items.map((_, i) => revealStart + 0.5 + i * CARD_ENTER_GAP)
  const flipAt: number[] = new Array(items.length).fill(0)
  {
    const order = items
      .map((item, i) => ({ i, rank: gachaRarityRank(item.rarity) }))
      .sort((a, b) =>
        a.rank >= 3 || b.rank >= 3 ? a.rank - b.rank || a.i - b.i : a.i - b.i,
      )
    let tf =
      revealStart +
      0.5 +
      (items.length - 1) * CARD_ENTER_GAP +
      CARD_ENTER_TIME +
      0.25
    order.forEach(({ i, rank }, n) => {
      if (rank >= 3) tf += rank >= 4 ? 0.75 : 0.55 // めくる前にためる
      flipAt[i] = tf
      if (n < order.length - 1) tf += revealPauseOf(items[i].rarity)
    })
    push("reveal", tf + 1.0 - revealStart)
  }
  const duration = cursor
  const segmentAt = (t: number) =>
    segments.find((s) => t < s.end) ?? segments[segments.length - 1]
  const seg = (name: PhaseName) => segments.find((s) => s.name === name)
  const progress = (name: PhaseName, t: number) => {
    const s = seg(name)
    return s ? MathUtils.clamp((t - s.start) / (s.end - s.start), 0, 1) : 0
  }
  const inPhase = (name: PhaseName, t: number) => {
    const s = seg(name)
    return s !== undefined && t >= s.start && t < s.end
  }

  /** いま見せている色（昇格で変わる） */
  let shownHint: GachaHint = direction.hint
  const colorOf = (hint: GachaHint) => HINT_COLORS[hint]
  const setTone = (hint: GachaHint | "base") => {
    const next = skyTones(hint)
    toneTarget[0].copy(next[0])
    toneTarget[1].copy(next[1])
    toneTarget[2].copy(next[2])
  }

  /* ---- カードの並べ方（画面の縦横に合わせる） ---- */
  const revealCamera = {
    pos: new Vector3(0, 0.95, 3.4),
    target: new Vector3(0, 0.95, 0),
  }
  const layoutCards = () => {
    const distance = revealCamera.pos.z - 1.3
    const viewH = 2 * distance * Math.tan(MathUtils.degToRad(camera.fov / 2))
    const viewW = viewH * camera.aspect
    const n = cards.length
    const maxH = n === 1 ? viewH * 0.5 : viewH * 0.86
    const maxW = viewW * 0.92
    const GAP = 1.12
    // 行ごとの枚数はできるだけそろえ、余りはまんなかの行に寄せる（10 枚なら 3・4・3 や 5・5）
    let best = { rows: 1, counts: [n], h: 0 }
    for (let rows = 1; rows <= n; rows++) {
      const base = Math.floor(n / rows)
      const extra = n - base * rows
      const mid = (rows - 1) / 2
      const byCenter = Array.from({ length: rows }, (_, r) => r).sort(
        (a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b,
      )
      const counts = new Array(rows).fill(base)
      for (let e = 0; e < extra; e++) counts[byCenter[e]] += 1
      const cols = Math.max(...counts)
      const h = Math.min(maxH / rows / GAP, maxW / cols / GAP / CARD_ASPECT)
      if (h > best.h * 1.001) best = { rows, counts, h }
    }
    let i = 0
    best.counts.forEach((inRow, row) => {
      for (let col = 0; col < inRow; col++, i++) {
        const x = (col - (inRow - 1) / 2) * best.h * CARD_ASPECT * GAP
        const y = ((best.rows - 1) / 2 - row) * best.h * GAP
        cards[i].home.set(x, revealCamera.target.y + y, 1.3)
        cards[i].size = best.h
      }
    })
  }

  const resize = () => {
    const width = canvas.clientWidth || canvas.width || 1
    const height = canvas.clientHeight || canvas.height || 1
    renderer.setSize(width, height, false)
    composer.setSize(width, height)
    bloom.resolution.set(width / 2, height / 2)
    camera.aspect = width / height
    // 縦長の画面ほど引いて広く見せる
    camera.fov = camera.aspect < 1 ? 36 + (1 - camera.aspect) * 30 : 36
    camera.updateProjectionMatrix()
    const aspect = width / height
    hudCamera.left = -aspect
    hudCamera.right = aspect
    hudCamera.updateProjectionMatrix()
    black.scale.set(aspect, 1, 1)
    flash.scale.set(aspect, 1, 1)
    glowMat.uniforms.uAspect.value = aspect
    layoutCards()
  }
  const resizeObserver =
    typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize)
  resizeObserver?.observe(canvas)
  resize()

  /* ---- 1 コマごと ---- */
  let time = 0
  let lastTime = -1
  let completed = false
  let shake = 0
  let untilBlink = 1.5
  let brushShow = 1
  const tmp = new Vector3()
  const tip = new Vector3()
  const handPos = new Vector3()
  const forePos = new Vector3()
  const camPos = new Vector3()
  const camTarget = new Vector3()
  const orbFrom = new Vector3()
  const easelCenter = new Vector3(0, 1.5, -0.84)
  const crossed = (at: number) => lastTime < at && time >= at

  const poseTarget = (t: number): Pose => {
    const p = zeroPose()
    // 右手はいつも筆をにぎる。左手はふだん軽く指を曲げておく
    p.rGrip = 1
    p.lGrip = 0.3
    // 腕を肩より上に上げると大きな袖と上着ごと崩れるので、どのポーズも肩の高さまでにする
    /** 左手をひじから立てて、手を振る */
    const waveLeft = (k: number) => {
      p.lSide = 0.95 * k
      p.lFwd = 0.3 * k
      p.lBend = 1.6 * k
      p.wave = k
      p.lTwist = 1.2 * k
      p.lGrip = 0.05
    }
    /** 両手のこぶしを胸の前に（喜ぶ） */
    const fists = (k = 1) => {
      p.rSide = 0.25
      p.rFwd = 0.35 * k
      p.rElbow = 0.4 + 1.5 * k
      p.lSide = 0.25
      p.lFwd = 0.35 * k
      p.lElbow = 0.35 + 1.5 * k
      p.lGrip = 0.3 + 0.5 * k
    }
    /** 力を抜いて立つ */
    const rest = () => {
      p.rSide = 0.2
      p.rElbow = 0.4
      p.lSide = 0.2
      p.lElbow = 0.35
      p.headRoll = 0.06
    }
    rest()
    const phase = segmentAt(t).name
    if (phase === "intro") {
      // 手を振ってあいさつして、筆を構える前に手を下ろす
      const k = progress("intro", t)
      waveLeft(smooth(k * 3) * (1 - smooth((k - 0.72) / 0.28)))
      p.rSide = 0.15
      p.headRoll = 0.1
      p.headYaw = 0.08
    } else if (phase === "charge") {
      // 筆を胸の前で立てて、小さく円を描きながら光をためる
      const k = smooth(progress("charge", t) * 2.5)
      p.rSide = 0.2 + 0.25 * k
      p.rFwd = 0.7 * k
      p.rElbow = 0.4 + 1.0 * k
      p.swirl = smooth(progress("charge", t) * 2) * 0.6
      p.headUp = 0.2 * k
      p.lSide = 0.25
      p.lFwd = 0.4 * k
      p.lElbow = 0.35 + 1.2 * k
      p.lGrip = 0.3 + 0.45 * k
    } else if (phase === "flick") {
      // 筆を肩の高さまで引いて、キャンバスへ振る
      const k = progress("flick", t)
      p.rFwd = k < 0.35 ? 1.3 : 0.75
      p.rElbow = k < 0.35 ? 1.4 : 0.25
      p.rSide = 0.3
      p.lean = k < 0.35 ? -0.06 : 0.05
      p.twist = k < 0.35 ? -0.1 : 0.08
      p.headUp = 0.2
      p.lSide = 0.3
      p.lFwd = 0.2
      p.lElbow = 0.6
    } else if (phase === "splash" || phase === "promote") {
      // 見上げて、うしろのキャンバスを見る
      p.rFwd = 0.5
      p.rElbow = 0.8
      p.rSide = 0.3
      p.lSide = 0.3
      p.lFwd = 0.3
      p.lElbow = 0.7
      p.headUp = 0.35
      p.headYaw = 0.25
      p.twist = 0.2
      // 昇格したら両手のこぶしを胸の前でぎゅっと
      if (phase === "promote" && progress("promote", t) >= 0.62) {
        fists()
        p.headUp = 0.3
        p.lean = -0.05
      }
    } else if (phase === "cutIn") {
      // びっくり（両手を口もとへ）→ うれしくて胸の前でこぶし
      const k = progress("cutIn", t)
      if (k < 0.45) {
        p.rSide = -0.15
        p.lSide = -0.15
        p.rFwd = 0.5
        p.lFwd = 0.5
        p.rElbow = 2.3
        p.lElbow = 2.3
        p.rBend = 0.35
        p.lBend = 0.35
        p.lGrip = 0.45
        p.lean = -0.08
      } else {
        fists()
        p.headRoll = topRank >= 4 ? 0.14 : 0.1
      }
    } else if (phase === "finale") {
      const k = progress("finale", t)
      if (topRank >= 3) {
        // 右手は胸の前でこぶし、左手で手を振る
        fists()
        waveLeft(smooth(k * 2))
        p.headRoll = 0.12
      } else {
        waveLeft(smooth(k * 2))
        p.rSide = 0.15
        p.headRoll = 0.1
      }
    }
    // カードを見せている間（reveal）は静かに立つ
    return p
  }

  const applyPose = (t: number, dt: number) => {
    const target = poseTarget(t)
    // ばね（減衰つき）で姿勢を追いかける
    for (const k of poseKeys) {
      // 揺り戻しが出ないように臨界減衰（振り下ろすときだけ速く）
      const stiffness = k === "rFwd" && inPhase("flick", t) ? 240 : 55
      const damping = 2 * Math.sqrt(stiffness)
      const a = (target[k] - pose[k]) * stiffness - poseVel[k] * damping
      poseVel[k] += a * dt
      pose[k] += poseVel[k] * dt
    }
    const breathe = Math.sin(t * 2.2)
    rotateWorld(bones.waist, axisX, pose.lean * 0.6)
    rotateWorld(bones.waist, axisY, pose.twist * 0.6)
    rotateWorld(bones.spine, axisX, pose.lean * 0.5 + breathe * 0.015)
    rotateWorld(bones.spine, axisY, pose.twist * 0.5)
    // 腕は「横へ上げる → 前へ上げる → ひじを前へ曲げる → ひじを上へ曲げる」の順に回す
    const swirlA = t * 3.6
    rotateWorld(
      bones.rUpper,
      axisZ,
      rSide * (pose.rSide + Math.cos(swirlA) * 0.12 * pose.swirl),
    )
    rotateWorld(
      bones.rUpper,
      axisX,
      -pose.rFwd - Math.sin(swirlA) * 0.12 * pose.swirl,
    )
    rotateWorld(bones.rFore, axisX, -pose.rElbow)
    rotateWorld(bones.rFore, axisZ, rSide * pose.rBend)
    rotateWorld(bones.lUpper, axisZ, lSide * pose.lSide)
    rotateWorld(bones.lUpper, axisX, -pose.lFwd)
    rotateWorld(bones.lFore, axisX, -pose.lElbow)
    // 手のひらを前へ向ける（前腕の向きを軸にひねる）
    if (pose.lTwist !== 0 && bones.lHand && bones.lFore)
      rotateWorld(
        bones.lFore,
        worldPos(bones.lHand, fa).sub(worldPos(bones.lFore, fb)).normalize(),
        lSide * pose.lTwist,
      )
    // 手を振るときは、立てた前腕を左右にゆらす
    rotateWorld(
      bones.lFore,
      axisZ,
      lSide * (pose.lBend + Math.sin(t * 6) * 0.22 * pose.wave),
    )
    straightenWrist(bones.rFore, hands[0])
    straightenWrist(bones.lFore, hands[1])
    for (const f of fingerRest) {
      f.bone.quaternion.copy(f.rest)
      f.bone.updateMatrixWorld(true)
    }
    curlHand(hands[0], pose.rGrip)
    curlHand(hands[1], pose.lGrip)
    // 頭
    rotateWorld(bones.head, axisX, -pose.headUp + breathe * 0.01)
    rotateWorld(
      bones.head,
      axisZ,
      pose.headRoll * (0.5 * Math.sin(t * 1.1 + 0.5) + 0.5),
    )
    rotateWorld(bones.head, axisY, pose.headYaw * 0.7 * Math.sin(t * 0.8))
  }

  const cameraAt = (t: number) => {
    const phase = segmentAt(t).name
    const head = worldPos(bones.head, tmp)
    if (phase === "intro") {
      const k = smooth(progress("intro", t))
      camPos.set(
        Math.sin(k * 0.6 - 0.6) * 1.6,
        MathUtils.lerp(2.6, 1.0, k),
        MathUtils.lerp(7, 3.0, k),
      )
      camTarget.set(0, MathUtils.lerp(1.3, 0.85, k), 0)
    } else if (phase === "charge") {
      const k = smooth(progress("charge", t))
      camPos.set(
        MathUtils.lerp(0, 0.9, k),
        MathUtils.lerp(1.0, 0.85, k),
        MathUtils.lerp(3.0, 2.3, k),
      )
      camTarget.set(0, MathUtils.lerp(0.85, 1.08, k), 0)
    } else if (phase === "flick" || phase === "splash" || phase === "promote") {
      const k = smooth(progress("flick", t) * 0.5 + progress("splash", t) * 0.5)
      camPos.set(
        MathUtils.lerp(0.9, 0.15, k),
        MathUtils.lerp(0.85, 1.0, k),
        MathUtils.lerp(2.5, 3.1, k),
      )
      camTarget.set(
        0,
        MathUtils.lerp(0.95, 1.12, k),
        MathUtils.lerp(0, -0.4, k),
      )
    } else if (phase === "cutIn") {
      const k = progress("cutIn", t)
      const z =
        k < 0.45
          ? MathUtils.lerp(0.5, 0.36, smooth(k / 0.45))
          : MathUtils.lerp(0.36, 1.1, smooth((k - 0.42) / 0.3))
      // 縦長の画面では横がせまいので、少し引いて顔の横が切れないようにする
      const portrait = Math.max(1, 0.9 / camera.aspect)
      camPos.set(head.x + 0.03, head.y + 0.1, head.z + z * portrait)
      camTarget.set(
        head.x,
        head.y + 0.08 - (k < 0.42 ? 0 : 0.17 * smooth((k - 0.42) / 0.3)),
        head.z,
      )
    } else if (phase === "finale") {
      const k = smooth(progress("finale", t))
      camPos.set(
        Math.sin(k * 0.8) * 0.8,
        MathUtils.lerp(1.0, 1.15, k),
        MathUtils.lerp(2.4, 3.2, k),
      )
      camTarget.set(0, MathUtils.lerp(0.88, 1.0, k), 0)
    } else {
      const k = smooth((t - revealStart) / 0.8)
      camPos.lerpVectors(
        new Vector3(Math.sin(0.8) * 0.8, 1.15, 3.4),
        revealCamera.pos,
        k,
      )
      camTarget.lerpVectors(new Vector3(0, 0.9, 0), revealCamera.target, k)
    }
    camera.position.copy(camPos)
    if (shake > 0)
      camera.position.add(
        tmp.set(Math.sin(t * 91) * shake, Math.cos(t * 77) * shake, 0),
      )
    camera.lookAt(camTarget)
  }

  const update = (dt: number) => {
    time = Math.min(duration + 60, time + dt)
    const t = time
    const phase = segmentAt(t).name
    const hintColor = colorOf(shownHint)
    const rainbow = shownHint === "rainbow" ? 1 : 0

    // 時間で起きること
    if (t < 0.02 && lastTime < 0)
      sparks.drift(new Vector3(0, 0, 0), new Color("#cdb8ff"), 120)
    if (Math.floor(t * 3) !== Math.floor(lastTime * 3))
      sparks.drift(
        new Vector3(0, 0, 0),
        shownHint === "rainbow"
          ? randomRainbow()
          : new Color("#cdb8ff").lerp(hintColor, 0.5),
        18,
      )
    const charge = seg("charge")
    if (
      charge &&
      t >= charge.start &&
      t < charge.end &&
      Math.floor(t * 20) !== Math.floor(lastTime * 20)
    ) {
      sparks.gather(tip, rainbow ? randomRainbow() : hintColor, 6, 0.7)
    }
    if (charge && crossed(charge.start + 0.4)) setTone(shownHint)
    const splash = seg("splash")
    if (splash && crossed(splash.start)) {
      shake = 0.02
      sparks.burst(easelCenter, rainbow ? randomRainbow : hintColor, 170, 2.2, {
        size: 0.05,
        up: 0.2,
      })
      flashMat.opacity = 0.25
    }
    const promote = seg("promote")
    if (
      promote &&
      direction.promoteTo &&
      crossed(
        promote.start + promote.end * 0 + (promote.end - promote.start) * 0.62,
      )
    ) {
      shownHint = direction.promoteTo
      setTone(shownHint)
      brush.bristleMaterial.color.copy(colorOf(shownHint))
      brush.bristleMaterial.emissive.copy(colorOf(shownHint))
      shake = 0.04
      flashMat.opacity = 0.45
      sparks.burst(
        easelCenter,
        shownHint === "rainbow" ? randomRainbow : colorOf(shownHint),
        260,
        3,
        { size: 0.06, up: 0.3 },
      )
    }
    const cut = seg("cutIn")
    if (cut && crossed(cut.start + (cut.end - cut.start) * 0.45)) {
      // 確定の瞬間。粒は顔にかからないよう頭の後ろから広げる
      // 白ではなく景品の色でひかる
      flashMat.opacity = 0.5
      flashMat.color.copy(colorOf(hintOf(direction.top))).lerp(WHITE, 0.45)
      shake = 0.015
      sparks.burst(
        worldPos(bones.head, new Vector3()).add(tmp.set(0, 0.05, -0.25)),
        direction.top === "UR" ? randomRainbow : colorOf("gold"),
        150,
        1.6,
        { size: 0.025, up: 0.3 },
      )
    }
    const finale = seg("finale")
    if (finale && crossed(finale.start)) {
      if (topRank >= 3) {
        shake = topRank >= 4 ? 0.03 : 0.015
        flashMat.opacity = topRank >= 4 ? 0.4 : 0.25
        sparks.burst(
          new Vector3(0, 0.2, -0.3),
          shownHint === "rainbow" ? randomRainbow : hintColor,
          topRank >= 4 ? 240 : 150,
          2.6,
          { size: 0.05, up: 1.4 },
        )
      }
    }
    if (crossed(revealStart)) setTone(topRank >= 3 ? shownHint : "base")
    cards.forEach((card, i) => {
      const rank = gachaRarityRank(card.item.rarity)
      if (crossed(flipAt[i])) {
        // 粒はカードの後ろから出して、絵や文字にかぶらないようにする
        if (rank >= 2)
          sparks.burst(
            tmp.copy(card.home).setZ(card.home.z - 0.12),
            card.item.rarity === "UR"
              ? randomRainbow
              : colorOf(hintOf(card.item.rarity)),
            rank >= 4 ? 170 : rank === 3 ? 110 : 36,
            rank >= 3 ? 1.6 : 0.9,
            { size: 0.03, up: 0.1 },
          )
        if (rank >= 3) {
          flashMat.opacity = Math.max(flashMat.opacity, rank >= 4 ? 0.3 : 0.16)
          shake = rank >= 4 ? 0.015 : 0.008
        }
      }
    })
    if (!completed && t >= duration) {
      completed = true
      options.onComplete?.()
    }

    // ぴくたーちゃん
    mixer.update(dt)
    actor.updateMatrixWorld(true)
    applyPose(t, Math.min(dt, 1 / 30))
    untilBlink -= dt
    if (untilBlink < -0.12) untilBlink = 1.6 + Math.random() * 2.6
    const cutK = progress("cutIn", t)
    const blinkOr = (): Eyes => (untilBlink < 0 ? "Blink" : "open")
    if (phase === "cutIn")
      faceTo(
        cutK < 0.45 ? blinkOr() : "Joy",
        cutK < 0.45 ? "Surprised" : "MouthOpen",
        dt,
      )
    else if (phase === "promote")
      faceTo(
        progress("promote", t) < 0.62 ? "open" : "Fun",
        progress("promote", t) < 0.62 ? "Surprised" : "MouthOpen",
        dt,
      )
    else if (phase === "charge" && progress("charge", t) > 0.55)
      faceTo("Fun", "MouthClosed", dt)
    else if (phase === "flick") faceTo("Joy", "MouthOpen", dt)
    else if (phase === "finale" && topRank >= 2) faceTo("Joy", "MouthOpen", dt)
    else if (phase === "intro") faceTo(blinkOr(), "MouthOpen", dt)
    else faceTo(blinkOr(), "MouthClosed", dt)

    // 筆（右手に持たせる）
    // にぎったこぶしの中に柄を通し、人さし指の側へ毛先を出す
    worldPos(bones.rHand, handPos)
    worldPos(bones.rFore, forePos)
    const [rIndex, , rPinky] = hands[0].fingers
    const dir = tmp.subVectors(handPos, forePos).normalize()
    const out = fb
      .subVectors(worldPos(rIndex[0], fa), worldPos(rPinky[0], fb))
      .normalize()
    dir.multiplyScalar(0.45).add(out).normalize()
    // 曲げた指の輪のまんなか
    const grip = worldPos(rIndex[0], fa)
      .add(worldPos(rIndex[2], forePos))
      .add(worldPos(rPinky[0], forePos))
      .add(worldPos(rPinky[2], forePos))
      .multiplyScalar(0.25)
    brush.group.position.copy(grip).addScaledVector(dir, 0.08)
    brush.group.quaternion.setFromUnitVectors(axisY, dir)
    // 顔のアップ（確定カットイン）では筆が顔の前を横切るので、光にしてしまう
    const brushWant =
      phase === "cutIn" || (phase === "reveal" && t > revealStart + 0.3) ? 0 : 1
    // カットインはカメラが切り替わるのですぐ消し、戻すときはゆっくり
    if (phase === "cutIn") brushShow = 0
    brushShow +=
      (brushWant - brushShow) * Math.min(1, dt * (brushWant ? 6 : 14))
    brush.group.scale.setScalar(0.85 * Math.max(0.001, brushShow))
    brush.group.visible = brushShow > 0.02
    tip.copy(brush.group.position).addScaledVector(dir, 0.12)

    // 光の玉: 集める → 飛ぶ → 消える
    const orbU = orb.material.uniforms
    orbU.uTime.value = t
    orbU.uColor.value.copy(hintColor)
    orbU.uRainbow.value = rainbow
    if (phase === "charge") {
      const k = progress("charge", t)
      orb.mesh.position.copy(tip)
      orb.mesh.scale.setScalar(
        0.08 + 0.32 * smooth(k * 1.4) + Math.sin(t * 30) * 0.01 * k,
      )
      orbU.uIntensity.value = smooth(k * 3)
      orbFrom.copy(tip)
    } else if (phase === "flick") {
      const k = easeOutCubic(progress("flick", t))
      orb.mesh.position.lerpVectors(orbFrom, easelCenter, k)
      orb.mesh.position.y += Math.sin(k * Math.PI) * 0.35
      orb.mesh.scale.setScalar(0.4 - 0.15 * k)
      orbU.uIntensity.value = 1
      if (Math.floor(t * 60) !== Math.floor(lastTime * 60))
        sparks.burst(
          orb.mesh.position,
          rainbow ? randomRainbow : hintColor,
          6,
          0.3,
          { life: 0.5, size: 0.04, up: 0 },
        )
    } else if (phase === "splash" || phase === "promote") {
      orb.mesh.position.copy(easelCenter).add(tmp.set(0, 0, 0.05))
      const k = phase === "promote" ? progress("promote", t) : 0
      orb.mesh.scale.setScalar(
        phase === "promote"
          ? 0.5 +
              Math.sin(t * 24) * 0.04 * (k < 0.62 ? k : 0) +
              0.4 * smooth((k - 0.62) / 0.1)
          : 0.6 * (1 - progress("splash", t)) + 0.3,
      )
      // キャンバスに当たった光は白く飛ばさず、すぐに絵の具へ譲る
      orbU.uIntensity.value =
        phase === "promote"
          ? k < 0.62
            ? 0.35 + k * 0.6
            : Math.max(0, 0.85 - (k - 0.62) * 2.2)
          : 0.7 * (1 - progress("splash", t) * 0.7)
    } else {
      orbU.uIntensity.value = Math.max(0, orbU.uIntensity.value - dt * 2)
    }
    orbLight.position.copy(orb.mesh.position)
    orbLight.color.copy(hintColor)
    orbLight.intensity = orbU.uIntensity.value * 3

    // キャンバス
    const easelU = easel.material.uniforms
    easelU.uTime.value = t
    easelU.uColor.value.copy(hintColor)
    easelU.uRainbow.value = rainbow
    const splashK = progress("splash", t)
    easelU.uProgress.value =
      splash && t >= splash.start
        ? easeOutBack(splashK) * (phase === "reveal" ? 1 : 1)
        : 0
    easelU.uFlash.value =
      phase === "promote"
        ? Math.max(0, Math.sin(progress("promote", t) * 40)) *
          0.25 *
          progress("promote", t)
        : 0
    easel.group.position.y = 1.5 + Math.sin(t * 1.1) * 0.015
    if (phase === "promote" && progress("promote", t) < 0.62)
      easel.group.position.x =
        Math.sin(t * 70) * 0.012 * progress("promote", t) * 2

    // 魔法陣・空
    const glow =
      phase === "intro"
        ? smooth(progress("intro", t)) * 0.7
        : phase === "charge"
          ? 0.6 + progress("charge", t) * 0.45
          : phase === "reveal"
            ? 0.45
            : 0.9
    for (const [mat, k] of [
      [outerMat, 1],
      [innerMat, 1.2],
    ] as const) {
      const u = mat.uniforms
      u.uTime.value = t
      u.uColor.value.lerp(
        phase === "intro" ? new Color("#b9a0ff") : hintColor,
        Math.min(1, dt * 3),
      )
      u.uRainbow.value = MathUtils.lerp(
        u.uRainbow.value,
        rainbow,
        Math.min(1, dt * 3),
      )
      u.uIntensity.value = glow * k
    }
    circles.outer.rotation.z = t * 0.15
    circles.inner.rotation.z = -t * 0.35
    platform.rimMaterial.emissive.copy(hintColor)
    platform.rimMaterial.emissiveIntensity = 0.2 + glow * 0.3
    for (const [c, target] of [
      [tone.low, toneTarget[0]],
      [tone.high, toneTarget[1]],
      [tone.nebula, toneTarget[2]],
    ] as const)
      c.lerp(target, Math.min(1, dt * 1.5))
    const skyU = sky.material.uniforms
    skyU.uTime.value = t
    skyU.uLow.value.copy(tone.low)
    skyU.uHigh.value.copy(tone.high)
    skyU.uNebula.value.copy(tone.nebula)
    skyU.uRainbow.value = MathUtils.lerp(
      skyU.uRainbow.value,
      rainbow,
      Math.min(1, dt * 1.5),
    )
    skyU.uBright.value = phase === "cutIn" ? 0.35 : 1

    // 画材
    for (const prop of props.props) {
      const a = prop.angle + t * prop.speed
      prop.object.position.set(
        Math.cos(a) * prop.radius,
        prop.height + Math.sin(t * 0.9 + prop.bob) * 0.08,
        Math.sin(a) * prop.radius * 0.45 - 1.1,
      )
      prop.object.rotation.x = t * prop.spin.x
      prop.object.rotation.y = t * prop.spin.y
      prop.object.rotation.z = t * prop.spin.z
    }
    // 背景の飾り
    const dim = phase === "cutIn" ? 0.35 : 1
    neon.update(t, dim)
    bubbles.update(t)
    confetti.update(t, dt)
    clouds.update(t)
    clouds.material.color.copy(tone.nebula).multiplyScalar(dim)

    // 光の柱
    const pillarU = pillar.material.uniforms
    pillarU.uTime.value = t
    pillarU.uColor.value.copy(hintColor)
    pillarU.uRainbow.value = rainbow
    const finaleK = progress("finale", t)
    const pillarOn =
      topRank >= 2 &&
      (phase === "finale" || (phase === "reveal" && topRank >= 3))
    pillarU.uIntensity.value = MathUtils.lerp(
      pillarU.uIntensity.value,
      // 明るい空の上なので、光の柱は控えめにして人物が白く飛ばないようにする
      pillarOn
        ? topRank >= 3
          ? 0.45
          : 0.3
        : phase === "charge"
          ? progress("charge", t) * 0.15
          : 0,
      Math.min(1, dt * 4),
    )
    pillar.mesh.scale.set(
      0.7 + Math.sin(t * 8) * 0.03 + finaleK * 0.3,
      1,
      0.7 + Math.sin(t * 8) * 0.03 + finaleK * 0.3,
    )

    // 衝撃波
    const shockStarts = [
      splash?.start,
      promote
        ? promote.start + (promote.end - promote.start) * 0.62
        : undefined,
      finale && topRank >= 3 ? finale.start : undefined,
    ].filter((v): v is number => v !== undefined)
    const lastShock = shockStarts.filter((s) => t >= s).pop()
    if (lastShock !== undefined && t - lastShock < 0.9) {
      const k = (t - lastShock) / 0.9
      const atEasel = lastShock !== finale?.start
      shock.mesh.position.copy(atEasel ? easelCenter : tmp.set(0, 0.6, -0.5))
      shock.mesh.rotation.set(0, 0, 0)
      shock.mesh.scale.setScalar(0.2 + easeOutCubic(k) * (atEasel ? 2.6 : 4))
      shock.material.uniforms.uColor.value.copy(hintColor)
      shock.material.uniforms.uIntensity.value = (1 - k) * 1.3
    } else {
      shock.material.uniforms.uIntensity.value = 0
    }

    // カード
    cards.forEach((card, i) => {
      const enter = (t - enterAt[i]) / CARD_ENTER_TIME
      card.group.visible = enter > 0
      card.aura.mesh.visible = card.group.visible
      if (!card.group.visible) return
      const rank = gachaRarityRank(card.item.rarity)
      const move = easeOutCubic(enter)
      card.group.position.lerpVectors(tmp.set(0, 1.4, -0.6), card.home, move)
      // 弧を描いて少し手前を通る
      card.group.position.z += Math.sin(move * Math.PI) * 0.25
      const flipK = smooth((t - flipAt[i]) / 0.5)
      const preTime = rank >= 4 ? 0.75 : 0.55
      const pre =
        rank >= 3
          ? smooth((t - (flipAt[i] - preTime)) / preTime) *
            (t >= flipAt[i] ? 0 : 1)
          : 0
      card.group.rotation.set(
        0,
        Math.PI * (1 - flipK) + Math.sin(t * 22) * 0.025 * pre,
        (1 - move) * 0.35 * Math.sign(card.home.x || 1) +
          Math.sin(t * 17) * 0.015 * pre,
      )
      const pop = 1 + Math.sin(flipK * Math.PI) * 0.07 + pre * 0.04
      card.group.scale.setScalar(
        card.size * pop * Math.max(0.01, easeOutSoft(enter)),
      )
      // 光の強さ: N はなし、R うっすら、SR → SSR → UR と強く。めくった直後だけ少し明るく
      card.aura.mesh.position
        .copy(card.group.position)
        .setZ(card.group.position.z - 0.08)
      card.aura.mesh.scale.setScalar(card.group.scale.x * 2.2)
      const auraBase = [0, 0.12, 0.35, 0.7, 0.9][rank] ?? 0
      const since = t - flipAt[i]
      const auraU = card.aura.material.uniforms
      auraU.uTime.value = t
      auraU.uIntensity.value =
        since > 0
          ? auraBase *
            Math.min(1, since * 4) *
            (0.7 + 0.3 * Math.exp(-since * 2))
          : pre * 0.6
    })

    backdropMat.opacity =
      phase === "reveal" ? smooth((t - revealStart - 0.3) / 0.6) * 0.5 : 0
    backdrop.visible = backdropMat.opacity > 0

    // 画面に重ねるもの
    blackMat.opacity =
      phase === "cutIn"
        ? Math.min(0.22, progress("cutIn", t) * 2) *
          (1 - 0.6 * smooth((progress("cutIn", t) - 0.45) / 0.1)) *
          (1 - smooth((progress("cutIn", t) - 0.85) / 0.15))
        : 0
    // 確定の色の光: カットインの後半に出て、最後まで景品の色をうっすら残す
    const edgeShow =
      phase === "cutIn"
        ? smooth((cutK - 0.45) / 0.12) * (1 - 0.5 * smooth((cutK - 0.8) / 0.2))
        : phase === "finale" && direction.cutIn
          ? 0.5 * (1 - smooth(progress("finale", t)))
          : 0
    glowMat.uniforms.uShow.value = edgeShow
    glowMat.uniforms.uTime.value = t
    glowMat.uniforms.uRainbow.value = direction.top === "UR" ? 1 : 0
    glowMat.uniforms.uColor.value.copy(HINT_COLORS[hintOf(direction.top)])
    flashMat.opacity = Math.max(0, flashMat.opacity - dt * 2.4)
    if (flashMat.opacity === 0) flashMat.color.copy(WHITE)
    shake = Math.max(0, shake - dt * 0.12)
    bloom.strength =
      phase === "cutIn"
        ? 0.55
        : phase === "promote" || phase === "finale"
          ? 0.75
          : phase === "splash"
            ? 0.7
            : 0.6

    sparks.update(dt)
    cameraAt(t)
    lastTime = t
  }

  const render = () => {
    renderer.autoClear = true
    composer.render()
    renderer.autoClear = false
    renderer.clearDepth()
    renderer.render(hud, hudCamera)
  }

  const jumpTo = (target: number) => {
    // 途中の出来事（光の粒など）は飛ばす
    lastTime = target
    time = target
    shownHint = direction.promoteTo ?? direction.hint
    setTone(topRank >= 3 ? shownHint : "base")
    brush.bristleMaterial.color.copy(colorOf(shownHint))
  }

  let disposed = false
  let frame = 0
  let last = 0
  const loop = (now: number) => {
    if (disposed) return
    frame = requestAnimationFrame(loop)
    const dt = last === 0 ? 0 : Math.min(0.05, (now - last) / 1000)
    last = now
    update(dt)
    render()
  }
  if (!options.manual) frame = requestAnimationFrame(loop)

  return {
    skip: () => {
      if (time < revealStart) jumpTo(revealStart)
      else if (time < duration) jumpTo(duration - 0.4)
    },
    tap: () => {
      // 登場と筆をためている間は押すと先へ（カットインと昇格は見せる）
      if (time < (seg("charge")?.start ?? 0)) jumpTo(seg("charge")?.start ?? 0)
      else if (time > revealStart + 1 && time < duration) jumpTo(duration - 0.4)
    },
    step: (dt: number) => {
      update(dt)
      render()
    },
    get time() {
      return time
    },
    duration,
    dispose: () => {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      const textures = new Set<Texture>()
      for (const root of [scene, hud]) {
        root.traverse((object) => {
          const mesh = object as Mesh
          if (!mesh.isMesh && !(object as { isPoints?: boolean }).isPoints)
            return
          mesh.geometry?.dispose()
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]
          for (const material of materials) {
            const withMap = material as Material & {
              map?: Texture | null
              uniforms?: Record<string, { value: unknown }>
            }
            if (withMap.map) textures.add(withMap.map)
            for (const u of Object.values(withMap.uniforms ?? {}))
              if ((u.value as Texture)?.isTexture)
                textures.add(u.value as Texture)
            material.dispose()
          }
        })
      }
      for (const texture of textures) texture.dispose()
      composer.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
