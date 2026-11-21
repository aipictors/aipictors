import {
  Color,
  DoubleSide,
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  Vector2,
  Vector3,
} from "three"

/**
 * ガチャ演出のぴくたーちゃん（Live2D 風の 2D）。
 * 立ち絵をパーツ（後ろ髪・体・顔・目・口・横髪・前髪）に分けた絵を、メッシュの変形で動かす。
 * 顔の向き（パーツごとにずらして立体っぽく見せる）・かしげ・まばたき・口・呼吸・髪の揺れ（ばね）
 *
 * 座標: 絵の 1 辺（1536px）を 1 として、足元（絵の下の端の真ん中）を原点、上を +y にする
 */

const SIZE = 1536
/** パーツ: [左, 上, 幅, 高さ]（px） */
const LAYERS = {
  back_hair: [285, 121, 964, 1386],
  body: [208, 571, 1120, 961],
  head: [570, 28, 394, 594],
  eye_L: [598, 340, 168, 124],
  eye_R: [766, 342, 142, 118],
  mouth_open: [729, 493, 80, 53],
  hair_side_L: [584, 554, 110, 246],
  hair_side_R: [839, 554, 111, 247],
  hair_front: [584, 177, 367, 376],
} as const
type LayerName = keyof typeof LAYERS

const toLocal = (x: number, y: number) =>
  new Vector2((x - SIZE / 2) / SIZE, (SIZE - y) / SIZE)

const NECK = toLocal(766, 586)
const FACE = toLocal(766, 442)
const HIP = toLocal(766, 1250)

/** 顔の向きでどれだけずらすか（手前ほど大きく、後ろ髪は逆へ） */
const DEPTH: Record<LayerName, number> = {
  back_hair: -0.7,
  body: 0,
  head: 0.55,
  eye_L: 1,
  eye_R: 1,
  mouth_open: 1,
  hair_side_L: 0.8,
  hair_side_R: 0.8,
  hair_front: 1.25,
}

export type PictorFace = {
  /** 0 で目を閉じる（絵の閉じ目＝にっこり） */
  eyeOpen: number
  /** びっくり目 */
  eyeWide: number
  /** 0〜1 で口を開ける */
  mouth: number
}

export type PictorPose = {
  /** 顔の左右（-1〜1） */
  yaw: number
  /** 顔の上下（+ で見上げる） */
  pitch: number
  /** 首のかしげ（ラジアン） */
  roll: number
  /** 体の傾き（ラジアン） */
  bodyRoll: number
  /** ぴょんと浮かせる高さ */
  hop: number
  /** 縦につぶす（+ でつぶれる、- で伸びる） */
  squash: number
}

export type Pictor = {
  group: Group
  /** 顔の真ん中（ワールド座標） */
  facePoint: (out: Vector3) => Vector3
  /** 体の横（筆を浮かべる場所。side = 1 で画面の右） */
  sidePoint: (side: number, out: Vector3) => Vector3
  setTint: (color: Color, amount: number) => void
  update: (t: number, dt: number, pose: PictorPose, face: PictorFace) => void
  dispose: () => void
}

