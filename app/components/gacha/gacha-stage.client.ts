import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  type CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HalfFloatType,
  HemisphereLight,
  IcosahedronGeometry,
  type Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three"
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
  createPictor,
  type PictorFace,
} from "~/components/gacha/gacha-pictor.client"
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
  drawBanner,
  drawCardBack,
  drawCardFront,
  HINT_COLORS,
  Sparks,
  skyTones,
} from "~/components/gacha/gacha-stage-parts.client"

/**
 * ガチャ演出の舞台（three.js）。景品とレア度を渡すだけで動くので、どのガチャにも使える。
 *
 * 流れ: 登場 → 筆に光を集める（色で予告）→ キャンバスへ放つ → 絵の具がはじける
 *       →（昇格）→（確定カットイン）→ 光の柱 → カードをめくる
 * 時間 t だけで見た目が決まるように作っている（step で 1 コマずつ進めて動画にも書き出せる）
 */

export type GachaStageOptions = {
  canvas: HTMLCanvasElement
  /** ぴくたーちゃんのパーツの絵があるフォルダ */
  pictorUrl: string
  items: readonly GachaItem[]
  direction: GachaDirection
  /** true のときは自分で step を呼ぶ（動画の書き出し用） */
  manual?: boolean
  pixelRatio?: number
  onComplete?: () => void
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
  renderer.toneMappingExposure = 1.05

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

  scene.add(new HemisphereLight("#c8b8ff", "#1a0f30", 1.1))
  const key = new DirectionalLight("#fff4e6", 2.2)
  key.position.set(2, 4, 3)
  scene.add(key)
  const orbLight = new PointLight("#ffffff", 0, 6, 1.6)
  scene.add(orbLight)

  const platform = createPlatform()
  scene.add(platform.group)
  const circles = createMagicCircles()
  scene.add(circles.outer, circles.inner)
  const skyCircle = createMagicCircles().outer
  skyCircle.rotation.set(0, 0, 0)
  skyCircle.scale.setScalar(4.2)
  skyCircle.position.set(0, 3.4, -9)
  scene.add(skyCircle)
  const outerMat = circles.outer.material as ShaderMaterial
  const innerMat = circles.inner.material as ShaderMaterial
  const skyCircleMat = skyCircle.material as ShaderMaterial

  const props = createFloatingProps()
  scene.add(props.group)

  // 遠くに浮かぶ岩
  const rockMaterial = new MeshStandardMaterial({
    color: "#2a2045",
    roughness: 0.9,
    flatShading: true,
    emissive: new Color("#3a1d6e"),
    emissiveIntensity: 0.25,
  })
  const rocks: Mesh[] = []
  for (let i = 0; i < 9; i++) {
    const rock = new Mesh(
      new IcosahedronGeometry(0.4 + (i % 3) * 0.35, 0),
      rockMaterial,
    )
    const a = (i / 9) * Math.PI * 2 + 0.3
    rock.position.set(
      Math.cos(a) * (7 + (i % 3) * 2),
      -0.6 + ((i * 1.7) % 3),
      Math.sin(a) * (7 + (i % 3) * 2) - 2,
    )
    rock.scale.set(1, 0.6, 1)
    rock.rotation.set(i, i * 2, i * 3)
    scene.add(rock)
    rocks.push(rock)
  }

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

  /* ---- ぴくたーちゃん（Live2D 風の 2D） ---- */
  const [pictor, images] = await Promise.all([
    createPictor(options.pictorUrl),
    Promise.all(items.map((item) => loadImage(item.imageUrl))),
  ])
  const actor = pictor.group
  actor.scale.setScalar(1.22)
  actor.position.set(0, 0.1, 0.25)
  scene.add(actor)

  /** ばねで追いかける姿勢のつまみ（ぬるっと動かす） */
  const poseKeys = [
    "yaw",
    "pitch",
    "roll",
    "bodyRoll",
    "squash",
    "sway",
    "lift",
    "swirl",
    "aim",
  ] as const
  type PoseKey = (typeof poseKeys)[number]
  type Pose = Record<PoseKey, number>
  const zeroPose = (): Pose =>
    Object.fromEntries(poseKeys.map((k) => [k, 0])) as Pose
  const pose = zeroPose()
  const poseVel = zeroPose()
  const face: PictorFace = { eyeOpen: 1, eyeWide: 0, mouth: 0 }
  const axisY = new Vector3(0, 1, 0)

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
    aura.mesh.scale.setScalar(2.2)
    aura.mesh.position.z = -0.05
    aura.material.uniforms.uColor.value.copy(HINT_COLORS[hintOf(item.rarity)])
    aura.material.uniforms.uRainbow.value = item.rarity === "UR" ? 1 : 0
    group.add(aura.mesh, front, back)
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
  const bandMat = new ShaderMaterial({
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
        vec2 p=vUv-0.5;p.x*=uAspect;
        float d=p.y+0.27+p.x*0.22;
        if(uShow<0.001){discard;}
        float w=0.16*min(1.0,uShow*2.5)+0.011;
        float band=1.0-smoothstep(w-0.01,w,abs(d));
        float edge=(1.0-smoothstep(w,w+0.012,abs(d)))-band;
        vec3 col=mix(uColor,hue(p.x*0.5-uTime*0.6),uRainbow);
        float stripes=0.82+0.18*step(0.5,fract((p.x-p.y*0.22)*14.0-uTime*3.0));
        vec2 c=vec2(p.x,p.y);float ang=atan(c.y,c.x);
        float lines=step(0.93,fract(sin(floor(ang*60.0)*43758.5+floor(uTime*20.0))*0.5+0.5))*smoothstep(0.25,0.9,length(c))*uShow;
        vec3 o=col*band*stripes*0.9+vec3(1.0)*edge+vec3(1.0)*lines*0.35;
        float a=max(band*0.92,max(edge,lines*0.35))*min(1.0,uShow*1.5);
        gl_FragColor=vec4(o*min(1.0,uShow*1.5),a);
      }`,
  })
  const band = quad(bandMat)
  band.renderOrder = 2
  const bannerTexture: CanvasTexture | null = direction.cutInLabel
    ? drawBanner(direction.cutInLabel, direction.top)
    : null
  const bannerMat = new MeshBasicMaterial({
    map: bannerTexture,
    transparent: true,
    opacity: 0,
    depthTest: false,
    toneMapped: false,
  })
  const banner = new Mesh(new PlaneGeometry(1, 0.25), bannerMat)
  banner.renderOrder = 3
  hud.add(banner)
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
  const bloom = new UnrealBloomPass(new Vector2(256, 256), 0.9, 0.55, 0.92)
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
  // カードをめくる時刻
  const flipAt: number[] = []
  {
    let tf = revealStart + 1.4
    items.forEach((item) => {
      const rank = gachaRarityRank(item.rarity)
      if (rank >= 3) tf += 0.55 // めくる前にためる
      flipAt.push(tf)
      tf += items.length === 1 ? 0 : revealPauseOf(item.rarity)
    })
    push("reveal", tf + 0.7 - revealStart)
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
    let best = { cols: 1, h: 0 }
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols)
      const h = Math.min(
        (maxH / rows) * 0.9,
        ((maxW / cols) * 0.9) / CARD_ASPECT,
      )
      if (h > best.h) best = { cols, h }
    }
    const rows = Math.ceil(n / best.cols)
    cards.forEach((card, i) => {
      const row = Math.floor(i / best.cols)
      const inRow = Math.min(best.cols, n - row * best.cols)
      const col = i - row * best.cols
      const x = (col - (inRow - 1) / 2) * best.h * CARD_ASPECT * 1.1
      const y = ((rows - 1) / 2 - row) * best.h * 1.1
      card.home.set(x, revealCamera.target.y + y, 1.3)
      card.size = best.h
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
    bandMat.uniforms.uAspect.value = aspect
    banner.scale.setScalar(Math.min(aspect * 1.95, 2.2))
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
  const tmp = new Vector3()
  const tip = new Vector3()
  const handPos = new Vector3()
  const headPos = new Vector3()
  const brushDir = new Vector3()
  const camPos = new Vector3()
  const camTarget = new Vector3()
  const orbFrom = new Vector3()
  const easelCenter = new Vector3(0, 1.5, -0.84)
  const crossed = (at: number) => lastTime < at && time >= at

  /** ぴょんと跳ねる時刻（その前にかがんで、着地でつぶれる） */
  const hops: number[] = []
  {
    const intro = seg("intro")
    if (intro) hops.push(intro.start + 0.55)
    const cut = seg("cutIn")
    if (cut) hops.push(cut.start + (cut.end - cut.start) * 0.46)
    const finale = seg("finale")
    if (finale && topRank >= 2) {
      hops.push(finale.start + 0.08)
      if (topRank >= 3) hops.push(finale.start + 0.68)
    }
  }
  const HOP = 0.42
  const hopAt = (t: number) => {
    let hop = 0
    let squash = 0
    for (const s of hops) {
      const k = (t - s) / HOP
      if (k > 0 && k < 1) hop = Math.max(hop, Math.sin(k * Math.PI) * 0.1)
      if (k > 0 && k < 0.3) squash -= Math.sin((k / 0.3) * Math.PI) * 0.05
      const crouch = (t - (s - 0.14)) / 0.14
      if (crouch > 0 && crouch < 1) squash += Math.sin(crouch * Math.PI) * 0.06
      const land = (t - (s + HOP)) / 0.2
      if (land > 0 && land < 1) squash += Math.sin(land * Math.PI) * 0.07
    }
    return { hop, squash }
  }

  const poseTarget = (t: number): Pose => {
    const p = zeroPose()
    const phase = segmentAt(t).name
    p.sway = 1
    if (phase === "intro") {
      // 首をかしげてあいさつ
      p.roll = 0.14
      p.yaw = 0.15
      p.bodyRoll = 0.04
    } else if (phase === "charge") {
      // 筆を頭の上に浮かべて回し、見上げる
      const k = progress("charge", t)
      p.lift = smooth(k * 2.5)
      p.swirl = smooth(k * 2) * (0.6 + k * 0.6)
      p.pitch = 0.75 * smooth(k * 2)
      p.yaw = 0.45 * smooth(k * 2)
      p.roll = -0.06
      p.bodyRoll = -0.05
    } else if (phase === "flick") {
      // 体ごと振ってキャンバスへ放つ
      const k = progress("flick", t)
      p.lift = k < 0.35 ? 1.15 : 0.2
      p.aim = k < 0.35 ? 0 : 1
      p.bodyRoll = k < 0.35 ? 0.09 : -0.11
      p.yaw = k < 0.35 ? 0.5 : -0.35
      p.pitch = k < 0.35 ? 0.6 : 0.4
      p.roll = k < 0.35 ? 0.05 : -0.1
      p.squash = k < 0.35 ? 0.03 : -0.02
    } else if (phase === "splash" || phase === "promote") {
      // うしろの上のキャンバスを見上げる
      p.pitch = 0.95
      p.yaw = -0.25
      p.roll = 0.06
      p.lift = 0.15
      if (phase === "promote") {
        const k = progress("promote", t)
        p.pitch = 1
        p.yaw = 0
        p.roll = k < 0.62 ? Math.sin(t * 38) * 0.05 * k : 0.16
        p.squash = k < 0.62 ? 0.04 * k : 0
      }
    } else if (phase === "cutIn") {
      // びっくり → にっこり
      const k = progress("cutIn", t)
      p.pitch = k < 0.45 ? 0.15 : 0
      p.roll = k < 0.45 ? 0 : 0.18
      p.bodyRoll = k < 0.45 ? 0 : 0.05
      p.sway = 0.3
    } else if (phase === "finale") {
      p.roll = topRank >= 2 ? 0.16 * Math.sin(t * 4) : 0.15
      p.pitch = topRank >= 2 ? 0.3 : 0
      p.yaw = 0.1
    } else {
      p.roll = 0.1
      p.yaw = 0.15
    }
    return p
  }

  const faceTarget = (t: number): PictorFace => {
    const phase = segmentAt(t).name
    const blink =
      untilBlink >= 0 ? 1 : Math.min(1, Math.abs(untilBlink + 0.06) / 0.06)
    const smile = { eyeOpen: 0, eyeWide: 0, mouth: 1 }
    if (phase === "cutIn")
      return progress("cutIn", t) < 0.45
        ? { eyeOpen: 1, eyeWide: 1, mouth: 0.6 }
        : smile
    if (phase === "promote")
      return progress("promote", t) < 0.62
        ? { eyeOpen: 1, eyeWide: 0.7, mouth: 0.45 }
        : smile
    if (phase === "charge" && progress("charge", t) > 0.55)
      return { eyeOpen: 0, eyeWide: 0, mouth: 0 }
    if (phase === "flick") return smile
    if (phase === "finale" && topRank >= 2) return smile
    if (phase === "intro") {
      // 「やっほー」と口を動かす
      const k = progress("intro", t)
      return {
        eyeOpen: blink,
        eyeWide: 0,
        mouth: k > 0.25 && k < 0.8 ? Math.max(0, Math.sin(t * 15)) * 0.9 : 0,
      }
    }
    return { eyeOpen: blink, eyeWide: 0, mouth: 0 }
  }

  const applyPose = (t: number, dt: number) => {
    const target = poseTarget(t)
    // ばね（減衰つき）で姿勢を追いかける
    for (const k of poseKeys) {
      const stiffness =
        (k === "lift" || k === "aim") && inPhase("flick", t) ? 420 : 90
      const damping = 2 * Math.sqrt(stiffness) * 0.85
      const a = (target[k] - pose[k]) * stiffness - poseVel[k] * damping
      poseVel[k] += a * dt
      pose[k] += poseVel[k] * dt
    }
    const nextFace = faceTarget(t)
    const blend = Math.min(1, dt * 22)
    face.eyeOpen += (nextFace.eyeOpen - face.eyeOpen) * Math.min(1, dt * 40)
    face.eyeWide += (nextFace.eyeWide - face.eyeWide) * blend
    face.mouth += (nextFace.mouth - face.mouth) * blend
    const { hop, squash } = hopAt(t)
    pictor.update(
      t,
      dt,
      {
        yaw: pose.yaw + Math.sin(t * 0.7) * 0.08 * pose.sway,
        pitch: pose.pitch + Math.sin(t * 2.1 + 1) * 0.04,
        roll:
          pose.roll * (1 + 0.25 * Math.sin(t * 1.3 + 0.5)) +
          0.03 * Math.sin(t * 0.9) * pose.sway,
        bodyRoll: pose.bodyRoll + Math.sin(t * 1.3) * 0.025 * pose.sway,
        hop,
        squash: squash + pose.squash,
      },
      face,
    )
  }

  const cameraAt = (t: number) => {
    const phase = segmentAt(t).name
    const head = pictor.facePoint(headPos)
    if (phase === "intro") {
      const k = smooth(progress("intro", t))
      camPos.set(
        Math.sin(k * 0.6 - 0.6) * 1.6,
        MathUtils.lerp(2.6, 1.0, k),
        MathUtils.lerp(7, 3.3, k),
      )
      camTarget.set(0, MathUtils.lerp(1.2, 0.8, k), 0)
    } else if (phase === "charge") {
      const k = smooth(progress("charge", t))
      camPos.set(
        MathUtils.lerp(0, 0.9, k),
        MathUtils.lerp(1.0, 0.85, k),
        MathUtils.lerp(3.3, 2.5, k),
      )
      camTarget.set(0, MathUtils.lerp(0.8, 1.0, k), 0)
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
          ? MathUtils.lerp(1.15, 0.95, smooth(k / 0.45))
          : MathUtils.lerp(0.95, 2.0, smooth((k - 0.45) / 0.55))
      camPos.set(head.x + 0.05, head.y + 0.1, head.z + z)
      camTarget.set(
        head.x,
        head.y + 0.03 - (k < 0.45 ? 0 : 0.24 * smooth((k - 0.45) / 0.55)),
        head.z,
      )
    } else if (phase === "finale") {
      const k = smooth(progress("finale", t))
      camPos.set(
        Math.sin(k * 0.8) * 0.8,
        MathUtils.lerp(1.0, 1.15, k),
        MathUtils.lerp(2.6, 3.4, k),
      )
      camTarget.set(0, MathUtils.lerp(0.82, 0.95, k), 0)
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
      shake = 0.05
      sparks.burst(easelCenter, rainbow ? randomRainbow : hintColor, 260, 2.6, {
        size: 0.06,
        up: 0.2,
      })
      flashMat.opacity = 0.5
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
      shake = 0.09
      flashMat.opacity = 0.8
      sparks.burst(
        easelCenter,
        shownHint === "rainbow" ? randomRainbow : colorOf(shownHint),
        420,
        3.6,
        { size: 0.07, up: 0.3 },
      )
    }
    const cut = seg("cutIn")
    if (cut && crossed(cut.start + (cut.end - cut.start) * 0.45)) {
      flashMat.opacity = 0.6
      shake = 0.02
      sparks.burst(
        pictor.facePoint(new Vector3()),
        direction.top === "UR" ? randomRainbow : colorOf("gold"),
        200,
        2.2,
        { size: 0.03 },
      )
    }
    const finale = seg("finale")
    if (finale && crossed(finale.start)) {
      if (topRank >= 3) {
        shake = 0.06
        flashMat.opacity = 0.7
        sparks.burst(
          new Vector3(0, 0.2, 0),
          shownHint === "rainbow" ? randomRainbow : hintColor,
          360,
          3,
          { size: 0.06, up: 1.6 },
        )
      }
    }
    if (crossed(revealStart)) setTone(topRank >= 3 ? shownHint : "base")
    cards.forEach((card, i) => {
      const rank = gachaRarityRank(card.item.rarity)
      if (crossed(flipAt[i])) {
        if (rank >= 2)
          sparks.burst(
            card.home,
            card.item.rarity === "UR"
              ? randomRainbow
              : colorOf(hintOf(card.item.rarity)),
            rank >= 3 ? 220 : 60,
            rank >= 3 ? 2.2 : 1.2,
            { size: 0.035, up: 0.2 },
          )
        if (rank >= 3) {
          flashMat.opacity = Math.max(flashMat.opacity, rank >= 4 ? 0.85 : 0.5)
          shake = rank >= 4 ? 0.05 : 0.025
        }
      }
    })
    if (!completed && t >= duration) {
      completed = true
      options.onComplete?.()
    }

    // ぴくたーちゃん
    untilBlink -= dt
    if (untilBlink < -0.12) untilBlink = 1.6 + Math.random() * 2.6
    applyPose(t, Math.min(dt, 1 / 30))
    pictor.setTint(
      hintColor,
      phase === "charge" || phase === "flick" || phase === "splash"
        ? orb.material.uniforms.uIntensity.value * 0.18
        : phase === "promote"
          ? 0.22
          : 0,
    )

    // 筆（ぴくたーちゃんの横に浮かべる。ためるときは頭の上で回す）
    pictor.sidePoint(1, handPos)
    handPos.y += Math.sin(t * 2.3) * 0.02
    pictor.facePoint(tmp).add(headPos.set(0.24, 0.3, 0.12))
    handPos.lerp(tmp, pose.lift)
    handPos.x += Math.cos(t * 7) * 0.07 * pose.swirl
    handPos.y += Math.sin(t * 7) * 0.05 * pose.swirl
    handPos.lerp(tmp.set(0.18, 1.2, -0.3), pose.aim * 0.55)
    brushDir
      .set(
        -0.35 + Math.sin(t * 7) * 0.35 * pose.swirl + pose.lift * 0.3,
        1,
        0.15,
      )
      .normalize()
    brushDir.lerp(tmp.subVectors(easelCenter, handPos).normalize(), pose.aim)
    brushDir.normalize()
    brush.group.position.copy(handPos)
    brush.group.quaternion.setFromUnitVectors(axisY, brushDir)
    brush.group.visible =
      phase !== "cutIn" && (phase !== "reveal" || t < revealStart + 0.6)
    tip.copy(handPos).addScaledVector(brushDir, 0.2)

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
          ? 0.6 +
              Math.sin(t * 40) * 0.06 * (k < 0.62 ? k : 0) +
              (k > 0.62 ? 0.8 : 0)
          : 0.9 * (1 - progress("splash", t)) + 0.3,
      )
      orbU.uIntensity.value =
        phase === "promote"
          ? k < 0.62
            ? 0.5 + k
            : 1.6 - (k - 0.62) * 2
          : 1 - progress("splash", t) * 0.6
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
          ? 0.7 + progress("charge", t) * 0.8
          : phase === "reveal"
            ? 0.45
            : 1.1
    for (const [mat, k] of [
      [outerMat, 1],
      [innerMat, 1.2],
      [skyCircleMat, topRank >= 3 && t > (splash?.start ?? 0) ? 0.5 : 0.18],
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
    circles.outer.rotation.z = t * 0.25
    circles.inner.rotation.z = -t * 0.6
    skyCircle.rotation.z = t * 0.08
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
    rocks.forEach((rock, i) => {
      rock.position.y += Math.sin(t * 0.4 + i) * 0.0008
      rock.rotation.y += dt * 0.05
    })
    rockMaterial.emissive.copy(tone.nebula)

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
      pillarOn
        ? topRank >= 3
          ? 0.9
          : 0.6
        : phase === "charge"
          ? progress("charge", t) * 0.5
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
      shock.material.uniforms.uIntensity.value = (1 - k) * 2.5
    } else {
      shock.material.uniforms.uIntensity.value = 0
    }

    // カード
    cards.forEach((card, i) => {
      const enter = (t - (revealStart + 0.5 + i * 0.05)) / 0.5
      card.group.visible = enter > 0
      if (!card.group.visible) return
      const rank = gachaRarityRank(card.item.rarity)
      const k = easeOutBack(enter)
      card.group.position.lerpVectors(
        tmp.set(0, 1.4, -0.6),
        card.home,
        Math.min(1, k),
      )
      const flipK = MathUtils.clamp((t - flipAt[i]) / 0.42, 0, 1)
      const pre =
        rank >= 3
          ? MathUtils.clamp((t - (flipAt[i] - 0.55)) / 0.55, 0, 1) *
            (flipK > 0 ? 0 : 1)
          : 0
      card.group.rotation.set(
        0,
        Math.PI * (1 - easeOutCubic(flipK)) + Math.sin(t * 60) * 0.05 * pre,
        Math.sin(t * 47) * 0.04 * pre,
      )
      const pop = 1 + Math.sin(flipK * Math.PI) * 0.15 + pre * 0.06
      card.group.scale.setScalar(
        card.size * pop * Math.min(1, Math.max(0.01, k)),
      )
      const auraU = card.aura.material.uniforms
      auraU.uTime.value = t
      auraU.uIntensity.value =
        flipK > 0
          ? (rank >= 3 ? 1.1 : rank === 2 ? 0.55 : 0) * Math.min(1, flipK * 2)
          : pre * 0.8
    })

    backdropMat.opacity =
      phase === "reveal" ? smooth((t - revealStart - 0.3) / 0.6) * 0.5 : 0
    backdrop.visible = backdropMat.opacity > 0

    // 画面に重ねるもの
    blackMat.opacity =
      phase === "cutIn"
        ? Math.min(0.55, progress("cutIn", t) * 4) *
          (1 - 0.6 * smooth((progress("cutIn", t) - 0.45) / 0.1)) *
          (1 - smooth((progress("cutIn", t) - 0.85) / 0.15))
        : 0
    const bandK = phase === "cutIn" ? progress("cutIn", t) : 0
    const bandShow =
      bandK < 0.45
        ? 0
        : smooth((bandK - 0.45) / 0.08) * (1 - smooth((bandK - 0.9) / 0.1))
    bandMat.uniforms.uShow.value = bandShow
    bandMat.uniforms.uTime.value = t
    bandMat.uniforms.uRainbow.value = direction.top === "UR" ? 1 : 0
    bandMat.uniforms.uColor.value.copy(HINT_COLORS[hintOf(direction.top)])
    bannerMat.opacity = bandShow
    banner.position.x =
      (1 - easeOutBack((bandK - 0.45) / 0.12)) * 2.5 * (bandK < 0.45 ? 1 : 1)
    banner.rotation.z = 0.08
    banner.position.y = -0.54
    flashMat.opacity = Math.max(0, flashMat.opacity - dt * 2.4)
    shake = Math.max(0, shake - dt * 0.12)
    bloom.strength =
      phase === "cutIn"
        ? 0.9
        : phase === "promote" || phase === "finale"
          ? 1.0
          : phase === "splash"
            ? 0.95
            : 0.8

    sparks.update(dt)
    cameraAt(t)
    // 絵なので、いつもカメラのほうを向かせる
    actor.rotation.y = Math.atan2(
      camera.position.x - actor.position.x,
      camera.position.z - actor.position.z,
    )
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
