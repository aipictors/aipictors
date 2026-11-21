import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  NormalBlending,
  Object3D,
  PlaneGeometry,
  Points,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
} from "three"
import type {
  GachaHint,
  GachaItem,
  GachaRarity,
} from "~/components/gacha/gacha-direction"

/**
 * ガチャ演出の部品（空・魔法陣・画材・光の粒・光の柱・カード）。
 * 光るものは色を 1 より大きくして、ブルーム（にじむ光）がかかるようにしている
 */

export const HINT_COLORS: Record<GachaHint, Color> = {
  blue: new Color("#4fa8ff"),
  purple: new Color("#b26bff"),
  gold: new Color("#ffc23d"),
  rainbow: new Color("#ff7ad9"),
}

/** 空の色（地平線・真上・雲）。明るいパステルの空にして、予兆の色で染める */
const SKY_TONES: Record<GachaHint | "base", [string, string, string]> = {
  base: ["#ffcdec", "#2fa8ff", "#ffffff"],
  blue: ["#c6e9ff", "#1f7dff", "#eef8ff"],
  purple: ["#efc9ff", "#7c4dff", "#fbf0ff"],
  gold: ["#ffe2a8", "#ff9a1f", "#fff8e8"],
  rainbow: ["#ffd0ec", "#4fb6ff", "#ffffff"],
}

export const skyTones = (hint: GachaHint | "base") =>
  SKY_TONES[hint].map((c) => new Color(c)) as [Color, Color, Color]

const NOISE = /* glsl */ `
float hash(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.0;float a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=0.5;}return v;}
vec3 hue(float h){return clamp(abs(mod(h*6.0+vec3(0,4,2),6.0)-3.0)-1.0,0.0,1.0);}
`

/** 雲の浮かぶ明るい空（内側から見る球） */
export function createSky() {
  const material = new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uLow: { value: new Color() },
      uHigh: { value: new Color() },
      uNebula: { value: new Color() },
      uRainbow: { value: 0 },
      uBright: { value: 1 },
    },
    vertexShader:
      /* glsl */ "varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: /* glsl */ `
      uniform float uTime;uniform vec3 uLow;uniform vec3 uHigh;uniform vec3 uNebula;uniform float uRainbow;uniform float uBright;
      varying vec3 vDir;${NOISE}
      void main(){
        vec3 d=normalize(vDir);
        vec3 col=mix(uLow,uHigh,smoothstep(-0.04,0.3,d.y));
        // パステルの虹（UR の予兆）
        col=mix(col,col*(0.7+0.45*hue(d.x*0.35+d.y*0.6+uTime*0.03)),uRainbow*0.7);
        // 地平線のもこもこ雲
        vec3 q=vec3(d.x*2.6,d.y*7.0,d.z*2.6)+vec3(uTime*0.012,0.0,0.0);
        float n=fbm(q);
        float band=smoothstep(0.14,-0.02,d.y)*smoothstep(-0.35,-0.08,d.y);
        float cloud=smoothstep(0.38,0.62,n+band*0.35-0.12)*band;
        vec3 cloudCol=mix(uNebula*0.82,uNebula,smoothstep(0.4,0.75,n));
        col=mix(col,cloudCol,cloud);
        // 高いところのうすい雲
        float w=fbm(vec3(d.x*1.6,d.y*5.0,d.z*1.6)-vec3(uTime*0.008,0.0,0.0));
        col=mix(col,uNebula,smoothstep(0.58,0.82,w)*smoothstep(0.12,0.4,d.y)*0.35);
        // きらきら
        vec3 g=floor(d*140.0);
        float s=hash(g);
        col+=vec3(step(0.993,s)*max(0.0,sin(uTime*(1.5+s*4.0)+s*40.0)))*0.5*smoothstep(0.0,0.4,d.y);
        gl_FragColor=vec4(min(col,vec3(0.92))*uBright,1.0);
      }`,
  })
  const mesh = new Mesh(new SphereGeometry(40, 48, 32), material)
  return { mesh, material }
}

/** 魔法陣の絵（白い線。色はシェーダーで付ける） */
function drawMagicCircle(size: number, runes: string, detail: number) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const g = canvas.getContext("2d") as CanvasRenderingContext2D
  const c = size / 2
  g.translate(c, c)
  g.strokeStyle = "#fff"
  g.fillStyle = "#fff"
  const ring = (r: number, w: number) => {
    g.lineWidth = w
    g.beginPath()
    g.arc(0, 0, r, 0, Math.PI * 2)
    g.stroke()
  }
  ring(c * 0.97, size * 0.012)
  ring(c * 0.9, size * 0.004)
  ring(c * 0.78, size * 0.008)
  ring(c * 0.5, size * 0.006)
  ring(c * 0.44, size * 0.003)
  // 文字の帯
  g.font = `700 ${Math.round(size * 0.045)}px Georgia, "Times New Roman", serif`
  g.textAlign = "center"
  g.textBaseline = "middle"
  const chars = runes.split("")
  chars.forEach((ch, i) => {
    g.save()
    g.rotate((i / chars.length) * Math.PI * 2)
    g.fillText(ch, 0, -c * 0.84)
    g.restore()
  })
  // 星形（重なった多角形）
  for (let k = 0; k < detail; k++) {
    const n = 6 + k
    g.lineWidth = size * 0.004
    g.beginPath()
    for (let i = 0; i <= n; i++) {
      const a = ((i * 2) % n) * ((Math.PI * 2) / n) + k * 0.3
      const x = Math.sin(a) * c * 0.78
      const y = -Math.cos(a) * c * 0.78
      if (i === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    }
    g.stroke()
  }
  // 小さな円と点
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const x = Math.sin(a) * c * 0.64
    const y = -Math.cos(a) * c * 0.64
    g.lineWidth = size * 0.003
    g.beginPath()
    g.arc(x, y, size * 0.022, 0, Math.PI * 2)
    g.stroke()
    g.beginPath()
    g.arc(x, y, size * 0.006, 0, Math.PI * 2)
    g.fill()
  }
  const texture = new CanvasTexture(canvas)
  texture.anisotropy = 4
  return texture
}

export function createGlowMaterial(texture: CanvasTexture, solid = false) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    // 明るい床の上では足し算の光が見えないので、solid は色を塗る
    blending: solid ? NormalBlending : AdditiveBlending,
    side: DoubleSide,
    uniforms: {
      uMap: { value: texture },
      uColor: { value: new Color() },
      uIntensity: { value: 0 },
      uTime: { value: 0 },
      uRainbow: { value: 0 },
    },
    vertexShader:
      /* glsl */ "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;uniform vec3 uColor;uniform float uIntensity;uniform float uTime;uniform float uRainbow;varying vec2 vUv;
      vec3 hue(float h){return clamp(abs(mod(h*6.0+vec3(0,4,2),6.0)-3.0)-1.0,0.0,1.0);}
      void main(){
        float a=texture2D(uMap,vUv).a;
        vec2 p=vUv-0.5;
        vec3 col=mix(uColor,hue(atan(p.y,p.x)/6.2831+uTime*0.2)*1.1,uRainbow);
        gl_FragColor=${solid ? "vec4(col*(0.55+0.45*uIntensity),a*min(uIntensity,1.0))" : "vec4(col*a*uIntensity,a)"};
      }`,
  })
}

