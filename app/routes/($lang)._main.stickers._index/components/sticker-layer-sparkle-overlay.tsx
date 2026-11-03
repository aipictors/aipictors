import { useMemo } from "react"
import {
  clampNumber,
  hashStringToUint32,
  mulberry32,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-layer-effects"

export function LayerSparkleOverlay(props: { layerId: string; intensity: number }) {
  const intensity = clampNumber(props.intensity, 0, 1)
  const sparkles = useMemo(() => {
    if (intensity <= 0) return []
    const rand = mulberry32(hashStringToUint32(props.layerId))
    const count = Math.round(6 + intensity * 22)
    const items: Array<{
      x: number
      y: number
      size: number
      rot: number
      opacity: number
    }> = []
    for (let i = 0; i < count; i += 1) {
      items.push({
        x: rand() * 100,
        y: rand() * 100,
        size: 6 + rand() * 14,
        rot: rand() * 360,
        opacity: 0.2 + rand() * 0.45,
      })
    }
    return items
  }, [props.layerId, intensity])

  if (sparkles.length === 0) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ mixBlendMode: "screen" }}
    >
      {sparkles.map((s, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: stable by seed; index is fine here
          key={i}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
            backgroundColor: `rgba(255,255,255,${s.opacity})`,
            clipPath:
              "polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)",
            filter: "drop-shadow(0 0 6px rgba(255,255,255,0.55))",
          }}
        />
      ))}
    </div>
  )
}
