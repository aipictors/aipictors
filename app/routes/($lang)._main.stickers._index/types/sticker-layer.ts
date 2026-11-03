export type LayerType = "image" | "text"

export type LayerSparkleEffect = {
  enabled?: boolean
  intensity?: number
}

export type LayerEffects = {
  blur?: number
  invert?: boolean
  sparkle?: LayerSparkleEffect
}

export type LayerBase = {
  id: string
  type: LayerType
  name: string
  visible: boolean
  locked: boolean
  effects?: LayerEffects
  x: number
  y: number
  scale: number
  rotate: number
  width: number
  height: number
  flipX?: boolean
  flipY?: boolean
  scaleX?: number
  scaleY?: number
  // degrees
  skewX?: number
  skewY?: number
}

export type ImageLayer = LayerBase & {
  type: "image"
  src: string
  removeColorBackground?: boolean
  colorKey?: string
  colorThreshold?: number
  transparentSrc?: string
}

export type TextLayer = LayerBase & {
  type: "text"
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: number
  color: string
  strokeColor: string
  strokeWidth: number
  vertical: boolean
}

export type Layer = ImageLayer | TextLayer

export type DragMode = "move" | "scale" | "rotate"

export type PanelDragMode = "left" | "right"

export type PanelDragState = {
  mode: PanelDragMode
  startX: number
  startLeftWidth: number
  startRightWidth: number
}

export type DragState = {
  baseLayers: Layer[]
  layerId: string
  mode: DragMode
  startX: number
  startY: number
  startScale: number
  startRotate: number
  startLayerX: number
  startLayerY: number
  startDistance: number
  startAngle: number
}

export type HistoryState = {
  past: Layer[][]
  present: Layer[]
  future: Layer[][]
}

export type FontFamilyOption = {
  label: string
  value: string
  weights: number[]
}