export function createMagicCircles() {
  const outer = new Mesh(
    new PlaneGeometry(3.2, 3.2),
    createGlowMaterial(
      drawMagicCircle(1024, "AIPICTORS·ATELIER·ARS·PICTURA·LUX·", 2),
      true,
    ),
  )
  outer.rotation.x = -Math.PI / 2
  outer.position.y = 0.062
  const inner = new Mesh(
    new PlaneGeometry(1.6, 1.6),
    createGlowMaterial(drawMagicCircle(512, "✦COLOR✦DREAM✦", 1), true),
  )
  inner.rotation.x = -Math.PI / 2
  inner.position.y = 0.068
  return { outer, inner }
}

/** 白いステージ（つやのある円盤と、まわりを囲む鍵盤） */
export function createPlatform() {
  const group = new Group()
  const top = new Mesh(
    new CylinderGeometry(1.45, 1.5, 0.12, 96),
    new MeshStandardMaterial({
      color: "#f6f7ff",
      metalness: 0.15,
      roughness: 0.22,
    }),
  )
  const under = new Mesh(
    new CylinderGeometry(2.3, 2.15, 0.22, 96, 1, true),
    new MeshStandardMaterial({
      color: "#dfe6ff",
      metalness: 0.2,
      roughness: 0.4,
      side: DoubleSide,
    }),
  )
  under.position.y = -0.14
  const rimMaterial = new MeshStandardMaterial({
    color: "#ffffff",
    metalness: 0.3,
    roughness: 0.2,
    emissive: new Color("#7fe0ff"),
    emissiveIntensity: 0.25,
  })
  const rim = new Mesh(new TorusGeometry(1.48, 0.022, 12, 128), rimMaterial)
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.06
  const rim2 = new Mesh(new TorusGeometry(2.3, 0.02, 12, 160), rimMaterial)
  rim2.rotation.x = Math.PI / 2
  rim2.position.y = -0.03
  group.add(top, under, rim, rim2)

  // 鍵盤（白鍵を輪に並べ、黒鍵を 2 つ・3 つの組で乗せる）
  const whiteCount = 70
  const inner = 1.54
  const outer = 2.26
  const whiteKeys = new InstancedMesh(
    new BoxGeometry(1, 0.06, 1),
    new MeshStandardMaterial({ color: "#ffffff", roughness: 0.25 }),
    whiteCount,
  )
  const blackKeys = new InstancedMesh(
    new BoxGeometry(1, 0.06, 1),
    new MeshStandardMaterial({
      color: "#5a5fa8",
      roughness: 0.3,
      metalness: 0.2,
    }),
    whiteCount,
  )
  const dummy = new Object3D()
  const step = (Math.PI * 2) / whiteCount
  let blacks = 0
  for (let i = 0; i < whiteCount; i++) {
    const a = i * step
    const r = (inner + outer) / 2
    dummy.position.set(Math.cos(a) * r, -0.04, Math.sin(a) * r)
    dummy.rotation.set(0, -a, 0)
    dummy.scale.set(outer - inner, 1, r * step * 0.9)
    dummy.updateMatrix()
    whiteKeys.setMatrixAt(i, dummy.matrix)
    // 7 鍵ごとに 2 + 3 の黒鍵（E-F と B-C の間はなし）
    if (i % 7 === 2 || i % 7 === 6) continue
    const ab = a + step / 2
    const rb = outer - (outer - inner) * 0.3
    dummy.position.set(Math.cos(ab) * rb, -0.005, Math.sin(ab) * rb)
    dummy.rotation.set(0, -ab, 0)
    dummy.scale.set((outer - inner) * 0.6, 0.9, rb * step * 0.55)
    dummy.updateMatrix()
    blackKeys.setMatrixAt(blacks++, dummy.matrix)
  }
  blackKeys.count = blacks
  group.add(whiteKeys, blackKeys)
  return { group, rimMaterial }
}