const vertexShader = /* glsl */ `
  uniform vec2 uNeck; uniform vec2 uFace;
  uniform float uYaw; uniform float uPitch; uniform float uRoll;
  uniform float uBreath; uniform float uSway; uniform float uSwayV;
  uniform float uDepth; uniform float uHeadW; uniform float uHeadBelow;
  uniform float uHairTop; uniform float uHairAmt;
  uniform vec2 uScaleCenter; uniform vec2 uScale;
  varying vec2 vUv; varying float vY;
  void main(){
    vUv = uv;
    vec2 p = position.xy;
    vY = p.y;
    // 目の開け閉め・びっくり目（目の中心で伸び縮み）
    p = uScaleCenter + (p - uScaleCenter) * uScale;
    // 髪の揺れ: ぶら下がっている所から下ほど大きく揺らす
    float hang = max(0.0, uHairTop - p.y) / 0.35;
    p.x += uSway * hang * hang * 0.05 * uHairAmt;
    p.y += uSwayV * hang * 0.01 * uHairAmt;
    // 呼吸: 肩から上を少し持ち上げる
    p.y += uBreath * 0.0045 * smoothstep(0.38, 0.6, p.y);
    p.x *= 1.0 + uBreath * 0.004 * smoothstep(0.62, 0.45, p.y) * smoothstep(0.25, 0.45, p.y);
    // 頭: 首を中心にかしげ、パーツを奥行きの分だけずらして顔の向きを見せる
    float w = uHeadW * mix(uHeadBelow, 1.0, smoothstep(uNeck.y - 0.25, uNeck.y - 0.02, p.y));
    vec2 q = p - uNeck;
    float a = uRoll * w;
    q = vec2(q.x * cos(a) - q.y * sin(a), q.x * sin(a) + q.y * cos(a));
    p = uNeck + q;
    float bulge = 1.0 - clamp(length(p - uFace) / 0.22, 0.0, 1.0);
    float k = w * uDepth * (0.55 + 0.45 * bulge);
    p.x += uYaw * k * 0.032;
    p.y += uPitch * k * 0.022;
    // 向いた側の反対は少し縮める（顔の丸みの見え方）
    p.x += -uYaw * w * (p.x - uFace.x) * 0.06 * sign(p.x - uFace.x) * step(0.0, uDepth);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, position.z, 1.0);
  }`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap; uniform float uOpacity; uniform vec3 uTint; uniform float uTintAmt;
  uniform float uFadeTop;
  varying vec2 vUv; varying float vY;
  void main(){
    vec4 c = texture2D(uMap, vUv);
    float a = c.a * uOpacity * smoothstep(0.0, uFadeTop, vY);
    if (a < 0.003) discard;
    vec3 col = c.rgb * 0.93;
    col = mix(col, col * uTint * 1.15 + uTint * 0.12, uTintAmt);
    gl_FragColor = vec4(col, a);
  }`

const spring = (
  state: { x: number; v: number },
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
) => {
  state.v += ((target - state.x) * stiffness - state.v * damping) * dt
  state.x += state.v * dt
  return state.x
}

export async function createPictor(baseUrl: string): Promise<Pictor> {
  const loader = new TextureLoader()
  const names = Object.keys(LAYERS) as LayerName[]
  const textures = await Promise.all(
    names.map(async (name) => {
      const texture: Texture = await loader.loadAsync(`${baseUrl}/${name}.webp`)
      texture.colorSpace = SRGBColorSpace
      texture.anisotropy = 4
      return texture
    }),
  )

  const shared = {
    uNeck: { value: NECK },
    uFace: { value: FACE },
    uYaw: { value: 0 },
    uPitch: { value: 0 },
    uRoll: { value: 0 },
    uBreath: { value: 0 },
    uSway: { value: 0 },
    uSwayV: { value: 0 },
    uTint: { value: new Color("#ffffff") },
    uTintAmt: { value: 0 },
    // 絵は太ももで切れているので、下の端をぼかして光に溶かす
    uFadeTop: { value: 0.2 },
  }

  const group = new Group()
  // 体の傾き・ぴょん・つぶれは腰を中心に
  const hip = new Group()
  hip.position.set(HIP.x, HIP.y, 0)
  group.add(hip)

  const materials: Record<string, ShaderMaterial> = {}
  names.forEach((name, i) => {
    const [x, y, w, h] = LAYERS[name]
    const center = toLocal(x + w / 2, y + h / 2)
    const isHair = name.startsWith("hair") || name === "back_hair"
    const segments = name === "body" ? [16, 16] : isHair ? [12, 24] : [16, 16]
    const geometry = new PlaneGeometry(
      w / SIZE,
      h / SIZE,
      segments[0],
      segments[1],
    )
    // 頂点は絵の座標のまま持たせる（変形はシェーダーで）
    geometry.translate(center.x, center.y, i * 0.0015)
    const isEye = name === "eye_L" || name === "eye_R"
    const material = new ShaderMaterial({
      uniforms: {
        ...shared,
        uMap: { value: textures[i] },
        uOpacity: { value: name === "mouth_open" ? 0 : 1 },
        uDepth: { value: DEPTH[name] },
        uHeadW: { value: name === "body" ? 0 : 1 },
        uHeadBelow: { value: name === "back_hair" ? 0.35 : 1 },
        uHairTop: {
          value:
            name === "back_hair"
              ? NECK.y + 0.05
              : name === "hair_front"
                ? FACE.y + 0.02
                : toLocal(0, y).y,
        },
        uHairAmt: {
          value:
            name === "back_hair"
              ? 1
              : name === "hair_front"
                ? 0.25
                : isHair
                  ? 1.4
                  : 0,
        },
        uScaleCenter: {
          value: isEye ? toLocal(x + w / 2, y + h * 0.62) : new Vector2(),
        },
        uScale: { value: new Vector2(1, 1) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      toneMapped: false,
    })
    materials[name] = material
    const mesh = new Mesh(geometry, material)
    mesh.position.set(-HIP.x, -HIP.y, 0)
    mesh.frustumCulled = false
    mesh.renderOrder = 10 + i
    hip.add(mesh)
  })

  const sway = { x: 0, v: 0 }
  const swayV = { x: 0, v: 0 }
  let lastHop = 0
  let lastRoll = 0
  let lastYaw = 0
  const tmp = new Vector3()

  const headLocal = (out: Vector3, pose: PictorPose) => {
    // 顔の真ん中を、かしげと向きのずれ込みで動かす
    const q = new Vector2().subVectors(FACE, NECK)
    const a = pose.roll
    out.set(
      NECK.x + q.x * Math.cos(a) - q.y * Math.sin(a) + pose.yaw * 0.025,
      NECK.y + q.x * Math.sin(a) + q.y * Math.cos(a) + pose.pitch * 0.015,
      0.02,
    )
    return out.sub(tmp.set(HIP.x, HIP.y, 0))
  }
  let lastPose: PictorPose = {
    yaw: 0,
    pitch: 0,
    roll: 0,
    bodyRoll: 0,
    hop: 0,
    squash: 0,
  }

  return {
    group,
    facePoint: (out) => {
      headLocal(out, lastPose)
      return hip.localToWorld(out)
    },
    sidePoint: (side, out) => {
      out.set(side * 0.3, NECK.y - 0.12, 0.05).sub(tmp.set(HIP.x, HIP.y, 0))
      return hip.localToWorld(out)
    },
    setTint: (color, amount) => {
      shared.uTint.value.copy(color)
      shared.uTintAmt.value = amount
    },
    update: (t, dt, pose, face) => {
      lastPose = pose
      const step = Math.min(dt, 1 / 30)
      // 髪は体と頭の動きに遅れてついてくる
      const hopVel = step > 0 ? (pose.hop - lastHop) / step : 0
      const turn =
        step > 0
          ? (pose.bodyRoll + pose.roll - lastRoll) / step +
            ((pose.yaw - lastYaw) / step) * 0.3
          : 0
      lastHop = pose.hop
      lastRoll = pose.bodyRoll + pose.roll
      lastYaw = pose.yaw
      sway.v += -turn * 6 * step
      swayV.v += -hopVel * 8 * step
      spring(sway, Math.sin(t * 1.7) * 0.18, 60, 5, step)
      spring(swayV, 0, 90, 7, step)
      shared.uSway.value = sway.x
      shared.uSwayV.value = swayV.x
      shared.uYaw.value = pose.yaw
      shared.uPitch.value = pose.pitch
      shared.uRoll.value = pose.roll
      shared.uBreath.value = Math.sin(t * 2.1)

      hip.rotation.z = pose.bodyRoll
      hip.position.y = HIP.y + pose.hop
      hip.scale.set(1 + pose.squash * 0.5, 1 - pose.squash, 1)

      const open = Math.max(0, Math.min(1, face.eyeOpen))
      for (const name of ["eye_L", "eye_R"] as const) {
        const m = materials[name]
        m.uniforms.uOpacity.value = Math.min(1, Math.max(0, (open - 0.15) * 3))
        m.uniforms.uScale.value.set(
          1 + face.eyeWide * 0.07,
          (0.35 + 0.65 * open) * (1 + face.eyeWide * 0.12),
        )
      }
      const mouth = Math.max(0, Math.min(1, face.mouth))
      const mouthMat = materials.mouth_open
      mouthMat.uniforms.uOpacity.value = Math.min(1, mouth * 2)
      mouthMat.uniforms.uScaleCenter.value.copy(toLocal(769, 500))
      mouthMat.uniforms.uScale.value.set(0.9 + mouth * 0.1, 0.5 + mouth * 0.5)
    },
    dispose: () => {
      for (const texture of textures) texture.dispose()
    },
  }
}
