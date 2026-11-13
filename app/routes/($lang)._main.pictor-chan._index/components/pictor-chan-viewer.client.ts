import {
  type AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Group,
  LoopOnce,
  type Material,
  type Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SkinnedMesh,
  SRGBColorSpace,
  WebGLRenderer,
} from "three"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

/**
 * ぴくたーちゃんのページの 3D 表示。3D モデルが待ちの動きをしていて、
 * ドラッグで回せる・押すと跳ぶ。three.js ごと、画面に入ってから読み込む
 */

export type PictorChanMotion = "idle" | "run" | "jump" | "fall"

export type PictorChanViewer = {
  setMotion: (motion: PictorChanMotion) => void
  dispose: () => void
}

const MOTIONS: PictorChanMotion[] = ["idle", "run", "jump", "fall"]

export async function createPictorChanViewer(
  canvas: HTMLCanvasElement,
  modelUrl: string,
  onMotion: (motion: PictorChanMotion) => void,
): Promise<PictorChanViewer> {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = SRGBColorSpace
  const scene = new Scene()
  const camera = new PerspectiveCamera(26, 1, 0.1, 50)

  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  const gltf = await loader.loadAsync(modelUrl)
  const model = gltf.scene
  // 書き出しに混ざっている目印の球は使わない
  model.getObjectByName("Icosphere")?.removeFromParent()

  let face: SkinnedMesh | null = null
  model.traverse((object) => {
    if (!(object instanceof SkinnedMesh)) return
    object.frustumCulled = false
    // 光を置かずに、絵の色のまま出す（顔は、目や口の絵を重ねて描いている）
    const source = object.material as MeshBasicMaterial
    const isFace = object.morphTargetDictionary !== undefined
    object.material = new MeshBasicMaterial({
      map: source.map,
      transparent: isFace,
      depthWrite: !isFace,
    })
    source.dispose()
    if (isFace) {
      face = object
      object.renderOrder = 1
    }
  })
  const setExpression = (name: string, on: boolean) => {
    const target = face as SkinnedMesh | null
    const index = target?.morphTargetDictionary?.[name]
    if (target?.morphTargetInfluences && index !== undefined) {
      target.morphTargetInfluences[index] = on ? 1 : 0
    }
  }

  const mixer = new AnimationMixer(model)
  const actions = {} as Record<PictorChanMotion, AnimationAction>
  for (const name of MOTIONS) {
    const clip = AnimationClip.findByName(gltf.animations, name)
    if (!clip) throw new Error(`animation not found: ${name}`)
    actions[name] = mixer.clipAction(clip)
  }
  for (const name of ["jump", "fall"] as const) {
    actions[name].setLoop(LoopOnce, 1)
    actions[name].clampWhenFinished = true
  }

  // 立ち姿で大きさを測って、身長 1・足元 0・正面が手前にそろえる
  actions.idle.play()
  mixer.update(0)
  model.updateMatrixWorld(true)
  const bounds = new Box3().setFromObject(model, true)
  const scale = 1 / (bounds.max.y - bounds.min.y)
  const fit = new Group()
  fit.rotation.y = -Math.PI / 2
  fit.scale.setScalar(scale)
  fit.position.y = -bounds.min.y * scale
  fit.add(model)
  const turn = new Group()
  turn.add(fit)
  scene.add(turn)

  let current: PictorChanMotion = "idle"
  /** 1 回きりの動き（跳ぶ・転ぶ）が終わったら、待ちに戻すまでの時間 */
  let backToIdle = 0
  const setMotion = (motion: PictorChanMotion) => {
    if (motion === current && motion !== "jump" && motion !== "fall") return
    const next = actions[motion]
    next.reset()
    if (motion !== current) next.crossFadeFrom(actions[current], 0.18, false)
    next.play()
    current = motion
    backToIdle = motion === "jump" ? 0.95 : motion === "fall" ? 2.2 : 0
    setExpression("Joy", motion === "jump")
    setExpression("Fun", motion === "fall")
    onMotion(motion)
  }

  // ドラッグで回す。ほとんど動かさずに離したら「押した」とみなして跳ぶ
  let yaw = 0.35
  let targetYaw = 0.35
  let dragging = false
  let lastX = 0
  let moved = 0
  let untilSway = 0
  const onPointerDown = (event: PointerEvent) => {
    dragging = true
    lastX = event.clientX
    moved = 0
    canvas.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return
    const dx = event.clientX - lastX
    lastX = event.clientX
    moved += Math.abs(dx)
    targetYaw += dx * 0.012
    untilSway = 4
  }
  const onPointerUp = () => {
    if (!dragging) return
    dragging = false
    if (moved < 6) setMotion("jump")
  }
  canvas.addEventListener("pointerdown", onPointerDown)
  canvas.addEventListener("pointermove", onPointerMove)
  canvas.addEventListener("pointerup", onPointerUp)
  canvas.addEventListener("pointercancel", onPointerUp)

  const resize = () => {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // 全身が入るように、細い画面ほど引く
    const distance = Math.max(2.3, 1.15 / camera.aspect + 1.0)
    camera.position.set(0, 0.62, distance)
    camera.lookAt(0, 0.52, 0)
    camera.updateProjectionMatrix()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  // 画面の外にあるときは描かない
  let isVisible = true
  const visibility = new IntersectionObserver((entries) => {
    isVisible = entries.some((entry) => entry.isIntersecting)
  })
  visibility.observe(canvas)

  let disposed = false
  let frame = 0
  let last = performance.now()
  let time = 0
  let untilBlink = 2
  const loop = (now: number) => {
    if (disposed) return
    frame = requestAnimationFrame(loop)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!isVisible || document.hidden) return
    time += dt
    if (backToIdle > 0) {
      backToIdle -= dt
      if (backToIdle <= 0) setMotion("idle")
    }
    // しばらくさわっていなければ、ゆっくり左右を向く
    untilSway -= dt
    if (!dragging && untilSway <= 0) {
      targetYaw += (0.35 + Math.sin(time * 0.5) * 0.45 - targetYaw) * dt * 1.2
    }
    yaw += (targetYaw - yaw) * Math.min(1, dt * 9)
    turn.rotation.y = yaw
    turn.position.y = current === "idle" ? Math.sin(time * 1.6) * 0.008 : 0
    untilBlink -= dt
    if (untilBlink < -0.12) untilBlink = 1.8 + Math.random() * 3.2
    setExpression(
      "Blink",
      current !== "jump" && current !== "fall" && untilBlink < 0,
    )
    mixer.update(dt)
    renderer.render(scene, camera)
  }
  frame = requestAnimationFrame(loop)

  return {
    setMotion,
    dispose: () => {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("pointercancel", onPointerUp)
      model.traverse((object) => {
        const mesh = object as Mesh
        if (!mesh.isMesh) return
        mesh.geometry.dispose()
        const material = mesh.material as Material & {
          map?: { dispose: () => void } | null
        }
        material.map?.dispose()
        material.dispose()
      })
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