/** 画材（筆・絵の具のチューブ・パレット・宝石） */
export function createBrush(tint: Color) {
  const group = new Group()
  const wood = new MeshStandardMaterial({
    color: "#7a3f1d",
    roughness: 0.45,
    metalness: 0.1,
  })
  const metal = new MeshStandardMaterial({
    color: "#d9dde6",
    roughness: 0.2,
    metalness: 1,
  })
  const bristleMaterial = new MeshStandardMaterial({
    color: tint.clone(),
    roughness: 0.6,
    emissive: tint.clone(),
    emissiveIntensity: 0.6,
  })
  const handle = new Mesh(new CylinderGeometry(0.012, 0.018, 0.34, 12), wood)
  handle.position.y = -0.17
  const ferrule = new Mesh(new CylinderGeometry(0.019, 0.017, 0.07, 16), metal)
  ferrule.position.y = 0.035
  const bristle = new Mesh(new ConeGeometry(0.024, 0.09, 16), bristleMaterial)
  bristle.position.y = 0.115
  group.add(handle, ferrule, bristle)
  return { group, bristleMaterial }
}

function createTube(color: string) {
  const group = new Group()
  const body = new Mesh(
    new CylinderGeometry(0.05, 0.035, 0.22, 16),
    new MeshStandardMaterial({
      color: "#eef0f4",
      roughness: 0.3,
      metalness: 0.6,
    }),
  )
  const label = new Mesh(
    new CylinderGeometry(0.051, 0.043, 0.1, 16),
    new MeshStandardMaterial({ color, roughness: 0.4 }),
  )
  label.position.y = 0.02
  const cap = new Mesh(
    new CylinderGeometry(0.022, 0.022, 0.05, 12),
    new MeshStandardMaterial({ color: "#222", roughness: 0.4 }),
  )
  cap.position.y = -0.135
  group.add(body, label, cap)
  return group
}

function createPalette() {
  const group = new Group()
  const board = new Mesh(
    new CylinderGeometry(0.2, 0.2, 0.02, 40),
    new MeshStandardMaterial({ color: "#c98f55", roughness: 0.5 }),
  )
  board.scale.z = 0.72
  group.add(board)
  ;["#ff4d6d", "#ffd23f", "#3ec1ff", "#7cdb5a", "#b46bff", "#ffffff"].forEach(
    (c, i) => {
      const a = (i / 6) * Math.PI * 1.4 + 0.6
      const blob = new Mesh(
        new SphereGeometry(0.03, 12, 8),
        new MeshStandardMaterial({
          color: c,
          roughness: 0.25,
          emissive: new Color(c),
          emissiveIntensity: 0.15,
        }),
      )
      blob.scale.y = 0.4
      blob.position.set(Math.cos(a) * 0.13, 0.015, Math.sin(a) * 0.09)
      group.add(blob)
    },
  )
  return group
}

export type FloatingProp = {
  object: Group | Mesh
  radius: number
  height: number
  angle: number
  speed: number
  spin: Vector3
  bob: number
}

export function createFloatingProps() {
  const group = new Group()
  const props: FloatingProp[] = []
  const add = (
    object: Group | Mesh,
    radius: number,
    height: number,
    angle: number,
    scale = 1,
  ) => {
    object.scale.multiplyScalar(scale)
    group.add(object)
    props.push({
      object,
      radius,
      height,
      angle,
      speed: 0.12 + Math.random() * 0.1,
      spin: new Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).multiplyScalar(1.2),
      bob: Math.random() * 6,
    })
  }
  ;[
    ["#4fa8ff", 0.4],
    ["#ff6fa8", 2.2],
    ["#ffd23f", 4.1],
  ].forEach(([c, a]) =>
    add(createBrush(new Color(c as string)).group, 1.9, 1.15, a as number, 1.6),
  )
  ;[
    ["#ff4d6d", 1.2],
    ["#3ec1ff", 3.3],
    ["#7cdb5a", 5.3],
  ].forEach(([c, a]) => add(createTube(c as string), 2.1, 0.55, a as number))
  add(createPalette(), 2.0, 1.55, 2.9, 1.3)
  add(createPalette(), 2.2, 0.35, 5.9, 1.1)
  return { group, props }
}

/** 絵を描くキャンバス（額縁つき）。uProgress で絵の具が広がる */
export function createEasel() {
  const group = new Group()
  const material = new ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uColor: { value: new Color() },
      uRainbow: { value: 0 },
      uTime: { value: 0 },
      uFlash: { value: 0 },
    },
    vertexShader:
      /* glsl */ "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: /* glsl */ `
      uniform float uProgress;uniform vec3 uColor;uniform float uRainbow;uniform float uTime;uniform float uFlash;varying vec2 vUv;${NOISE}
      void main(){
        vec2 p=(vUv-0.5)*vec2(1.45,1.0);
        float paper=0.9+0.06*fbm(vec3(vUv*40.0,1.0));
        vec3 col=vec3(0.96,0.93,0.86)*paper*0.85;
        float r=length(p);
        float ang=atan(p.y,p.x);
        float edge=uProgress*0.75+0.12*fbm(vec3(cos(ang)*2.0,sin(ang)*2.0,uTime*0.4))*uProgress;
        float drip=smoothstep(0.02,0.0,abs(fract(vUv.x*7.0+0.13)-0.5)-0.12)*step(p.y,0.0)*uProgress*0.35*fbm(vec3(vUv.x*20.0,0.0,0.0));
        float paint=smoothstep(edge+0.01,edge-0.02,r)+smoothstep(0.0,1.0,drip*4.0)*step(r,edge+0.4);
        paint=clamp(paint,0.0,1.0);
        vec3 pc=mix(uColor,hue(ang/6.2831+r*1.5-uTime*0.3),uRainbow);
        float swirl=0.75+0.25*sin(r*30.0-uTime*3.0+fbm(vec3(p*6.0,uTime*0.2))*6.0);
        vec3 lit=pc*swirl*(0.85+1.1*smoothstep(edge-0.08,edge,r)*step(r,edge));
        col=mix(col,lit*1.05,paint);
        col+=vec3(uFlash);
        gl_FragColor=vec4(col,1.0);
      }`,
  })
  const canvas = new Mesh(new PlaneGeometry(1.16, 0.8), material)
  const frameMaterial = new MeshStandardMaterial({
    color: "#e9bd42",
    metalness: 1,
    roughness: 0.28,
    emissive: new Color("#7a4a00"),
    emissiveIntensity: 0.2,
  })
  const bar = (w: number, h: number, x: number, y: number) => {
    const mesh = new Mesh(
      new CylinderGeometry(0.03, 0.03, w, 12),
      frameMaterial,
    )
    mesh.rotation.z = h === 0 ? Math.PI / 2 : 0
    mesh.position.set(x, y, 0.01)
    return mesh
  }
  group.add(
    canvas,
    bar(1.24, 0, 0, 0.42),
    bar(1.24, 0, 0, -0.42),
    bar(0.88, 1, 0.6, 0),
    bar(0.88, 1, -0.6, 0),
  )
  ;[
    [-0.6, 0.42],
    [0.6, 0.42],
    [-0.6, -0.42],
    [0.6, -0.42],
  ].forEach(([x, y]) => {
    const knob = new Mesh(new IcosahedronGeometry(0.05, 1), frameMaterial)
    knob.position.set(x, y, 0.01)
    group.add(knob)
  })
  return { group, material }
}

/** 光の柱（上へ流れる光） */
export function createPillar(radius: number, height: number) {
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    // 明るい空の上で白く飛ばないよう色を塗り、奥の壁だけ描いて人物にかぶせない
    blending: NormalBlending,
    side: BackSide,
    uniforms: {
      uColor: { value: new Color() },
      uIntensity: { value: 0 },
      uTime: { value: 0 },
      uRainbow: { value: 0 },
    },
    vertexShader:
      /* glsl */ "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;uniform float uIntensity;uniform float uTime;uniform float uRainbow;varying vec2 vUv;${NOISE}
      void main(){
        float flow=fbm(vec3(vUv.x*8.0,vUv.y*3.0-uTime*1.6,uTime*0.2));
        float a=(1.0-vUv.y)*(0.4+0.8*flow)*smoothstep(0.0,0.08,vUv.y);
        vec3 col=mix(uColor,hue(vUv.y*0.8-uTime*0.3+vUv.x),uRainbow);
        gl_FragColor=vec4(col*1.15,min(1.0,a*uIntensity*1.4));
      }`,
  })
  const mesh = new Mesh(
    new CylinderGeometry(radius, radius * 1.15, height, 48, 1, true),
    material,
  )
  mesh.position.y = height / 2
  return { mesh, material }
}

/** 衝撃波の輪 */
export function createShockwave() {
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: { uColor: { value: new Color() }, uIntensity: { value: 0 } },
    vertexShader:
      /* glsl */ "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:
      /* glsl */ "uniform vec3 uColor;uniform float uIntensity;varying vec2 vUv;void main(){float a=sin(vUv.x*3.14159);gl_FragColor=vec4(uColor*a*uIntensity,a);}",
  })
  const geometry = new RingGeometry(0.85, 1, 96, 1)
  // RingGeometry の uv は平面なので、輪の内外方向に 0〜1 を振り直す
  const pos = geometry.attributes.position as BufferAttribute
  const uv = geometry.attributes.uv as BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i))
    uv.setXY(i, (r - 0.85) / 0.15, 0)
  }
  return { mesh: new Mesh(geometry, material), material }
}

/** 光の玉（いつもカメラを向く板） */
export function createOrb() {
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uColor: { value: new Color() },
      uIntensity: { value: 0 },
      uTime: { value: 0 },
      uRainbow: { value: 0 },
    },
    vertexShader:
      /* glsl */ "varying vec2 vUv;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(0.0,0.0,0.0,1.0);mv.xy+=position.xy*vec2(length(modelMatrix[0].xyz));gl_Position=projectionMatrix*mv;}",
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;uniform float uIntensity;uniform float uTime;uniform float uRainbow;varying vec2 vUv;
      vec3 hue(float h){return clamp(abs(mod(h*6.0+vec3(0,4,2),6.0)-3.0)-1.0,0.0,1.0);}
      void main(){
        vec2 p=vUv-0.5;float r=length(p)*2.0;float ang=atan(p.y,p.x);
        float core=exp(-r*r*18.0);
        float halo=exp(-r*3.2)*(0.7+0.3*sin(ang*8.0+uTime*6.0));
        float rays=pow(max(0.0,cos(ang*4.0+uTime*1.5)),24.0)*exp(-r*1.6);
        vec3 col=mix(uColor,hue(ang/6.2831+uTime*0.5),uRainbow);
        vec3 c=vec3(1.0)*core*3.0+col*(halo*1.6+rays*2.0);
        float a=clamp(core+halo+rays,0.0,1.0);
        gl_FragColor=vec4(c*uIntensity,a*uIntensity);
      }`,
  })
  return { mesh: new Mesh(new PlaneGeometry(1, 1), material), material }
}

/**
 * 光の粒（CPU で動かす）。漂う粒と、はじける粒・集まる粒を 1 つの Points で描く
 */
export class Sparks {
  readonly points: Points
  private readonly count: number
  private readonly position: Float32Array
  private readonly color: Float32Array
  private readonly size: Float32Array
  private readonly velocity: Float32Array
  private readonly life: Float32Array
  private readonly maxLife: Float32Array
  private readonly target: (Vector3 | null)[]
  private readonly base: Float32Array
  private cursor = 0

  constructor(count: number) {
    this.count = count
    this.position = new Float32Array(count * 3)
    this.color = new Float32Array(count * 3)
    this.size = new Float32Array(count)
    this.velocity = new Float32Array(count * 3)
    this.life = new Float32Array(count)
    this.maxLife = new Float32Array(count)
    this.base = new Float32Array(count * 3)
    this.target = Array.from({ length: count }, () => null)
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", new BufferAttribute(this.position, 3))
    geometry.setAttribute("color", new BufferAttribute(this.color, 3))
    geometry.setAttribute("size", new BufferAttribute(this.size, 1))
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uScale: { value: 300 } },
      vertexShader: /* glsl */ `attribute float size;attribute vec3 color;varying vec3 vColor;uniform float uScale;
        void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=size*uScale/-mv.z;gl_Position=projectionMatrix*mv;}`,
      fragmentShader: /* glsl */ `varying vec3 vColor;void main(){vec2 p=gl_PointCoord-0.5;float r=length(p)*2.0;float a=exp(-r*r*5.0);
        float star=pow(max(0.0,1.0-abs(p.x*p.y)*60.0),3.0)*(1.0-r);gl_FragColor=vec4(vColor*(a+star*0.8),a);}`,
    })
    this.points = new Points(geometry, material)
    this.points.frustumCulled = false
  }

  /** はじける粒 */
  burst(
    origin: Vector3,
    color: Color | (() => Color),
    n: number,
    speed: number,
    { life = 1.4, size = 0.05, up = 0.4, spread = 1 } = {},
  ) {
    for (let k = 0; k < n; k++) {
      const i = this.next()
      const dir = new Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      )
        .normalize()
        .multiplyScalar(spread)
      const s = speed * (0.35 + Math.random() * 0.9)
      this.position.set([origin.x, origin.y, origin.z], i * 3)
      this.velocity.set([dir.x * s, dir.y * s + up, dir.z * s], i * 3)
      const c = typeof color === "function" ? color() : color
      this.base.set([c.r, c.g, c.b], i * 3)
      this.size[i] = size * (0.5 + Math.random())
      this.life[i] = life * (0.6 + Math.random() * 0.6)
      this.maxLife[i] = this.life[i]
      this.target[i] = null
    }
  }

  /** 周りから target へ集まる粒 */
  gather(target: Vector3, color: Color, n: number, radius: number) {
    for (let k = 0; k < n; k++) {
      const i = this.next()
      const dir = new Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      )
        .normalize()
        .multiplyScalar(radius * (0.6 + Math.random() * 0.6))
      this.position.set(
        [target.x + dir.x, target.y + dir.y, target.z + dir.z],
        i * 3,
      )
      this.velocity.set([-dir.z * 1.5, 0, dir.x * 1.5], i * 3)
      this.base.set([color.r, color.g, color.b], i * 3)
      this.size[i] = 0.04 * (0.5 + Math.random())
      this.life[i] = 0.9 + Math.random() * 0.4
      this.maxLife[i] = this.life[i]
      this.target[i] = target
    }
  }

  /** 漂う粒（ずっと出しておく） */
  drift(center: Vector3, color: Color, n: number) {
    for (let k = 0; k < n; k++) {
      const i = this.next()
      const a = Math.random() * Math.PI * 2
      const r = 0.6 + Math.random() * 2.6
      this.position.set(
        [
          center.x + Math.cos(a) * r,
          center.y + Math.random() * 0.4 - 0.2,
          center.z + Math.sin(a) * r,
        ],
        i * 3,
      )
      this.velocity.set([0, 0.08 + Math.random() * 0.18, 0], i * 3)
      this.base.set([color.r, color.g, color.b], i * 3)
      this.size[i] = 0.025 + Math.random() * 0.03
      this.life[i] = 3 + Math.random() * 3
      this.maxLife[i] = this.life[i]
      this.target[i] = null
    }
  }

  update(dt: number) {
    for (let i = 0; i < this.count; i++) {
      if (this.life[i] <= 0) {
        this.size[i] = 0
        continue
      }
      this.life[i] -= dt
      const k = Math.max(0, this.life[i] / this.maxLife[i])
      const target = this.target[i]
      if (target) {
        const p = 1 - k
        for (let j = 0; j < 3; j++) {
          const to = j === 0 ? target.x : j === 1 ? target.y : target.z
          this.position[i * 3 + j] +=
            (to - this.position[i * 3 + j]) * Math.min(1, dt * (2 + p * 10)) +
            this.velocity[i * 3 + j] * dt * (1 - p)
        }
      } else {
        this.velocity[i * 3 + 1] -= dt * 0.35
        for (let j = 0; j < 3; j++) {
          this.velocity[i * 3 + j] *= 1 - dt * 0.9
          this.position[i * 3 + j] += this.velocity[i * 3 + j] * dt
        }
      }
      const fade = Math.sin(Math.PI * Math.min(1, (1 - k) * 4)) * 0.3 + k * 0.7
      const glow = 2.4 * fade
      this.color[i * 3] = this.base[i * 3] * glow
      this.color[i * 3 + 1] = this.base[i * 3 + 1] * glow
      this.color[i * 3 + 2] = this.base[i * 3 + 2] * glow
    }
    this.points.geometry.attributes.position.needsUpdate = true
    this.points.geometry.attributes.color.needsUpdate = true
    this.points.geometry.attributes.size.needsUpdate = true
  }

  private next() {
    const i = this.cursor
    this.cursor = (this.cursor + 1) % this.count
    return i
  }
}

/* ------------------------------------------------------------------ */
/* カード                                                               */
/* ------------------------------------------------------------------ */

const CARD_STYLE: Record<
  GachaRarity,
  { from: string; to: string; edge: string; label: string }
> = {
  N: { from: "#5b6170", to: "#2c303a", edge: "#a7adb8", label: "#c9ced8" },
  R: { from: "#2f6fd6", to: "#13306b", edge: "#8fc1ff", label: "#d6e8ff" },
  SR: { from: "#8a4fe0", to: "#341463", edge: "#d8b4ff", label: "#f1e4ff" },
  SSR: { from: "#ffb52e", to: "#7a3d06", edge: "#ffe7a0", label: "#fff6d6" },
  UR: { from: "#ff6fa8", to: "#3b1a8a", edge: "#ffffff", label: "#ffffff" },
}

const CARD_W = 512
const CARD_H = 720

const roundRect = (
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

const rainbowGradient = (
  g: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) => {
  const grad = g.createLinearGradient(x0, y0, x1, y1)
  ;[
    "#ff5e7e",
    "#ffb347",
    "#ffe66b",
    "#6ff0a8",
    "#5ec8ff",
    "#8a7bff",
    "#ff8fe0",
  ].forEach((c, i, all) => grad.addColorStop(i / (all.length - 1), c))
  return grad
}

/** カードの裏（予告の色）。FGO のカードの裏の色のように、めくる前に期待できる */
export function drawCardBack(rarity: GachaRarity) {
  const canvas = document.createElement("canvas")
  canvas.width = CARD_W
  canvas.height = CARD_H
  const g = canvas.getContext("2d") as CanvasRenderingContext2D
  const style =
    rarity === "UR" || rarity === "SSR"
      ? CARD_STYLE.SSR
      : rarity === "SR"
        ? CARD_STYLE.SR
        : CARD_STYLE.R
  roundRect(g, 0, 0, CARD_W, CARD_H, 40)
  g.save()
  g.clip()
  const bg = g.createLinearGradient(0, 0, 0, CARD_H)
  bg.addColorStop(0, style.from)
  bg.addColorStop(1, style.to)
  g.fillStyle = bg
  g.fillRect(0, 0, CARD_W, CARD_H)
  g.globalAlpha = 0.18
  for (let i = -CARD_H; i < CARD_W + CARD_H; i += 36) {
    g.fillStyle = "#fff"
    g.beginPath()
    g.moveTo(i, 0)
    g.lineTo(i + 14, 0)
    g.lineTo(i + 14 - CARD_H, CARD_H)
    g.lineTo(i - CARD_H, CARD_H)
    g.fill()
  }
  g.globalAlpha = 1
  g.restore()
  g.lineWidth = 14
  g.strokeStyle = style.edge
  roundRect(g, 10, 10, CARD_W - 20, CARD_H - 20, 34)
  g.stroke()
  // 真ん中の紋章（パレットと筆）
  g.translate(CARD_W / 2, CARD_H / 2)
  g.strokeStyle = style.edge
  g.lineWidth = 8
  g.beginPath()
  g.arc(0, 0, 120, 0, Math.PI * 2)
  g.stroke()
  g.lineWidth = 3
  g.beginPath()
  g.arc(0, 0, 100, 0, Math.PI * 2)
  g.stroke()
  g.fillStyle = style.edge
  g.font = '900 120px "Hiragino Sans", "Noto Sans JP", sans-serif'
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.fillText("✦", 0, 4)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** カードの表（景品の絵・名前・レア度） */
export function drawCardFront(item: GachaItem, image: HTMLImageElement | null) {
  const canvas = document.createElement("canvas")
  canvas.width = CARD_W
  canvas.height = CARD_H
  const g = canvas.getContext("2d") as CanvasRenderingContext2D
  const style = CARD_STYLE[item.rarity]
  roundRect(g, 0, 0, CARD_W, CARD_H, 40)
  g.save()
  g.clip()
  const bg = g.createRadialGradient(
    CARD_W / 2,
    CARD_H * 0.4,
    40,
    CARD_W / 2,
    CARD_H * 0.45,
    CARD_H * 0.75,
  )
  bg.addColorStop(0, style.from)
  bg.addColorStop(1, style.to)
  g.fillStyle = bg
  g.fillRect(0, 0, CARD_W, CARD_H)
  if (item.rarity === "UR") {
    g.globalAlpha = 0.35
    g.fillStyle = rainbowGradient(g, 0, 0, CARD_W, CARD_H)
    g.fillRect(0, 0, CARD_W, CARD_H)
    g.globalAlpha = 1
  }
  // 光の筋
  g.globalAlpha = item.rarity === "N" ? 0.08 : 0.16
  g.translate(CARD_W / 2, CARD_H * 0.42)
  for (let i = 0; i < 16; i++) {
    g.rotate(Math.PI / 8)
    g.fillStyle = "#fff"
    g.beginPath()
    g.moveTo(0, 0)
    g.lineTo(-30, -CARD_H)
    g.lineTo(30, -CARD_H)
    g.fill()
  }
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.globalAlpha = 1
  if (image) {
    const s = CARD_W * 0.86
    g.drawImage(image, (CARD_W - s) / 2, CARD_H * 0.42 - s / 2, s, s)
  }
  // 下の帯
  const band = g.createLinearGradient(0, CARD_H - 190, 0, CARD_H)
  band.addColorStop(0, "rgba(0,0,0,0)")
  band.addColorStop(0.35, "rgba(0,0,0,.55)")
  band.addColorStop(1, "rgba(0,0,0,.8)")
  g.fillStyle = band
  g.fillRect(0, CARD_H - 190, CARD_W, 190)
  g.restore()
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.font = '800 40px "Hiragino Sans", "Noto Sans JP", sans-serif'
  g.fillStyle = "#fff"
  g.shadowColor = "rgba(0,0,0,.6)"
  g.shadowBlur = 8
  const name = item.name.length > 11 ? `${item.name.slice(0, 10)}…` : item.name
  g.fillText(name, CARD_W / 2, CARD_H - 78)
  if (item.note) {
    g.font = '600 26px "Hiragino Sans", "Noto Sans JP", sans-serif'
    g.fillStyle = "#cfe9d6"
    g.fillText(item.note, CARD_W / 2, CARD_H - 36)
  }
  g.shadowBlur = 0
  // レア度
  g.font = '900 italic 76px "Avenir Next", "Hiragino Sans", sans-serif'
  g.lineWidth = 10
  g.strokeStyle = "rgba(0,0,0,.55)"
  g.strokeText(item.rarity, 40 + g.measureText(item.rarity).width / 2, 66)
  g.fillStyle =
    item.rarity === "UR" ? rainbowGradient(g, 30, 30, 230, 100) : style.label
  g.fillText(item.rarity, 40 + g.measureText(item.rarity).width / 2, 66)
  if (item.isNew) {
    g.save()
    g.translate(CARD_W - 78, 60)
    g.rotate(0.18)
    g.fillStyle = "#ff3d6e"
    roundRect(g, -62, -26, 124, 52, 26)
    g.fill()
    g.fillStyle = "#fff"
    g.font = '900 32px "Avenir Next", sans-serif'
    g.fillText("NEW", 0, 2)
    g.restore()
  }
  // 縁
  g.lineWidth = 14
  g.strokeStyle =
    item.rarity === "UR" ? rainbowGradient(g, 0, 0, CARD_W, CARD_H) : style.edge
  roundRect(g, 7, 7, CARD_W - 14, CARD_H - 14, 36)
  g.stroke()
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export const CARD_ASPECT = CARD_W / CARD_H

/** 文字の板（確定カットインの文字など） */
export function drawBanner(text: string, rarity: GachaRarity) {
  const canvas = document.createElement("canvas")
  canvas.width = 2048
  canvas.height = 512
  const g = canvas.getContext("2d") as CanvasRenderingContext2D
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.font = '900 italic 250px "Hiragino Sans", "Noto Sans JP", sans-serif'
  g.lineJoin = "round"
  g.lineWidth = 46
  g.strokeStyle = "#1a0b33"
  g.strokeText(text, 1024, 270)
  g.lineWidth = 18
  g.strokeStyle = "#fff"
  g.strokeText(text, 1024, 270)
  g.fillStyle =
    rarity === "UR"
      ? rainbowGradient(g, 300, 0, 1748, 0)
      : (() => {
          const grad = g.createLinearGradient(0, 130, 0, 400)
          grad.addColorStop(0, "#fff6c8")
          grad.addColorStop(0.5, "#ffc23d")
          grad.addColorStop(1, "#ff7a1a")
          return grad
        })()
  g.fillText(text, 1024, 270)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}
